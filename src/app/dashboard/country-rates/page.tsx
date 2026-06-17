'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';

interface CountryRate {
  id: string;
  countryCode: string;
  countryName: string;
  defaultCpc: string;
  publisherShare: string;
  platformShare: string;
  active: boolean;
}

export default function CountryRatesPage() {
  const [rates, setRates] = useState<CountryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<CountryRate | null>(null);
  const [formData, setFormData] = useState({
    countryCode: '',
    countryName: '',
    defaultCpc: '',
    publisherShare: '80',
    platformShare: '20',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/admin/country-rates');
      const data = await res.json();
      setRates(data.rates || []);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const url = editingRate 
        ? `/api/admin/country-rates/${editingRate.id}`
        : '/api/admin/country-rates';
      
      const res = await fetch(url, {
        method: editingRate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: formData.countryCode,
          countryName: formData.countryName,
          defaultCpc: parseFloat(formData.defaultCpc),
          publisherShare: parseFloat(formData.publisherShare),
          platformShare: parseFloat(formData.platformShare),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchRates();
      }
    } catch (error) {
      console.error('Failed to save rate:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country rate?')) return;

    try {
      await fetch(`/api/admin/country-rates/${id}`, { method: 'DELETE' });
      fetchRates();
    } catch (error) {
      console.error('Failed to delete rate:', error);
    }
  };

  const openEditModal = (rate: CountryRate) => {
    setEditingRate(rate);
    setFormData({
      countryCode: rate.countryCode,
      countryName: rate.countryName,
      defaultCpc: rate.defaultCpc,
      publisherShare: rate.publisherShare,
      platformShare: rate.platformShare,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRate(null);
    setFormData({
      countryCode: '',
      countryName: '',
      defaultCpc: '',
      publisherShare: '80',
      platformShare: '20',
    });
  };

  const handleShareChange = (field: 'publisherShare' | 'platformShare', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (field === 'publisherShare') {
      setFormData({
        ...formData,
        publisherShare: value,
        platformShare: (100 - numValue).toString(),
      });
    } else {
      setFormData({
        ...formData,
        platformShare: value,
        publisherShare: (100 - numValue).toString(),
      });
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Country Rates</h1>
          <p className="text-gray-600">Configure CPC rates and revenue share by country</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Country
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {rates.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No country rates configured yet</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Country
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Default CPC</TableHead>
                  <TableHead>Publisher Share</TableHead>
                  <TableHead>Platform Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.countryName}</TableCell>
                    <TableCell>
                      <Badge variant="default">{rate.countryCode}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(rate.defaultCpc)}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">{rate.publisherShare}%</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 font-medium">{rate.platformShare}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rate.active ? 'success' : 'error'}>
                        {rate.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(rate.id)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingRate ? 'Edit Country Rate' : 'Add Country Rate'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country Code"
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
              placeholder="US"
              maxLength={2}
              required
              disabled={!!editingRate}
            />
            <Input
              label="Country Name"
              value={formData.countryName}
              onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
              placeholder="United States"
              required
              disabled={!!editingRate}
            />
          </div>

          <Input
            label="Default CPC ($)"
            type="number"
            step="0.0001"
            min="0.001"
            value={formData.defaultCpc}
            onChange={(e) => setFormData({ ...formData, defaultCpc: e.target.value })}
            placeholder="0.05"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Publisher Share (%)"
              type="number"
              min="0"
              max="100"
              value={formData.publisherShare}
              onChange={(e) => handleShareChange('publisherShare', e.target.value)}
              required
            />
            <Input
              label="Platform Share (%)"
              type="number"
              min="0"
              max="100"
              value={formData.platformShare}
              onChange={(e) => handleShareChange('platformShare', e.target.value)}
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              For a click worth <strong>{formatCurrency(formData.defaultCpc || '0')}</strong>:
            </p>
            <div className="flex justify-between mt-2">
              <span className="text-green-600">
                Publisher earns: {formatCurrency((parseFloat(formData.defaultCpc || '0') * parseFloat(formData.publisherShare) / 100).toFixed(4))}
              </span>
              <span className="text-blue-600">
                Platform earns: {formatCurrency((parseFloat(formData.defaultCpc || '0') * parseFloat(formData.platformShare) / 100).toFixed(4))}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={processing}>
              {editingRate ? 'Update' : 'Add'} Country
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
