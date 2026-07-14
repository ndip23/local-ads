import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, PublisherSite, User, PublisherProfile } from '@/db/mongo';

function includesSearch(value: string | null | undefined, search: string): boolean {
  return Boolean(value?.toLowerCase().includes(search));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const verification = searchParams.get('verification'); // all | pending | verified
    const accountStatus = searchParams.get('accountStatus');
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    await connectToMongo();
    const sites = await PublisherSite.find({}).sort({ createdAt: -1 }).lean();

    // Populate user and publisher profile for filtering and display
    const userIds = sites.map((s: any) => s.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const profiles = await PublisherProfile.find({ userId: { $in: userIds } }).lean();

    const sitesWithUser = sites.map((site: any) => ({
      ...site,
      user: users.find((u: any) => String(u._id) === String(site.userId)) || null,
      userPublisherProfile: profiles.find((p: any) => String(p.userId) === String(site.userId)) || null,
    }));

    const filteredSites = sitesWithUser.filter((site: any) => {
      if (verification === 'pending' && site.verified) return false;
      if (verification === 'verified' && !site.verified) return false;
      if (accountStatus && site.user?.status !== accountStatus) return false;

      if (!search) return true;

      const userName = `${site.user?.firstName || ''} ${site.user?.lastName || ''}`.trim();
      return (
        includesSearch(site.domain, search) ||
        includesSearch(site.name, search) ||
        includesSearch(site.user?.email, search) ||
        includesSearch(userName, search) ||
        includesSearch(site.userPublisherProfile?.websiteUrl, search)
      );
    });

    return NextResponse.json({ sites: filteredSites });
  } catch (error) {
    console.error('Get publisher sites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publisher sites' },
      { status: 500 }
    );
  }
}
