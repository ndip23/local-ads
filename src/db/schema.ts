import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  boolean,
  uuid,
  pgEnum,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'advertiser', 'publisher']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'active', 'suspended', 'banned']);
export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft', 'pending_approval', 'active', 'paused', 'budget_finished', 'rejected', 'completed'
]);
export const adStatusEnum = pgEnum('ad_status', ['pending', 'approved', 'rejected', 'paused']);
export const clickStatusEnum = pgEnum('click_status', ['valid', 'fraud', 'pending']);
export const conversionTypeEnum = pgEnum('conversion_type', ['lead', 'signup', 'purchase', 'download', 'custom']);
export const dealStatusEnum = pgEnum('deal_status', ['pending', 'closed', 'cancelled']);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'deposit', 'withdrawal', 'click_earning', 'click_spend', 'conversion_earning', 'conversion_spend', 'refund', 'adjustment'
]);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected', 'completed']);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'under_review', 'resolved', 'rejected', 'closed']);
export const disputePriorityEnum = pgEnum('dispute_priority', ['low', 'medium', 'high', 'urgent']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'campaign_approved', 'campaign_rejected', 'budget_low', 'withdrawal_status', 
  'fraud_alert', 'account_suspended', 'new_conversion', 'payment_received', 'system'
]);

export const moduleKeyEnum = pgEnum('module_key', [
  'ad_trust', 'performance_lab', 'geo_zones', 'targeting', 'disputes', 'approvals',
  'wallet_operations', 'publisher_metrics', 'automation_rules', 'notifications'
]);
export const moduleStatusEnum = pgEnum('module_status', ['active', 'inactive', 'maintenance']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected', 'cancelled']);
export const trustSignalSeverityEnum = pgEnum('trust_signal_severity', ['low', 'medium', 'high', 'critical']);
export const trustSignalStatusEnum = pgEnum('trust_signal_status', ['open', 'reviewing', 'cleared', 'actioned', 'dismissed']);
export const targetingRuleTypeEnum = pgEnum('targeting_rule_type', ['niche', 'country', 'device', 'browser', 'audience', 'placement', 'geo_zone']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('publisher'),
  status: userStatusEnum('status').notNull().default('pending'),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false),
  // Referral system
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  referredBy: uuid('referred_by').references((): any => users.id),
  referralLevel: integer('referral_level').default(0), // 0 = direct, depth from root
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role),
  index('users_referral_code_idx').on(table.referralCode),
  index('users_referred_by_idx').on(table.referredBy),
]);

// Advertiser profiles
export const advertiserProfiles = pgTable('advertiser_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  companyName: varchar('company_name', { length: 255 }),
  website: text('website'),
  industry: varchar('industry', { length: 100 }),
  country: varchar('country', { length: 100 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  taxId: varchar('tax_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Publisher profiles
export const publisherProfiles = pgTable('publisher_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  websiteUrl: text('website_url'),
  socialMedia: jsonb('social_media').$type<Record<string, string>>(),
  niches: jsonb('niches').$type<string[]>().default([]),
  country: varchar('country', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentDetails: jsonb('payment_details').$type<Record<string, string>>(),
  minPayout: decimal('min_payout', { precision: 10, scale: 2 }).default('10.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  advertiserId: uuid('advertiser_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  landingPageUrl: text('landing_page_url').notNull(),
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }).notNull(),
  dailyBudget: decimal('daily_budget', { precision: 12, scale: 2 }).notNull(),
  spentBudget: decimal('spent_budget', { precision: 12, scale: 2 }).default('0.00'),
  todaySpent: decimal('today_spent', { precision: 12, scale: 2 }).default('0.00'),
  status: campaignStatusEnum('status').notNull().default('draft'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  niches: jsonb('niches').$type<string[]>().default([]),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('campaigns_advertiser_idx').on(table.advertiserId),
  index('campaigns_status_idx').on(table.status),
]);

// Ads
export const ads = pgTable('ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  ctaText: varchar('cta_text', { length: 100 }).default('Learn More'),
  status: adStatusEnum('status').notNull().default('pending'),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ads_campaign_idx').on(table.campaignId),
  index('ads_status_idx').on(table.status),
]);

// Ad targeting (countries)
export const adTargeting = pgTable('ad_targeting', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  cpc: decimal('cpc', { precision: 10, scale: 4 }).notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ad_targeting_campaign_idx').on(table.campaignId),
  uniqueIndex('ad_targeting_campaign_country_idx').on(table.campaignId, table.country),
]);

// Country rates (global CPC settings by admin)
export const countryRates = pgTable('country_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  countryCode: varchar('country_code', { length: 10 }).notNull().unique(),
  countryName: varchar('country_name', { length: 100 }).notNull(),
  defaultCpc: decimal('default_cpc', { precision: 10, scale: 4 }).notNull().default('0.05'),
  publisherShare: decimal('publisher_share', { precision: 5, scale: 2 }).notNull().default('80.00'),
  platformShare: decimal('platform_share', { precision: 5, scale: 2 }).notNull().default('20.00'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('country_rates_code_idx').on(table.countryCode),
]);

// Clicks tracking
export const clicks = pgTable('clicks', {
  id: uuid('id').defaultRandom().primaryKey(),
  adId: uuid('ad_id').references(() => ads.id, { onDelete: 'cascade' }).notNull(),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  country: varchar('country', { length: 100 }),
  countryCode: varchar('country_code', { length: 10 }),
  device: varchar('device', { length: 50 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  userAgent: text('user_agent'),
  referer: text('referer'),
  status: clickStatusEnum('status').notNull().default('pending'),
  cpc: decimal('cpc', { precision: 10, scale: 4 }),
  publisherEarning: decimal('publisher_earning', { precision: 10, scale: 4 }),
  platformEarning: decimal('platform_earning', { precision: 10, scale: 4 }),
  fraudReason: text('fraud_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('clicks_ad_idx').on(table.adId),
  index('clicks_publisher_idx').on(table.publisherId),
  index('clicks_campaign_idx').on(table.campaignId),
  index('clicks_ip_idx').on(table.ipAddress),
  index('clicks_created_idx').on(table.createdAt),
  index('clicks_status_idx').on(table.status),
]);

// Conversions
export const conversions = pgTable('conversions', {
  id: uuid('id').defaultRandom().primaryKey(),
  clickId: uuid('click_id').references(() => clicks.id, { onDelete: 'cascade' }).notNull(),
  adId: uuid('ad_id').references(() => ads.id, { onDelete: 'cascade' }).notNull(),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  type: conversionTypeEnum('type').notNull().default('lead'),
  value: decimal('value', { precision: 12, scale: 2 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  publisherEarning: decimal('publisher_earning', { precision: 10, scale: 4 }),
  platformEarning: decimal('platform_earning', { precision: 10, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('conversions_click_idx').on(table.clickId),
  index('conversions_campaign_idx').on(table.campaignId),
  index('conversions_publisher_idx').on(table.publisherId),
]);

// Deals (closed conversions)
export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversionId: uuid('conversion_id').references(() => conversions.id, { onDelete: 'cascade' }).notNull(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: dealStatusEnum('status').notNull().default('pending'),
  dealValue: decimal('deal_value', { precision: 12, scale: 2 }),
  commission: decimal('commission', { precision: 12, scale: 2 }),
  notes: text('notes'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('deals_conversion_idx').on(table.conversionId),
  index('deals_campaign_idx').on(table.campaignId),
  index('deals_publisher_idx').on(table.publisherId),
]);

// Wallets
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  pendingBalance: decimal('pending_balance', { precision: 12, scale: 2 }).default('0.00'),
  totalEarnings: decimal('total_earnings', { precision: 12, scale: 2 }).default('0.00'),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0.00'),
  totalWithdrawn: decimal('total_withdrawn', { precision: 12, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('wallets_user_idx').on(table.userId),
]);

// Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal('balance_before', { precision: 12, scale: 2 }),
  balanceAfter: decimal('balance_after', { precision: 12, scale: 2 }),
  status: transactionStatusEnum('status').notNull().default('pending'),
  description: text('description'),
  referenceId: uuid('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('transactions_wallet_idx').on(table.walletId),
  index('transactions_user_idx').on(table.userId),
  index('transactions_type_idx').on(table.type),
  index('transactions_created_idx').on(table.createdAt),
]);

// Withdrawals
export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  fee: decimal('fee', { precision: 12, scale: 2 }).default('0.00'),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }),
  status: withdrawalStatusEnum('status').notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentDetails: jsonb('payment_details').$type<Record<string, string>>(),
  processedBy: uuid('processed_by').references(() => users.id),
  processedAt: timestamp('processed_at'),
  rejectionReason: text('rejection_reason'),
  transactionRef: varchar('transaction_ref', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('withdrawals_user_idx').on(table.userId),
  index('withdrawals_status_idx').on(table.status),
]);

// Disputes and advertiser/publisher support cases
export const disputes = pgTable('disputes', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeNumber: varchar('dispute_number', { length: 40 }).notNull().unique(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  relatedType: varchar('related_type', { length: 50 }).default('general'),
  relatedId: uuid('related_id'),
  subject: varchar('subject', { length: 255 }).notNull(),
  category: varchar('category', { length: 80 }).notNull().default('general'),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }),
  status: disputeStatusEnum('status').notNull().default('open'),
  priority: disputePriorityEnum('priority').notNull().default('medium'),
  resolution: text('resolution'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('disputes_number_idx').on(table.disputeNumber),
  index('disputes_created_by_idx').on(table.createdBy),
  index('disputes_status_idx').on(table.status),
  index('disputes_priority_idx').on(table.priority),
  index('disputes_created_at_idx').on(table.createdAt),
]);


// ============================================
// DASHBOARD MODULE DATABASE LAYER
// ============================================

// Registry/configuration for dashboard feature modules.
export const moduleFeatureSettings = pgTable('module_feature_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleKey: moduleKeyEnum('module_key').notNull().unique(),
  label: varchar('label', { length: 100 }).notNull(),
  description: text('description'),
  allowedRoles: jsonb('allowed_roles').$type<Array<'admin' | 'advertiser' | 'publisher'>>().default([]),
  status: moduleStatusEnum('status').notNull().default('active'),
  displayOrder: integer('display_order').default(0),
  config: jsonb('config').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('module_feature_settings_key_idx').on(table.moduleKey),
  index('module_feature_settings_status_idx').on(table.status),
]);

// Generic audit log for every module action.
export const moduleActivityLogs = pgTable('module_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleKey: moduleKeyEnum('module_key').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  entityType: varchar('entity_type', { length: 80 }),
  entityId: uuid('entity_id'),
  action: varchar('action', { length: 120 }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('module_activity_logs_module_idx').on(table.moduleKey),
  index('module_activity_logs_user_idx').on(table.userId),
  index('module_activity_logs_entity_idx').on(table.entityType, table.entityId),
  index('module_activity_logs_created_idx').on(table.createdAt),
]);

// Admin approval workflow across campaigns, ads, publisher sites and user checks.
export const approvalRequests = pgTable('approval_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  approvalNumber: varchar('approval_number', { length: 40 }).notNull().unique(),
  moduleKey: moduleKeyEnum('module_key').notNull().default('approvals'),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: uuid('entity_id'),
  requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  notes: text('notes'),
  status: approvalStatusEnum('status').notNull().default('pending'),
  decisionReason: text('decision_reason'),
  decidedBy: uuid('decided_by').references(() => users.id, { onDelete: 'set null' }),
  decidedAt: timestamp('decided_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('approval_requests_number_idx').on(table.approvalNumber),
  index('approval_requests_status_idx').on(table.status),
  index('approval_requests_entity_idx').on(table.entityType, table.entityId),
  index('approval_requests_requested_by_idx').on(table.requestedBy),
]);

// Threaded messages/evidence attached to dispute cases.
export const disputeMessages = pgTable('dispute_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').references(() => disputes.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
  message: text('message').notNull(),
  attachments: jsonb('attachments').$type<Array<{ name: string; url: string; type?: string }>>().default([]),
  internalNote: boolean('internal_note').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('dispute_messages_dispute_idx').on(table.disputeId),
  index('dispute_messages_sender_idx').on(table.senderId),
  index('dispute_messages_created_idx').on(table.createdAt),
]);

// Trust signals used by Ad Trust and admin quality review.
export const adTrustSignals = pgTable('ad_trust_signals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  adId: uuid('ad_id').references(() => ads.id, { onDelete: 'cascade' }),
  clickId: uuid('click_id').references(() => clicks.id, { onDelete: 'set null' }),
  signalType: varchar('signal_type', { length: 100 }).notNull(),
  severity: trustSignalSeverityEnum('severity').notNull().default('medium'),
  status: trustSignalStatusEnum('status').notNull().default('open'),
  score: integer('score').default(0),
  evidence: jsonb('evidence').$type<Record<string, unknown>>().default({}),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ad_trust_signals_user_idx').on(table.userId),
  index('ad_trust_signals_campaign_idx').on(table.campaignId),
  index('ad_trust_signals_status_idx').on(table.status),
  index('ad_trust_signals_severity_idx').on(table.severity),
]);

// Performance Lab stores time-boxed campaign performance snapshots.
export const performanceSnapshots = pgTable('performance_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  spend: decimal('spend', { precision: 12, scale: 2 }).default('0.00'),
  revenue: decimal('revenue', { precision: 12, scale: 2 }).default('0.00'),
  ctr: decimal('ctr', { precision: 8, scale: 4 }).default('0.0000'),
  conversionRate: decimal('conversion_rate', { precision: 8, scale: 4 }).default('0.0000'),
  cpc: decimal('cpc', { precision: 10, scale: 4 }).default('0.0000'),
  roi: decimal('roi', { precision: 10, scale: 4 }).default('0.0000'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('performance_snapshots_campaign_idx').on(table.campaignId),
  index('performance_snapshots_user_idx').on(table.userId),
  index('performance_snapshots_period_idx').on(table.periodStart, table.periodEnd),
]);

// Geo Zones provide grouped country rules beyond basic country rates.
export const geoZones = pgTable('geo_zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 40 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  countryCodes: jsonb('country_codes').$type<string[]>().default([]),
  defaultCpc: decimal('default_cpc', { precision: 10, scale: 4 }).default('0.0500'),
  publisherShare: decimal('publisher_share', { precision: 5, scale: 2 }).default('80.00'),
  platformShare: decimal('platform_share', { precision: 5, scale: 2 }).default('20.00'),
  active: boolean('active').default(true),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('geo_zones_code_idx').on(table.code),
  index('geo_zones_active_idx').on(table.active),
]);

// Campaign-specific geo rules.
export const campaignGeoRules = pgTable('campaign_geo_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  zoneId: uuid('zone_id').references(() => geoZones.id, { onDelete: 'set null' }),
  countryCode: varchar('country_code', { length: 10 }),
  bidAdjustment: decimal('bid_adjustment', { precision: 6, scale: 2 }).default('0.00'),
  dailyBudgetCap: decimal('daily_budget_cap', { precision: 12, scale: 2 }),
  active: boolean('active').default(true),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('campaign_geo_rules_campaign_idx').on(table.campaignId),
  index('campaign_geo_rules_zone_idx').on(table.zoneId),
  index('campaign_geo_rules_country_idx').on(table.countryCode),
]);

// Reusable targeting segments for advertisers and publishers.
export const targetingSegments = pgTable('targeting_segments', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  segmentType: varchar('segment_type', { length: 80 }).notNull().default('custom'),
  niches: jsonb('niches').$type<string[]>().default([]),
  countries: jsonb('countries').$type<string[]>().default([]),
  devices: jsonb('devices').$type<string[]>().default([]),
  browsers: jsonb('browsers').$type<string[]>().default([]),
  rules: jsonb('rules').$type<Record<string, unknown>>().default({}),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('targeting_segments_owner_idx').on(table.ownerId),
  index('targeting_segments_type_idx').on(table.segmentType),
  index('targeting_segments_active_idx').on(table.active),
]);

// Campaign-targeting linkage so targeting is a data feature, not a static page.
export const campaignTargetingRules = pgTable('campaign_targeting_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  segmentId: uuid('segment_id').references(() => targetingSegments.id, { onDelete: 'set null' }),
  ruleType: targetingRuleTypeEnum('rule_type').notNull(),
  include: boolean('include').default(true),
  weight: integer('weight').default(100),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('campaign_targeting_rules_campaign_idx').on(table.campaignId),
  index('campaign_targeting_rules_segment_idx').on(table.segmentId),
  index('campaign_targeting_rules_type_idx').on(table.ruleType),
]);

// Fraud flags
export const fraudFlags = pgTable('fraud_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  clickId: uuid('click_id').references(() => clicks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  reason: text('reason').notNull(),
  severity: varchar('severity', { length: 20 }).default('medium'),
  resolved: boolean('resolved').default(false),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('fraud_flags_click_idx').on(table.clickId),
  index('fraud_flags_user_idx').on(table.userId),
  index('fraud_flags_ip_idx').on(table.ipAddress),
]);

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('notifications_user_idx').on(table.userId),
  index('notifications_read_idx').on(table.read),
]);

// Pixels (for conversion tracking)
export const pixels = pgTable('pixels', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  advertiserId: uuid('advertiser_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  pixelCode: text('pixel_code').notNull(),
  conversionType: conversionTypeEnum('conversion_type').default('lead'),
  conversionValue: decimal('conversion_value', { precision: 12, scale: 2 }),
  active: boolean('active').default(true),
  fires: integer('fires').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('pixels_campaign_idx').on(table.campaignId),
  index('pixels_advertiser_idx').on(table.advertiserId),
]);

// Campaign logs (audit trail)
export const campaignLogs = pgTable('campaign_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  oldValue: jsonb('old_value').$type<Record<string, unknown>>(),
  newValue: jsonb('new_value').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('campaign_logs_campaign_idx').on(table.campaignId),
]);

// Sessions for tracking click sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sessions_token_idx').on(table.token),
  index('sessions_user_idx').on(table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  advertiserProfile: one(advertiserProfiles, {
    fields: [users.id],
    references: [advertiserProfiles.userId],
  }),
  publisherProfile: one(publisherProfiles, {
    fields: [users.id],
    references: [publisherProfiles.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  campaigns: many(campaigns),
  clicks: many(clicks),
  notifications: many(notifications),
  transactions: many(transactions),
  createdDisputes: many(disputes, { relationName: 'disputeCreator' }),
  assignedDisputes: many(disputes, { relationName: 'disputeAssignee' }),
  moduleActivityLogs: many(moduleActivityLogs),
  approvalRequests: many(approvalRequests, { relationName: 'approvalRequester' }),
  assignedApprovalRequests: many(approvalRequests, { relationName: 'approvalAssignee' }),
  referralClicks: many(referralClicks),
  disputeMessages: many(disputeMessages),
  adTrustSignals: many(adTrustSignals, { relationName: 'trustSignalOwner' }),
  performanceSnapshots: many(performanceSnapshots),
  targetingSegments: many(targetingSegments),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [campaigns.advertiserId],
    references: [users.id],
  }),
  ads: many(ads),
  targeting: many(adTargeting),
  clicks: many(clicks),
  conversions: many(conversions),
  pixels: many(pixels),
  adTrustSignals: many(adTrustSignals),
  performanceSnapshots: many(performanceSnapshots),
  geoRules: many(campaignGeoRules),
  targetingRules: many(campaignTargetingRules),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [ads.campaignId],
    references: [campaigns.id],
  }),
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one, many }) => ({
  ad: one(ads, {
    fields: [clicks.adId],
    references: [ads.id],
  }),
  publisher: one(users, {
    fields: [clicks.publisherId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [clicks.campaignId],
    references: [campaigns.id],
  }),
  conversions: many(conversions),
}));

export const conversionsRelations = relations(conversions, ({ one }) => ({
  click: one(clicks, {
    fields: [conversions.clickId],
    references: [clicks.id],
  }),
  campaign: one(campaigns, {
    fields: [conversions.campaignId],
    references: [campaigns.id],
  }),
  publisher: one(users, {
    fields: [conversions.publisherId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  creator: one(users, {
    fields: [disputes.createdBy],
    references: [users.id],
    relationName: 'disputeCreator',
  }),
  assignee: one(users, {
    fields: [disputes.assignedTo],
    references: [users.id],
    relationName: 'disputeAssignee',
  }),
  messages: many(disputeMessages),
}));


export const moduleFeatureSettingsRelations = relations(moduleFeatureSettings, ({}) => ({}));

export const moduleActivityLogsRelations = relations(moduleActivityLogs, ({ one }) => ({
  user: one(users, { fields: [moduleActivityLogs.userId], references: [users.id] }),
}));

export const approvalRequestsRelations = relations(approvalRequests, ({ one }) => ({
  requester: one(users, { fields: [approvalRequests.requestedBy], references: [users.id], relationName: 'approvalRequester' }),
  assignee: one(users, { fields: [approvalRequests.assignedTo], references: [users.id], relationName: 'approvalAssignee' }),
  decider: one(users, { fields: [approvalRequests.decidedBy], references: [users.id], relationName: 'approvalDecider' }),
}));

export const disputeMessagesRelations = relations(disputeMessages, ({ one }) => ({
  dispute: one(disputes, { fields: [disputeMessages.disputeId], references: [disputes.id] }),
  sender: one(users, { fields: [disputeMessages.senderId], references: [users.id] }),
}));

export const adTrustSignalsRelations = relations(adTrustSignals, ({ one }) => ({
  user: one(users, { fields: [adTrustSignals.userId], references: [users.id], relationName: 'trustSignalOwner' }),
  campaign: one(campaigns, { fields: [adTrustSignals.campaignId], references: [campaigns.id] }),
  ad: one(ads, { fields: [adTrustSignals.adId], references: [ads.id] }),
  click: one(clicks, { fields: [adTrustSignals.clickId], references: [clicks.id] }),
  reviewer: one(users, { fields: [adTrustSignals.reviewedBy], references: [users.id], relationName: 'trustSignalReviewer' }),
}));

export const performanceSnapshotsRelations = relations(performanceSnapshots, ({ one }) => ({
  campaign: one(campaigns, { fields: [performanceSnapshots.campaignId], references: [campaigns.id] }),
  user: one(users, { fields: [performanceSnapshots.userId], references: [users.id] }),
}));

export const geoZonesRelations = relations(geoZones, ({ many }) => ({
  campaignRules: many(campaignGeoRules),
}));

export const campaignGeoRulesRelations = relations(campaignGeoRules, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignGeoRules.campaignId], references: [campaigns.id] }),
  zone: one(geoZones, { fields: [campaignGeoRules.zoneId], references: [geoZones.id] }),
}));

export const targetingSegmentsRelations = relations(targetingSegments, ({ one, many }) => ({
  owner: one(users, { fields: [targetingSegments.ownerId], references: [users.id] }),
  campaignRules: many(campaignTargetingRules),
}));

export const campaignTargetingRulesRelations = relations(campaignTargetingRules, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignTargetingRules.campaignId], references: [campaigns.id] }),
  segment: one(targetingSegments, { fields: [campaignTargetingRules.segmentId], references: [targetingSegments.id] }),
}));

// ============================================
// ADSENSE & AD UNITS INTEGRATION
// ============================================

// Ad Unit Types Enum
export const adUnitTypeEnum = pgEnum('ad_unit_type', [
  'display', 'in_feed', 'in_article', 'matched_content', 'native', 'video', 'responsive'
]);

// Ad Unit Size Enum
export const adUnitSizeEnum = pgEnum('ad_unit_size', [
  'responsive', '300x250', '336x280', '728x90', '300x600', '320x100', '320x50', '970x250', '970x90', 'custom'
]);

// AdSense Settings for Publishers
export const adsenseSettings = pgTable('adsense_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  publisherId: varchar('publisher_id', { length: 50 }), // ca-pub-XXXXXXXX
  enabled: boolean('enabled').default(false),
  autoAdsEnabled: boolean('auto_ads_enabled').default(false),
  adClientId: varchar('ad_client_id', { length: 100 }),
  verificationCode: text('verification_code'),
  fallbackEnabled: boolean('fallback_enabled').default(true), // Use AdSense when no network ads
  revenueShare: decimal('revenue_share', { precision: 5, scale: 2 }).default('70.00'), // Publisher's AdSense share
  estimatedEarnings: decimal('estimated_earnings', { precision: 12, scale: 2 }).default('0.00'),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('adsense_settings_user_idx').on(table.userId),
]);

// Publisher Ad Units
export const adUnits = pgTable('ad_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: adUnitTypeEnum('type').notNull().default('display'),
  size: adUnitSizeEnum('size').notNull().default('responsive'),
  customWidth: integer('custom_width'),
  customHeight: integer('custom_height'),
  // Styling options
  backgroundColor: varchar('background_color', { length: 20 }).default('#ffffff'),
  borderColor: varchar('border_color', { length: 20 }),
  titleColor: varchar('title_color', { length: 20 }).default('#0000ff'),
  textColor: varchar('text_color', { length: 20 }).default('#000000'),
  urlColor: varchar('url_color', { length: 20 }).default('#008000'),
  // Behavior
  useNetworkAds: boolean('use_network_ads').default(true),
  useAdsense: boolean('use_adsense').default(true),
  adsenseSlotId: varchar('adsense_slot_id', { length: 50 }),
  targetNiches: jsonb('target_niches').$type<string[]>().default([]),
  // Stats
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  earnings: decimal('earnings', { precision: 12, scale: 4 }).default('0.00'),
  ctr: decimal('ctr', { precision: 5, scale: 2 }).default('0.00'),
  rpm: decimal('rpm', { precision: 10, scale: 2 }).default('0.00'),
  // Status
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ad_units_user_idx').on(table.userId),
  index('ad_units_type_idx').on(table.type),
]);

// Ad Unit Impressions (for tracking)
export const adUnitImpressions = pgTable('ad_unit_impressions', {
  id: uuid('id').defaultRandom().primaryKey(),
  adUnitId: uuid('ad_unit_id').references(() => adUnits.id, { onDelete: 'cascade' }).notNull(),
  adId: uuid('ad_id').references(() => ads.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  country: varchar('country', { length: 100 }),
  countryCode: varchar('country_code', { length: 10 }),
  device: varchar('device', { length: 50 }),
  browser: varchar('browser', { length: 50 }),
  pageUrl: text('page_url'),
  adSource: varchar('ad_source', { length: 20 }).default('network'), // 'network' or 'adsense'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ad_unit_impressions_unit_idx').on(table.adUnitId),
  index('ad_unit_impressions_created_idx').on(table.createdAt),
]);

// Publisher Sites (for verification and ad serving)
export const publisherSites = pgTable('publisher_sites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  domain: varchar('domain', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  verified: boolean('verified').default(false),
  verificationMethod: varchar('verification_method', { length: 50 }), // 'dns', 'meta_tag', 'file'
  verificationToken: varchar('verification_token', { length: 100 }),
  category: varchar('category', { length: 100 }),
  monthlyPageviews: integer('monthly_pageviews'),
  adsenseApproved: boolean('adsense_approved').default(false),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('publisher_sites_user_idx').on(table.userId),
  uniqueIndex('publisher_sites_domain_idx').on(table.domain),
]);

// Ad Serving Log (for analytics)
export const adServingLog = pgTable('ad_serving_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  adUnitId: uuid('ad_unit_id').references(() => adUnits.id, { onDelete: 'cascade' }).notNull(),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  adId: uuid('ad_id').references(() => ads.id, { onDelete: 'set null' }),
  adSource: varchar('ad_source', { length: 20 }).notNull(), // 'network', 'adsense', 'fallback'
  reason: varchar('reason', { length: 100 }), // why this ad was served
  revenue: decimal('revenue', { precision: 10, scale: 4 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  country: varchar('country', { length: 100 }),
  pageUrl: text('page_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ad_serving_log_unit_idx').on(table.adUnitId),
  index('ad_serving_log_publisher_idx').on(table.publisherId),
  index('ad_serving_log_created_idx').on(table.createdAt),
]);

// Relations for new tables
export const adsenseSettingsRelations = relations(adsenseSettings, ({ one }) => ({
  user: one(users, {
    fields: [adsenseSettings.userId],
    references: [users.id],
  }),
}));

export const adUnitsRelations = relations(adUnits, ({ one, many }) => ({
  user: one(users, {
    fields: [adUnits.userId],
    references: [users.id],
  }),
  impressions: many(adUnitImpressions),
}));

export const publisherSitesRelations = relations(publisherSites, ({ one }) => ({
  user: one(users, {
    fields: [publisherSites.userId],
    references: [users.id],
  }),
}));

// ============================================
// REFERRAL PROGRAM (10 Levels)
// ============================================

// Referral level configuration (admin-managed)
export const referralLevels = pgTable('referral_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  level: integer('level').notNull().unique(), // 1 to 10
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).notNull(), // % of referral's earnings
  label: varchar('label', { length: 50 }), // e.g. "Direct Referral", "Level 2"
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('referral_levels_level_idx').on(table.level),
]);

// Admin-managed referral programme settings. A single row controls whether
// commissions are enabled, the minimum earning threshold before commission
// is paid, and the maximum depth used when walking the referral tree.
export const referralProgramSettings = pgTable('referral_program_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  enabled: boolean('enabled').default(true).notNull(),
  minCommissionableAmount: decimal('min_commissionable_amount', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  maxLevels: integer('max_levels').default(10).notNull(),
  cookieDays: integer('cookie_days').default(30).notNull(),
  commissionSource: varchar('commission_source', { length: 50 }).default('publisher_earnings').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('referral_program_settings_enabled_idx').on(table.enabled),
]);

// Referral earnings log
export const referralEarnings = pgTable('referral_earnings', {
  id: uuid('id').defaultRandom().primaryKey(),
  earnerId: uuid('earner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // who earns
  sourceUserId: uuid('source_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // who generated the click/earning
  level: integer('level').notNull(), // which referral level (1-10)
  sourceType: varchar('source_type', { length: 20 }).notNull(), // 'click', 'conversion'
  sourceEarning: decimal('source_earning', { precision: 12, scale: 4 }).notNull(), // original earning amount
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 4 }).notNull(), // actual commission
  referenceId: uuid('reference_id'), // click_id or conversion_id
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('referral_earnings_earner_idx').on(table.earnerId),
  index('referral_earnings_source_idx').on(table.sourceUserId),
  index('referral_earnings_created_idx').on(table.createdAt),
]);

// Referral link click tracking
export const referralClicks = pgTable('referral_clicks', {
  id: uuid('id').defaultRandom().primaryKey(),
  referralCode: varchar('referral_code', { length: 20 }).notNull(),
  referrerId: uuid('referrer_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referer: text('referer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('referral_clicks_code_idx').on(table.referralCode),
  index('referral_clicks_referrer_idx').on(table.referrerId),
  index('referral_clicks_created_idx').on(table.createdAt),
]);

// ============================================
// AD DISPLAY WIDGETS (for publisher websites)
// ============================================

export const adWidgetStyleEnum = pgEnum('ad_widget_style', [
  'banner', 'sidebar', 'inline', 'popup', 'sticky_bottom', 'native_feed'
]);

export const adWidgets = pgTable('ad_widgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  style: adWidgetStyleEnum('style').notNull().default('banner'),
  width: varchar('width', { length: 20 }).default('100%'), // '300px', '100%'
  height: varchar('height', { length: 20 }).default('250px'),
  maxAds: integer('max_ads').default(1), // how many ads to show at once
  rotateInterval: integer('rotate_interval').default(30), // seconds between ad rotation
  // Targeting
  targetNiches: jsonb('target_niches').$type<string[]>().default([]),
  targetCountries: jsonb('target_countries').$type<string[]>().default([]),
  // Styling
  backgroundColor: varchar('background_color', { length: 20 }).default('#ffffff'),
  borderRadius: varchar('border_radius', { length: 10 }).default('8px'),
  showBranding: boolean('show_branding').default(true),
  customCss: text('custom_css'),
  // Stats
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  earnings: decimal('earnings', { precision: 12, scale: 4 }).default('0.00'),
  // Status
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ad_widgets_publisher_idx').on(table.publisherId),
]);

// ============================================
// PLATFORM SETTINGS (admin-managed features)
// ============================================

export const platformSettings = pgTable('platform_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'), // general, referral, publisher, advertiser
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('platform_settings_key_idx').on(table.key),
]);

// Relations for new tables
export const referralLevelsRelations = relations(referralLevels, ({}) => ({}));

export const referralEarningsRelations = relations(referralEarnings, ({ one }) => ({
  earner: one(users, { fields: [referralEarnings.earnerId], references: [users.id], relationName: 'earner' }),
  sourceUser: one(users, { fields: [referralEarnings.sourceUserId], references: [users.id], relationName: 'sourceUser' }),
}));

export const referralClicksRelations = relations(referralClicks, ({ one }) => ({
  referrer: one(users, { fields: [referralClicks.referrerId], references: [users.id] }),
}));

export const adWidgetsRelations = relations(adWidgets, ({ one }) => ({
  publisher: one(users, { fields: [adWidgets.publisherId], references: [users.id] }),
}));
