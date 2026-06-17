import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pubId = searchParams.get('pub_id') || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  const script = `
(function() {
  'use strict';

  var LAN = window.LAN || {};
  LAN.publisherId = '${pubId}';
  LAN.baseUrl = '${baseUrl}';
  LAN.sessionId = Math.random().toString(36).substring(2, 15);
  LAN.pageLoadTime = Date.now();

  // ---- Page View Tracking ----
  function trackPageView() {
    var img = new Image();
    img.src = LAN.baseUrl + '/api/publisher/pixel/img'
      + '?pub_id=' + encodeURIComponent(LAN.publisherId)
      + '&page=' + encodeURIComponent(window.location.href)
      + '&ref=' + encodeURIComponent(document.referrer)
      + '&title=' + encodeURIComponent(document.title)
      + '&w=' + screen.width
      + '&h=' + screen.height
      + '&sid=' + LAN.sessionId
      + '&t=' + Date.now();
  }

  // ---- Click Tracking ----
  function trackOutboundClick(url) {
    var img = new Image();
    img.src = LAN.baseUrl + '/api/publisher/pixel/img'
      + '?pub_id=' + encodeURIComponent(LAN.publisherId)
      + '&event=click'
      + '&url=' + encodeURIComponent(url)
      + '&page=' + encodeURIComponent(window.location.href)
      + '&sid=' + LAN.sessionId
      + '&t=' + Date.now();
  }

  // ---- Time on Page ----
  function trackTimeOnPage() {
    var timeSpent = Math.round((Date.now() - LAN.pageLoadTime) / 1000);
    var img = new Image();
    img.src = LAN.baseUrl + '/api/publisher/pixel/img'
      + '?pub_id=' + encodeURIComponent(LAN.publisherId)
      + '&event=time'
      + '&seconds=' + timeSpent
      + '&page=' + encodeURIComponent(window.location.href)
      + '&sid=' + LAN.sessionId
      + '&t=' + Date.now();
  }

  // ---- Custom Event Tracking ----
  LAN.track = function(eventName, data) {
    var img = new Image();
    var params = '?pub_id=' + encodeURIComponent(LAN.publisherId)
      + '&event=' + encodeURIComponent(eventName)
      + '&page=' + encodeURIComponent(window.location.href)
      + '&sid=' + LAN.sessionId
      + '&t=' + Date.now();
    if (data) params += '&data=' + encodeURIComponent(JSON.stringify(data));
    img.src = LAN.baseUrl + '/api/publisher/pixel/img' + params;
  };

  // ---- Auto-track outbound link clicks ----
  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    if (target && target.href && target.hostname !== window.location.hostname) {
      trackOutboundClick(target.href);
    }
  });

  // ---- Track time on page when user leaves ----
  window.addEventListener('beforeunload', trackTimeOnPage);

  // ---- Track page view on load ----
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  window.LAN = LAN;
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
