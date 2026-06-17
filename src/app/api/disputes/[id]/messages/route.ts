import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { disputeMessages, disputes, moduleActivityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

const createMessageSchema = z.object({
  message: z.string().trim().min(2),
  attachments: z.array(z.object({
    name: z.string().min(1),
    url: z.string().min(1),
    type: z.string().optional(),
  })).optional(),
  internalNote: z.boolean().optional(),
});

export async function POST(
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
    const validated = createMessageSchema.parse(body);

    const dispute = await db.query.disputes.findFirst({ where: eq(disputes.id, id) });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'admin';
    const isOwner = dispute.createdBy === session.userId;
    const isAssignee = dispute.assignedTo === session.userId;

    if (!isAdmin && !isOwner && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (validated.internalNote && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can add internal dispute notes' }, { status: 403 });
    }

    const [message] = await db.insert(disputeMessages).values({
      disputeId: id,
      senderId: session.userId,
      message: validated.message,
      attachments: validated.attachments || [],
      internalNote: validated.internalNote || false,
    }).returning();

    await db.insert(moduleActivityLogs).values({
      moduleKey: 'disputes',
      userId: session.userId,
      entityType: 'dispute',
      entityId: id,
      action: validated.internalNote ? 'internal_dispute_note_added' : 'dispute_message_added',
      metadata: { disputeNumber: dispute.disputeNumber },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Create dispute message error:', error);
    return NextResponse.json({ error: 'Failed to add dispute message' }, { status: 500 });
  }
}
