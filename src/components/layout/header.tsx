'use client';

import Link from 'next/link';
import { Bell, ChevronDown, LayoutGrid, Search, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
  walletBalance?: string;
}

const navGroups = {
  admin: [
    {
      label: 'Operate',
      items: [
        { href: '/dashboard/modules', label: 'Module Centre' },
        { href: '/dashboard/approvals', label: 'Approvals' },
        { href: '/dashboard/campaigns', label: 'Campaigns' },
        { href: '/dashboard/users', label: 'Users' },
      ],
    },
    {
      label: 'Risk & Money',
      items: [
        { href: '/dashboard/fraud', label: 'Fraud Detection' },
        { href: '/dashboard/disputes', label: 'Disputes' },
        { href: '/dashboard/withdrawals', label: 'Withdrawals' },
        { href: '/dashboard/country-rates', label: 'Geo Rates' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { href: '/dashboard/analytics', label: 'Analytics' },
        { href: '/dashboard/publisher-sites', label: 'Publisher Sites' },
        { href: '/dashboard/admin-referrals', label: 'Referral Settings' },
        { href: '/dashboard/referrals', label: 'My Referral Link' },
      ],
    },
  ],
  advertiser: [
    {
      label: 'Campaigns',
      items: [
        { href: '/dashboard/modules', label: 'Module Centre' },
        { href: '/dashboard/campaigns/new', label: 'Create Campaign' },
        { href: '/dashboard/campaigns', label: 'My Campaigns' },
        { href: '/dashboard/approvals', label: 'Approval Status' },
      ],
    },
    {
      label: 'Growth',
      items: [
        { href: '/dashboard/analytics', label: 'Analytics' },
        { href: '/dashboard/pixels', label: 'Tracking Pixels' },
        { href: '/dashboard/referrals', label: 'Referrals' },
        { href: '/dashboard/disputes', label: 'Disputes' },
      ],
    },
    {
      label: 'Finance',
      items: [{ href: '/dashboard/wallet', label: 'Wallet' }],
    },
  ],
  publisher: [
    {
      label: 'Monetise',
      items: [
        { href: '/dashboard/modules', label: 'Module Centre' },
        { href: '/dashboard/ads', label: 'Browse Ads' },
        { href: '/dashboard/tracking-links', label: 'Tracking Links' },
        { href: '/dashboard/widgets', label: 'Widgets' },
      ],
    },
    {
      label: 'Publisher Tools',
      items: [
        { href: '/dashboard/sites', label: 'Sites' },
        { href: '/dashboard/ad-units', label: 'Ad Units' },
        { href: '/dashboard/adsense', label: 'AdSense' },
        { href: '/dashboard/my-pixel', label: 'Publisher Pixel' },
      ],
    },
    {
      label: 'Earnings',
      items: [
        { href: '/dashboard/earnings', label: 'Earnings' },
        { href: '/dashboard/wallet', label: 'Wallet' },
        { href: '/dashboard/referrals', label: 'Referrals' },
        { href: '/dashboard/disputes', label: 'Disputes' },
      ],
    },
  ],
} as const;

export function Header({ user, walletBalance }: HeaderProps) {
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  const role = user.role as keyof typeof navGroups;
  const groups = navGroups[role] || navGroups.publisher;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex min-h-16 flex-col gap-3 py-3 xl:flex-row xl:items-center xl:justify-between xl:py-0">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 md:text-lg">
              Welcome back, {user.firstName || 'User'}
            </h2>
            <p className="text-xs text-gray-500 md:text-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950">
            Dashboard
          </Link>
          {groups.map((group) => (
            <div key={group.label} className="group relative">
              <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950">
                {group.label}
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full w-56 translate-y-2 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 md:flex">
            <Search className="h-4 w-4" />
            Quick actions in module centre
          </div>

          {walletBalance && (
            <Link href="/dashboard/wallet" className="rounded-xl border border-gray-200 px-3 py-2 text-right transition-colors hover:bg-gray-50">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-sm font-semibold text-gray-900 md:text-base">
                {formatCurrency(walletBalance)}
              </p>
            </Link>
          )}

          <Link href="/dashboard/modules" className="rounded-xl bg-gray-900 p-2 text-white transition-colors hover:bg-blue-700" title="Module Centre">
            <LayoutGrid className="h-5 w-5" />
          </Link>

          <Link href="/dashboard/notifications" className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-medium text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-sm sm:block">
              <p className="max-w-40 truncate font-medium text-gray-900">{displayName}</p>
              <p className="capitalize text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
