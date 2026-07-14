import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, Wallet, Withdrawal, Transaction } from '@/db/mongo';

const withdrawSchema = z.object({
  amount: z.number().positive().min(10),
  paymentMethod: z.string(),
  paymentDetails: z.record(z.string(), z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    const userWithdrawals = await Withdrawal.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ withdrawals: userWithdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = withdrawSchema.parse(body);

    await connectToMongo();
    const wallet = await Wallet.findOne({ userId: session.userId }).lean();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = Number(wallet.balance || 0);
    if (currentBalance < validated.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const fee = validated.amount * 0.02;
    const netAmount = validated.amount - fee;

    const withdrawal = await Withdrawal.create({
      userId: session.userId,
      walletId: wallet._id,
      amount: validated.amount,
      fee,
      netAmount,
      status: 'pending',
      paymentMethod: validated.paymentMethod,
      paymentDetails: validated.paymentDetails,
    });

    const newBalance = currentBalance - validated.amount;
    const newPendingBalance = Number(wallet.pendingBalance || 0) + validated.amount;

    await Wallet.updateOne({ _id: wallet._id }, { $set: { balance: newBalance, pendingBalance: newPendingBalance, updatedAt: new Date() } });

    await Transaction.create({
      walletId: wallet._id,
      userId: session.userId,
      type: 'withdrawal',
      amount: -validated.amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      status: 'pending',
      description: `Withdrawal request via ${validated.paymentMethod}`,
      referenceId: withdrawal._id,
      referenceType: 'withdrawal',
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      newBalance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
