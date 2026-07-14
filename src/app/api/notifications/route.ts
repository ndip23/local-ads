import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToMongo, Notification } from '@/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectToMongo();
    const filter: any = { userId: session.userId };
    if (unreadOnly) filter.read = false;

    const userNotifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    const unreadCount = await Notification.countDocuments({ userId: session.userId, read: false });

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
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

    await connectToMongo();
    if (markAll) {
      await Notification.updateMany({ userId: session.userId }, { $set: { read: true } });
    } else if (ids && Array.isArray(ids)) {
      await Notification.updateMany({ _id: { $in: ids }, userId: session.userId }, { $set: { read: true } });
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
