import Link from 'next/link';
import { ChevronDown, Megaphone } from 'lucide-react';

const navGroups = [
  {
    label: 'Solutions',
    items: [
      { href: '/advertisers', label: 'For Advertisers' },
      { href: '/publishers', label: 'For Publishers' },
      { href: '/partner-network', label: 'Partner Network' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    label: 'Publisher Growth',
    items: [
      { href: '/publisher-onboarding', label: 'Onboarding' },
      { href: '/publisher-qualification', label: 'Qualification' },
      { href: '/publisher-trust', label: 'Publisher Trust' },
      { href: '/publisher-payments', label: 'Payments' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/case-studies', label: 'Case Studies' },
      { href: '/blog', label: 'Blog' },
      { href: '/help', label: 'Help Centre' },
      { href: '/about', label: 'About' },
    ],
  },
];

export function MarketingNav() {
  return (
    <nav className="container mx-auto flex items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2 text-white">
        <Megaphone className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold">Local Ads</span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        {navGroups.map((group) => (
          <div key={group.label} className="group relative">
            <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
              {group.label}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full z-40 w-56 translate-y-2 rounded-xl border border-gray-800 bg-gray-950 p-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
          Login
        </Link>
        <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
