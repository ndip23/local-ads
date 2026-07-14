import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, CountryRate } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';

const updateRateSchema = z.object({
  defaultCpc: z.number().positive().optional(),
  publisherShare: z.number().min(0).max(100).optional(),
  platformShare: z.number().min(0).max(100).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const { id } = await params;
    const body = await request.json();
    const validated = updateRateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.defaultCpc !== undefined) updateData.defaultCpc = validated.defaultCpc;
    if (validated.publisherShare !== undefined) updateData.publisherShare = validated.publisherShare;
    if (validated.platformShare !== undefined) updateData.platformShare = validated.platformShare;
    if (validated.active !== undefined) updateData.active = validated.active;

    const updatedRate = await CountryRate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      rate: updatedRate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update country rate error:', error);
    return NextResponse.json(
      { error: 'Failed to update country rate' },
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
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const { id } = await params;

    await CountryRate.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete country rate error:', error);
    return NextResponse.json(
      { error: 'Failed to delete country rate' },
      { status: 500 }
    );
  }
}
