'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency, formatDate } from '@/lib/utils';
import { Link2, Copy, Check, ExternalLink, TrendingUp } from 'lucide-react';

export default function TrackingLinksPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tracking Links</h1>
          <p className="text-gray-600">Manage and track your promotional links</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/ads'}>
          <Link2 className="h-4 w-4 mr-2" />
          Generate New Link
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Links Created</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Link2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven&apos;t created any tracking links yet</p>
            <Button onClick={() => window.location.href = '/dashboard/ads'}>
              Browse Ads to Create Links
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips for Promoting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">📱 Social Media</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Share links in relevant Facebook groups</li>
                <li>• Create engaging posts on Twitter/X</li>
                <li>• Use Instagram stories with swipe-up links</li>
                <li>• Share in niche Discord and Telegram groups</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">📝 Content Marketing</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Write blog posts reviewing the products</li>
                <li>• Create YouTube videos with links in description</li>
                <li>• Add banners to your website sidebar</li>
                <li>• Include links in email newsletters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
