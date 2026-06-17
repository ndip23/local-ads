import { NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { ensureCampaignWorkflowSchema } from '@/lib/feature-schema';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureCampaignWorkflowSchema();

    const whereClause = session.role === 'admin'
      ? undefined
      : eq(campaigns.advertiserId, session.userId);

    const campaignPixels = await db.query.campaigns.findMany({
      where: whereClause,
      with: {
        pixels: true,
      },
      orderBy: [desc(campaigns.createdAt)],
    });

    return NextResponse.json({ campaigns: campaignPixels });
  } catch (error) {
    console.error('Get pixels error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign pixels' }, { status: 500 });
  }
}
