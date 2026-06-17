# Local Ads Update: Two New Modules

This update adds two public-facing modules to strengthen product trust, onboarding and conversion.

## 1. Pricing & Packages Module

New route:

- `/pricing`

What it includes:

- Advertiser campaign package cards
- Publisher 80/20 earning model explanation
- Platform share explanation
- Operating rules for budget control, qualified clicks, fraud review and approval workflow
- Advertiser and publisher signup calls to action

Files added/updated:

- `src/app/pricing/page.tsx`
- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`
- `src/app/page.tsx`

## 2. Help Centre Module

New route:

- `/help`

What it includes:

- Advertiser onboarding guidance
- Publisher onboarding guidance
- Wallet and earnings guidance
- Safety and fraud review guidance
- Advertiser launch checklist
- Publisher quality checklist
- Frequently asked questions
- Dashboard support call to action

Files added/updated:

- `src/app/help/page.tsx`
- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`
- `src/app/page.tsx`

## Homepage and navigation updates

The homepage now includes a new section highlighting the two modules. The top navigation and footer now link to Pricing and Help Centre pages.

## Verification

- `npm run typecheck` passed.
- `npm run build` compiled successfully and generated the new static routes `/pricing` and `/help`.
