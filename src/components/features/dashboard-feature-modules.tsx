'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  MousePointerClick,
  ShieldCheck,
  Target,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';

type Role = 'admin' | 'advertiser' | 'publisher';

interface DashboardFeatureModulesProps {
  role: Role;
}

interface SummaryState {
  stats: Record<string, any> | null;
  disputes: any[];
  campaigns: any[];
  countryRates: any[];
  moduleOverview: any | null;
}

const roleLabels: Record<Role, string> = {
  admin: 'Platform control',
  advertiser: 'Campaign growth',
  publisher: 'Publisher monetisation',
};

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (['active', 'approved', 'resolved', 'completed'].includes(status)) return 'success';
  if (['pending', 'pending_approval', 'under_review', 'open'].includes(status)) return 'warning';
  if (['rejected', 'fraud', 'failed', 'banned'].includes(status)) return 'error';
  if (['paused', 'closed'].includes(status)) return 'info';
  return 'default';
}

export function DashboardFeatureModules({ role }: DashboardFeatureModulesProps) {
  const [summary, setSummary] = useState<SummaryState>({ stats: null, disputes: [], campaigns: [], countryRates: [], moduleOverview: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const requests: Promise<Response>[] = [
          fetch('/api/stats?period=30d'),
          fetch('/api/disputes'),
          fetch('/api/campaigns'),
          fetch('/api/modules/overview'),
        ];

        if (role === 'admin' || role === 'advertiser') {
          requests.push(fetch('/api/admin/country-rates'));
        }

        const responses = await Promise.all(requests);
        const [statsResponse, disputesResponse, campaignsResponse, modulesResponse, ratesResponse] = responses;

        const stats = statsResponse.ok ? await statsResponse.json() : null;
        const disputesData = disputesResponse.ok ? await disputesResponse.json() : { disputes: [] };
        const campaignsData = campaignsResponse.ok ? await campaignsResponse.json() : { campaigns: [] };
        const modulesData = modulesResponse && modulesResponse.ok ? await modulesResponse.json() : null;
        const ratesData = ratesResponse && ratesResponse.ok ? await ratesResponse.json() : { rates: [] };

        if (mounted) {
          setSummary({
            stats,
            disputes: disputesData.disputes || [],
            campaigns: campaignsData.campaigns || [],
            countryRates: ratesData.rates || [],
            moduleOverview: modulesData,
          });
        }
      } catch (error) {
        console.error('Failed to load module summary:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [role]);

  const moduleMetrics = useMemo(() => {
    const pendingCampaigns = summary.campaigns.filter((campaign) => campaign.status === 'pending_approval').length;
    const activeCampaigns = summary.campaigns.filter((campaign) => campaign.status === 'active').length;
    const openDisputes = summary.disputes.filter((dispute) => ['open', 'under_review'].includes(dispute.status)).length;
    const activeRates = summary.moduleOverview?.counts?.geoZones || summary.countryRates.filter((rate) => rate.active).length;
    const walletBalance = summary.stats?.wallet?.balance || summary.stats?.wallet?.pendingBalance || '0';
    const totalClicks = summary.stats?.clicks?.total || 0;
    const totalConversions = summary.stats?.conversions?.total || 0;
    const approvalRequests = summary.moduleOverview?.counts?.approvalsPending || pendingCampaigns;
    const trustSignalsOpen = summary.moduleOverview?.counts?.trustSignalsOpen || 0;
    const targetingSegments = summary.moduleOverview?.counts?.targetingSegments || 0;

    return { pendingCampaigns, activeCampaigns, openDisputes, activeRates, walletBalance, totalClicks, totalConversions, approvalRequests, trustSignalsOpen, targetingSegments };
  }, [summary]);

  const featureCards = [
    {
      title: 'Ad Trust',
      subtitle: 'Spend, traffic quality and dispute confidence',
      icon: ShieldCheck,
      metric: role === 'admin' ? `${moduleMetrics.trustSignalsOpen} trust signals` : `${formatCurrency(moduleMetrics.walletBalance)} balance`,
      description: 'Centralise wallet visibility, fraud signals, campaign status and complaint evidence so users are not guessing about money or traffic quality.',
      actions: role === 'admin'
        ? [{ label: 'Review fraud', href: '/dashboard/fraud' }, { label: 'Open disputes', href: '/dashboard/disputes' }]
        : [{ label: 'Wallet', href: '/dashboard/wallet' }, { label: 'Raise dispute', href: '/dashboard/disputes' }],
    },
    {
      title: 'Performance Lab',
      subtitle: 'Campaign learning and conversion diagnosis',
      icon: BarChart3,
      metric: `${formatNumber(moduleMetrics.totalClicks)} clicks`,
      description: 'Use analytics, conversion pixels and campaign comparisons to diagnose what is actually performing rather than relying on vanity click counts.',
      actions: role === 'publisher'
        ? [{ label: 'Earnings', href: '/dashboard/earnings' }, { label: 'Analytics', href: '/dashboard/analytics' }]
        : [{ label: 'Analytics', href: '/dashboard/analytics' }, { label: 'Campaigns', href: '/dashboard/campaigns' }],
    },
    {
      title: 'Geo Zones',
      subtitle: 'Country pricing and location controls',
      icon: MapPin,
      metric: role === 'admin' ? `${moduleMetrics.activeRates} active rates` : `${moduleMetrics.activeCampaigns} active campaigns`,
      description: 'Keep country CPCs, publisher share and market targeting in one operational lane instead of scattering geo settings across landing pages.',
      actions: role === 'admin'
        ? [{ label: 'Country rates', href: '/dashboard/country-rates' }, { label: 'Approvals', href: '/dashboard/approvals' }]
        : [{ label: 'Campaign targeting', href: '/dashboard/campaigns/new' }, { label: 'Campaigns', href: '/dashboard/campaigns' }],
    },
    {
      title: 'Targeting',
      subtitle: 'Niche, audience and placement matching',
      icon: Target,
      metric: `${moduleMetrics.targetingSegments} segments`,
      description: 'Connect campaign niches, publisher widgets, ad units and country rules so targeting becomes an execution feature, not a brochure section.',
      actions: role === 'publisher'
        ? [{ label: 'Widgets', href: '/dashboard/widgets' }, { label: 'Ad units', href: '/dashboard/ad-units' }]
        : [{ label: 'New campaign', href: '/dashboard/campaigns/new' }, { label: 'All campaigns', href: '/dashboard/campaigns' }],
    },
    {
      title: 'Disputes',
      subtitle: 'Evidence-based issue resolution',
      icon: LifeBuoy,
      metric: `${moduleMetrics.openDisputes} active`,
      description: 'Route refund requests, suspicious traffic complaints, payout issues and approval problems through a trackable workflow.',
      actions: [{ label: 'Open dispute centre', href: '/dashboard/disputes' }],
    },
    {
      title: 'Approvals',
      subtitle: 'Campaign and publisher review queue',
      icon: ClipboardCheck,
      metric: `${moduleMetrics.approvalRequests} pending requests`,
      description: 'Give admins a single approval queue while advertisers and publishers can clearly see what needs review before it goes live.',
      actions: role === 'admin'
        ? [{ label: 'Approval centre', href: '/dashboard/approvals' }, { label: 'Publisher sites', href: '/dashboard/publisher-sites' }]
        : [{ label: 'Campaigns', href: '/dashboard/campaigns' }, { label: role === 'publisher' ? 'My sites' : 'Dashboard', href: role === 'publisher' ? '/dashboard/sites' : '/dashboard' }],
    },
  ];

  const operationalRows = [
    { label: 'Wallet operations', value: formatCurrency(moduleMetrics.walletBalance), href: '/dashboard/wallet', icon: WalletCards },
    { label: 'Conversion actions', value: formatNumber(moduleMetrics.totalConversions), href: role === 'publisher' ? '/dashboard/earnings' : '/dashboard/pixels', icon: MousePointerClick },
    { label: 'Traffic quality', value: role === 'admin' ? 'Fraud queue' : 'Quality signals', href: role === 'admin' ? '/dashboard/fraud' : '/dashboard/analytics', icon: AlertTriangle },
    { label: 'Market controls', value: role === 'admin' ? `${moduleMetrics.activeRates} zones` : 'Campaign geo', href: role === 'admin' ? '/dashboard/country-rates' : '/dashboard/campaigns/new', icon: Globe2 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gray-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Module centre</p>
            <h1 className="mt-3 text-3xl font-bold">Operational features for {roleLabels[role]}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
              The modules are now treated as working dashboard features. The homepage stays clean while logged-in users manage trust, performance, geo zones, targeting, approvals, disputes, wallet activity and metrics from here.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{moduleMetrics.activeCampaigns}</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{moduleMetrics.pendingCampaigns}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{moduleMetrics.openDisputes}</p>
              <p className="text-xs text-gray-400">Disputes</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6"><div className="h-40 rounded bg-gray-200" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <Icon className="h-7 w-7 text-blue-700" />
                      </div>
                      <Badge variant="info">{feature.metric}</Badge>
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-gray-900">{feature.title}</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">{feature.subtitle}</p>
                    <p className="mt-4 text-sm leading-6 text-gray-600">{feature.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {feature.actions.map((action) => (
                        <Link key={`${feature.title}-${action.href}`} href={action.href}>
                          <Button variant="outline" size="sm">{action.label}</Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-gray-500" />
                  Connected operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {operationalRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <Link key={row.label} href={row.href} className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40">
                        <Icon className="h-6 w-6 text-blue-600" />
                        <p className="mt-3 text-sm text-gray-500">{row.label}</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{row.value}</p>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-500" />
                  Latest dispute activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary.disputes.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                    No disputes yet. That is only useful if users still have a clear place to raise issues when something goes wrong.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summary.disputes.slice(0, 5).map((dispute) => (
                      <Link key={dispute.id} href="/dashboard/disputes" className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{dispute.subject}</p>
                            <p className="mt-1 text-xs text-gray-500">{dispute.disputeNumber} • {dispute.category}</p>
                          </div>
                          <Badge variant={getStatusVariant(dispute.status)}>{dispute.status.replace(/_/g, ' ')}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-600" />
                  <div>
                    <h2 className="font-semibold text-gray-900">Feature placement corrected</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Public pages now sell the platform. Authenticated dashboard areas now operate the modules. This is the right separation because users do not manage disputes, wallet, targeting or approvals from a marketing homepage.
                    </p>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button>Return to dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
