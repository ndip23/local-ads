'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { AlertTriangle, Shield, Check, X, Eye } from 'lucide-react';

interface FraudFlag {
  id: string;
  reason: string;
  severity: string;
  ipAddress: string;
  resolved: boolean;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface FraudStats {
  total: number;
  unresolved: number;
  high: number;
  medium: number;
  low: number;
}

export default function FraudPage() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedFilter, setResolvedFilter] = useState<string>('false');

  useEffect(() => {
    fetchFraudFlags();
  }, [resolvedFilter]);

  const fetchFraudFlags = async () => {
    try {
      const params = new URLSearchParams();
      if (resolvedFilter) params.append('resolved', resolvedFilter);

      const res = await fetch(`/api/admin/fraud?${params}`);
      const data = await res.json();
      setFlags(data.flags || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch fraud flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/admin/fraud/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      });
      fetchFraudFlags();
    } catch (error) {
      console.error('Failed to resolve flag:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'error' | 'warning' | 'default'> = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>;
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
        <h1 className="text-2xl font-bold text-gray-900">Fraud Detection</h1>
        <p className="text-gray-600">Monitor and manage suspicious activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Flags</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.unresolved || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-3xl font-bold text-red-600">{stats?.high || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Protected</p>
                <p className="text-3xl font-bold text-green-600">✓</p>
              </div>
              <Shield className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
              <option value="">All</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Flags Table */}
      <Card>
        <CardContent className="p-0">
          {flags.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No fraud flags to display</p>
              <p className="text-sm text-gray-400 mt-2">Your network is running smoothly!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>{getSeverityBadge(flag.severity)}</TableCell>
                    <TableCell className="max-w-xs truncate">{flag.reason}</TableCell>
                    <TableCell><code className="text-sm">{flag.ipAddress}</code></TableCell>
                    <TableCell>
                      {flag.user ? (
                        <div>
                          <p className="font-medium">{flag.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(flag.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={flag.resolved ? 'success' : 'warning'}>
                        {flag.resolved ? 'Resolved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!flag.resolved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => handleResolve(flag.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
