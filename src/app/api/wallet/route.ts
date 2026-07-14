import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToMongo, Wallet, Transaction } from '@/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const wallet = await Wallet.findOne({ userId: session.userId }).lean();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const recentTransactions = await Transaction.find({ walletId: wallet._id }).sort({ createdAt: -1 }).limit(20).lean();

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
