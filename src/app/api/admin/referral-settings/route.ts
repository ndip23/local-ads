import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { referralProgramSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    await ensureReferralFeatureSchema();

    const body = await request.json().catch(() => ({}));
    const validated = settingsSchema.parse(body);
    const existing = await getReferralProgramSettings();

    const [updated] = await db.update(referralProgramSettings)
      .set({
        enabled: validated.enabled ?? existing.enabled,
        minCommissionableAmount: validated.minCommissionableAmount !== undefined
          ? validated.minCommissionableAmount.toFixed(4)
          : existing.minCommissionableAmount,
        maxLevels: validated.maxLevels ?? existing.maxLevels,
        cookieDays: validated.cookieDays ?? existing.cookieDays,
        commissionSource: validated.commissionSource ?? existing.commissionSource,
        updatedBy: session.userId,
        updatedAt: new Date(),
      })
      .where(eq(referralProgramSettings.id, existing.id))
      .returning();

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Update referral settings error:', error);
    return NextResponse.json({ error: 'Failed to update referral settings' }, { status: 500 });
  }
}
