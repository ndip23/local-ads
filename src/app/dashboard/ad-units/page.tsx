'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Plus, Code, Copy, Check, Edit, Trash2, Eye, LayoutGrid } from 'lucide-react';

interface AdUnit {
  id: string;
  name: string;
  type: string;
  size: string;
  useNetworkAds: boolean;
  useAdsense: boolean;
  impressions: number;
  clicks: number;
  earnings: string;
  ctr: string;
  active: boolean;
  createdAt: string;
}

const AD_TYPES = [
  { value: 'display', label: 'Display Ad' },
  { value: 'in_feed', label: 'In-Feed Ad' },
  { value: 'in_article', label: 'In-Article Ad' },
  { value: 'matched_content', label: 'Matched Content' },
  { value: 'native', label: 'Native Ad' },
  { value: 'responsive', label: 'Responsive Ad' },
];

const AD_SIZES = [
  { value: 'responsive', label: 'Responsive (Auto)' },
  { value: '300x250', label: 'Medium Rectangle (300x250)' },
  { value: '336x280', label: 'Large Rectangle (336x280)' },
  { value: '728x90', label: 'Leaderboard (728x90)' },
  { value: '300x600', label: 'Large Skyscraper (300x600)' },
  { value: '320x100', label: 'Mobile Banner Large (320x100)' },
  { value: '320x50', label: 'Mobile Banner (320x50)' },
  { value: '970x250', label: 'Billboard (970x250)' },
  { value: '970x90', label: 'Large Leaderboard (970x90)' },
];

export default function AdUnitsPage() {
  const [adUnits, setAdUnits] = useState<AdUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<AdUnit | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'display',
    size: 'responsive',
    useNetworkAds: true,
    useAdsense: true,
  });

  useEffect(() => {
    fetchAdUnits();
  }, []);

  const fetchAdUnits = async () => {
    try {
      const res = await fetch('/api/ad-units');
      const data = await res.json();
      setAdUnits(data.adUnits || []);
    } catch (error) {
      console.error('Failed to fetch ad units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/ad-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          type: 'display',
          size: 'responsive',
          useNetworkAds: true,
          useAdsense: true,
        });
        fetchAdUnits();
      }
    } catch (error) {
      console.error('Failed to create ad unit:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad unit?')) return;

    try {
      await fetch(`/api/ad-units/${id}`, { method: 'DELETE' });
      fetchAdUnits();
    } catch (error) {
      console.error('Failed to delete ad unit:', error);
    }
  };

  const getEmbedCode = (unit: AdUnit) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<script src="${baseUrl}/api/serve/${unit.id}?format=js" async></script>`;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Units</h1>
          <p className="text-gray-600">Create and manage your ad placements</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ad Unit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ad Units</p>
                <p className="text-3xl font-bold">{adUnits.length}</p>
              </div>
              <LayoutGrid className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Total Impressions</p>
              <p className="text-3xl font-bold">
                {formatNumber(adUnits.reduce((sum, u) => sum + (u.impressions || 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-3xl font-bold">
                {formatNumber(adUnits.reduce((sum, u) => sum + (u.clicks || 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(adUnits.reduce((sum, u) => sum + parseFloat(u.earnings || '0'), 0).toString())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Units Table */}
      <Card>
        <CardContent className="p-0">
          {adUnits.length === 0 ? (
            <div className="text-center py-12">
              <LayoutGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No ad units created yet</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Ad Unit
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="capitalize">{unit.type.replace('_', ' ')}</TableCell>
                    <TableCell>{unit.size}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {unit.useNetworkAds && <Badge variant="info">Network</Badge>}
                        {unit.useAdsense && <Badge variant="success">AdSense</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(unit.impressions || 0)}</TableCell>
                    <TableCell>{formatNumber(unit.clicks || 0)}</TableCell>
                    <TableCell>{unit.ctr || '0.00'}%</TableCell>
                    <TableCell>
                      <Badge variant={unit.active ? 'success' : 'error'}>
                        {unit.active ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUnit(unit);
                            setShowCodeModal(true);
                          }}
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDelete(unit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Ad Unit"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Ad Unit Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Sidebar Banner"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {AD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Size
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {AD_SIZES.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.useNetworkAds}
                onChange={(e) => setFormData({ ...formData, useNetworkAds: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Show Network Ads (from advertisers)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.useAdsense}
                onChange={(e) => setFormData({ ...formData, useAdsense: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Fallback to Google AdSense</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Ad Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setSelectedUnit(null);
        }}
        title="Get Ad Code"
        size="lg"
      >
        {selectedUnit && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">JavaScript Embed Code</h4>
              <p className="text-sm text-gray-600 mb-3">
                Add this code where you want the ad to appear on your website:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {getEmbedCode(selectedUnit)}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(getEmbedCode(selectedUnit))}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Alternative: Iframe Embed</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/serve/${selectedUnit.id}?format=html" 
  style="border:none;width:100%;height:auto;"
  scrolling="no"></iframe>`}
              </pre>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Network ads are served first when available</li>
                <li>• Falls back to Google AdSense when no network ads</li>
                <li>• Impressions and clicks are tracked automatically</li>
                <li>• You earn from both Network and AdSense ads</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
