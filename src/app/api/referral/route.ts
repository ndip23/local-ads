import { NextRequest, NextResponse } from 'next/server';
import { db, pool } from '@/db';
import { users, referralEarnings, referralLevels } from '@/db/schema';
import { eq, desc, sum, count, gte, and, inArray, asc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { buildReferralLink, ensureUserReferralCode, resetUserReferralCode, getReferralProgramSettings } from '@/lib/referrals';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
}

async function buildReferralTree(userId: string, maxLevels = 10) {
  const referralTree: Record<number, number> = {};
  let currentLevelIds = [userId];

  const safeMaxLevels = Math.max(1, Math.min(10, maxLevels));

  for (let level = 1; level <= safeMaxLevels; level++) {
    if (currentLevelIds.length === 0) {
      referralTree[level] = 0;
      continue;
    }

    const nextLevel = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.referredBy, currentLevelIds));

    referralTree[level] = nextLevel.length;
    currentLevelIds = nextLevel.map((user) => user.id);
  }

  return referralTree;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureReferralFeatureSchema();

    const referralCode = await ensureUserReferralCode(session.userId);

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { referralCode: true, referredBy: true },
    });

    const settings = await getReferralProgramSettings();
    const maxLevels = Math.max(1, Math.min(10, Number(settings.maxLevels || 10)));

    const levels = await db.query.referralLevels.findMany({
      orderBy: [asc(referralLevels.level)],
    });

    const directReferrals = await db.query.users.findMany({
      where: eq(users.referredBy, session.userId),
      columns: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      orderBy: [desc(users.createdAt)],
    });

    const referralTree = await buildReferralTree(session.userId, maxLevels);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [earningsStats] = await db
      .select({
        totalEarnings: sum(referralEarnings.commissionAmount),
        totalTransactions: count(),
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.earnerId, session.userId));

    const [recentEarnings] = await db
      .select({ total: sum(referralEarnings.commissionAmount) })
      .from(referralEarnings)
      .where(and(
        eq(referralEarnings.earnerId, session.userId),
        gte(referralEarnings.createdAt, thirtyDaysAgo)
      ));

    const byLevel = await db
      .select({
        level: referralEarnings.level,
        total: sum(referralEarnings.commissionAmount),
        transactions: count(),
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.earnerId, session.userId))
      .groupBy(referralEarnings.level)
      .orderBy(referralEarnings.level);

    const bySourceType = await db
      .select({
        sourceType: referralEarnings.sourceType,
        total: sum(referralEarnings.commissionAmount),
        transactions: count(),
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.earnerId, session.userId))
      .groupBy(referralEarnings.sourceType)
      .orderBy(referralEarnings.sourceType);

    const recentLog = await db.query.referralEarnings.findMany({
      where: eq(referralEarnings.earnerId, session.userId),
      orderBy: [desc(referralEarnings.createdAt)],
      limit: 20,
    });

    const referralClickStats = await pool.query<{ total_clicks: string; last_30_days: string }>(
      `SELECT
        COUNT(*)::text AS total_clicks,
        COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS last_30_days
       FROM referral_clicks
       WHERE referrer_id = $1`,
      [session.userId]
    );

    const referralClicks = {
      total: Number(referralClickStats.rows[0]?.total_clicks || 0),
      last30Days: Number(referralClickStats.rows[0]?.last_30_days || 0),
    };

    const totalTeam = Object.values(referralTree).reduce((total, value) => total + value, 0);
    const directCount = directReferrals.length;
    const conversionRate = directCount > 0 ? ((totalTeam / directCount) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      referralCode: user?.referralCode || referralCode,
      referralLink: buildReferralLink(getBaseUrl(request), user?.referralCode || referralCode),
      directReferrals,
      referralTree,
      levels,
      settings,
      earnings: {
        total: earningsStats?.totalEarnings || '0.00',
        last30Days: recentEarnings?.total || '0.00',
        totalTransactions: earningsStats?.totalTransactions || 0,
      },
      clicks: referralClicks,
      analysis: {
        totalTeam,
        directCount,
        referralClicks: referralClicks.total,
        signupConversionRate: referralClicks.total > 0 ? ((directCount / referralClicks.total) * 100).toFixed(2) : '0.00',
        depthMultiplier: directCount > 0 ? (totalTeam / directCount).toFixed(2) : '0.00',
        teamToDirectPercent: conversionRate,
        byLevel,
        bySourceType,
      },
      recentLog,
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureReferralFeatureSchema();

    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : 'generate';

    const referralCode = action === 'reset'
      ? await resetUserReferralCode(session.userId)
      : await ensureUserReferralCode(session.userId);

    return NextResponse.json({
      success: true,
      action,
      referralCode,
      referralLink: buildReferralLink(getBaseUrl(request), referralCode),
    });
  } catch (error) {
    console.error('Referral code action error:', error);
    return NextResponse.json({ error: 'Failed to update referral link' }, { status: 500 });
  }
}
