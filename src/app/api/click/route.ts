import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, Ad, Click, Campaign, CountryRate, Wallet, Transaction, Notification } from '@/db/mongo';
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
    await connectToMongo();
    const ad = await Ad.findById(adId).lean();
    if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    const campaign = await Campaign.findById(ad.campaignId).lean();
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    if (campaign.status !== 'active') return NextResponse.redirect(String(campaign.landingPageUrl));

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
    const rate = await CountryRate.findOne({ countryCode: countryCode }).lean();

    const cpc = rate?.defaultCpc ? Number(rate.defaultCpc) : 0.05;
    const publisherSharePercent = rate?.publisherShare ? Number(rate.publisherShare) : 80;
    const publisherEarning = (cpc * publisherSharePercent) / 100;
    const platformEarning = cpc - publisherEarning;

    // Create click record
    const click = await Click.create({
      adId: ad._id,
      publisherId: pubId,
      campaignId: campaign._id,
      ipAddress: ip,
      country: countryName,
      countryCode,
      device,
      browser,
      os,
      userAgent,
      referer,
      status: fraudCheck.isFraud ? 'fraud' : 'valid',
      cpc,
      publisherEarning: fraudCheck.isFraud ? 0 : publisherEarning,
      platformEarning: fraudCheck.isFraud ? 0 : platformEarning,
      fraudReason: fraudCheck.isFraud ? fraudCheck.reasons.join('; ') : null,
    });

    // If fraud detected, log it
    if (fraudCheck.isFraud) {
      await logFraudFlag(String(click._id), pubId, ip, fraudCheck.reasons, fraudCheck.severity, { userAgent, referer, adId });

      // Still redirect, just don't credit
      return NextResponse.redirect(String(campaign.landingPageUrl));
    }

    // Update ad click count
    await Ad.updateOne({ _id: ad._id }, { $inc: { clicks: 1 } });

    // Update campaign spent budget
    await Campaign.updateOne({ _id: campaign._id }, { $inc: { spentBudget: cpc, todaySpent: cpc } });

    // Check if budget is exhausted
    const updatedCampaign = await Campaign.findById(campaign._id).lean();

    if (updatedCampaign) {
      const spentBudget = Number(updatedCampaign.spentBudget || 0);
      const totalBudget = Number(updatedCampaign.totalBudget || 0);
      const todaySpent = Number(updatedCampaign.todaySpent || 0);
      const dailyBudget = Number(updatedCampaign.dailyBudget || 0);

      if (spentBudget >= totalBudget || todaySpent >= dailyBudget) {
        await Campaign.updateOne({ _id: campaign._id }, { $set: { status: 'budget_finished' } });

        // Notify advertiser
        await Notification.create({ userId: campaign.advertiserId, type: 'budget_low', title: 'Campaign Budget Exhausted', message: `Your campaign "${campaign.title}" has run out of budget.`, metadata: { campaignId: campaign._id } });
      }
    }

    // Deduct from advertiser wallet
    const advertiserWallet = await Wallet.findOne({ userId: campaign.advertiserId });

    if (advertiserWallet) {
      const newBalance = Number(advertiserWallet.balance || 0) - cpc;
      await Wallet.updateOne({ _id: advertiserWallet._id }, { $set: { balance: newBalance, totalSpent: (advertiserWallet.totalSpent || 0) + cpc, updatedAt: new Date() } });

      await Transaction.create({ walletId: advertiserWallet._id, userId: campaign.advertiserId, type: 'click_spend', amount: -cpc, balanceBefore: advertiserWallet.balance, balanceAfter: newBalance, status: 'completed', description: `Click on ad: ${ad.title}`, referenceId: click._id, referenceType: 'click' });
    }

    // Credit publisher wallet
    const publisherWallet = await Wallet.findOne({ userId: pubId });

    if (publisherWallet) {
      const newBalance = Number(publisherWallet.balance || 0) + publisherEarning;
      await Wallet.updateOne({ _id: publisherWallet._id }, { $set: { balance: newBalance, totalEarnings: (publisherWallet.totalEarnings || 0) + publisherEarning, updatedAt: new Date() } });

      await Transaction.create({ walletId: publisherWallet._id, userId: pubId, type: 'click_earning', amount: publisherEarning, balanceBefore: publisherWallet.balance, balanceAfter: newBalance, status: 'completed', description: `Earning from click on: ${ad.title}`, referenceId: click._id, referenceType: 'click' });

      await awardReferralCommissions({ sourceUserId: pubId, sourceType: 'click', sourceEarning: publisherEarning, referenceId: String(click._id) });
    }

    // Redirect to landing page with click_id for conversion tracking
    const redirectUrl = new URL(String(campaign.landingPageUrl));
    redirectUrl.searchParams.set('click_id', String(click._id));

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Click tracking failed' },
      { status: 500 }
    );
  }
}
