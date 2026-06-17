import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, transactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.userId),
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const recentTransactions = await db.query.transactions.findMany({
      where: eq(transactions.walletId, wallet.id),
      orderBy: [desc(transactions.createdAt)],
      limit: 20,
    });

    return NextResponse.json({
      wallet: {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarnings: wallet.totalEarnings,
        totalSpent: wallet.totalSpent,
        totalWithdrawn: wallet.totalWithdrawn,
        currency: wallet.currency,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
