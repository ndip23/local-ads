'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, FileSearch, ShieldAlert } from 'lucide-react';

const niches = ['Real Estate', 'Construction', 'Business Directory', 'Hotel/Hospitality', 'News/Community', 'Education', 'Technology', 'Lifestyle', 'Other'];
const trafficSources = ['Organic search', 'Direct audience', 'Newsletter', 'Social media', 'Paid traffic', 'Referral/community'];

export function PublisherQualificationForm() {
  const [monthlyVisitors, setMonthlyVisitors] = useState(10000);
  const [contentAge, setContentAge] = useState(12);
  const [hasOriginalContent, setHasOriginalContent] = useState(true);
  const [usesPaidTraffic, setUsesPaidTraffic] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState(niches[0]);
  const [selectedSource, setSelectedSource] = useState(trafficSources[0]);

  const assessment = useMemo(() => {
    let score = 0;
    score += monthlyVisitors >= 50000 ? 25 : monthlyVisitors >= 10000 ? 20 : monthlyVisitors >= 3000 ? 12 : 5;
    score += contentAge >= 24 ? 20 : contentAge >= 6 ? 14 : 6;
    score += hasOriginalContent ? 25 : 0;
    score += usesPaidTraffic ? 5 : 18;
    score += selectedSource === 'Organic search' || selectedSource === 'Direct audience' || selectedSource === 'Newsletter' ? 12 : 8;

    if (score >= 80) return { label: 'Strong applicant', score, tone: 'text-green-400', icon: CheckCircle };
    if (score >= 60) return { label: 'Review-ready applicant', score, tone: 'text-blue-400', icon: FileSearch };
    return { label: 'Needs improvement before approval', score, tone: 'text-yellow-400', icon: ShieldAlert };
  }, [monthlyVisitors, contentAge, hasOriginalContent, usesPaidTraffic, selectedSource]);

  const Icon = assessment.icon;

  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 md:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">Website qualification</p>
        <h2 className="mt-3 text-3xl font-bold text-white">Filter serious publisher applicants before registration.</h2>
        <p className="mt-3 text-gray-400">This front-end qualification tool educates applicants and sets expectations before they create an account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Publisher niche</span>
            <select value={selectedNiche} onChange={(event) => setSelectedNiche(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500">
              {niches.map((niche) => <option key={niche}>{niche}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Main traffic source</span>
            <select value={selectedSource} onChange={(event) => setSelectedSource(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500">
              {trafficSources.map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Estimated monthly visitors</span>
            <input type="number" min="0" value={monthlyVisitors} onChange={(event) => setMonthlyVisitors(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">How many months has the website been active?</span>
            <input type="number" min="0" value={contentAge} onChange={(event) => setContentAge(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-300">
              <input type="checkbox" checked={hasOriginalContent} onChange={(event) => setHasOriginalContent(event.target.checked)} />
              Website has original content
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-300">
              <input type="checkbox" checked={usesPaidTraffic} onChange={(event) => setUsesPaidTraffic(event.target.checked)} />
              Website relies on paid traffic
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
          <Icon className={`h-10 w-10 ${assessment.tone}`} />
          <p className={`mt-5 text-sm font-semibold uppercase tracking-wide ${assessment.tone}`}>Pre-registration result</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{assessment.label}</h3>
          <p className="mt-4 text-gray-400">Niche: {selectedNiche}</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(assessment.score, 100)}%` }} />
          </div>
          <p className="mt-3 text-sm text-gray-400">Qualification score: <span className="font-bold text-white">{assessment.score}/100</span></p>
          <div className="mt-6 space-y-3 text-sm text-gray-300">
            <p>Required during full application:</p>
            <ul className="list-disc space-y-2 pl-5 text-gray-400">
              <li>Website URL and niche category.</li>
              <li>Traffic source explanation.</li>
              <li>Placement plan and content type.</li>
              <li>Bank/payout details after approval.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
