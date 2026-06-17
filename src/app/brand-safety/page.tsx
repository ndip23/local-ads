import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  EyeOff,
  FileWarning,
  LockKeyhole,
  MegaphoneOff,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserCheck,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Brand Safety & Compliance | Local Ads',
  description: 'Brand safety, ad quality, publisher compliance, fraud review and policy standards module for Local Ads.',
};

const safetyAreas = [
  {
    title: 'Advertiser quality review',
    description: 'Check campaigns before approval so misleading offers, poor landing pages and unsafe creative do not damage the network.',
    icon: ClipboardCheck,
    points: ['Landing-page review', 'Creative readability checks', 'CTA and offer alignment'],
  },
  {
    title: 'Publisher placement standards',
    description: 'Keep ads away from low-quality, misleading or abusive publisher environments that will ruin advertiser trust.',
    icon: ShieldCheck,
    points: ['Site ownership review', 'Content category checks', 'Placement behaviour rules'],
  },
  {
    title: 'Fraud and abuse control',
    description: 'Flag suspicious activity before it becomes a payout, budget or reputation problem.',
    icon: ShieldAlert,
    points: ['Repeated click detection', 'Suspicious device and IP patterns', 'Publisher traffic warnings'],
  },
  {
    title: 'Policy and compliance guidance',
    description: 'Give users clear rules before they submit campaigns or publisher sites for review.',
    icon: Scale,
    points: ['Restricted content rules', 'Disclosure requirements', 'Account enforcement path'],
  },
];

const reviewQueue = [
  { title: 'Campaign submitted', description: 'Advertiser submits creative, CTA, landing page, budget and target market.', icon: BadgeCheck },
  { title: 'Automated checks', description: 'System checks URL format, uploaded media, required fields and obvious policy risks.', icon: LockKeyhole },
  { title: 'Admin review', description: 'Admin checks offer quality, brand safety, publisher suitability and user history.', icon: UserCheck },
  { title: 'Approve, reject or revise', description: 'Campaign is approved, rejected or returned with correction notes before spend begins.', icon: FileWarning },
];

const blockedOrRestricted = [
  'Misleading income, investment or guaranteed-result claims.',
  'Landing pages that do not match the advert promise.',
  'Creative with unreadable text, broken video, fake buttons or deceptive visual elements.',
  'Publisher placements that encourage accidental clicks or forced clicking.',
  'Suspicious click bursts, repeated IP activity or traffic that does not behave like real users.',
  'Campaigns that point users to unsafe, broken or unrelated external pages.',
];

const trustRules = [
  'Advertisers should know why a campaign was rejected and what must be corrected.',
  'Publishers should know which placement behaviours can lead to earnings reversal.',
  'Admins need a review queue that separates policy issues from fraud issues.',
  'Wallet payouts should be tied to qualified activity, not raw click volume alone.',
  'Every rejection, suspension and appeal should leave an audit trail.',
];

export default function BrandSafetyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Brand safety and compliance module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Protect advertiser budgets, publisher trust and platform reputation before scale exposes the weak spots.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          An ad network without strong policy controls becomes a magnet for bad ads, fake clicks and angry users. This module defines the safety layer Local Ads needs before aggressive growth.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/help" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Read platform rules <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/analytics" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Review fraud signals <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {safetyAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div key={area.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{area.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{area.description}</p>
                <div className="mt-5 space-y-2">
                  {area.points.map((point) => (
                    <p key={point} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Siren className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Safety should be an operating system, not a complaint form.</h2>
            <p className="mt-4 text-gray-400">
              If abuse is only handled after users complain, the platform is already behind. Review rules should be embedded before campaigns, clicks and payouts move forward.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reviewQueue.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-9 w-9 text-green-400" />
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

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <AlertTriangle className="h-12 w-12 text-red-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Blocked or restricted patterns</h2>
            <div className="mt-7 space-y-4">
              {blockedOrRestricted.map((item) => (
                <p key={item} className="flex gap-3 text-gray-300">
                  <EyeOff className="mt-1 h-5 w-5 flex-shrink-0 text-red-400" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <Shield className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Trust rules the platform should enforce</h2>
            <div className="mt-7 space-y-4">
              {trustRules.map((rule) => (
                <p key={rule} className="flex gap-3 text-gray-300">
                  <MegaphoneOff className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Growth without safety will punish the product later.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            The honest strategy is to build strict rules early. That protects serious advertisers, serious publishers and the credibility of the Local Ads marketplace.
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Go to dashboard <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
