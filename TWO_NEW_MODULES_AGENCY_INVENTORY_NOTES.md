# Two New Local Ads Modules: Agency Partner Portal + Ad Inventory Marketplace

This update adds two new commercial platform modules to the Local Ads public website.

## 1. Agency Partner Portal

New route:

- `/agency-partner-portal`

Purpose:

- Gives agencies, media buyers, consultants, business development agents and industry associations a structured partner workflow.
- Defines lead submission, client portfolio visibility, commission tracking, campaign briefing and support escalation.
- Prevents Local Ads from relying on loose affiliate-style referrals with no quality control.

Key sections added:

- Agency partner hero section
- Portal snapshot
- Partner types
- Partner portal features
- Commercial operating rules
- Partner workflow
- Approval, quality, support and payout governance cards

## 2. Ad Inventory Marketplace

New route:

- `/ad-inventory-marketplace`

Purpose:

- Makes publisher ad placements easier for advertisers to understand before campaign spend begins.
- Organises placements by niche, format, availability, quality score and audience intent.
- Helps Local Ads sell verified, niche-specific inventory instead of vague traffic promises.

Key sections added:

- Inventory marketplace hero section
- Marketplace visibility rules
- Inventory categories
- Marketplace workflow
- Inventory card preview
- Quality controls
- Context, engagement, local fit and performance cards

## Updated files

- `src/app/agency-partner-portal/page.tsx`
- `src/app/ad-inventory-marketplace/page.tsx`
- `src/app/page.tsx`
- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`

## Navigation updates

The main marketing navigation now includes:

- Agencies
- Inventory

The footer now links to:

- Agency Partner Portal
- Ad Inventory Marketplace

## Validation

- `npm run typecheck` passed.
- `npx next build --webpack` compiled successfully, completed TypeScript, and generated static pages for 97 routes. The shell timed out during the final build trace collection stage in this environment, but route compilation and page generation completed.
