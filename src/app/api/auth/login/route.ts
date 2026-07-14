import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToMongo, User } from '@/db/mongo';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Find user in Mongo
    await connectToMongo();
    const user = await User.findOne({ email: validated.email.toLowerCase() }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await verifyPassword(validated.password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

    // Create token
    const token = await createToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
