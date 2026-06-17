import Link from 'next/link';
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle, CircleDollarSign, CreditCard, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Pricing & Packages | Local Ads',
  description: 'Pricing, advertiser packages, publisher earning model and platform fees for Local Ads.',
};

const advertiserPlans = [
  {
    name: 'Starter Campaign',
    badge: 'For first campaigns',
    price: 'Pay per click',
    description: 'For small businesses testing one offer, one landing page and one focused target market.',
    features: [
      'CPC campaign setup',
      'Image or video ad creative',
      'CTA dropdown options',
      'Basic country targeting',
      'Campaign approval review',
      'Clicks and spend dashboard',
    ],
    href: '/register?role=advertiser',
  },
  {
    name: 'Growth Campaign',
    badge: 'Recommended',
    price: 'Controlled budget',
    description: 'For brands that need stronger campaign structure, conversion tracking and publisher placement control.',
    features: [
      'Multiple active campaigns',
      'Campaign suggestions and preview',
      'Conversion pixel support',
      'Country CPC targeting',
      'Fraud-aware reporting',
      'Wallet-funded ad spend',
    ],
    href: '/register?role=advertiser',
  },
  {
    name: 'Agency / Enterprise',
    badge: 'For teams',
    price: 'Custom setup',
    description: 'For agencies, high-volume advertisers and organisations managing campaigns across several markets.',
    features: [
      'Campaign planning support',
      'Multiple niche targeting',
      'Performance reporting workflow',
      'Advanced fraud review',
      'Publisher quality monitoring',
      'Admin-assisted onboarding',
    ],
    href: '/register?role=advertiser',
  },
];

const publisherBenefits = [
  { label: 'Publisher share', value: '80%', icon: CircleDollarSign },
  { label: 'Platform share', value: '20%', icon: CreditCard },
  { label: 'Traffic model', value: 'Qualified clicks', icon: Users },
  { label: 'Quality control', value: 'Fraud review', icon: ShieldCheck },
];

const rules = [
  'Advertisers fund campaigns before traffic is delivered, so spend is controlled before it becomes a problem.',
  'Publishers earn from qualified clicks generated through approved tracking links, widgets and placements.',
  'Suspicious activity can be flagged, reviewed or rejected to protect advertiser budgets and publisher credibility.',
  'Campaigns are approved before going live, because a marketplace without quality control becomes noise quickly.',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Pricing module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Clear packages for advertisers and a transparent earning model for publishers.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Local Ads is not built around vague exposure. Advertisers control their CPC budgets, publishers earn from qualified traffic, and the platform keeps a defined share for operating the network.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Start advertiser campaign <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Join as publisher <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Advertiser campaign packages</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            These packages are structured around business maturity. The weak move is to launch ads without knowing whether the offer, creative, audience and tracking are ready.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {advertiserPlans.map((plan) => (
            <div key={plan.name} className="flex flex-col rounded-3xl border border-gray-800 bg-gray-900 p-8">
              <span className="mb-5 w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
                {plan.badge}
              </span>
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-3 text-3xl font-bold text-blue-400">{plan.price}</p>
              <p className="mt-4 min-h-20 text-sm leading-6 text-gray-400">{plan.description}</p>
              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex gap-3 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    {feature}
                  </p>
                ))}
              </div>
              <Link href={plan.href} className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Select package <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher economics</p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Publishers need a model they can understand before they trust it.</h2>
            <p className="mt-5 leading-7 text-gray-400">
              The publisher side is deliberately simple: approved publishers drive qualified traffic, earn the larger share, and monitor performance through the dashboard. Do not hide the numbers. Hidden maths kills trust.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {publisherBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-9 w-9 text-green-400" />
                  <p className="mt-5 text-sm text-gray-400">{benefit.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{benefit.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <BarChart3 className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">What this module solves</h2>
            <p className="mt-4 leading-7 text-gray-400">
              A platform without a pricing page creates friction. Advertisers hesitate because they cannot see how spending works. Publishers hesitate because they cannot see how earnings work. This module removes that avoidable confusion.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <h2 className="text-3xl font-bold text-white">Operating rules</h2>
            <div className="mt-7 space-y-4">
              {rules.map((rule) => (
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
          <Megaphone className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Ready to pick your side of the marketplace?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">Create the right account type and use the dashboard built for your role.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Create account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
