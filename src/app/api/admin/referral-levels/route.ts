import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, ReferralLevel } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    await ensureReferralFeatureSchema();

    const levels = await ReferralLevel.find().sort({ level: 1 }).lean();

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

    await connectToMongo();
    await ensureReferralFeatureSchema();

    const body = await request.json();
    const validated = levelSchema.parse(body);

    // Upsert
    const existing = await ReferralLevel.findOne({ level: validated.level }).lean();

    if (existing) {
      const updated = await ReferralLevel.findOneAndUpdate(
        { level: validated.level },
        {
          $set: {
            commissionPercent: validated.commissionPercent,
            label: validated.label || `Level ${validated.level}`,
            active: validated.active ?? true,
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).lean();
      return NextResponse.json({ success: true, level: updated });
    } else {
      const created = await ReferralLevel.create({
        level: validated.level,
        commissionPercent: validated.commissionPercent,
        label: validated.label || `Level ${validated.level}`,
        active: validated.active ?? true,
      });
      return NextResponse.json({ success: true, level: created.toObject() });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Save referral level error:', error);
    return NextResponse.json({ error: 'Failed to save level' }, { status: 500 });
  }
}
