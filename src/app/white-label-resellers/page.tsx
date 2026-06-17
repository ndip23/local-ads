import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle,
  Crown,
  FileCheck,
  Handshake,
  Layers3,
  Megaphone,
  Paintbrush,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'White-Label & Reseller Module | Local Ads',
  description: 'A commercial white-label and reseller module for Local Ads agencies, niche operators and regional advertising partners.',
};

const resellerTypes = [
  {
    title: 'Agency resellers',
    description: 'Sell Local Ads campaign management under a controlled partner model while the core platform handles approval, tracking and reporting.',
    icon: Megaphone,
  },
  {
    title: 'Niche network operators',
    description: 'Operate focused ad networks for real estate, construction, hotels, business directories, education, events and local news.',
    icon: Layers3,
  },
  {
    title: 'Regional partners',
    description: 'Build city or state-level advertiser and publisher communities without rebuilding the platform from scratch.',
    icon: Building2,
  },
  {
    title: 'Media companies',
    description: 'Add a measurable local CPC layer to existing publisher relationships, audience assets and sales teams.',
    icon: Store,
  },
];

const moduleFeatures = [
  'White-label workspace with partner name, brand colours, support details and approved public positioning.',
  'Reseller dashboard for advertiser portfolio, publisher referrals, campaign status and commission visibility.',
  'Partner commission rules based on active spend, approved clients, clean traffic and payment eligibility.',
  'Niche package builder for verticals such as real estate, construction, hotels, directories, news and local services.',
  'Quality guardrails that keep campaign approval, fraud review, payout control and policy enforcement centralised.',
  'Partner performance reports showing revenue, churn risk, campaign outcomes, support issues and publisher quality.',
];

const pricingModels = [
  { label: 'Referral partner', value: 'Earn commission for approved advertisers, publishers or campaign spend introduced to the network.' },
  { label: 'Managed reseller', value: 'Manage client campaigns with visible portfolio reporting and controlled access to campaign operations.' },
  { label: 'Niche white-label', value: 'Package Local Ads as a sector-specific ad network while keeping platform compliance centralised.' },
  { label: 'Regional operator', value: 'Grow a local market through verified publishers, approved advertisers and quality-first onboarding.' },
];

const guardrails = [
  'Partners cannot approve their own publishers, clear fraud reviews or force payout release.',
  'White-label pages must not promise guaranteed sales, guaranteed leads or unrealistic traffic results.',
  'Reseller commissions should be tied to clean spend and approved activity, not raw signup volume.',
  'Every white-label environment must still show transparent advertiser, publisher and payment policies.',
];

const rolloutSteps = [
  'Start with invite-only partner access for trusted agencies and sector operators.',
  'Give each partner a limited workspace, branded landing page and portfolio reporting.',
  'Track partner-sourced advertisers, publishers, spend, support issues and quality outcomes.',
  'Promote reliable partners into higher reseller tiers based on clean revenue and low dispute rates.',
  'Delay full self-serve white-label access until support, compliance and payment operations are mature.',
];

export default function WhiteLabelResellersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">White-label & reseller module</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Let trusted partners sell Local Ads without losing control of quality, payments or policy.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module gives Local Ads a future reseller layer for agencies, niche operators, media companies and regional partners who want to package the platform for their own market.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/agency-partner-portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              View agency portal <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/partner-network" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View partner network
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Crown className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Reseller snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Access', value: 'Invite first' },
              { label: 'Branding', value: 'Controlled' },
              { label: 'Revenue', value: 'Commission-led' },
              { label: 'Policy', value: 'Centralised' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Who it serves</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Reselling only works when the partner improves distribution without weakening trust</h2>
            <p className="mt-4 text-gray-400">
              This module is not a shortcut for uncontrolled expansion. It is a commercial structure for partners who can bring credible advertisers, serious publishers and clear niche distribution.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resellerTypes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-green-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Paintbrush className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">White-label features</h2>
          <div className="mt-7 space-y-4">
            {moduleFeatures.map((feature) => (
              <p key={feature} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {feature}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <WalletCards className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Commercial models</h2>
          <div className="mt-7 space-y-5">
            {pricingModels.map((model) => (
              <div key={model.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-semibold text-white">{model.label}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{model.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Control rules</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">The platform must remain stronger than the reseller</h2>
              <p className="mt-4 leading-7 text-gray-400">
                The biggest reseller mistake is allowing partners to promise anything just to close sales. That creates refunds, angry publishers, advertiser distrust and reputational damage.
              </p>
            </div>
            <div className="space-y-4">
              {guardrails.map((rule) => (
                <div key={rule} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <p className="text-sm leading-6 text-gray-300">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Brand layer', text: 'Partners can present a controlled market-facing identity without owning platform risk.', icon: Paintbrush },
            { title: 'Portfolio view', text: 'Resellers need advertiser, publisher and campaign visibility in one workspace.', icon: BarChart3 },
            { title: 'Partner tiers', text: 'Better partners earn more access through clean growth and low dispute rates.', icon: BadgeCheck },
            { title: 'Support path', text: 'Reseller clients need escalation routes that do not disappear into generic support.', icon: Handshake },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-green-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Rollout discipline</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">White-label should come after trust, not before it</h2>
          </div>
          <div className="mx-auto mt-10 max-w-4xl space-y-4">
            {rolloutSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-300">{index + 1}</span>
                <p className="text-sm leading-6 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">A reseller programme can multiply growth, but only after the rules are strong.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
            Local Ads should use white-label carefully: protect the advertiser, protect the publisher, then reward the partner who brings quality demand and supply.
          </p>
          <Link href="/api-integrations" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
            View API integration module <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
