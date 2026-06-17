'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

interface EarningsStats {
  clicks: {
    total: number;
    valid: number;
    earnings: string;
  };
  conversions: {
    total: number;
    earnings: string;
  };
  dailyEarnings: Array<{
    date: string;
    clicks: number;
    earnings: string;
  }>;
}

export default function EarningsPage() {
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalEarnings = 
    parseFloat(stats?.clicks?.earnings || '0') + 
    parseFloat(stats?.conversions?.earnings || '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600">Track your earnings and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Earnings</p>
                <p className="text-3xl font-bold">{formatCurrency(totalEarnings.toString())}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.clicks?.earnings || '0')}</p>
                <p className="text-sm text-gray-500">{formatNumber(stats?.clicks?.valid || 0)} valid clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Bonus</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.conversions?.earnings || '0')}</p>
                <p className="text-sm text-gray-500">{formatNumber(stats?.conversions?.total || 0)} conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Earnings/Day</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((totalEarnings / (period === '7d' ? 7 : period === '30d' ? 30 : 90)).toFixed(2))}
                </p>
                <p className="text-sm text-gray-500">Based on {period === '7d' ? '7' : period === '30d' ? '30' : '90'} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.dailyEarnings && stats.dailyEarnings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.dailyEarnings.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{day.date}</TableCell>
                    <TableCell>{formatNumber(day.clicks)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(day.earnings)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No earnings data for this period</p>
              <p className="text-sm mt-2">Start promoting ads to see your earnings here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
