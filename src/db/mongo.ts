import mongoose, { Schema, model, models } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

export async function connectToMongo() {
  if (isConnected) return;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(MONGO_URI);
  isConnected = true;
}

// Common timestamp options
const tsOptions = { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } as const;

// User schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'advertiser', 'publisher'], default: 'publisher' },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'banned'], default: 'pending' },
  firstName: String,
  lastName: String,
  avatarUrl: String,
  emailVerified: { type: Boolean, default: false },
  referralCode: { type: String, index: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referralLevel: { type: Number, default: 0 },
  lastLoginAt: Date,
}, tsOptions);

// Wallet
const WalletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
}, tsOptions);

// Advertiser profile
const AdvertiserProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: String,
  website: String,
  industry: String,
  country: String,
  address: String,
  phone: String,
  taxId: String,
}, tsOptions);

// Publisher profile
const PublisherProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  websiteUrl: String,
  socialMedia: { type: Schema.Types.Mixed, default: {} },
  niches: { type: [String], default: [] },
  country: String,
  paymentMethod: String,
  paymentDetails: { type: Schema.Types.Mixed, default: {} },
  minPayout: { type: Number, default: 10.0 },
}, tsOptions);

// Campaigns
const CampaignSchema = new Schema({
  advertiserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  landingPageUrl: String,
  totalBudget: { type: Number, default: 0 },
  dailyBudget: { type: Number, default: 0 },
  spentBudget: { type: Number, default: 0 },
  todaySpent: { type: Number, default: 0 },
  status: { type: String, default: 'draft' },
  startDate: Date,
  endDate: Date,
  niches: { type: [String], default: [] },
  rejectionReason: String,
}, tsOptions);

// Ads
const AdSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: String,
  description: String,
  videoUrl: String,
  imageUrl: String,
  ctaText: { type: String, default: 'Learn More' },
  status: { type: String, default: 'pending' },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
}, tsOptions);

// Ad targeting
const AdTargetingSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  country: String,
  cpc: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, tsOptions);

// Ad Units (publisher placements)
const AdUnitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'display' },
  size: { type: String, default: 'responsive' },
  customWidth: Number,
  customHeight: Number,
  useNetworkAds: { type: Boolean, default: true },
  useAdsense: { type: Boolean, default: false },
  adsenseSlotId: String,
  impressions: { type: Number, default: 0 },
  backgroundColor: { type: String, default: '#fff' },
  titleColor: String,
  textColor: String,
  urlColor: String,
  borderColor: String,
  targetNiches: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, tsOptions);

// Ad unit impressions
const AdUnitImpressionSchema = new Schema({
  adUnitId: { type: Schema.Types.ObjectId, ref: 'AdUnit', required: true },
  adId: { type: Schema.Types.ObjectId, ref: 'Ad' },
  ipAddress: String,
  country: String,
  countryCode: String,
  device: String,
  browser: String,
  pageUrl: String,
  adSource: { type: String, default: 'network' },
}, tsOptions);

// Ad serving log
const AdServingLogSchema = new Schema({
  adUnitId: { type: Schema.Types.ObjectId, ref: 'AdUnit', required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adId: { type: Schema.Types.ObjectId, ref: 'Ad' },
  adSource: String,
  reason: String,
  revenue: { type: Number },
  ipAddress: String,
  country: String,
  pageUrl: String,
}, tsOptions);

// Adsense settings
const AdsenseSettingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  publisherId: String,
  enabled: { type: Boolean, default: false },
}, tsOptions);

// Campaign targeting rules (niches, country rules, etc.)
const CampaignTargetingRuleSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  ruleType: String,
  include: { type: Boolean, default: true },
  weight: { type: Number, default: 100 },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Pixels (conversion tracking)
const PixelSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  advertiserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  pixelCode: { type: String, required: true, unique: true },
  conversionType: { type: String, default: 'lead' },
  active: { type: Boolean, default: true },
}, tsOptions);

// Country rates
const CountryRateSchema = new Schema({
  countryCode: { type: String, unique: true },
  countryName: String,
  defaultCpc: { type: Number, default: 0.05 },
  publisherShare: { type: Number, default: 80 },
  platformShare: { type: Number, default: 20 },
  active: { type: Boolean, default: true },
}, tsOptions);

// Clicks
const ClickSchema = new Schema({
  adId: { type: Schema.Types.ObjectId, ref: 'Ad', required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  ipAddress: String,
  country: String,
  countryCode: String,
  device: String,
  browser: String,
  os: String,
  userAgent: String,
  referer: String,
  status: { type: String, default: 'pending' },
  cpc: { type: Number },
  publisherEarning: { type: Number },
  platformEarning: { type: Number },
  fraudReason: String,
}, tsOptions);

// Conversions
const ConversionSchema = new Schema({
  clickId: { type: Schema.Types.ObjectId, ref: 'Click', required: true },
  adId: { type: Schema.Types.ObjectId, ref: 'Ad', required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  type: { type: String, default: 'lead' },
  value: { type: Number },
  metadata: { type: Schema.Types.Mixed, default: {} },
  publisherEarning: { type: Number },
  platformEarning: { type: Number },
}, tsOptions);

// Deals
const DealSchema = new Schema({
  conversionId: { type: Schema.Types.ObjectId, ref: 'Conversion', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  dealValue: { type: Number },
  commission: { type: Number },
  notes: String,
  closedAt: Date,
}, tsOptions);

// Transactions
const TransactionSchema = new Schema({
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String },
  amount: { type: Number },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  status: { type: String, default: 'pending' },
  description: String,
  referenceId: { type: Schema.Types.ObjectId },
  referenceType: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Withdrawals
const WithdrawalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number },
  status: { type: String, default: 'pending' },
  paymentMethod: String,
  paymentDetails: { type: Schema.Types.Mixed, default: {} },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  rejectionReason: String,
  transactionRef: String,
}, tsOptions);

// Disputes
const DisputeSchema = new Schema({
  disputeNumber: { type: String, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  relatedType: String,
  relatedId: { type: Schema.Types.ObjectId },
  subject: String,
  category: String,
  description: String,
  amount: { type: Number },
  status: { type: String, default: 'open' },
  priority: { type: String, default: 'medium' },
  resolution: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
  resolvedAt: Date,
}, tsOptions);

// Dashboard module settings
const ModuleFeatureSettingsSchema = new Schema({
  moduleKey: { type: String, unique: true },
  label: String,
  description: String,
  allowedRoles: { type: [String], default: [] },
  status: { type: String, default: 'active' },
  displayOrder: { type: Number, default: 0 },
  config: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Module activity logs
const ModuleActivityLogSchema = new Schema({
  moduleKey: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  entityType: String,
  entityId: { type: Schema.Types.ObjectId },
  action: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Approval requests
const ApprovalRequestSchema = new Schema({
  approvalNumber: { type: String, unique: true },
  moduleKey: String,
  entityType: String,
  entityId: { type: Schema.Types.ObjectId },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  notes: String,
  status: { type: String, default: 'pending' },
  decisionReason: String,
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedAt: Date,
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Dispute messages
const DisputeMessageSchema = new Schema({
  disputeId: { type: Schema.Types.ObjectId, ref: 'Dispute', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  attachments: { type: [Schema.Types.Mixed], default: [] },
  internalNote: { type: Boolean, default: false },
}, tsOptions);

// Fraud flags
const FraudFlagSchema = new Schema({
  clickId: { type: Schema.Types.ObjectId, ref: 'Click' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  reason: String,
  severity: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Notifications
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String },
  title: String,
  message: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
}, tsOptions);

// Geo zones
const GeoZoneSchema = new Schema({
  code: { type: String, unique: true },
  name: String,
  countryCodes: { type: [String], default: [] },
  defaultCpc: { type: Number, default: 0 },
  publisherShare: { type: Number, default: 80 },
  platformShare: { type: Number, default: 20 },
}, tsOptions);

// Targeting segments
const TargetingSegmentSchema = new Schema({
  name: String,
  segmentType: String,
  niches: { type: [String], default: [] },
  countries: { type: [String], default: [] },
  rules: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// Referral program settings and levels/earnings
const ReferralProgramSettingsSchema = new Schema({
  enabled: { type: Boolean, default: true },
  minCommissionableAmount: { type: Number, default: 0 },
  maxLevels: { type: Number, default: 10 },
  cookieDays: { type: Number, default: 30 },
  commissionSource: { type: String, default: 'publisher_earnings' },
}, tsOptions);

const ReferralLevelSchema = new Schema({
  level: { type: Number },
  commissionPercent: { type: Number },
  active: { type: Boolean, default: true },
}, tsOptions);

const ReferralEarningSchema = new Schema({
  earnerId: { type: Schema.Types.ObjectId, ref: 'User' },
  sourceUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number },
  sourceType: String,
  sourceEarning: { type: Number },
  commissionPercent: { type: Number },
  commissionAmount: { type: Number },
  referenceId: { type: Schema.Types.ObjectId },
}, tsOptions);

// ============================================
// AD DISPLAY WIDGETS (for publisher websites)
// ============================================
const AdWidgetSchema = new Schema({
  publisherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  style: { type: String, enum: ['banner', 'sidebar', 'inline', 'popup', 'sticky_bottom', 'native_feed'], default: 'banner' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '250px' },
  maxAds: { type: Number, default: 1 },
  rotateInterval: { type: Number, default: 30 },
  targetNiches: { type: [String], default: [] },
  targetCountries: { type: [String], default: [] },
  backgroundColor: { type: String, default: '#ffffff' },
  borderRadius: { type: String, default: '8px' },
  showBranding: { type: Boolean, default: true },
  customCss: String,
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, tsOptions);

// ============================================
// REFERRAL CLICK TRACKING
// ============================================
const ReferralClickSchema = new Schema({
  referralCode: { type: String, required: true, index: true },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  ipAddress: String,
  userAgent: String,
  referer: String,
}, tsOptions);

// ============================================
// AD TRUST SIGNALS (fraud & quality)
// ============================================
const AdTrustSignalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  adId: { type: Schema.Types.ObjectId, ref: 'Ad' },
  clickId: { type: Schema.Types.ObjectId, ref: 'Click' },
  signalType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'dismissed'], default: 'open' },
  score: { type: Number, default: 0 },
  evidence: { type: Schema.Types.Mixed, default: {} },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, tsOptions);

// ============================================
// CAMPAIGN GEO RULES
// ============================================
const CampaignGeoRuleSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: 'GeoZone' },
  countryCode: String,
  bidAdjustment: { type: Number, default: 0 },
  dailyBudgetCap: Number,
  active: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// ============================================
// PERFORMANCE SNAPSHOTS
// ============================================
const PerformanceSnapshotSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  spend: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  cpc: { type: Number, default: 0 },
  roi: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, tsOptions);

// ============================================
// PLATFORM SETTINGS (admin key-value store)
// ============================================
const PlatformSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  description: String,
  category: { type: String, default: 'general' },
}, tsOptions);

// Publisher Sites
const PublisherSiteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true, unique: true },
  name: String,
  verified: { type: Boolean, default: false },
  verificationMethod: String,
  verificationToken: String,
  category: String,
  monthlyPageviews: Number,
  adsenseApproved: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, tsOptions);

// ============================================
// MODEL EXPORTS (cast to any to fix TS2339)
// ============================================
export const User = (models.User || model('User', UserSchema)) as any;
export const Wallet = (models.Wallet || model('Wallet', WalletSchema)) as any;
export const AdvertiserProfile = (models.AdvertiserProfile || model('AdvertiserProfile', AdvertiserProfileSchema)) as any;
export const PublisherProfile = (models.PublisherProfile || model('PublisherProfile', PublisherProfileSchema)) as any;
export const Campaign = (models.Campaign || model('Campaign', CampaignSchema)) as any;
export const Ad = (models.Ad || model('Ad', AdSchema)) as any;
export const AdTargeting = (models.AdTargeting || model('AdTargeting', AdTargetingSchema)) as any;
export const AdUnit = (models.AdUnit || model('AdUnit', AdUnitSchema)) as any;
export const AdUnitImpression = (models.AdUnitImpression || model('AdUnitImpression', AdUnitImpressionSchema)) as any;
export const AdServingLog = (models.AdServingLog || model('AdServingLog', AdServingLogSchema)) as any;
export const AdsenseSettings = (models.AdsenseSettings || model('AdsenseSettings', AdsenseSettingsSchema)) as any;
export const CountryRate = (models.CountryRate || model('CountryRate', CountryRateSchema)) as any;
export const Click = (models.Click || model('Click', ClickSchema)) as any;
export const Conversion = (models.Conversion || model('Conversion', ConversionSchema)) as any;
export const Deal = (models.Deal || model('Deal', DealSchema)) as any;
export const CampaignTargetingRule = (models.CampaignTargetingRule || model('CampaignTargetingRule', CampaignTargetingRuleSchema)) as any;
export const Pixel = (models.Pixel || model('Pixel', PixelSchema)) as any;
export const Transaction = (models.Transaction || model('Transaction', TransactionSchema)) as any;
export const Withdrawal = (models.Withdrawal || model('Withdrawal', WithdrawalSchema)) as any;
export const Dispute = (models.Dispute || model('Dispute', DisputeSchema)) as any;
export const ModuleFeatureSettings = (models.ModuleFeatureSettings || model('ModuleFeatureSettings', ModuleFeatureSettingsSchema)) as any;
export const ModuleActivityLog = (models.ModuleActivityLog || model('ModuleActivityLog', ModuleActivityLogSchema)) as any;
export const ApprovalRequest = (models.ApprovalRequest || model('ApprovalRequest', ApprovalRequestSchema)) as any;
export const DisputeMessage = (models.DisputeMessage || model('DisputeMessage', DisputeMessageSchema)) as any;
export const FraudFlag = (models.FraudFlag || model('FraudFlag', FraudFlagSchema)) as any;
export const Notification = (models.Notification || model('Notification', NotificationSchema)) as any;
export const GeoZone = (models.GeoZone || model('GeoZone', GeoZoneSchema)) as any;
export const TargetingSegment = (models.TargetingSegment || model('TargetingSegment', TargetingSegmentSchema)) as any;
export const ReferralProgramSettings = (models.ReferralProgramSettings || model('ReferralProgramSettings', ReferralProgramSettingsSchema)) as any;
export const ReferralLevel = (models.ReferralLevel || model('ReferralLevel', ReferralLevelSchema)) as any;
export const ReferralEarning = (models.ReferralEarning || model('ReferralEarning', ReferralEarningSchema)) as any;
export const AdWidget = (models.AdWidget || model('AdWidget', AdWidgetSchema)) as any;
export const ReferralClick = (models.ReferralClick || model('ReferralClick', ReferralClickSchema)) as any;
export const AdTrustSignal = (models.AdTrustSignal || model('AdTrustSignal', AdTrustSignalSchema)) as any;
export const CampaignGeoRule = (models.CampaignGeoRule || model('CampaignGeoRule', CampaignGeoRuleSchema)) as any;
export const PerformanceSnapshot = (models.PerformanceSnapshot || model('PerformanceSnapshot', PerformanceSnapshotSchema)) as any;
export const PlatformSetting = (models.PlatformSetting || model('PlatformSetting', PlatformSettingSchema)) as any;
export const PublisherSite = (models.PublisherSite || model('PublisherSite', PublisherSiteSchema)) as any;

export default mongoose;
