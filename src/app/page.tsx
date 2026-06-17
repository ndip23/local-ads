import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Code2,
  CheckCircle,
  Compass,
  DollarSign,
  FileChartColumn,
  FileCheck,
  Globe,
  Handshake,
  LifeBuoy,
  Layers3,
  MapPin,
  Megaphone,
  MousePointerClick,
  Repeat,
  Shield,
  Target,
  UploadCloud,
  Store,
  ClipboardCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { DashboardScreenshots } from '@/components/marketing/dashboard-screenshots';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { blogPosts, firstCaseStudy } from '@/lib/marketing-content';

const features = [
  {
    title: 'Country-based CPC',
    description: 'Set different CPC rates by country and stop wasting budget on markets you are not targeting.',
    icon: Globe,
  },
  {
    title: 'Fraud protection',
    description: 'Detect suspicious repeat clicks, bot-like traffic and low-quality activity before it damages the network.',
    icon: Shield,
  },
  {
    title: 'Real-time analytics',
    description: 'Track clicks, conversions, publisher performance, wallet activity and campaign status from one dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Direct media uploads',
    description: 'Upload campaign images and videos directly, then preview the ad before submitting it for approval.',
    icon: UploadCloud,
  },
  {
    title: 'Publisher earnings',
    description: 'Reward publishers with an 80% revenue share for quality traffic and verified placements.',
    icon: DollarSign,
  },
  {
    title: 'Conversion pixels',
    description: 'Move beyond clicks by tracking leads, signups, purchases and other campaign actions.',
    icon: MousePointerClick,
  },
];

const steps = [
  {
    title: 'Advertisers create campaigns',
    description: 'Upload an image or video, choose a CTA, set budgets, define target countries and submit for approval.',
    icon: Megaphone,
  },
  {
    title: 'Admin reviews quality',
    description: 'Campaigns, users, publisher sites, country rates, withdrawals and suspicious activity are controlled centrally.',
    icon: FileCheck,
  },
  {
    title: 'Publishers promote approved ads',
    description: 'Publishers use tracking links and widgets that match their audience, niche and content environment.',
    icon: Users,
  },
  {
    title: 'Everyone tracks performance',
    description: 'Clicks, conversions, revenue share and wallet balances are measured so the platform does not run on guesswork.',
    icon: Target,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center md:py-28">
        <p className="mx-auto mb-5 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200">
          Built for local advertisers, publishers and performance-focused growth teams
        </p>
        <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-tight text-white md:text-7xl">
          Local advertising that connects real campaigns with real publisher traffic.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">
          Local Ads gives advertisers measurable CPC campaigns and gives publishers a fair way to earn from quality traffic without surrendering control of their audience.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700">
            Start as Advertiser <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-950 transition-colors hover:bg-gray-100">
            Join as Publisher <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-4xl font-bold text-blue-400">80%</p>
            <p className="mt-2 text-sm text-gray-400">Publisher revenue share</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-4xl font-bold text-blue-400">CPC</p>
            <p className="mt-2 text-sm text-gray-400">Budget-controlled model</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-4xl font-bold text-blue-400">Pixel</p>
            <p className="mt-2 text-sm text-gray-400">Conversion tracking</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-4xl font-bold text-blue-400">Admin</p>
            <p className="mt-2 text-sm text-gray-400">Approval and fraud review</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20" id="how-it-works">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">A simple operating model with accountability built in</h2>
            <p className="mt-4 text-gray-400">
              The platform does not just throw ads on pages. It creates a controlled loop between advertisers, publishers, admin approval and performance tracking.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-600">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <DashboardScreenshots />

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher-first trust layer</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Local Ad Network now explains how publishers are protected, paid and evaluated.</h2>
            <p className="mt-4 text-gray-400">
              The new publisher trust system publishes the mission, payment policy, quality score, tiers, onboarding rules, qualification flow, support access, roadmap, niche pages and earnings calculation logic.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/publisher-trust', title: 'Publisher Trust Centre', text: 'Mission, rules, roadmap and publisher-first positioning.', icon: Users },
              { href: '/publisher-payments', title: 'Payment Policy', text: 'Thresholds, payout schedule, methods and approved balance rules.', icon: WalletCards },
              { href: '/traffic-quality', title: 'Traffic Quality Score', text: 'Open scoring logic that rewards clean, engaged traffic.', icon: Shield },
              { href: '/publisher-metrics', title: 'Earnings Calculator', text: 'Transparent earning formula and estimated value tool.', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-3xl border border-gray-800 bg-gray-950 p-6 transition-colors hover:border-green-500/60">
                  <Icon className="h-10 w-10 text-green-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-300">View resource <ArrowRight className="h-4 w-4" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Platform features</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Built for the parts that actually decide whether ad spend works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                  <Icon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">For Advertisers</h2>
            <p className="mt-4 text-gray-400">Launch campaigns with controlled budgets, creative previews, media uploads, CTA guidance and conversion tracking.</p>
            <div className="mt-6 space-y-3">
              {['Create CPC campaigns by country and niche', 'Upload banner images and video ads directly', 'Use conversion pixels to track lead quality', 'Control spend with daily and total budgets'].map((item) => (
                <p key={item} className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" /> {item}</p>
              ))}
            </div>
            <Link href="/advertisers" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              View Advertiser Page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">For Publishers</h2>
            <p className="mt-4 text-gray-400">Earn from approved campaigns using tracking links, widgets, site verification and transparent wallet reporting.</p>
            <div className="mt-6 space-y-3">
              {['Earn 80% of qualified click revenue', 'Choose campaigns aligned with your audience', 'Generate tracking links and widgets quickly', 'Use payout and earnings dashboards'].map((item) => (
                <p key={item} className="flex items-center gap-3 text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" /> {item}</p>
              ))}
            </div>
            <Link href="/publishers" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
              View Publisher Page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">First case study</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{firstCaseStudy.title}</h2>
            <p className="mt-4 text-gray-400">{firstCaseStudy.challenge}</p>
            <Link href="/case-studies" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-950 hover:bg-gray-100">
              Read Case Study <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Latest blog</p>
            <div className="mt-5 space-y-4">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:border-blue-500/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">{post.category}</p>
                  <h3 className="mt-2 font-bold text-white">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Dashboard feature modules</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">The operational modules now live where they belong: inside the logged-in dashboard.</h2>
            <p className="mt-4 text-gray-400">
              The homepage should sell the platform, not behave like a dumping ground for every internal tool. Ad trust, performance lab, geo zones, targeting, disputes, approvals, wallet operations and metrics are now grouped as actionable dashboard features for advertisers, publishers and admins.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Ad Trust', text: 'Spend visibility, fraud review, wallet confidence and evidence-based support.', icon: Shield },
              { title: 'Performance Lab', text: 'Campaign analytics, conversion tracking, CPC learning and optimisation signals.', icon: Target },
              { title: 'Geo Zones', text: 'Country CPC, local-zone controls, campaign geography and market rules.', icon: MapPin },
              { title: 'Targeting', text: 'Niche matching, publisher fit, placement quality and campaign audience controls.', icon: Compass },
              { title: 'Disputes', text: 'Refund requests, suspicious traffic complaints and payout issue resolution.', icon: LifeBuoy },
              { title: 'Approvals', text: 'Campaign approval, publisher verification and admin review workflows.', icon: ClipboardCheck },
              { title: 'Wallet', text: 'Deposits, publisher balances, withdrawals and transaction records.', icon: WalletCards },
              { title: 'Metrics', text: 'Clicks, conversions, earnings, traffic quality and platform reporting.', icon: FileChartColumn },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
              Login to open module centre <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">Ready to build a cleaner local ad network?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">Create an account, choose your role and start using the dashboard built for your side of the marketplace.</p>
        <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
          Create Free Account <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <MarketingFooter />
    </main>
  );
}
