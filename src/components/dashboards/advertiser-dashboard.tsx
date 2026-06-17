'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Megaphone, MousePointerClick, DollarSign, Wallet, Plus, TrendingUp, Target } from 'lucide-react';

interface Stats {
  campaigns: {
    total: number;
    active: number;
    totalBudget: string;
    totalSpent: string;
  };
  clicks: {
    total: number;
    totalCost: string;
  };
  conversions: {
    total: number;
  };
  wallet: {
    balance: string;
    totalSpent: string;
  };
}

export function AdvertiserDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats?period=30d');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const conversionRate = stats?.clicks?.total 
    ? ((stats.conversions?.total || 0) / stats.clicks.total * 100).toFixed(2) 
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
          <p className="text-gray-600">Manage your campaigns and track performance</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.wallet?.balance || '0')}
                </p>
                <Link href="/dashboard/wallet" className="text-sm text-blue-600 hover:text-blue-700">
                  Add funds →
                </Link>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
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
                  of {stats?.campaigns?.total || 0} total
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.clicks?.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(stats?.clicks?.totalCost || '0')} spent
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
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.conversions?.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {conversionRate}% conversion rate
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Budget Allocated</span>
                <span className="font-semibold">{formatCurrency(stats?.campaigns?.totalBudget || '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold">{formatCurrency(stats?.campaigns?.totalSpent || '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    (parseFloat(stats?.campaigns?.totalBudget || '0') - 
                     parseFloat(stats?.campaigns?.totalSpent || '0')).toString()
                  )}
                </span>
              </div>
              <div className="pt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(
                        (parseFloat(stats?.campaigns?.totalSpent || '0') / 
                         parseFloat(stats?.campaigns?.totalBudget || '1')) * 100,
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {((parseFloat(stats?.campaigns?.totalSpent || '0') / 
                     parseFloat(stats?.campaigns?.totalBudget || '1')) * 100).toFixed(1)}% budget used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average CPC</span>
                <span className="font-semibold">
                  {stats?.clicks?.total 
                    ? formatCurrency((parseFloat(stats.clicks.totalCost) / stats.clicks.total).toFixed(4))
                    : '$0.00'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per Conversion</span>
                <span className="font-semibold">
                  {stats?.conversions?.total 
                    ? formatCurrency((parseFloat(stats?.clicks?.totalCost || '0') / stats.conversions.total).toFixed(2))
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion Rate</span>
                <Badge variant="success">{conversionRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Click-through Performance</span>
                <Badge variant="info">Good</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/campaigns/new"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Create Campaign</p>
            </Link>
            <Link
              href="/dashboard/campaigns"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Megaphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">View Campaigns</p>
            </Link>
            <Link
              href="/dashboard/wallet"
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <Wallet className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-yellow-900">Add Funds</p>
            </Link>
            <Link
              href="/dashboard/pixels"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-purple-900">Tracking Pixels</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
