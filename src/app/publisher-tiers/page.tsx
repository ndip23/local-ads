import Link from 'next/link';
import { ArrowRight, CheckCircle, Crown, Medal, Star, Trophy } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { publisherTiers } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Tiers | Local Ads',
  description: 'Bronze, Silver, Gold and Platinum publisher tiers based on quality and performance.',
};

const tierIcons = [Medal, Star, Trophy, Crown];

export default function PublisherTiersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher tiers</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Quality publishers should rise faster than noisy publishers.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">The tier system gives publishers a visible path from Bronze to Platinum using quality score, campaign performance, engagement and compliance history.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {publisherTiers.map((tier, index) => {
            const Icon = tierIcons[index];
            return (
              <div key={tier.name} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-11 w-11 text-yellow-400" />
                <h2 className="mt-5 text-2xl font-bold text-white">{tier.name}</h2>
                <p className="mt-2 text-sm text-gray-400">Quality score: {tier.score}</p>
                <div className="mt-6 space-y-3">
                  {tier.benefits.map((benefit) => (
                    <p key={benefit} className="flex gap-3 text-sm text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" />{benefit}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-3">
          {[
            ['How to move up', 'Improve valid click rate, strengthen niche relevance, maintain clean placements and reduce disputed activity.'],
            ['How to drop down', 'Use misleading placements, drive suspicious clicks, ignore warnings or create poor advertiser outcomes.'],
            ['Why tiers matter', 'They make quality visible and give the best publishers access to better campaigns, faster reviews and stronger support.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="mt-4 leading-7 text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <Link href="/traffic-quality" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">See traffic quality scoring <ArrowRight className="h-5 w-5" /></Link>
      </section>
      <MarketingFooter />
    </main>
  );
}
