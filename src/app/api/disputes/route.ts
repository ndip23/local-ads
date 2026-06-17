import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { disputes, disputeMessages, moduleActivityLogs, notifications } from '@/db/schema';
import { desc, eq, or } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const createDisputeSchema = z.object({
  subject: z.string().trim().min(5).max(255),
  category: z.string().trim().min(2).max(80).default('general'),
  relatedType: z.string().trim().max(50).default('general'),
  relatedId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().trim().min(10),
  amount: z.number().nonnegative().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function generateDisputeNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DSP-${date}-${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');
    const priority = request.nextUrl.searchParams.get('priority');

    const rows = await db.query.disputes.findMany({
      where: session.role === 'admin'
        ? undefined
        : or(eq(disputes.createdBy, session.userId), eq(disputes.assignedTo, session.userId)),
      with: {
        creator: {
          columns: { id: true, email: true, firstName: true, lastName: true, role: true },
        },
        assignee: {
          columns: { id: true, email: true, firstName: true, lastName: true, role: true },
        },
      },
      orderBy: [desc(disputes.createdAt)],
    });

    const filtered = rows.filter((item) => {
      if (status && item.status !== status) return false;
      if (priority && item.priority !== priority) return false;
      return true;
    });

    return NextResponse.json({ disputes: filtered });
  } catch (error) {
    console.error('Get disputes error:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createDisputeSchema.parse(body);

    const [created] = await db.insert(disputes).values({
      disputeNumber: generateDisputeNumber(),
      createdBy: session.userId,
      relatedType: validated.relatedType || 'general',
      relatedId: validated.relatedId || null,
      subject: validated.subject,
      category: validated.category,
      description: validated.description,
      amount: typeof validated.amount === 'number' ? validated.amount.toFixed(2) : null,
      priority: validated.priority || 'medium',
      metadata: validated.metadata || {},
    }).returning();


    await db.insert(disputeMessages).values({
      disputeId: created.id,
      senderId: session.userId,
      message: validated.description,
      attachments: [],
      internalNote: false,
    });

    await db.insert(moduleActivityLogs).values({
      moduleKey: 'disputes',
      userId: session.userId,
      entityType: 'dispute',
      entityId: created.id,
      action: 'dispute_opened',
      metadata: { disputeNumber: created.disputeNumber, category: created.category, priority: created.priority },
    });

    // Notify admins indirectly through the notifications table when an admin-created case is not involved.
    if (session.role !== 'admin') {
      const adminUsers = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.role, 'admin'),
        columns: { id: true },
      });

      if (adminUsers.length) {
        await db.insert(notifications).values(adminUsers.map((admin) => ({
          userId: admin.id,
          type: 'system' as const,
          title: 'New dispute opened',
          message: `${validated.subject} has been submitted for review.`,
          metadata: { disputeId: created.id, disputeNumber: created.disputeNumber },
        })));
      }
    }

    return NextResponse.json({ success: true, dispute: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Create dispute error:', error);
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
  }
}
