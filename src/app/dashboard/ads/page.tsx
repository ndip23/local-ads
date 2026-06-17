'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';
import { Link2, ExternalLink, Copy, Check, Play, Image } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  ctaText: string;
  campaign: {
    id: string;
    title: string;
    landingPageUrl: string;
    niches: string[];
  };
  targeting?: Array<{
    country: string;
    cpc: string;
  }>;
}

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  landingPageUrl: string;
  niches: string[];
  ads: Ad[];
  targeting: Array<{
    country: string;
    cpc: string;
  }>;
}

export default function BrowseAdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [trackingData, setTrackingData] = useState<{
    trackingUrl: string;
    bannerCode: string;
    embedCode: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns?status=active');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingLink = async (ad: Ad) => {
    setSelectedAd(ad);
    setGeneratingLink(true);
    setShowLinkModal(true);

    try {
      const res = await fetch('/api/publisher/tracking-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });
      const data = await res.json();
      setTrackingData(data);
    } catch (error) {
      console.error('Failed to generate tracking link:', error);
    } finally {
      setGeneratingLink(false);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Browse Ads</h1>
        <p className="text-gray-600">Find campaigns to promote and earn commissions</p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No active campaigns available at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            campaign.ads?.map((ad) => (
              <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Ad Preview */}
                <div className="aspect-video bg-gray-100 relative">
                  {ad.videoUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  ) : ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ad.description || campaign.description || 'No description available'}
                  </p>

                  {/* Niches */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {campaign.niches?.slice(0, 3).map((niche) => (
                      <Badge key={niche} variant="default">{niche}</Badge>
                    ))}
                  </div>

                  {/* CPC Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Avg. CPC</p>
                      <p className="font-semibold text-green-600">
                        {campaign.targeting?.[0]?.cpc 
                          ? formatCurrency(campaign.targeting[0].cpc)
                          : '$0.05'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Your Earning</p>
                      <p className="font-semibold text-green-600">
                        {campaign.targeting?.[0]?.cpc 
                          ? formatCurrency((parseFloat(campaign.targeting[0].cpc) * 0.8).toFixed(4))
                          : '$0.04'
                        }
                      </p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => generateTrackingLink({ ...ad, campaign, targeting: campaign.targeting })}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Get Tracking Link
                  </Button>
                </CardContent>
              </Card>
            ))
          ))}
        </div>
      )}

      {/* Tracking Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setTrackingData(null);
          setSelectedAd(null);
        }}
        title="Your Tracking Link"
        size="lg"
      >
        {generatingLink ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Generating your tracking link...</p>
          </div>
        ) : trackingData ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={trackingData.trackingUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(trackingData.trackingUrl)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this link on social media, blogs, or anywhere your audience is.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Banner Code
              </label>
              <textarea
                readOnly
                value={trackingData.bannerCode}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                rows={6}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard(trackingData.bannerCode)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML Code
              </Button>
            </div>

            {trackingData.embedCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Embed Code
                </label>
                <textarea
                  readOnly
                  value={trackingData.embedCode}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={4}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(trackingData.embedCode!)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tips for Promoting</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share on relevant social media groups and pages</li>
                <li>• Include the link in blog posts related to the campaign niche</li>
                <li>• Use the banner code on your website sidebar or content</li>
                <li>• Only share with genuinely interested audiences for best results</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to generate tracking link. Please try again.
          </div>
        )}
      </Modal>
    </div>
  );
}
