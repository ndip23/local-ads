'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, Mail, Lock, User, AlertCircle, Building2, Globe, Link2, AtSign, Hash, Video, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as 'advertiser' | 'publisher' | null;
  const refCode = searchParams.get('ref') || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: initialRole || 'publisher',
    // Advertiser fields
    companyName: '',
    website: '',
    industry: '',
    country: '',
    // Publisher fields
    blogUrl: '',
    socialFacebook: '',
    socialTwitter: '',
    socialInstagram: '',
    socialYoutube: '',
    socialTiktok: '',
    niches: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newNiche, setNewNiche] = useState('');

  useEffect(() => {
    const code = refCode.trim().toUpperCase();
    if (!code || typeof window === 'undefined') return;

    const storageKey = `lan_ref_click_${code}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');

    fetch('/api/referral/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code }),
    }).catch(() => {
      // Analytics must never block registration.
    });
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addNiche = () => {
    if (newNiche && !formData.niches.includes(newNiche)) {
      setFormData({ ...formData, niches: [...formData.niches, newNiche] });
      setNewNiche('');
    }
  };

  const removeNiche = (niche: string) => {
    setFormData({ ...formData, niches: formData.niches.filter(n => n !== niche) });
  };

  const handleNext = () => {
    setError('');
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate role-specific fields
    if (formData.role === 'advertiser' && !formData.website.trim()) {
      setError('Please enter your company website');
      return;
    }

    // Build social media object for publishers
    const socialMedia: Record<string, string> = {};
    if (formData.socialFacebook.trim()) socialMedia.facebook = formData.socialFacebook.trim();
    if (formData.socialTwitter.trim()) socialMedia.twitter = formData.socialTwitter.trim();
    if (formData.socialInstagram.trim()) socialMedia.instagram = formData.socialInstagram.trim();
    if (formData.socialYoutube.trim()) socialMedia.youtube = formData.socialYoutube.trim();
    if (formData.socialTiktok.trim()) socialMedia.tiktok = formData.socialTiktok.trim();

    if (formData.role === 'publisher' && !formData.blogUrl.trim() && Object.keys(socialMedia).length === 0) {
      setError('Please submit at least one website or social media link so the admin can verify your publisher account');
      return;
    }

    setLoading(true);

    try {

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          referralCode: refCode || undefined,
          // Advertiser profile
          ...(formData.role === 'advertiser' && {
            companyName: formData.companyName.trim(),
            website: formData.website.trim(),
            industry: formData.industry.trim(),
            country: formData.country.trim(),
          }),
          // Publisher profile
          ...(formData.role === 'publisher' && {
            blogUrl: formData.blogUrl.trim(),
            socialMedia,
            niches: formData.niches,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const INDUSTRIES = [
    'Technology', 'E-commerce', 'Finance', 'Healthcare', 'Education',
    'Real Estate', 'Travel', 'Food & Beverage', 'Fashion', 'Automotive',
    'Entertainment', 'Sports', 'SaaS', 'Crypto/Blockchain', 'Other',
  ];

  const NICHE_OPTIONS = [
    'Technology', 'Business', 'Finance', 'Health', 'Lifestyle',
    'Entertainment', 'Sports', 'Education', 'News', 'Travel',
    'Food', 'Fashion', 'Crypto', 'Gaming', 'Music',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white mb-4">
            <Megaphone className="h-10 w-10 text-blue-400" />
            <span className="text-2xl font-bold">Local Ad Network</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
          <p className="text-gray-400 mt-2">
            {step === 1 ? 'Step 1: Basic Information' : `Step 2: ${formData.role === 'advertiser' ? 'Company' : 'Publisher'} Details`}
          </p>
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* ========== STEP 1: Basic Info ========== */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Role Selection */}
              <div className="flex gap-4 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'advertiser' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    formData.role === 'advertiser'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className={`h-6 w-6 mx-auto mb-2 ${
                    formData.role === 'advertiser' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${
                    formData.role === 'advertiser' ? 'text-blue-600' : 'text-gray-700'
                  }`}>Advertiser</p>
                  <p className="text-xs text-gray-500 mt-1">Run ad campaigns</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'publisher' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    formData.role === 'publisher'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Globe className={`h-6 w-6 mx-auto mb-2 ${
                    formData.role === 'publisher' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${
                    formData.role === 'publisher' ? 'text-green-600' : 'text-gray-700'
                  }`}>Publisher</p>
                  <p className="text-xs text-gray-500 mt-1">Earn from traffic</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John" required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com" required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password" name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••" required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••" required
                  />
                </div>
              </div>

              <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                Continue →
              </Button>
            </div>
          )}

          {/* ========== STEP 2: Role-Specific Details ========== */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ----- ADVERTISER FIELDS ----- */}
              {formData.role === 'advertiser' && (
                <>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Company Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Website *</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url" name="website" value={formData.website} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://yourcompany.com" required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your landing page URL where ads will redirect to</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      name="industry" value={formData.industry} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text" name="country" value={formData.country} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="United States"
                    />
                  </div>
                </>
              )}

              {/* ----- PUBLISHER FIELDS ----- */}
              {formData.role === 'publisher' && (
                <>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <Globe className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Website &amp; Social Media</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blog / Website URL</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url" name="blogUrl" value={formData.blogUrl} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://myblog.com"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your blog or website where you&apos;ll promote ads. Admin will review this before approval.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Social Media Links</label>
                    <p className="text-xs text-gray-500 -mt-2">Add at least one website or social media profile for admin verification</p>

                    <div className="relative">
                      <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                      <input
                        type="url" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-500" />
                      <input
                        type="url" name="socialTwitter" value={formData.socialTwitter} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://x.com/yourhandle"
                      />
                    </div>

                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-600" />
                      <input
                        type="url" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://instagram.com/yourprofile"
                      />
                    </div>

                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                      <input
                        type="url" name="socialYoutube" value={formData.socialYoutube} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>

                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.16 8.16 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
                      </svg>
                      <input
                        type="url" name="socialTiktok" value={formData.socialTiktok} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://tiktok.com/@yourprofile"
                      />
                    </div>
                  </div>

                  {/* Niches */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Niches / Topics</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.niches.map((niche) => (
                        <span key={niche} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {niche}
                          <button type="button" onClick={() => removeNiche(niche)} className="hover:text-green-900">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {NICHE_OPTIONS.filter(n => !formData.niches.includes(n)).map((niche) => (
                        <button
                          key={niche} type="button"
                          onClick={() => setFormData({ ...formData, niches: [...formData.niches, niche] })}
                          className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          + {niche}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start mt-2">
                <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5" />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                </span>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" loading={loading}>
                  Create Account
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
