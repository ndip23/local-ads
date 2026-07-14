import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, User, Wallet, AdvertiserProfile, PublisherProfile, Campaign, PublisherSite, Notification } from '@/db/mongo';

const updateUserSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'banned']).optional(),
  role: z.enum(['admin', 'advertiser', 'publisher']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToMongo();

    const user = await User.findById(id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const wallet = await Wallet.findOne({ userId: user._id }).lean();
    const advertiserProfile = await AdvertiserProfile.findOne({ userId: user._id }).lean();
    const publisherProfile = await PublisherProfile.findOne({ userId: user._id }).lean();
    const campaigns = await Campaign.find({ advertiserId: user._id }).lean();

    const sites = user.role === 'publisher' ? await PublisherSite.find({ userId: user._id }).lean() : [];

    delete user.passwordHash;
    return NextResponse.json({ user: { ...user, wallet, advertiserProfile, publisherProfile, campaigns, publisherSites: sites } });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

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
    const validated = updateUserSchema.parse(body);

    await connectToMongo();
    const existingUser = await User.findById(id).lean();
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: any = { updatedAt: new Date() };
    if (validated.status) updateData.status = validated.status;
    if (validated.role) updateData.role = validated.role;

    await User.updateOne({ _id: id }, { $set: updateData });
    const updatedUser = await User.findById(id).select('id email role status').lean();

    // Notify user of status change
    if (validated.status && validated.status !== existingUser.status) {
      const statusMessages: Record<string, string> = {
        active: 'Your account has been approved and is now active.',
        suspended: 'Your account has been suspended. Please contact support.',
        banned: 'Your account has been rejected or banned. Please contact support if you believe this was a mistake.',
      };

      if (statusMessages[validated.status]) {
        await Notification.create({ userId: id, type: validated.status === 'active' ? 'system' : 'account_suspended', title: `Account ${validated.status.charAt(0).toUpperCase() + validated.status.slice(1)}`, message: statusMessages[validated.status] });
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
