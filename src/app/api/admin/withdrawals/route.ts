import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, Withdrawal, User } from '@/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    await connectToMongo();
    const filter: any = {};
    if (status) filter.status = status;

    const allWithdrawals = await Withdrawal.find(filter).sort({ createdAt: -1 }).lean();

    const userIds = allWithdrawals.map((w: any) => w.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('id email firstName lastName').lean();

    const withdrawalsWithUsers = allWithdrawals.map((w: any) => ({ ...w, user: users.find((u: any) => String(u._id) === String(w.userId)) || null }));

    return NextResponse.json({ withdrawals: withdrawalsWithUsers });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}
