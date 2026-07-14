import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';
import { connectToMongo, FraudFlag, User } from '@/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const resolvedParam = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    await connectToMongo();

    const filter: any = {};
    if (resolvedParam !== null) filter.resolved = resolvedParam === 'true';
    if (severity) filter.severity = severity;

    const flags = await FraudFlag.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();

    // Enrich with user info
    const userIds = flags.map((f: any) => f.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('id email firstName lastName').lean();
    const enrichedFlags = flags.map((flag: any) => ({ ...flag, user: users.find((u: any) => String(u._id) === String(flag.userId)) || null }));

    // Stats
    const total = await FraudFlag.countDocuments({});
    const unresolved = await FraudFlag.countDocuments({ resolved: false });
    const high = await FraudFlag.countDocuments({ severity: 'high' });
    const medium = await FraudFlag.countDocuments({ severity: 'medium' });
    const low = await FraudFlag.countDocuments({ severity: 'low' });

    const stats = { total, unresolved, high, medium, low };

    return NextResponse.json({ flags: enrichedFlags, stats, page, limit });
  } catch (error) {
    console.error('Get fraud flags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud flags' },
      { status: 500 }
    );
  }
}
