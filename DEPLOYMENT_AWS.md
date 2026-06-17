# AWS Deployment Guide for Local Ad Network

This project is a Next.js App Router application with API routes and PostgreSQL, so it must be deployed as a server-rendered Node.js app. Do not deploy it as a static site.

## Recommended AWS architecture

For the least painful AWS path:

1. AWS Elastic Beanstalk for the Next.js app runtime.
2. Amazon RDS PostgreSQL for the database.
3. AWS Certificate Manager plus a custom domain for HTTPS.
4. CloudWatch logs for production debugging.

AWS Amplify Hosting can also be used for supported Next.js SSR versions, but this repo currently uses Next.js 16. If Amplify rejects the framework version, use Elastic Beanstalk or downgrade to an Amplify-supported Next.js version.

## Required production environment variables

Set these in AWS, never commit real values to Git:

```bash
DATABASE_URL=postgresql://USERNAME:PASSWORD@YOUR-RDS-ENDPOINT:5432/local_ads?sslmode=require
JWT_SECRET=your-long-random-secret
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NODE_ENV=production
```

## Database setup on AWS RDS PostgreSQL

1. Create a PostgreSQL database in Amazon RDS.
2. Keep the database private where possible.
3. Allow inbound access from the app environment security group.
4. Use `?sslmode=require` in `DATABASE_URL`.
5. Run the Drizzle schema push after setting `DATABASE_URL`:

```bash
npm install
npm run db:push
npm run db:seed
```

Run the seed command only when you intentionally want demo accounts.

## Deploy with Elastic Beanstalk

This repo includes:

- `Procfile` for the production start command.
- `.ebextensions/healthcheck.config` so Elastic Beanstalk checks `/api/health`.

Deployment steps:

```bash
npm ci
npm run build
zip -r local-ad-network-aws.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".next/cache/*"
```

Then upload the ZIP to Elastic Beanstalk using a Node.js platform environment.

In Elastic Beanstalk configuration, add:

```bash
DATABASE_URL=postgresql://USERNAME:PASSWORD@YOUR-RDS-ENDPOINT:5432/local_ads?sslmode=require
JWT_SECRET=your-long-random-secret
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NODE_ENV=production
```

## Deploy with AWS Amplify Hosting

This repo includes `amplify.yml`.

Deployment steps:

1. Push the repo to GitHub.
2. In AWS Amplify, create a new app from the Git repository.
3. Confirm the build settings use `amplify.yml`.
4. Add the required environment variables in Amplify.
5. Deploy.

If Amplify fails because of the Next.js version, use Elastic Beanstalk. Do not waste time fighting framework support limits.

## Production checklist

Before going live:

1. Replace all demo secrets.
2. Use a fresh `JWT_SECRET` with at least 32 random characters.
3. Confirm `/api/health` returns `{ "ok": true }`.
4. Confirm admin login works.
5. Confirm publisher registration stores submitted website/social links.
6. Confirm admin can review publisher links at `/dashboard/users` and `/dashboard/publisher-sites`.
7. Confirm pending publishers cannot serve ads until approved.
8. Confirm RDS security group allows only the app environment, not the whole internet.
9. Confirm the production domain is set in `NEXT_PUBLIC_BASE_URL`.
10. Confirm CloudWatch logs are enabled.

## Important security warning

The previous `.env.example` included a real-looking database password. That is dangerous. This version replaces it with placeholders. Rotate any database password that was ever committed or shared.
