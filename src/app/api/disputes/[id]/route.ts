import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, Dispute, ModuleActivityLog, Notification, User, DisputeMessage } from '@/db/mongo';

const updateDisputeSchema = z.object({
  status: z.enum(['open', 'under_review', 'resolved', 'rejected', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  resolution: z.string().trim().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToMongo();

    const dispute = await Dispute.findById(id).lean();
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && String(dispute.createdBy) !== String(session.userId) && String(dispute.assignedTo) !== String(session.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userIds = [dispute.createdBy, dispute.assignedTo].filter(Boolean).map(String);
    const users = userIds.length ? await User.find({ _id: { $in: userIds } }).select('email firstName lastName role').lean() : [];

    const creator = users.find((u: any) => String(u._id) === String(dispute.createdBy)) || null;
    const assignee = users.find((u: any) => String(u._id) === String(dispute.assignedTo)) || null;

    const messages = await DisputeMessage.find({ disputeId: dispute._id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ dispute: { ...dispute, creator, assignee, messages } });
  } catch (error) {
    console.error('Get dispute error:', error);
    return NextResponse.json({ error: 'Failed to fetch dispute' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateDisputeSchema.parse(body);

    await connectToMongo();
    const existing = await Dispute.findById(id).lean();

    if (!existing) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isOwner = String(existing.createdBy) === String(session.userId);
    const isAdmin = requireRole(session, ['admin']);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = { updatedAt: new Date() };

    if (isAdmin) {
      if (validated.status) updateData.status = validated.status;
      if (validated.priority) updateData.priority = validated.priority;
      if (validated.resolution !== undefined) updateData.resolution = validated.resolution;
      if (validated.assignedTo !== undefined) updateData.assignedTo = validated.assignedTo || null;
      if (['resolved', 'rejected', 'closed'].includes(validated.status || '')) {
        updateData.resolvedAt = new Date();
      }
    } else {
      if (validated.status === 'closed') {
        updateData.status = 'closed';
        updateData.resolvedAt = new Date();
      } else {
        return NextResponse.json({ error: 'Only admins can review, resolve or reject disputes' }, { status: 403 });
      }
    }

    const updated = await Dispute.findByIdAndUpdate(id, updateData, { new: true }).lean();

    await ModuleActivityLog.create({
      moduleKey: 'disputes',
      userId: session.userId,
      entityType: 'dispute',
      entityId: id,
      action: 'dispute_updated',
      metadata: { status: updated?.status, priority: updated?.priority, resolution: updated?.resolution || null },
    });

    if (isAdmin && updated?.createdBy) {
      await Notification.create({
        userId: updated.createdBy,
        type: 'system',
        title: 'Dispute updated',
        message: `${updated.disputeNumber} is now ${updated.status?.replace(/_/g, ' ')}.`,
        metadata: { disputeId: updated._id, disputeNumber: updated.disputeNumber },
      });
    }

    return NextResponse.json({ success: true, dispute: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Update dispute error:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
