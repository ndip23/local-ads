import Link from 'next/link';
import { ArrowRight, Building2, Factory, Hotel, Newspaper, Search } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { publisherNiches } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Niches | Local Ads',
  description: 'Niche-specific publisher pages for real estate, construction, directories, hotels and news publishers.',
};

const icons = [Building2, Factory, Search, Hotel, Newspaper];

export default function PublisherNichesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Niche-specific publishers</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Different publisher niches create different advertiser value.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">The platform should not treat all publishers as the same traffic bucket. Real estate, construction, directories, hotels and news sites each need their own positioning and metrics.</p>
      </section>
      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publisherNiches.map((niche, index) => {
            const Icon = icons[index] || Search;
            return (
              <Link key={niche.slug} href={`/publisher-niches/${niche.slug}`} className="rounded-3xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-green-500/60">
                <Icon className="h-10 w-10 text-green-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{niche.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{niche.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-300">Open niche page <ArrowRight className="h-4 w-4" /></span>
              </Link>
            );
          })}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
