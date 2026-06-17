'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { ArrowLeft, Edit, Pause, Play, ExternalLink, Copy, Check, MousePointerClick, Target, DollarSign } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  landingPageUrl: string;
  totalBudget: string;
  dailyBudget: string;
  spentBudget: string;
  todaySpent: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  niches: string[];
  rejectionReason: string | null;
  createdAt: string;
  ads: Array<{
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    imageUrl: string | null;
    clicks: number;
    conversions: number;
  }>;
  targeting: Array<{
    country: string;
    cpc: string;
  }>;
  pixels: Array<{
    id: string;
    pixelCode: string;
  }>;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, []);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${resolvedParams.id}`);
      const data = await res.json();
      setCampaign(data.campaign);
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/campaigns/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCampaign();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const copyPixelCode = () => {
    if (campaign?.pixels?.[0]) {
      const baseUrl = window.location.origin;
      const code = `<script src="${baseUrl}/api/pixel/${campaign.id}"></script>`;
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Link href="/dashboard/campaigns">
          <Button className="mt-4">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const totalClicks = campaign.ads?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
  const totalConversions = campaign.ads?.reduce((sum, ad) => sum + (ad.conversions || 0), 0) || 0;
  const budgetUsed = (parseFloat(campaign.spentBudget || '0') / parseFloat(campaign.totalBudget)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-gray-600">{campaign.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && (
            <Button variant="outline" onClick={() => handleStatusChange('paused')}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button onClick={() => handleStatusChange('active')}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold">{formatNumber(totalClicks)}</p>
              </div>
              <MousePointerClick className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-3xl font-bold">{formatNumber(totalConversions)}</p>
              </div>
              <Target className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Spent</p>
                <p className="text-3xl font-bold">{formatCurrency(campaign.spentBudget || '0')}</p>
                <p className="text-sm text-gray-500">{budgetUsed.toFixed(1)}% used</p>
              </div>
              <DollarSign className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-3xl font-bold">
                  {formatCurrency((parseFloat(campaign.totalBudget) - parseFloat(campaign.spentBudget || '0')).toString())}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Landing Page</span>
              <a 
                href={campaign.landingPageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Visit <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Budget</span>
              <span className="font-medium">{formatCurrency(campaign.totalBudget)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Daily Budget</span>
              <span className="font-medium">{formatCurrency(campaign.dailyBudget)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Today&apos;s Spend</span>
              <span className="font-medium">{formatCurrency(campaign.todaySpent || '0')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">{formatDate(campaign.createdAt)}</span>
            </div>
            {campaign.startDate && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium">{formatDate(campaign.startDate)}</span>
              </div>
            )}
            {campaign.endDate && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">End Date</span>
                <span className="font-medium">{formatDate(campaign.endDate)}</span>
              </div>
            )}
            {campaign.niches && campaign.niches.length > 0 && (
              <div className="py-2">
                <span className="text-gray-600 block mb-2">Niches</span>
                <div className="flex flex-wrap gap-2">
                  {campaign.niches.map((niche) => (
                    <Badge key={niche} variant="default">{niche}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle>Country Targeting</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.targeting && campaign.targeting.length > 0 ? (
              <div className="space-y-3">
                {campaign.targeting.map((target) => (
                  <div key={target.country} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{target.country}</span>
                    <span className="text-green-600">{formatCurrency(target.cpc)} CPC</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No country targeting set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tracking Pixel */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Pixel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Install this pixel on your website to track conversions.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/pixel/${campaign.id}"></script>`}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
            />
            <Button variant="outline" onClick={copyPixelCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Ads ({campaign.ads?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.ads && campaign.ads.length > 0 ? (
            <div className="space-y-4">
              {campaign.ads.map((ad) => (
                <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{ad.title}</h4>
                      <p className="text-sm text-gray-500">{ad.description || 'No description'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{formatNumber(ad.clicks)}</span> clicks
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{formatNumber(ad.conversions)}</span> conversions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No ads created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
