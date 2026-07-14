import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, Wallet, Transaction } from '@/db/mongo';

const depositSchema = z.object({
  amount: z.number().positive().min(10),
  paymentMethod: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = depositSchema.parse(body);

    await connectToMongo();
    const wallet = await Wallet.findOne({ userId: session.userId }).lean();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const newBalance = Number(wallet.balance || 0) + validated.amount;
    await Wallet.updateOne({ _id: wallet._id }, { $set: { balance: newBalance, updatedAt: new Date() } });

    const transaction = await Transaction.create({
      walletId: wallet._id,
      userId: session.userId,
      type: 'deposit',
      amount: validated.amount,
      balanceBefore: Number(wallet.balance || 0),
      balanceAfter: newBalance,
      status: 'completed',
      description: `Deposit via ${validated.paymentMethod || 'direct'}`,
    });

    return NextResponse.json({
      success: true,
      transaction,
      newBalance: newBalance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Deposit failed' },
      { status: 500 }
    );
  }
}
