# Local Ads Network — V5 Test Results

Date: 2026-06-17

## Static tests passed

- PASS: Campaign creation core transaction contains only `campaigns` and `ads` inserts.
- PASS: `ad_targeting` insert is outside the transaction and non-blocking.
- PASS: `pending_approval` enum is repaired before campaign creation.
- PASS: Runtime schema repair creates `campaigns` if missing.
- PASS: Runtime schema repair creates `ads` if missing.
- PASS: Workflow enum repair is isolated from table creation/default enum usage.
- PASS: Direct `/api/upload` POST route is disabled.
- PASS: Cloudinary Upload Widget uses `/api/upload/config` and `/api/upload/sign`.
- PASS: Cloudinary Upload Widget enforces allowed formats and max image file size.
- PASS: `createUser()` assigns referral codes to all roles, including admin.
- PASS: Production database pool is cached and capped.
- PASS: SQL V5 creates core campaign/ad tables if missing.
- PASS: SQL V5 repairs referral codes and unique indexes.
- PASS: SQL V5 includes referral programme settings and levels.

See `LOCAL_ADS_V5_STATIC_VERIFICATION.txt` for raw verification output.

## Tests requiring live Vercel/Supabase

These cannot be truthfully executed inside this sandbox because the live Supabase database, Vercel deployment, and Cloudinary account are not connected here:

1. Create campaign with Cloudinary widget image.
2. Approve campaign in admin dashboard.
3. Render approved campaign on publisher placement.
4. Reset referral code from admin account.
5. Generate referral link from admin, advertiser, and publisher accounts.
6. Register a new user through `/register?ref=CODE`.
7. Confirm referral relationship and click analytics in production.
8. Save admin referral settings and commission percentages.

## Exact production smoke test after deployment

1. Log in as admin and open `/dashboard/referrals`.
2. Click Generate Referral Link.
3. Click Reset Code.
4. Confirm the new link uses `/register?ref=CODE`.
5. Open `/dashboard/admin-referrals`.
6. Set threshold and percentages for all levels.
7. Log in as advertiser/admin and open `/dashboard/campaigns/new`.
8. Upload the image using the Cloudinary widget only.
9. Submit campaign.
10. If it fails, enable `EXPOSE_API_ERRORS=true` in Vercel temporarily and retry once to see the real database code/hint.
