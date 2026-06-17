import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { wallets, transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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

    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, session.userId),
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const newBalance = parseFloat(wallet.balance) + validated.amount;

    // Update wallet
    await db.update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    // Create transaction record
    const [transaction] = await db.insert(transactions).values({
      walletId: wallet.id,
      userId: session.userId,
      type: 'deposit',
      amount: validated.amount.toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: newBalance.toFixed(2),
      status: 'completed',
      description: `Deposit via ${validated.paymentMethod || 'direct'}`,
    }).returning();

    return NextResponse.json({
      success: true,
      transaction,
      newBalance: newBalance.toFixed(2),
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
