import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { wallets, withdrawals, transactions, notifications } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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

    const userWithdrawals = await db.query.withdrawals.findMany({
      where: eq(withdrawals.userId, session.userId),
      orderBy: [desc(withdrawals.createdAt)],
    });

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

    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.userId),
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < validated.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate fee (2%)
    const fee = validated.amount * 0.02;
    const netAmount = validated.amount - fee;

    // Create withdrawal request
    const [withdrawal] = await db.insert(withdrawals).values({
      userId: session.userId,
      walletId: wallet.id,
      amount: validated.amount.toFixed(2),
      fee: fee.toFixed(2),
      netAmount: netAmount.toFixed(2),
      status: 'pending',
      paymentMethod: validated.paymentMethod,
      paymentDetails: validated.paymentDetails,
    }).returning();

    // Hold funds in pending balance
    const newBalance = currentBalance - validated.amount;
    const newPendingBalance = parseFloat(wallet.pendingBalance || '0') + validated.amount;

    await db.update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        pendingBalance: newPendingBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    // Create transaction record
    await db.insert(transactions).values({
      walletId: wallet.id,
      userId: session.userId,
      type: 'withdrawal',
      amount: (-validated.amount).toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: newBalance.toFixed(2),
      status: 'pending',
      description: `Withdrawal request via ${validated.paymentMethod}`,
      referenceId: withdrawal.id,
      referenceType: 'withdrawal',
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      newBalance: newBalance.toFixed(2),
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
