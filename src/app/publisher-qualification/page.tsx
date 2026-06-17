import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { PublisherQualificationForm } from '@/components/marketing/publisher-qualification-form';

export const metadata = {
  title: 'Publisher Website Qualification | Local Ads',
  description: 'Website qualification form for serious publisher applicants before registration.',
};

export default function PublisherQualificationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Before registration</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Check whether your website is ready for Local Ad Network.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">This qualification layer filters serious applicants, educates publishers and protects the platform from low-quality sites before account creation.</p>
      </section>
      <section className="container mx-auto px-6 pb-20">
        <PublisherQualificationForm />
      </section>
      <section className="container mx-auto px-6 pb-20 text-center">
        <Link href="/register?role=publisher" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">Continue to publisher registration <ArrowRight className="h-5 w-5" /></Link>
      </section>
      <MarketingFooter />
    </main>
  );
}
