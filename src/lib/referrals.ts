import { randomInt } from 'crypto';
import {
  User,
  Wallet,
  ReferralProgramSettings,
  ReferralLevel,
  ReferralEarning,
  Transaction,
  connectToMongo,
} from '@/db/mongo';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_REFERRAL_LEVELS = 10;
const DEFAULT_REFERRAL_CODE_LENGTH = 10;

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
}

export function generateReferralCode(length = DEFAULT_REFERRAL_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += REFERRAL_CODE_ALPHABET[randomInt(0, REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}

export async function createUniqueReferralCode(): Promise<string> {
  await connectToMongo();

  for (let attempts = 0; attempts < 50; attempts++) {
    const code = generateReferralCode();
    const existing = await User.findOne({ referralCode: code }).select('_id').lean();
    if (!existing) return code;
  }

  throw new Error('Failed to generate a unique referral code');
}

export async function ensureUserReferralCode(userId: string): Promise<string> {
  await connectToMongo();
  await ensureReferralFeatureSchema();

  const user = await User.findById(userId).select('referralCode').lean();
  if (!user) throw new Error('User not found');
  if (user.referralCode) return normalizeReferralCode(user.referralCode);

  for (let attempts = 0; attempts < 10; attempts++) {
    const referralCode = await createUniqueReferralCode();
    const updated = await User.findOneAndUpdate(
      { _id: userId, referralCode: { $in: [null, undefined, ''] } },
      { $set: { referralCode, updatedAt: new Date() } },
      { new: true }
    ).lean();
    if (updated?.referralCode) return normalizeReferralCode(updated.referralCode);
  }

  throw new Error('Failed to assign referral code');
}

export async function resetUserReferralCode(userId: string): Promise<string> {
  await connectToMongo();
  await ensureReferralFeatureSchema();

  for (let attempts = 0; attempts < 10; attempts++) {
    const referralCode = await createUniqueReferralCode();
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { referralCode, updatedAt: new Date() } },
      { new: true }
    ).lean();
    if (updated?.referralCode) return normalizeReferralCode(updated.referralCode);
  }

  throw new Error('Failed to reset referral code');
}

export function buildReferralLink(baseUrl: string, referralCode: string): string {
  const safeBaseUrl = baseUrl.replace(/\/$/, '');
  const safeCode = normalizeReferralCode(referralCode);
  return safeCode ? `${safeBaseUrl}/register?ref=${encodeURIComponent(safeCode)}` : '';
}

export async function getReferralProgramSettings() {
  await connectToMongo();
  await ensureReferralFeatureSchema();

  let settings = await ReferralProgramSettings.findOne().lean();
  if (settings) return settings;

  const created = await ReferralProgramSettings.create({
    enabled: true,
    minCommissionableAmount: 0,
    maxLevels: 10,
    cookieDays: 30,
    commissionSource: 'publisher_earnings',
  });

  return created;
}

export async function awardReferralCommissions(input: {
  sourceUserId: string;
  sourceType: 'click' | 'conversion';
  sourceEarning: number;
  referenceId: string;
}) {
  if (!Number.isFinite(input.sourceEarning) || input.sourceEarning <= 0) return;

  try {
    await ensureReferralFeatureSchema();
  } catch (schemaError) {
    console.error('Referral schema setup error:', schemaError);
    return;
  }

  try {
    const settings = await getReferralProgramSettings();
    if (!settings.enabled) return;

    const threshold = Number(settings.minCommissionableAmount || 0);
    if (threshold > 0 && input.sourceEarning < threshold) return;

    const maxLevels = Math.max(1, Math.min(MAX_REFERRAL_LEVELS, Number(settings.maxLevels || MAX_REFERRAL_LEVELS)));

    const configuredLevels = await ReferralLevel.find({ active: true }).sort({ level: 1 }).lean();
    if (configuredLevels.length === 0) return;

    const levelMap = new Map<number, number>(configuredLevels.map((l: any) => [l.level, Number(l.commissionPercent || 0)]));

    let sourceUser = await User.findById(input.sourceUserId).select('referredBy').lean();

    for (let level = 1; level <= maxLevels; level++) {
      const earnerId = sourceUser?.referredBy;
      if (!earnerId) break;

      const commissionPercent = levelMap.get(level) || 0;
      const commissionAmount = (input.sourceEarning * commissionPercent) / 100;

      if (commissionPercent > 0 && commissionAmount > 0) {
        const earning = await ReferralEarning.create({
          earnerId,
          sourceUserId: input.sourceUserId,
          level,
          sourceType: input.sourceType,
          sourceEarning: input.sourceEarning,
          commissionPercent,
          commissionAmount,
          referenceId: input.referenceId,
        });

        const earnerWallet = await Wallet.findOne({ userId: earnerId });
        if (earnerWallet) {
          const walletCredit = Number(commissionAmount.toFixed(2));
          if (walletCredit > 0) {
            const newBalance = (earnerWallet.balance || 0) + walletCredit;
            await Wallet.updateOne({ _id: earnerWallet._id }, { $set: { balance: newBalance, totalEarnings: (earnerWallet.totalEarnings || 0) + walletCredit, updatedAt: new Date() } });

            await Transaction.create({
              walletId: earnerWallet._id,
              userId: earnerId,
              type: 'adjustment',
              amount: walletCredit,
              balanceBefore: earnerWallet.balance,
              balanceAfter: newBalance,
              status: 'completed',
              description: `Level ${level} referral commission from ${input.sourceType}`,
              referenceId: earning._id,
              referenceType: 'referral_earning',
              metadata: {
                sourceUserId: input.sourceUserId,
                sourceType: input.sourceType,
                originalReferenceId: input.referenceId,
                rawCommissionAmount: commissionAmount,
              },
            });
          }
        }
      }

      sourceUser = await User.findById(String(earnerId)).select('referredBy').lean();
    }
  } catch (commissionError) {
    console.error('Referral commission award error:', commissionError);
  }
}
