import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { campaigns, ads, campaignLogs, approvalRequests, moduleActivityLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { ensureCampaignCoreSchema } from '@/lib/feature-schema';

const absoluteUrlSchema = z.string().trim().min(1).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'URL must be a full http:// or https:// URL');

const cloudinaryImageUrlSchema = z.string().trim().min(1).refine((value) => {
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
}, 'Campaign image must be a Cloudinary image/upload URL');

const editableStatusSchema = z.enum([
  'draft',
  'pending_approval',
  'active',
  'paused',
  'budget_finished',
  'rejected',
  'completed',
]);

const updateCampaignSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  landingPageUrl: absoluteUrlSchema.optional(),
  totalBudget: z.number().positive().optional(),
  dailyBudget: z.number().positive().optional(),
  status: editableStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  niches: z.array(z.string()).optional(),
  ad: z.object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().optional(),
    imageUrl: cloudinaryImageUrlSchema.optional(),
    videoUrl: absoluteUrlSchema.optional(),
    ctaText: z.string().trim().max(100).optional(),
  }).optional(),
});

type CampaignStatus = typeof campaigns.status.enumValues[number];
type AdStatus = typeof ads.status.enumValues[number];

function hasCampaignContentChange(validated: z.infer<typeof updateCampaignSchema>) {
  return Boolean(
    validated.title !== undefined ||
    validated.description !== undefined ||
    validated.landingPageUrl !== undefined ||
    validated.totalBudget !== undefined ||
    validated.dailyBudget !== undefined ||
    validated.startDate !== undefined ||
    validated.endDate !== undefined ||
    validated.niches !== undefined ||
    validated.ad !== undefined
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureCampaignCoreSchema();

    const { id } = await params;

    let campaign;
    try {
      campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, id),
        with: {
          ads: true,
          targeting: true,
          pixels: true,
          advertiser: {
            columns: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (pixelJoinError) {
      console.error('Campaign detail pixel join failed:', pixelJoinError);
      campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, id),
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
      });
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (session.role === 'advertiser' && campaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureCampaignCoreSchema();

    const { id } = await params;
    const body = await request.json();
    const validated = updateCampaignSchema.parse(body);

    const existingCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
      with: { ads: true },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (session.role === 'advertiser' && existingCampaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.role !== 'admin' && validated.status && ['active', 'rejected'].includes(validated.status)) {
      return NextResponse.json({ error: 'Only admin can approve/reject campaigns' }, { status: 403 });
    }

    if (validated.dailyBudget !== undefined && validated.totalBudget !== undefined && validated.dailyBudget > validated.totalBudget) {
      return NextResponse.json(
        { error: 'Daily budget cannot be greater than total budget' },
        { status: 400 }
      );
    }

    const finalTotalBudget = validated.totalBudget ?? Number(existingCampaign.totalBudget);
    const finalDailyBudget = validated.dailyBudget ?? Number(existingCampaign.dailyBudget);
    if (finalDailyBudget > finalTotalBudget) {
      return NextResponse.json(
        { error: 'Daily budget cannot be greater than total budget' },
        { status: 400 }
      );
    }

    const finalStartDate = validated.startDate ? new Date(validated.startDate) : existingCampaign.startDate;
    const finalEndDate = validated.endDate ? new Date(validated.endDate) : existingCampaign.endDate;
    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
      return NextResponse.json(
        { error: 'End date cannot be earlier than start date' },
        { status: 400 }
      );
    }

    const contentChanged = hasCampaignContentChange(validated);
    const advertiserEditedApprovedCampaign = session.role !== 'admin' && contentChanged && !['draft', 'pending_approval'].includes(existingCampaign.status);

    const updateData: Partial<typeof campaigns.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.landingPageUrl !== undefined) updateData.landingPageUrl = validated.landingPageUrl;
    if (validated.totalBudget !== undefined) updateData.totalBudget = validated.totalBudget.toFixed(2);
    if (validated.dailyBudget !== undefined) updateData.dailyBudget = validated.dailyBudget.toFixed(2);
    if (validated.startDate !== undefined) updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
    if (validated.endDate !== undefined) updateData.endDate = validated.endDate ? new Date(validated.endDate) : null;
    if (validated.niches !== undefined) updateData.niches = validated.niches;

    if (validated.status) {
      updateData.status = validated.status as CampaignStatus;
    }
    if (validated.rejectionReason !== undefined) {
      updateData.rejectionReason = validated.rejectionReason;
    }

    if (advertiserEditedApprovedCampaign) {
      updateData.status = 'pending_approval';
      updateData.rejectionReason = null;
    }

    if (session.role === 'admin' && validated.status === 'active') {
      updateData.rejectionReason = null;
    }

    const [updatedCampaign] = await db.update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();

    if (validated.ad) {
      const targetAd = validated.ad.id
        ? existingCampaign.ads.find((ad) => ad.id === validated.ad?.id)
        : existingCampaign.ads[0];

      const adStatus: AdStatus | undefined = advertiserEditedApprovedCampaign ? 'pending' : undefined;

      if (targetAd) {
        const adUpdate: Partial<typeof ads.$inferInsert> = { updatedAt: new Date() };
        if (validated.ad.title !== undefined) adUpdate.title = validated.ad.title;
        if (validated.ad.description !== undefined) adUpdate.description = validated.ad.description;
        if (validated.ad.imageUrl !== undefined) adUpdate.imageUrl = validated.ad.imageUrl;
        if (validated.ad.videoUrl !== undefined) adUpdate.videoUrl = validated.ad.videoUrl;
        if (validated.ad.ctaText !== undefined) adUpdate.ctaText = validated.ad.ctaText || 'Learn More';
        if (adStatus) adUpdate.status = adStatus;

        await db.update(ads)
          .set(adUpdate)
          .where(eq(ads.id, targetAd.id));
      } else if (validated.ad.title || validated.title || existingCampaign.title) {
        await db.insert(ads).values({
          campaignId: id,
          title: validated.ad.title || validated.title || existingCampaign.title,
          description: validated.ad.description ?? validated.description ?? existingCampaign.description,
          imageUrl: validated.ad.imageUrl,
          videoUrl: validated.ad.videoUrl,
          ctaText: validated.ad.ctaText || 'Learn More',
          status: advertiserEditedApprovedCampaign ? 'pending' : 'pending',
        });
      }
    }

    if (validated.status && ['active', 'rejected'].includes(validated.status)) {
      await db.update(ads)
        .set({
          status: validated.status === 'active' ? 'approved' : 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(ads.campaignId, id));

      try {
        await db.update(approvalRequests)
          .set({
            status: validated.status === 'active' ? 'approved' : 'rejected',
            decisionReason: validated.rejectionReason || (validated.status === 'active' ? 'Approved by admin review.' : 'Rejected by admin review.'),
            decidedBy: session.userId,
            decidedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(approvalRequests.entityType, 'campaign'),
            eq(approvalRequests.entityId, id),
            eq(approvalRequests.status, 'pending')
          ));

        await db.insert(moduleActivityLogs).values({
          moduleKey: 'approvals',
          userId: session.userId,
          entityType: 'campaign',
          entityId: id,
          action: validated.status === 'active' ? 'campaign_approved' : 'campaign_rejected',
          metadata: { status: validated.status, rejectionReason: validated.rejectionReason || null },
        });
      } catch (workflowError) {
        console.error('Campaign approval workflow side-effect error:', workflowError);
      }
    }

    if (advertiserEditedApprovedCampaign) {
      await db.update(ads)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(eq(ads.campaignId, id));

      try {
        await db.insert(approvalRequests).values({
          approvalNumber: `APR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          moduleKey: 'approvals',
          entityType: 'campaign',
          entityId: id,
          requestedBy: session.userId,
          subject: `Campaign re-approval: ${updatedCampaign.title}`,
          notes: 'Campaign was edited after approval and needs another admin review.',
          metadata: { campaignId: id },
        });
      } catch (workflowError) {
        console.error('Campaign re-approval workflow side-effect error:', workflowError);
      }
    }

    try {
      await db.insert(campaignLogs).values({
        campaignId: id,
        userId: session.userId,
        action: advertiserEditedApprovedCampaign ? 'edit_requires_reapproval' : 'update',
        oldValue: existingCampaign as unknown as Record<string, unknown>,
        newValue: validated as Record<string, unknown>,
      });
    } catch (logError) {
      console.error('Campaign audit-log side-effect error:', logError);
    }

    let refreshedCampaign;
    try {
      refreshedCampaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, id),
        with: { ads: true, targeting: true, pixels: true },
      });
    } catch (refreshError) {
      console.error('Campaign refresh with pixels failed:', refreshError);
      refreshedCampaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, id),
        with: { ads: true, targeting: true },
      });
    }

    return NextResponse.json({
      success: true,
      campaign: refreshedCampaign || updatedCampaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && campaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (campaign.status !== 'draft' && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Can only delete draft campaigns' },
        { status: 400 }
      );
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
