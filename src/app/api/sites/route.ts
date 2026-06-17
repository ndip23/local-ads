import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { publisherSites } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const createSiteSchema = z.object({
  domain: z.string().min(3).max(255),
  name: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  monthlyPageviews: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sites = await db.query.publisherSites.findMany({
      where: eq(publisherSites.userId, session.userId),
      orderBy: [desc(publisherSites.createdAt)],
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Get sites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['publisher', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSiteSchema.parse(body);

    // Clean domain
    let domain = validated.domain.toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    domain = domain.split('/')[0]; // Remove path

    // Check if domain already exists
    const existing = await db.query.publisherSites.findFirst({
      where: eq(publisherSites.domain, domain),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already registered' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = `lan-verify-${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    const [site] = await db.insert(publisherSites).values({
      userId: session.userId,
      domain,
      name: validated.name || domain,
      category: validated.category,
      monthlyPageviews: validated.monthlyPageviews,
      verificationToken,
      verificationMethod: 'meta_tag',
    }).returning();

    return NextResponse.json({
      success: true,
      site,
      verification: {
        method: 'meta_tag',
        token: verificationToken,
        metaTag: `<meta name="lan-site-verification" content="${verificationToken}">`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create site error:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
