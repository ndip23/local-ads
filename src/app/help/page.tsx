import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CheckCircle, CircleHelp, FileVideo, LifeBuoy, Megaphone, ShieldAlert, WalletCards, Workflow } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Help Centre | Local Ads',
  description: 'Help centre, onboarding checklists and support guidance for Local Ads advertisers and publishers.',
};

const helpCategories = [
  {
    title: 'Advertiser onboarding',
    description: 'Learn how to prepare an offer, upload media, choose CTA options and submit a campaign for approval.',
    icon: Megaphone,
    items: ['Campaign setup', 'Creative upload', 'CTA selection', 'Landing page checks'],
  },
  {
    title: 'Publisher onboarding',
    description: 'Understand site verification, tracking links, ad widgets, clean traffic expectations and wallet reporting.',
    icon: Workflow,
    items: ['Site approval', 'Tracking links', 'Ad widgets', 'Traffic quality'],
  },
  {
    title: 'Wallet and earnings',
    description: 'See how balances, advertiser spend, publisher earnings, withdrawal requests and transaction history fit together.',
    icon: WalletCards,
    items: ['Funding campaigns', 'Publisher share', 'Withdrawals', 'Transaction history'],
  },
  {
    title: 'Safety and fraud review',
    description: 'Review the behaviours that can trigger fraud checks and learn why clean traffic protects everyone.',
    icon: ShieldAlert,
    items: ['Repeat clicks', 'Suspicious traffic', 'Rejected activity', 'Quality rules'],
  },
];

const advertiserChecklist = [
  'Use one clear campaign offer instead of advertising everything your business does.',
  'Make sure the landing page matches the CTA. Do not send “Apply Now” traffic to a generic homepage.',
  'Upload readable images or short videos that explain the offer quickly.',
  'Set daily and total budgets before launch so spend stays controlled.',
  'Install the conversion pixel when the campaign goal is leads, signups, purchases or downloads.',
];

const publisherChecklist = [
  'Submit only sites, pages or channels you control and can verify honestly.',
  'Choose campaigns that match your audience instead of forcing irrelevant offers into your content.',
  'Place tracking links and widgets where users can see them without damaging trust.',
  'Avoid self-clicking, click exchanges, bots or traffic manipulation. Those are not growth tactics.',
  'Monitor earnings, clicks and wallet records from the dashboard instead of relying on assumptions.',
];

const faqs = [
  {
    question: 'Can advertisers upload images and videos directly?',
    answer: 'Yes. The campaign builder supports direct image and video uploads, then shows a preview before submission.',
  },
  {
    question: 'How do publishers earn?',
    answer: 'Publishers earn from qualified clicks or tracked activity generated through approved campaign links, widgets and placements.',
  },
  {
    question: 'Why are campaigns reviewed before approval?',
    answer: 'Review protects the network. Bad offers, broken landing pages and misleading creatives damage both advertisers and publishers.',
  },
  {
    question: 'What happens to suspicious clicks?',
    answer: 'Suspicious clicks can be flagged for fraud review so budgets and publisher earnings are not built on fake activity.',
  },
  {
    question: 'What CTA should advertisers choose?',
    answer: 'Choose the CTA that matches the real next step. Shop Now, Book Now, Apply Now, Request Quote and Claim Offer are stronger than vague wording when they match user intent.',
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Help centre module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          A practical support centre for advertisers, publishers and platform users.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          A marketplace fails when users do not understand what to do next. This module gives both sides clear guidance before they waste time, budget or traffic.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Advertiser onboarding <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Publisher onboarding <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{category.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{category.description}</p>
                <div className="mt-5 space-y-2">
                  {category.items.map((item) => (
                    <p key={item} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <FileVideo className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Advertiser launch checklist</h2>
            <div className="mt-7 space-y-4">
              {advertiserChecklist.map((item) => (
                <p key={item} className="flex gap-3 text-gray-300">
                  <BookOpenCheck className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <LifeBuoy className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Publisher quality checklist</h2>
            <div className="mt-7 space-y-4">
              {publisherChecklist.map((item) => (
                <p key={item} className="flex gap-3 text-gray-300">
                  <BookOpenCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <CircleHelp className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Frequently asked questions</h2>
          <p className="mt-4 text-gray-400">These answers remove the common confusion points that stop users from completing setup.</p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="text-lg font-bold text-white">{faq.question}</h3>
              <p className="mt-3 leading-7 text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">Still need human support?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Use the dashboard notifications and admin review flow for account-specific issues. Public help should educate users; private issues should stay inside the dashboard.
          </p>
          <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Go to dashboard <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
