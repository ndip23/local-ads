import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle,
  FileCheck,
  Globe,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Target,
  Users,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Merchant & Business Directory | Local Ads',
  description: 'A verified merchant and business directory module for Local Ads advertisers, local businesses and niche discovery.',
};

const directoryCategories = [
  { title: 'Real estate firms', description: 'Agents, developers, property managers, short-let operators and property marketplaces.', icon: Building2 },
  { title: 'Construction suppliers', description: 'Cement sellers, building material suppliers, contractors, architects and finishing brands.', icon: Store },
  { title: 'Hotels and hospitality', description: 'Hotels, lounges, event centres, restaurants, tourism services and booking partners.', icon: MapPin },
  { title: 'Professional services', description: 'Law firms, clinics, schools, consultants, finance firms and local service providers.', icon: Users },
];

const profileFields = [
  'Business name, category, location and service coverage.',
  'Verified contact details including phone, email, WhatsApp and website.',
  'Campaign-ready landing profile that explains offers, proof points and call-to-action options.',
  'Trust badges showing verified business, active advertiser, response quality and complaint status.',
  'Lead capture actions for calls, WhatsApp, form enquiries, website visits and direction requests.',
  'Admin review notes so poor-quality listings do not weaken advertiser or publisher trust.',
];

const operatingRules = [
  'Only verified businesses should appear as trusted merchants. Fake businesses will destroy the credibility of the ad network.',
  'Directory profiles must not promise guaranteed results. They should show clear offers, contact routes and campaign history.',
  'Business categories must be controlled by admin so the marketplace does not become a messy dumping ground.',
  'Advertiser profiles should connect to campaign performance so clicks can be tied to real enquiry actions.',
];

const rolloutSteps = [
  'Start with advertisers that already run approved campaigns on Local Ads.',
  'Require profile verification before public listing visibility.',
  'Group businesses by sector so publishers and advertisers can discover relevant local opportunities.',
  'Attach lead actions and campaign history to each merchant profile.',
  'Use directory activity to improve targeting, recommendations and campaign suggestions.',
];

export default function MerchantDirectoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Merchant & business directory</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Turn Local Ads into a searchable network of verified local businesses.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module gives advertisers a public business profile layer so campaign clicks do not end at a blind landing page. Publishers, advertisers and users can discover verified businesses by niche, location and campaign intent.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/lead-management-crm" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              View lead CRM <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/ad-inventory-marketplace" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View inventory marketplace
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Store className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Directory snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Listing type', value: 'Verified merchants' },
              { label: 'Discovery', value: 'Niche + location' },
              { label: 'Actions', value: 'Call, WhatsApp, form' },
              { label: 'Control', value: 'Admin reviewed' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Business categories</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">A directory without category discipline becomes noise</h2>
            <p className="mt-4 text-gray-400">
              Local Ads should organise merchants around sectors that already have advertising demand, publisher relevance and measurable buyer intent.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {directoryCategories.map((item) => {
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
          <FileCheck className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Business profile contents</h2>
          <div className="mt-7 space-y-4">
            {profileFields.map((field) => (
              <p key={field} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {field}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Search className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Directory discovery logic</h2>
          <div className="mt-7 space-y-5">
            {[
              { title: 'Search by niche', text: 'Users can find businesses by sector such as real estate, hotels, construction or local services.' },
              { title: 'Search by location', text: 'Local discovery should respect city, area, state and market coverage rather than forcing generic national results.' },
              { title: 'Search by offer', text: 'Campaign offers, discounts, open houses, product launches and service promotions can be surfaced from active campaigns.' },
              { title: 'Search by trust signal', text: 'Verified status, complaint record, response quality and active advertiser status help users avoid weak listings.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Trust rules</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">The directory must be verified, not just populated</h2>
              <p className="mt-4 leading-7 text-gray-400">
                A weak directory will attract spam businesses, fake offers and low-quality lead traps. The system needs verification, category control and visible trust signals from day one.
              </p>
            </div>
            <div className="space-y-4">
              {operatingRules.map((rule) => (
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
            { title: 'Verified profile', text: 'Advertisers get a structured profile that improves buyer trust before the click becomes a lead.', icon: BadgeCheck },
            { title: 'Lead actions', text: 'Calls, WhatsApp chats, forms and website visits become measurable business actions.', icon: Target },
            { title: 'Category intelligence', text: 'Directory categories improve targeting, publisher matching and campaign recommendations.', icon: BarChart3 },
            { title: 'Publisher value', text: 'Publishers can point audiences toward relevant verified businesses instead of anonymous ad links.', icon: Globe },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Rollout plan</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Build the directory around serious advertisers first</h2>
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

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">A local ad network should help people discover real businesses, not just count clicks.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">Use the directory layer to connect campaigns, business profiles, verified offers and measurable lead actions.</p>
        <Link href="/register?role=advertiser" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700">
          Create advertiser profile <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <MarketingFooter />
    </main>
  );
}
