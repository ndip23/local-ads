# Local Ads Network v4 Test Results

## Automated/local checks

| Check | Result | Evidence |
|---|---:|---|
| Dependency install | Passed | `npm ci --ignore-scripts --no-audit --no-fund` completed and installed 445 packages. |
| TypeScript | Passed | `npm run typecheck` exited cleanly. |
| Production compile | Partial pass | `next build` compiled successfully, then sandbox timed out during the later Next.js build phase. |
| Lint | Existing failures remain | The project still has pre-existing React hook lint errors in unrelated dashboard pages. The v4 referral apostrophe lint issue was fixed. |
| Campaign page upload path | Passed static check | Campaign create/edit pages use `CloudinaryUploadBox`. |
| Local upload references in campaign pages | Passed static check | No `/uploads`, `FileUpload`, or local upload route references remain inside campaign create/edit pages. |
| Referral link format | Passed static check | `buildReferralLink()` returns `/register?ref=CODE`. |
| Admin referral settings | Passed static check | `referral_program_settings` schema, API route and admin UI exist. |
| Referral access for all roles | Passed static check | Admin, advertiser and publisher navigation expose `/dashboard/referrals`. |

## Campaign test scenarios to run after deployment

1. Login as advertiser or admin.
2. Open `/dashboard/campaigns/new`.
3. Upload a JPG/PNG/WEBP/GIF using the Cloudinary Upload Box.
4. Confirm the uploaded URL starts with `https://res.cloudinary.com/<cloud>/image/upload/`.
5. Submit campaign.
6. Login as admin.
7. Open `/dashboard/campaigns` or approvals.
8. Confirm campaign appears as pending approval.
9. Approve campaign.
10. Confirm child ads become approved.
11. Edit campaign and replace image through Cloudinary Upload Box.
12. Confirm campaign saves and image URL remains Cloudinary-only.

## Referral test scenarios to run after deployment

1. Login as admin, advertiser and publisher separately.
2. Open `/dashboard/referrals` for each role.
3. Confirm referral code is auto-generated if missing.
4. Click Generate Link.
5. Copy referral link and confirm format `/register?ref=CODE`.
6. Click Reset Code and confirm a new unique code/link is created.
7. Register a new user using `/register?ref=CODE`.
8. Confirm the new user has `users.referred_by` pointing to the referrer.
9. Trigger a publisher earning event and confirm referral commission rows are written according to admin level settings.
10. Open `/dashboard/admin-referrals` as admin and change threshold, levels and percentages.
11. Confirm future referral commissions obey the new settings.

## Remaining production dependency

The two Supabase SQL files must be run before testing production campaign creation. If the database still lacks `campaign_status.pending_approval`, `ad_targeting`, `referral_program_settings`, or referral indexes, production will keep failing regardless of frontend changes.
