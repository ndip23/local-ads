import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause = unreadOnly
      ? and(eq(notifications.userId, session.userId), eq(notifications.read, false))
      : eq(notifications.userId, session.userId);

    const userNotifications = await db.query.notifications.findMany({
      where: whereClause,
      orderBy: [desc(notifications.createdAt)],
      limit,
    });

    const [unreadCount] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, session.userId), eq(notifications.read, false)));

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadCount?.count || 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, markAll } = body;

    if (markAll) {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, session.userId));
    } else if (ids && Array.isArray(ids)) {
      for (const id of ids) {
        await db.update(notifications)
          .set({ read: true })
          .where(and(eq(notifications.id, id), eq(notifications.userId, session.userId)));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications' },
      { status: 500 }
    );
  }
}
