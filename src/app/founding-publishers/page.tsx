import Link from 'next/link';
import { ArrowRight, CheckCircle, Crown, Users } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Founding Publisher Program | Local Ads',
  description: 'Early adopter programme for quality publishers joining Local Ads at launch.',
};

export default function FoundingPublishersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">Founding Publisher Program</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Build trust with the first 20 to 50 quality publishers.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">The founding programme is for serious publishers who want early access, direct feedback influence and a quality-first monetisation system before the network scales.</p>
      </section>

      <section className="container mx-auto grid gap-8 px-6 pb-20 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8">
          <Crown className="h-12 w-12 text-yellow-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Founding publisher benefits</h2>
          <div className="mt-6 space-y-4">
            {['Early access to advertiser campaigns', 'Priority support and account review', 'Feedback influence on dashboard features', 'Public recognition as an early quality publisher', 'Faster eligibility for Gold or Platinum review'].map((item) => (
              <p key={item} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Users className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Who should apply?</h2>
          <p className="mt-4 leading-7 text-gray-400">Publishers with original content, niche audience trust, clean traffic sources, visible placements and willingness to help shape the platform. The programme should reject inflated sites that cannot explain where their traffic comes from.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {['Real estate media', 'Construction and building pages', 'Business directories', 'Hotel and travel guides', 'Local news/community sites', 'Niche professional blogs'].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-800 bg-gray-950 p-4 text-sm font-semibold text-gray-300">{item}</div>
            ))}
          </div>
          <Link href="/publisher-qualification" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-7 py-4 font-semibold text-gray-950 hover:bg-yellow-400">Apply as founding publisher <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
