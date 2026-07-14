import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, PlatformSetting } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const settings = await PlatformSetting.find().lean();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => { settingsMap[s.key] = s.value; });

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

    await connectToMongo();

    const body = await request.json();
    const validated = settingSchema.parse(body);

    const existing = await PlatformSetting.findOne({ key: validated.key }).lean();

    if (existing) {
      await PlatformSetting.updateOne(
        { key: validated.key },
        { $set: { value: validated.value, updatedAt: new Date() } }
      );
    } else {
      await PlatformSetting.create({
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
