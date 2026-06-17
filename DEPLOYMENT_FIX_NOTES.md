# Deployment Fix Notes: Local Ads Network Production Repair v3

## Required deployment order

1. Run `SUPABASE_PRODUCTION_REPAIR_V3.sql` in Supabase SQL Editor.
2. Rotate the Cloudinary API secret that was pasted into chat.
3. Set the Vercel environment variables listed below.
4. Deploy the repaired project.
5. Run smoke tests: campaign create, image upload, admin approval, publisher display, referral generate/copy/reset, registration via referral link.

## Vercel environment variables

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

## What changed

### Uploads

- Campaign images upload through `POST /api/upload`.
- Upload handling is server-side and uses Cloudinary.
- Supported formats: JPG, JPEG, PNG, WEBP, GIF.
- File size is controlled by `MAX_CAMPAIGN_IMAGE_SIZE_MB`.
- Local `public/uploads` logic was removed.
- Direct browser signing through `/api/upload/sign` is disabled.

### Campaigns

- Campaign edit route was added: `/dashboard/campaigns/[id]/edit`.
- Campaign update API now updates the primary ad image/headline/description/CTA/video URL.
- Approved campaigns edited by advertisers are sent back to `pending_approval`.
- Admin approval now forces child ads to `approved`.
- Admin rejection forces child ads to `rejected`.
- Campaign detail API now returns pixels.

### Referrals

- Every user is guaranteed a referral code through runtime ensure plus SQL migration backfill.
- Referral links now use `/register?ref=CODE`.
- Referral click tracking works from direct register links.
- Referral dashboard has Generate, Copy and Reset actions.
- Duplicate referral codes are repaired before unique indexing.

## Production smoke test checklist

### Campaign

- Log in as advertiser.
- Create a campaign.
- Upload a JPG/PNG/WEBP/GIF banner.
- Confirm Cloudinary URL is stored in the ad row.
- Log in as admin.
- Confirm the campaign appears in pending approval.
- Approve campaign.
- Confirm campaign status is `active`.
- Confirm child ads are `approved`.
- Confirm publisher ad unit can display the ad.
- Edit campaign and replace image.
- Confirm edited campaign returns to `pending_approval` if the editor is not admin.

### Referral

- Log in as any existing user.
- Open referral dashboard.
- Confirm referral code exists.
- Click Generate Link.
- Confirm link format is `https://domain/register?ref=CODE`.
- Copy link.
- Open link in a new/private browser.
- Register as a new user.
- Confirm new user `referred_by` equals the original user's ID.
- Reset referral code.
- Confirm a new unique code/link is generated.

## Validation note

The code was statically checked in this workspace for removed local upload references, missing campaign edit route, direct signed upload references, video upload references and referral link format.

A full TypeScript/build validation still needs to run in your local machine or Vercel because dependency installation in this sandbox was terminated before `node_modules` completed.
