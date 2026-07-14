import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, Click, Conversion, Ad, Campaign, Wallet, Transaction, Notification, Pixel, CountryRate } from '@/db/mongo';
import { awardReferralCommissions } from '@/lib/referrals';
import { ensureCampaignWorkflowSchema } from '@/lib/feature-schema';

const convertSchema = z.object({
  click_id: z.string().uuid(),
  campaign_id: z.string().uuid().optional(),
  pixel_code: z.string().optional(),
  type: z.enum(['lead', 'signup', 'purchase', 'download', 'custom']).optional(),
  value: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureCampaignWorkflowSchema();
    const body = await request.json();
    const validated = convertSchema.parse(body);

    await connectToMongo();

    // Find the click
    const click = await Click.findById(validated.click_id).lean();
    if (!click) return NextResponse.json({ error: 'Invalid click ID' }, { status: 400 });

    const existingConversion = await Conversion.findOne({ clickId: click._id }).lean();
    if (existingConversion) return NextResponse.json({ error: 'Conversion already recorded for this click' }, { status: 400 });

    const ad = await Ad.findById(click.adId).lean();
    const campaign = await Campaign.findById(click.campaignId).lean();

    // Calculate conversion earnings (default 5x CPC)
    const cpc = Number(click.cpc || 0);
    const conversionValue = Number(validated.value ?? cpc * 5);
    const publisherEarning = conversionValue * 0.8;
    const platformEarning = conversionValue * 0.2;

    const conversion = await Conversion.create({
      clickId: click._id,
      adId: click.adId,
      publisherId: click.publisherId,
      campaignId: click.campaignId,
      type: validated.type || 'lead',
      value: conversionValue,
      metadata: validated.metadata || {},
      publisherEarning,
      platformEarning,
    });

    // Update ad conversion count
    if (ad) await Ad.updateOne({ _id: ad._id }, { $inc: { conversions: 1 } });

    // Credit publisher
    const publisherWallet = await Wallet.findOne({ userId: click.publisherId });
    if (publisherWallet) {
      const newBalance = Number(publisherWallet.balance || 0) + publisherEarning;
      await Wallet.updateOne({ _id: publisherWallet._id }, { $set: { balance: newBalance, totalEarnings: (publisherWallet.totalEarnings || 0) + publisherEarning, updatedAt: new Date() } });

      await Transaction.create({ walletId: publisherWallet._id, userId: click.publisherId, type: 'conversion_earning', amount: publisherEarning, balanceBefore: publisherWallet.balance, balanceAfter: newBalance, status: 'completed', description: `Conversion earning: ${validated.type || 'lead'}`, referenceId: conversion._id, referenceType: 'conversion' });

      await awardReferralCommissions({ sourceUserId: String(click.publisherId), sourceType: 'conversion', sourceEarning: publisherEarning, referenceId: String(conversion._id) });
    }

    // Update pixel fire count if provided
    if (validated.campaign_id || validated.pixel_code) {
      const where: any = {};
      if (validated.pixel_code) where.pixelCode = validated.pixel_code;
      else where.campaignId = validated.campaign_id;
      await Pixel.updateOne(where, { $inc: { fires: 1 }, $set: { updatedAt: new Date() } }).exec();
    }

    // Deduct from advertiser wallet
    const advertiserId = campaign?.advertiserId || (ad?.advertiserId);
    if (advertiserId) {
      const advertiserWallet = await Wallet.findOne({ userId: advertiserId });
      if (advertiserWallet) {
        const newBalance = Number(advertiserWallet.balance || 0) - conversionValue;
        await Wallet.updateOne({ _id: advertiserWallet._id }, { $set: { balance: newBalance, totalSpent: (advertiserWallet.totalSpent || 0) + conversionValue, updatedAt: new Date() } });

        await Transaction.create({ walletId: advertiserWallet._id, userId: advertiserId, type: 'conversion_spend', amount: -conversionValue, balanceBefore: advertiserWallet.balance, balanceAfter: newBalance, status: 'completed', description: `Conversion: ${validated.type || 'lead'}`, referenceId: conversion._id, referenceType: 'conversion' });
      }
    }

    // Notify publisher
    await Notification.create({ userId: click.publisherId, type: 'new_conversion', title: 'New Conversion!', message: `You earned $${publisherEarning.toFixed(2)} from a ${validated.type || 'lead'} conversion.`, metadata: { conversionId: conversion._id } });

    return NextResponse.json({ success: true, conversion: { id: String(conversion._id), type: conversion.type, value: conversion.value } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Conversion tracking failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for pixel-based tracking
export async function GET(request: NextRequest) {
  await ensureCampaignWorkflowSchema().catch((error) => console.error('Pixel schema setup error:', error));

  const searchParams = request.nextUrl.searchParams;
  const clickId = searchParams.get('click_id');
  const campaignId = searchParams.get('campaign_id');
  const pixelCode = searchParams.get('pixel_code');

  // Count every pixel fire, even when there is no click_id yet. This gives advertisers
  // a real signal that the landing-page pixel is installed and loading.
  try {
    await connectToMongo();
    if (campaignId || pixelCode) {
      const where: any = {};
      if (pixelCode) where.pixelCode = pixelCode;
      else where.campaignId = campaignId;
      await Pixel.updateOne(where, { $inc: { fires: 1 }, $set: { updatedAt: new Date() } }).exec();
    }
  } catch (error) {
    console.error('Pixel fire count error:', error);
  }

  if (!clickId) {
    return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
      headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  }

  // Process conversion in background
  try {
    await connectToMongo();
    const click = await Click.findById(clickId).lean();
    if (click) {
      const existingConversion = await Conversion.findOne({ clickId: click._id }).lean();
      if (!existingConversion) {
        const cpc = Number(click.cpc || 0);
        const convValue = cpc * 5;
        const publisherEarning = convValue * 0.8;

        const conversion = await Conversion.create({ clickId: click._id, adId: click.adId, publisherId: click.publisherId, campaignId: click.campaignId, type: 'lead', publisherEarning, platformEarning: convValue * 0.2 });

        await awardReferralCommissions({ sourceUserId: String(click.publisherId), sourceType: 'conversion', sourceEarning: publisherEarning, referenceId: String(conversion._id) });
      }
    }
  } catch (error) {
    console.error('Pixel conversion error:', error);
  }

  return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
