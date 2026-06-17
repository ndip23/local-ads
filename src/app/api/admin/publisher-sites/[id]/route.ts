import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { notifications, publisherSites, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const updatePublisherSiteSchema = z.object({
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
  adsenseApproved: z.boolean().optional(),
  approvePublisherAccount: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updatePublisherSiteSchema.parse(body);

    const existingSite = await db.query.publisherSites.findFirst({
      where: eq(publisherSites.id, id),
      with: {
        user: true,
      },
    });

    if (!existingSite) {
      return NextResponse.json({ error: 'Publisher site not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof validated.verified === 'boolean') {
      updateData.verified = validated.verified;
      if (validated.verified) updateData.active = true;
    }
    if (typeof validated.active === 'boolean') updateData.active = validated.active;
    if (typeof validated.adsenseApproved === 'boolean') updateData.adsenseApproved = validated.adsenseApproved;

    const [updatedSite] = await db.update(publisherSites)
      .set(updateData)
      .where(eq(publisherSites.id, id))
      .returning();

    let updatedUser = null;

    if (validated.approvePublisherAccount) {
      const [approvedUser] = await db.update(users)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(users.id, existingSite.userId))
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          status: users.status,
        });

      updatedUser = approvedUser;

      await db.insert(notifications).values({
        userId: existingSite.userId,
        type: 'system',
        title: 'Account Approved',
        message: 'Your publisher account has been approved after review of your submitted website or links.',
      });
    }

    return NextResponse.json({
      success: true,
      site: updatedSite,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update publisher site error:', error);
    return NextResponse.json(
      { error: 'Failed to update publisher site' },
      { status: 500 }
    );
  }
}
