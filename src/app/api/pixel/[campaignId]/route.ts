import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns, pixels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateTrackingCode } from '@/lib/utils';
import { ensureCampaignWorkflowSchema } from '@/lib/feature-schema';

function jsString(value: string) {
  return JSON.stringify(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

    await ensureCampaignWorkflowSchema();

    let pixel = await db.query.pixels.findFirst({
      where: eq(pixels.campaignId, campaignId),
    });

    if (!pixel) {
      const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, campaignId),
        columns: { id: true, advertiserId: true },
      });

      if (campaign) {
        const [createdPixel] = await db.insert(pixels).values({
          campaignId: campaign.id,
          advertiserId: campaign.advertiserId,
          name: 'Default Pixel',
          pixelCode: generateTrackingCode(),
          conversionType: 'lead',
        }).returning();
        pixel = createdPixel;
      }
    }

    if (!pixel || !pixel.active) {
      return new NextResponse('// Local Ads pixel not found or inactive', {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    const script = `
(function() {
  'use strict';

  var LAN = window.LAN || {};
  LAN.campaignId = ${jsString(campaignId)};
  LAN.pixelCode = ${jsString(pixel.pixelCode)};
  LAN.endpoint = ${jsString(`${baseUrl}/api/convert`)};
  LAN.cookieName = 'lan_click_id';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\\[\\]\\/\\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; max-age=' + maxAgeSeconds + '; path=/; SameSite=Lax';
  }

  function getClickId() {
    var urlParams = new URLSearchParams(window.location.search);
    var clickId = urlParams.get('click_id') || urlParams.get('lan_click_id');

    if (clickId) {
      setCookie(LAN.cookieName, clickId, 60 * 60 * 24 * 30);
      return clickId;
    }

    return getCookie(LAN.cookieName);
  }

  function buildMeta(extra) {
    var meta = {
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen: { width: screen.width, height: screen.height }
    };

    if (extra && typeof extra === 'object') {
      for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) meta[key] = extra[key];
      }
    }

    return meta;
  }

  LAN.track = function(type, value, metadata) {
    var clickId = getClickId();

    if (!clickId) {
      LAN.ping('conversion_without_click');
      return Promise.resolve({ tracked: false, reason: 'missing_click_id' });
    }

    return fetch(LAN.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        click_id: clickId,
        campaign_id: LAN.campaignId,
        pixel_code: LAN.pixelCode,
        type: type || 'lead',
        value: typeof value === 'number' ? value : null,
        metadata: buildMeta(metadata || {})
      })
    }).then(function(response) {
      return response.ok ? response.json().catch(function() { return { success: true }; }) : { tracked: false, status: response.status };
    }).catch(function() {
      return { tracked: false, reason: 'network_error' };
    });
  };

  LAN.ping = function(eventName) {
    var img = new Image();
    img.src = LAN.endpoint
      + '?campaign_id=' + encodeURIComponent(LAN.campaignId)
      + '&pixel_code=' + encodeURIComponent(LAN.pixelCode)
      + '&event=' + encodeURIComponent(eventName || 'page_view')
      + '&page=' + encodeURIComponent(window.location.href)
      + '&ref=' + encodeURIComponent(document.referrer || '')
      + '&t=' + Date.now();
  };

  LAN.trackPageView = function() {
    LAN.ping('page_view');
    getClickId();
  };

  window.LAN = LAN;

  if (document.readyState === 'complete') {
    LAN.trackPageView();
  } else {
    window.addEventListener('load', LAN.trackPageView);
  }
})();
`.trim();

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Pixel script error:', error);
    return new NextResponse('// Error loading Local Ads pixel', {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }
}
