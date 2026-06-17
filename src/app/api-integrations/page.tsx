import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Code2,
  Database,
  FileCheck,
  Globe,
  KeyRound,
  Link2,
  LockKeyhole,
  Plug,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'API & Integrations Centre | Local Ads',
  description: 'A developer-facing API and integrations module for Local Ads campaign, publisher, reporting, wallet and webhook workflows.',
};

const integrationGroups = [
  {
    title: 'Campaign API',
    description: 'Create, update, pause and review advertiser campaigns from approved external tools without bypassing platform approval rules.',
    icon: Code2,
  },
  {
    title: 'Publisher API',
    description: 'Connect approved publisher websites, ad placements, traffic metrics and quality signals into the Local Ads network.',
    icon: Globe,
  },
  {
    title: 'Reporting API',
    description: 'Expose impressions, clicks, conversions, spend, earnings, traffic quality and placement performance to trusted dashboards.',
    icon: BarChart3,
  },
  {
    title: 'Wallet API',
    description: 'Allow controlled wallet funding, transaction checks, payout status updates and payment reconciliation with clear audit trails.',
    icon: Database,
  },
];

const integrationFeatures = [
  'API key management for advertisers, publishers, agencies and approved partners.',
  'Webhook events for campaign approval, campaign rejection, wallet funding, payout approval and fraud review.',
  'Integration logs showing successful calls, failed calls, rate limits and security warnings.',
  'Sandbox mode so partners can test campaign creation and reporting before using live data.',
  'Strict permission scopes so one partner cannot access another advertiser or publisher account.',
  'Developer documentation for authentication, payload examples, status codes and webhook retries.',
];

const webhookEvents = [
  { event: 'campaign.approved', use: 'Notify advertisers or agency tools when a campaign can start running.' },
  { event: 'campaign.rejected', use: 'Send rejection reason and correction steps back to campaign owners.' },
  { event: 'publisher.approved', use: 'Inform publishers when their website or placement becomes eligible.' },
  { event: 'wallet.funded', use: 'Confirm advertiser wallet credit after payment reconciliation.' },
  { event: 'payout.approved', use: 'Notify publishers when earnings move from pending to approved payout.' },
  { event: 'traffic.flagged', use: 'Escalate suspicious activity before it becomes a payment or refund dispute.' },
];

const securityRules = [
  'Every API request must use scoped API keys or signed tokens, not ordinary dashboard passwords.',
  'High-risk actions such as payout approval, refund approval and fraud clearing should remain admin-controlled.',
  'Rate limits must protect the platform from spammy campaign creation, fake reporting pulls and brute-force attempts.',
  'Webhook endpoints must support signature verification so fake events cannot be injected into partner systems.',
];

const rolloutPlan = [
  'Document current internal campaign, publisher, wallet and reporting data objects.',
  'Create sandbox endpoints for approved partners before exposing live production access.',
  'Add API keys, scopes, webhook subscriptions and integration logs to the admin layer.',
  'Invite a small number of trusted agencies and publishers to test integrations.',
  'Only expand public API access after security, support and documentation are mature.',
];

export default function ApiIntegrationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">API & integrations centre</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Make Local Ads connect with serious partners without exposing the core system recklessly.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module defines how agencies, publishers, analytics tools, payment services and future partners can connect to Local Ads through controlled APIs, webhooks and integration logs.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/agency-partner-portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
              View agency partner path <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/analytics" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View reporting layer
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Plug className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Integration snapshot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Access', value: 'Scoped API keys' },
              { label: 'Events', value: 'Webhook ready' },
              { label: 'Mode', value: 'Sandbox first' },
              { label: 'Security', value: 'Audit logged' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Integration areas</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">APIs should extend the platform, not create uncontrolled back doors</h2>
            <p className="mt-4 text-gray-400">
              The correct API strategy is not to open everything. Start with high-value workflows that improve partner operations while keeping sensitive approval, fraud and payment actions under platform control.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {integrationGroups.map((item) => {
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
          <FileCheck className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Core integration features</h2>
          <div className="mt-7 space-y-4">
            {integrationFeatures.map((feature) => (
              <p key={feature} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {feature}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Webhook className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Webhook event catalogue</h2>
          <div className="mt-7 space-y-4">
            {webhookEvents.map((item) => (
              <div key={item.event} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-mono text-sm font-semibold text-blue-300">{item.event}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Security model</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Integrations without permission discipline will damage trust fast</h2>
              <p className="mt-4 leading-7 text-gray-400">
                API access must be treated as a controlled privilege. A weak integration layer can leak reports, inflate spend, create fake campaigns or trigger payment disputes.
              </p>
            </div>
            <div className="space-y-4">
              {securityRules.map((rule) => (
                <div key={rule} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <LockKeyhole className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
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
            { title: 'API keys', text: 'Issue scoped keys by account type, role and integration purpose.', icon: KeyRound },
            { title: 'Webhooks', text: 'Send platform events into approved third-party tools with verification.', icon: Webhook },
            { title: 'Data sync', text: 'Keep reporting, wallet and campaign states aligned across systems.', icon: Link2 },
            { title: 'Policy lock', text: 'Never allow integrations to bypass review, fraud or payout controls.', icon: ShieldCheck },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Rollout plan</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Build the API layer slowly because integrations multiply risk</h2>
          </div>
          <div className="mx-auto mt-10 max-w-4xl space-y-4">
            {rolloutPlan.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-300">{index + 1}</span>
                <p className="text-sm leading-6 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <h2 className="text-3xl font-bold text-white">A useful API makes Local Ads easier to sell, integrate and scale.</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
            But the honest rule is simple: integrate what strengthens trust, block what creates hidden risk.
          </p>
          <Link href="/help" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white hover:bg-blue-700">
            Review help centre <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
