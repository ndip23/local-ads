import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publisherProfiles, clicks, adUnitImpressions } from '@/db/schema';
import { eq, count, sum, gte, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

// GET: Get publisher's unique tracking pixel code and stats
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const publisherId = session.userId;

    // Get click stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [clickStats] = await db
      .select({
        totalClicks: count(),
        totalEarnings: sum(clicks.publisherEarning),
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.publisherId, publisherId),
          eq(clicks.status, 'valid'),
          gte(clicks.createdAt, thirtyDaysAgo)
        )
      );

    // Generate all pixel code variants
    const pixelCodes = {
      // JavaScript snippet (recommended)
      javascript: `<!-- Local Ad Network Publisher Pixel -->
<script>
(function() {
  var s = document.createElement('script');
  s.src = '${baseUrl}/api/publisher/pixel/track.js?pub_id=${publisherId}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`,

      // Image pixel (for emails, simple pages)
      imagePixel: `<!-- Local Ad Network Tracking Pixel -->
<img src="${baseUrl}/api/publisher/pixel/img?pub_id=${publisherId}" style="display:none" width="1" height="1" alt="" />`,

      // Full tracking script with events
      advancedScript: `<!-- Local Ad Network Advanced Tracking -->
<script>
(function() {
  window.LAN_PUB = '${publisherId}';
  window.LAN_BASE = '${baseUrl}';
  
  var s = document.createElement('script');
  s.src = '${baseUrl}/api/publisher/pixel/track.js?pub_id=${publisherId}';
  s.async = true;
  document.head.appendChild(s);
  
  // Track page view automatically
  window.addEventListener('load', function() {
    var img = new Image();
    img.src = '${baseUrl}/api/publisher/pixel/img?pub_id=${publisherId}&page=' + encodeURIComponent(window.location.href) + '&ref=' + encodeURIComponent(document.referrer) + '&t=' + Date.now();
  });
})();
</script>`,
    };

    return NextResponse.json({
      publisherId,
      pixelCodes,
      stats: {
        totalClicks: clickStats?.totalClicks || 0,
        totalEarnings: clickStats?.totalEarnings || '0.00',
        period: 'last_30_days',
      },
    });
  } catch (error) {
    console.error('Get publisher pixel error:', error);
    return NextResponse.json(
      { error: 'Failed to get pixel code' },
      { status: 500 }
    );
  }
}
