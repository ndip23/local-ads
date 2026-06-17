import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSession, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

type SignableValue = string | number | boolean | null | undefined;

function signCloudinaryParams(params: Record<string, SignableValue>, apiSecret: string) {
  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getCloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawParams = (body?.paramsToSign && typeof body.paramsToSign === 'object') ? body.paramsToSign : {};
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'local-ads/campaign-images';

    if (rawParams.folder && rawParams.folder !== folder) {
      return NextResponse.json({ error: 'Invalid Cloudinary folder' }, { status: 400 });
    }

    const blockedKeys = new Set(['file', 'api_key', 'cloud_name', 'resource_type', 'signature']);
    const params: Record<string, SignableValue> = {};

    for (const [key, value] of Object.entries(rawParams)) {
      if (blockedKeys.has(key)) continue;
      if (['string', 'number', 'boolean'].includes(typeof value)) {
        params[key] = value as SignableValue;
      }
    }

    params.folder = folder;
    params.timestamp = params.timestamp || Math.floor(Date.now() / 1000);

    const signature = signCloudinaryParams(params, config.apiSecret);

    return NextResponse.json({ signature, signedParams: params });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json({ error: 'Failed to sign Cloudinary upload' }, { status: 500 });
  }
}
