import Link from 'next/link';
import { ArrowRight, BadgeCheck, BarChart3, Code2, DollarSign, Gift, ShieldCheck, Users } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Publishers | Local Ads',
  description: 'Publisher benefits, features and earning model on Local Ads.',
};

const features = [
  { title: '80% revenue share', description: 'Earn the larger share of qualified click revenue generated from your placements.', icon: DollarSign },
  { title: 'Tracking links', description: 'Generate campaign links for approved ads and measure performance from your dashboard.', icon: Code2 },
  { title: 'Ad widgets', description: 'Place controlled ad units on your site without manually rebuilding every placement.', icon: BadgeCheck },
  { title: 'Verified sites', description: 'Submit publisher sites for approval so advertisers can trust your traffic environment.', icon: ShieldCheck },
  { title: 'Earnings dashboard', description: 'View clicks, earnings, wallet balance, withdrawals and campaign performance.', icon: BarChart3 },
  { title: 'Referral upside', description: 'Use referral features to build another earning path from network growth.', icon: Gift },
];

const gains = ['Fairer monetisation than generic low-context ad placements', 'More relevant offers for your readers and communities', 'Clear wallet and payout visibility', 'Access to advertiser demand beyond one-off sponsored posts', 'Better protection from fraud claims through tracked activity'];

export default function PublishersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">For publishers</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Turn trusted traffic into measurable ad revenue.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Local Ads gives publishers a controlled way to earn from approved campaigns, tracking links, ad widgets and transparent reporting. You are not just selling page space. You are monetising audience trust with better structure.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              Join as Publisher <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/advertisers" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              See advertiser side
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-white">What publishers stand to gain</h2>
          <div className="mt-6 space-y-4">
            {gains.map((gain) => (
              <p key={gain} className="flex gap-3 text-gray-300"><Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" /> {gain}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Publisher features</h2>
            <p className="mt-4 text-gray-400">Everything here is built around a simple point: publishers need revenue, control and trust protection.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-green-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white">What good publishers stand for</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-bold text-white">Audience trust</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">Do not flood your site with irrelevant offers. Long-term trust is worth more than cheap clicks.</p>
            </div>
            <div>
              <h3 className="font-bold text-white">Clean traffic</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">Fraudulent clicks are not growth. They destroy advertiser confidence and publisher reputation.</p>
            </div>
            <div>
              <h3 className="font-bold text-white">Relevant placements</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">The best earnings come when campaigns match the content, niche and user intent.</p>
            </div>
          </div>
          <Link href="/register?role=publisher" className="mt-10 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
            Create publisher account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
