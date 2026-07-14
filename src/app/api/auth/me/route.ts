import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureUserReferralCode } from '@/lib/referrals';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let referralCode = (user as any).referralCode || '';
    if (!referralCode) {
      try {
        referralCode = await ensureUserReferralCode((user as any).id);
      } catch (referralError) {
        console.error('Referral code auto-generation error:', referralError);
      }
    }

    return NextResponse.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
        status: (user as any).status,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        referralCode,
        wallet: (user as any).wallet ? {
          balance: (user as any).wallet.balance,
          pendingBalance: (user as any).wallet.pendingBalance,
          totalEarnings: (user as any).wallet.totalEarnings,
          totalSpent: (user as any).wallet.totalSpent,
        } : null,
        profile: (user as any).role === 'advertiser'
          ? (user as any).advertiserProfile
          : (user as any).publisherProfile,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
