import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, ReferralProgramSettings } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';
import { getReferralProgramSettings } from '@/lib/referrals';

export const runtime = 'nodejs';

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  minCommissionableAmount: z.number().min(0).max(1_000_000).optional(),
  maxLevels: z.number().int().min(1).max(10).optional(),
  cookieDays: z.number().int().min(1).max(365).optional(),
  commissionSource: z.enum(['publisher_earnings', 'click_earnings', 'conversion_earnings']).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getReferralProgramSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get referral settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    await ensureReferralFeatureSchema();

    const body = await request.json().catch(() => ({}));
    const validated = settingsSchema.parse(body);
    const existing = await getReferralProgramSettings();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.enabled !== undefined) updateData.enabled = validated.enabled;
    if (validated.minCommissionableAmount !== undefined) updateData.minCommissionableAmount = validated.minCommissionableAmount;
    if (validated.maxLevels !== undefined) updateData.maxLevels = validated.maxLevels;
    if (validated.cookieDays !== undefined) updateData.cookieDays = validated.cookieDays;
    if (validated.commissionSource !== undefined) updateData.commissionSource = validated.commissionSource;

    const updated = await ReferralProgramSettings.findByIdAndUpdate(
      existing._id,
      { $set: updateData },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Update referral settings error:', error);
    return NextResponse.json({ error: 'Failed to update referral settings' }, { status: 500 });
  }
}
