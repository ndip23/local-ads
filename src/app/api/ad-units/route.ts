import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { adUnits } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const createAdUnitSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['display', 'in_feed', 'in_article', 'matched_content', 'native', 'video', 'responsive']),
  size: z.enum(['responsive', '300x250', '336x280', '728x90', '300x600', '320x100', '320x50', '970x250', '970x90', 'custom']),
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
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAdUnits = await db.query.adUnits.findMany({
      where: eq(adUnits.userId, session.userId),
      orderBy: [desc(adUnits.createdAt)],
    });

    return NextResponse.json({ adUnits: userAdUnits });
  } catch (error) {
    console.error('Get ad units error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad units' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createAdUnitSchema.parse(body);

    const [adUnit] = await db.insert(adUnits).values({
      userId: session.userId,
      name: validated.name,
      type: validated.type,
      size: validated.size,
      customWidth: validated.customWidth,
      customHeight: validated.customHeight,
      backgroundColor: validated.backgroundColor || '#ffffff',
      borderColor: validated.borderColor,
      titleColor: validated.titleColor || '#0000ff',
      textColor: validated.textColor || '#000000',
      urlColor: validated.urlColor || '#008000',
      useNetworkAds: validated.useNetworkAds ?? true,
      useAdsense: validated.useAdsense ?? true,
      adsenseSlotId: validated.adsenseSlotId,
      targetNiches: validated.targetNiches || [],
    }).returning();

    return NextResponse.json({
      success: true,
      adUnit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create ad unit error:', error);
    return NextResponse.json(
      { error: 'Failed to create ad unit' },
      { status: 500 }
    );
  }
}
