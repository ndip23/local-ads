import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  adTrustSignals,
  approvalRequests,
  campaignGeoRules,
  campaignTargetingRules,
  geoZones,
  moduleActivityLogs,
  moduleFeatureSettings,
  performanceSnapshots,
  targetingSegments,
} from '@/db/schema';
import { and, desc, eq, or } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.role;

    const features = await db.query.moduleFeatureSettings.findMany({
      orderBy: (settings, { asc }) => [asc(settings.displayOrder)],
    });

    const approvals = await db.query.approvalRequests.findMany({
      where: role === 'admin'
        ? undefined
        : or(eq(approvalRequests.requestedBy, session.userId), eq(approvalRequests.assignedTo, session.userId)),
      orderBy: [desc(approvalRequests.createdAt)],
      limit: 20,
    });

    const trustWhere = role === 'admin'
      ? undefined
      : eq(adTrustSignals.userId, session.userId);

    const trustSignals = await db.query.adTrustSignals.findMany({
      where: trustWhere,
      orderBy: [desc(adTrustSignals.createdAt)],
      limit: 20,
    });

    const performanceWhere = role === 'admin'
      ? undefined
      : eq(performanceSnapshots.userId, session.userId);

    const snapshots = await db.query.performanceSnapshots.findMany({
      where: performanceWhere,
      orderBy: [desc(performanceSnapshots.periodEnd)],
      limit: 20,
    });

    const zones = await db.query.geoZones.findMany({
      where: eq(geoZones.active, true),
      orderBy: (zones, { asc }) => [asc(zones.name)],
      limit: 50,
    });

    const segments = await db.query.targetingSegments.findMany({
      where: role === 'admin'
        ? undefined
        : and(eq(targetingSegments.ownerId, session.userId), eq(targetingSegments.active, true)),
      orderBy: [desc(targetingSegments.createdAt)],
      limit: 20,
    });

    const activities = await db.query.moduleActivityLogs.findMany({
      where: role === 'admin' ? undefined : eq(moduleActivityLogs.userId, session.userId),
      orderBy: [desc(moduleActivityLogs.createdAt)],
      limit: 30,
    });

    const campaignGeoRuleCount = await db.select().from(campaignGeoRules).limit(200);
    const campaignTargetingRuleCount = await db.select().from(campaignTargetingRules).limit(200);

    return NextResponse.json({
      features: features.filter((feature) => role === 'admin' || feature.allowedRoles?.includes(role)),
      approvals,
      trustSignals,
      performanceSnapshots: snapshots,
      geoZones: zones,
      targetingSegments: segments,
      activity: activities,
      counts: {
        approvalsPending: approvals.filter((item) => item.status === 'pending').length,
        trustSignalsOpen: trustSignals.filter((item) => ['open', 'reviewing'].includes(item.status)).length,
        performanceSnapshots: snapshots.length,
        geoZones: zones.length,
        targetingSegments: segments.length,
        campaignGeoRules: campaignGeoRuleCount.length,
        campaignTargetingRules: campaignTargetingRuleCount.length,
      },
    });
  } catch (error) {
    console.error('Get module overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch module overview' }, { status: 500 });
  }
}
