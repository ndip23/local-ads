import 'dotenv/config';
import { db } from '../db';
import { users, wallets, countryRates, advertiserProfiles, publisherProfiles, moduleFeatureSettings, geoZones, targetingSegments } from '../db/schema';
import { hashPassword } from '../lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPasswordHash = await hashPassword('admin123');
    const [admin] = await db.insert(users).values({
      email: 'admin@localadnetwork.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (admin) {
      await db.insert(wallets).values({
        userId: admin.id,
        balance: '0.00',
      }).onConflictDoNothing();
      console.log('✅ Admin user created: admin@localadnetwork.com');
    }

    // Create sample advertiser
    const advertiserPasswordHash = await hashPassword('advertiser123');
    const [advertiser] = await db.insert(users).values({
      email: 'advertiser@example.com',
      passwordHash: advertiserPasswordHash,
      role: 'advertiser',
      status: 'active',
      firstName: 'John',
      lastName: 'Advertiser',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (advertiser) {
      await db.insert(wallets).values({
        userId: advertiser.id,
        balance: '1000.00',
      }).onConflictDoNothing();
      
      await db.insert(advertiserProfiles).values({
        userId: advertiser.id,
        companyName: 'Example Corp',
        website: 'https://example.com',
        industry: 'Technology',
        country: 'United States',
      }).onConflictDoNothing();
      
      console.log('✅ Advertiser user created: advertiser@example.com');
    }

    // Create sample publisher
    const publisherPasswordHash = await hashPassword('publisher123');
    const [publisher] = await db.insert(users).values({
      email: 'publisher@example.com',
      passwordHash: publisherPasswordHash,
      role: 'publisher',
      status: 'active',
      firstName: 'Jane',
      lastName: 'Publisher',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (publisher) {
      await db.insert(wallets).values({
        userId: publisher.id,
        balance: '50.00',
        totalEarnings: '250.00',
      }).onConflictDoNothing();
      
      await db.insert(publisherProfiles).values({
        userId: publisher.id,
        websiteUrl: 'https://myblog.com',
        niches: ['Technology', 'Business', 'Finance'],
        country: 'United States',
        paymentMethod: 'paypal',
      }).onConflictDoNothing();
      
      console.log('✅ Publisher user created: publisher@example.com');
    }

    // Create country rates
    const countryRatesData = [
      { countryCode: 'US', countryName: 'United States', defaultCpc: '0.10', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'GB', countryName: 'United Kingdom', defaultCpc: '0.08', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'CA', countryName: 'Canada', defaultCpc: '0.07', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'AU', countryName: 'Australia', defaultCpc: '0.07', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'DE', countryName: 'Germany', defaultCpc: '0.06', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'FR', countryName: 'France', defaultCpc: '0.06', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'NG', countryName: 'Nigeria', defaultCpc: '0.05', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'KE', countryName: 'Kenya', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'CM', countryName: 'Cameroon', defaultCpc: '0.03', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'GH', countryName: 'Ghana', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'ZA', countryName: 'South Africa', defaultCpc: '0.05', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'IN', countryName: 'India', defaultCpc: '0.02', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'BR', countryName: 'Brazil', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'MX', countryName: 'Mexico', defaultCpc: '0.03', publisherShare: '80.00', platformShare: '20.00' },
    ];

    for (const rate of countryRatesData) {
      await db.insert(countryRates).values(rate).onConflictDoNothing();
    }
    console.log('✅ Country rates created');


    // Create dashboard module registry records
    const modulesData: Array<typeof moduleFeatureSettings.$inferInsert> = [
      {
        moduleKey: 'ad_trust',
        label: 'Ad Trust',
        description: 'Traffic quality, fraud evidence, wallet confidence and dispute signals.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 1,
        config: { dashboardPath: '/dashboard/modules', primaryPath: '/dashboard/fraud' },
      },
      {
        moduleKey: 'performance_lab',
        label: 'Performance Lab',
        description: 'Campaign diagnostics, conversion learning, spend analysis and optimisation snapshots.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 2,
        config: { dashboardPath: '/dashboard/analytics' },
      },
      {
        moduleKey: 'geo_zones',
        label: 'Geo Zones',
        description: 'Country pricing, regional CPC controls and campaign-level geo rules.',
        allowedRoles: ['admin', 'advertiser'],
        displayOrder: 3,
        config: { dashboardPath: '/dashboard/country-rates' },
      },
      {
        moduleKey: 'targeting',
        label: 'Targeting',
        description: 'Niche, placement, device, country and segment targeting rules.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 4,
        config: { dashboardPath: '/dashboard/campaigns/new' },
      },
      {
        moduleKey: 'disputes',
        label: 'Disputes',
        description: 'Evidence-based support cases for refunds, wallet issues, approvals and traffic quality.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 5,
        config: { dashboardPath: '/dashboard/disputes' },
      },
      {
        moduleKey: 'approvals',
        label: 'Approvals',
        description: 'Campaign, publisher site and account review workflow.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 6,
        config: { dashboardPath: '/dashboard/approvals' },
      },
      {
        moduleKey: 'wallet_operations',
        label: 'Wallet Operations',
        description: 'Deposits, spending, publisher earnings, withdrawals and transaction records.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 7,
        config: { dashboardPath: '/dashboard/wallet' },
      },
      {
        moduleKey: 'publisher_metrics',
        label: 'Publisher Metrics',
        description: 'Publisher site, ad unit, widget, impressions, CTR and earnings performance.',
        allowedRoles: ['admin', 'publisher'],
        displayOrder: 8,
        config: { dashboardPath: '/dashboard/earnings' },
      },
      {
        moduleKey: 'notifications',
        label: 'Notification Centre',
        description: 'System alerts tied to approvals, disputes, payments and campaign changes.',
        allowedRoles: ['admin', 'advertiser', 'publisher'],
        displayOrder: 9,
        config: { dashboardPath: '/dashboard/notifications' },
      },
    ];

    for (const moduleItem of modulesData) {
      await db.insert(moduleFeatureSettings).values(moduleItem).onConflictDoNothing();
    }
    console.log('✅ Dashboard module registry created');

    // Create geo zones used by the Geo Zones module
    const geoZonesData: Array<typeof geoZones.$inferInsert> = [
      { code: 'tier_1', name: 'Tier 1 Markets', countryCodes: ['US', 'GB', 'CA', 'AU'], defaultCpc: '0.0800', publisherShare: '80.00', platformShare: '20.00' },
      { code: 'western_europe', name: 'Western Europe', countryCodes: ['DE', 'FR', 'NL', 'BE', 'IE'], defaultCpc: '0.0600', publisherShare: '80.00', platformShare: '20.00' },
      { code: 'west_africa', name: 'West Africa', countryCodes: ['NG', 'GH', 'CM'], defaultCpc: '0.0400', publisherShare: '80.00', platformShare: '20.00' },
      { code: 'east_africa', name: 'East Africa', countryCodes: ['KE', 'UG', 'TZ', 'RW'], defaultCpc: '0.0350', publisherShare: '80.00', platformShare: '20.00' },
      { code: 'emerging_global', name: 'Emerging Global Markets', countryCodes: ['IN', 'BR', 'MX', 'ZA'], defaultCpc: '0.0300', publisherShare: '80.00', platformShare: '20.00' },
    ];

    for (const zone of geoZonesData) {
      await db.insert(geoZones).values(zone).onConflictDoNothing();
    }
    console.log('✅ Geo zones created');

    // Create reusable targeting segments used by the Targeting module
    const targetingSegmentsData: Array<typeof targetingSegments.$inferInsert> = [
      { name: 'Business and Finance Audience', segmentType: 'niche', niches: ['Business', 'Finance'], countries: ['US', 'GB', 'NG', 'GH'], rules: { intent: 'commercial' } },
      { name: 'Technology Readers', segmentType: 'niche', niches: ['Technology', 'Software', 'AI'], countries: ['US', 'GB', 'CA', 'NG'], rules: { intent: 'software_interest' } },
      { name: 'African Consumer Reach', segmentType: 'geo_zone', niches: ['Shopping', 'Lifestyle', 'Business'], countries: ['NG', 'GH', 'KE', 'ZA'], rules: { region: 'africa' } },
    ];

    for (const segment of targetingSegmentsData) {
      const existingSegment = await db.query.targetingSegments.findFirst({
        where: (segments, { eq }) => eq(segments.name, segment.name),
      });
      if (!existingSegment) {
        await db.insert(targetingSegments).values(segment);
      }
    }
    console.log('✅ Targeting segments created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('   Admin: admin@localadnetwork.com / admin123');
    console.log('   Advertiser: advertiser@example.com / advertiser123');
    console.log('   Publisher: publisher@example.com / publisher123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
