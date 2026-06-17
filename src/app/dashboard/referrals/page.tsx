'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Users, DollarSign, Copy, Check, Share2, TrendingUp, Link2, MousePointerClick, RefreshCw } from 'lucide-react';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  directReferrals: Array<{
    id: string; email: string; firstName: string | null; lastName: string | null;
    role: string; status: string; createdAt: string;
  }>;
  referralTree: Record<number, number>;
  levels: Array<{ level: number; commissionPercent: string; label: string; active: boolean }>;
  settings?: { enabled: boolean; minCommissionableAmount: string; maxLevels: number; cookieDays: number; commissionSource: string };
  earnings: { total: string; last30Days: string; totalTransactions: number };
  clicks?: { total: number; last30Days: number };
  analysis?: {
    totalTeam: number;
    directCount: number;
    depthMultiplier: string;
    teamToDirectPercent: string;
    referralClicks?: number;
    signupConversionRate?: string;
    byLevel: Array<{ level: number; total: string; transactions: number }>;
    bySourceType: Array<{ sourceType: string; total: string; transactions: number }>;
  };
  recentLog: Array<{
    id: string; level: number; sourceType: string;
    commissionAmount: string; createdAt: string;
  }>;
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/referrals')
      .then(async (r) => {
        const result = await r.json().catch(() => ({}));
        if (!r.ok) {
          setMessage(result.error || 'Failed to load referral data');
          return null;
        }
        return result;
      })
      .then((result) => { if (result) setData(result); })
      .catch(() => setMessage('Failed to load referral data'))
      .finally(() => setLoading(false));
  }, []);

  const generateReferralLink = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Failed to generate referral link');
        return;
      }
      setData((current) => current ? { ...current, referralCode: result.referralCode, referralLink: result.referralLink } : current);
      setMessage('Referral link generated successfully.');
    } catch {
      setMessage('Failed to generate referral link');
    } finally {
      setGenerating(false);
    }
  };

  const resetReferralCode = async () => {
    const confirmed = window.confirm('Resetting your referral code will make your old referral link stop working. Continue?');
    if (!confirmed) return;

    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Failed to reset referral code');
        return;
      }
      setData((current) => current ? { ...current, referralCode: result.referralCode, referralLink: result.referralLink } : current);
      setMessage('Referral code reset successfully. Copy and share the new link.');
    } catch {
      setMessage('Failed to reset referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };


  if (loading) return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-gray-200 rounded"></div></CardContent></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600">Earn commissions from active referral levels configured by the admin</p>
      </div>

      {message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Earnings</p>
                <p className="text-3xl font-bold">{formatCurrency(data?.earnings?.total || '0')}</p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 30 Days</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(data?.earnings?.last30Days || '0')}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direct Referrals</p>
                <p className="text-3xl font-bold">{data?.directReferrals?.length || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Referral Clicks</p>
                <p className="text-3xl font-bold">{formatNumber(data?.clicks?.total || 0)}</p>
              </div>
              <MousePointerClick className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-purple-100 bg-purple-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-purple-900">Generate and share your personal referral link</p>
              <p className="text-sm text-purple-700">Every account can generate a link in the format /register?ref=CODE. New signups through this link are counted in your referral analysis.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button onClick={generateReferralLink} loading={generating}>
                <Link2 className="mr-2 h-4 w-4" /> Generate Link
              </Button>
              <Button type="button" variant="outline" onClick={resetReferralCode} disabled={generating || !data?.referralCode}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Code
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
            <div className="flex gap-2">
              <input readOnly value={data?.referralCode || ''} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg font-bold tracking-wider" />
              <Button variant="outline" onClick={() => copy(data?.referralCode || '', 'code')}>
                {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Link</label>
            <div className="flex gap-2">
              <input readOnly value={data?.referralLink || ''} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
              <Button variant="outline" onClick={() => copy(data?.referralLink || '', 'link')}>
                {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>How it works:</strong> Share your link. When someone registers and earns, you get a commission from their earnings according to the admin&apos;s active threshold, levels and percentages.
          </div>
        </CardContent>
      </Card>

      {/* Commission Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure ({data?.settings?.maxLevels || 10} Active-Level Limit)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: data?.settings?.maxLevels || 10 }, (_, i) => {
              const level = data?.levels?.find(l => l.level === i + 1);
              const count = data?.referralTree?.[i + 1] || 0;
              return (
                <div key={i} className={`p-4 rounded-lg border text-center ${level?.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                  <p className="text-xs text-gray-500 font-medium uppercase">Level {i + 1}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{level?.commissionPercent || '0'}%</p>
                  <p className="text-xs text-gray-500 mt-1">{count} users</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referral Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Network depth multiplier</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{data?.analysis?.depthMultiplier || '0.00'}x</p>
              <p className="mt-1 text-xs text-gray-500">Total team divided by direct referrals</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Referral clicks, 30 days</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(data?.clicks?.last30Days || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Clicks captured when visitors open /register?ref=CODE</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Signup conversion rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{data?.analysis?.signupConversionRate || '0.00'}%</p>
              <p className="mt-1 text-xs text-gray-500">Direct referrals divided by tracked link clicks</p>
            </div>
          </div>

          {data?.analysis?.bySourceType && data.analysis.bySourceType.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {data.analysis.bySourceType.map((item) => (
                <div key={item.sourceType} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="capitalize text-sm font-medium text-gray-700">{item.sourceType}</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(item.total || '0')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Direct Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Referrals ({data?.directReferrals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.directReferrals?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No referrals yet. Share your link to start earning!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.directReferrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.firstName ? `${r.firstName} ${r.lastName || ''}` : r.email}</TableCell>
                    <TableCell><Badge variant={r.role === 'publisher' ? 'success' : 'info'}>{r.role}</Badge></TableCell>
                    <TableCell><Badge variant={r.status === 'active' ? 'success' : 'warning'}>{r.status}</Badge></TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      {data?.recentLog && data.recentLog.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Referral Earnings</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLog.map(log => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant="default">Level {log.level}</Badge></TableCell>
                    <TableCell className="capitalize">{log.sourceType}</TableCell>
                    <TableCell className="text-green-600 font-medium">+{formatCurrency(log.commissionAmount)}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
