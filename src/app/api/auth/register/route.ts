import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users, wallets, advertiserProfiles, publisherProfiles, publisherSites } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { createUniqueReferralCode, normalizeReferralCode } from '@/lib/referrals';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

function cleanOptionalString(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function cleanSocialLinks(socialMedia?: Record<string, string>): Record<string, string> | undefined {
  if (!socialMedia) return undefined;

  const cleaned = Object.entries(socialMedia).reduce<Record<string, string>>((acc, [platform, url]) => {
    const safePlatform = platform.trim();
    const safeUrl = url.trim();
    if (safePlatform && safeUrl) {
      acc[safePlatform] = safeUrl;
    }
    return acc;
  }, {});

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function normalizeDomain(input?: string | null): string | undefined {
  const value = cleanOptionalString(input);
  if (!value) return undefined;

  try {
    const url = new URL(value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return value
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .trim()
      .toLowerCase()
      .replace(/^www\./, '') || undefined;
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['advertiser', 'publisher']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  referralCode: z.string().optional(), // who referred them
  // Advertiser fields
  companyName: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  // Publisher fields
  blogUrl: z.string().optional(),
  socialMedia: z.record(z.string(), z.string()).optional(),
  niches: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureReferralFeatureSchema();

    const body = await request.json();
    const validated = registerSchema.parse(body);

    const advertiserWebsite = cleanOptionalString(validated.website);
    const publisherWebsite = cleanOptionalString(validated.blogUrl);
    const publisherSocialLinks = cleanSocialLinks(validated.socialMedia);

    if (validated.role === 'advertiser' && !advertiserWebsite) {
      return NextResponse.json(
        { error: 'Company website is required for advertiser accounts' },
        { status: 400 }
      );
    }

    if (validated.role === 'publisher' && !publisherWebsite && !publisherSocialLinks) {
      return NextResponse.json(
        { error: 'Please submit at least one website or social media link for publisher verification' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase()),
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Find referrer if referral code provided
    let referredById: string | null = null;
    if (validated.referralCode) {
      const referrer = await db.query.users.findFirst({
        where: eq(users.referralCode, normalizeReferralCode(validated.referralCode)),
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Generate unique referral code for every user so any user can invite others.
    const referralCode = await createUniqueReferralCode();

    const passwordHash = await hashPassword(validated.password);

    const [user] = await db.insert(users).values({
      email: validated.email.toLowerCase(),
      passwordHash,
      role: validated.role,
      firstName: cleanOptionalString(validated.firstName),
      lastName: cleanOptionalString(validated.lastName),
      status: 'pending',
      referralCode,
      referredBy: referredById,
    }).returning();

    // Create wallet
    await db.insert(wallets).values({ userId: user.id, balance: '0.00' });

    // Create role-specific profile
    if (validated.role === 'advertiser') {
      await db.insert(advertiserProfiles).values({
        userId: user.id,
        companyName: cleanOptionalString(validated.companyName) || null,
        website: advertiserWebsite || null,
        industry: cleanOptionalString(validated.industry) || null,
        country: cleanOptionalString(validated.country) || null,
      });
    } else {
      await db.insert(publisherProfiles).values({
        userId: user.id,
        websiteUrl: publisherWebsite || null,
        socialMedia: publisherSocialLinks || null,
        niches: validated.niches || [],
      });

      // Store the submitted website as a pending publisher site so admin can review it before approval.
      const domain = normalizeDomain(publisherWebsite);
      if (domain) {
        const existingSite = await db.query.publisherSites.findFirst({
          where: eq(publisherSites.domain, domain),
        });

        if (!existingSite) {
          const verificationToken = `lan-verify-${uuidv4().replace(/-/g, '').substring(0, 16)}`;

          await db.insert(publisherSites).values({
            userId: user.id,
            domain,
            name: domain,
            verificationToken,
            verificationMethod: 'meta_tag',
            active: false,
          });
        }
      }
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, status: user.status, firstName: user.firstName, lastName: user.lastName, referralCode },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
