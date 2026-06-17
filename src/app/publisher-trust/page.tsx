import Link from 'next/link';
import { ArrowRight, BadgeCheck, BarChart3, Calculator, FileCheck, Flag, HandCoins, Map, MessageCircle, ShieldCheck, Star, Users } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { publisherMission } from '@/lib/publisher-trust-content';

export const metadata = {
  title: 'Publisher Trust Centre | Local Ads',
  description: 'Publisher-first mission, payment transparency, traffic quality, tiers, roadmap, rules and support for Local Ads.',
};

const trustModules = [
  { href: '/publisher-payments', title: 'Payment policy', description: 'Thresholds, payout schedules, approved balances and payment methods.', icon: HandCoins },
  { href: '/publisher-metrics', title: 'Publisher metrics', description: 'Impressions, clicks, earnings, pending payments, approved payments and engagement.', icon: BarChart3 },
  { href: '/traffic-quality', title: 'Traffic quality scoring', description: 'How traffic is evaluated and why quality beats empty volume.', icon: ShieldCheck },
  { href: '/publisher-tiers', title: 'Publisher tiers', description: 'Bronze, Silver, Gold and Platinum levels based on quality and performance.', icon: Star },
  { href: '/publisher-onboarding', title: 'Onboarding process', description: 'Education, review and approval steps before publishers go live.', icon: FileCheck },
  { href: '/publisher-qualification', title: 'Website qualification', description: 'Pre-registration form that filters serious publisher applicants.', icon: BadgeCheck },
  { href: '/founding-publishers', title: 'Founding Publisher Program', description: 'Early adopter programme for the first high-quality publisher partners.', icon: Users },
  { href: '/publisher-roadmap', title: 'Public roadmap', description: 'Where the platform is heading and what will be improved next.', icon: Map },
  { href: '/publisher-rules', title: 'Public rules', description: 'Traffic, fraud, placement, content and payment rules published upfront.', icon: Flag },
  { href: '/publisher-support', title: 'Direct support', description: 'Publisher support access instead of hiding behind automation.', icon: MessageCircle },
  { href: '/publisher-faq', title: 'Publisher FAQ', description: 'Common concerns answered clearly before registration.', icon: Calculator },
  { href: '/publisher-niches', title: 'Niche publisher pages', description: 'Real estate, construction, directories, hotels, news and other sectors.', icon: ArrowRight },
];

export default function PublisherTrustPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher-first ecosystem</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">{publisherMission.headline}</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">{publisherMission.body}</p>
        <p className="mx-auto mt-5 max-w-3xl rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-200">{publisherMission.promise}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/publisher-qualification" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700">Check website qualification <ArrowRight className="h-5 w-5" /></Link>
          <Link href="/founding-publishers" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">Founding Publisher Program</Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trustModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="rounded-3xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-green-500/60">
                <Icon className="h-10 w-10 text-green-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{module.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{module.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-300">Open module <ArrowRight className="h-4 w-4" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-3">
          {[
            ['Build trust before scale', 'The first 20 to 50 publishers should be selected for quality, niche relevance and clean traffic, not vanity numbers.'],
            ['Reward quality over volume', 'A publisher with fewer but engaged users is more valuable than a site with inflated clicks and poor conversion signals.'],
            ['Use transparency as the moat', 'Payment rules, scoring logic, dashboard metrics and public policies make the platform harder to distrust.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="mt-4 leading-7 text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
