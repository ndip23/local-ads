import { db } from '@/db';
import { clicks, fraudFlags } from '@/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';

export interface FraudCheckResult {
  isFraud: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
}

// Known bot user agents
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /node-fetch/i,
  /axios/i,
  /postman/i,
  /insomnia/i,
];

// Suspicious user agent patterns
const SUSPICIOUS_UA_PATTERNS = [
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
];

// Known VPN/Proxy detection (simplified)
const SUSPICIOUS_IP_RANGES = [
  // This would typically connect to an IP reputation service
  // For now, we'll just check some basic patterns
];

export async function checkForFraud(
  ipAddress: string,
  userAgent: string,
  publisherId: string,
  adId: string
): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // 1. Check for bot user agents
  if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    reasons.push('Bot user agent detected');
    severity = 'high';
  }

  // 2. Check for suspicious user agents (automation tools)
  if (SUSPICIOUS_UA_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    reasons.push('Automation tool detected');
    severity = 'high';
  }

  // 3. Check for empty or missing user agent
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious user agent');
    severity = 'medium';
  }

  // 4. Check for repeated clicks from same IP in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentClicksFromIp = await db
    .select({ count: count() })
    .from(clicks)
    .where(
      and(
        eq(clicks.ipAddress, ipAddress),
        eq(clicks.adId, adId),
        gte(clicks.createdAt, fiveMinutesAgo)
      )
    );

  if (recentClicksFromIp[0]?.count && recentClicksFromIp[0].count > 0) {
    reasons.push(`Repeated clicks from same IP (${recentClicksFromIp[0].count} clicks)`);
    severity = recentClicksFromIp[0].count > 3 ? 'high' : 'medium';
  }

  // 5. Check for rapid clicks from same publisher in last minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const rapidPublisherClicks = await db
    .select({ count: count() })
    .from(clicks)
    .where(
      and(
        eq(clicks.publisherId, publisherId),
        gte(clicks.createdAt, oneMinuteAgo)
      )
    );

  if (rapidPublisherClicks[0]?.count && rapidPublisherClicks[0].count > 10) {
    reasons.push('Rapid click burst detected from publisher');
    severity = 'high';
  }

  // 6. Check for known fraudulent IP patterns
  // In production, this would integrate with IP reputation services
  if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
    // Allow localhost for testing
  }

  // 7. Check for suspicious referer patterns
  // This can be expanded based on known fraud patterns

  return {
    isFraud: reasons.length > 0,
    reasons,
    severity,
  };
}

export async function logFraudFlag(
  clickId: string | null,
  userId: string | null,
  ipAddress: string,
  reasons: string[],
  severity: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(fraudFlags).values({
    clickId,
    userId,
    ipAddress,
    reason: reasons.join('; '),
    severity,
    metadata,
  });
}

export async function getIPClickCount(ipAddress: string, hours = 24): Promise<number> {
  const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
  const result = await db
    .select({ count: count() })
    .from(clicks)
    .where(
      and(
        eq(clicks.ipAddress, ipAddress),
        gte(clicks.createdAt, hoursAgo)
      )
    );
  return result[0]?.count || 0;
}

export async function getPublisherFraudScore(publisherId: string): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const totalClicks = await db
    .select({ count: count() })
    .from(clicks)
    .where(
      and(
        eq(clicks.publisherId, publisherId),
        gte(clicks.createdAt, thirtyDaysAgo)
      )
    );

  const fraudClicks = await db
    .select({ count: count() })
    .from(clicks)
    .where(
      and(
        eq(clicks.publisherId, publisherId),
        eq(clicks.status, 'fraud'),
        gte(clicks.createdAt, thirtyDaysAgo)
      )
    );

  const total = totalClicks[0]?.count || 0;
  const fraud = fraudClicks[0]?.count || 0;

  if (total === 0) return 0;
  return Math.round((fraud / total) * 100);
}
