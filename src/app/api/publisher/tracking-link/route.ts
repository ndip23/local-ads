import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { ads, campaigns } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const trackingLinkSchema = z.object({
  adId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = trackingLinkSchema.parse(body);

    // Verify ad exists and campaign is active
    const ad = await db.query.ads.findFirst({
      where: and(eq(ads.id, validated.adId), eq(ads.status, 'approved')),
      with: {
        campaign: true,
      },
    });

    if (!ad || !ad.campaign || ad.campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Ad not found or campaign not active' },
        { status: 404 }
      );
    }

    // Generate tracking link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/api/click?ad_id=${validated.adId}&pub_id=${session.userId}`;

    // Generate embed code for video
    const embedCode = ad.videoUrl 
      ? `<a href="${trackingUrl}" target="_blank" rel="noopener">
  <video width="640" height="360" controls>
    <source src="${ad.videoUrl}" type="video/mp4">
  </video>
</a>`
      : null;

    // Generate HTML banner
    const bannerCode = `<a href="${trackingUrl}" target="_blank" rel="noopener">
  ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}" style="max-width:100%;">` : ''}
  <div style="padding:10px;background:#f0f0f0;">
    <h3>${ad.title}</h3>
    <p>${ad.description || ''}</p>
    <button style="background:#007bff;color:white;padding:10px 20px;border:none;cursor:pointer;">
      ${ad.ctaText || 'Learn More'}
    </button>
  </div>
</a>`;

    return NextResponse.json({
      success: true,
      trackingUrl,
      embedCode,
      bannerCode,
      ad: {
        id: ad.id,
        title: ad.title,
        videoUrl: ad.videoUrl,
        imageUrl: ad.imageUrl,
      },
      campaign: {
        id: ad.campaign.id,
        title: ad.campaign.title,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Generate tracking link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tracking link' },
      { status: 500 }
    );
  }
}
