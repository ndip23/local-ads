# Local Ad Network

A full-stack digital advertising network with CPC, lead tracking, conversion tracking, Google AdSense integration, fraud detection, and wallet management.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL (Supabase) with Drizzle ORM
- **Auth**: JWT (jose + bcryptjs)

## Features

- 3 User Roles: Admin, Advertiser, Publisher
- Campaign Management with country-based CPC
- Real-time Click Tracking & Fraud Detection
- Conversion Tracking (Pixel / JS)
- Google AdSense Integration (fallback ad serving)
- Wallet & Payment System (80/20 revenue share)
- Publisher Sites & Ad Units Management
- Analytics Dashboards for all roles

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/local-ad-network.git
cd local-ad-network

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env
# Then edit .env with your Supabase credentials

# 4. Push database schema to Supabase
npm run db:push

# 5. Seed demo accounts
npm run db:seed

# 6. Run development server
npm run dev
```

Open http://localhost:3000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@localadnetwork.com | admin123 |
| Advertiser | advertiser@example.com | advertiser123 |
| Publisher | publisher@example.com | publisher123 |

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL`
4. Deploy

## License

MIT
