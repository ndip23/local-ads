import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adWidgets, ads, campaigns, clicks, wallets, transactions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { parseUserAgent } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetID: string }> }
) {
  try {
    const { widgetID } = await params;
    const widgetId = widgetID;
    const format = request.nextUrl.searchParams.get('f') || 'js';

    const widget = await db.query.adWidgets.findFirst({
      where: and(eq(adWidgets.id, widgetId), eq(adWidgets.active, true)),
    });

    if (!widget) {
      return new NextResponse('/* Widget not found */', {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    // Find matching active ads
    let activeAds = await db
      .select({ ad: ads, campaign: campaigns })
      .from(ads)
      .innerJoin(campaigns, eq(ads.campaignId, campaigns.id))
      .where(and(
        eq(campaigns.status, 'active'),
        eq(ads.status, 'approved'),
        sql`${campaigns.totalBudget}::numeric > ${campaigns.spentBudget}::numeric`
      ))
      .limit(20);

    // Filter by widget niches
    if (widget.targetNiches && widget.targetNiches.length > 0) {
      activeAds = activeAds.filter(({ campaign }) => {
        const cn = campaign.niches || [];
        return widget.targetNiches!.some(n => cn.includes(n));
      });
    }

    // Pick random ads up to maxAds
    const shuffled = activeAds.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, widget.maxAds || 1);

    // Update impressions
    await db.update(adWidgets)
      .set({ impressions: sql`${adWidgets.impressions} + 1` })
      .where(eq(adWidgets.id, widgetId));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const pubId = widget.publisherId;

    // Build ad HTML cards
    const adCards = selected.map(({ ad, campaign }) => {
      const clickUrl = `${baseUrl}/api/click?ad_id=${ad.id}&pub_id=${pubId}&widget_id=${widgetId}`;
      const image = ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}" style="width:100%;height:auto;max-height:200px;object-fit:cover;border-radius:${widget.borderRadius} ${widget.borderRadius} 0 0;">` : '';
      return `
<div style="background:${widget.backgroundColor};border:1px solid #e5e7eb;border-radius:${widget.borderRadius};overflow:hidden;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <a href="${clickUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block;">
    ${image}
    <div style="padding:12px;">
      <div style="font-weight:600;font-size:14px;color:#111;margin-bottom:4px;">${ad.title}</div>
      ${ad.description ? `<div style="font-size:12px;color:#666;margin-bottom:8px;line-height:1.4;">${ad.description.substring(0, 120)}${ad.description.length > 120 ? '...' : ''}</div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#999;">${new URL(campaign.landingPageUrl).hostname}</span>
        <span style="font-size:12px;background:#2563eb;color:#fff;padding:4px 12px;border-radius:4px;font-weight:500;">${ad.ctaText || 'Learn More'}</span>
      </div>
    </div>
  </a>
  ${widget.showBranding ? '<div style="text-align:right;padding:2px 8px;"><span style="font-size:9px;color:#bbb;">Ad by LocalAdNetwork</span></div>' : ''}
</div>`;
    }).join('');

    const fallbackHtml = `<div style="padding:20px;text-align:center;color:#999;font-size:12px;background:#f9fafb;border:1px dashed #ddd;border-radius:${widget.borderRadius};">Ad Space</div>`;

    const html = selected.length > 0 ? adCards : fallbackHtml;

    if (format === 'html') {
      return new NextResponse(
        `<div class="lan-widget" style="width:${widget.width};max-width:100%;">${html}</div>`,
        { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' } }
      );
    }

    // Return JavaScript
    const js = `
(function(){
  var c=document.currentScript;
  var d=document.createElement('div');
  d.className='lan-widget';
  d.style.cssText='width:${widget.width};max-width:100%;';
  d.innerHTML=${JSON.stringify(html)};
  c.parentNode.insertBefore(d,c.nextSibling);
  ${widget.rotateInterval && selected.length > 1 ? `
  var ads=${JSON.stringify(selected.map(({ ad, campaign }) => ({
    id: ad.id,
    title: ad.title,
    desc: (ad.description || '').substring(0, 120),
    img: ad.imageUrl,
    cta: ad.ctaText || 'Learn More',
    host: new URL(campaign.landingPageUrl).hostname,
    click: baseUrl + '/api/click?ad_id=' + ad.id + '&pub_id=' + pubId + '&widget_id=' + widgetId,
  })))};
  ` : ''}
})();
`.trim();

    return new NextResponse(js, {
      headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Widget serve error:', error);
    return new NextResponse('/* Error */', { headers: { 'Content-Type': 'application/javascript' } });
  }
}
