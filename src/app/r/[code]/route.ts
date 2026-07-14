import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, User, ReferralClick } from '@/db/mongo';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';
import { normalizeReferralCode } from '@/lib/referrals';

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const referralCode = normalizeReferralCode(decodeURIComponent(code || ''));
  const redirectUrl = new URL('/register', request.nextUrl.origin);

  if (referralCode) {
    redirectUrl.searchParams.set('ref', referralCode);
  }

  try {
    await connectToMongo();
    await ensureReferralFeatureSchema();

    const referrer = referralCode
      ? await User.findOne({ referralCode }).select('_id').lean()
      : null;

    if (referralCode) {
      await ReferralClick.create({
        referralCode,
        referrerId: referrer?._id || null,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      });
    }
  } catch (error) {
    // Never break the registration journey because analytics failed.
    console.error('Referral redirect tracking error:', error);
  }

  redirectUrl.searchParams.set('tracked', '1');
  return NextResponse.redirect(redirectUrl);
}
