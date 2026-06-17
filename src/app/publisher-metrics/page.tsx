import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle, Eye, MousePointerClick, Timer, WalletCards } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { PublisherEarningsCalculator } from '@/components/marketing/publisher-earnings-calculator';
import { publisherMetrics } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Metrics | Local Ads',
  description: 'Open publisher metrics including impressions, clicks, earnings, payments and engagement reporting.',
};

const formulaRows = [
  ['Raw click', 'Every recorded click before filtering.'],
  ['Qualified click', 'A click that passes fraud, repeat-click, placement and source checks.'],
  ['Gross click revenue', 'Qualified clicks multiplied by advertiser CPC.'],
  ['Publisher earning', 'Gross click revenue multiplied by the publisher share, currently 80%.'],
  ['Approved payment', 'Publisher earning cleared after quality review and payout eligibility checks.'],
];

export default function PublisherMetricsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Open publisher metrics</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Publishers should see the numbers that decide their earnings.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">Local Ad Network must expose impressions, clicks, quality status, earnings, pending payments, approved payments and engagement indicators instead of hiding behind one vague balance figure.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {publisherMetrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <BarChart3 className="h-9 w-9 text-green-400" />
              <h2 className="mt-5 text-xl font-bold text-white">{metric.label}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <WalletCards className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Visible earnings formula</h2>
            <div className="mt-7 overflow-hidden rounded-2xl border border-gray-800">
              {formulaRows.map(([label, explanation]) => (
                <div key={label} className="grid gap-3 border-b border-gray-800 bg-gray-900 p-4 last:border-b-0 md:grid-cols-[0.35fr_0.65fr]">
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-sm leading-6 text-gray-400">{explanation}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Timer className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Engagement should count.</h2>
            <p className="mt-4 leading-7 text-gray-400">Clicks alone are too easy to manipulate. A serious publisher platform should track time on site, pages viewed, repeated real-user behaviour and bounce-quality indicators where available.</p>
            <div className="mt-6 space-y-3">
              {['Time on site', 'Pages viewed', 'Bounce-quality signal', 'Return visitor behaviour', 'Source consistency'].map((item) => (
                <p key={item} className="flex gap-3 text-sm text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" />{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <PublisherEarningsCalculator />
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-3xl font-bold text-white">Dashboard expectation</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { icon: Eye, title: 'Impressions', value: '84,200', note: 'served placements' },
              { icon: MousePointerClick, title: 'Valid clicks', value: '1,104', note: 'after review' },
              { icon: WalletCards, title: 'Approved payout', value: '₦106,240', note: 'available this cycle' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-9 w-9 text-green-400" />
                  <p className="mt-5 text-sm text-gray-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-gray-400">{card.note}</p>
                </div>
              );
            })}
          </div>
          <Link href="/traffic-quality" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">Understand traffic scoring <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
