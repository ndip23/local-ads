import Link from 'next/link';
import { ArrowRight, Ban, CheckCircle, FileWarning, ShieldAlert } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { fraudGuidelines } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Rules and Fraud Guidelines | Local Ads',
  description: 'Public publisher rules, traffic guidelines and fraud restrictions for Local Ads.',
};

const acceptable = ['Original or properly licensed website content', 'Visible and non-deceptive ad placements', 'Organic, direct, referral, newsletter and community traffic', 'Clear page structure that does not force accidental clicks', 'Honest traffic source disclosure during application and review'];

export default function PublisherRulesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">Public platform rules</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Publish the rules before disputes begin.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">Publishers need clear traffic, fraud, content, placement and payout rules. Hidden policies create resentment. Visible policies create accountability.</p>
      </section>

      <section className="container mx-auto grid gap-8 px-6 pb-20 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-8">
          <CheckCircle className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Acceptable publisher behaviour</h2>
          <div className="mt-6 space-y-4">
            {acceptable.map((rule) => (
              <p key={rule} className="flex gap-3 text-sm leading-6 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{rule}</p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <Ban className="h-12 w-12 text-red-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Prohibited behaviour</h2>
          <div className="mt-6 space-y-4">
            {fraudGuidelines.map((rule) => (
              <p key={rule} className="flex gap-3 text-sm leading-6 text-gray-300"><ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />{rule}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8 md:p-10">
            <FileWarning className="h-12 w-12 text-yellow-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Enforcement logic</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {[
                ['Warning', 'For minor placement or documentation issues that can be corrected quickly.'],
                ['Temporary hold', 'For suspicious traffic, unresolved advertiser complaints or payout review risk.'],
                ['Removal', 'For confirmed fraud, repeated abuse, hidden placements or deliberate manipulation.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{body}</p>
                </div>
              ))}
            </div>
            <Link href="/publisher-support" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-7 py-4 font-semibold text-gray-950 hover:bg-yellow-400">Contact publisher support <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
