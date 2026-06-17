import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, publisherSites } from '@/db/schema';
import { eq, desc, and, or, ilike, count, inArray } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions = [];
    
    if (role) {
      conditions.push(eq(users.role, role as 'admin' | 'advertiser' | 'publisher'));
    }
    if (status) {
      conditions.push(eq(users.status, status as 'pending' | 'active' | 'suspended' | 'banned'));
    }
    if (search) {
      conditions.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const usersList = await db.query.users.findMany({
      where: whereClause,
      with: {
        wallet: true,
        advertiserProfile: true,
        publisherProfile: true,
      },
      columns: {
        passwordHash: false,
      },
      orderBy: [desc(users.createdAt)],
      limit,
      offset,
    });

    const publisherIds = usersList
      .filter((user) => user.role === 'publisher')
      .map((user) => user.id);

    const sitesByPublisherId: Record<string, typeof publisherSites.$inferSelect[]> = {};

    if (publisherIds.length > 0) {
      const sites = await db.query.publisherSites.findMany({
        where: inArray(publisherSites.userId, publisherIds),
        orderBy: [desc(publisherSites.createdAt)],
      });

      for (const site of sites) {
        sitesByPublisherId[site.userId] = sitesByPublisherId[site.userId] || [];
        sitesByPublisherId[site.userId].push(site);
      }
    }

    const totalResult = await db.select({ count: count() })
      .from(users)
      .where(whereClause);

    return NextResponse.json({
      users: usersList.map((user) => ({
        ...user,
        publisherSites: sitesByPublisherId[user.id] || [],
      })),
      page,
      limit,
      total: totalResult[0]?.count || 0,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
