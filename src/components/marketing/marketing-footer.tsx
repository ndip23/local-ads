import Link from 'next/link';
import { Megaphone } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Megaphone className="h-6 w-6 text-blue-400" />
              <span className="font-bold">Local Ads</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-gray-400">
              A local advertising network for advertisers who need measurable clicks and publishers who deserve fair monetisation.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Platform</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link className="block text-gray-400 hover:text-white" href="/advertisers">Advertisers</Link>
              <Link className="block text-gray-400 hover:text-white" href="/advertiser-trust">Advertiser Trust Centre</Link>
              <Link className="block text-gray-400 hover:text-white" href="/campaign-performance-lab">Campaign Performance Lab</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publishers">Publishers</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-trust">Publisher Trust Centre</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-payments">Publisher Payment Policy</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-metrics">Publisher Metrics</Link>
              <Link className="block text-gray-400 hover:text-white" href="/traffic-quality">Traffic Quality</Link>
              <Link className="block text-gray-400 hover:text-white" href="/case-studies">Case Studies</Link>
              <Link className="block text-gray-400 hover:text-white" href="/pricing">Pricing & Packages</Link>
              <Link className="block text-gray-400 hover:text-white" href="/partner-network">Partner Network</Link>
              <Link className="block text-gray-400 hover:text-white" href="/agency-partner-portal">Agency Partner Portal</Link>
              <Link className="block text-gray-400 hover:text-white" href="/ad-inventory-marketplace">Ad Inventory Marketplace</Link>
              <Link className="block text-gray-400 hover:text-white" href="/api-integrations">API & Integrations</Link>
              <Link className="block text-gray-400 hover:text-white" href="/white-label-resellers">White-label & Resellers</Link>
              <Link className="block text-gray-400 hover:text-white" href="/merchant-directory">Merchant Directory</Link>
              <Link className="block text-gray-400 hover:text-white" href="/lead-management-crm">Lead Management CRM</Link>
              <Link className="block text-gray-400 hover:text-white" href="/geo-targeting">Geo-Ad Targeting</Link>
              <Link className="block text-gray-400 hover:text-white" href="/campaign-approval-workflow">Campaign Approval Workflow</Link>
              <Link className="block text-gray-400 hover:text-white" href="/targeting">Audience Targeting</Link>
              <Link className="block text-gray-400 hover:text-white" href="/wallet-operations">Wallet Operations</Link>
              <Link className="block text-gray-400 hover:text-white" href="/automation-rules">Automation Rules</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">Resources</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link className="block text-gray-400 hover:text-white" href="/blog">Blog</Link>
              <Link className="block text-gray-400 hover:text-white" href="/analytics">Analytics & Reporting</Link>
              <Link className="block text-gray-400 hover:text-white" href="/brand-safety">Brand Safety</Link>
              <Link className="block text-gray-400 hover:text-white" href="/disputes">Disputes & Refunds</Link>
              <Link className="block text-gray-400 hover:text-white" href="/notification-centre">Notification Centre</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-tiers">Publisher Tiers</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-onboarding">Publisher Onboarding</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-roadmap">Publisher Roadmap</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-rules">Publisher Rules</Link>
              <Link className="block text-gray-400 hover:text-white" href="/help">Help Centre</Link>
              <Link className="block text-gray-400 hover:text-white" href="/about">Founder/About</Link>
              <Link className="block text-gray-400 hover:text-white" href="/register">Create Account</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">Access</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link className="block text-gray-400 hover:text-white" href="/login">Login</Link>
              <Link className="block text-gray-400 hover:text-white" href="/register?role=advertiser">Advertiser Signup</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-qualification">Publisher Qualification</Link>
              <Link className="block text-gray-400 hover:text-white" href="/founding-publishers">Founding Publishers</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-support">Publisher Support</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-faq">Publisher FAQ</Link>
              <Link className="block text-gray-400 hover:text-white" href="/publisher-niches">Publisher Niches</Link>
              <Link className="block text-gray-400 hover:text-white" href="/register?role=publisher">Publisher Signup</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-sm text-gray-500">© {new Date().getFullYear()} Local Ads. All rights reserved.</p>
      </div>
    </footer>
  );
}
