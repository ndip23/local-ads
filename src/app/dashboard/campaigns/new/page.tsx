"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Globe,
  ImageIcon,
  Lightbulb,
  Megaphone,
  Plus,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudinaryUploadBox } from "@/components/ui/cloudinary-upload-box";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { campaignIdeas, ctaOptions } from "@/lib/marketing-content";

interface TargetCountry {
  country: string;
  cpc: number;
}

const NICHE_OPTIONS = [
  "Technology",
  "Business",
  "Finance",
  "Health",
  "Lifestyle",
  "Entertainment",
  "Sports",
  "Education",
  "News",
  "Travel",
  "Food",
  "Fashion",
  "Crypto",
  "Gaming",
  "Music",
  "Real Estate",
  "Marketing",
  "Automotive",
  "Fitness",
  "SaaS",
];

function isValidAbsoluteUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
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
  if (!value) return "yoursite.com";
  try {
    return new URL(value).hostname;
  } catch {
    return "invalid-url";
  }
}

function cleanCpcValue(value: string) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function NewCampaignPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    landingPageUrl: "",
    totalBudget: "",
    dailyBudget: "",
    startDate: "",
    endDate: "",
    niches: [] as string[],
    adTitle: "",
    adDescription: "",
    videoUrl: "",
    imageUrl: "",
    ctaText: "Learn More",
  });

  const [targeting, setTargeting] = useState<TargetCountry[]>([
    { country: "NG", cpc: 0.05 },
  ]);

  const ctaOptionItems = useMemo(
    () => ctaOptions.map((item) => ({ value: item, label: item })),
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleNiche = (niche: string) => {
    setFormData((current) => ({
      ...current,
      niches: current.niches.includes(niche)
        ? current.niches.filter((item) => item !== niche)
        : [...current.niches, niche],
    }));
  };

  const applySuggestion = (idea: (typeof campaignIdeas)[number]) => {
    setFormData((current) => ({
      ...current,
      title: current.title || idea.title,
      description: current.description || idea.description,
      adTitle: current.adTitle || idea.headline,
      adDescription: current.adDescription || idea.adDescription,
      ctaText: idea.cta,
      niches: Array.from(new Set([...current.niches, ...idea.niches])),
    }));
  };

  const addTargeting = () => {
    setTargeting([...targeting, { country: "", cpc: 0.05 }]);
  };

  const updateTargeting = (
    index: number,
    field: keyof TargetCountry,
    value: string | number,
  ) => {
    const updated = [...targeting];
    updated[index] = { ...updated[index], [field]: value };
    setTargeting(updated);
  };

  const removeTargeting = (index: number) => {
    setTargeting(targeting.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) return "Campaign title is required";
    if (!formData.landingPageUrl.trim()) return "Landing page URL is required";
    if (!isValidAbsoluteUrl(formData.landingPageUrl))
      return "Landing page URL must start with http:// or https://";

    const totalBudget = parseFloat(formData.totalBudget);
    const dailyBudget = parseFloat(formData.dailyBudget);

    if (!Number.isFinite(totalBudget) || totalBudget < 10)
      return "Total budget must be at least $10";
    if (!Number.isFinite(dailyBudget) || dailyBudget < 1)
      return "Daily budget must be at least $1";
    if (dailyBudget > totalBudget)
      return "Daily budget cannot be greater than total budget";

    const validTargets = targeting.filter((target) => target.country.trim());
    if (validTargets.length === 0) return "Add at least one target country";
    if (
      validTargets.some(
        (target) => !Number.isFinite(target.cpc) || target.cpc <= 0,
      )
    )
      return "Every target country must have a valid CPC above 0";

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      return "End date cannot be earlier than start date";
    }

    return null;
  };

  const validateStep2 = () => {
    if (!formData.adTitle.trim() && !formData.title.trim())
      return "Ad headline is required";
    if (!formData.imageUrl.trim()) {
      return "Upload a campaign banner image using the Cloudinary upload box";
    }
    if (!isCloudinaryImageUrl(formData.imageUrl)) {
      return "Campaign image must be a Cloudinary image/upload URL";
    }
    if (formData.videoUrl && !isValidAbsoluteUrl(formData.videoUrl)) {
      return "Video URL must be a full http:// or https:// URL";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const step1Error = validateStep1();
    const step2Error = validateStep2();
    if (step1Error || step2Error) {
      setError(
        step1Error || step2Error || "Please review the campaign details",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          landingPageUrl: formData.landingPageUrl.trim(),
          totalBudget: parseFloat(formData.totalBudget),
          dailyBudget: parseFloat(formData.dailyBudget),
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          niches: formData.niches,
          targeting: targeting
            .filter((target) => target.country.trim())
            .map((target) => ({
              country: target.country.trim().toUpperCase(),
              cpc: target.cpc,
            })),
          ad: {
            title: (formData.adTitle || formData.title).trim(),
            description:
              (formData.adDescription || formData.description).trim() ||
              undefined,
            videoUrl: formData.videoUrl.trim() || undefined,
            imageUrl: formData.imageUrl.trim() || undefined,
            ctaText: formData.ctaText,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const diagnostic = [data.error || "Failed to create campaign", data.hint, data.detail]
          .filter(Boolean)
          .join(" — ");
        setError(diagnostic);
        return;
      }

      window.location.href = "/dashboard/campaigns";
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewTitle = formData.adTitle || formData.title || "Your Ad Headline";
  const previewDescription =
    formData.adDescription ||
    formData.description ||
    "Your ad description will appear here. Keep it short, direct and tied to one clear offer.";
  const previewHost = getPreviewHost(formData.landingPageUrl);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Campaign
          </h1>
          <p className="text-gray-600">
            {step === 1
              ? "Step 1: Campaign details, targeting and budget"
              : "Step 2: Creative, media upload, CTA and preview"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            1
          </div>
          <span className="hidden text-sm font-medium sm:block">
            Details & Budget
          </span>
        </div>
        <div
          className={`h-0.5 flex-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
        />
        <div
          className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            2
          </div>
          <span className="hidden text-sm font-medium sm:block">
            Ad Creative
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Campaign Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale Promotion"
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your campaign and the offer you are promoting."
                  />
                </div>
                <Input
                  label="Landing Page URL *"
                  name="landingPageUrl"
                  type="url"
                  value={formData.landingPageUrl}
                  onChange={handleChange}
                  placeholder="https://your-website.com/landing"
                  helperText="Where users go after clicking your ad. Use a complete http:// or https:// URL."
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Budget & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Total Budget ($) *"
                    name="totalBudget"
                    type="number"
                    step="0.01"
                    min="10"
                    value={formData.totalBudget}
                    onChange={handleChange}
                    placeholder="100.00"
                    required
                  />
                  <Input
                    label="Daily Budget ($) *"
                    name="dailyBudget"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.dailyBudget}
                    onChange={handleChange}
                    placeholder="10.00"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  <Input
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Country Targeting & CPC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {targeting.map((target, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Country code (NG, US, GH...)"
                        value={target.country}
                        onChange={(e) =>
                          updateTargeting(
                            index,
                            "country",
                            e.target.value.toUpperCase(),
                          )
                        }
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="CPC ($)"
                        value={target.cpc || ""}
                        onChange={(e) =>
                          updateTargeting(
                            index,
                            "cpc",
                            cleanCpcValue(e.target.value),
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTargeting(index)}
                      disabled={targeting.length === 1}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTargeting}>
                  <Plus className="mr-2 h-4 w-4" /> Add Country
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-600" />
                  Target Niches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-500">
                  Select niches your campaign is relevant to.
                </p>
                <div className="flex flex-wrap gap-2">
                  {NICHE_OPTIONS.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        formData.niches.includes(niche)
                          ? "border-blue-500 bg-blue-100 text-blue-800"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {formData.niches.includes(niche) ? "✓ " : "+ "}
                      {niche}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/campaigns">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="button" onClick={handleNext}>
                Continue to Ad Creative →
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Campaign idea suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaignIdeas.map((idea) => (
                  <button
                    key={idea.label}
                    type="button"
                    onClick={() => applySuggestion(idea)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <p className="font-semibold text-gray-900">{idea.label}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {idea.description}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      Apply suggestion
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Creation checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Use one clear offer, not a full company profile.</p>
                <p>• Keep daily budget lower than total budget.</p>
                <p>• Match niches to the publishers you actually want.</p>
                <p>• Add at least one country with a realistic CPC.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  Ad Copy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Ad Headline *"
                  name="adTitle"
                  value={formData.adTitle}
                  onChange={handleChange}
                  placeholder="Grab attention with a compelling headline"
                  helperText="Leave blank only if you want to use the campaign title."
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ad Description
                  </label>
                  <textarea
                    name="adDescription"
                    value={formData.adDescription}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your offer. What makes it worth clicking?"
                  />
                </div>
                <Select
                  label="Call-to-Action Button Text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  options={ctaOptionItems}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  Banner Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CloudinaryUploadBox
                  label="Cloudinary Banner Image *"
                  value={formData.imageUrl}
                  onUpload={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                  onRemove={() => setFormData({ ...formData, imageUrl: "" })}
                  helperText="Images must be uploaded through Cloudinary and stored as a res.cloudinary.com/.../image/upload/... URL. Recommended: 1200x628px."
                />
              </CardContent>
            </Card>

            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
              >
                ← Back to Details
              </Button>
              <Button type="submit" size="lg" loading={loading}>
                🚀 Create Campaign
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Optimised Ad Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                  <div className="bg-gray-50 px-4 py-2 text-right text-[10px] uppercase tracking-wide text-gray-400">
                    Sponsored
                  </div>
                  {formData.imageUrl ? (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={formData.imageUrl}
                        alt="Ad preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gray-100 text-center text-sm text-gray-500">
                      Upload an image to preview your creative.
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold leading-tight text-gray-900">
                      {previewTitle}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {previewDescription}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`truncate text-xs ${previewHost === "invalid-url" ? "text-red-500" : "text-gray-400"}`}
                      >
                        {previewHost}
                      </span>
                      <span className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        {formData.ctaText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">CTA guidance</p>
                  <p className="mt-1">
                    Use “Shop Now” for products, “Book Now” for services,
                    “Request Quote” for B2B leads, and “Apply Now” for
                    recruitment or admissions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </form>
      )}
    </div>
  );
}
