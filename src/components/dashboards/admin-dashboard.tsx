'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Users, Megaphone, MousePointerClick, AlertTriangle, DollarSign, Eye, Check, X } from 'lucide-react';

interface PendingCampaign {
  id: string;
  title: string;
  totalBudget: string;
  dailyBudget: string;
  createdAt: string;
  advertiser?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

interface Stats {
  users: {
    total: number;
    advertisers: number;
    publishers: number;
    pending: number;
  };
  campaigns: {
    total: number;
    active: number;
    pending: number;
  };
  clicks: {
    total: number;
    valid: number;
    fraud: number;
    totalRevenue: string;
    fraudRate: string;
  };
  conversions: {
    total: number;
    totalValue: string;
  };
  withdrawals: {
    pending: number;
    pendingAmount: string;
  };
  dailyClicks: Array<{
    date: string;
    clicks: number;
    revenue: string;
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/stats?period=30d'),
        fetch('/api/campaigns?status=pending_approval&limit=5'),
      ]);

      const statsData = await statsRes.json();
      setStats(statsData);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingCampaigns(pendingData.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateCampaignStatus = async (id: string, status: 'active' | 'rejected') => {
    setActionMessage('');
    const response = await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        rejectionReason: status === 'rejected' ? 'Rejected during admin dashboard review.' : undefined,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setActionMessage(data.error || 'Failed to update campaign.');
      return;
    }

    setActionMessage(status === 'active' ? 'Campaign approved and activated.' : 'Campaign rejected.');
    await fetchStats();
  };

  function advertiserName(campaign: PendingCampaign) {
    const advertiser = campaign.advertiser;
    if (!advertiser) return 'Unknown advertiser';
    const fullName = `${advertiser.firstName || ''} ${advertiser.lastName || ''}`.trim();
    return fullName || advertiser.email;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.users?.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.users?.pending || 0} pending approval
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.campaigns?.active || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.campaigns?.pending || 0} pending review
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks (30d)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.clicks?.total || 0)}
                </p>
                <p className="text-sm text-red-500 mt-1">
                  {stats?.clicks?.fraudRate || '0'}% fraud rate
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointerClick className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.clicks?.totalRevenue || '0')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Advertisers</span>
                <Badge variant="info">{stats?.users?.advertisers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Publishers</span>
                <Badge variant="success">{stats?.users?.publishers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <Badge variant="warning">{stats?.users?.pending || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              Fraud Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valid Clicks</span>
                <span className="font-medium text-green-600">{formatNumber(stats?.clicks?.valid || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Clicks</span>
                <span className="font-medium text-red-600">{formatNumber(stats?.clicks?.fraud || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Rate</span>
                <span className="font-medium">{stats?.clicks?.fraudRate || '0'}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Requests</span>
                <Badge variant="warning">{stats?.withdrawals?.pending || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Amount</span>
                <span className="font-medium">{formatCurrency(stats?.withdrawals?.pendingAmount || '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversions (30d)</span>
                <span className="font-medium">{formatNumber(stats?.conversions?.total || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Campaign Approval Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-gray-500" />
            Pending Campaigns for Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actionMessage && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {actionMessage}
            </div>
          )}

          {pendingCampaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No campaign is waiting for admin approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{campaign.title}</p>
                    <p className="text-sm text-gray-500">{advertiserName(campaign)} · Budget {formatCurrency(campaign.totalBudget)} · Daily {formatCurrency(campaign.dailyBudget)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/campaigns/${campaign.id}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <button onClick={() => updateCampaignStatus(campaign.id, 'active')} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => updateCampaignStatus(campaign.id, 'rejected')} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/campaigns?status=pending_approval" className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
                Open full campaign approval list →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              href="/dashboard/campaigns/new"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Megaphone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-purple-900">Create Campaign</p>
              <p className="text-sm text-purple-600">With uploads</p>
            </Link>
            <Link
              href="/dashboard/users?status=pending"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Review Users</p>
              <p className="text-sm text-blue-600">{stats?.users?.pending || 0} pending</p>
            </Link>
            <Link
              href="/dashboard/campaigns?status=pending_approval"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Megaphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">Review Campaigns</p>
              <p className="text-sm text-green-600">{stats?.campaigns?.pending || 0} pending</p>
            </Link>
            <Link
              href="/dashboard/withdrawals?status=pending"
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-yellow-900">Process Withdrawals</p>
              <p className="text-sm text-yellow-600">{stats?.withdrawals?.pending || 0} pending</p>
            </Link>
            <Link
              href="/dashboard/fraud"
              className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium text-red-900">Fraud Alerts</p>
              <p className="text-sm text-red-600">View reports</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
