import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle,
  Handshake,
  LineChart,
  MapPin,
  Megaphone,
  Network,
  ShieldCheck,
  Store,
  UsersRound,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Partner Network | Local Ads',
  description: 'Partner network module for agencies, media owners, community partners and local growth partners on Local Ads.',
};

const partnerTypes = [
  {
    title: 'Digital agencies',
    description: 'Manage advertiser demand, package Local Ads into client campaigns and help businesses launch stronger CPC offers.',
    icon: Building2,
    benefits: ['Client campaign support', 'Multi-brand growth channel', 'Reporting-ready ad inventory'],
  },
  {
    title: 'Media owners',
    description: 'Bring blogs, niche websites, newsletters, communities and content platforms into a cleaner monetisation system.',
    icon: Megaphone,
    benefits: ['Publisher onboarding path', 'Traffic quality standards', 'Earnings transparency'],
  },
  {
    title: 'Community partners',
    description: 'Help local businesses reach trusted audiences through verified neighbourhood, campus, church, event and SME channels.',
    icon: UsersRound,
    benefits: ['Local trust advantage', 'Campaign education', 'Market-by-market expansion'],
  },
  {
    title: 'Business directories',
    description: 'Connect listed businesses to ads, offers and campaign landing pages without turning the directory into spam.',
    icon: Store,
    benefits: ['SME advertiser pipeline', 'Location-based packages', 'Cleaner lead generation'],
  },
];

const operatingRules = [
  'Partners should bring verified advertiser or publisher demand, not fake traffic or empty signups.',
  'Every partner relationship must improve campaign quality, publisher quality, or market reach.',
  'Partner activity should be measurable through accounts, campaigns, clicks, conversions and revenue contribution.',
  'A partner programme without standards becomes a referral mess. Local Ads should reward quality, not noise.',
];

const partnerFlow = [
  { title: 'Apply', description: 'Partner submits business type, audience, market focus and proposed contribution.', icon: Handshake },
  { title: 'Review', description: 'Admin checks fit, reputation, audience quality and whether the partner can create real value.', icon: ShieldCheck },
  { title: 'Activate', description: 'Partner receives onboarding guidance, campaign education and tracked signup pathways.', icon: Network },
  { title: 'Measure', description: 'Performance is reviewed by signups, approved campaigns, active publishers and qualified traffic.', icon: LineChart },
];

export default function PartnerNetworkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Partner network module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Build local advertising reach through agencies, media owners and trusted community partners.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Local Ads should not depend only on random signups. This module gives the platform a structured way to recruit partners who can bring advertisers, publishers, local markets and credible distribution.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Become a partner <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/advertisers" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Explore advertiser value <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {partnerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{type.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{type.description}</p>
                <div className="mt-5 space-y-2">
                  {type.benefits.map((benefit) => (
                    <p key={benefit} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      {benefit}
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Partner workflow</p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">A partner programme needs a controlled path, not random referrals.</h2>
            <p className="mt-4 text-gray-400">
              The weak version of partnership is giving everyone a link and hoping for growth. The stronger version is screening, activating and measuring each partner.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {partnerFlow.map((step, index) => {
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
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <MapPin className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Why this module matters</h2>
            <p className="mt-4 leading-7 text-gray-400">
              A local ad network must solve distribution. Without partners, the platform waits passively for advertisers and publishers. With a partner network, the business can expand through people who already have access to SMEs, local media and trusted audiences.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <h2 className="text-3xl font-bold text-white">Partner operating standards</h2>
            <div className="mt-7 space-y-4">
              {operatingRules.map((rule) => (
                <p key={rule} className="flex gap-3 text-gray-300">
                  <BadgeCheck className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <Handshake className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Use partners to scale reach without losing quality control.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Partners should help Local Ads grow advertiser demand, publisher supply and local trust. Anything outside that is distraction.
          </p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Start partner onboarding <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
