import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  FileSearch,
  LifeBuoy,
  MessageSquareWarning,
  RefreshCcw,
  RotateCcw,
  Scale,
  ShieldCheck,
  Siren,
  TimerReset,
  UserCheck,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Disputes & Refund Management | Local Ads',
  description: 'Dispute handling, refund review, click-quality complaints, payout challenges and case management workflow for Local Ads.',
};

const disputeTypes = [
  {
    title: 'Advertiser click complaints',
    description: 'Advertisers need a formal path to challenge suspicious clicks, weak placements or campaign delivery issues.',
    icon: MousePointerComplaintIcon,
    checks: ['Suspicious click review', 'Placement evidence check', 'Campaign delivery notes'],
  },
  {
    title: 'Publisher payout issues',
    description: 'Publishers need a way to query rejected earnings, delayed withdrawals and balance adjustments.',
    icon: UserCheck,
    checks: ['Payout status tracking', 'Rejected earning explanation', 'Bank detail correction'],
  },
  {
    title: 'Refund requests',
    description: 'Refunds should not be informal promises. They need rules, status history and admin approval.',
    icon: RotateCcw,
    checks: ['Refund eligibility rules', 'Budget reversal records', 'Admin approval workflow'],
  },
  {
    title: 'Policy violations',
    description: 'Campaigns, publishers and users that violate quality rules need documented enforcement action.',
    icon: ShieldCheck,
    checks: ['Warning records', 'Suspension notes', 'Appeal decision history'],
  },
];

function MousePointerComplaintIcon({ className }: { className?: string }) {
  return <MessageSquareWarning className={className} />;
}

const caseFlow = [
  { title: 'Open case', description: 'User submits the dispute type, affected campaign, transaction or payout and a short explanation.', icon: LifeBuoy },
  { title: 'Collect evidence', description: 'System attaches click logs, campaign records, payout records, placement details and admin notes.', icon: FileSearch },
  { title: 'Review decision', description: 'Admin accepts, rejects, escalates or requests more information using a structured case status.', icon: ClipboardCheck },
  { title: 'Resolve and record', description: 'Refunds, reversals, warnings, payout corrections or no-action decisions are recorded permanently.', icon: Scale },
];

const requiredFields = [
  'Case ID, user role, priority, status, affected campaign, publisher site or payout record.',
  'Dispute category such as invalid click, poor placement, refund request, rejected payout or policy appeal.',
  'Evidence uploads such as screenshots, URLs, transaction references or campaign delivery notes.',
  'Admin response history so the platform does not lose context when a dispute drags on.',
  'Resolution type such as refund approved, refund denied, payout released, payout rejected, account warned or account suspended.',
  'Audit timestamp for every decision, because informal support messages are not enough for a money-based platform.',
];

const dangers = [
  'No dispute workflow means every complaint becomes a WhatsApp argument or email thread nobody can track.',
  'Refunding without evidence rewards noisy users and punishes honest publishers.',
  'Rejecting payouts without clear reasons destroys publisher trust quickly.',
  'Treating fraud review and dispute review as the same thing creates messy decisions.',
  'Failing to store case history makes repeat abuse harder to identify.',
];

export default function DisputesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">Disputes and refunds module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Build a dispute system before money problems start damaging trust.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Any serious ad network will face complaints: invalid clicks, rejected payouts, poor placements, refund demands and policy appeals. The wrong move is handling them manually with no case trail.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/help" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Open support guidance <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/brand-safety" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            View policy rules <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {disputeTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-red-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{type.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{type.description}</p>
                <div className="mt-5 space-y-2">
                  {type.checks.map((check) => (
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
            <Siren className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">Every complaint needs a status, evidence and final decision.</h2>
            <p className="mt-4 text-gray-400">
              A dispute process protects both sides. Advertisers get a fair review. Publishers get protection from baseless refund pressure. Admins get a defensible record.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {caseFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-9 w-9 text-blue-400" />
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
            <TimerReset className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Case fields this module should capture</h2>
            <div className="mt-7 space-y-4">
              {requiredFields.map((field) => (
                <p key={field} className="flex gap-3 text-gray-300">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {field}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <AlertTriangle className="h-12 w-12 text-red-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Risks this module removes</h2>
            <div className="mt-7 space-y-4">
              {dangers.map((danger) => (
                <p key={danger} className="flex gap-3 text-gray-300">
                  <RefreshCcw className="mt-1 h-5 w-5 flex-shrink-0 text-red-400" />
                  {danger}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <Scale className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Fair dispute handling is not customer service decoration. It is marketplace infrastructure.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            The larger Local Ads becomes, the more important structured cases, refund rules and payout appeal records become. Build the discipline early.
          </p>
          <Link href="/wallet-operations" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Connect to wallet operations <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
