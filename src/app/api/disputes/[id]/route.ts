import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { disputes, moduleActivityLogs, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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
    const dispute = await db.query.disputes.findFirst({
      where: eq(disputes.id, id),
      with: {
        creator: { columns: { id: true, email: true, firstName: true, lastName: true, role: true } },
        assignee: { columns: { id: true, email: true, firstName: true, lastName: true, role: true } },
        messages: {
          with: { sender: { columns: { id: true, email: true, firstName: true, lastName: true, role: true } } },
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && dispute.createdBy !== session.userId && dispute.assignedTo !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ dispute });
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

    const existing = await db.query.disputes.findFirst({
      where: eq(disputes.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isOwner = existing.createdBy === session.userId;
    const isAdmin = requireRole(session, ['admin']);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (isAdmin) {
      if (validated.status) updateData.status = validated.status;
      if (validated.priority) updateData.priority = validated.priority;
      if (validated.resolution !== undefined) updateData.resolution = validated.resolution;
      if (validated.assignedTo !== undefined) updateData.assignedTo = validated.assignedTo;
      if (validated.status === 'resolved' || validated.status === 'rejected' || validated.status === 'closed') {
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

    const [updated] = await db.update(disputes).set(updateData).where(eq(disputes.id, id)).returning();


    await db.insert(moduleActivityLogs).values({
      moduleKey: 'disputes',
      userId: session.userId,
      entityType: 'dispute',
      entityId: id,
      action: 'dispute_updated',
      metadata: { status: updated.status, priority: updated.priority, resolution: updated.resolution || null },
    });

    if (isAdmin && updated.createdBy) {
      await db.insert(notifications).values({
        userId: updated.createdBy,
        type: 'system',
        title: 'Dispute updated',
        message: `${updated.disputeNumber} is now ${updated.status.replace(/_/g, ' ')}.`,
        metadata: { disputeId: updated.id, disputeNumber: updated.disputeNumber },
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
