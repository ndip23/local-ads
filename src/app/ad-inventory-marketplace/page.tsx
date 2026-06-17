import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Eye,
  Gauge,
  Layers3,
  LayoutGrid,
  MapPinned,
  MousePointerClick,
  Target,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Ad Inventory Marketplace | Local Ads',
  description: 'A transparent inventory marketplace for approved Local Ads publisher placements, niches, formats and traffic quality signals.',
};

const inventoryTypes = [
  {
    title: 'Real estate placements',
    description: 'Listing pages, property guides, estate news, agent directories and neighbourhood content with buyer intent.',
    metric: 'High commercial intent',
  },
  {
    title: 'Construction placements',
    description: 'Building materials, contractor pages, project updates and procurement content for B2B campaigns.',
    metric: 'Strong trade relevance',
  },
  {
    title: 'Hotel and travel placements',
    description: 'Hotel guides, destination pages, booking content and local tourism articles for hospitality advertisers.',
    metric: 'Booking-oriented audience',
  },
  {
    title: 'News and community placements',
    description: 'Local news, community updates and city-specific content suitable for broad awareness campaigns.',
    metric: 'Broad local reach',
  },
  {
    title: 'Business directory placements',
    description: 'Category pages, vendor listings and comparison pages where users already search for services.',
    metric: 'Service discovery intent',
  },
  {
    title: 'Special interest placements',
    description: 'Niche blogs, professional communities and topic-specific pages with smaller but more engaged audiences.',
    metric: 'Focused engagement',
  },
];

const marketplaceMetrics = [
  { label: 'Niche', value: 'Publisher category and audience intent' },
  { label: 'Format', value: 'Banner, native card, video, sidebar or in-article' },
  { label: 'Quality score', value: 'Traffic integrity and engagement rating' },
  { label: 'Estimated CPC range', value: 'Suggested rate band before campaign launch' },
  { label: 'Availability', value: 'Open, limited, paused or under review' },
];

const workflow = [
  'Publisher submits website and placement inventory for review.',
  'Admin checks niche fit, traffic quality, content safety and ad position.',
  'Approved placements appear in the inventory marketplace with quality signals.',
  'Advertisers shortlist inventory by niche, country, format and audience intent.',
  'Campaign delivery and reporting show which placements produced valid engagement.',
];

const qualityControls = [
  'No hidden placements, auto-click traps or misleading ad labels.',
  'No inventory from bot-heavy, scraped, adult, violent or low-trust content environments.',
  'Inventory must show real audience fit, not just raw pageview numbers.',
  'Placement performance should be reviewed continuously and downgraded when quality drops.',
];

export default function AdInventoryMarketplacePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Ad inventory marketplace</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Show advertisers where their ads can run before they spend.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module turns publisher placements into a transparent marketplace, so advertisers can compare niches, formats, quality scores and availability instead of buying blind traffic.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              Explore as advertiser <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/publisher-niches" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View publisher niches
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <LayoutGrid className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Marketplace visibility</h2>
          <div className="mt-6 space-y-5">
            {marketplaceMetrics.map((item) => (
              <div key={item.label} className="flex justify-between border-b border-gray-800 pb-4 text-sm last:border-0 last:pb-0">
                <span className="text-gray-400">{item.label}</span>
                <span className="max-w-[55%] text-right font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Inventory categories</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Package placements by audience intent, not random website traffic</h2>
            <p className="mt-4 text-gray-400">
              The inventory marketplace makes it easier to sell high-quality publisher supply because every placement has context, category and performance expectations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventoryTypes.map((item) => (
              <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
                <Layers3 className="h-10 w-10 text-green-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                <p className="mt-5 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">{item.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <ClipboardList className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Marketplace workflow</h2>
          <div className="mt-7 space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-300">{index + 1}</span>
                <p className="text-sm leading-6 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Gauge className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Inventory card preview</h2>
          <p className="mt-4 leading-7 text-gray-400">
            Each approved placement should eventually appear as a marketplace card with enough information for advertisers to make a sensible buying decision.
          </p>
          <div className="mt-7 rounded-3xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-300">Real estate</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Premium property guide sidebar</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">Audience reading Lagos property guides, estate reviews and buying advice.</p>
              </div>
              <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-300">Score 91</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Format', value: 'Sidebar banner' },
                { label: 'Intent', value: 'Buyer research' },
                { label: 'Status', value: 'Available' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Quality controls</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Inventory must be approved supply, not any website with empty ad space</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {qualityControls.map((item) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-6">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                <p className="text-sm leading-6 text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Context', text: 'Advertisers see niche, page type and audience intent before buying.', icon: Target },
            { title: 'Engagement', text: 'Inventory is judged by valid clicks, time on site and pages viewed.', icon: Eye },
            { title: 'Local fit', text: 'Placements can be matched by country, city or market category.', icon: MapPinned },
            { title: 'Performance', text: 'Campaign reports should show which placements created real value.', icon: MousePointerClick },
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

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">A visible inventory marketplace gives advertisers confidence and gives good publishers leverage.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            This module is a major commercial upgrade because it lets Local Ads sell quality, niche-fit placements instead of vague traffic promises.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/agency-partner-portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">
              Open agency module <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/publisher-qualification" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-8 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              Qualify publisher inventory
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
