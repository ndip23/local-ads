import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo, AdWidget } from '@/db/mongo';
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

    await connectToMongo();

    const { id } = await params;
    await AdWidget.deleteOne({ _id: id, publisherId: session.userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete widget error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
