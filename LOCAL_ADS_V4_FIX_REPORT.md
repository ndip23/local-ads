# Local Ads Network v4 Repair Report

## Hard root cause found

The live symptom `Failed to create campaign` is not just a frontend error. The campaign creation API still had database prerequisites that could fail before a campaign row was created. The most dangerous dependency was the `campaign_status` enum value `pending_approval`. If the Supabase database does not already have that enum value, the insert into `campaigns.status = 'pending_approval'` fails and the UI shows the generic failed message.

The earlier repair also still did not satisfy the new product requirement: campaign upload needed to be the Cloudinary Upload Widget, not a local-looking drag/drop uploader or a manually pasted URL.

## What changed in v4

### Campaign creation and approval path

Modified files:

- `src/app/api/campaigns/route.ts`
- `src/app/api/campaigns/[id]/route.ts`
- `src/lib/feature-schema.ts`
- `src/app/dashboard/campaigns/new/page.tsx`
- `src/app/dashboard/campaigns/[id]/edit/page.tsx`

Changes:

- Added `ensureCampaignCoreSchema()` and call it before campaign creation and campaign update/detail loading.
- Kept heavy approval/pixel workflow creation as non-blocking side effects.
- Campaign creation now fails only on actual core campaign/ad insert errors, not optional approval/pixel/audit failures.
- Campaign images are now required to be Cloudinary image URLs in the format `https://res.cloudinary.com/<cloud>/image/upload/...`.
- The campaign create page and edit page no longer accept manually pasted banner URLs.
- Campaign edit/replacement now uses the same Cloudinary upload path.

### Cloudinary upload box

Modified/added files:

- `src/components/ui/cloudinary-upload-box.tsx`
- `src/components/ui/file-upload.tsx`
- `src/app/api/upload/config/route.ts`
- `src/app/api/upload/sign/route.ts`

Changes:

- Added a Cloudinary Upload Widget component.
- Added server-side config endpoint for Cloudinary cloud name, API key, folder, file size and allowed formats.
- Re-enabled signed Cloudinary Upload Widget support through `/api/upload/sign`.
- `FileUpload` is now only a compatibility wrapper around `CloudinaryUploadBox`, so old imports cannot silently fall back to local/Vercel filesystem upload.
- Allowed image formats: JPG, JPEG, PNG, WEBP, GIF.
- Max size is controlled by `MAX_CAMPAIGN_IMAGE_SIZE_MB`.

### Referral links for everyone, including admin

Modified/added files:

- `src/lib/referrals.ts`
- `src/app/api/referral/route.ts`
- `src/app/api/referrals/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/dashboard/referrals/page.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`

Changes:

- Every logged-in user is automatically assigned a referral code if they do not already have one.
- Referral link format remains exactly: `/register?ref=CODE`.
- Admin, advertiser and publisher roles now all have access to `/dashboard/referrals`.
- Referral page supports Generate Link, Copy Code, Copy Link and Reset Code.
- Registration links referred users through `users.referred_by`.
- Duplicate referral code risk is repaired through migration and unique indexes.

### Admin referral module settings

Modified/added files:

- `src/db/schema.ts`
- `src/lib/feature-schema.ts`
- `src/lib/referrals.ts`
- `src/app/api/admin/referral-settings/route.ts`
- `src/app/api/admin/referral-levels/route.ts`
- `src/app/dashboard/admin-referrals/page.tsx`

Changes:

- Added `referral_program_settings` table.
- Admin can now configure:
  - referral module enabled/disabled
  - commission threshold
  - maximum levels
  - cookie-day policy value
  - commission source policy
  - commission percentages per level
- Referral commission engine now respects admin settings.
- Admin settings and level tables are auto-checked and repaired by runtime schema setup, but production should still run the SQL migration first.

## Database migration files

Run these in order:

1. `SUPABASE_PRODUCTION_REPAIR_V4_STEP1_ENUMS.sql`
2. `SUPABASE_PRODUCTION_REPAIR_V4_STEP2_SCHEMA_DATA.sql`

The migration is split into two files deliberately. PostgreSQL can reject newly-added enum values if those values are used later in the same execution batch. Splitting enum repair from schema/data repair avoids that class of failure.

## Vercel environment variables required

```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secure_jwt_secret
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_rotated_cloudinary_secret
MAX_CAMPAIGN_IMAGE_SIZE_MB=5
CLOUDINARY_UPLOAD_FOLDER=local-ads/campaign-images
DISABLE_RUNTIME_SCHEMA_SETUP=false
```

## Verification completed in this workspace

- `npm ci --ignore-scripts --no-audit --no-fund` completed.
- `npm run typecheck` passed.
- `next build` compiled successfully but timed out during the later Next.js build phase in the sandbox environment.
- Static checks confirm campaign pages use `CloudinaryUploadBox` and no campaign page references local `/uploads`.

## What still cannot be verified here

Live Vercel deployment, live Supabase writes and real Cloudinary widget upload cannot be executed inside this workspace because your production Vercel, Supabase and Cloudinary runtime are not connected here. The repaired code and migration are ready, but you must deploy them in the correct order.
