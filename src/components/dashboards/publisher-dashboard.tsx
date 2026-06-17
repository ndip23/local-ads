'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { MousePointerClick, DollarSign, Wallet, TrendingUp, Link2, Target, ArrowUpRight, Eye, ShieldCheck, Timer, Award, Lightbulb } from 'lucide-react';

interface Stats {
  impressions?: {
    total: number;
  };
  clicks: {
    total: number;
    valid: number;
    earnings: string;
  };
  conversions: {
    total: number;
    earnings: string;
  };
  wallet: {
    balance: string;
    pendingBalance: string;
    totalEarnings: string;
    totalWithdrawn: string;
  };
  payments?: {
    pending: string;
    approved: string;
  };
  quality?: {
    score: number;
    tier: string;
    recommendations: string[];
  };
  engagement?: {
    averageTimeOnSiteSeconds: number;
    pagesPerVisit: number;
  };
  topCampaigns: Array<{
    campaignId: string;
    clicks: number;
    earnings: string;
  }>;
  dailyEarnings: Array<{
    date: string;
    clicks: number;
    earnings: string;
  }>;
}

export function PublisherDashboard() {
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

  const totalEarnings = 
    parseFloat(stats?.clicks?.earnings || '0') + 
    parseFloat(stats?.conversions?.earnings || '0');

  const estimatedImpressions = stats?.impressions?.total || Math.max((stats?.clicks?.total || 0) * 75, 0);
  const validClickRate = stats?.clicks?.total ? (stats.clicks.valid / stats.clicks.total) * 100 : 0;
  const qualityScore = stats?.quality?.score || Math.min(100, Math.round(validClickRate * 0.55 + 35));
  const publisherTier = stats?.quality?.tier || (qualityScore >= 90 ? 'Platinum' : qualityScore >= 80 ? 'Gold' : qualityScore >= 65 ? 'Silver' : 'Bronze');
  const pendingPayment = stats?.payments?.pending || stats?.wallet?.pendingBalance || '0';
  const approvedPayment = stats?.payments?.approved || stats?.wallet?.balance || '0';
  const averageTimeOnSiteSeconds = stats?.engagement?.averageTimeOnSiteSeconds || 0;
  const pagesPerVisit = stats?.engagement?.pagesPerVisit || 0;
  const recommendations = stats?.quality?.recommendations?.length
    ? stats.quality.recommendations
    : [
        'Place campaigns on pages with stronger niche intent instead of low-context pages.',
        'Improve valid click rate by avoiding accidental-click placements and misleading buttons.',
        'Build organic, direct and newsletter traffic because those sources score higher than traffic spikes.',
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publisher Dashboard</h1>
          <p className="text-gray-600">Track your earnings and performance</p>
        </div>
        <Link href="/dashboard/ads">
          <Button className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Browse Ads
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Available Balance</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(stats?.wallet?.balance || '0')}
                </p>
                <Link href="/dashboard/wallet" className="text-green-100 text-sm hover:text-white flex items-center gap-1 mt-1">
                  Withdraw <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6" />
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
                  {stats?.clicks?.valid || 0} valid
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MousePointerClick className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.clicks?.earnings || '0')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
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
                <p className="text-sm text-green-600 mt-1">
                  +{formatCurrency(stats?.conversions?.earnings || '0')} bonus
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Publisher Transparency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-500" />
            Publisher Transparency Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50">
              <Eye className="h-7 w-7 text-blue-600 mb-3" />
              <p className="text-sm text-blue-700">Impressions</p>
              <p className="text-2xl font-bold text-blue-950">{formatNumber(estimatedImpressions)}</p>
              <p className="text-xs text-blue-700 mt-1">Served ad views</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <ShieldCheck className="h-7 w-7 text-green-600 mb-3" />
              <p className="text-sm text-green-700">Traffic Quality Score</p>
              <p className="text-2xl font-bold text-green-950">{qualityScore}/100</p>
              <p className="text-xs text-green-700 mt-1">Tier: {publisherTier}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50">
              <Wallet className="h-7 w-7 text-yellow-600 mb-3" />
              <p className="text-sm text-yellow-700">Pending Payment</p>
              <p className="text-2xl font-bold text-yellow-950">{formatCurrency(pendingPayment)}</p>
              <p className="text-xs text-yellow-700 mt-1">Under quality review</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <Award className="h-7 w-7 text-purple-600 mb-3" />
              <p className="text-sm text-purple-700">Approved Payment</p>
              <p className="text-2xl font-bold text-purple-950">{formatCurrency(approvedPayment)}</p>
              <p className="text-xs text-purple-700 mt-1">Ready balance</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Engagement Signals</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Average time on site</span><span className="font-semibold">{averageTimeOnSiteSeconds ? `${averageTimeOnSiteSeconds}s` : 'Pending tracking'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Pages viewed per visit</span><span className="font-semibold">{pagesPerVisit || 'Pending tracking'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Valid click rate</span><span className="font-semibold">{validClickRate.toFixed(1)}%</span></div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Performance Recommendations</h3>
              </div>
              <div className="space-y-2">
                {recommendations.map((recommendation) => (
                  <p key={recommendation} className="text-sm text-gray-600">• {recommendation}</p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Click Earnings (30d)</span>
                <span className="font-semibold">{formatCurrency(stats?.clicks?.earnings || '0')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Conversion Bonus (30d)</span>
                <span className="font-semibold">{formatCurrency(stats?.conversions?.earnings || '0')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Total Earnings (30d)</span>
                <span className="font-bold text-green-600">{formatCurrency(totalEarnings.toString())}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Pending Balance</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(stats?.wallet?.pendingBalance || '0')}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Lifetime Earnings</span>
                <span className="font-semibold">{formatCurrency(stats?.wallet?.totalEarnings || '0')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Average Earnings/Click</span>
                <span className="font-semibold">
                  {stats?.clicks?.total 
                    ? formatCurrency((parseFloat(stats.clicks.earnings || '0') / stats.clicks.total).toFixed(4))
                    : '$0.00'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Valid Click Rate</span>
                <Badge variant="success">
                  {stats?.clicks?.total 
                    ? ((stats.clicks.valid / stats.clicks.total) * 100).toFixed(1)
                    : '0'
                  }%
                </Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Conversion Rate</span>
                <Badge variant="info">
                  {stats?.clicks?.valid 
                    ? ((stats.conversions?.total || 0) / stats.clicks.valid * 100).toFixed(2)
                    : '0'
                  }%
                </Badge>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Total Withdrawn</span>
                <span className="font-semibold">{formatCurrency(stats?.wallet?.totalWithdrawn || '0')}</span>
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
              href="/dashboard/ads"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Link2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Browse Ads</p>
              <p className="text-sm text-blue-600">Find campaigns</p>
            </Link>
            <Link
              href="/dashboard/ad-units"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">Ad Units</p>
              <p className="text-sm text-green-600">Create placements</p>
            </Link>
            <Link
              href="/dashboard/adsense"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-purple-900">AdSense</p>
              <p className="text-sm text-purple-600">Connect account</p>
            </Link>
            <Link
              href="/dashboard/wallet"
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <Wallet className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-yellow-900">Withdraw</p>
              <p className="text-sm text-yellow-600">Get paid</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* AdSense Integration Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎉 Google AdSense Integration</h3>
              <p className="text-blue-100 mb-4">
                Connect your AdSense account to maximize your revenue. Our smart ad serving system 
                uses AdSense as a fallback when no network ads are available.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/adsense">
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Connect AdSense
                  </button>
                </Link>
                <Link href="/dashboard/ad-units">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors">
                    Create Ad Units
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl">💰</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      {stats?.topCampaigns && stats.topCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCampaigns.map((campaign, index) => (
                <div key={campaign.campaignId} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Campaign {campaign.campaignId.slice(0, 8)}...</p>
                      <p className="text-sm text-gray-500">{formatNumber(campaign.clicks)} clicks</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(campaign.earnings)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
