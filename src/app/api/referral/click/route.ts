import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, User, ReferralClick } from '@/db/mongo';
import { normalizeReferralCode } from '@/lib/referrals';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const referralCode = normalizeReferralCode(String(body?.referralCode || body?.code || ''));

    if (!referralCode) {
      return NextResponse.json({ success: false, error: 'Referral code is required' }, { status: 400 });
    }

    await connectToMongo();
    await ensureReferralFeatureSchema();

    const referrer = await User.findOne({ referralCode }).select('_id').lean();

    await ReferralClick.create({
      referralCode,
      referrerId: referrer?._id || null,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Referral click tracking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track referral click' }, { status: 500 });
  }
}
