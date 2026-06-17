# Two Additional Local Ads Modules

This update adds two more public-facing platform modules on top of the existing marketing, pricing, help, partner and analytics work.

## 1. Audience Targeting Module

Route: `/targeting`

Purpose:
- Explain how advertisers should target local campaigns before spending budget.
- Cover country and market targeting, publisher niche matching, audience intent, device fit and placement fit.
- Provide practical targeting suggestions for real estate, education, retail, services, events and lead generation campaigns.
- Expose weak targeting problems such as wrong markets, wrong publisher categories, wrong CTA choices and cheap-click optimisation.

Files added:
- `src/app/targeting/page.tsx`

## 2. Brand Safety & Compliance Module

Route: `/brand-safety`

Purpose:
- Explain the policy, quality and trust layer needed for a serious ad network.
- Cover advertiser quality review, publisher placement standards, fraud control and compliance guidance.
- Define blocked or restricted campaign patterns such as misleading claims, mismatched landing pages, fake buttons, accidental-click placements and suspicious click bursts.
- Give a simple campaign review workflow: campaign submitted, automated checks, admin review, approve/reject/revise.

Files added:
- `src/app/brand-safety/page.tsx`

## Navigation updates

Updated:
- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`
- `src/app/page.tsx`

Homepage now promotes six public modules:
1. Pricing & Packages
2. Help Centre
3. Partner Network
4. Analytics & Reporting
5. Audience Targeting
6. Brand Safety & Compliance

## Validation

Commands run:
- `npm ci`
- `npm run typecheck` passed
- `npm run build` compiled successfully and generated `/targeting` and `/brand-safety` in the route list.

Note: The build completed route generation, but the shell process did not exit before the tool timeout in this environment. The successful route list confirms that the new pages compile and are recognised by Next.js.
