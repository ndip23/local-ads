import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publisherSites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const site = await db.query.publisherSites.findFirst({
      where: and(
        eq(publisherSites.id, id),
        eq(publisherSites.userId, session.userId)
      ),
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.verified) {
      return NextResponse.json({ success: true, message: 'Site already verified' });
    }

    // Try to verify the site
    try {
      const response = await fetch(`https://${site.domain}`, {
        headers: {
          'User-Agent': 'LocalAdNetwork-Verification-Bot/1.0',
        },
      });

      const html = await response.text();

      // Check for meta tag verification
      const metaTagPattern = new RegExp(`<meta[^>]*name=["']lan-site-verification["'][^>]*content=["']${site.verificationToken}["'][^>]*>`, 'i');
      const metaTagAltPattern = new RegExp(`<meta[^>]*content=["']${site.verificationToken}["'][^>]*name=["']lan-site-verification["'][^>]*>`, 'i');

      if (metaTagPattern.test(html) || metaTagAltPattern.test(html)) {
        // Verification successful
        await db.update(publisherSites)
          .set({
            verified: true,
            updatedAt: new Date(),
          })
          .where(eq(publisherSites.id, id));

        return NextResponse.json({
          success: true,
          message: 'Site verified successfully!',
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Verification meta tag not found. Please ensure you added the meta tag to your site\'s <head> section.',
        });
      }
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        message: `Could not access your site. Please ensure ${site.domain} is accessible.`,
      });
    }
  } catch (error) {
    console.error('Site verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
