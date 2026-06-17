# Module Database Update Notes

The dashboard modules now have a real database layer instead of being only UI links or public pages.

## New Drizzle/Supabase tables

- `module_feature_settings`: registry for Ad Trust, Performance Lab, Geo Zones, Targeting, Disputes, Approvals, Wallet Operations, Publisher Metrics and Notifications.
- `module_activity_logs`: audit trail for module actions.
- `approval_requests`: generic campaign/site/account approval queue.
- `dispute_messages`: threaded messages and evidence for dispute cases.
- `ad_trust_signals`: fraud, trust and traffic-quality signals.
- `performance_snapshots`: time-boxed campaign performance records for Performance Lab.
- `geo_zones`: reusable country groups and pricing defaults.
- `campaign_geo_rules`: campaign-level geo-zone/country bid rules.
- `targeting_segments`: reusable audience/niche/geo/device targeting segments.
- `campaign_targeting_rules`: campaign-to-targeting rule records.

## How to apply

Preferred Drizzle path:

```bash
npm install
npm run db:push
npm run db:seed
```

Manual Supabase path:

1. Open Supabase SQL Editor.
2. Run `DATABASE_MODULE_TABLES.sql`.
3. Start the app.

## Feature behaviour now connected to the database

- New campaigns create an `approval_requests` row automatically.
- New campaign niche/country settings are mirrored into `campaign_targeting_rules`.
- Campaign approval/rejection updates the linked approval request and logs activity.
- New disputes create a first `dispute_messages` row and an activity log.
- Disputes now support threaded follow-up messages through `/api/disputes/[id]/messages`.
- `/api/modules/overview` exposes module registry, approval, trust, geo, targeting and activity data to the Module Centre.
