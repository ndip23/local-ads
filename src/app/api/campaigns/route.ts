import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, requireRole } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/utils';
import { ensureCampaignCoreSchema, ensureCampaignWorkflowSchema } from '@/lib/feature-schema';
import { connectToMongo, Campaign, Ad, AdTargeting, Pixel, ApprovalRequest, CampaignTargetingRule, ModuleActivityLog } from '@/db/mongo';


function generateApprovalNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `APR-${date}-${suffix}`;
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isCloudinaryImageUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.hostname !== 'res.cloudinary.com') return false;

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 4) return false;
    if (process.env.CLOUDINARY_CLOUD_NAME && segments[0] !== process.env.CLOUDINARY_CLOUD_NAME) return false;

    return segments[1] === 'image' && segments[2] === 'upload';
  } catch {
    return false;
  }
}

const absoluteUrlSchema = z.string().trim().min(1).refine(isAbsoluteHttpUrl, 'URL must be a full http:// or https:// URL');
const cloudinaryImageUrlSchema = z.string().trim().min(1).refine(
  isCloudinaryImageUrl,
  'Campaign images must be uploaded to Cloudinary and use a res.cloudinary.com/.../image/upload/... URL'
);

const createCampaignSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  landingPageUrl: z.string().url(),
  totalBudget: z.number().min(10),
  dailyBudget: z.number().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  niches: z.array(z.string()).optional(),
  targeting: z.array(z.object({
    country: z.string().trim().min(2).max(100),
    cpc: z.number().positive(),
  })).optional(),
  ad: z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
    videoUrl: absoluteUrlSchema.optional(),
    imageUrl: cloudinaryImageUrlSchema,
    ctaText: z.string().optional(),
  }),
});

function normalizeTargeting(targeting: z.infer<typeof createCampaignSchema>['targeting']) {
  const deduped = new Map<string, { country: string; cpc: number }>();

  for (const target of targeting || []) {
    const country = target.country.trim().toUpperCase();
    if (!country) continue;
    deduped.set(country, { country, cpc: target.cpc });
  }

  return Array.from(deduped.values());
}

function publicCampaignCreateError(error: unknown) {
  const exposeDetails = process.env.EXPOSE_API_ERRORS === 'true' || process.env.NODE_ENV !== 'production';
  const err = error as { code?: string; message?: string; detail?: string; constraint?: string; table?: string };

  return {
    error: 'Failed to create campaign',
    hint: 'Run the final Supabase repair migration, confirm DATABASE_URL points to the correct Supabase database, and confirm the ad image URL is a Cloudinary image/upload URL.',
    ...(exposeDetails ? {
      databaseCode: err?.code,
      databaseTable: err?.table,
      databaseConstraint: err?.constraint,
      detail: err?.detail || err?.message,
    } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    await connectToMongo();

    const filter: any = {};
    if (session.role === 'admin') {
      if (status) filter.status = status;
    } else if (session.role === 'advertiser') {
      filter.advertiserId = session.userId;
      if (status) filter.status = status;
    } else {
      filter.status = 'active';
    }

    const campaignsList = await Campaign.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();

    // Batch load ads and targeting
    const campaignIds = campaignsList.map((c: any) => c._id);
    const adsByCampaign = await Ad.find({ campaignId: { $in: campaignIds } }).lean();
    const targetingByCampaign = await AdTargeting.find({ campaignId: { $in: campaignIds } }).lean();
    const advertisers = await Promise.all(campaignsList.map(async (c: any) => {
      // minimal advertiser info
      return { id: String(c.advertiserId) };
    }));

    const campaignsWithExtras = campaignsList.map((c: any) => ({
      ...c,
      id: String(c._id),
      ads: adsByCampaign.filter((a: any) => String(a.campaignId) === String(c._id)),
      targeting: targetingByCampaign.filter((t: any) => String(t.campaignId) === String(c._id)),
      advertiser: { id: String(c.advertiserId) },
    }));

    return NextResponse.json({ campaigns: campaignsWithExtras, page, limit });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureCampaignCoreSchema();

    const body = await request.json();
    const validated = createCampaignSchema.parse(body);
    const targeting = normalizeTargeting(validated.targeting);
    if (validated.dailyBudget > validated.totalBudget) {
      return NextResponse.json(
        { error: 'Daily budget cannot be greater than total budget' },
        { status: 400 }
      );
    }

    if (validated.startDate && validated.endDate && new Date(validated.endDate) < new Date(validated.startDate)) {
      return NextResponse.json(
        { error: 'End date cannot be earlier than start date' },
        { status: 400 }
      );
    }

    await connectToMongo();

    // Create campaign and ad
    const campaign = await Campaign.create({
      advertiserId: session.userId,
      title: validated.title,
      description: validated.description,
      landingPageUrl: validated.landingPageUrl,
      totalBudget: validated.totalBudget,
      dailyBudget: validated.dailyBudget,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      niches: validated.niches || [],
      status: 'pending_approval',
    });

    const ad = await Ad.create({
      campaignId: campaign._id,
      title: validated.ad.title,
      description: validated.ad.description,
      videoUrl: validated.ad.videoUrl,
      imageUrl: validated.ad.imageUrl,
      ctaText: validated.ad.ctaText || 'Learn More',
      status: 'pending',
    });

    // Targeting side-effect (non-critical)
    if (targeting.length > 0) {
      try {
        await AdTargeting.insertMany(targeting.map((t) => ({ campaignId: campaign._id, country: t.country, cpc: t.cpc })));
      } catch (targetingError) {
        console.error('Campaign targeting side-effect error:', targetingError);
      }
    }

    const targetingRules: any[] = [];
    for (const niche of validated.niches || []) {
      targetingRules.push({ campaignId: campaign._id, ruleType: 'niche', include: true, weight: 100, metadata: { niche } });
    }
    for (const target of targeting) {
      targetingRules.push({ campaignId: campaign._id, ruleType: 'country', include: true, weight: 100, metadata: { country: target.country, cpc: target.cpc } });
    }

    try {
      await ensureCampaignWorkflowSchema();
      if (targetingRules.length > 0) {
        await CampaignTargetingRule.insertMany(targetingRules);
      }

      await ApprovalRequest.create({
        approvalNumber: generateApprovalNumber(),
        moduleKey: 'approvals',
        entityType: 'campaign',
        entityId: campaign._id,
        requestedBy: session.userId,
        subject: `Campaign approval: ${campaign.title}`,
        notes: 'Automatically created when the campaign was submitted for admin approval.',
        metadata: { campaignId: campaign._id, totalBudget: campaign.totalBudget, dailyBudget: campaign.dailyBudget },
      });

      await ModuleActivityLog.insertMany([
        { moduleKey: 'approvals', userId: session.userId, entityType: 'campaign', entityId: campaign._id, action: 'campaign_submitted_for_approval', metadata: { title: campaign.title } },
        { moduleKey: 'targeting', userId: session.userId, entityType: 'campaign', entityId: campaign._id, action: 'campaign_targeting_configured', metadata: { niches: validated.niches || [], targeting } },
      ]);
    } catch (workflowError) {
      console.error('Campaign workflow side-effect error:', workflowError);
    }

    let pixelCode: string | null = null;
    try {
      pixelCode = generateTrackingCode();
      await Pixel.create({ campaignId: campaign._id, advertiserId: session.userId, name: 'Default Pixel', pixelCode, conversionType: 'lead' });
    } catch (pixelError) {
      console.error('Default pixel creation error:', pixelError);
    }

    return NextResponse.json({ success: true, campaign: { ...campaign.toObject(), id: String(campaign._id) }, ad: { ...ad.toObject(), id: String(ad._id) }, pixelCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create campaign error:', error);
    return NextResponse.json(publicCampaignCreateError(error), { status: 500 });
  }
}
