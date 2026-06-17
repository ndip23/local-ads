import { NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

const DEFAULT_MAX_IMAGE_SIZE_MB = 5;

function getMaxImageSizeBytes() {
  const configured = Number(process.env.MAX_CAMPAIGN_IMAGE_SIZE_MB || DEFAULT_MAX_IMAGE_SIZE_MB);
  const maxMb = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_IMAGE_SIZE_MB;
  return Math.floor(maxMb * 1024 * 1024);
}

export async function GET() {
  const session = await getSession();
  if (!session || !requireRole(session, ['advertiser', 'admin'])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    cloudName,
    apiKey,
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'local-ads/campaign-images',
    maxImageSizeBytes: getMaxImageSizeBytes(),
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  });
}
