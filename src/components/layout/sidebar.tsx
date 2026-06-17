'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MousePointerClick,
  DollarSign,
  Settings,
  Globe,
  AlertTriangle,
  Wallet,
  Link2,
  BarChart3,
  Bell,
  LogOut,
  LayoutGrid,
  Plug,
  Code,
  Gift,
  Layers,
  ShieldCheck,
  LifeBuoy,
  ClipboardCheck,
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'advertiser' | 'publisher';
  onLogout: () => void;
}

export function Sidebar({ role, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/modules', label: 'Module Centre', icon: LayoutGrid },
    { href: '/dashboard/approvals', label: 'Approvals', icon: ClipboardCheck },
    { href: '/dashboard/campaigns/new', label: 'Create Campaign', icon: Megaphone },
    { href: '/dashboard/campaigns', label: 'All Campaigns', icon: BarChart3 },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/publisher-sites', label: 'Publisher Verification', icon: ShieldCheck },
    { href: '/dashboard/country-rates', label: 'Country Rates', icon: Globe },
    { href: '/dashboard/admin-referrals', label: 'Referral Settings', icon: Gift },
    { href: '/dashboard/referrals', label: 'My Referral Link', icon: Link2 },
    { href: '/dashboard/fraud', label: 'Fraud Detection', icon: AlertTriangle },
    { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: DollarSign },
    { href: '/dashboard/disputes', label: 'Disputes', icon: LifeBuoy },
    { href: '/dashboard/analytics', label: 'Analytics', icon: LayoutGrid },
  ];

  const advertiserLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/modules', label: 'Module Centre', icon: LayoutGrid },
    { href: '/dashboard/campaigns', label: 'My Campaigns', icon: Megaphone },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/pixels', label: 'Tracking Pixels', icon: MousePointerClick },
    { href: '/dashboard/referrals', label: 'Referrals', icon: Gift },
    { href: '/dashboard/approvals', label: 'Approval Status', icon: ClipboardCheck },
    { href: '/dashboard/disputes', label: 'Disputes', icon: LifeBuoy },
  ];

  const publisherLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/modules', label: 'Module Centre', icon: LayoutGrid },
    { href: '/dashboard/ads', label: 'Browse Ads', icon: Megaphone },
    { href: '/dashboard/tracking-links', label: 'My Links', icon: Link2 },
    { href: '/dashboard/widgets', label: 'Ad Widgets', icon: Layers },
    { href: '/dashboard/my-pixel', label: 'My Pixel', icon: Code },
    { href: '/dashboard/referrals', label: 'Referrals', icon: Gift },
    { href: '/dashboard/sites', label: 'My Sites', icon: ShieldCheck },
    { href: '/dashboard/ad-units', label: 'Ad Units', icon: LayoutGrid },
    { href: '/dashboard/adsense', label: 'AdSense', icon: Plug },
    { href: '/dashboard/approvals', label: 'Approval Status', icon: ClipboardCheck },
    { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/disputes', label: 'Disputes', icon: LifeBuoy },
  ];

  const links = role === 'admin' 
    ? adminLinks 
    : role === 'advertiser' 
    ? advertiserLinks 
    : publisherLinks;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-blue-400" />
          Local Ad Network
        </h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard/notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Bell className="h-5 w-5" />
          Notifications
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
