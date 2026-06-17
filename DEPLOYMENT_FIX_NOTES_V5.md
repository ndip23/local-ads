# Deployment Notes — Local Ads Network V5

## Mandatory Supabase order

Run in Supabase SQL Editor:

1. `SUPABASE_PRODUCTION_REPAIR_V5_STEP1_ENUMS.sql`
2. `SUPABASE_PRODUCTION_REPAIR_V5_STEP2_SCHEMA_DATA.sql`

Do not skip Step 1. PostgreSQL enum repairs must be committed before Step 2 uses those enum values.

## Mandatory Vercel variables

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
DISABLE_RUNTIME_SCHEMA_SETUP=false
EXPOSE_API_ERRORS=false
```

Set `EXPOSE_API_ERRORS=true` only for one debug redeploy if campaign creation still fails. Turn it off after capturing the real DB error.

## Cloudinary

The campaign UI uses the Cloudinary Upload Widget. Direct `/api/upload` uploads are disabled. If the widget does not open, check these first:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- browser console errors
- `/api/upload/config` response
- `/api/upload/sign` response

## Campaign failure diagnosis

If the UI still says `Failed to create campaign`, the likely causes are now narrowed to:

1. Vercel is still running an older deployment.
2. Supabase V5 SQL was not run against the same `DATABASE_URL` used by Vercel.
3. The logged-in user does not exist in the same database as the session token expects.
4. The uploaded image URL is not `https://res.cloudinary.com/<cloud>/image/upload/...`.
5. A database trigger or RLS policy outside this codebase is blocking inserts.

## Post-deployment commands

```bash
npm ci
npm run typecheck
npm run build
```
