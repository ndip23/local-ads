import { randomInt } from 'crypto';
import { eq, sql, asc } from 'drizzle-orm';
import { db } from '@/db';
import { users, wallets, transactions, referralEarnings, referralLevels, referralProgramSettings } from '@/db/schema';
import { ensureReferralFeatureSchema } from '@/lib/feature-schema';

const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_REFERRAL_LEVELS = 10;
const DEFAULT_REFERRAL_CODE_LENGTH = 10;

type PostgresError = Error & { code?: string };

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as PostgresError).code === '23505');
}

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
  await ensureReferralFeatureSchema();

  for (let attempts = 0; attempts < 50; attempts++) {
    const code = generateReferralCode();
    const existing = await db.query.users.findFirst({
      where: eq(users.referralCode, code),
      columns: { id: true },
    });

    if (!existing) return code;
  }

  throw new Error('Failed to generate a unique referral code');
}

export async function ensureUserReferralCode(userId: string): Promise<string> {
  await ensureReferralFeatureSchema();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, referralCode: true },
  });

  if (!user) throw new Error('User not found');
  if (user.referralCode) return normalizeReferralCode(user.referralCode);

  for (let attempts = 0; attempts < 10; attempts++) {
    const referralCode = await createUniqueReferralCode();

    try {
      const [updatedUser] = await db.update(users)
        .set({ referralCode, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ referralCode: users.referralCode });

      if (updatedUser?.referralCode) return normalizeReferralCode(updatedUser.referralCode);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  throw new Error('Failed to assign referral code');
}

export async function resetUserReferralCode(userId: string): Promise<string> {
  await ensureReferralFeatureSchema();

  for (let attempts = 0; attempts < 10; attempts++) {
    const referralCode = await createUniqueReferralCode();

    try {
      const [updatedUser] = await db.update(users)
        .set({ referralCode, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ referralCode: users.referralCode });

      if (updatedUser?.referralCode) return normalizeReferralCode(updatedUser.referralCode);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  throw new Error('Failed to reset referral code');
}

export function buildReferralLink(baseUrl: string, referralCode: string): string {
  const safeBaseUrl = baseUrl.replace(/\/$/, '');
  const safeCode = normalizeReferralCode(referralCode);
  return safeCode ? `${safeBaseUrl}/register?ref=${encodeURIComponent(safeCode)}` : '';
}

export async function getReferralProgramSettings() {
  await ensureReferralFeatureSchema();

  const settings = await db.query.referralProgramSettings.findFirst();
  if (settings) return settings;

  const [created] = await db.insert(referralProgramSettings).values({
    enabled: true,
    minCommissionableAmount: '0.0000',
    maxLevels: 10,
    cookieDays: 30,
    commissionSource: 'publisher_earnings',
  }).returning();

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

    const threshold = Number(settings.minCommissionableAmount || '0');
    if (threshold > 0 && input.sourceEarning < threshold) return;

    const maxLevels = Math.max(1, Math.min(MAX_REFERRAL_LEVELS, Number(settings.maxLevels || MAX_REFERRAL_LEVELS)));

    const configuredLevels = await db.query.referralLevels.findMany({
      where: eq(referralLevels.active, true),
      orderBy: [asc(referralLevels.level)],
    });

    if (configuredLevels.length === 0) return;

    const levelMap = new Map<number, number>(
      configuredLevels.map((level) => [level.level, Number(level.commissionPercent || '0')])
    );

    let sourceUser = await db.query.users.findFirst({
      where: eq(users.id, input.sourceUserId),
      columns: { id: true, referredBy: true },
    });

    for (let level = 1; level <= maxLevels; level++) {
      const earnerId = sourceUser?.referredBy;
      if (!earnerId) break;

      const commissionPercent = levelMap.get(level) || 0;
      const commissionAmount = (input.sourceEarning * commissionPercent) / 100;

      if (commissionPercent > 0 && commissionAmount > 0) {
        const [earning] = await db.insert(referralEarnings).values({
          earnerId,
          sourceUserId: input.sourceUserId,
          level,
          sourceType: input.sourceType,
          sourceEarning: input.sourceEarning.toFixed(4),
          commissionPercent: commissionPercent.toFixed(2),
          commissionAmount: commissionAmount.toFixed(4),
          referenceId: input.referenceId,
        }).returning();

        const earnerWallet = await db.query.wallets.findFirst({
          where: eq(wallets.userId, earnerId),
        });

        if (earnerWallet) {
          const walletCredit = Number(commissionAmount.toFixed(2));

          if (walletCredit > 0) {
            const currentBalance = Number(earnerWallet.balance || '0');
            const newBalance = currentBalance + walletCredit;

            await db.update(wallets)
              .set({
                balance: newBalance.toFixed(2),
                totalEarnings: sql`${wallets.totalEarnings} + ${walletCredit}`,
                updatedAt: new Date(),
              })
              .where(eq(wallets.id, earnerWallet.id));

            await db.insert(transactions).values({
              walletId: earnerWallet.id,
              userId: earnerId,
              type: 'adjustment',
              amount: walletCredit.toFixed(2),
              balanceBefore: earnerWallet.balance,
              balanceAfter: newBalance.toFixed(2),
              status: 'completed',
              description: `Level ${level} referral commission from ${input.sourceType}`,
              referenceId: earning.id,
              referenceType: 'referral_earning',
              metadata: {
                sourceUserId: input.sourceUserId,
                sourceType: input.sourceType,
                originalReferenceId: input.referenceId,
                rawCommissionAmount: commissionAmount.toFixed(4),
              },
            });
          }
        }
      }

      sourceUser = await db.query.users.findFirst({
        where: eq(users.id, earnerId),
        columns: { id: true, referredBy: true },
      });
    }
  } catch (commissionError) {
    console.error('Referral commission award error:', commissionError);
  }
}
