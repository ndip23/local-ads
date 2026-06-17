import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publisherSites } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

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

    const sites = await db.query.publisherSites.findMany({
      with: {
        user: {
          columns: {
            passwordHash: false,
          },
          with: {
            publisherProfile: true,
          },
        },
      },
      orderBy: [desc(publisherSites.createdAt)],
    });

    const filteredSites = sites.filter((site) => {
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
        includesSearch(site.user?.publisherProfile?.websiteUrl, search)
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
