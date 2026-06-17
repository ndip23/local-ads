import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { fraudFlags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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

    const [updatedFlag] = await db.update(fraudFlags)
      .set({
        resolved: validated.resolved,
        resolvedBy: validated.resolved ? session.userId : null,
        resolvedAt: validated.resolved ? new Date() : null,
      })
      .where(eq(fraudFlags.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      flag: updatedFlag,
    });
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
