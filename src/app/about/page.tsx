import Link from 'next/link';
import { ArrowRight, Code2, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Founder/About | Local Ads',
  description: 'About the founder vision behind Local Ads and the problem the platform solves for advertisers and publishers.',
};

const principles = [
  {
    title: 'Performance over vanity metrics',
    description: 'The platform is designed around clicks, conversions, publisher quality and budget control rather than empty impressions.',
    icon: Megaphone,
  },
  {
    title: 'Fair value for publishers',
    description: 'Publishers should not be treated as traffic suppliers with no visibility. They need earnings, tracking and control.',
    icon: Users,
  },
  {
    title: 'Security and fraud discipline',
    description: 'An ad network without fraud checks is not a business. It is a leak. The platform includes approval and suspicious-traffic review.',
    icon: ShieldCheck,
  },
  {
    title: 'Product-first execution',
    description: 'The goal is a practical operating system for local advertising, not a landing page pretending to be a platform.',
    icon: Code2,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Founder/About</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Local Ads exists because local attention is still undervalued.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            The platform was created to solve a practical gap: advertisers need targeted, measurable local traffic, while publishers need a fairer way to monetise trusted audiences without losing control of their sites.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black text-white">LA</div>
          <h2 className="mt-6 text-3xl font-bold text-white">Founder note</h2>
          <p className="mt-4 leading-7 text-gray-400">
            Local Ads is built for operators who are tired of vague marketing claims. Advertisers should know where their budget is going. Publishers should know what they are earning. Admins should have the tools to reject weak campaigns, verify sites and protect the network from fraud.
          </p>
          <p className="mt-4 leading-7 text-gray-400">
            The hard truth is that an advertising platform only becomes useful when it controls quality. That is why the product direction combines campaign creation, media upload, CTA guidance, publisher verification, CPC targeting, wallets, fraud review and conversion pixels.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">The mission</h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Build a transparent local ad marketplace where every click has a source, every campaign has approval logic, every publisher has earnings visibility and every advertiser has the tools to measure outcome instead of guessing.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
              Join the network <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
