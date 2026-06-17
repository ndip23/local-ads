import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CheckCircle, FileSearch, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Publisher Onboarding | Local Ads',
  description: 'Publisher education, review and approval process for Local Ads.',
};

const steps = [
  { title: 'Website qualification', description: 'Applicant checks whether the website has enough niche clarity, original content and clean traffic to apply.', icon: FileSearch },
  { title: 'Publisher education', description: 'Applicant reviews payment policy, fraud rules, placement standards and earnings formula before approval.', icon: GraduationCap },
  { title: 'Site review', description: 'Admin reviews content quality, niche, traffic source, placement plan and compliance risks.', icon: ShieldCheck },
  { title: 'Approved onboarding', description: 'Publisher receives access to dashboard, tracking links, ad units, reporting and support channels.', icon: UserCheck },
];

export default function PublisherOnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />
      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Publisher onboarding</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">Educate publishers before approving them.</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">Weak onboarding creates future disputes. Local Ad Network should teach publishers how earnings, traffic quality, placements, fraud rules and payments work before they start running campaigns.</p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-10 w-10 text-green-400" />
                  <span className="text-sm font-bold text-gray-600">0{index + 1}</span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <BookOpenCheck className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Required learning before approval</h2>
            <div className="mt-6 space-y-4">
              {['How publisher earnings are calculated', 'What counts as quality traffic', 'Placement rules and ad visibility standards', 'Payment policy and payout timelines', 'Fraud and invalid-click rules'].map((item) => (
                <p key={item} className="flex gap-3 text-gray-300"><CheckCircle className="h-5 w-5 text-green-400" />{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <h2 className="text-3xl font-bold text-white">Approval standard</h2>
            <p className="mt-4 leading-7 text-gray-400">Not every applicant should be approved. That is the point. The network must protect its advertisers and the serious publishers already inside the ecosystem. A clean small publisher is better than a large publisher with toxic traffic.</p>
            <Link href="/publisher-qualification" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">Start qualification <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
