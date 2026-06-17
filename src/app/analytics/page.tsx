import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  BarChart3,
  ChartNoAxesCombined,
  CheckCircle,
  CircleDollarSign,
  Eye,
  FileChartColumn,
  Funnel,
  MousePointerClick,
  ShieldAlert,
  Target,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Analytics & Reporting | Local Ads',
  description: 'Analytics and reporting module for advertisers, publishers and admins on Local Ads.',
};

const metricCards = [
  { label: 'Impressions', value: 'Ad views', icon: Eye, description: 'See how often approved placements are served across publisher inventory.' },
  { label: 'Clicks', value: 'CPC traffic', icon: MousePointerClick, description: 'Track paid click activity by campaign, publisher, country and device signals.' },
  { label: 'Conversions', value: 'Pixel actions', icon: Target, description: 'Connect campaign traffic to leads, purchases, signups, downloads and requests.' },
  { label: 'Spend', value: 'Budget usage', icon: CircleDollarSign, description: 'Monitor daily spend, total spend, remaining balance and campaign pacing.' },
  { label: 'Publisher earnings', value: '80% share', icon: WalletCards, description: 'Show qualified earning records, wallet movement and withdrawal visibility.' },
  { label: 'Traffic quality', value: 'Fraud signals', icon: ShieldAlert, description: 'Highlight suspicious clicks, repeated activity and review-worthy patterns.' },
];

const reportViews = [
  {
    title: 'Advertiser report view',
    description: 'Campaign performance, spend, CPC, CTA result, creative preview, conversions and publisher traffic quality.',
    items: ['Campaign ROI snapshot', 'Country and audience breakdown', 'CTA and creative comparison', 'Conversion pixel activity'],
  },
  {
    title: 'Publisher report view',
    description: 'Qualified clicks, estimated earnings, approved placements, rejected activity and wallet history.',
    items: ['Earnings by campaign', 'Placement performance', 'Traffic quality warnings', 'Withdrawal readiness'],
  },
  {
    title: 'Admin report view',
    description: 'Network revenue, advertiser spend, publisher payout liability, fraud queue and market-level performance.',
    items: ['Platform 20% share', 'Publisher payout exposure', 'Fraud review summaries', 'Best-performing markets'],
  },
];

const funnelStages = [
  { title: 'Impression', description: 'Ad is shown in a publisher placement or widget.' },
  { title: 'Click', description: 'User clicks through a tracked Local Ads link.' },
  { title: 'Landing page visit', description: 'Advertiser receives traffic from a campaign source.' },
  { title: 'Conversion', description: 'Pixel records a lead, order, signup, booking or request.' },
  { title: 'Revenue decision', description: 'Budget, publisher share and platform share are reconciled against qualified activity.' },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Analytics and reporting module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Turn ad activity into reports advertisers, publishers and admins can actually act on.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          A CPC platform without reporting is just a wallet with buttons. This module defines the analytics layer needed to measure spend, clicks, conversions, earnings and traffic quality.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Track advertiser results <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Track publisher earnings <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{metric.value}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Funnel className="mx-auto h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">The reporting funnel should expose where performance is won or lost.</h2>
            <p className="mt-4 text-gray-400">
              Counting clicks alone is lazy reporting. The platform needs to show the path from exposure to action, then separate quality traffic from suspicious activity.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-5">
            {funnelStages.map((stage, index) => (
              <div key={stage.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="text-sm font-bold text-blue-400">0{index + 1}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{stage.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Role-based reports</p>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Different users need different reports.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            A serious platform does not show every user the same vanity numbers. Reports should match the decision each role has to make.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {reportViews.map((view) => (
            <div key={view.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
              <FileChartColumn className="h-11 w-11 text-blue-400" />
              <h3 className="mt-5 text-2xl font-bold text-white">{view.title}</h3>
              <p className="mt-3 leading-7 text-gray-400">{view.description}</p>
              <div className="mt-6 space-y-3">
                {view.items.map((item) => (
                  <p key={item} className="flex gap-3 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <BarChart3 className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Suggested dashboard widgets</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {['Spend pacing', 'Top campaigns', 'Top publishers', 'Conversion trend', 'Fraud warnings', 'Wallet movement'].map((widget) => (
                <div key={widget} className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
                  <Activity className="h-5 w-5 text-green-400" />
                  <p className="mt-3 font-semibold text-white">{widget}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <ChartNoAxesCombined className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">What this module prevents</h2>
            <p className="mt-4 leading-7 text-gray-400">
              It prevents blind spending, publisher distrust, admin guesswork and poor campaign decisions. If users cannot see performance clearly, they will blame the platform even when the real issue is weak creative, bad targeting or poor traffic quality.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">Measure the network before scaling it.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Growth without reporting creates expensive confusion. Local Ads needs analytics that make campaign performance, publisher earnings and fraud risk visible.
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            View dashboard <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
