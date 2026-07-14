import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, User, Wallet, AdvertiserProfile, PublisherProfile, PublisherSite } from '@/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    await connectToMongo();

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
    }

    const total = await User.countDocuments(filter);
    const usersList = await User.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();

    const userIds = usersList.map((u: any) => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
    const advertiserProfiles = await AdvertiserProfile.find({ userId: { $in: userIds } }).lean();
    const publisherProfiles = await PublisherProfile.find({ userId: { $in: userIds } }).lean();

    const publisherIds = usersList.filter((u: any) => u.role === 'publisher').map((u: any) => u._id.toString());
    const sites = publisherIds.length > 0 ? await PublisherSite.find({ userId: { $in: publisherIds } }).sort({ createdAt: -1 }).lean() : [];
    const sitesByPublisherId: Record<string, any[]> = {};
    for (const s of sites) {
      const key = String(s.userId);
      sitesByPublisherId[key] = sitesByPublisherId[key] || [];
      sitesByPublisherId[key].push(s);
    }

    const usersWithExtras = usersList.map((user: any) => {
      const idStr = String(user._id);
      const wallet = wallets.find((w: any) => String(w.userId) === idStr) || null;
      const advertiserProfile = advertiserProfiles.find((p: any) => String(p.userId) === idStr) || null;
      const publisherProfile = publisherProfiles.find((p: any) => String(p.userId) === idStr) || null;
      delete user.passwordHash;
      return { ...user, wallet, advertiserProfile, publisherProfile, publisherSites: sitesByPublisherId[idStr] || [] };
    });

    return NextResponse.json({ users: usersWithExtras, page, limit, total });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
