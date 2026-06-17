'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Plus, Code, Copy, Check, Trash2, LayoutGrid, Eye, MousePointerClick, DollarSign } from 'lucide-react';

interface Widget {
  id: string; name: string; style: string; width: string; height: string;
  maxAds: number; impressions: number; clicks: number; earnings: string; active: boolean; createdAt: string;
}

const STYLES = [
  { value: 'banner', label: '🖼️ Banner', desc: 'Full-width banner ad' },
  { value: 'sidebar', label: '📏 Sidebar', desc: 'Vertical sidebar placement' },
  { value: 'inline', label: '📝 In-Content', desc: 'Placed within article content' },
  { value: 'native_feed', label: '📰 Native Feed', desc: 'Blends with content feed' },
  { value: 'sticky_bottom', label: '📌 Sticky Bottom', desc: 'Fixed at bottom of screen' },
];

const NICHES = ['Technology','Business','Finance','Health','Entertainment','Sports','Education','Travel','Food','Fashion','Crypto','Gaming'];

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [copied, setCopied] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', style: 'banner', width: '100%', height: '250px', maxAds: 1, targetNiches: [] as string[] });

  useEffect(() => { fetchWidgets(); }, []);

  const fetchWidgets = async () => {
    try { const r = await fetch('/api/ad-widgets'); const d = await r.json(); setWidgets(d.widgets || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      const r = await fetch('/api/ad-widgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) { const d = await r.json(); setShowCreate(false); setForm({ name: '', style: 'banner', width: '100%', height: '250px', maxAds: 1, targetNiches: [] }); fetchWidgets(); setSelectedWidget(d.widget); setShowCode(true); }
    } catch (e) { console.error(e); } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this widget?')) return;
    await fetch(`/api/ad-widgets/${id}`, { method: 'DELETE' }); fetchWidgets();
  };

  const getEmbedCode = (w: Widget) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `<!-- Local Ad Network Widget: ${w.name} -->\n<script src="${base}/api/widget/${w.id}" async></script>`;
  };

  const copy = (text: string, f: string) => { navigator.clipboard.writeText(text); setCopied(f); setTimeout(() => setCopied(''), 2000); };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Widgets</h1>
          <p className="text-gray-600">Create embeddable ad widgets for your websites</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create Widget</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Widgets</p><p className="text-3xl font-bold">{widgets.length}</p></div><LayoutGrid className="h-10 w-10 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Impressions</p><p className="text-3xl font-bold">{formatNumber(widgets.reduce((s, w) => s + (w.impressions || 0), 0))}</p></div><Eye className="h-10 w-10 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Clicks</p><p className="text-3xl font-bold">{formatNumber(widgets.reduce((s, w) => s + (w.clicks || 0), 0))}</p></div><MousePointerClick className="h-10 w-10 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Earnings</p><p className="text-3xl font-bold text-green-600">{formatCurrency(widgets.reduce((s, w) => s + parseFloat(w.earnings || '0'), 0).toString())}</p></div><DollarSign className="h-10 w-10 text-green-500" /></div></CardContent></Card>
      </div>

      {/* Widget List */}
      <Card>
        <CardContent className="p-0">
          {widgets.length === 0 ? (
            <div className="text-center py-16">
              <LayoutGrid className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No ad widgets yet</h3>
              <p className="text-gray-500 mb-6">Create a widget and paste the code on your website to start showing ads</p>
              <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create First Widget</Button>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Style</TableHead><TableHead>Size</TableHead><TableHead>Impressions</TableHead><TableHead>Clicks</TableHead><TableHead>Earnings</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {widgets.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell><Badge variant="default">{w.style}</Badge></TableCell>
                    <TableCell>{w.width} × {w.height}</TableCell>
                    <TableCell>{formatNumber(w.impressions || 0)}</TableCell>
                    <TableCell>{formatNumber(w.clicks || 0)}</TableCell>
                    <TableCell className="text-green-600 font-medium">{formatCurrency(w.earnings || '0')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedWidget(w); setShowCode(true); }}><Code className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4" /></Button>
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Ad Widget" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Widget Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Sidebar Ads" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Style</label>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => setForm({ ...form, style: s.value })}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${form.style === s.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Width" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} placeholder="100%" />
            <Input label="Height" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} placeholder="250px" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Niches (optional)</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map(n => (
                <button key={n} type="button" onClick={() => setForm({ ...form, targetNiches: form.targetNiches.includes(n) ? form.targetNiches.filter(x => x !== n) : [...form.targetNiches, n] })}
                  className={`px-3 py-1 rounded-full text-sm border ${form.targetNiches.includes(n) ? 'bg-blue-100 border-blue-500 text-blue-800' : 'border-gray-200 text-gray-600'}`}>
                  {form.targetNiches.includes(n) ? '✓ ' : ''}{n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" loading={creating}>Create Widget</Button></div>
        </form>
      </Modal>

      {/* Code Modal */}
      <Modal isOpen={showCode} onClose={() => { setShowCode(false); setSelectedWidget(null); }} title="Widget Embed Code" size="lg">
        {selectedWidget && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Paste this code on your website</h4>
              <p className="text-sm text-gray-600 mb-3">Add this wherever you want ads to appear — sidebar, content area, footer, etc.</p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">{getEmbedCode(selectedWidget)}</pre>
                <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => copy(getEmbedCode(selectedWidget), 'embed')}>
                  {copied === 'embed' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ What happens</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Ads from active campaigns are displayed automatically</li>
                <li>• Ads rotate every {selectedWidget.maxAds > 1 ? '30 seconds' : 'page load'}</li>
                <li>• You earn per click — 80% of the CPC goes to you</li>
                <li>• Works on any website, blog, WordPress, Shopify, etc.</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
