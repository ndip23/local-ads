# Two New Modules Added: API & Integrations + White-label & Resellers

This update adds two additional public-facing modules to the Local Ads platform on top of the previous fourteen-module version.

## 1. API & Integrations Centre

Route: `/api-integrations`

Purpose:
- Defines how Local Ads can safely connect with agencies, publishers, analytics tools, payment services and trusted external partners.
- Positions the platform for future partner integrations without exposing sensitive approval, fraud, wallet or payout operations recklessly.

Key sections added:
- Campaign API
- Publisher API
- Reporting API
- Wallet API
- API key and scope management
- Webhook event catalogue
- Sandbox-first rollout
- Integration logs
- Security and permission rules
- API rollout plan

## 2. White-label & Reseller Module

Route: `/white-label-resellers`

Purpose:
- Creates a commercial expansion layer for agencies, niche operators, regional partners and media companies.
- Allows Local Ads to sell through trusted partners while keeping platform trust, fraud control, payment rules and policy enforcement centralised.

Key sections added:
- Agency resellers
- Niche network operators
- Regional partners
- Media companies
- White-label workspace concept
- Reseller dashboard concept
- Partner commission models
- Control guardrails
- Reseller rollout discipline

## Other files updated

- `src/components/marketing/marketing-nav.tsx`
  - Added navigation links for API and White-label modules.

- `src/components/marketing/marketing-footer.tsx`
  - Added footer links for API & Integrations and White-label & Resellers.

- `src/app/page.tsx`
  - Updated homepage module count from fourteen to sixteen.
  - Added module cards for API & Integrations Centre and White-label & Reseller Module.

## Validation

Run:

```bash
npm run typecheck
npx next build --webpack
```

