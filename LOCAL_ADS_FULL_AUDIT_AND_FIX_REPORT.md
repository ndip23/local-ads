# Local Ads Network Full Audit and Production Fix Report

Date: 2026-06-15
Scope: Campaign creation/editing/upload/approval/display, referral generation/tracking/reset/commission plumbing, Supabase schema readiness, Vercel deployment readiness.

## Executive root cause

The platform was failing because the live production flow was internally inconsistent:

1. Campaign image upload still had Vercel-incompatible local filesystem assumptions and direct browser-to-Cloudinary signing logic. Vercel serverless deployments do not persist `public/uploads`, and direct browser signing bypassed the required server-side validation path.
2. Campaign editing was linked from the dashboard, but the actual edit page did not exist. The campaign update API also did not update ad creative fields such as `imageUrl`, `videoUrl`, `ctaText`, headline, or description.
3. Admin approval could activate a campaign while the child ads remained pending in some paths. Publisher ad serving requires both `campaigns.status = 'active'` and `ads.status = 'approved'`.
4. Referral generation existed, but the link format was not the required `/register?ref=CODE` format. Referral click tracking was tied to `/r/CODE`, which meant direct register links had no click analytics.
5. Existing users could still be missing referral codes unless the referral schema/backfill had run successfully. Duplicate referral codes were possible if legacy rows already had duplicates before adding the unique index.
6. Several optional campaign/referral tables were assumed by API code. If the Supabase migration was not run, API routes could fail in production.

## Broken files traced

### Campaign modules

- `src/app/dashboard/campaigns/new/page.tsx`
  - Accepted local `/uploads` paths.
  - Included video upload UI despite the production requirement being campaign image upload through Cloudinary.
  - Allowed media states that would not reliably serve through publisher ad widgets.

- `src/components/ui/file-upload.tsx`
  - Previously routed uploads through a direct signed browser upload path.
  - Needed to post files to server-side `/api/upload`.

- `src/app/api/upload/route.ts`
  - Needed strict server-side Cloudinary upload.
  - Needed file type/extension validation and configurable size limit.
  - Needed removal of local filesystem fallback.

- `src/app/api/upload/sign/route.ts`
  - Direct browser signing should not be used for campaign images.

- `src/app/api/campaigns/route.ts`
  - Accepted `/uploads` paths as media URLs.

- `src/app/api/campaigns/[id]/route.ts`
  - GET did not return `pixels` even though the detail page references them.
  - PATCH could update campaign metadata but not ad creative fields.
  - Editing an approved campaign did not reliably force re-approval.

- `src/app/dashboard/campaigns/[id]/edit/page.tsx`
  - Missing. Links pointed to this route, causing campaign edit/image replacement to fail.

- `src/app/api/serve/[adUnitId]/route.ts`
  - Correctly requires active campaign plus approved ad. This exposed the approval propagation bug.

### Referral modules

- `src/lib/referrals.ts`
  - Referral codes used weak random generation.
  - Referral link builder returned `/r/CODE`, not `/register?ref=CODE`.
  - Needed reset/regeneration support.

- `src/app/api/referral/route.ts`
  - POST only generated/ensured a link. It did not support reset.

- `src/app/api/referrals/route.ts`
  - Compatibility re-export is retained.

- `src/app/register/page.tsx`
  - Registration used `ref`, but direct register-link click tracking was missing.

- `src/app/api/auth/register/route.ts`
  - Registration linked referrals, but referral codes needed normalisation before lookup.

- `src/app/dashboard/referrals/page.tsx`
  - Had generate/copy only. Reset code action was missing.
  - Text was inconsistent with the required `/register?ref=CODE` format.

- `src/app/api/referral/click/route.ts`
  - Missing. Needed for tracking visits to `/register?ref=CODE`.

## Database issues

Fixed or covered by `SUPABASE_PRODUCTION_REPAIR_V3.sql`:

- `users.referral_code` may be missing or empty for existing users.
- Duplicate referral code risk before unique indexing.
- Missing referral indexes on `users.referral_code`, `users.referred_by`, `referral_clicks`, `referral_earnings`.
- Missing referral tables: `referral_levels`, `referral_earnings`, `referral_clicks`.
- Missing campaign/media columns on legacy DBs: `ads.image_url`, `ads.video_url`, `ads.cta_text`, `ads.clicks`, `ads.conversions`.
- Missing campaign workflow tables: `pixels`, `approval_requests`, `campaign_logs`, `module_activity_logs`, `targeting_segments`, `campaign_targeting_rules`.
- Active campaigns with child ads still pending.
- Campaigns without pixels.
- Pending campaigns without approval request rows.

## API fixes applied

- `POST /api/upload`
  - Authenticated advertiser/admin only.
  - Server-side Cloudinary upload.
  - Allowed: JPG, JPEG, PNG, WEBP, GIF.
  - Rejects unsupported MIME/extension.
  - Uses `MAX_CAMPAIGN_IMAGE_SIZE_MB`.
  - No local filesystem fallback.

- `POST /api/upload/sign`
  - Returns 410 to prevent direct browser signing.

- `POST /api/campaigns`
  - No longer accepts local `/uploads` paths.

- `GET /api/campaigns/[id]`
  - Returns ads, targeting, pixels and advertiser summary.

- `PATCH /api/campaigns/[id]`
  - Updates campaign metadata.
  - Updates/replaces ad creative image URL.
  - Updates headline, description, CTA and video URL when supplied.
  - Admin approval sets child ads to approved.
  - Admin rejection sets child ads to rejected.
  - Advertiser edits to active/rejected/completed/paused campaigns force campaign back to `pending_approval` and ads back to `pending`.
  - Audit/workflow side effects are non-blocking.

- `GET /api/referrals`
  - Ensures the current user has a referral code.
  - Returns `/register?ref=CODE` referral link.
  - Returns click, referral tree, earnings and analysis data.

- `POST /api/referrals`
  - Supports `{ "action": "generate" }`.
  - Supports `{ "action": "reset" }`.

- `POST /api/referral/click`
  - Tracks referral visits from `/register?ref=CODE`.
  - Analytics failure does not block registration.

- `POST /api/auth/register`
  - Normalises referral code before referrer lookup.
  - Every new user receives a unique referral code.

## Frontend fixes applied

- Campaign creation now uploads image files through `/api/upload` only.
- Campaign creation no longer accepts local `/uploads` paths.
- Campaign creation no longer presents a broken video upload flow as a campaign upload feature.
- Added campaign edit page at `/dashboard/campaigns/[id]/edit`.
- Campaign edit supports image replacement through Cloudinary.
- Referral dashboard now has Generate, Copy and Reset actions.
- Referral links now display in the required `/register?ref=CODE` format.
- Register page now tracks referral clicks when opened with `?ref=CODE`.

## Deployment fixes

Required Vercel environment variables:

```env
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=<random-string-at-least-32-chars>
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-rotated-api-secret>
MAX_CAMPAIGN_IMAGE_SIZE_MB=5
CLOUDINARY_UPLOAD_FOLDER=local-ads/campaign-images
DISABLE_RUNTIME_SCHEMA_SETUP=false
```

Important: the Cloudinary secret previously pasted in chat is compromised. Rotate it in Cloudinary and use the new secret in Vercel.

## Modified files

- `.env.example`
- `SUPABASE_PRODUCTION_REPAIR_V3.sql`
- `src/app/api/auth/register/route.ts`
- `src/app/api/campaigns/route.ts`
- `src/app/api/campaigns/[id]/route.ts`
- `src/app/api/referral/route.ts`
- `src/app/api/referral/click/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/upload/sign/route.ts`
- `src/app/dashboard/campaigns/new/page.tsx`
- `src/app/dashboard/campaigns/[id]/edit/page.tsx`
- `src/app/dashboard/referrals/page.tsx`
- `src/app/register/page.tsx`
- `src/components/ui/file-upload.tsx`
- `src/lib/feature-schema.ts`
- `src/lib/referrals.ts`

Removed:

- `public/uploads/`

## Relevant before/after examples

### Uploads

Before:

```ts
// Local/Vercel-incompatible behaviour existed through /uploads fallback and direct signing.
```

After:

```ts
const response = await fetch('/api/upload', {
  method: 'POST',
  body: uploadForm,
});
```

### Referral link

Before:

```ts
return `${baseUrl}/r/${code}`;
```

After:

```ts
return `${baseUrl}/register?ref=${encodeURIComponent(code)}`;
```

### Campaign update

Before:

```ts
// Campaign PATCH updated campaign metadata only.
// Ad image/headline/CTA replacement was not handled.
```

After:

```ts
await db.update(ads)
  .set({ imageUrl, title, description, ctaText, updatedAt: new Date() })
  .where(eq(ads.id, targetAd.id));
```

## Non-negotiable deployment order

1. Run `SUPABASE_PRODUCTION_REPAIR_V3.sql` in Supabase SQL Editor.
2. Set/verify Vercel environment variables.
3. Rotate Cloudinary secret and update Vercel.
4. Deploy the repaired ZIP/codebase.
5. Test campaign create, admin approve, publisher display, referral generate, register via referral and reset code.

