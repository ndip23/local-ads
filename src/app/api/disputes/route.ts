import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, Dispute, DisputeMessage, ModuleActivityLog, Notification, User } from '@/db/mongo';

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

    await connectToMongo();

    const filter: any = {};
    if (session.role !== 'admin') {
      filter.$or = [{ createdBy: session.userId }, { assignedTo: session.userId }];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const rows = await Dispute.find(filter).sort({ createdAt: -1 }).lean();

    const userIds = rows.flatMap((r: any) => [r.createdBy, r.assignedTo]).filter(Boolean).map(String);
    const uniqueUserIds = Array.from(new Set(userIds));
    const users = uniqueUserIds.length ? await User.find({ _id: { $in: uniqueUserIds } }).select('email firstName lastName role').lean() : [];

    const disputesWithUsers = rows.map((r: any) => ({
      ...r,
      creator: users.find((u: any) => String(u._id) === String(r.createdBy)) || null,
      assignee: users.find((u: any) => String(u._id) === String(r.assignedTo)) || null,
    }));

    return NextResponse.json({ disputes: disputesWithUsers });
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

    await connectToMongo();

    const created = await Dispute.create({
      disputeNumber: generateDisputeNumber(),
      createdBy: session.userId,
      relatedType: validated.relatedType || 'general',
      relatedId: validated.relatedId || null,
      subject: validated.subject,
      category: validated.category,
      description: validated.description,
      amount: typeof validated.amount === 'number' ? validated.amount : undefined,
      priority: validated.priority || 'medium',
      metadata: validated.metadata || {},
    });

    await DisputeMessage.create({
      disputeId: created._id,
      senderId: session.userId,
      message: validated.description,
      attachments: [],
      internalNote: false,
    });

    await ModuleActivityLog.create({
      moduleKey: 'disputes',
      userId: session.userId,
      entityType: 'dispute',
      entityId: created._id,
      action: 'dispute_opened',
      metadata: { disputeNumber: created.disputeNumber, category: created.category, priority: created.priority },
    });

    if (session.role !== 'admin') {
      const adminUsers = await User.find({ role: 'admin' }).select('_id').lean();
      if (adminUsers.length) {
        await Notification.insertMany(adminUsers.map((admin: any) => ({
          userId: admin._id,
          type: 'system',
          title: 'New dispute opened',
          message: `${validated.subject} has been submitted for review.`,
          metadata: { disputeId: created._id, disputeNumber: created.disputeNumber },
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
