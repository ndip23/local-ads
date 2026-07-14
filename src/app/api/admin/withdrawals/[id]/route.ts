import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, Withdrawal, Wallet, Transaction, Notification } from '@/db/mongo';
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

    await connectToMongo();
    const withdrawal = await Withdrawal.findById(id).lean();
    if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });

    const wallet = await Wallet.findById(withdrawal.walletId).lean();
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    if (validated.action === 'approve') {
      await Withdrawal.updateOne({ _id: id }, { $set: { status: 'approved', processedBy: session.userId, processedAt: new Date(), updatedAt: new Date() } });
      await Notification.create({ userId: withdrawal.userId, type: 'withdrawal_status', title: 'Withdrawal Approved', message: `Your withdrawal of $${withdrawal.amount} has been approved and is being processed.`, metadata: { withdrawalId: id } });
    } else if (validated.action === 'reject') {
      // Return funds to wallet
      const newBalance = Number(wallet.balance || 0) + Number(withdrawal.amount);
      const newPendingBalance = Math.max(0, Number(wallet.pendingBalance || 0) - Number(withdrawal.amount));

      await Wallet.updateOne({ _id: wallet._id }, { $set: { balance: newBalance, pendingBalance: newPendingBalance, updatedAt: new Date() } });

      await Withdrawal.updateOne({ _id: id }, { $set: { status: 'rejected', processedBy: session.userId, processedAt: new Date(), rejectionReason: validated.rejectionReason, updatedAt: new Date() } });

      // Update transaction(s) referencing this withdrawal
      await Transaction.updateMany({ referenceId: id }, { $set: { status: 'cancelled' } });

      await Notification.create({ userId: withdrawal.userId, type: 'withdrawal_status', title: 'Withdrawal Rejected', message: `Your withdrawal of $${withdrawal.amount} has been rejected. ${validated.rejectionReason || ''}`, metadata: { withdrawalId: id } });
    } else if (validated.action === 'complete') {
      const newPendingBalance = Math.max(0, Number(wallet.pendingBalance || 0) - Number(withdrawal.amount));
      const newTotalWithdrawn = (Number(wallet.totalWithdrawn || 0) + Number(withdrawal.amount));

      await Wallet.updateOne({ _id: wallet._id }, { $set: { pendingBalance: newPendingBalance, totalWithdrawn: newTotalWithdrawn, updatedAt: new Date() } });

      await Withdrawal.updateOne({ _id: id }, { $set: { status: 'completed', transactionRef: validated.transactionRef, updatedAt: new Date() } });

      await Transaction.updateMany({ referenceId: id }, { $set: { status: 'completed' } });

      await Notification.create({ userId: withdrawal.userId, type: 'withdrawal_status', title: 'Withdrawal Completed', message: `Your withdrawal of $${withdrawal.amount} has been completed successfully.`, metadata: { withdrawalId: id, transactionRef: validated.transactionRef } });
    }

    const updatedWithdrawal = await Withdrawal.findById(id).lean();
    return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });
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
