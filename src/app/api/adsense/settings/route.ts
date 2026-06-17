import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { adsenseSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const updateAdsenseSchema = z.object({
  publisherId: z.string().optional(),
  enabled: z.boolean().optional(),
  autoAdsEnabled: z.boolean().optional(),
  adClientId: z.string().optional(),
  fallbackEnabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await db.query.adsenseSettings.findFirst({
      where: eq(adsenseSettings.userId, session.userId),
    });

    // Create default settings if not exists
    if (!settings) {
      const verificationCode = uuidv4().replace(/-/g, '').substring(0, 16);
      [settings] = await db.insert(adsenseSettings).values({
        userId: session.userId,
        verificationCode,
      }).returning();
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get AdSense settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AdSense settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateAdsenseSchema.parse(body);

    let settings = await db.query.adsenseSettings.findFirst({
      where: eq(adsenseSettings.userId, session.userId),
    });

    if (!settings) {
      const verificationCode = uuidv4().replace(/-/g, '').substring(0, 16);
      [settings] = await db.insert(adsenseSettings).values({
        userId: session.userId,
        verificationCode,
        ...validated,
      }).returning();
    } else {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      
      Object.entries(validated).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      [settings] = await db.update(adsenseSettings)
        .set(updateData)
        .where(eq(adsenseSettings.userId, session.userId))
        .returning();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update AdSense settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update AdSense settings' },
      { status: 500 }
    );
  }
}
