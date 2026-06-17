import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Compass,
  FileCheck,
  Globe,
  Layers3,
  MapPin,
  MousePointerClick,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

const zoneTypes = [
  {
    title: 'City and state targeting',
    description: 'Run campaigns by major cities, states or commercial regions instead of wasting spend on audiences outside the advertiser\'s market.',
    icon: Globe,
  },
  {
    title: 'LGA and neighbourhood zones',
    description: 'Create tighter local zones for Lagos Island, Ikeja, Lekki, Port Harcourt, Abuja districts and other high-intent areas.',
    icon: MapPin,
  },
  {
    title: 'Publisher niche-location match',
    description: 'Pair campaigns with publishers whose location and content niche make sense for the advertiser\'s offer.',
    icon: Layers3,
  },
  {
    title: 'Budget by local zone',
    description: 'Allocate budget based on zone value, competition, lead intent and historical campaign response.',
    icon: SlidersHorizontal,
  },
];

const targetingWorkflow = [
  'Advertiser selects campaign country, state, city and preferred local zone.',
  'Platform checks whether available publishers have enough relevant inventory in that location.',
  'Campaign receives a zone-fit score based on niche, publisher placement quality and expected audience intent.',
  'Admin reviews suspicious or overly broad targeting before campaign approval.',
  'Performance reports separate results by local zone so advertisers see where budget is working.',
];

const qualityControls = [
  'Do not pretend local targeting exists when the publisher inventory cannot support it.',
  'Warn advertisers when their selected zone is too narrow to deliver enough impressions.',
  'Flag campaigns that target unrelated zones just to chase cheap traffic.',
  'Give publishers credit when their local audience produces strong valid clicks and leads.',
  'Use zone-level performance to improve future campaign recommendations instead of relying on raw clicks.',
];

const suggestedZones = [
  { sector: 'Real Estate', zones: 'Lekki, Ajah, Ikeja GRA, Victoria Island, Abuja districts', goal: 'Inspection bookings, enquiries and lead capture' },
  { sector: 'Construction', zones: 'Developing estates, commercial corridors and contractor-heavy LGAs', goal: 'Supplier enquiries, quote requests and project leads' },
  { sector: 'Hotels', zones: 'Airport areas, event districts, tourism corridors and business hubs', goal: 'Bookings, calls and WhatsApp reservations' },
  { sector: 'Business Directories', zones: 'High-search urban markets and service clusters', goal: 'Profile visits, calls and category discovery' },
];

export default function GeoTargetingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Geo-ad targeting and local zones</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Local advertising fails when the platform cannot control where the attention is coming from.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module gives Local Ads a structured local-zone targeting layer for advertisers, publishers and admins. It explains how campaigns can be matched by location, niche, inventory quality and commercial intent instead of using weak broad targeting.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/ad-inventory-marketplace" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              View inventory marketplace <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/targeting" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View targeting module
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Compass className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Zone control snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Targeting level', value: 'City + LGA' },
              { label: 'Inventory match', value: 'Niche-aware' },
              { label: 'Budget logic', value: 'Zone-based' },
              { label: 'Reporting', value: 'Location split' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Targeting layers</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Local zones should be specific enough to matter and broad enough to deliver</h2>
            <p className="mt-4 text-gray-400">
              The mistake most small ad networks make is claiming local targeting without a clear inventory and approval logic. This module forces Local Ads to be honest about what can be delivered.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {zoneTypes.map((item) => {
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
          <Target className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Geo-targeting workflow</h2>
          <div className="mt-7 space-y-4">
            {targetingWorkflow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-300">{index + 1}</span>
                <p className="text-sm leading-6 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <ShieldCheck className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Quality controls</h2>
          <p className="mt-4 leading-7 text-gray-400">
            Geo-targeting is dangerous when it becomes a sales promise without operational backing. These rules protect advertisers from fake precision and protect publishers from unfair comparisons.
          </p>
          <div className="mt-7 space-y-4">
            {qualityControls.map((rule) => (
              <p key={rule} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {rule}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Niche zone examples</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Targeting should follow commercial behaviour, not just geography</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {suggestedZones.map((item) => (
              <div key={item.sector} className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-300">{item.sector}</p>
                <h3 className="mt-3 text-xl font-bold text-white">{item.zones}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Primary campaign goal: {item.goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Better spend control', text: 'Advertisers can stop spreading small budgets across irrelevant regions.', icon: BarChart3 },
            { title: 'Better publisher rewards', text: 'Publishers with real local influence can earn more than publishers with empty traffic volume.', icon: MousePointerClick },
            { title: 'Better campaign approval', text: 'Admins can reject campaigns whose location promise does not match available inventory.', icon: FileCheck },
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

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">Local targeting must be accountable, not decorative.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">Use zone-level targeting to align advertiser budget, publisher inventory and real local audience intent.</p>
        <Link href="/register?role=advertiser" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
          Start a local campaign <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <MarketingFooter />
    </main>
  );
}
