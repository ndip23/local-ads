import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Target } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { publisherNiches } from '@/lib/publisher-trust-content';

export function generateStaticParams() {
  return publisherNiches.map((niche) => ({ slug: niche.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const niche = publisherNiches.find((item) => item.slug === slug);
  return {
    title: niche ? `${niche.title} | Local Ads` : 'Publisher Niche | Local Ads',
    description: niche?.description || 'Niche-specific publisher page for Local Ads.',
  };
}

export default async function PublisherNichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const niche = publisherNiches.find((item) => item.slug === slug);

  if (!niche) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20">
        <Link href="/publisher-niches" className="inline-flex items-center gap-2 text-sm font-semibold text-green-300 hover:text-green-200"><ArrowLeft className="h-4 w-4" /> Back to publisher niches</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Niche publisher page</p>
        <h1 className="mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">{niche.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">{niche.description}</p>
      </section>

      <section className="container mx-auto grid gap-8 px-6 pb-20 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Target className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Advertisers this niche can attract</h2>
          <div className="mt-6 space-y-4">
            {niche.advertisers.map((advertiser) => (
              <p key={advertiser} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{advertiser}</p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h2 className="text-3xl font-bold text-white">Metrics that matter</h2>
          <p className="mt-4 leading-7 text-gray-400">This niche should be judged by intent and relevance, not raw traffic alone.</p>
          <div className="mt-6 space-y-4">
            {niche.metrics.map((metric) => (
              <p key={metric} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />{metric}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to apply as a quality publisher?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">Start with website qualification so the platform can match your niche with the right advertisers.</p>
          <Link href="/publisher-qualification" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">Check qualification <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
