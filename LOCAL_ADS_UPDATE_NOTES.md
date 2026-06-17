# Local Ads Update Notes

## Added public marketing pages

- Rebuilt the homepage with a stronger Local Ads positioning.
- Added a dedicated `How It Works` section.
- Added dashboard screenshot-style preview cards for advertiser, publisher and admin portals.
- Added `/about` Founder/About page.
- Added `/publishers` page with publisher features, benefits and publisher principles.
- Added `/advertisers` page with advertiser features, workflow and campaign benefits.
- Added `/case-studies` with the first practical Local Ads case study.
- Added `/blog` and three published blog articles:
  - `/blog/why-local-advertising-still-wins`
  - `/blog/how-publishers-can-earn-from-quality-traffic`
  - `/blog/campaign-creative-checklist-for-better-cpc-results`

## Improved campaign creation

- Campaign builder now has campaign idea suggestions.
- CTA input is now a dropdown with common CTA options.
- Added stronger frontend validation for:
  - landing page URL
  - minimum total budget
  - minimum daily budget
  - daily budget not exceeding total budget
  - date order
  - target country and CPC values
  - uploaded/local media paths
- Improved ad preview with image/video display, sponsored label, CTA button and landing-page host preview.
- Kept direct image and video upload support in the campaign builder.

## Fixed direct upload saving issue

The upload API returns local media paths such as:

- `/uploads/images/...`
- `/uploads/videos/...`

The campaign API previously required `imageUrl` and `videoUrl` to be full external URLs. That would reject locally uploaded files during campaign creation. The API now accepts both:

- full `http://` or `https://` media URLs
- local `/uploads/...` media paths

## Verification

- `npm run typecheck` passed.
- `npm run build` passed successfully.

## Note

`npm run lint` still reports existing lint issues in older dashboard files that were already structured with `useEffect()` calling functions declared later. The production build and TypeScript checks pass.
