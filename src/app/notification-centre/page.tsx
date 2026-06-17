import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Mail,
  MessageCircle,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Notification Centre | Local Ads',
  description: 'Notification centre for advertiser alerts, publisher updates, admin reviews, wallet events, disputes and campaign lifecycle messages in Local Ads.',
};

const notificationStreams = [
  {
    title: 'Advertiser alerts',
    description: 'Keep advertisers informed about campaign approval, rejection, spend, performance, wallet and pixel issues.',
    icon: Bell,
    checks: ['Campaign approval updates', 'Budget and wallet alerts', 'Pixel and conversion reminders'],
  },
  {
    title: 'Publisher updates',
    description: 'Notify publishers about site approval, widget status, earnings, payout review and placement-quality warnings.',
    icon: MessageCircle,
    checks: ['Site verification status', 'Earning and payout updates', 'Traffic quality warnings'],
  },
  {
    title: 'Admin task alerts',
    description: 'Push important review work to admins instead of letting campaign, dispute and withdrawal queues pile up silently.',
    icon: Settings,
    checks: ['Pending approvals', 'Dispute case alerts', 'Withdrawal review prompts'],
  },
  {
    title: 'Security notices',
    description: 'Use notifications for fraud flags, suspicious login patterns, account changes and policy enforcement events.',
    icon: ShieldCheck,
    checks: ['Fraud escalation notices', 'Account safety warnings', 'Policy action records'],
  },
];

const channels = [
  { title: 'In-app', description: 'Dashboard notifications for immediate account and workflow updates.', icon: Bell },
  { title: 'Email', description: 'Structured messages for approvals, billing, disputes and monthly summaries.', icon: Mail },
  { title: 'SMS or WhatsApp-ready', description: 'Future-friendly channel planning for urgent wallet, payout and account notices.', icon: Smartphone },
  { title: 'Digest', description: 'Daily or weekly summaries to reduce notification fatigue and support better reporting.', icon: Clock },
];

const priorityRules = [
  'High priority: account security, wallet risk, payout holds, dispute decisions and fraud escalation.',
  'Medium priority: campaign approval, campaign rejection, site approval, budget threshold and pixel warnings.',
  'Low priority: education tips, onboarding nudges, blog updates and performance improvement suggestions.',
  'Digest only: non-urgent analytics summaries, monthly earnings recaps and content recommendations.',
];

const notificationMistakes = [
  'Sending every update as urgent will train users to ignore the platform.',
  'Hiding rejection reasons creates support tickets and angry advertisers or publishers.',
  'Not linking notifications to the exact campaign, wallet entry, dispute or site wastes user time.',
  'Failing to keep a notification history makes audit, support and accountability harder later.',
];

export default function NotificationCentrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Notification centre module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Keep advertisers, publishers and admins informed before problems become complaints.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          A serious ad network needs more than dashboard pages. Users must know when a campaign is approved, when a wallet needs funding, when a publisher site needs action, and when a dispute or payout decision has changed.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/dashboard/notifications" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Open dashboard notifications <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/automation-rules" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Connect automation rules <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {notificationStreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <div key={stream.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-green-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{stream.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{stream.description}</p>
                <div className="mt-5 space-y-2">
                  {stream.checks.map((check) => (
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
            <Send className="mx-auto h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Use the right channel for the right level of urgency.</h2>
            <p className="mt-4 text-gray-400">
              Notification design is not about making noise. It is about getting the right message to the right role at the exact moment action is needed.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <div key={channel.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-9 w-9 text-blue-400" />
                    <span className="text-sm font-bold text-gray-600">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{channel.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{channel.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <Bell className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Priority rules for notification design</h2>
            <div className="mt-7 space-y-4">
              {priorityRules.map((rule) => (
                <p key={rule} className="flex gap-3 text-gray-300">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {rule}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <MessageCircle className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Notification mistakes this module prevents</h2>
            <div className="mt-7 space-y-4">
              {notificationMistakes.map((mistake) => (
                <p key={mistake} className="flex gap-3 text-gray-300">
                  <Send className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                  {mistake}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <Mail className="mx-auto h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">A notification centre reduces confusion, delays and silent failure.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Campaigns, wallets, approvals, disputes and publisher earnings all require timely communication. This module gives Local Ads a proper communication layer.
          </p>
          <Link href="/help" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Connect notifications to help centre <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
