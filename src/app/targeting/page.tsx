import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Compass,
  Crosshair,
  Eye,
  Filter,
  Globe2,
  Layers3,
  MapPin,
  MousePointerClick,
  Radar,
  SlidersHorizontal,
  Target,
  Users,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Audience Targeting | Local Ads',
  description: 'Audience targeting module for local CPC campaigns, country targeting, niches, placement fit and campaign quality on Local Ads.',
};

const targetingLayers = [
  {
    title: 'Country and market targeting',
    description: 'Control where campaigns are allowed to run so advertisers do not pay for traffic from markets they cannot serve.',
    icon: Globe2,
    checks: ['Country-level CPC rules', 'Market availability guidance', 'Budget protection by region'],
  },
  {
    title: 'Publisher niche matching',
    description: 'Match campaigns to publisher categories so ads appear in a context that makes sense to the reader.',
    icon: Layers3,
    checks: ['Business, lifestyle, education, real estate and retail niches', 'Placement relevance scoring', 'Campaign-to-site fit review'],
  },
  {
    title: 'Audience intent signals',
    description: 'Use campaign objective, CTA and landing-page type to suggest where an advert is most likely to perform.',
    icon: Crosshair,
    checks: ['Lead generation intent', 'Shopping intent', 'Signup and booking intent'],
  },
  {
    title: 'Device and placement fit',
    description: 'Protect ad quality by checking how creative assets will behave on mobile, desktop, widget and link placements.',
    icon: Eye,
    checks: ['Mobile preview quality', 'Banner readability', 'Video suitability check'],
  },
];

const campaignTargetingFlow = [
  { title: 'Define objective', description: 'Choose whether the campaign is built for leads, sales, bookings, downloads, awareness or event promotion.', icon: Target },
  { title: 'Choose audience context', description: 'Select countries, niches, publisher categories and location-sensitive campaign rules.', icon: MapPin },
  { title: 'Review fit', description: 'Compare the campaign offer, creative, CTA and landing page against the selected audience.', icon: Filter },
  { title: 'Optimise after launch', description: 'Use click, conversion and publisher data to remove weak placements and scale stronger ones.', icon: BarChart3 },
];

const suggestions = [
  'Real estate campaigns should prioritise city, property, finance, business and neighbourhood publisher contexts.',
  'Education campaigns should target student, parent, career, community and youth-focused publisher environments.',
  'Retail campaigns should use product-led images, clear offer language and shopping-friendly CTA options.',
  'Service campaigns should use location-sensitive copy and CTAs such as Book Now, Request Quote or Contact Us.',
  'Event campaigns should avoid broad targeting when the venue, date or city is the actual purchase trigger.',
  'Lead campaigns should be judged by conversion quality, not just the cheapest clicks.',
];

const weakTargetingProblems = [
  'Spending money in countries or cities the advertiser cannot serve.',
  'Showing ads on publisher categories that have no connection to the offer.',
  'Using the wrong CTA for the user journey after the click.',
  'Approving creatives that look fine in the form but fail in real placement sizes.',
  'Optimising only for cheap clicks and ignoring lead quality.',
];

export default function TargetingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Audience targeting module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Stop treating every click as equal. Put campaigns in front of the right local audience.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Local Ads needs targeting that is practical, not decorative. This module helps advertisers choose market, niche, placement and intent rules before campaign budget is wasted.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Create targeted campaign <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/analytics" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Connect to reporting <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {targetingLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{layer.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{layer.description}</p>
                <div className="mt-5 space-y-2">
                  {layer.checks.map((check) => (
                    <p key={check} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      {check}
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
            <Radar className="mx-auto h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Targeting should happen before approval, not after budget has leaked.</h2>
            <p className="mt-4 text-gray-400">
              A campaign can have a good headline and still fail because it is shown in the wrong market or publisher context. The targeting layer prevents that obvious waste.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {campaignTargetingFlow.map((step, index) => {
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
            <Compass className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Campaign targeting suggestions</h2>
            <div className="mt-7 space-y-4">
              {suggestions.map((suggestion) => (
                <p key={suggestion} className="flex gap-3 text-gray-300">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {suggestion}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <SlidersHorizontal className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Weak targeting this module exposes</h2>
            <div className="mt-7 space-y-4">
              {weakTargetingProblems.map((problem) => (
                <p key={problem} className="flex gap-3 text-gray-300">
                  <MousePointerClick className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                  {problem}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <Users className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Good targeting protects advertisers and rewards better publishers.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            When targeting is strong, advertisers waste less budget and publishers with relevant audiences become more valuable to the network.
          </p>
          <Link href="/advertisers" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            See advertiser tools <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
