import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { withdrawals, wallets, transactions, notifications, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const whereClause = status 
      ? eq(withdrawals.status, status as 'pending' | 'approved' | 'rejected' | 'completed')
      : undefined;

    const allWithdrawals = await db.query.withdrawals.findMany({
      where: whereClause,
      orderBy: [desc(withdrawals.createdAt)],
    });

    // Get user info for each withdrawal
    const withdrawalsWithUsers = await Promise.all(
      allWithdrawals.map(async (w) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, w.userId),
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });
        return { ...w, user };
      })
    );

    return NextResponse.json({ withdrawals: withdrawalsWithUsers });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}
