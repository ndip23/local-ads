# Local Ads: Two New Modules Added

This update adds two new modules on top of the Publisher Trust System version.

## 1. Advertiser Trust Centre

Route: `/advertiser-trust`

Purpose:
- Explains how Local Ads protects advertiser spend.
- Makes campaign approval, budget visibility, traffic review, dispute handling and support expectations clearer.

Included sections:
- Advertiser transparency snapshot
- Trust promises
- Advertiser rights
- Campaign review checklist
- Click quality, placement quality, refund path and direct support cards

## 2. Campaign Performance Lab

Route: `/campaign-performance-lab`

Purpose:
- Helps advertisers plan stronger campaigns before spending money.
- Reduces weak campaigns caused by vague offers, poor CTAs, weak creative and irrelevant targeting.

Included sections:
- Offer clarity score explanation
- CTA fit check
- Creative readiness review
- Budget pacing logic
- Interactive campaign performance estimator
- Niche-specific optimisation ideas for real estate, construction, hotels and business directories
- Campaign readiness checklist

## New Component

`src/components/marketing/campaign-performance-calculator.tsx`

This client component estimates:
- Impressions
- Clicks
- Conversions
- Estimated value
- Value-to-spend ratio

## Navigation and Footer Updates

Added links for:
- Advertiser Trust Centre
- Campaign Performance Lab

## Homepage Updates

The homepage module section now includes both new modules and describes the platform as having twelve support/business modules.

## Validation

- `npm run typecheck` passed.
- `npx next build --webpack` compiled successfully, completed TypeScript and generated static pages for 95 routes. The shell timed out during final build trace collection, which has been recurring in this environment, but compilation and route generation completed.
