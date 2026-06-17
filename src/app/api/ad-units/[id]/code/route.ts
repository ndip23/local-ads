import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adUnits, adsenseSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const adUnit = await db.query.adUnits.findFirst({
      where: and(eq(adUnits.id, id), eq(adUnits.userId, session.userId)),
    });

    if (!adUnit) {
      return NextResponse.json({ error: 'Ad unit not found' }, { status: 404 });
    }

    // Get AdSense settings
    const adsense = await db.query.adsenseSettings.findFirst({
      where: eq(adsenseSettings.userId, session.userId),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    // Generate different embed codes
    const codes: Record<string, string> = {
      // Async JavaScript (recommended)
      asyncJs: `<!-- Local Ad Network - ${adUnit.name} -->
<script async src="${baseUrl}/api/serve/${adUnit.id}?format=js"></script>`,

      // Synchronous JavaScript
      syncJs: `<!-- Local Ad Network - ${adUnit.name} -->
<script src="${baseUrl}/api/serve/${adUnit.id}?format=js"></script>`,

      // Iframe embed
      iframe: `<!-- Local Ad Network - ${adUnit.name} -->
<iframe 
  src="${baseUrl}/api/serve/${adUnit.id}?format=html" 
  style="border:none;width:100%;height:${getSizeHeight(adUnit.size)};"
  scrolling="no"
  frameborder="0">
</iframe>`,

      // JSONP callback
      jsonp: `<!-- Local Ad Network - ${adUnit.name} -->
<div id="lan-ad-${adUnit.id}"></div>
<script>
function lanAdCallback_${adUnit.id.replace(/-/g, '_')}(data) {
  document.getElementById('lan-ad-${adUnit.id}').innerHTML = data.html;
}
</script>
<script src="${baseUrl}/api/serve/${adUnit.id}?format=js&callback=lanAdCallback_${adUnit.id.replace(/-/g, '_')}"></script>`,

      // Direct HTML fetch (for server-side rendering)
      directUrl: `${baseUrl}/api/serve/${adUnit.id}?format=html`,

      // WordPress shortcode style
      wordpress: `[local_ad_network unit="${adUnit.id}"]`,

      // React component
      react: `import { useEffect, useRef } from 'react';

function LocalAdUnit() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/serve/${adUnit.id}?format=js';
    script.async = true;
    containerRef.current?.appendChild(script);
  }, []);
  
  return <div ref={containerRef} />;
}`,
    };

    // If AdSense is enabled, also provide combined code
    if (adsense?.enabled && adsense.publisherId) {
      codes.withAdsenseFallback = `<!-- Local Ad Network with AdSense Fallback -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}" crossorigin="anonymous"></script>
<script async src="${baseUrl}/api/serve/${adUnit.id}?format=js"></script>`;
    }

    return NextResponse.json({
      adUnit: {
        id: adUnit.id,
        name: adUnit.name,
        type: adUnit.type,
        size: adUnit.size,
      },
      codes,
      adsenseEnabled: adsense?.enabled || false,
    });
  } catch (error) {
    console.error('Get ad unit code error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ad code' },
      { status: 500 }
    );
  }
}

function getSizeHeight(size: string): string {
  const heights: Record<string, string> = {
    'responsive': 'auto',
    '300x250': '250px',
    '336x280': '280px',
    '728x90': '90px',
    '300x600': '600px',
    '320x100': '100px',
    '320x50': '50px',
    '970x250': '250px',
    '970x90': '90px',
  };
  return heights[size] || 'auto';
}
