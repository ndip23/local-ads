import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adUnits, ads, campaigns, adUnitImpressions, adServingLog, adsenseSettings, countryRates } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { parseUserAgent } from '@/lib/utils';

// Simple IP to country mapping (in production, use a proper geo-IP service)
function getCountryFromIP(ip: string): { code: string; name: string } {
  return { code: 'US', name: 'United States' };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adUnitId: string }> }
) {
  try {
    const { adUnitId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'html'; // 'html', 'json', 'js'
    const callback = searchParams.get('callback'); // For JSONP

    // Get ad unit
    const adUnit = await db.query.adUnits.findFirst({
      where: and(eq(adUnits.id, adUnitId), eq(adUnits.active, true)),
    });

    if (!adUnit) {
      return serveEmptyResponse(format, callback, 'Ad unit not found');
    }

    // Get request details
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    const { code: countryCode, name: countryName } = getCountryFromIP(ip);

    // Try to find a network ad first if enabled
    let selectedAd = null;
    let adSource = 'none';

    if (adUnit.useNetworkAds) {
      // Find active campaigns with matching niches
      const activeAds = await db
        .select({
          ad: ads,
          campaign: campaigns,
        })
        .from(ads)
        .innerJoin(campaigns, eq(ads.campaignId, campaigns.id))
        .where(
          and(
            eq(campaigns.status, 'active'),
            eq(ads.status, 'approved'),
            sql`${campaigns.totalBudget}::numeric > ${campaigns.spentBudget}::numeric`
          )
        )
        .limit(10);

      // Filter by niches if specified
      let matchingAds = activeAds;
      if (adUnit.targetNiches && adUnit.targetNiches.length > 0) {
        matchingAds = activeAds.filter(({ campaign }) => {
          const campaignNiches = campaign.niches || [];
          return adUnit.targetNiches!.some(niche => 
            campaignNiches.includes(niche)
          );
        });
      }

      // Select a random ad from matching ones
      if (matchingAds.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingAds.length);
        selectedAd = matchingAds[randomIndex];
        adSource = 'network';
      }
    }

    // Get AdSense settings for fallback
    let adsenseConfig = null;
    if (!selectedAd && adUnit.useAdsense) {
      adsenseConfig = await db.query.adsenseSettings.findFirst({
        where: eq(adsenseSettings.userId, adUnit.userId),
      });
    }

    // Log impression
    await db.insert(adUnitImpressions).values({
      adUnitId: adUnit.id,
      adId: selectedAd?.ad.id || null,
      ipAddress: ip,
      country: countryName,
      countryCode,
      device,
      browser,
      pageUrl: referer,
      adSource: selectedAd ? 'network' : (adsenseConfig?.enabled ? 'adsense' : 'none'),
    });

    // Update ad unit impressions count
    await db.update(adUnits)
      .set({ impressions: sql`${adUnits.impressions} + 1` })
      .where(eq(adUnits.id, adUnit.id));

    // Log ad serving
    await db.insert(adServingLog).values({
      adUnitId: adUnit.id,
      publisherId: adUnit.userId,
      adId: selectedAd?.ad.id || null,
      adSource: selectedAd ? 'network' : (adsenseConfig?.enabled ? 'adsense' : 'fallback'),
      reason: selectedAd ? 'Network ad available' : (adsenseConfig?.enabled ? 'AdSense fallback' : 'No ads available'),
      ipAddress: ip,
      country: countryName,
      pageUrl: referer,
    });

    // Generate response based on format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        adUnit: {
          id: adUnit.id,
          type: adUnit.type,
          size: adUnit.size,
        },
        ad: selectedAd ? {
          id: selectedAd.ad.id,
          title: selectedAd.ad.title,
          description: selectedAd.ad.description,
          imageUrl: selectedAd.ad.imageUrl,
          videoUrl: selectedAd.ad.videoUrl,
          ctaText: selectedAd.ad.ctaText,
          landingUrl: selectedAd.campaign.landingPageUrl,
        } : null,
        fallback: !selectedAd && adsenseConfig?.enabled ? {
          type: 'adsense',
          publisherId: adsenseConfig.publisherId,
          slotId: adUnit.adsenseSlotId,
        } : null,
      });
    }

    // Generate HTML/JS response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const { width, height } = getAdDimensions(adUnit.size, adUnit.customWidth, adUnit.customHeight);

    let adHtml = '';

    if (selectedAd) {
      // Network ad
      const clickUrl = `${baseUrl}/api/click?ad_id=${selectedAd.ad.id}&pub_id=${adUnit.userId}&unit_id=${adUnit.id}`;
      
      adHtml = `
        <div class="lan-ad" style="width:${width};height:${height};background:${adUnit.backgroundColor};border:1px solid ${adUnit.borderColor || '#ddd'};overflow:hidden;position:relative;font-family:Arial,sans-serif;">
          <a href="${clickUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;height:100%;">
            ${selectedAd.ad.imageUrl ? `<img src="${selectedAd.ad.imageUrl}" style="width:100%;height:auto;max-height:70%;" alt="${selectedAd.ad.title}">` : ''}
            <div style="padding:8px;">
              <div style="font-weight:bold;color:${adUnit.titleColor};font-size:14px;margin-bottom:4px;">${selectedAd.ad.title}</div>
              ${selectedAd.ad.description ? `<div style="color:${adUnit.textColor};font-size:12px;margin-bottom:4px;">${selectedAd.ad.description.substring(0, 80)}...</div>` : ''}
              <div style="color:${adUnit.urlColor};font-size:11px;">${new URL(selectedAd.campaign.landingPageUrl).hostname}</div>
            </div>
          </a>
          <div style="position:absolute;bottom:2px;right:4px;font-size:9px;color:#999;">Ad</div>
        </div>
      `;
    } else if (adsenseConfig?.enabled && adsenseConfig.publisherId) {
      // AdSense fallback
      adHtml = `
        <div class="lan-adsense-fallback" style="width:${width};height:${height};">
          <ins class="adsbygoogle"
               style="display:block;width:${width};height:${height};"
               data-ad-client="${adsenseConfig.publisherId}"
               ${adUnit.adsenseSlotId ? `data-ad-slot="${adUnit.adsenseSlotId}"` : ''}
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
      `;
    } else {
      // No ad available - show placeholder or nothing
      adHtml = `
        <div class="lan-no-ad" style="width:${width};height:${height};background:#f5f5f5;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">
          Ad Space Available
        </div>
      `;
    }

    if (format === 'js' || callback) {
      // Return as JavaScript
      const jsCode = `
(function() {
  var container = document.currentScript.parentElement;
  var div = document.createElement('div');
  div.innerHTML = ${JSON.stringify(adHtml)};
  container.appendChild(div.firstElementChild);
  ${!selectedAd && adsenseConfig?.enabled ? `
  // Load AdSense if not already loaded
  if (!window.adsbygoogle) {
    var script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.publisherId}';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
  ` : ''}
})();
      `.trim();

      if (callback) {
        return new NextResponse(`${callback}(${JSON.stringify({ html: adHtml })});`, {
          headers: { 'Content-Type': 'application/javascript' },
        });
      }

      return new NextResponse(jsCode, {
        headers: { 
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Return HTML
    return new NextResponse(adHtml, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Ad serving error:', error);
    return serveEmptyResponse('html', null, 'Error serving ad');
  }
}

function getAdDimensions(size: string, customWidth?: number | null, customHeight?: number | null): { width: string; height: string } {
  if (size === 'custom' && customWidth && customHeight) {
    return { width: `${customWidth}px`, height: `${customHeight}px` };
  }

  const sizes: Record<string, { width: string; height: string }> = {
    'responsive': { width: '100%', height: 'auto' },
    '300x250': { width: '300px', height: '250px' },
    '336x280': { width: '336px', height: '280px' },
    '728x90': { width: '728px', height: '90px' },
    '300x600': { width: '300px', height: '600px' },
    '320x100': { width: '320px', height: '100px' },
    '320x50': { width: '320px', height: '50px' },
    '970x250': { width: '970px', height: '250px' },
    '970x90': { width: '970px', height: '90px' },
  };

  return sizes[size] || sizes['responsive'];
}

function serveEmptyResponse(format: string, callback: string | null, message: string) {
  if (format === 'json') {
    return NextResponse.json({ success: false, message });
  }
  
  const html = `<div style="display:none;"><!-- ${message} --></div>`;
  
  if (format === 'js' || callback) {
    if (callback) {
      return new NextResponse(`${callback}(${JSON.stringify({ html })});`, {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }
    return new NextResponse(`document.write(${JSON.stringify(html)});`, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
