# Local Ads Update: Two More Modules Added

This update adds two new public-facing platform modules on top of the previous Pricing and Help Centre update.

## 1. Partner Network Module

New route:

- `/partner-network`

Purpose:

- Gives Local Ads a structured partner programme for agencies, media owners, community partners and business directories.
- Explains who can partner with the platform, what they contribute, how partner onboarding works, and what quality standards apply.

Main sections added:

- Partner network hero section
- Digital agencies, media owners, community partners and business directories
- Partner workflow: Apply, Review, Activate, Measure
- Partner operating standards
- Partner onboarding CTA

## 2. Analytics & Reporting Module

New route:

- `/analytics`

Purpose:

- Explains how Local Ads should report campaign performance, publisher earnings, traffic quality and admin-level network health.
- Gives advertisers, publishers and admins clear role-based reporting expectations.

Main sections added:

- Analytics and reporting hero section
- Metric cards for impressions, clicks, conversions, spend, publisher earnings and fraud signals
- Performance funnel from impression to revenue decision
- Advertiser, publisher and admin report views
- Suggested dashboard widgets

## Navigation updates

Updated files:

- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`
- `src/app/page.tsx`

New links added:

- Partners
- Analytics

## Validation

- `npm run typecheck` passed.
- `npm run build` compiled successfully and generated `/partner-network` and `/analytics` in the route list. In this environment, the Next.js build process printed the completed route output but did not terminate cleanly before the shell timeout. The source compiles, TypeScript passes, and the new routes are recognised by Next.js.
