import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  FileChartColumn,
  FileCheck,
  LifeBuoy,
  MessageCircle,
  Phone,
  Repeat,
  ShieldCheck,
  Target,
  Users,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Lead Management CRM | Local Ads',
  description: 'A lead management CRM module for Local Ads campaign enquiries, follow-up workflows, attribution and advertiser reporting.',
};

const leadSources = [
  { title: 'Form enquiries', description: 'Capture structured campaign enquiries with name, contact details, interest, location and campaign source.', icon: FileCheck },
  { title: 'WhatsApp clicks', description: 'Track WhatsApp intent as a lead event instead of leaving it as an unmeasured external click.', icon: MessageCircle },
  { title: 'Phone calls', description: 'Log call-click actions so advertisers can compare calls with form and landing-page conversions.', icon: Phone },
  { title: 'Landing actions', description: 'Attach campaign pixels, CTA clicks and directory-profile actions to the same lead timeline.', icon: Target },
];

const pipelineStages = [
  { stage: 'New lead', purpose: 'Fresh enquiry received from a campaign, directory profile, WhatsApp click, call click or form.' },
  { stage: 'Contacted', purpose: 'Advertiser has reached out and the lead is no longer untouched.' },
  { stage: 'Qualified', purpose: 'Lead has real intent, correct location, relevant budget or useful enquiry details.' },
  { stage: 'Proposal sent', purpose: 'Advertiser has sent pricing, brochure, inspection details, quote or next-step information.' },
  { stage: 'Won or lost', purpose: 'Advertiser records the final outcome so campaign value can be measured beyond clicks.' },
];

const crmFeatures = [
  'Lead inbox for advertisers showing source campaign, publisher, CTA, landing page and time of enquiry.',
  'Pipeline status tracking from new lead to contacted, qualified, proposal sent, won or lost.',
  'Follow-up reminders so advertisers do not waste paid traffic through slow response.',
  'Lead quality labels such as valid, duplicate, spam, wrong fit, high intent or unreachable.',
  'Exportable lead records for sales teams, agencies and business owners who still work with spreadsheets.',
  'Attribution reports showing which campaigns, publishers and CTAs produced meaningful leads.',
];

const qualityRules = [
  'Do not treat every click as a lead. That is weak reporting and it will mislead advertisers.',
  'Duplicate enquiries should be merged or flagged so advertisers do not pay attention to inflated numbers.',
  'Publishers should receive better quality recognition when their traffic produces real engagement and qualified leads.',
  'Advertisers should be pushed to respond quickly because slow follow-up destroys campaign ROI even when the traffic is good.',
];

const automationIdeas = [
  'Notify advertiser immediately when a high-intent lead enters the inbox.',
  'Remind advertiser after 2 hours if a new lead has not been contacted.',
  'Flag duplicate leads from the same phone, email, IP pattern or campaign source.',
  'Move leads to cold status after repeated failed contact attempts.',
  'Use closed-won lead value to improve future campaign recommendations.',
];

export default function LeadManagementCrmPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Lead management CRM</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Stop measuring only clicks. Track the leads those clicks create.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module gives advertisers a basic CRM layer for enquiries, follow-ups, lead quality, pipeline stages and campaign attribution. Without it, Local Ads risks becoming another platform that sells traffic but cannot prove business value.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/merchant-directory" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              View merchant directory <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/campaign-performance-lab" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View performance lab
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Users className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">CRM snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Lead sources', value: 'Forms + calls' },
              { label: 'Pipeline', value: '5 stages' },
              { label: 'Follow-up', value: 'Reminder ready' },
              { label: 'Reporting', value: 'Attribution-led' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Lead sources</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Campaign traffic must be tied to visible enquiry actions</h2>
            <p className="mt-4 text-gray-400">
              Advertisers do not care about raw clicks forever. They care about calls, WhatsApp conversations, quote requests, inspections, bookings, signups and sales opportunities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {leadSources.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <FileChartColumn className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">CRM feature set</h2>
          <div className="mt-7 space-y-4">
            {crmFeatures.map((feature) => (
              <p key={feature} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {feature}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <BarChart3 className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Lead pipeline stages</h2>
          <div className="mt-7 space-y-5">
            {pipelineStages.map((item) => (
              <div key={item.stage} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-semibold text-white">{item.stage}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Lead quality rules</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Bad lead logic will corrupt reporting</h2>
              <p className="mt-4 leading-7 text-gray-400">
                If Local Ads inflates leads, advertisers will lose trust. If it ignores qualified leads, publishers will not get proper credit. The CRM must separate intent from noise.
              </p>
            </div>
            <div className="space-y-4">
              {qualityRules.map((rule) => (
                <div key={rule} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  <p className="text-sm leading-6 text-gray-300">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Fast response', text: 'A paid lead loses value when the advertiser responds late. Reminders protect campaign value.', icon: Bell },
            { title: 'Attribution', text: 'Advertisers can see which campaign, publisher, CTA and directory profile produced the enquiry.', icon: Target },
            { title: 'Automation', text: 'Rules can escalate untouched leads, duplicates, spam enquiries and high-intent opportunities.', icon: Repeat },
            { title: 'Support evidence', text: 'Lead records help resolve disputes around campaign quality, refunds and publisher performance.', icon: LifeBuoy },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Automation ideas</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">The CRM should force follow-up discipline</h2>
          </div>
          <div className="mx-auto mt-10 max-w-4xl space-y-4">
            {automationIdeas.map((idea, index) => (
              <div key={idea} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-300">{index + 1}</span>
                <p className="text-sm leading-6 text-gray-300">{idea}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">Clicks are only the start. Leads are where advertisers judge value.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">Use the CRM layer to connect campaign traffic with enquiry quality, follow-up discipline and business outcomes.</p>
        <Link href="/register?role=advertiser" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
          Start tracking leads <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <MarketingFooter />
    </main>
  );
}
