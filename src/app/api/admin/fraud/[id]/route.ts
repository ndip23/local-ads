import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, FraudFlag } from '@/db/mongo';

const resolveFraudSchema = z.object({
  resolved: z.boolean(),
  notes: z.string().optional(),
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
    const validated = resolveFraudSchema.parse(body);

    await connectToMongo();
    const update: any = { resolved: validated.resolved };
    if (validated.resolved) {
      update.resolvedBy = session.userId;
      update.resolvedAt = new Date();
    } else {
      update.resolvedBy = null;
      update.resolvedAt = null;
    }

    await FraudFlag.updateOne({ _id: id }, { $set: update });
    const updatedFlag = await FraudFlag.findById(id).lean();

    return NextResponse.json({ success: true, flag: updatedFlag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Resolve fraud flag error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve fraud flag' },
      { status: 500 }
    );
  }
}
