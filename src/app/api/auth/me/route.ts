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

    let referralCode = user.referralCode || '';
    if (!referralCode) {
      try {
        referralCode = await ensureUserReferralCode(user.id);
      } catch (referralError) {
        console.error('Referral code auto-generation error:', referralError);
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode,
        wallet: user.wallet ? {
          balance: user.wallet.balance,
          pendingBalance: user.wallet.pendingBalance,
          totalEarnings: user.wallet.totalEarnings,
          totalSpent: user.wallet.totalSpent,
        } : null,
        profile: user.role === 'advertiser' 
          ? user.advertiserProfile 
          : user.publisherProfile,
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
