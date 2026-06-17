'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Code, Copy, Check, MousePointerClick, DollarSign, Eye, Clock } from 'lucide-react';

interface PixelData {
  publisherId: string;
  pixelCodes: {
    javascript: string;
    imagePixel: string;
    advancedScript: string;
  };
  stats: {
    totalClicks: number;
    totalEarnings: string;
    period: string;
  };
}

export default function MyPixelPage() {
  const [data, setData] = useState<PixelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'simple' | 'image' | 'advanced'>('simple');

  useEffect(() => {
    fetchPixelData();
  }, []);

  const fetchPixelData = async () => {
    try {
      const res = await fetch('/api/publisher/pixel');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch pixel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string, field: string) => {
    navigator.clipboard.writeText(code);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-64 bg-gray-200 rounded"></div></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tracking Pixel</h1>
        <p className="text-gray-600">Your unique tracking code to monitor website activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks (30d)</p>
                <p className="text-3xl font-bold">{formatNumber(data?.stats?.totalClicks || 0)}</p>
              </div>
              <MousePointerClick className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings (30d)</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(data?.stats?.totalEarnings || '0')}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publisher ID</p>
                <p className="text-sm font-mono font-bold text-gray-900 mt-1 break-all">{data?.publisherId?.substring(0, 12)}...</p>
              </div>
              <Code className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pixel Code Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Your Tracking Pixel Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Selector */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('simple')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'simple' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Simple Script
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'image' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🖼️ Image Pixel
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'advanced' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚡ Advanced Script
            </button>
          </div>

          {/* Simple Script */}
          {activeTab === 'simple' && data?.pixelCodes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">JavaScript Tracking Pixel</h4>
                  <p className="text-sm text-gray-500">Add this before the closing &lt;/body&gt; tag on every page</p>
                </div>
                <Badge variant="success">Recommended</Badge>
              </div>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {data.pixelCodes.javascript}
                </pre>
                <Button
                  size="sm" variant="secondary" className="absolute top-2 right-2"
                  onClick={() => copyCode(data.pixelCodes.javascript, 'js')}
                >
                  {copiedField === 'js' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Image Pixel */}
          {activeTab === 'image' && data?.pixelCodes && (
            <div>
              <div className="mb-2">
                <h4 className="font-medium text-gray-900">Image Tracking Pixel</h4>
                <p className="text-sm text-gray-500">Use this for emails, newsletters, or simple HTML pages</p>
              </div>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {data.pixelCodes.imagePixel}
                </pre>
                <Button
                  size="sm" variant="secondary" className="absolute top-2 right-2"
                  onClick={() => copyCode(data.pixelCodes.imagePixel, 'img')}
                >
                  {copiedField === 'img' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Script */}
          {activeTab === 'advanced' && data?.pixelCodes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">Advanced Tracking Script</h4>
                  <p className="text-sm text-gray-500">Full tracking: page views, clicks, time on page, custom events</p>
                </div>
                <Badge variant="info">Full Features</Badge>
              </div>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {data.pixelCodes.advancedScript}
                </pre>
                <Button
                  size="sm" variant="secondary" className="absolute top-2 right-2"
                  onClick={() => copyCode(data.pixelCodes.advancedScript, 'adv')}
                >
                  {copiedField === 'adv' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What It Tracks */}
      <Card>
        <CardHeader>
          <CardTitle>What Your Pixel Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Page Views</p>
                  <p className="text-sm text-gray-600">Tracks every page visit on your website</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MousePointerClick className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Outbound Clicks</p>
                  <p className="text-sm text-gray-600">Tracks when visitors click links leaving your site</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Time on Page</p>
                  <p className="text-sm text-gray-600">Measures how long visitors stay on each page</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Code className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Custom Events</p>
                  <p className="text-sm text-gray-600">Track any custom action with <code className="bg-gray-100 px-1 rounded">LAN.track(&apos;event&apos;)</code></p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium">Copy the tracking code above</h4>
              <p className="text-sm text-gray-600">Choose the Simple Script for most websites</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium">Paste it on your website</h4>
              <p className="text-sm text-gray-600">Add it before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on every page</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium">Data starts flowing</h4>
              <p className="text-sm text-gray-600">Visit your website and check back here — stats update in real-time</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-yellow-800">
              <strong>WordPress users:</strong> Paste the code in Appearance → Theme Editor → footer.php, or use a plugin like &quot;Insert Headers and Footers&quot;.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
