import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { withdrawals, wallets, transactions, notifications } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const processWithdrawalSchema = z.object({
  action: z.enum(['approve', 'reject', 'complete']),
  transactionRef: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = processWithdrawalSchema.parse(body);

    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, id),
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.id, withdrawal.walletId),
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (validated.action === 'approve') {
      await db.update(withdrawals)
        .set({
          status: 'approved',
          processedBy: session.userId,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(withdrawals.id, id));

      await db.insert(notifications).values({
        userId: withdrawal.userId,
        type: 'withdrawal_status',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of $${withdrawal.amount} has been approved and is being processed.`,
        metadata: { withdrawalId: id },
      });
    } else if (validated.action === 'reject') {
      // Return funds to wallet
      const newBalance = parseFloat(wallet.balance) + parseFloat(withdrawal.amount);
      const newPendingBalance = parseFloat(wallet.pendingBalance || '0') - parseFloat(withdrawal.amount);

      await db.update(wallets)
        .set({
          balance: newBalance.toFixed(2),
          pendingBalance: Math.max(0, newPendingBalance).toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      await db.update(withdrawals)
        .set({
          status: 'rejected',
          processedBy: session.userId,
          processedAt: new Date(),
          rejectionReason: validated.rejectionReason,
          updatedAt: new Date(),
        })
        .where(eq(withdrawals.id, id));

      // Update transaction
      await db.update(transactions)
        .set({ status: 'cancelled' })
        .where(eq(transactions.referenceId, id));

      await db.insert(notifications).values({
        userId: withdrawal.userId,
        type: 'withdrawal_status',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of $${withdrawal.amount} has been rejected. ${validated.rejectionReason || ''}`,
        metadata: { withdrawalId: id },
      });
    } else if (validated.action === 'complete') {
      // Release from pending balance
      const newPendingBalance = parseFloat(wallet.pendingBalance || '0') - parseFloat(withdrawal.amount);
      const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn || '0') + parseFloat(withdrawal.amount);

      await db.update(wallets)
        .set({
          pendingBalance: Math.max(0, newPendingBalance).toFixed(2),
          totalWithdrawn: newTotalWithdrawn.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      await db.update(withdrawals)
        .set({
          status: 'completed',
          transactionRef: validated.transactionRef,
          updatedAt: new Date(),
        })
        .where(eq(withdrawals.id, id));

      // Update transaction
      await db.update(transactions)
        .set({ status: 'completed' })
        .where(eq(transactions.referenceId, id));

      await db.insert(notifications).values({
        userId: withdrawal.userId,
        type: 'withdrawal_status',
        title: 'Withdrawal Completed',
        message: `Your withdrawal of $${withdrawal.amount} has been completed successfully.`,
        metadata: { withdrawalId: id, transactionRef: validated.transactionRef },
      });
    }

    const updatedWithdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, id),
    });

    return NextResponse.json({
      success: true,
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
