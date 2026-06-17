'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Settings, CheckCircle, AlertCircle, ExternalLink, Copy, Check, DollarSign, BarChart3 } from 'lucide-react';

interface AdsenseSettings {
  id: string;
  publisherId: string | null;
  enabled: boolean;
  autoAdsEnabled: boolean;
  adClientId: string | null;
  verificationCode: string;
  fallbackEnabled: boolean;
  revenueShare: string;
  estimatedEarnings: string;
  lastSyncAt: string | null;
}

export default function AdsensePage() {
  const [settings, setSettings] = useState<AdsenseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    publisherId: '',
    enabled: false,
    autoAdsEnabled: false,
    fallbackEnabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/adsense/settings');
      const data = await res.json();
      setSettings(data.settings);
      if (data.settings) {
        setFormData({
          publisherId: data.settings.publisherId || '',
          enabled: data.settings.enabled || false,
          autoAdsEnabled: data.settings.autoAdsEnabled || false,
          fallbackEnabled: data.settings.fallbackEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch AdSense settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/adsense/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch (error) {
      console.error('Failed to save AdSense settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google AdSense Integration</h1>
        <p className="text-gray-600">Connect your AdSense account for additional revenue</p>
      </div>

      {/* Status Card */}
      <Card className={settings?.enabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {settings?.enabled ? (
              <CheckCircle className="h-10 w-10 text-green-600" />
            ) : (
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {settings?.enabled ? 'AdSense Connected' : 'AdSense Not Connected'}
              </h3>
              <p className="text-sm text-gray-600">
                {settings?.enabled 
                  ? 'Your AdSense account is active and serving ads as fallback'
                  : 'Connect your AdSense account to enable fallback ads'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated AdSense Earnings</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(settings?.estimatedEarnings || '0')}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Share</p>
                <p className="text-3xl font-bold">{settings?.revenueShare || '70'}%</p>
                <p className="text-sm text-gray-500">Your share of AdSense revenue</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={settings?.enabled ? 'success' : 'warning'} className="mt-2 text-lg px-4 py-1">
                  {settings?.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Settings className="h-10 w-10 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>AdSense Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Input
              label="Publisher ID"
              value={formData.publisherId}
              onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              helperText="Find this in your AdSense account under Account > Account information"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div>
                <p className="font-medium">Enable AdSense Integration</p>
                <p className="text-sm text-gray-500">Allow AdSense ads to be served on your sites</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.fallbackEnabled}
                onChange={(e) => setFormData({ ...formData, fallbackEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div>
                <p className="font-medium">Use as Fallback</p>
                <p className="text-sm text-gray-500">Show AdSense ads when no network ads are available</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoAdsEnabled}
                onChange={(e) => setFormData({ ...formData, autoAdsEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div>
                <p className="font-medium">Enable Auto Ads</p>
                <p className="text-sm text-gray-500">Let Google automatically place additional ads on your pages</p>
              </div>
            </label>
          </div>

          <Button onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Get your AdSense Publisher ID</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Log in to your Google AdSense account and find your Publisher ID (ca-pub-XXXX) 
                  under Account {'>'} Account Information.
                </p>
                <a 
                  href="https://www.google.com/adsense" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm inline-flex items-center gap-1 mt-2 hover:underline"
                >
                  Open Google AdSense <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Enter your Publisher ID above</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Paste your Publisher ID in the field above and enable AdSense integration.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Add AdSense script to your site</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add the following script to your website&apos;s {'<head>'} section:
                </p>
                <div className="relative mt-2">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formData.publisherId || 'ca-pub-XXXXXXXX'}"
     crossorigin="anonymous"></script>`}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formData.publisherId || 'ca-pub-XXXXXXXX'}" crossorigin="anonymous"></script>`)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium">Create Ad Units</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Go to the Ad Units page to create ad placements. When no network ads are available, 
                  AdSense will automatically fill those spots.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of AdSense Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">100% Fill Rate</p>
                  <p className="text-sm text-gray-600">Never show empty ad spaces - AdSense fills when network ads aren&apos;t available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Higher Revenue</p>
                  <p className="text-sm text-gray-600">Earn from multiple sources - network ads pay more, AdSense fills gaps</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Automatic Optimization</p>
                  <p className="text-sm text-gray-600">System automatically serves the highest paying ads</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Easy Setup</p>
                  <p className="text-sm text-gray-600">Just add your Publisher ID and you&apos;re ready to go</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
