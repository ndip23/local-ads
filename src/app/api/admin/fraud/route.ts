import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fraudFlags, clicks, users } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const conditions = [];
    if (resolved !== null) {
      conditions.push(eq(fraudFlags.resolved, resolved === 'true'));
    }
    if (severity) {
      conditions.push(eq(fraudFlags.severity, severity));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const flags = await db.query.fraudFlags.findMany({
      where: whereClause,
      orderBy: [desc(fraudFlags.createdAt)],
      limit,
      offset,
    });

    // Enrich with user info
    const enrichedFlags = await Promise.all(
      flags.map(async (flag) => {
        let user = null;
        if (flag.userId) {
          user = await db.query.users.findFirst({
            where: eq(users.id, flag.userId),
            columns: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });
        }
        return { ...flag, user };
      })
    );

    // Stats
    const [stats] = await db
      .select({
        total: count(),
        unresolved: count(eq(fraudFlags.resolved, false)),
        high: count(eq(fraudFlags.severity, 'high')),
        medium: count(eq(fraudFlags.severity, 'medium')),
        low: count(eq(fraudFlags.severity, 'low')),
      })
      .from(fraudFlags);

    return NextResponse.json({
      flags: enrichedFlags,
      stats,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get fraud flags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud flags' },
      { status: 500 }
    );
  }
}
