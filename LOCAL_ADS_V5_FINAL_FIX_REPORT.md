# Local Ads Network — V5 Final Production Fix Report

Date: 2026-06-17

## Executive diagnosis

The persistent `Failed to create campaign` issue was not just a Cloudinary/UI problem. The actual failure path still had database fragility:

1. Campaign creation inserted optional `ad_targeting` rows inside the same Postgres transaction as the core `campaigns` and `ads` inserts. A caught error inside a Postgres transaction still aborts the transaction. This can make the campaign insert fail even though the code catches the targeting error.
2. Runtime schema repair and the previous Supabase SQL still assumed the `campaigns` and `ads` tables already existed. A partially migrated Supabase database would therefore continue failing.
3. Direct `/api/upload` file uploads still existed. That kept a second upload path alive when the requested architecture is Cloudinary Upload Widget only.
4. Referral codes were generated through register/referral routes, but the generic `createUser()` helper still created users without a referral code. That means admin/seeded/manual users could still miss referral codes until they visited the referral endpoint.
5. The database pool was only cached outside production. On Vercel, this causes unnecessary Supabase connection churn.

## Files changed in V5

- `src/app/api/campaigns/route.ts`
- `src/lib/feature-schema.ts`
- `src/app/api/upload/route.ts`
- `src/components/ui/cloudinary-upload-box.tsx`
- `src/lib/auth.ts`
- `src/db/index.ts`
- `src/app/dashboard/campaigns/new/page.tsx`
- `SUPABASE_PRODUCTION_REPAIR_V5_STEP1_ENUMS.sql`
- `SUPABASE_PRODUCTION_REPAIR_V5_STEP2_SCHEMA_DATA.sql`

## Campaign creation fix

### Before

Campaign creation created campaign, ad, and targeting inside one transaction. The targeting insert was wrapped in a `try/catch`, but that does not save a Postgres transaction after an error.

### After

The core transaction now creates only:

- campaign row
- ad row

Then targeting, approval workflow, activity logs, and pixel creation run as isolated side effects. If those fail, the campaign still exists and can be approved/admin-reviewed.

## Campaign database fix

`ensureCampaignCoreSchema()` now creates missing `campaigns`, `ads`, and `ad_targeting` tables before attempting `ALTER TABLE` or inserts. This protects against partially migrated Supabase databases.

The new SQL V5 also creates `campaigns` and `ads` if missing, then adds indexes and missing columns.

## Cloudinary-only upload fix

The old direct `/api/upload` route is now disabled with HTTP `410`.

Campaign image uploads must use:

- `/api/upload/config`
- Cloudinary Upload Widget
- `/api/upload/sign`
- returned `https://res.cloudinary.com/<cloud>/image/upload/...` URL

The widget enforces:

- JPG
- JPEG
- PNG
- WEBP
- GIF
- configured max image size through `MAX_CAMPAIGN_IMAGE_SIZE_MB`

## Referral fix

All users now get a referral code from `createUser()`, including admin-created/admin-seeded users.

Referral links remain in the required format:

```text
https://yourdomain.com/register?ref=CODE
```

Admin referral settings remain available through:

```text
/dashboard/admin-referrals
```

The admin can configure:

- module enabled/disabled
- threshold/minimum commissionable amount
- max active levels
- cookie days
- commission source
- percentage per level

## DevOps/Supabase fix

`src/db/index.ts` now caches the PostgreSQL pool in production too and limits pool size through `DATABASE_POOL_MAX`, defaulting to 5. This reduces connection churn on Vercel/Supabase.

## Required deployment order

1. Back up Supabase.
2. Run `SUPABASE_PRODUCTION_REPAIR_V5_STEP1_ENUMS.sql`.
3. Run `SUPABASE_PRODUCTION_REPAIR_V5_STEP2_SCHEMA_DATA.sql`.
4. Set Vercel environment variables.
5. Deploy `local-ads-production-repair-v5.zip`.
6. Test campaign create with a Cloudinary widget uploaded image.
7. Test admin referral settings.
8. Test referral link generation from admin, advertiser, and publisher accounts.

## Required environment variables

```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secure_jwt_secret
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_rotated_cloudinary_api_secret
MAX_CAMPAIGN_IMAGE_SIZE_MB=5
CLOUDINARY_UPLOAD_FOLDER=local-ads/campaign-images
DATABASE_POOL_MAX=5
EXPOSE_API_ERRORS=false
DISABLE_RUNTIME_SCHEMA_SETUP=false
```

Use `EXPOSE_API_ERRORS=true` temporarily only when debugging production. Turn it off after diagnosis.

## Verification performed

Static verification passed for the core paths:

- campaign transaction isolation
- `pending_approval` enum usage
- campaign diagnostic response
- runtime schema creates `campaigns`/`ads`
- direct upload disabled
- Cloudinary widget routes present
- Cloudinary image limits present
- referral code creation in `createUser()`
- production DB pool caching
- SQL V5 campaign/referral schema repair

## Verification limitation

`npm ci` was terminated by the sandbox with `SIGTERM`, so full `npm run typecheck` and `next build` could not be truthfully completed here. The failure was dependency installation termination, not a TypeScript result. Run these after extracting the package:

```bash
npm ci
npm run typecheck
npm run build
```

If either command fails after dependencies install, use the exact error output. Do not keep redeploying blindly.
