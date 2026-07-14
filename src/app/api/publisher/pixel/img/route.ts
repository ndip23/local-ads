import { NextRequest, NextResponse } from 'next/server';

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
      // In production you'd have a separate pageviews collection
      // For now we skip db insert and just return the pixel
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
