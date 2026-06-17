import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, pool } from '@/db';
import { users } from '@/db/schema';
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
    await ensureReferralFeatureSchema();

    const referrer = referralCode
      ? await db.query.users.findFirst({
          where: eq(users.referralCode, referralCode),
          columns: { id: true },
        })
      : null;

    if (referralCode) {
      await pool.query(
        `INSERT INTO referral_clicks (referral_code, referrer_id, ip_address, user_agent, referer)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          referralCode,
          referrer?.id || null,
          getClientIp(request),
          request.headers.get('user-agent'),
          request.headers.get('referer'),
        ]
      );
    }
  } catch (error) {
    // Never break the registration journey because analytics failed.
    console.error('Referral redirect tracking error:', error);
  }

  redirectUrl.searchParams.set('tracked', '1');
  return NextResponse.redirect(redirectUrl);
}
