import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  DollarSign,
  Eye,
  FileCheck,
  LifeBuoy,
  Megaphone,
  MousePointerClick,
  ShieldCheck,
  Target,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Advertiser Trust Centre | Local Ads',
  description: 'Transparent advertiser rules, campaign review, spend protection and reporting standards for Local Ads advertisers.',
};

const trustPromises = [
  {
    title: 'Spend is visible',
    description: 'Advertisers should see wallet funding, campaign spend, remaining budget, CPC, pending reviews and rejected activity without chasing support.',
    icon: WalletCards,
  },
  {
    title: 'Traffic is reviewed',
    description: 'Clicks are not automatically treated as valid. Suspicious repeat clicks, bot-like sessions and low-quality patterns are separated for review.',
    icon: ShieldCheck,
  },
  {
    title: 'Campaigns are approved before delivery',
    description: 'Ads are checked for clear offers, working landing pages, acceptable content, correct CTA selection and safe creative material.',
    icon: FileCheck,
  },
  {
    title: 'Results go beyond clicks',
    description: 'Advertisers need conversion tracking, publisher source quality, country performance and engagement signals to know what is actually working.',
    icon: BarChart3,
  },
];

const advertiserRights = [
  'See how every campaign budget is used before, during and after delivery.',
  'Know whether traffic came from approved publisher placements.',
  'Challenge suspicious activity through the dispute and refund workflow.',
  'Receive clear campaign rejection reasons instead of vague approval delays.',
  'Access direct support when spend, tracking or approval issues affect campaign delivery.',
  'Review performance by campaign, country, publisher fit, CTA and conversion signal.',
];

const spendControls = [
  { label: 'Wallet funding', value: 'Deposit record + available balance' },
  { label: 'Daily pacing', value: 'Daily budget guardrails' },
  { label: 'Total campaign cap', value: 'No unlimited spend leakage' },
  { label: 'Invalid activity', value: 'Separated before final settlement' },
  { label: 'Refund review', value: 'Evidence-based dispute workflow' },
];

const reviewChecklist = [
  'The offer is clear and not misleading.',
  'The landing page loads and matches the ad promise.',
  'The uploaded image or video is brand-safe and readable.',
  'The CTA matches the real user action required.',
  'The target country and niche selection are commercially logical.',
  'The campaign has a measurable outcome such as lead, quote, purchase, booking or signup.',
];

export default function AdvertiserTrustPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Advertiser trust centre</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Advertisers should never feel like their budget disappeared into a black box.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module explains how Local Ads protects advertiser spend through visible reporting, campaign approval, traffic review, refund handling and direct support.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              Start as advertiser <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/campaign-performance-lab" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              Open performance lab
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-white">Advertiser transparency snapshot</h2>
          <div className="mt-6 space-y-5">
            {spendControls.map((item) => (
              <div key={item.label} className="flex justify-between border-b border-gray-800 pb-4 text-sm last:border-0 last:pb-0">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-right font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Trust promises</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">The rules advertisers need before they spend real money</h2>
            <p className="mt-4 text-gray-400">
              If advertisers cannot see budget usage, traffic quality and campaign status, they will assume the platform is hiding weak results. This module removes that suspicion.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trustPromises.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Megaphone className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Advertiser rights</h2>
          <div className="mt-7 space-y-4">
            {advertiserRights.map((right) => (
              <p key={right} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {right}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Target className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Campaign review checklist</h2>
          <p className="mt-4 leading-7 text-gray-400">
            Review is not bureaucracy. It protects advertisers from weak campaigns and protects publishers from unsafe or misleading ads.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {reviewChecklist.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-800 bg-gray-950 p-4 text-sm leading-6 text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Click quality', text: 'Advertisers should know which clicks were qualified, rejected or held for review.', icon: MousePointerClick },
              { title: 'Placement quality', text: 'Publisher source, niche and placement context should be visible in reporting.', icon: Eye },
              { title: 'Refund path', text: 'Disputed spend should follow an evidence-based workflow, not emotional negotiation.', icon: DollarSign },
              { title: 'Direct support', text: 'Advertisers need human support when approval, tracking or wallet issues affect spend.', icon: LifeBuoy },
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
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">Trustworthy advertising starts before the first click.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Local Ads must win advertiser confidence by making spend, traffic, approval decisions and dispute handling visible from day one.
          </p>
          <Link href="/pricing" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Review pricing and spend rules <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
