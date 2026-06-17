import Link from 'next/link';
import { ArrowRight, CheckCircle, Headphones, Mail, MessageCircle, Phone } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Publisher Support | Local Ads',
  description: 'Direct publisher support access, communication channels and support standards for Local Ads.',
};

export default function PublisherSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Direct publisher support</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Do not hide serious publishers behind automation.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">Automation is useful, but trust is built through reachable support, clear escalation and honest communication about payments, disputes, quality scores and approvals.</p>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-20 md:grid-cols-3">
        {[
          { icon: Mail, title: 'Email support', detail: 'For documentation, approval, payout and quality review issues.' },
          { icon: MessageCircle, title: 'In-app support', detail: 'For dashboard-related tickets, notices and account updates.' },
          { icon: Phone, title: 'Priority callbacks', detail: 'For Gold, Platinum and Founding Publisher escalation cases.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
              <Icon className="h-11 w-11 text-green-400" />
              <h2 className="mt-5 text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <Headphones className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Support categories</h2>
            <div className="mt-6 space-y-4">
              {['Website approval', 'Payment and withdrawal', 'Traffic quality review', 'Fraud or invalid-click dispute', 'Ad placement setup', 'Publisher tier review'].map((category) => (
                <p key={category} className="flex gap-3 text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" />{category}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">Communication standard</h2>
            <p className="mt-4 leading-7 text-gray-400">Publisher announcements should cover payment schedules, policy changes, known issues, fraud rule updates, new features, implemented feedback and platform roadmap movement. Silence creates distrust faster than slow growth.</p>
            <Link href="/publisher-roadmap" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">View public roadmap <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
