import Link from 'next/link';
import { ArrowRight, CheckCircle, Map, Megaphone } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { roadmapItems } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Roadmap | Local Ads',
  description: 'Public roadmap for Local Ads publisher-first platform development.',
};

export default function PublisherRoadmapPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Public roadmap</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Show publishers where the platform is heading.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">A public roadmap reduces uncertainty and gives early publishers a reason to believe the platform is operational, intentional and improving.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roadmapItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <Map className="h-10 w-10 text-green-400" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">{item.quarter}</p>
              <h2 className="mt-2 text-xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Megaphone className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Communication promise</h2>
            <p className="mt-4 leading-7 text-gray-400">Publishers should receive regular email updates and platform announcements covering new policies, payout changes, feature updates, fraud guidance, roadmap movement and implemented feedback.</p>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">Feedback loop</h2>
            <div className="mt-6 space-y-4">
              {['Collect publisher feedback monthly', 'Publish useful suggestions openly', 'Mark what has been implemented', 'Explain rejected suggestions honestly', 'Prioritise changes that improve trust and earnings clarity'].map((item) => (
                <p key={item} className="flex gap-3 text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" />{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <Link href="/publisher-trust" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">Back to Publisher Trust Centre <ArrowRight className="h-5 w-5" /></Link>
      </section>
      <MarketingFooter />
    </main>
  );
}
