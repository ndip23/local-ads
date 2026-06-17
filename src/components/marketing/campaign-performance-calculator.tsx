'use client';

import { useMemo, useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

export function CampaignPerformanceCalculator() {
  const [dailyBudget, setDailyBudget] = useState(10000);
  const [averageCpc, setAverageCpc] = useState(120);
  const [clickThroughRate, setClickThroughRate] = useState(1.5);
  const [conversionRate, setConversionRate] = useState(4);
  const [leadValue, setLeadValue] = useState(5000);

  const result = useMemo(() => {
    const clicks = averageCpc > 0 ? dailyBudget / averageCpc : 0;
    const estimatedImpressions = clickThroughRate > 0 ? clicks / (clickThroughRate / 100) : 0;
    const conversions = clicks * (conversionRate / 100);
    const estimatedValue = conversions * leadValue;
    const returnRatio = dailyBudget > 0 ? estimatedValue / dailyBudget : 0;

    return {
      clicks: Math.round(clicks),
      estimatedImpressions: Math.round(estimatedImpressions),
      conversions,
      estimatedValue,
      returnRatio,
    };
  }, [dailyBudget, averageCpc, clickThroughRate, conversionRate, leadValue]);

  const money = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  const number = new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 1,
  });

  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign performance estimator</h2>
          <p className="text-sm text-gray-400">Estimate impressions, clicks, leads and value before wasting budget.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Daily campaign budget (₦)</span>
            <input
              type="number"
              min="0"
              value={dailyBudget}
              onChange={(event) => setDailyBudget(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Average CPC (₦)</span>
            <input
              type="number"
              min="0"
              value={averageCpc}
              onChange={(event) => setAverageCpc(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Expected CTR (%)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={clickThroughRate}
              onChange={(event) => setClickThroughRate(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Landing page conversion rate (%)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={conversionRate}
              onChange={(event) => setConversionRate(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Estimated value per lead/customer (₦)</span>
            <input
              type="number"
              min="0"
              value={leadValue}
              onChange={(event) => setLeadValue(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex items-center gap-3 text-blue-400">
            <TrendingUp className="h-6 w-6" />
            <span className="font-semibold">Estimated daily campaign result</span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Estimated impressions</span>
              <span className="font-semibold text-white">{number.format(result.estimatedImpressions)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Estimated clicks</span>
              <span className="font-semibold text-white">{number.format(result.clicks)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Estimated conversions</span>
              <span className="font-semibold text-white">{number.format(result.conversions)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Estimated value</span>
              <span className="font-semibold text-white">{money.format(result.estimatedValue)}</span>
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-5">
              <p className="text-sm text-blue-200">Estimated value-to-spend ratio</p>
              <p className="mt-2 text-3xl font-bold text-blue-400">{number.format(result.returnRatio)}x</p>
            </div>
          </div>
          <p className="mt-6 text-xs leading-5 text-gray-500">
            This is a planning estimate, not a performance guarantee. Real results depend on publisher fit, creative strength, landing page quality, offer clarity and traffic validation.
          </p>
        </div>
      </div>
    </div>
  );
}
