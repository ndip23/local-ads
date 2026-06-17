import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { users, notifications, publisherSites } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const updateUserSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'banned']).optional(),
  role: z.enum(['admin', 'advertiser', 'publisher']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        wallet: true,
        advertiserProfile: true,
        publisherProfile: true,
        campaigns: true,
      },
      columns: {
        passwordHash: false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sites = user.role === 'publisher'
      ? await db.query.publisherSites.findMany({
          where: eq(publisherSites.userId, id),
        })
      : [];

    return NextResponse.json({ user: { ...user, publisherSites: sites } });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

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
    const validated = updateUserSchema.parse(body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.status) updateData.status = validated.status;
    if (validated.role) updateData.role = validated.role;

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
      });

    // Notify user of status change
    if (validated.status && validated.status !== existingUser.status) {
      const statusMessages: Record<string, string> = {
        active: 'Your account has been approved and is now active.',
        suspended: 'Your account has been suspended. Please contact support.',
        banned: 'Your account has been rejected or banned. Please contact support if you believe this was a mistake.',
      };

      if (statusMessages[validated.status]) {
        await db.insert(notifications).values({
          userId: id,
          type: validated.status === 'active' ? 'system' : 'account_suspended',
          title: `Account ${validated.status.charAt(0).toUpperCase() + validated.status.slice(1)}`,
          message: statusMessages[validated.status],
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
