'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ClipboardCheck, Eye, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

type Role = 'admin' | 'advertiser' | 'publisher';

interface Campaign {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  totalBudget: string;
  dailyBudget: string;
  createdAt: string;
  advertiser?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  ads?: Array<{ imageUrl?: string | null; videoUrl?: string | null }>;
}

interface PublisherSite {
  id: string;
  domain: string;
  name?: string | null;
  verified: boolean;
  active: boolean;
  adsenseApproved: boolean;
  createdAt: string;
  user?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    status: string;
  } | null;
}

interface ApprovalCentreProps {
  role: Role;
}

function displayName(user?: Campaign['advertiser'] | PublisherSite['user']) {
  if (!user) return 'Unknown';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.email;
}

export function ApprovalCentre({ role }: ApprovalCentreProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sites, setSites] = useState<PublisherSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const campaignResponse = await fetch('/api/campaigns?status=pending_approval');
      const campaignData = await campaignResponse.json().catch(() => ({ campaigns: [] }));
      if (!campaignResponse.ok) {
        setMessage(campaignData.error || 'Failed to load campaign approval queue');
        setCampaigns([]);
      } else {
        setCampaigns(campaignData.campaigns || []);
      }

      if (role === 'admin') {
        const siteResponse = await fetch('/api/admin/publisher-sites?verification=pending');
        const siteData = siteResponse.ok ? await siteResponse.json() : { sites: [] };
        setSites(siteData.sites || []);
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitialApprovals() {
      try {
        const campaignResponse = await fetch('/api/campaigns?status=pending_approval');
        const campaignData = await campaignResponse.json().catch(() => ({ campaigns: [] }));
        if (!campaignResponse.ok) {
          if (mounted) {
            setMessage(campaignData.error || 'Failed to load campaign approval queue');
            setCampaigns([]);
          }
        } else if (mounted) {
          setCampaigns(campaignData.campaigns || []);
        }

        if (role === 'admin') {
          const siteResponse = await fetch('/api/admin/publisher-sites?verification=pending');
          const siteData = siteResponse.ok ? await siteResponse.json() : { sites: [] };
          if (mounted) setSites(siteData.sites || []);
        }
      } catch (error) {
        console.error('Failed to load approvals:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadInitialApprovals();

    return () => {
      mounted = false;
    };
  }, [role]);

  const updateCampaign = async (id: string, status: 'active' | 'rejected') => {
    const response = await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason: status === 'rejected' ? 'Rejected during admin approval review.' : undefined }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || 'Failed to update campaign');
      return;
    }

    setMessage(status === 'active' ? 'Campaign approved and activated.' : 'Campaign rejected.');
    load();
  };

  const approveSite = async (id: string) => {
    const response = await fetch(`/api/admin/publisher-sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true, active: true, approvePublisherAccount: true }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || 'Failed to approve publisher site');
      return;
    }

    setMessage('Publisher site verified and account activated.');
    load();
  };

  if (role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Status</h1>
          <p className="text-gray-600">Track items you submitted for admin review.</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <ClipboardCheck className="h-12 w-12 text-blue-600" />
            <h2 className="mt-5 text-xl font-bold text-gray-900">Your approval queue is tied to campaigns and submitted publisher assets.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Advertisers should use Campaigns to view pending adverts. Publishers should use Sites to see website verification status. Admin approval actions remain restricted to admin accounts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard/campaigns"><Button>View campaigns</Button></Link>
              {role === 'publisher' && <Link href="/dashboard/sites"><Button variant="outline">View publisher sites</Button></Link>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Centre</h1>
          <p className="text-gray-600">Approve campaigns and publisher sites without hunting through separate pages.</p>
        </div>
        <Button variant="outline" onClick={() => load()} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Pending campaigns</p><p className="mt-2 text-3xl font-bold text-gray-900">{campaigns.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Publisher sites pending</p><p className="mt-2 text-3xl font-bold text-gray-900">{sites.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Review mode</p><p className="mt-2 text-lg font-bold text-gray-900">Manual quality gate</p></CardContent></Card>
      </div>

      {message && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-gray-500" /> Campaign approval queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><div className="h-48 animate-pulse rounded bg-gray-200" /></div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No campaigns are waiting for approval.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const hasMedia = Boolean(campaign.ads?.some((ad) => ad.imageUrl || ad.videoUrl));
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="max-w-xs whitespace-normal"><p className="font-semibold">{campaign.title}</p><p className="mt-1 text-xs text-gray-500 line-clamp-2">{campaign.description || 'No description'}</p></TableCell>
                      <TableCell>{displayName(campaign.advertiser)}</TableCell>
                      <TableCell><p>{formatCurrency(campaign.totalBudget)}</p><p className="text-xs text-gray-500">Daily: {formatCurrency(campaign.dailyBudget)}</p></TableCell>
                      <TableCell><Badge variant={hasMedia ? 'success' : 'warning'}>{hasMedia ? 'Uploaded' : 'Missing'}</Badge></TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/campaigns/${campaign.id}`}><Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                          <Button size="sm" className="gap-1" onClick={() => updateCampaign(campaign.id, 'active')}><Check className="h-4 w-4" /> Approve</Button>
                          <Button variant="danger" size="sm" className="gap-1" onClick={() => updateCampaign(campaign.id, 'rejected')}><X className="h-4 w-4" /> Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-gray-500" /> Publisher site verification queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><div className="h-48 animate-pulse rounded bg-gray-200" /></div>
          ) : sites.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No publisher sites are waiting for verification.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell><p className="font-semibold">{site.name || site.domain}</p><p className="text-xs text-gray-500">{site.domain}</p></TableCell>
                    <TableCell>{displayName(site.user)}</TableCell>
                    <TableCell><Badge variant="warning">Pending verification</Badge></TableCell>
                    <TableCell>{formatDate(site.createdAt)}</TableCell>
                    <TableCell><Button size="sm" className="gap-1" onClick={() => approveSite(site.id)}><Check className="h-4 w-4" /> Verify + activate</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
