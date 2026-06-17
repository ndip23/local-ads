# Local Ads Network Test Results

Date: 2026-06-15

## What could be verified inside this workspace

### Static verification

Command output is saved in `local-ads-static-verification.txt`.

Passed:

- No remaining source/public references to Vercel-incompatible local upload paths:
  - `public/uploads`
  - `/uploads/`
  - `fs/promises`
  - Node `path` upload handling
- No remaining video upload `<FileUpload accept="video">` usage.
- No remaining source references to `/api/upload/sign` direct signed upload.
- Campaign edit page exists at `src/app/dashboard/campaigns/[id]/edit/page.tsx`.
- Referral link builder returns `/register?ref=CODE`.

## Campaign test scenarios

| Scenario | Expected result | Workspace result | Status |
|---|---|---:|---:|
| Create campaign | Campaign row created with `pending_approval`; child ad created with `pending`; optional pixel/workflow records created non-fatally | Code path patched and statically traced | Passed static trace |
| Upload image | JPG/JPEG/PNG/WEBP/GIF posts to `/api/upload`; server validates size/type and uploads to Cloudinary | Code path patched and local filesystem references removed | Passed static trace |
| Edit campaign | `/dashboard/campaigns/[id]/edit` loads campaign and primary ad | Missing page added | Passed static trace |
| Replace image | Edit page uploads image through `/api/upload`; PATCH updates `ads.imageUrl` | API and page patched | Passed static trace |
| Admin approve | PATCH status `active` updates campaign and all child ads to approved | API patched | Passed static trace |
| Display campaign | Serve route already requires active campaign and approved ad | Existing serve route confirmed; approval patch aligns child ads | Passed static trace |

## Referral test scenarios

| Scenario | Expected result | Workspace result | Status |
|---|---|---:|---:|
| Existing user opens referral page | Missing referral code is automatically generated | `ensureUserReferralCode()` called in GET | Passed static trace |
| Generate referral link | Returns `https://domain/register?ref=CODE` | Link builder patched | Passed static trace |
| Copy referral link | Dashboard copy button copies generated link | Existing copy retained | Passed static trace |
| Reset referral code | POST `{ action: 'reset' }` generates a new unique code | API and button added | Passed static trace |
| Register via referral | `ref` query param is submitted to `/api/auth/register` | Existing registration flow retained and normalised | Passed static trace |
| Track referral click | Opening `/register?ref=CODE` posts to `/api/referral/click` | Route and page effect added | Passed static trace |
| Referral earnings | Existing `awardReferralCommissions()` traverses up to 10 levels | Existing flow retained; migration ensures tables/levels exist | Passed static trace |

## Database checks included in migration

The migration ends with these smoke-check queries:

```sql
SELECT 'users_without_referral_code' AS check_name, COUNT(*) AS count FROM users WHERE referral_code IS NULL OR referral_code = '';
SELECT 'pending_campaigns_visible_to_admin' AS check_name, COUNT(*) AS count FROM campaigns WHERE status = 'pending_approval';
SELECT 'active_campaign_ads_still_pending' AS check_name, COUNT(*) AS count
FROM ads a JOIN campaigns c ON c.id = a.campaign_id
WHERE c.status = 'active' AND a.status = 'pending';
SELECT 'campaigns_without_pixels' AS check_name, COUNT(*) AS count
FROM campaigns c WHERE NOT EXISTS (SELECT 1 FROM pixels p WHERE p.campaign_id = c.id);
```

Expected after migration:

- `users_without_referral_code = 0`
- `active_campaign_ads_still_pending = 0`
- `campaigns_without_pixels = 0`
- `pending_campaigns_visible_to_admin` may be greater than 0 if campaigns are actually waiting for approval.

## Tests that could not be completed in this workspace

These could not be truthfully completed because the workspace does not have your live Supabase database connection, live Vercel project, Vercel production build log, or live Cloudinary environment:

- Real Cloudinary upload request.
- Real Supabase insert/update/select integration tests.
- Live Vercel deployment verification.
- Publisher website ad render against production data.
- Full `npm run typecheck` and `npm run build`.

Attempted validation:

```bash
npm ci --ignore-scripts --no-audit --no-fund --loglevel=error
npm run typecheck
```

Result:

- Dependency installation was terminated by the execution environment before a complete `node_modules` tree was available.
- `npm run typecheck` failed because dependencies such as `next`, `react`, `drizzle-orm`, `@types/node`, and `lucide-react` were missing, not because the patched files produced a confirmed TypeScript error.

You must still run these after extracting the repaired ZIP locally or on Vercel:

```bash
npm ci
npm run typecheck
npm run build
```

## Remaining production risks

1. If the Supabase migration is not run first, referral and campaign routes can still fail because the tables/columns will not exist.
2. If Vercel env vars are missing, uploads will fail immediately with a Cloudinary configuration error.
3. If the old Cloudinary API secret remains active, the account is exposed. Rotate it before redeploy.
4. If `NEXT_PUBLIC_BASE_URL` is wrong, referral links and pixel snippets will point to the wrong domain.

