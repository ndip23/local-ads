'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Eye, Pause, Play, Edit, Check, X, ImageIcon, Video } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  status: string;
  totalBudget: string;
  spentBudget: string;
  dailyBudget: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  ads: Array<{ id: string; clicks: number; conversions: number; imageUrl: string | null; videoUrl: string | null }>;
  advertiser?: { id: string; email: string; firstName: string | null; lastName: string | null };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('status') || '';
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setRole(data?.user?.role || ''))
      .catch(() => setRole(''));
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`/api/campaigns?${params}`);
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || res.statusText || 'Failed to fetch campaigns';
        console.error('Failed to fetch campaigns:', message);
        setError(message);
        setCampaigns([]);
        return;
      }
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      setError('Failed to fetch campaigns. Check deployment logs and database migration.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError('');
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to update campaign');
        return;
      }
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      draft: 'default',
      pending_approval: 'warning',
      active: 'success',
      paused: 'info',
      budget_finished: 'error',
      rejected: 'error',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6"><div className="h-64 bg-gray-200 rounded"></div></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage advertising campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'pending_approval', 'active', 'paused', 'draft', 'budget_finished', 'rejected', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {s === '' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No campaigns found</p>
              <Link href="/dashboard/campaigns/new">
                <Button>Create Campaign</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const totalClicks = campaign.ads?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
                  const totalConversions = campaign.ads?.reduce((sum, ad) => sum + (ad.conversions || 0), 0) || 0;
                  const hasImage = campaign.ads?.some(ad => ad.imageUrl);
                  const hasVideo = campaign.ads?.some(ad => ad.videoUrl);

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          {campaign.advertiser && (
                            <p className="text-xs text-gray-500">
                              by {campaign.advertiser.firstName || campaign.advertiser.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {hasImage && (
                            <span title="Has image" className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-3 w-3 text-green-700" />
                            </span>
                          )}
                          {hasVideo && (
                            <span title="Has video" className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                              <Video className="h-3 w-3 text-blue-700" />
                            </span>
                          )}
                          {!hasImage && !hasVideo && (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(campaign.totalBudget)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatCurrency(campaign.spentBudget || '0')}</p>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((parseFloat(campaign.spentBudget || '0') / parseFloat(campaign.totalBudget)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{totalClicks} clicks</p>
                          <p className="text-xs text-gray-500">{totalConversions} conv.</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/campaigns/${campaign.id}`}>
                            <Button variant="ghost" size="sm" title="View details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Admin: Approve / Reject pending campaigns */}
                          {role === 'admin' && campaign.status === 'pending_approval' && (
                            <>
                              <Button
                                variant="ghost" size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                                onClick={() => handleStatusChange(campaign.id, 'active')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                                onClick={() => handleStatusChange(campaign.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {/* Pause / Resume */}
                          {campaign.status === 'active' && (
                            <Button variant="ghost" size="sm" title="Pause"
                              onClick={() => handleStatusChange(campaign.id, 'paused')}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button variant="ghost" size="sm" title="Resume"
                              onClick={() => handleStatusChange(campaign.id, 'active')}>
                              <Play className="h-4 w-4" />
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
