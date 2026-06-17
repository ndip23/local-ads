import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle, DollarSign, FileVideo, Globe2, MousePointerClick, ShieldCheck, Target } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Advertisers | Local Ads',
  description: 'Advertiser benefits, campaign features and CPC workflow on Local Ads.',
};

const features = [
  { title: 'CPC campaign creation', description: 'Create campaigns with total budget, daily budget, schedule, target countries and niche selection.', icon: Target },
  { title: 'Image and video creatives', description: 'Upload banner images and video ads directly, or use external media URLs when needed.', icon: FileVideo },
  { title: 'CTA options', description: 'Choose clear calls to action such as Shop Now, Book Now, Request Quote, Apply Now or Claim Offer.', icon: CheckCircle },
  { title: 'Country CPC targeting', description: 'Set cost-per-click rules for each country so your budget follows your real market strategy.', icon: Globe2 },
  { title: 'Conversion tracking', description: 'Install a campaign pixel to measure leads, purchases, signups or other valuable actions.', icon: MousePointerClick },
  { title: 'Fraud-aware reporting', description: 'Use network controls that make suspicious traffic visible before it silently drains budget.', icon: ShieldCheck },
];

const workflow = ['Define the campaign offer and landing page', 'Upload image or video creative', 'Select a CTA that matches the next action', 'Choose target countries, CPC and niches', 'Submit for approval and track clicks/conversions'];

export default function AdvertisersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">For advertisers</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Buy measurable local attention, not vague impressions.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Local Ads helps advertisers create CPC campaigns, upload creatives, choose better CTAs, target countries, monitor spend and connect clicks to conversion outcomes.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              Start advertising <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/publishers" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              See publisher side
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-white">What advertisers stand to gain</h2>
          <div className="mt-6 space-y-5">
            <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Budget control</span><span className="font-semibold text-white">Daily + total limits</span></div>
            <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Creative support</span><span className="font-semibold text-white">Image + video</span></div>
            <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Tracking</span><span className="font-semibold text-white">Clicks + conversions</span></div>
            <div className="flex justify-between border-b border-gray-800 pb-4"><span className="text-gray-400">Targeting</span><span className="font-semibold text-white">Country + niche</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Traffic quality</span><span className="font-semibold text-white">Fraud review</span></div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Advertiser features</h2>
            <p className="mt-4 text-gray-400">The campaign builder has been strengthened around the practical areas advertisers usually get wrong: offer clarity, CTA choice, targeting, creative preview and tracking.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <BarChart3 className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">The advertiser discipline</h2>
          <p className="mt-4 leading-7 text-gray-400">
            A weak campaign burns money because the message is unclear, the audience is broad and the CTA is lazy. Local Ads pushes advertisers toward specific offers, measurable action and controlled spend.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-3xl font-bold text-white">Campaign workflow</h2>
          <div className="mt-8 space-y-5">
            {workflow.map((item, index) => (
              <div key={item} className="flex gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</span>
                <p className="pt-1 text-gray-300">{item}</p>
              </div>
            ))}
          </div>
          <Link href="/register?role=advertiser" className="mt-10 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
            Create advertiser account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
