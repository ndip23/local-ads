import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { countryRates } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const createRateSchema = z.object({
  countryCode: z.string().length(2),
  countryName: z.string().min(2),
  defaultCpc: z.number().positive(),
  publisherShare: z.number().min(0).max(100),
  platformShare: z.number().min(0).max(100),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rates = await db.query.countryRates.findMany({
      orderBy: [desc(countryRates.countryName)],
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error('Get country rates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createRateSchema.parse(body);

    // Check if country already exists
    const existing = await db.query.countryRates.findFirst({
      where: eq(countryRates.countryCode, validated.countryCode.toUpperCase()),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Country rate already exists' },
        { status: 400 }
      );
    }

    const [rate] = await db.insert(countryRates).values({
      countryCode: validated.countryCode.toUpperCase(),
      countryName: validated.countryName,
      defaultCpc: validated.defaultCpc.toFixed(4),
      publisherShare: validated.publisherShare.toFixed(2),
      platformShare: validated.platformShare.toFixed(2),
      active: validated.active ?? true,
    }).returning();

    return NextResponse.json({
      success: true,
      rate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create country rate error:', error);
    return NextResponse.json(
      { error: 'Failed to create country rate' },
      { status: 500 }
    );
  }
}
