import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adWidgets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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
    await db.delete(adWidgets).where(and(eq(adWidgets.id, id), eq(adWidgets.publisherId, session.userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete widget error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
