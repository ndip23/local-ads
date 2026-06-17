'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, Megaphone, Save, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudinaryUploadBox } from '@/components/ui/cloudinary-upload-box';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ctaOptions } from '@/lib/marketing-content';

interface CampaignResponse {
  id: string;
  title: string;
  description: string | null;
  landingPageUrl: string;
  totalBudget: string;
  dailyBudget: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  ads: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    ctaText: string | null;
  }>;
}

function toDateInput(value: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function isValidAbsoluteUrl(value: string) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isCloudinaryImageUrl(value: string) {
  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);
    return url.protocol === 'https:'
      && url.hostname === 'res.cloudinary.com'
      && segments.length >= 4
      && segments[1] === 'image'
      && segments[2] === 'upload';
  } catch {
    return false;
  }
}

function getPreviewHost(value: string) {
  if (!value) return 'yoursite.com';
  try {
    return new URL(value).hostname;
  } catch {
    return 'invalid-url';
  }
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    landingPageUrl: '',
    totalBudget: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    adId: '',
    adTitle: '',
    adDescription: '',
    imageUrl: '',
    videoUrl: '',
    ctaText: 'Learn More',
  });

  const ctaOptionItems = useMemo(
    () => ctaOptions.map((item) => ({ value: item, label: item })),
    [],
  );

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/campaigns/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load campaign');
          return;
        }

        const loadedCampaign: CampaignResponse = data.campaign;
        const primaryAd = loadedCampaign.ads?.[0];
        setCampaign(loadedCampaign);
        setFormData({
          title: loadedCampaign.title || '',
          description: loadedCampaign.description || '',
          landingPageUrl: loadedCampaign.landingPageUrl || '',
          totalBudget: loadedCampaign.totalBudget || '',
          dailyBudget: loadedCampaign.dailyBudget || '',
          startDate: toDateInput(loadedCampaign.startDate),
          endDate: toDateInput(loadedCampaign.endDate),
          adId: primaryAd?.id || '',
          adTitle: primaryAd?.title || loadedCampaign.title || '',
          adDescription: primaryAd?.description || loadedCampaign.description || '',
          imageUrl: primaryAd?.imageUrl || '',
          videoUrl: primaryAd?.videoUrl || '',
          ctaText: primaryAd?.ctaText || 'Learn More',
        });
      } catch {
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Campaign title is required';
    if (!formData.landingPageUrl.trim()) return 'Landing page URL is required';
    if (!isValidAbsoluteUrl(formData.landingPageUrl)) return 'Landing page URL must start with http:// or https://';

    const totalBudget = parseFloat(formData.totalBudget);
    const dailyBudget = parseFloat(formData.dailyBudget);
    if (!Number.isFinite(totalBudget) || totalBudget < 10) return 'Total budget must be at least $10';
    if (!Number.isFinite(dailyBudget) || dailyBudget < 1) return 'Daily budget must be at least $1';
    if (dailyBudget > totalBudget) return 'Daily budget cannot be greater than total budget';

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      return 'End date cannot be earlier than start date';
    }

    if (!formData.adTitle.trim()) return 'Ad headline is required';
    if (!formData.imageUrl.trim()) return 'Upload a campaign banner image using the Cloudinary upload box';
    if (!isCloudinaryImageUrl(formData.imageUrl)) return 'Campaign image must be a Cloudinary image/upload URL';
    if (formData.videoUrl && !isValidAbsoluteUrl(formData.videoUrl)) return 'Video URL must be a full http:// or https:// URL';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/campaigns/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          landingPageUrl: formData.landingPageUrl.trim(),
          totalBudget: parseFloat(formData.totalBudget),
          dailyBudget: parseFloat(formData.dailyBudget),
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          ad: {
            id: formData.adId || undefined,
            title: formData.adTitle.trim(),
            description: formData.adDescription.trim() || undefined,
            imageUrl: formData.imageUrl.trim() || undefined,
            videoUrl: formData.videoUrl.trim() || undefined,
            ctaText: formData.ctaText || 'Learn More',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to update campaign');
        return;
      }

      window.location.href = `/dashboard/campaigns/${resolvedParams.id}`;
    } catch {
      setError('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 rounded bg-gray-200" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Campaign not found</p>
        <Link href="/dashboard/campaigns">
          <Button className="mt-4">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const previewTitle = formData.adTitle || formData.title || 'Your Ad Headline';
  const previewDescription = formData.adDescription || formData.description || 'Your ad description will appear here.';
  const previewHost = getPreviewHost(formData.landingPageUrl);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/campaigns/${campaign.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-gray-600">
            Replace the campaign image, update the landing page, and submit revised creatives for approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Campaign Title *" name="title" value={formData.title} onChange={handleChange} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <Input label="Landing Page URL *" name="landingPageUrl" type="url" value={formData.landingPageUrl} onChange={handleChange} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Total Budget ($) *" name="totalBudget" type="number" min="10" step="0.01" value={formData.totalBudget} onChange={handleChange} required />
                <Input label="Daily Budget ($) *" name="dailyBudget" type="number" min="1" step="0.01" value={formData.dailyBudget} onChange={handleChange} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                <Input label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-600" />
                Ad Creative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Ad Headline *" name="adTitle" value={formData.adTitle} onChange={handleChange} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ad Description</label>
                <textarea
                  name="adDescription"
                  value={formData.adDescription}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <Select label="Call-to-Action Button Text" name="ctaText" value={formData.ctaText} onChange={handleChange} options={ctaOptionItems} />
              <CloudinaryUploadBox
                label="Cloudinary Banner Image *"
                value={formData.imageUrl}
                onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                onRemove={() => setFormData({ ...formData, imageUrl: '' })}
                helperText="Images must be uploaded through Cloudinary and stored as a res.cloudinary.com/.../image/upload/... URL."
              />
              <Input
                label="Optional external video URL"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://..."
                helperText="Video file uploads are disabled here; campaign image uploads are handled through Cloudinary."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/campaigns/${campaign.id}`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div className="bg-gray-50 px-4 py-2 text-right text-[10px] uppercase tracking-wide text-gray-400">Sponsored</div>
                {formData.imageUrl ? (
                  <div className="aspect-video bg-gray-100">
                    <img src={formData.imageUrl} alt="Ad preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gray-100 text-center text-sm text-gray-500">
                    Upload an image to preview your creative.
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold leading-tight text-gray-900">{previewTitle}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{previewDescription}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className={`truncate text-xs ${previewHost === 'invalid-url' ? 'text-red-500' : 'text-gray-400'}`}>{previewHost}</span>
                    <span className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{formData.ctaText}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
