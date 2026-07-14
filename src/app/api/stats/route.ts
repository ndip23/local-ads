import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, User, Campaign, Click, Conversion, Wallet, Withdrawal } from '@/db/mongo';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    if (session.role === 'admin') {
      // Admin stats - platform-wide
      const userAgg = await User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            advertisers: { $sum: { $cond: [{ $eq: ['$role', 'advertiser'] }, 1, 0] } },
            publishers: { $sum: { $cond: [{ $eq: ['$role', 'publisher'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          },
        },
      ]);
      const userStats = userAgg[0] || { total: 0, advertisers: 0, publishers: 0, pending: 0 };

      const campaignAgg = await Campaign.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_approval'] }, 1, 0] } },
          },
        },
      ]);
      const campaignStats = campaignAgg[0] || { total: 0, active: 0, pending: 0 };

      const clickAgg = await Click.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            valid: { $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] } },
            fraud: { $sum: { $cond: [{ $eq: ['$status', 'fraud'] }, 1, 0] } },
            totalRevenue: { $sum: '$platformEarning' },
          },
        },
      ]);
      const clickStats = clickAgg[0] || { total: 0, valid: 0, fraud: 0, totalRevenue: 0 };

      const conversionAgg = await Conversion.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalValue: { $sum: '$value' },
          },
        },
      ]);
      const conversionStats = conversionAgg[0] || { total: 0, totalValue: 0 };

      const withdrawalAgg = await Withdrawal.aggregate([
        {
          $group: {
            _id: null,
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          },
        },
      ]);
      const withdrawalStats = withdrawalAgg[0] || { pending: 0, pendingAmount: 0 };

      // Daily clicks for chart
      const dailyClicks = await Click.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            clicks: { $sum: 1 },
            revenue: { $sum: '$platformEarning' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', clicks: 1, revenue: 1, _id: 0 } },
      ]);

      return NextResponse.json({
        users: userStats,
        campaigns: campaignStats,
        clicks: {
          ...clickStats,
          fraudRate: clickStats.total > 0
            ? ((Number(clickStats.fraud) / Number(clickStats.total)) * 100).toFixed(2)
            : '0',
        },
        conversions: conversionStats,
        withdrawals: withdrawalStats,
        dailyClicks,
      });
    } else if (session.role === 'advertiser') {
      // Advertiser stats
      const campaignAgg = await Campaign.aggregate([
        { $match: { advertiserId: session.userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalBudget: { $sum: '$totalBudget' },
            totalSpent: { $sum: '$spentBudget' },
          },
        },
      ]);
      const campaignStats = campaignAgg[0] || { total: 0, active: 0, totalBudget: 0, totalSpent: 0 };

      const userCampaigns = await Campaign.find({ advertiserId: session.userId }).select('_id').lean();
      const campaignIds = userCampaigns.map((c: any) => c._id);

      let clickStats = { total: 0, totalCost: '0' };
      let conversionStats = { total: 0 };

      if (campaignIds.length > 0) {
        const csAgg = await Click.aggregate([
          { $match: { campaignId: { $in: campaignIds }, createdAt: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: 1 }, totalCost: { $sum: '$cpc' } } },
        ]);
        const cs = csAgg[0] || { total: 0, totalCost: 0 };
        clickStats = { total: cs.total || 0, totalCost: String(cs.totalCost || '0') };

        const cvsAgg = await Conversion.aggregate([
          { $match: { campaignId: { $in: campaignIds }, createdAt: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]);
        conversionStats = { total: cvsAgg[0]?.total || 0 };
      }

      const wallet = await Wallet.findOne({ userId: session.userId }).lean();

      return NextResponse.json({
        campaigns: campaignStats,
        clicks: clickStats,
        conversions: conversionStats,
        wallet: {
          balance: wallet?.balance || '0',
          totalSpent: wallet?.totalSpent || '0',
        },
      });
    } else {
      // Publisher stats
      const clickAgg = await Click.aggregate([
        { $match: { publisherId: session.userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            valid: { $sum: { $cond: [{ $eq: ['$status', 'valid'] }, 1, 0] } },
            earnings: { $sum: '$publisherEarning' },
          },
        },
      ]);
      const clickStats = clickAgg[0] || { total: 0, valid: 0, earnings: 0 };

      const conversionAgg = await Conversion.aggregate([
        { $match: { publisherId: session.userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            earnings: { $sum: '$publisherEarning' },
          },
        },
      ]);
      const conversionStats = conversionAgg[0] || { total: 0, earnings: 0 };

      const wallet = await Wallet.findOne({ userId: session.userId }).lean();

      // Top performing campaigns
      const topCampaigns = await Click.aggregate([
        { $match: { publisherId: session.userId, status: 'valid', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$campaignId',
            clicks: { $sum: 1 },
            earnings: { $sum: '$publisherEarning' },
          },
        },
        { $sort: { earnings: -1 } },
        { $limit: 5 },
        { $project: { campaignId: '$_id', clicks: 1, earnings: 1, _id: 0 } },
      ]);

      // Daily earnings for chart
      const dailyEarnings = await Click.aggregate([
        { $match: { publisherId: session.userId, status: 'valid', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            clicks: { $sum: 1 },
            earnings: { $sum: '$publisherEarning' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', clicks: 1, earnings: 1, _id: 0 } },
      ]);

      return NextResponse.json({
        clicks: clickStats,
        conversions: conversionStats,
        wallet: {
          balance: wallet?.balance || '0',
          pendingBalance: wallet?.pendingBalance || '0',
          totalEarnings: wallet?.totalEarnings || '0',
          totalWithdrawn: wallet?.totalWithdrawn || '0',
        },
        topCampaigns,
        dailyEarnings,
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
