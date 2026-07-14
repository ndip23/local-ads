import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { connectToMongo, User, Wallet, AdvertiserProfile, PublisherProfile } from '@/db/mongo';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'local-ad-network-secret-key-change-in-production');

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'advertiser' | 'publisher';
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  await connectToMongo();
  const user = await User.findById(session.userId).lean();
  if (!user) return null;

  const wallet = await Wallet.findOne({ userId: user._id }).lean();
  const advertiserProfile = await AdvertiserProfile.findOne({ userId: user._id }).lean();
  const publisherProfile = await PublisherProfile.findOne({ userId: user._id }).lean();

  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    status: user.status,
    firstName: user.firstName,
    lastName: user.lastName,
    referralCode: user.referralCode,
    wallet,
    advertiserProfile,
    publisherProfile,
  } as any;
}

export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'advertiser' | 'publisher',
  firstName?: string,
  lastName?: string
) {
  await connectToMongo();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return existing;

  const passwordHash = await hashPassword(password);

  // Simple referral code generator - ensure uniqueness
  async function generateUniqueReferralCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 50; attempt++) {
      let code = '';
      for (let i = 0; i < 10; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
      const found = await User.findOne({ referralCode: code });
      if (!found) return code;
    }
    return null;
  }

  const referralCode = (await generateUniqueReferralCode()) || undefined;

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    firstName,
    lastName,
    status: role === 'admin' ? 'active' : 'pending',
    referralCode,
    emailVerified: role === 'admin',
  });

  await Wallet.create({ userId: user._id, balance: 0 });

  if (role === 'advertiser') {
    await AdvertiserProfile.create({ userId: user._id });
  } else if (role === 'publisher') {
    await PublisherProfile.create({ userId: user._id });
  }

  return user;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export function requireRole(session: JWTPayload | null, roles: string[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}
