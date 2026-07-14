import { NextResponse } from 'next/server';
import {
  connectToMongo,
  AdTrustSignal,
  ApprovalRequest,
  CampaignGeoRule,
  CampaignTargetingRule,
  GeoZone,
  ModuleActivityLog,
  ModuleFeatureSettings,
  PerformanceSnapshot,
  TargetingSegment,
} from '@/db/mongo';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongo();

    const role = session.role;

    const features = await ModuleFeatureSettings.find()
      .sort({ displayOrder: 1 })
      .lean();

    const approvalsFilter: any = role === 'admin'
      ? {}
      : { $or: [{ requestedBy: session.userId }, { assignedTo: session.userId }] };

    const approvals = await ApprovalRequest.find(approvalsFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const trustFilter: any = role === 'admin' ? {} : { userId: session.userId };

    const trustSignals = await AdTrustSignal.find(trustFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const perfFilter: any = role === 'admin' ? {} : { userId: session.userId };

    const snapshots = await PerformanceSnapshot.find(perfFilter)
      .sort({ periodEnd: -1 })
      .limit(20)
      .lean();

    const zones = await GeoZone.find({ active: true })
      .sort({ name: 1 })
      .limit(50)
      .lean();

    const segFilter: any = role === 'admin'
      ? {}
      : { ownerId: session.userId, active: true };

    const segments = await TargetingSegment.find(segFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const activityFilter: any = role === 'admin' ? {} : { userId: session.userId };

    const activities = await ModuleActivityLog.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const campaignGeoRuleCount = await CampaignGeoRule.countDocuments();
    const campaignTargetingRuleCount = await CampaignTargetingRule.countDocuments();

    return NextResponse.json({
      features: features.filter((feature: any) => role === 'admin' || feature.allowedRoles?.includes(role)),
      approvals,
      trustSignals,
      performanceSnapshots: snapshots,
      geoZones: zones,
      targetingSegments: segments,
      activity: activities,
      counts: {
        approvalsPending: approvals.filter((item: any) => item.status === 'pending').length,
        trustSignalsOpen: trustSignals.filter((item: any) => ['open', 'reviewing'].includes(item.status)).length,
        performanceSnapshots: snapshots.length,
        geoZones: zones.length,
        targetingSegments: segments.length,
        campaignGeoRules: campaignGeoRuleCount,
        campaignTargetingRules: campaignTargetingRuleCount,
      },
    });
  } catch (error) {
    console.error('Get module overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch module overview' }, { status: 500 });
  }
}
