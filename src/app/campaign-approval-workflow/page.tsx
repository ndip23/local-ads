import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileCheck,
  FileText,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Target,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

const reviewStages = [
  {
    title: 'Campaign submission',
    description: 'Advertiser submits campaign objective, creative, CTA, landing page, targeting, budget and schedule.',
    icon: Megaphone,
  },
  {
    title: 'Creative and CTA review',
    description: 'Admin checks copy, image, video, CTA fit, misleading claims and whether the preview matches platform rules.',
    icon: FileText,
  },
  {
    title: 'Landing page and wallet check',
    description: 'Platform verifies landing page safety, destination relevance, available wallet balance and minimum campaign budget.',
    icon: WalletCards,
  },
  {
    title: 'Targeting and publisher-fit review',
    description: 'Admin checks whether the selected location, niche and available publisher inventory can support the campaign.',
    icon: Target,
  },
];

const approvalStatuses = [
  { label: 'Draft', explanation: 'Advertiser is still building the campaign and nothing is visible to publishers.' },
  { label: 'Submitted', explanation: 'Campaign has been sent to admin review with all required fields.' },
  { label: 'Needs changes', explanation: 'Campaign is blocked until advertiser corrects weak creative, broken links, poor CTA or policy issues.' },
  { label: 'Approved', explanation: 'Campaign can enter eligible inventory and be shown through approved publisher placements.' },
  { label: 'Paused', explanation: 'Campaign is temporarily stopped because of budget, schedule, review or advertiser decision.' },
  { label: 'Rejected', explanation: 'Campaign violates platform rules or cannot be fixed enough for safe delivery.' },
];

const adminChecklist = [
  'Campaign title and description are clear, specific and not misleading.',
  'CTA matches the landing page action and does not trick users into clicking.',
  'Uploaded image or video is clean, brand-safe and relevant to the offer.',
  'Landing page loads properly and does not contain malicious, deceptive or unrelated content.',
  'Budget, CPC, schedule and target location are realistic for available inventory.',
  'Campaign niche fits at least one approved publisher category or inventory group.',
  'Restricted claims, regulated offers and suspicious traffic promises are escalated before approval.',
];

const transparencyRules = [
  'Advertisers should always see why a campaign is pending, approved, rejected or sent back for changes.',
  'Admins should not approve campaigns manually without leaving review notes.',
  'Publishers should not receive campaigns until the campaign has passed minimum review checks.',
  'Campaign resubmissions should preserve the rejection reason so problems do not repeat silently.',
  'Approval speed should never be used as an excuse to allow weak campaigns into the network.',
];

export default function CampaignApprovalWorkflowPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Campaign approval workflow</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-white md:text-6xl">Every campaign needs a visible review path before it touches publisher traffic.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            This module structures how campaigns move from draft to approval, rejection, changes, pause and delivery. It protects advertisers, publishers and admins from the chaos that happens when campaign review is informal.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/dashboard/campaigns" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-4 font-semibold text-white hover:bg-green-700">
              Open campaign dashboard <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/brand-safety" className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-7 py-4 font-semibold text-gray-200 hover:bg-gray-800">
              View brand safety rules
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <ClipboardCheck className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-2xl font-bold text-white">Approval control snapshot</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Review route', value: 'Draft → Submitted → Decision' },
              { label: 'Admin checks', value: 'Creative + wallet + targeting' },
              { label: 'User clarity', value: 'Visible rejection notes' },
              { label: 'Publisher safety', value: 'Approved campaigns only' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Review stages</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">A campaign should not be approved because it exists. It should be approved because it is ready.</h2>
            <p className="mt-4 text-gray-400">
              Clear approval stages help the platform reject bad campaigns early, protect publisher audiences and make advertiser feedback specific enough to act on.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reviewStages.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <Icon className="h-10 w-10 text-green-400" />
                  <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <FileCheck className="h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Admin review checklist</h2>
          <div className="mt-7 space-y-4">
            {adminChecklist.map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-6 text-gray-300">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <Clock className="h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Visible campaign statuses</h2>
          <div className="mt-7 space-y-4">
            {approvalStatuses.map((status) => (
              <div key={status.label} className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <p className="font-semibold text-white">{status.label}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{status.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900/70 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">Transparency rules</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Approval must leave an audit trail</h2>
              <p className="mt-4 leading-7 text-gray-400">
                If the platform cannot explain why a campaign was approved, rejected or paused, disputes will become personal arguments. A visible workflow turns moderation into policy.
              </p>
            </div>
            <div className="space-y-4">
              {transparencyRules.map((rule) => (
                <div key={rule} className="flex gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
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
            { title: 'Approve', text: 'Campaign meets platform quality, budget, safety, landing page and targeting requirements.', icon: CheckCircle },
            { title: 'Request changes', text: 'Campaign can be fixed, but needs clearer creative, better CTA, corrected link or stronger targeting.', icon: RefreshCw },
            { title: 'Reject', text: 'Campaign is unsafe, deceptive, non-compliant, unsupported by inventory or too risky for publishers.', icon: XCircle },
            { title: 'Notify', text: 'Advertiser receives status change and admin notes instead of guessing what happened.', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-green-400" />
                <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white md:text-5xl">Weak approval systems destroy ad-network trust.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">Use the approval workflow to make every campaign status, review note and decision traceable.</p>
        <Link href="/register?role=advertiser" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700">
          Submit a campaign <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <MarketingFooter />
    </main>
  );
}
