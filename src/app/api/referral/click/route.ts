import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, pool } from '@/db';
import { users } from '@/db/schema';
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

    await ensureReferralFeatureSchema();

    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referralCode),
      columns: { id: true },
    });

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

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Referral click tracking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track referral click' }, { status: 500 });
  }
}
