import Link from 'next/link';
import { ArrowRight, Banknote, CheckCircle, Clock, CreditCard, HandCoins, ShieldCheck } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { paymentPolicy } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Payment Policy | Local Ads',
  description: 'Transparent publisher payout thresholds, schedules, methods and rules for Local Ads.',
};

export default function PublisherPaymentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Transparent payment policy</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Publishers should never guess when or how they will be paid.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">This policy makes payout thresholds, schedules, methods, pending balances and approved payments visible before publishers join the network.</p>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <HandCoins className="h-11 w-11 text-green-400" />
          <p className="mt-5 text-sm uppercase tracking-wide text-gray-500">Threshold</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{paymentPolicy.threshold}</h2>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Clock className="h-11 w-11 text-blue-400" />
          <p className="mt-5 text-sm uppercase tracking-wide text-gray-500">Schedule</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Weekly request window</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">{paymentPolicy.schedule}</p>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <CreditCard className="h-11 w-11 text-purple-400" />
          <p className="mt-5 text-sm uppercase tracking-wide text-gray-500">Methods</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Bank-led payouts</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">Clear settlement methods reduce support disputes and payout confusion.</p>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Banknote className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Supported payout methods</h2>
            <div className="mt-6 space-y-4">
              {paymentPolicy.methods.map((method) => (
                <p key={method} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{method}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <ShieldCheck className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Rules that prevent payment disputes</h2>
            <div className="mt-6 space-y-4">
              {paymentPolicy.rules.map((rule) => (
                <p key={rule} className="flex gap-3 text-sm leading-6 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{rule}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">Payment discipline is a product feature, not a finance afterthought.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-gray-400">The platform should grow more slowly if that is what it takes to pay approved publishers on time every time.</p>
          <Link href="/publisher-metrics" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">See publisher metrics <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
