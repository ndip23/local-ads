import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileCheck,
  Repeat,
  Send,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Automation Rules | Local Ads',
  description: 'Automation rules for campaign approvals, budget alerts, publisher checks, fraud signals, follow-ups and operational workflows in Local Ads.',
};

const ruleTypes = [
  {
    title: 'Campaign automation',
    description: 'Trigger actions when campaigns are submitted, approved, paused, rejected, exhausted or underperforming.',
    icon: Zap,
    checks: ['Approval status alerts', 'Budget exhaustion warnings', 'Low-performance review prompts'],
  },
  {
    title: 'Publisher automation',
    description: 'Monitor publisher sites, widgets, traffic quality and payout readiness without depending on manual checking alone.',
    icon: FileCheck,
    checks: ['Site verification reminders', 'Placement quality checks', 'Withdrawal eligibility flags'],
  },
  {
    title: 'Fraud and safety automation',
    description: 'Escalate suspicious activity when click patterns, country mismatch, device repetition or abnormal spikes appear.',
    icon: ShieldCheck,
    checks: ['Suspicious click escalation', 'Temporary campaign hold', 'Admin review queue routing'],
  },
  {
    title: 'Follow-up automation',
    description: 'Send helpful nudges to advertisers and publishers when they abandon important setup steps.',
    icon: Send,
    checks: ['Incomplete campaign reminders', 'Missing pixel reminders', 'Publisher onboarding nudges'],
  },
];

const automationFlow = [
  { title: 'Choose a trigger', description: 'A campaign, wallet, publisher site, click event or support case creates the starting signal.', icon: Settings },
  { title: 'Apply conditions', description: 'The rule checks role, status, budget, country, risk level, timing or completion state.', icon: Clock },
  { title: 'Run an action', description: 'The platform sends a notification, pauses a campaign, creates a review item or updates a status.', icon: Zap },
  { title: 'Record the outcome', description: 'Every automation result should be logged so admins can audit what happened and why.', icon: Repeat },
];

const examples = [
  'If an advertiser submits a campaign without a strong CTA, show CTA suggestions before final submission.',
  'If campaign wallet balance falls below the daily budget, warn the advertiser and prepare to pause delivery.',
  'If a publisher receives repeated invalid-click flags, route the placement to admin review before payout.',
  'If a new publisher signs up but does not add a site within 24 hours, send an onboarding reminder.',
  'If a campaign is approved but has no conversion pixel, notify the advertiser about weak measurement.',
  'If a dispute is opened, create an admin task and notify the affected advertiser or publisher.',
];

const weakManualHabits = [
  'Relying on admins to remember every approval, warning, follow-up and payout check will not scale.',
  'Letting campaigns continue after budget or fraud thresholds are crossed exposes the platform to avoidable loss.',
  'Onboarding users without automated reminders increases abandoned accounts and unfinished campaigns.',
  'Keeping automation decisions invisible creates confusion when users ask why something was paused or rejected.',
];

export default function AutomationRulesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Automation rules module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Turn repeated admin work into rules the platform can enforce.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Local Ads should not depend on someone manually checking every campaign, publisher site, wallet balance, fraud signal and onboarding step. Automation rules make the network faster, safer and easier to operate at scale.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/dashboard/campaigns" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Review campaign workflow <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/notification-centre" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Connect notifications <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ruleTypes.map((rule) => {
            const Icon = rule.icon;
            return (
              <div key={rule.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-blue-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{rule.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{rule.description}</p>
                <div className="mt-5 space-y-2">
                  {rule.checks.map((check) => (
                    <p key={check} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      {check}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Repeat className="mx-auto h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Every useful automation follows a clean rule pattern.</h2>
            <p className="mt-4 text-gray-400">
              Do not build random alerts scattered across the product. Use a predictable trigger, condition, action and log structure so the platform remains auditable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {automationFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-9 w-9 text-green-400" />
                    <span className="text-sm font-bold text-gray-600">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <Settings className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Rule examples worth building first</h2>
            <div className="mt-7 space-y-4">
              {examples.map((example) => (
                <p key={example} className="flex gap-3 text-gray-300">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {example}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <Clock className="h-12 w-12 text-red-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Manual habits this module removes</h2>
            <div className="mt-7 space-y-4">
              {weakManualHabits.map((habit) => (
                <p key={habit} className="flex gap-3 text-gray-300">
                  <FileCheck className="mt-1 h-5 w-5 flex-shrink-0 text-red-400" />
                  {habit}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <Zap className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Automation is how Local Ads stops behaving like a spreadsheet business.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            The more users, campaigns and publishers you add, the more dangerous manual operations become. This module gives the platform a rule-based operating backbone.
          </p>
          <Link href="/analytics" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Link rules to analytics <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
