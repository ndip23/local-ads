import { NextResponse } from 'next/server';
import { connectToMongo, Campaign, Pixel } from '@/db/mongo';
import { getSession, requireRole } from '@/lib/auth';
import { ensureCampaignWorkflowSchema } from '@/lib/feature-schema';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();
    await ensureCampaignWorkflowSchema();

    const filter: any = session.role === 'admin' ? {} : { advertiserId: session.userId };

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
    const campaignIds = campaigns.map((c: any) => c._id);

    const pixels = await Pixel.find({ campaignId: { $in: campaignIds } }).lean();

    // Attach pixels to campaigns
    const campaignPixels = campaigns.map((campaign: any) => ({
      ...campaign,
      pixels: pixels.filter((p: any) => String(p.campaignId) === String(campaign._id)),
    }));

    return NextResponse.json({ campaigns: campaignPixels });
  } catch (error) {
    console.error('Get pixels error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign pixels' }, { status: 500 });
  }
}
