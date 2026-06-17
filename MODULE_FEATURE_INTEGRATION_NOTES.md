# Module Feature Integration Notes

This update turns the scattered public module pages into operational dashboard features.

## What changed

1. Public homepage cleanup
   - The main homepage no longer exposes Ad Trust, Performance Lab, Geo Zones, Targeting, Wallet, Disputes and Approval modules as separate homepage navigation items.
   - The public navbar has been refactored into professional dropdown groups: Solutions, Publisher Growth and Resources.
   - Operational modules are presented as dashboard features, not homepage pages.

2. Dashboard Module Centre
   - Added `/api/modules/overview` as the database-backed module overview endpoint.
   - Added `/dashboard/modules` as the unified feature centre for:
     - Ad Trust
     - Performance Lab
     - Geo Zones
     - Targeting
     - Disputes
     - Approvals
     - Wallet
     - Metrics
   - The module centre is role-aware for admin, advertiser and publisher accounts.
   - It pulls live data from existing APIs including stats, campaigns, disputes and country rates.

3. Dashboard header/navbar
   - Rebuilt the dashboard header into a professional role-based navbar.
   - Admin, advertiser and publisher accounts now see different grouped dropdowns.
   - Added quick access to the Module Centre, notifications and wallet balance.

4. Sidebar navigation
   - Added Module Centre to all roles.
   - Added Disputes to all roles.
   - Added Approvals / Approval Status per role.
   - Added publisher access to Sites and Ad Units.

5. Disputes connected to PostgreSQL/Supabase
   - Added `disputes` table to Drizzle schema.
   - Added dispute status and priority enums.
   - Added `dispute_messages` so each dispute can have threaded messages and evidence.
   - Added `/api/disputes` for listing and creating disputes.
   - Added `/api/disputes/[id]` for viewing and updating disputes.
   - Added `/api/disputes/[id]/messages` for adding follow-up dispute messages.
   - Added `/dashboard/disputes` with dispute submission, queue display and admin resolution actions.

6. Approvals feature
   - Added `/dashboard/approvals`.
   - Admins can approve/reject pending campaigns.
   - Admins can verify publisher sites and activate publisher accounts from one approval centre.
   - Advertisers and publishers see a role-safe approval status page.

7. Environment hardening
   - `.env.example` now uses placeholders instead of exposing a real Supabase database password.
   - Add the real Supabase `DATABASE_URL` to `.env.local` or deployment environment variables.


8. Database tables added for the new module system
   - `module_feature_settings`
   - `module_activity_logs`
   - `approval_requests`
   - `dispute_messages`
   - `ad_trust_signals`
   - `performance_snapshots`
   - `geo_zones`
   - `campaign_geo_rules`
   - `targeting_segments`
   - `campaign_targeting_rules`

9. Data actions now wired into the module tables
   - Campaign creation creates an approval request.
   - Campaign niche/country targeting creates campaign targeting rules.
   - Campaign approval/rejection updates the approval request and logs activity.
   - Dispute creation creates the first dispute message and logs activity.
   - The Module Centre reads the module registry, approvals, trust signals, geo zones, targeting segments and activity logs.

## Required database step

Because new module tables and enums are included, run this after setting `DATABASE_URL`:

```bash
npm run db:push
```

Seed the module registry and sample geo/targeting records:

```bash
npm run db:seed
```

Then run:

```bash
npm run dev
```

Manual Supabase option: run `DATABASE_MODULE_TABLES.sql` in Supabase SQL Editor if you are not using Drizzle push.

## Verification completed

```bash
npm run typecheck
```

TypeScript passed.

`npm run lint` still reports pre-existing lint issues in older dashboard files, mainly React hook immutability warnings from functions called before declaration and old `<a>` usage. The new files added in this update do not add lint errors.
