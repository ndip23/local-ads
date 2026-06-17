'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Plus, Globe, CheckCircle, AlertCircle, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';

interface Site {
  id: string;
  domain: string;
  name: string;
  verified: boolean;
  verificationToken: string;
  verificationMethod: string;
  category: string | null;
  monthlyPageviews: number | null;
  adsenseApproved: boolean;
  active: boolean;
  createdAt: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    category: '',
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ domain: '', name: '', category: '' });
        fetchSites();
        // Show verification modal for new site
        setSelectedSite(data.site);
        setShowVerifyModal(true);
      }
    } catch (error) {
      console.error('Failed to add site:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedSite) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/sites/${selectedSite.id}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      setVerifyResult(data);
      if (data.success) {
        fetchSites();
      }
    } catch (error) {
      setVerifyResult({ success: false, message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          <h1 className="text-2xl font-bold text-gray-900">My Sites</h1>
          <p className="text-gray-600">Manage your websites and domains</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sites</p>
                <p className="text-3xl font-bold">{sites.length}</p>
              </div>
              <Globe className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Sites</p>
                <p className="text-3xl font-bold text-green-600">
                  {sites.filter(s => s.verified).length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {sites.filter(s => !s.verified).length}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites Table */}
      <Card>
        <CardContent className="p-0">
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No sites added yet</p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Site
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>AdSense</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{site.domain}</p>
                          {site.name !== site.domain && (
                            <p className="text-sm text-gray-500">{site.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{site.category || '-'}</TableCell>
                    <TableCell>
                      {site.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {site.adsenseApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="default">-</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={site.active ? 'success' : 'error'}>
                        {site.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(site.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!site.verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSite(site);
                              setVerifyResult(null);
                              setShowVerifyModal(true);
                            }}
                          >
                            Verify
                          </Button>
                        )}
                        <a
                          href={`https://${site.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Site Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Site"
      >
        <form onSubmit={handleAddSite} className="space-y-4">
          <Input
            label="Domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="example.com"
            required
          />
          <Input
            label="Site Name (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Blog"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select a category</option>
              <option value="News">News</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Finance">Finance</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding}>
              Add Site
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedSite(null);
          setVerifyResult(null);
        }}
        title="Verify Your Site"
        size="lg"
      >
        {selectedSite && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Step 1: Add Meta Tag</h4>
              <p className="text-sm text-gray-600 mb-3">
                Add the following meta tag to your website&apos;s {'<head>'} section:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {`<meta name="lan-site-verification" content="${selectedSite.verificationToken}">`}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`<meta name="lan-site-verification" content="${selectedSite.verificationToken}">`)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Step 2: Verify</h4>
              <p className="text-sm text-gray-600 mb-3">
                After adding the meta tag, click the button below to verify your site:
              </p>
              
              {verifyResult && (
                <div className={`p-4 rounded-lg mb-4 ${verifyResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <div className="flex items-center gap-2">
                    {verifyResult.success ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <p>{verifyResult.message}</p>
                  </div>
                </div>
              )}

              <Button onClick={handleVerify} loading={verifying}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verify Now
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Why Verify?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Proves you own the domain</li>
                <li>• Enables ad serving for your site</li>
                <li>• Required for AdSense integration</li>
                <li>• Unlocks premium features</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
