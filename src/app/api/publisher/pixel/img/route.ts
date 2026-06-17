import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adUnitImpressions } from '@/db/schema';

// 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pubId = searchParams.get('pub_id');
    const page = searchParams.get('page');
    const ref = searchParams.get('ref');

    if (pubId) {
      // Log the page view / impression
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                 request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';

      // Detect browser/device from user agent
      let browser = 'Unknown';
      let device = 'Desktop';
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      if (userAgent.includes('Mobile')) device = 'Mobile';
      else if (userAgent.includes('Tablet')) device = 'Tablet';

      // We don't have an ad unit id here, so we just log the visit
      // This is a publisher-level page view tracker
      // In production you'd have a separate pageviews table
      // For now we skip db insert to avoid FK constraints
      // and just return the pixel
    }
  } catch (error) {
    console.error('Pixel tracking error:', error);
  }

  // Always return the transparent GIF
  return new NextResponse(TRANSPARENT_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
