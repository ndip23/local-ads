import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle, MousePointerClick, ShieldCheck, Target } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { firstCaseStudy } from '@/lib/marketing-content';

export const metadata = {
  title: 'Case Studies | Local Ads',
  description: 'The first Local Ads case study showing a practical CPC campaign model for local advertisers and publishers.',
};

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Case study</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">{firstCaseStudy.title}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">{firstCaseStudy.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-16 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><p className="text-sm text-gray-500">Client</p><p className="mt-2 font-bold text-white">{firstCaseStudy.client}</p></div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><p className="text-sm text-gray-500">Industry</p><p className="mt-2 font-bold text-white">{firstCaseStudy.industry}</p></div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><p className="text-sm text-gray-500">Timeline</p><p className="mt-2 font-bold text-white">{firstCaseStudy.timeline}</p></div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><p className="text-sm text-gray-500">Model</p><p className="mt-2 font-bold text-white">CPC + pixel tracking</p></div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Target className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Objective</h2>
            <p className="mt-4 leading-7 text-gray-400">{firstCaseStudy.objective}</p>
            <h2 className="mt-10 text-3xl font-bold text-white">Challenge</h2>
            <p className="mt-4 leading-7 text-gray-400">{firstCaseStudy.challenge}</p>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">Approach</h2>
            <div className="mt-6 space-y-4">
              {firstCaseStudy.approach.map((item) => (
                <p key={item} className="flex gap-3 text-gray-300"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" /> {item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <BarChart3 className="h-12 w-12 text-blue-400" />
              <h2 className="mt-5 text-3xl font-bold text-white">Outcomes</h2>
              <p className="mt-4 leading-7 text-gray-400">
                This first case study is intentionally practical. It shows the operating model Local Ads should make repeatable for local campaigns: focused creative, relevant publishers, controlled CPC, pixel tracking and traffic quality review.
              </p>
            </div>
            <div className="space-y-4">
              {firstCaseStudy.outcomes.map((item) => (
                <div key={item} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <p className="flex gap-3 text-gray-300"><ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" /> {item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 rounded-2xl bg-blue-600/10 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Want to run this model?</h3>
                <p className="mt-2 text-gray-300">Create an advertiser account and build a campaign with media upload, CTA selection and conversion tracking.</p>
              </div>
              <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Start campaign <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center">
          <MousePointerClick className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Hard lesson from the case study</h2>
          <p className="mx-auto mt-4 max-w-3xl leading-7 text-gray-400">
            Buying clicks is easy. Buying clicks that make business sense requires better targeting, better creative, better publisher fit and ruthless measurement. That is the product standard Local Ads should keep enforcing.
          </p>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
