# Deployment Notes - Local Ads Network v4

## Deployment order

1. In Supabase SQL Editor, run `SUPABASE_PRODUCTION_REPAIR_V4_STEP1_ENUMS.sql`.
2. Wait until it completes successfully.
3. In Supabase SQL Editor, run `SUPABASE_PRODUCTION_REPAIR_V4_STEP2_SCHEMA_DATA.sql`.
4. Set Vercel environment variables.
5. Redeploy the v4 project package.
6. Test campaign creation with the Cloudinary Upload Box.
7. Test referral generation as admin, advertiser and publisher.

## Required Vercel environment variables

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

## Cloudinary security

Do not reuse the Cloudinary API secret previously pasted into chat. Rotate it in Cloudinary and use the new value in Vercel.

## What changed for upload

Campaign create/edit now uses the Cloudinary Upload Widget only. The frontend asks the backend for Cloudinary public config, opens the Cloudinary Upload Widget, then signs upload parameters through `/api/upload/sign`. The campaign API rejects any image URL that is not a configured Cloudinary `image/upload` URL.

## What changed for campaign failure

Campaign creation now calls a minimal campaign-core database repair before inserting. Heavy workflow features such as approval audit records, targeting rules and pixels are still attempted, but they no longer block the core campaign/ad creation.

## What changed for referral

Every logged-in user gets a referral code if missing. The admin, advertiser and publisher dashboards now expose `/dashboard/referrals`. Admins can configure referral module status, commission threshold, active levels, cookie-day policy and level percentages from `/dashboard/admin-referrals`.

## Verification caveat

The workspace typecheck passed. The Next production build compiled successfully but timed out during the later build stage in this sandbox. Run `npm run build` on your machine or let Vercel run the final production build.
