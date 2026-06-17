import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { faqItems } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher FAQ | Local Ads',
  description: 'Frequently asked questions for Local Ads publishers.',
};

export default function PublisherFaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher FAQ</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Answer publisher concerns before they become objections.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">A publisher-first platform must be direct about earnings, payments, rejected clicks, approvals, support and quality rules.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="mx-auto max-w-4xl space-y-5">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <HelpCircle className="h-8 w-8 text-green-400" />
              <h2 className="mt-4 text-xl font-bold text-white">{item.question}</h2>
              <p className="mt-3 leading-7 text-gray-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <Link href="/publisher-support" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">Still need help? Contact support <ArrowRight className="h-5 w-5" /></Link>
      </section>
      <MarketingFooter />
    </main>
  );
}
