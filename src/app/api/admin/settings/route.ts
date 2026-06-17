import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { platformSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.query.platformSettings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    return NextResponse.json({ settings: settingsMap, raw: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = settingSchema.parse(body);

    const existing = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, validated.key),
    });

    if (existing) {
      await db.update(platformSettings)
        .set({ value: validated.value, updatedAt: new Date() })
        .where(eq(platformSettings.key, validated.key));
    } else {
      await db.insert(platformSettings).values({
        key: validated.key,
        value: validated.value,
        description: validated.description,
        category: validated.category || 'general',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save setting error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
