import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Building2,
  CheckCircle,
  ClipboardCheck,
  FileCheck,
  Handshake,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Agency Partner Portal | Local Ads',
  description: 'A structured agency partner module for Local Ads campaign resellers, media buyers, growth consultants and local business agents.',
};

const partnerTypes = [
  {
    title: 'Digital marketing agencies',
    description: 'Run managed CPC campaigns for SMEs, property firms, hotels, schools, ecommerce brands and service businesses.',
    icon: Megaphone,
  },
  {
    title: 'Media buying consultants',
    description: 'Plan local audience packages, recommend publisher niches and monitor campaign delivery for retained clients.',
    icon: BarChart3,
  },
  {
    title: 'Business development agents',
    description: 'Introduce advertisers and publishers, qualify leads and hand them into a controlled onboarding workflow.',
    icon: Users,
  },
  {
    title: 'Industry associations',
    description: 'Help clusters such as real estate, construction, hotels and local directories reach relevant audiences.',
    icon: Building2,
  },
];

const portalFeatures = [
  'Partner account profile with assigned client portfolio.',
  'Advertiser lead submission and status tracking.',
  'Publisher referral tracking with approval visibility.',
  'Campaign briefing checklist before handover to admin.',
  'Commission ledger for qualified referrals and managed accounts.',
  'Support escalation path for campaign, wallet and approval issues.',
];

const operatingRules = [
  { label: 'Lead quality', value: 'Only serious advertisers and verified publishers should be submitted.' },
  { label: 'Commission basis', value: 'Rewards should be tied to approved clients, active spend and clean traffic outcomes.' },
  { label: 'Client ownership', value: 'Partner-sourced clients remain visible in the partner portal for performance follow-up.' },
  { label: 'Abuse control', value: 'Fake signups, recycled leads and misleading claims should trigger partner review.' },
];

const workflow = [
  'Partner qualifies advertiser, publisher or local business lead.',
  'Partner submits the lead with website, niche, location and business objective.',
  'Admin reviews the lead before account approval or campaign setup.',
  'Approved client becomes visible in the partner portfolio.',
  'Spend, publisher approval and commission events are tracked transparently.',
];

export default function AgencyPartnerPortalPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Agency partner portal</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Let agencies and local growth partners sell Local Ads without turning the platform messy.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module creates a structured partner layer for agencies, consultants, media buyers and business development partners who bring advertisers and publishers into the network.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              Apply as partner <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/partner-network" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View partner network
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Handshake className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Portal snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Client leads', value: 'Track status' },
              { label: 'Commission', value: 'Visible ledger' },
              { label: 'Campaign briefs', value: 'Standardised' },
              { label: 'Support', value: 'Direct escalation' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Who it serves</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Partners need boundaries, not vague affiliate promises</h2>
            <p className="mt-4 text-gray-400">
              Without rules, partner programmes attract noise. This portal separates serious campaign partners from people who only want quick referral payouts.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {partnerTypes.map((item) => {
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

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <ClipboardCheck className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Partner portal features</h2>
          <div className="mt-7 space-y-4">
            {portalFeatures.map((feature) => (
              <p key={feature} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {feature}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <BadgePercent className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Commercial operating rules</h2>
          <div className="mt-7 space-y-5">
            {operatingRules.map((rule) => (
              <div key={rule.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-semibold text-white">{rule.label}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{rule.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Partner workflow</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">A controlled path from lead to commission</h2>
              <p className="mt-4 leading-7 text-gray-400">
                The partner module should prevent a common mistake: paying for raw referrals before proving that the client is legitimate, active and valuable to the network.
              </p>
            </div>
            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-300">{index + 1}</span>
                  <p className="text-sm leading-6 text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Approval first', text: 'Partners do not bypass advertiser, publisher or campaign review.', icon: FileCheck },
            { title: 'Quality protected', text: 'Commission logic should reward qualified growth, not inflated signups.', icon: ShieldCheck },
            { title: 'Support visible', text: 'Partners need a clear escalation route when client spend or approval is blocked.', icon: LifeBuoy },
            { title: 'Payout traceable', text: 'Partner earnings should be tied to client status, spend events and payout eligibility.', icon: WalletCards },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">A partner channel can grow Local Ads faster, but only if it is governed.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            This module gives Local Ads a proper B2B acquisition layer without letting agencies, resellers or referral agents dilute platform trust.
          </p>
          <Link href="/ad-inventory-marketplace" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Open inventory marketplace <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
