import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { campaigns, ads, adTargeting, pixels, approvalRequests, campaignTargetingRules, moduleActivityLogs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/utils';
import { ensureCampaignCoreSchema, ensureCampaignWorkflowSchema } from '@/lib/feature-schema';

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

    let whereClause;

    if (session.role === 'admin') {
      whereClause = status ? eq(campaigns.status, status as typeof campaigns.status.enumValues[number]) : undefined;
    } else if (session.role === 'advertiser') {
      whereClause = status
        ? and(eq(campaigns.advertiserId, session.userId), eq(campaigns.status, status as typeof campaigns.status.enumValues[number]))
        : eq(campaigns.advertiserId, session.userId);
    } else {
      whereClause = eq(campaigns.status, 'active');
    }

    const campaignsList = await db.query.campaigns.findMany({
      where: whereClause,
      with: {
        ads: true,
        targeting: true,
        advertiser: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(campaigns.createdAt)],
      limit,
      offset,
    });

    return NextResponse.json({
      campaigns: campaignsList,
      page,
      limit,
    });
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

    const result = await db.transaction(async (tx) => {
      const [campaign] = await tx.insert(campaigns).values({
        advertiserId: session.userId,
        title: validated.title,
        description: validated.description,
        landingPageUrl: validated.landingPageUrl,
        totalBudget: validated.totalBudget.toFixed(2),
        dailyBudget: validated.dailyBudget.toFixed(2),
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        niches: validated.niches || [],
        status: 'pending_approval',
      }).returning();

      const [ad] = await tx.insert(ads).values({
        campaignId: campaign.id,
        title: validated.ad.title,
        description: validated.ad.description,
        videoUrl: validated.ad.videoUrl,
        imageUrl: validated.ad.imageUrl,
        ctaText: validated.ad.ctaText || 'Learn More',
        status: 'pending',
      }).returning();

      return { campaign, ad };
    });

    // This must stay outside the core transaction. In PostgreSQL, a caught
    // error inside a transaction still marks the transaction as aborted, which
    // was one of the reasons the UI kept reporting "Failed to create campaign".
    if (targeting.length > 0) {
      try {
        await db.insert(adTargeting).values(
          targeting.map((target) => ({
            campaignId: result.campaign.id,
            country: target.country,
            cpc: target.cpc.toFixed(4),
          }))
        );
      } catch (targetingError) {
        console.error('Campaign targeting side-effect error:', targetingError);
      }
    }

    const targetingRules: Array<typeof campaignTargetingRules.$inferInsert> = [];

    for (const niche of validated.niches || []) {
      targetingRules.push({
        campaignId: result.campaign.id,
        ruleType: 'niche',
        include: true,
        weight: 100,
        metadata: { niche },
      });
    }

    for (const target of targeting) {
      targetingRules.push({
        campaignId: result.campaign.id,
        ruleType: 'country',
        include: true,
        weight: 100,
        metadata: { country: target.country, cpc: target.cpc },
      });
    }

    try {
      await ensureCampaignWorkflowSchema();

      if (targetingRules.length > 0) {
        await db.insert(campaignTargetingRules).values(targetingRules);
      }

      await db.insert(approvalRequests).values({
        approvalNumber: generateApprovalNumber(),
        moduleKey: 'approvals',
        entityType: 'campaign',
        entityId: result.campaign.id,
        requestedBy: session.userId,
        subject: `Campaign approval: ${result.campaign.title}`,
        notes: 'Automatically created when the campaign was submitted for admin approval.',
        metadata: { campaignId: result.campaign.id, totalBudget: result.campaign.totalBudget, dailyBudget: result.campaign.dailyBudget },
      });

      await db.insert(moduleActivityLogs).values([
        {
          moduleKey: 'approvals',
          userId: session.userId,
          entityType: 'campaign',
          entityId: result.campaign.id,
          action: 'campaign_submitted_for_approval',
          metadata: { title: result.campaign.title },
        },
        {
          moduleKey: 'targeting',
          userId: session.userId,
          entityType: 'campaign',
          entityId: result.campaign.id,
          action: 'campaign_targeting_configured',
          metadata: { niches: validated.niches || [], targeting },
        },
      ]);
    } catch (workflowError) {
      console.error('Campaign workflow side-effect error:', workflowError);
    }

    let pixelCode: string | null = null;
    try {
      pixelCode = generateTrackingCode();
      await db.insert(pixels).values({
        campaignId: result.campaign.id,
        advertiserId: session.userId,
        name: 'Default Pixel',
        pixelCode,
        conversionType: 'lead',
      });
    } catch (pixelError) {
      console.error('Default pixel creation error:', pixelError);
    }

    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      ad: result.ad,
      pixelCode,
    });
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
