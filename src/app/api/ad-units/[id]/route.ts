import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { adUnits } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const updateAdUnitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['display', 'in_feed', 'in_article', 'matched_content', 'native', 'video', 'responsive']).optional(),
  size: z.enum(['responsive', '300x250', '336x280', '728x90', '300x600', '320x100', '320x50', '970x250', '970x90', 'custom']).optional(),
  customWidth: z.number().optional(),
  customHeight: z.number().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  titleColor: z.string().optional(),
  textColor: z.string().optional(),
  urlColor: z.string().optional(),
  useNetworkAds: z.boolean().optional(),
  useAdsense: z.boolean().optional(),
  adsenseSlotId: z.string().optional(),
  targetNiches: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const adUnit = await db.query.adUnits.findFirst({
      where: and(eq(adUnits.id, id), eq(adUnits.userId, session.userId)),
    });

    if (!adUnit) {
      return NextResponse.json({ error: 'Ad unit not found' }, { status: 404 });
    }

    return NextResponse.json({ adUnit });
  } catch (error) {
    console.error('Get ad unit error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad unit' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateAdUnitSchema.parse(body);

    const existing = await db.query.adUnits.findFirst({
      where: and(eq(adUnits.id, id), eq(adUnits.userId, session.userId)),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ad unit not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    const [updatedAdUnit] = await db.update(adUnits)
      .set(updateData)
      .where(eq(adUnits.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      adUnit: updatedAdUnit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update ad unit error:', error);
    return NextResponse.json(
      { error: 'Failed to update ad unit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.adUnits.findFirst({
      where: and(eq(adUnits.id, id), eq(adUnits.userId, session.userId)),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ad unit not found' }, { status: 404 });
    }

    await db.delete(adUnits).where(eq(adUnits.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ad unit error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad unit' },
      { status: 500 }
    );
  }
}
