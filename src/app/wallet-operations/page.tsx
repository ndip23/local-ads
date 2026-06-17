import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  CheckCircle,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  HandCoins,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Payments & Wallet Operations | Local Ads',
  description: 'Payments, wallet funding, ad spend control, publisher balances, withdrawal review and settlement operations for Local Ads.',
};

const walletLayers = [
  {
    title: 'Advertiser funding',
    description: 'Advertisers should fund campaigns before traffic runs so CPC spend never becomes uncontrolled debt.',
    icon: CreditCard,
    checks: ['Pre-funded campaign budgets', 'Daily and total spend limits', 'Wallet balance visibility'],
  },
  {
    title: 'Publisher earnings',
    description: 'Publishers need clear earning records tied to qualified clicks, approved placements and fraud review outcomes.',
    icon: HandCoins,
    checks: ['Qualified-click earnings', '80% publisher share logic', 'Pending and available balances'],
  },
  {
    title: 'Platform ledger',
    description: 'Every debit, credit, payout and adjustment should be traceable instead of hidden inside dashboard totals.',
    icon: ReceiptText,
    checks: ['Transaction history', 'Adjustment records', 'Revenue-share breakdowns'],
  },
  {
    title: 'Withdrawal control',
    description: 'Payouts should pass through eligibility, fraud and admin approval checks before money leaves the platform.',
    icon: Landmark,
    checks: ['Payout request review', 'Bank detail verification', 'Admin approval queue'],
  },
];

const operatingFlow = [
  { title: 'Fund wallet', description: 'Advertiser adds money to the wallet and chooses how much can be attached to each campaign.', icon: WalletCards },
  { title: 'Spend on qualified clicks', description: 'Approved campaigns deduct spend only when the click passes the platform quality checks.', icon: BadgeDollarSign },
  { title: 'Split revenue', description: 'The publisher earns the defined share while the platform records its operating margin.', icon: CircleDollarSign },
  { title: 'Approve settlement', description: 'Publisher withdrawal requests are reviewed before settlement to protect the marketplace.', icon: ShieldCheck },
];

const controls = [
  'Block campaigns from going live when wallet balance is too low for the selected budget.',
  'Separate available balance from pending balance until click quality and fraud checks are complete.',
  'Show advertisers how much has been spent, reserved, refunded or paused at campaign level.',
  'Show publishers how much is earned per campaign, per placement and per payout cycle.',
  'Keep admin adjustment records for reversals, corrections, bonuses, penalties and manual settlements.',
  'Prevent withdrawals where bank details are incomplete, suspicious or not yet reviewed.',
];

const weakSpots = [
  'Letting advertisers launch without wallet discipline creates unpaid traffic liability.',
  'Showing publishers only a single balance number creates payout confusion and support tickets.',
  'Mixing pending clicks with approved earnings makes fraud control almost useless.',
  'Not recording platform share per transaction makes finance reconciliation painful later.',
  'Manual payout promises without an approval trail will become a trust problem fast.',
];

export default function WalletOperationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <MarketingNav />

      <section className="container mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Payments and wallet module</p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Control money before traffic runs, not after disputes begin.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Local Ads needs a finance layer that keeps advertiser spend, publisher earnings, platform revenue and withdrawal approvals clean. A wallet is not just a balance screen. It is the operating discipline of the marketplace.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register?role=advertiser" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Fund advertiser wallet <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/register?role=publisher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-gray-950 hover:bg-gray-100">
            Track publisher earnings <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {walletLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
                <Icon className="h-10 w-10 text-green-400" />
                <h2 className="mt-5 text-xl font-bold text-white">{layer.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{layer.description}</p>
                <div className="mt-5 space-y-2">
                  {layer.checks.map((check) => (
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
            <Banknote className="mx-auto h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white md:text-4xl">The wallet flow must be boring, traceable and hard to manipulate.</h2>
            <p className="mt-4 text-gray-400">
              Fast growth is useless if money movement becomes messy. This module defines the logic that keeps advertiser funds, publisher payouts and platform revenue accountable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {operatingFlow.map((step, index) => {
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
            <LockKeyhole className="h-12 w-12 text-green-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Wallet controls to build into the product</h2>
            <div className="mt-7 space-y-4">
              {controls.map((control) => (
                <p key={control} className="flex gap-3 text-gray-300">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                  {control}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">
            <FileCheck className="h-12 w-12 text-blue-400" />
            <h2 className="mt-5 text-3xl font-bold text-white">Financial weak spots this module prevents</h2>
            <div className="mt-7 space-y-4">
              {weakSpots.map((spot) => (
                <p key={spot} className="flex gap-3 text-gray-300">
                  <ReceiptText className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                  {spot}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10">
          <WalletCards className="mx-auto h-12 w-12 text-green-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">A clean wallet module makes the whole ad network easier to trust.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Advertisers need spending control. Publishers need payout confidence. Admins need a ledger they can defend. This module puts all three into one operating model.
          </p>
          <Link href="/pricing" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700">
            Connect wallet to pricing <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
