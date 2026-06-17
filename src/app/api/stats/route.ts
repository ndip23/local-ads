import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, campaigns, clicks, conversions, transactions, wallets, withdrawals, fraudFlags } from '@/db/schema';
import { eq, count, sum, gte, and, sql, desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      const [userStats] = await db
        .select({
          total: count(),
          advertisers: sql<number>`COUNT(CASE WHEN role = 'advertiser' THEN 1 END)`,
          publishers: sql<number>`COUNT(CASE WHEN role = 'publisher' THEN 1 END)`,
          pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        })
        .from(users);

      const [campaignStats] = await db
        .select({
          total: count(),
          active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
          pending: sql<number>`COUNT(CASE WHEN status = 'pending_approval' THEN 1 END)`,
        })
        .from(campaigns);

      const [clickStats] = await db
        .select({
          total: count(),
          valid: sql<number>`COUNT(CASE WHEN status = 'valid' THEN 1 END)`,
          fraud: sql<number>`COUNT(CASE WHEN status = 'fraud' THEN 1 END)`,
          totalRevenue: sum(clicks.platformEarning),
        })
        .from(clicks)
        .where(gte(clicks.createdAt, startDate));

      const [conversionStats] = await db
        .select({
          total: count(),
          totalValue: sum(conversions.value),
        })
        .from(conversions)
        .where(gte(conversions.createdAt, startDate));

      const [withdrawalStats] = await db
        .select({
          pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
          pendingAmount: sql<string>`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount::numeric ELSE 0 END), 0)`,
        })
        .from(withdrawals);

      // Daily clicks for chart
      const dailyClicks = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          clicks: count(),
          revenue: sum(clicks.platformEarning),
        })
        .from(clicks)
        .where(gte(clicks.createdAt, startDate))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

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
      const [campaignStats] = await db
        .select({
          total: count(),
          active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
          totalBudget: sum(campaigns.totalBudget),
          totalSpent: sum(campaigns.spentBudget),
        })
        .from(campaigns)
        .where(eq(campaigns.advertiserId, session.userId));

      const userCampaigns = await db.query.campaigns.findMany({
        where: eq(campaigns.advertiserId, session.userId),
        columns: { id: true },
      });

      const campaignIds = userCampaigns.map(c => c.id);

      let clickStats = { total: 0, totalCost: '0' };
      let conversionStats = { total: 0 };

      if (campaignIds.length > 0) {
        const [cs] = await db
          .select({
            total: count(),
            totalCost: sum(clicks.cpc),
          })
          .from(clicks)
          .where(
            and(
              sql`${clicks.campaignId} IN (${sql.raw(campaignIds.map(id => `'${id}'`).join(','))})`,
              gte(clicks.createdAt, startDate)
            )
          );
        clickStats = { total: cs.total || 0, totalCost: cs.totalCost || '0' };

        const [cvs] = await db
          .select({ total: count() })
          .from(conversions)
          .where(
            and(
              sql`${conversions.campaignId} IN (${sql.raw(campaignIds.map(id => `'${id}'`).join(','))})`,
              gte(conversions.createdAt, startDate)
            )
          );
        conversionStats = { total: cvs.total || 0 };
      }

      const wallet = await db.query.wallets.findFirst({
        where: eq(wallets.userId, session.userId),
      });

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
      const [clickStats] = await db
        .select({
          total: count(),
          valid: sql<number>`COUNT(CASE WHEN status = 'valid' THEN 1 END)`,
          earnings: sum(clicks.publisherEarning),
        })
        .from(clicks)
        .where(
          and(
            eq(clicks.publisherId, session.userId),
            gte(clicks.createdAt, startDate)
          )
        );

      const [conversionStats] = await db
        .select({
          total: count(),
          earnings: sum(conversions.publisherEarning),
        })
        .from(conversions)
        .where(
          and(
            eq(conversions.publisherId, session.userId),
            gte(conversions.createdAt, startDate)
          )
        );

      const wallet = await db.query.wallets.findFirst({
        where: eq(wallets.userId, session.userId),
      });

      // Top performing campaigns
      const topCampaigns = await db
        .select({
          campaignId: clicks.campaignId,
          clicks: count(),
          earnings: sum(clicks.publisherEarning),
        })
        .from(clicks)
        .where(
          and(
            eq(clicks.publisherId, session.userId),
            eq(clicks.status, 'valid'),
            gte(clicks.createdAt, startDate)
          )
        )
        .groupBy(clicks.campaignId)
        .orderBy(desc(sum(clicks.publisherEarning)))
        .limit(5);

      // Daily earnings for chart
      const dailyEarnings = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          clicks: count(),
          earnings: sum(clicks.publisherEarning),
        })
        .from(clicks)
        .where(
          and(
            eq(clicks.publisherId, session.userId),
            eq(clicks.status, 'valid'),
            gte(clicks.createdAt, startDate)
          )
        )
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);

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
