import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ads, clicks, campaigns, countryRates, wallets, transactions, notifications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { checkForFraud, logFraudFlag } from '@/lib/fraud-detection';
import { parseUserAgent } from '@/lib/utils';
import { awardReferralCommissions } from '@/lib/referrals';

// Simple IP to country mapping (in production, use a proper geo-IP service)
function getCountryFromIP(ip: string): { code: string; name: string } {
  // Default to US for demo, in production use MaxMind or similar
  return { code: 'US', name: 'United States' };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get('ad_id');
    const pubId = searchParams.get('pub_id');

    if (!adId || !pubId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get ad and campaign
    const ad = await db.query.ads.findFirst({
      where: eq(ads.id, adId),
      with: {
        campaign: true,
      },
    });

    if (!ad || !ad.campaign) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (ad.campaign.status !== 'active') {
      return NextResponse.redirect(ad.campaign.landingPageUrl);
    }

    // Get request details
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    const { code: countryCode, name: countryName } = getCountryFromIP(ip);

    // Run fraud detection
    const fraudCheck = await checkForFraud(ip, userAgent, pubId, adId);

    // Get country rate
    const rate = await db.query.countryRates.findFirst({
      where: eq(countryRates.countryCode, countryCode),
    });

    const cpc = rate?.defaultCpc ? parseFloat(rate.defaultCpc) : 0.05;
    const publisherSharePercent = rate?.publisherShare ? parseFloat(rate.publisherShare) : 80;
    const publisherEarning = (cpc * publisherSharePercent) / 100;
    const platformEarning = cpc - publisherEarning;

    // Create click record
    const [click] = await db.insert(clicks).values({
      adId,
      publisherId: pubId,
      campaignId: ad.campaign.id,
      ipAddress: ip,
      country: countryName,
      countryCode,
      device,
      browser,
      os,
      userAgent,
      referer,
      status: fraudCheck.isFraud ? 'fraud' : 'valid',
      cpc: cpc.toString(),
      publisherEarning: fraudCheck.isFraud ? '0' : publisherEarning.toFixed(4),
      platformEarning: fraudCheck.isFraud ? '0' : platformEarning.toFixed(4),
      fraudReason: fraudCheck.isFraud ? fraudCheck.reasons.join('; ') : null,
    }).returning();

    // If fraud detected, log it
    if (fraudCheck.isFraud) {
      await logFraudFlag(
        click.id,
        pubId,
        ip,
        fraudCheck.reasons,
        fraudCheck.severity,
        { userAgent, referer, adId }
      );

      // Still redirect, just don't credit
      return NextResponse.redirect(ad.campaign.landingPageUrl);
    }

    // Update ad click count
    await db.update(ads)
      .set({ clicks: sql`${ads.clicks} + 1` })
      .where(eq(ads.id, adId));

    // Update campaign spent budget
    await db.update(campaigns)
      .set({
        spentBudget: sql`${campaigns.spentBudget} + ${cpc}`,
        todaySpent: sql`${campaigns.todaySpent} + ${cpc}`,
      })
      .where(eq(campaigns.id, ad.campaign.id));

    // Check if budget is exhausted
    const updatedCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, ad.campaign.id),
    });

    if (updatedCampaign) {
      const spentBudget = parseFloat(updatedCampaign.spentBudget || '0');
      const totalBudget = parseFloat(updatedCampaign.totalBudget);
      const todaySpent = parseFloat(updatedCampaign.todaySpent || '0');
      const dailyBudget = parseFloat(updatedCampaign.dailyBudget);

      if (spentBudget >= totalBudget || todaySpent >= dailyBudget) {
        await db.update(campaigns)
          .set({ status: 'budget_finished' })
          .where(eq(campaigns.id, ad.campaign.id));

        // Notify advertiser
        await db.insert(notifications).values({
          userId: ad.campaign.advertiserId,
          type: 'budget_low',
          title: 'Campaign Budget Exhausted',
          message: `Your campaign "${ad.campaign.title}" has run out of budget.`,
          metadata: { campaignId: ad.campaign.id },
        });
      }
    }

    // Deduct from advertiser wallet
    const advertiserWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, ad.campaign.advertiserId),
    });

    if (advertiserWallet) {
      const newBalance = parseFloat(advertiserWallet.balance) - cpc;
      await db.update(wallets)
        .set({
          balance: newBalance.toFixed(2),
          totalSpent: sql`${wallets.totalSpent} + ${cpc}`,
        })
        .where(eq(wallets.id, advertiserWallet.id));

      await db.insert(transactions).values({
        walletId: advertiserWallet.id,
        userId: ad.campaign.advertiserId,
        type: 'click_spend',
        amount: (-cpc).toFixed(2),
        balanceBefore: advertiserWallet.balance,
        balanceAfter: newBalance.toFixed(2),
        status: 'completed',
        description: `Click on ad: ${ad.title}`,
        referenceId: click.id,
        referenceType: 'click',
      });
    }

    // Credit publisher wallet
    const publisherWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, pubId),
    });

    if (publisherWallet) {
      const newBalance = parseFloat(publisherWallet.balance) + publisherEarning;
      await db.update(wallets)
        .set({
          balance: newBalance.toFixed(2),
          totalEarnings: sql`${wallets.totalEarnings} + ${publisherEarning}`,
        })
        .where(eq(wallets.id, publisherWallet.id));

      await db.insert(transactions).values({
        walletId: publisherWallet.id,
        userId: pubId,
        type: 'click_earning',
        amount: publisherEarning.toFixed(2),
        balanceBefore: publisherWallet.balance,
        balanceAfter: newBalance.toFixed(2),
        status: 'completed',
        description: `Earning from click on: ${ad.title}`,
        referenceId: click.id,
        referenceType: 'click',
      });

      await awardReferralCommissions({
        sourceUserId: pubId,
        sourceType: 'click',
        sourceEarning: publisherEarning,
        referenceId: click.id,
      });
    }

    // Redirect to landing page with click_id for conversion tracking
    const redirectUrl = new URL(ad.campaign.landingPageUrl);
    redirectUrl.searchParams.set('click_id', click.id);
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Click tracking failed' },
      { status: 500 }
    );
  }
}
