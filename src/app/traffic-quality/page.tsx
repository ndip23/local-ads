import Link from 'next/link';
import { ArrowRight, Award, CheckCircle, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { fraudGuidelines, qualityScoreWeights } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Traffic Quality Scoring | Local Ads',
  description: 'Publisher traffic quality scoring, fraud guidelines and quality-based rewards for Local Ads.',
};

export default function TrafficQualityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Traffic quality scoring</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Reward traffic quality, not just traffic volume.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">Large numbers mean nothing if the traffic is fake, accidental, irrelevant or low-intent. Local Ad Network should score publishers by quality signals that advertisers can trust.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qualityScoreWeights.map((item) => (
            <div key={item.factor} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-10 w-10 text-green-400" />
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold text-green-300">{item.weight}</span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">{item.factor}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Award className="h-12 w-12 text-yellow-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">How quality is rewarded</h2>
            <div className="mt-6 space-y-4">
              {['Higher tier eligibility', 'Better campaign matching', 'Priority advertiser access', 'Faster payout review', 'Public credibility as a quality publisher'].map((item) => (
                <p key={item} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <TrendingUp className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Performance recommendations</h2>
            <p className="mt-4 leading-7 text-gray-400">The dashboard should not only report numbers. It should tell publishers how to improve earnings: strengthen niche content, improve placement visibility, remove accidental-click areas and push campaigns to pages with stronger user intent.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <ShieldAlert className="h-12 w-12 text-red-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Traffic and fraud guidelines</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {fraudGuidelines.map((guideline) => (
              <p key={guideline} className="rounded-2xl border border-red-500/20 bg-gray-950 p-4 text-sm leading-6 text-gray-300">{guideline}</p>
            ))}
          </div>
          <Link href="/publisher-rules" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-4 font-semibold text-white hover:bg-red-700">View all platform rules <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
