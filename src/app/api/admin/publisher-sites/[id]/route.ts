import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, PublisherSite, User, Notification } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';

const updatePublisherSiteSchema = z.object({
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
  adsenseApproved: z.boolean().optional(),
  approvePublisherAccount: z.boolean().optional(),
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

    const { id } = await params;
    const body = await request.json();
    const validated = updatePublisherSiteSchema.parse(body);

    await connectToMongo();

    const existingSite = await PublisherSite.findById(id).lean();
    if (!existingSite) return NextResponse.json({ error: 'Publisher site not found' }, { status: 404 });

    const updateData: any = { updatedAt: new Date() };
    if (typeof validated.verified === 'boolean') {
      updateData.verified = validated.verified;
      if (validated.verified) updateData.active = true;
    }
    if (typeof validated.active === 'boolean') updateData.active = validated.active;
    if (typeof validated.adsenseApproved === 'boolean') updateData.adsenseApproved = validated.adsenseApproved;

    const updatedSite = await PublisherSite.findByIdAndUpdate(id, updateData, { new: true }).lean();

    let updatedUser = null;
    if (validated.approvePublisherAccount) {
      const approvedUser = await User.findByIdAndUpdate(existingSite.userId, { $set: { status: 'active', updatedAt: new Date() } }, { new: true }).select('id email role status').lean();
      updatedUser = approvedUser;

      await Notification.create({ userId: existingSite.userId, type: 'system', title: 'Account Approved', message: 'Your publisher account has been approved after review of your submitted website or links.' });
    }

    return NextResponse.json({ success: true, site: updatedSite, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update publisher site error:', error);
    return NextResponse.json(
      { error: 'Failed to update publisher site' },
      { status: 500 }
    );
  }
}
