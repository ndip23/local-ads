import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, AdWidget } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';

const createWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  style: z.enum(['banner', 'sidebar', 'inline', 'popup', 'sticky_bottom', 'native_feed']),
  width: z.string().optional(),
  height: z.string().optional(),
  maxAds: z.number().min(1).max(10).optional(),
  rotateInterval: z.number().min(5).max(300).optional(),
  targetNiches: z.array(z.string()).optional(),
  targetCountries: z.array(z.string()).optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  showBranding: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const widgets = await AdWidget.find({ publisherId: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Get widgets error:', error);
    return NextResponse.json({ error: 'Failed to fetch widgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const body = await request.json();
    const validated = createWidgetSchema.parse(body);

    const widget = await AdWidget.create({
      publisherId: session.userId,
      name: validated.name,
      style: validated.style,
      width: validated.width || '100%',
      height: validated.height || '250px',
      maxAds: validated.maxAds || 1,
      rotateInterval: validated.rotateInterval || 30,
      targetNiches: validated.targetNiches || [],
      targetCountries: validated.targetCountries || [],
      backgroundColor: validated.backgroundColor || '#ffffff',
      borderRadius: validated.borderRadius || '8px',
      showBranding: validated.showBranding ?? true,
    });

    return NextResponse.json({ success: true, widget: widget.toObject() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Create widget error:', error);
    return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
  }
}
