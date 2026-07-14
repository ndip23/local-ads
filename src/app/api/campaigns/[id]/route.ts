import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  connectToMongo,
  Campaign,
  Ad,
  AdTargeting,
  Pixel,
  User,
  ApprovalRequest,
  ModuleActivityLog,
} from '@/db/mongo';
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
    id: z.string().optional(),
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().optional(),
    imageUrl: cloudinaryImageUrlSchema.optional(),
    videoUrl: absoluteUrlSchema.optional(),
    ctaText: z.string().trim().max(100).optional(),
  }).optional(),
});

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

    await connectToMongo();
    await ensureCampaignCoreSchema();

    const { id } = await params;

    const campaign = await Campaign.findById(id).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (session.role === 'advertiser' && String(campaign.advertiserId) !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Populate related data
    const campaignAds = await Ad.find({ campaignId: id }).lean();
    const targeting = await AdTargeting.find({ campaignId: id }).lean();

    let pixels: any[] = [];
    try {
      pixels = await Pixel.find({ campaignId: id }).lean();
    } catch (pixelError) {
      console.error('Campaign detail pixel lookup failed:', pixelError);
    }

    const advertiser = await User.findById(campaign.advertiserId)
      .select('email firstName lastName')
      .lean();

    return NextResponse.json({
      campaign: {
        ...campaign,
        ads: campaignAds,
        targeting,
        pixels,
        advertiser,
      },
    });
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

    await connectToMongo();
    await ensureCampaignCoreSchema();

    const { id } = await params;
    const body = await request.json();
    const validated = updateCampaignSchema.parse(body);

    const existingCampaign = await Campaign.findById(id).lean();
    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const existingAds = await Ad.find({ campaignId: id }).lean();

    if (session.role === 'advertiser' && String(existingCampaign.advertiserId) !== session.userId) {
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

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.landingPageUrl !== undefined) updateData.landingPageUrl = validated.landingPageUrl;
    if (validated.totalBudget !== undefined) updateData.totalBudget = validated.totalBudget;
    if (validated.dailyBudget !== undefined) updateData.dailyBudget = validated.dailyBudget;
    if (validated.startDate !== undefined) updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
    if (validated.endDate !== undefined) updateData.endDate = validated.endDate ? new Date(validated.endDate) : null;
    if (validated.niches !== undefined) updateData.niches = validated.niches;

    if (validated.status) {
      updateData.status = validated.status;
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

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (validated.ad) {
      const targetAd = validated.ad.id
        ? existingAds.find((ad: any) => String(ad._id) === validated.ad?.id)
        : existingAds[0];

      if (targetAd) {
        const adUpdate: Record<string, unknown> = { updatedAt: new Date() };
        if (validated.ad.title !== undefined) adUpdate.title = validated.ad.title;
        if (validated.ad.description !== undefined) adUpdate.description = validated.ad.description;
        if (validated.ad.imageUrl !== undefined) adUpdate.imageUrl = validated.ad.imageUrl;
        if (validated.ad.videoUrl !== undefined) adUpdate.videoUrl = validated.ad.videoUrl;
        if (validated.ad.ctaText !== undefined) adUpdate.ctaText = validated.ad.ctaText || 'Learn More';
        if (advertiserEditedApprovedCampaign) adUpdate.status = 'pending';

        await Ad.findByIdAndUpdate(targetAd._id, { $set: adUpdate });
      } else if (validated.ad.title || validated.title || existingCampaign.title) {
        await Ad.create({
          campaignId: id,
          title: validated.ad.title || validated.title || existingCampaign.title,
          description: validated.ad.description ?? validated.description ?? existingCampaign.description,
          imageUrl: validated.ad.imageUrl,
          videoUrl: validated.ad.videoUrl,
          ctaText: validated.ad.ctaText || 'Learn More',
          status: 'pending',
        });
      }
    }

    if (validated.status && ['active', 'rejected'].includes(validated.status)) {
      await Ad.updateMany(
        { campaignId: id },
        { $set: { status: validated.status === 'active' ? 'approved' : 'rejected', updatedAt: new Date() } }
      );

      try {
        await ApprovalRequest.updateMany(
          { entityType: 'campaign', entityId: id, status: 'pending' },
          {
            $set: {
              status: validated.status === 'active' ? 'approved' : 'rejected',
              decisionReason: validated.rejectionReason || (validated.status === 'active' ? 'Approved by admin review.' : 'Rejected by admin review.'),
              decidedBy: session.userId,
              decidedAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        await ModuleActivityLog.create({
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
      await Ad.updateMany(
        { campaignId: id },
        { $set: { status: 'pending', updatedAt: new Date() } }
      );

      try {
        await ApprovalRequest.create({
          approvalNumber: `APR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          moduleKey: 'approvals',
          entityType: 'campaign',
          entityId: id,
          requestedBy: session.userId,
          subject: `Campaign re-approval: ${updatedCampaign?.title}`,
          notes: 'Campaign was edited after approval and needs another admin review.',
          metadata: { campaignId: id },
        });
      } catch (workflowError) {
        console.error('Campaign re-approval workflow side-effect error:', workflowError);
      }
    }

    // Refresh campaign with relations
    const refreshedCampaign = await Campaign.findById(id).lean();
    const refreshedAds = await Ad.find({ campaignId: id }).lean();
    const refreshedTargeting = await AdTargeting.find({ campaignId: id }).lean();
    let refreshedPixels: any[] = [];
    try {
      refreshedPixels = await Pixel.find({ campaignId: id }).lean();
    } catch (e) {
      // ignore pixel errors
    }

    return NextResponse.json({
      success: true,
      campaign: {
        ...(refreshedCampaign || updatedCampaign),
        ads: refreshedAds,
        targeting: refreshedTargeting,
        pixels: refreshedPixels,
      },
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

    await connectToMongo();

    const { id } = await params;

    const campaign = await Campaign.findById(id).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && String(campaign.advertiserId) !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (campaign.status !== 'draft' && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Can only delete draft campaigns' },
        { status: 400 }
      );
    }

    await Campaign.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
