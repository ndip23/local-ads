import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  FileCheck,
  Lightbulb,
  Megaphone,
  MousePointerClick,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { CampaignPerformanceCalculator } from '@/components/marketing/campaign-performance-calculator';

export const metadata = {
  title: 'Campaign Performance Lab | Local Ads',
  description: 'Campaign planning, optimisation checklist, creative scoring and CPC performance estimator for Local Ads advertisers.',
};

const labSections = [
  {
    title: 'Offer clarity score',
    description: 'Checks whether the campaign has a specific promise, audience, location, price signal, proof point and landing page match.',
    icon: Megaphone,
  },
  {
    title: 'CTA fit check',
    description: 'Helps advertisers choose between Shop Now, Book Now, Request Quote, Apply Now, Call Now, Learn More and other action-led CTAs.',
    icon: MousePointerClick,
  },
  {
    title: 'Creative readiness review',
    description: 'Reviews image and video ads for readability, message focus, brand safety, mobile visibility and action clarity.',
    icon: FileCheck,
  },
  {
    title: 'Budget pacing logic',
    description: 'Connects daily spend, CPC, expected CTR and conversion assumptions before a campaign is approved.',
    icon: BarChart3,
  },
];

const optimisationIdeas = [
  {
    title: 'Real estate campaign',
    ideas: ['Use location in the headline', 'Send traffic to a property list, not a generic homepage', 'Use Book Inspection or Request Quote as CTA'],
  },
  {
    title: 'Construction campaign',
    ideas: ['Show service category clearly', 'Use project photos or material proof', 'Use Call Now, Request Estimate or Get Contractor Quote'],
  },
  {
    title: 'Hotel campaign',
    ideas: ['Promote a room, offer or weekend package', 'Use high-quality room images', 'Use Book Now or Check Availability'],
  },
  {
    title: 'Business directory campaign',
    ideas: ['Promote category discovery', 'Use clear listing benefits', 'Use Find Vendors or Browse Businesses'],
  },
];

const readinessChecklist = [
  'The target audience can understand the offer in less than five seconds.',
  'The landing page continues the same promise made in the ad.',
  'The campaign uses one main CTA, not three competing instructions.',
  'The selected publisher niche matches the buyer intent.',
  'The uploaded creative is readable on mobile screens.',
  'The campaign has a measurable conversion goal before money is spent.',
  'The budget is large enough to produce useful data, not just random clicks.',
  'The campaign can be improved after review instead of being abandoned blindly.',
];

export default function CampaignPerformanceLabPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Campaign performance lab</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Stop launching campaigns that have no clear reason to convert.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            The Campaign Performance Lab gives advertisers a practical campaign audit system: offer clarity, CTA fit, creative quality, targeting alignment, budget pacing and conversion readiness.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              Build a campaign <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/advertiser-trust" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View advertiser trust centre
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Target className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">The hard truth about CPC</h2>
          <p className="mt-4 leading-7 text-gray-400">
            Cheap clicks do not save a bad offer. A campaign with weak targeting, vague CTA and poor landing page will waste money even if the traffic is clean. This lab forces the campaign to earn its budget before it goes live.
          </p>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Lab modules</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Campaign quality should be engineered before approval</h2>
            <p className="mt-4 text-gray-400">
              This module turns campaign creation into a guided performance process instead of a form where advertisers dump random creative and hope.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {labSections.map((item) => {
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

      <section className="container mx-auto px-6 py-20">
        <CampaignPerformanceCalculator />
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Optimisation ideas</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Niche-specific improvement prompts</h2>
            <p className="mt-4 text-gray-400">
              Campaign suggestions should not be generic. A real estate ad and a hotel ad should not be judged by the same creative logic.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {optimisationIdeas.map((section) => (
              <div key={section.title} className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
                <Lightbulb className="h-10 w-10 text-blue-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{section.title}</h3>
                <div className="mt-5 space-y-3">
                  {section.ideas.map((idea) => (
                    <p key={idea} className="flex gap-3 text-sm leading-6 text-gray-300">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                      {idea}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <ShieldCheck className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Campaign readiness checklist</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {readinessChecklist.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-800 bg-gray-950 p-4 text-sm leading-6 text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <BarChart3 className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">What the lab prevents</h2>
          <p className="mt-4 leading-7 text-gray-400">
            It prevents vague ads, weak CTAs, irrelevant publisher targeting, broken landing page journeys and budgets that are too small to learn anything useful. That means fewer advertiser complaints and stronger publisher inventory value.
          </p>
          <Link href="/advertisers" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
            Review advertiser features <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
