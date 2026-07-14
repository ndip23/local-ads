import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, User, ReferralEarning, ReferralLevel, ReferralClick } from '@/db/mongo';
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

    const nextLevel = await User.find({ referredBy: { $in: currentLevelIds } }).select('_id').lean();

    referralTree[level] = nextLevel.length;
    currentLevelIds = nextLevel.map((user: any) => String(user._id));
  }

  return referralTree;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToMongo();
    await ensureReferralFeatureSchema();

    const referralCode = await ensureUserReferralCode(session.userId);

    const user = await User.findById(session.userId).select('referralCode referredBy').lean();

    const settings = await getReferralProgramSettings();
    const maxLevels = Math.max(1, Math.min(10, Number(settings.maxLevels || 10)));

    const levels = await ReferralLevel.find().sort({ level: 1 }).lean();

    const directReferrals = await User.find({ referredBy: session.userId })
      .select('email firstName lastName role status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const referralTree = await buildReferralTree(session.userId, maxLevels);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate total earnings
    const earningsAgg = await ReferralEarning.aggregate([
      { $match: { earnerId: session.userId } },
      { $group: { _id: null, totalEarnings: { $sum: '$commissionAmount' }, totalTransactions: { $sum: 1 } } },
    ]);
    const earningsStats = earningsAgg[0] || { totalEarnings: 0, totalTransactions: 0 };

    // Aggregate recent earnings (last 30 days)
    const recentAgg = await ReferralEarning.aggregate([
      { $match: { earnerId: session.userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]);
    const recentEarnings = recentAgg[0] || { total: 0 };

    // Aggregate by level
    const byLevel = await ReferralEarning.aggregate([
      { $match: { earnerId: session.userId } },
      { $group: { _id: '$level', total: { $sum: '$commissionAmount' }, transactions: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { level: '$_id', total: 1, transactions: 1, _id: 0 } },
    ]);

    // Aggregate by source type
    const bySourceType = await ReferralEarning.aggregate([
      { $match: { earnerId: session.userId } },
      { $group: { _id: '$sourceType', total: { $sum: '$commissionAmount' }, transactions: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { sourceType: '$_id', total: 1, transactions: 1, _id: 0 } },
    ]);

    // Recent log
    const recentLog = await ReferralEarning.find({ earnerId: session.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Referral click stats (previously raw SQL)
    const totalClicks = await ReferralClick.countDocuments({ referrerId: session.userId });
    const last30DaysClicks = await ReferralClick.countDocuments({
      referrerId: session.userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const referralClicks = {
      total: totalClicks,
      last30Days: last30DaysClicks,
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
        total: earningsStats.totalEarnings || '0.00',
        last30Days: recentEarnings.total || '0.00',
        totalTransactions: earningsStats.totalTransactions || 0,
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
