import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { referralLevels } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureReferralFeatureSchema();

    const levels = await db.query.referralLevels.findMany({
      orderBy: [asc(referralLevels.level)],
    });

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Get referral levels error:', error);
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}

const levelSchema = z.object({
  level: z.number().min(1).max(10),
  commissionPercent: z.number().min(0).max(100),
  label: z.string().optional(),
  active: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureReferralFeatureSchema();

    const body = await request.json();
    const validated = levelSchema.parse(body);

    // Upsert
    const existing = await db.query.referralLevels.findFirst({
      where: eq(referralLevels.level, validated.level),
    });

    if (existing) {
      const [updated] = await db.update(referralLevels)
        .set({
          commissionPercent: validated.commissionPercent.toFixed(2),
          label: validated.label || `Level ${validated.level}`,
          active: validated.active ?? true,
          updatedAt: new Date(),
        })
        .where(eq(referralLevels.level, validated.level))
        .returning();
      return NextResponse.json({ success: true, level: updated });
    } else {
      const [created] = await db.insert(referralLevels).values({
        level: validated.level,
        commissionPercent: validated.commissionPercent.toFixed(2),
        label: validated.label || `Level ${validated.level}`,
        active: validated.active ?? true,
      }).returning();
      return NextResponse.json({ success: true, level: created });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Save referral level error:', error);
    return NextResponse.json({ error: 'Failed to save level' }, { status: 500 });
  }
}
