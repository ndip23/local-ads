# Local Ads update: Automation Rules and Notification Centre modules

This update adds two new public platform modules on top of the previous eight-module version.

## 1. Automation Rules Module

Route: `/automation-rules`

Purpose:
- Explains how Local Ads should automate repeated operational work.
- Covers campaign automation, publisher automation, fraud and safety automation, and follow-up automation.
- Defines a trigger, condition, action and log model for scalable platform workflows.
- Includes practical examples such as budget warnings, campaign approval alerts, publisher reminders, suspicious click escalation and dispute task creation.

## 2. Notification Centre Module

Route: `/notification-centre`

Purpose:
- Explains how advertisers, publishers and admins should receive important platform updates.
- Covers advertiser alerts, publisher updates, admin task alerts and security notices.
- Defines in-app, email, SMS/WhatsApp-ready and digest notification channels.
- Includes notification priority rules and mistakes to avoid.

## Updated files

- `src/app/automation-rules/page.tsx`
- `src/app/notification-centre/page.tsx`
- `src/app/page.tsx`
- `src/components/marketing/marketing-nav.tsx`
- `src/components/marketing/marketing-footer.tsx`

## Validation

- `npm run typecheck` passed.
- `npm run build` compiled successfully and generated both `/automation-rules` and `/notification-centre` in the route list. The route generation completed, but the command process timed out before the shell returned cleanly in this environment.
