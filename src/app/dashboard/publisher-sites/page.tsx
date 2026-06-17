'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { CheckCircle, ExternalLink, Globe, Link2, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';

interface PublisherProfile {
  websiteUrl: string | null;
  socialMedia: Record<string, string> | null;
  niches: string[] | null;
}

interface PublisherUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  publisherProfile?: PublisherProfile | null;
}

interface PublisherSite {
  id: string;
  userId: string;
  domain: string;
  name: string | null;
  verified: boolean;
  verificationMethod: string | null;
  verificationToken: string | null;
  category: string | null;
  monthlyPageviews: number | null;
  adsenseApproved: boolean;
  active: boolean;
  createdAt: string;
  user?: PublisherUser | null;
}

function ensureUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function getDisplayName(user?: PublisherUser | null): string {
  if (!user) return 'Unknown publisher';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email;
}

export default function PublisherSitesPage() {
  const [sites, setSites] = useState<PublisherSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('pending');
  const [accountStatusFilter, setAccountStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (verificationFilter) params.append('verification', verificationFilter);
      if (accountStatusFilter) params.append('accountStatus', accountStatusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/publisher-sites?${params}`);
      const data = await res.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Failed to fetch publisher sites:', error);
    } finally {
      setLoading(false);
    }
  }, [accountStatusFilter, search, verificationFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSites();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchSites]);

  const updateSite = async (siteId: string, payload: Record<string, boolean>) => {
    try {
      setActionLoading(`${siteId}-${Object.keys(payload).join('-')}`);
      const res = await fetch(`/api/admin/publisher-sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update publisher site');
      }

      fetchSites();
    } catch (error) {
      console.error('Failed to update publisher site:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: sites.length,
      verified: sites.filter((site) => site.verified).length,
      pending: sites.filter((site) => !site.verified).length,
      pendingAccounts: sites.filter((site) => site.user?.status === 'pending').length,
    };
  }, [sites]);

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      active: 'success',
      pending: 'warning',
      suspended: 'error',
      banned: 'error',
    };
    return <Badge variant={variants[status || ''] || 'default'}>{status || 'unknown'}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publisher Verification</h1>
          <p className="text-gray-600">Review publisher websites before account approval</p>
        </div>
        <Button variant="outline" onClick={fetchSites}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visible Results</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Globe className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Sites</p>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Sites</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <XCircle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Accounts</p>
                <p className="text-3xl font-bold text-purple-600">{stats.pendingAccounts}</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by domain, publisher email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSites()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Verification</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
            </select>
            <select
              value={accountStatusFilter}
              onChange={(e) => setAccountStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Account Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <Button variant="outline" onClick={fetchSites}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No publisher sites match this filter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Submitted Site</TableHead>
                  <TableHead>Profile Links</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => {
                  const profileLinks = [
                    site.user?.publisherProfile?.websiteUrl,
                    ...Object.values(site.user?.publisherProfile?.socialMedia || {}),
                  ].filter(Boolean) as string[];

                  return (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getDisplayName(site.user)}</p>
                          <p className="text-sm text-gray-500">{site.user?.email || 'No email found'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <a
                            href={ensureUrl(site.domain)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            {site.domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-gray-500">{site.category || 'No category submitted'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profileLinks.length === 0 ? (
                          <span className="text-gray-400">No profile links</span>
                        ) : (
                          <div className="flex flex-wrap gap-2 max-w-xs">
                            {profileLinks.slice(0, 3).map((url) => (
                              <a
                                key={url}
                                href={ensureUrl(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
                              >
                                <Link2 className="h-3 w-3" />
                                Open
                              </a>
                            ))}
                            {profileLinks.length > 3 && (
                              <span className="text-xs text-gray-500">+{profileLinks.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {site.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Pending</Badge>}
                          <p className="text-xs text-gray-500">{site.active ? 'Active site' : 'Inactive site'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(site.user?.status)}</TableCell>
                      <TableCell>{formatDate(site.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={ensureUrl(site.domain)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visit
                            </Button>
                          </a>
                          {!site.verified ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              loading={actionLoading === `${site.id}-verified`}
                              onClick={() => updateSite(site.id, { verified: true, active: true })}
                            >
                              Mark Verified
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-700"
                              loading={actionLoading === `${site.id}-verified`}
                              onClick={() => updateSite(site.id, { verified: false })}
                            >
                              Unverify
                            </Button>
                          )}
                          {site.user?.status === 'pending' && (
                            <Button
                              size="sm"
                              loading={actionLoading === `${site.id}-verified-active-approvePublisherAccount`}
                              onClick={() => updateSite(site.id, { verified: true, active: true, approvePublisherAccount: true })}
                            >
                              Approve Account
                            </Button>
                          )}
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
    </div>
  );
}
