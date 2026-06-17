'use client';

import { useMemo, useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

export function PublisherEarningsCalculator() {
  const [monthlyVisitors, setMonthlyVisitors] = useState(25000);
  const [adImpressionRate, setAdImpressionRate] = useState(70);
  const [clickRate, setClickRate] = useState(1.2);
  const [averageCpc, setAverageCpc] = useState(120);
  const [qualityRate, setQualityRate] = useState(85);

  const result = useMemo(() => {
    const impressions = monthlyVisitors * (adImpressionRate / 100);
    const rawClicks = impressions * (clickRate / 100);
    const validClicks = rawClicks * (qualityRate / 100);
    const grossRevenue = validClicks * averageCpc;
    const publisherShare = grossRevenue * 0.8;
    const platformShare = grossRevenue * 0.2;

    return {
      impressions: Math.round(impressions),
      rawClicks: Math.round(rawClicks),
      validClicks: Math.round(validClicks),
      grossRevenue,
      publisherShare,
      platformShare,
    };
  }, [monthlyVisitors, adImpressionRate, clickRate, averageCpc, qualityRate]);

  const money = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  const number = new Intl.NumberFormat('en-NG');

  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Publisher earnings estimator</h2>
          <p className="text-sm text-gray-400">Transparent estimate based on traffic, quality and the 80% publisher share.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Monthly visitors</span>
            <input
              type="number"
              min="0"
              value={monthlyVisitors}
              onChange={(event) => setMonthlyVisitors(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Ad impression rate (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={adImpressionRate}
              onChange={(event) => setAdImpressionRate(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Estimated click-through rate (%)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={clickRate}
              onChange={(event) => setClickRate(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Average CPC (₦)</span>
            <input
              type="number"
              min="0"
              value={averageCpc}
              onChange={(event) => setAverageCpc(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-300">Traffic quality approval rate (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={qualityRate}
              onChange={(event) => setQualityRate(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </label>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex items-center gap-3 text-green-400">
            <TrendingUp className="h-6 w-6" />
            <span className="font-semibold">Estimated monthly result</span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Ad impressions</span>
              <span className="font-semibold text-white">{number.format(result.impressions)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Raw clicks</span>
              <span className="font-semibold text-white">{number.format(result.rawClicks)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Qualified clicks</span>
              <span className="font-semibold text-white">{number.format(result.validClicks)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3 text-sm">
              <span className="text-gray-400">Gross campaign revenue</span>
              <span className="font-semibold text-white">{money.format(result.grossRevenue)}</span>
            </div>
            <div className="rounded-2xl bg-green-500/10 p-5">
              <p className="text-sm text-green-200">Publisher 80% share</p>
              <p className="mt-2 text-3xl font-bold text-green-400">{money.format(result.publisherShare)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform 20% share</span>
              <span className="font-semibold text-gray-200">{money.format(result.platformShare)}</span>
            </div>
          </div>
          <p className="mt-6 text-xs leading-5 text-gray-500">
            This is an estimate, not a payout guarantee. Final earnings depend on approved advertiser campaigns, niche match, fraud review, valid clicks and payout policy.
          </p>
        </div>
      </div>
    </div>
  );
}
