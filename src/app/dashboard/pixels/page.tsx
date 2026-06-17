'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';

interface Pixel {
  id: string;
  name: string;
  pixelCode: string;
  conversionType: string;
  conversionValue: string | null;
  active: boolean;
  fires: number;
  campaign: {
    id: string;
    title: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  pixels: Pixel[];
}

export default function PixelsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/pixels');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPixelScript = (campaignId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<script src="${baseUrl}/api/pixel/${campaignId}"></script>`;
  };

  const getPixelImage = (campaignId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<img src="${baseUrl}/api/convert?campaign_id=${campaignId}" style="display:none" width="1" height="1" alt="" />`;
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
        <h1 className="text-2xl font-bold text-gray-900">Tracking Pixels</h1>
        <p className="text-gray-600">Install conversion tracking on your website</p>
      </div>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Installation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Step 1: Add the tracking script</h4>
            <p className="text-sm text-gray-600 mb-2">
              Add the JavaScript snippet to your website&apos;s &lt;head&gt; or before the closing &lt;/body&gt; tag:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/pixel/YOUR_CAMPAIGN_ID"></script>`}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Step 2: Track conversions</h4>
            <p className="text-sm text-gray-600 mb-2">
              Call the tracking function when a conversion occurs (e.g., form submission, purchase):
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
              <p>{`// Track a lead`}</p>
              <p>{`LAN.track('lead');`}</p>
              <p className="mt-2">{`// Track a purchase with value`}</p>
              <p>{`LAN.track('purchase', 99.99);`}</p>
              <p className="mt-2">{`// Track with custom metadata`}</p>
              <p>{`LAN.track('signup', null, { plan: 'premium' });`}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The pixel automatically captures the click_id from URL parameters</li>
              <li>• It stores the click_id in a cookie for 30 days</li>
              <li>• Pixel fires are counted on every page load so you can verify installation</li>
              <li>• When you call LAN.track(), it sends the conversion to our servers</li>
              <li>• Publishers are credited based on the conversion type</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Pixels */}
      <Card>
        <CardHeader>
          <CardTitle>Your Campaign Pixels</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No campaigns found. Create a campaign to get your tracking pixel.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                      <p className="text-sm text-gray-500">Campaign ID: {campaign.id}</p>
                      <p className="text-xs text-gray-500">Pixel fires: {formatNumber(campaign.pixels?.[0]?.fires || 0)}</p>
                    </div>
                    <Badge variant={campaign.pixels?.[0]?.active ? 'success' : 'warning'}>{campaign.pixels?.[0]?.active ? 'Active' : 'Pending'}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        JavaScript Pixel
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={getPixelScript(campaign.id)}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(`js-${campaign.id}`, getPixelScript(campaign.id))}
                        >
                          {copiedId === `js-${campaign.id}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Pixel (for email/simple tracking)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={getPixelImage(campaign.id)}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(`img-${campaign.id}`, getPixelImage(campaign.id))}
                        >
                          {copiedId === `img-${campaign.id}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
