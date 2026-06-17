'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, LifeBuoy, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

type Role = 'admin' | 'advertiser' | 'publisher';
type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected' | 'closed';
type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';

interface DisputeUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
}

interface Dispute {
  id: string;
  disputeNumber: string;
  subject: string;
  category: string;
  relatedType?: string | null;
  relatedId?: string | null;
  description: string;
  amount?: string | null;
  status: DisputeStatus;
  priority: DisputePriority;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: DisputeUser | null;
}

interface DisputeCentreProps {
  role: Role;
}

const categoryOptions = [
  { value: 'billing', label: 'Billing or wallet' },
  { value: 'traffic_quality', label: 'Traffic quality' },
  { value: 'campaign_approval', label: 'Campaign approval' },
  { value: 'publisher_payout', label: 'Publisher payout' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'general', label: 'General support' },
];

const relatedTypeOptions = [
  { value: 'general', label: 'General' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'wallet', label: 'Wallet transaction' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'publisher_site', label: 'Publisher site' },
  { value: 'click', label: 'Click or traffic record' },
];

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (['resolved', 'closed'].includes(status)) return 'success';
  if (['open', 'under_review'].includes(status)) return 'warning';
  if (status === 'rejected') return 'error';
  return 'default';
}

function getPriorityVariant(priority: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (priority === 'urgent') return 'error';
  if (priority === 'high') return 'warning';
  if (priority === 'low') return 'success';
  return 'info';
}

function displayUser(user?: DisputeUser | null) {
  if (!user) return 'Unknown user';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.email;
}

export function DisputeCentre({ role }: DisputeCentreProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    subject: '',
    category: 'billing',
    relatedType: 'general',
    relatedId: '',
    amount: '',
    priority: 'medium',
    description: '',
  });

  const fetchDisputes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('/api/disputes');
      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitialDisputes() {
      try {
        const response = await fetch('/api/disputes');
        const data = await response.json();
        if (mounted) setDisputes(data.disputes || []);
      } catch (error) {
        console.error('Failed to fetch disputes:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadInitialDisputes();

    return () => {
      mounted = false;
    };
  }, []);

  const submitDispute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        subject: form.subject,
        category: form.category,
        relatedType: form.relatedType,
        relatedId: form.relatedId || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        priority: form.priority,
        description: form.description,
      };

      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to create dispute');
        return;
      }

      setForm({ subject: '', category: 'billing', relatedType: 'general', relatedId: '', amount: '', priority: 'medium', description: '' });
      setMessage('Dispute submitted successfully. It is now visible in the review queue.');
      fetchDisputes();
    } catch (error) {
      console.error('Create dispute failed:', error);
      setMessage('Failed to create dispute');
    } finally {
      setSaving(false);
    }
  };

  const updateDispute = async (id: string, changes: Partial<Pick<Dispute, 'status' | 'priority' | 'resolution'>>) => {
    try {
      const response = await fetch(`/api/disputes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error || 'Failed to update dispute');
        return;
      }

      setMessage('Dispute updated.');
      fetchDisputes();
    } catch (error) {
      console.error('Update dispute failed:', error);
      setMessage('Failed to update dispute');
    }
  };

  const openCount = disputes.filter((dispute) => ['open', 'under_review'].includes(dispute.status)).length;
  const urgentCount = disputes.filter((dispute) => dispute.priority === 'urgent').length;
  const resolvedCount = disputes.filter((dispute) => ['resolved', 'closed'].includes(dispute.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Centre</h1>
          <p className="text-gray-600">Track refund requests, traffic complaints, approval issues and payout disputes from one place.</p>
        </div>
        <Button variant="outline" onClick={() => fetchDisputes()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Open / under review</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Urgent priority</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{urgentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Resolved / closed</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-gray-500" /> Open a dispute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitDispute}>
              <Input
                label="Subject"
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Example: Suspicious clicks on campaign #123"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  options={categoryOptions}
                />
                <Select
                  label="Related item"
                  value={form.relatedType}
                  onChange={(event) => setForm((current) => ({ ...current, relatedType: event.target.value }))}
                  options={relatedTypeOptions}
                />
              </div>
              <Input
                label="Related ID, optional"
                value={form.relatedId}
                onChange={(event) => setForm((current) => ({ ...current, relatedId: event.target.value }))}
                placeholder="UUID from campaign, wallet, click or withdrawal"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Amount, optional"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                />
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Evidence / description</label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="State what happened, what amount is affected, and what evidence should be reviewed."
                  required
                />
              </div>
              <Button type="submit" loading={saving} className="w-full gap-2">
                <LifeBuoy className="h-4 w-4" /> Submit dispute
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispute queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><div className="h-52 animate-pulse rounded bg-gray-200" /></div>
            ) : disputes.length === 0 ? (
              <div className="p-10 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-900">No disputes found</p>
                <p className="mt-1 text-sm text-gray-500">New cases will appear here once submitted.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Raised by</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    {role === 'admin' && <TableHead>Admin action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="max-w-xs whitespace-normal">
                        <p className="font-semibold">{dispute.subject}</p>
                        <p className="mt-1 text-xs text-gray-500">{dispute.disputeNumber} • {dispute.category.replace(/_/g, ' ')}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-gray-500">{dispute.description}</p>
                      </TableCell>
                      <TableCell>{displayUser(dispute.creator)}</TableCell>
                      <TableCell>{dispute.amount ? formatCurrency(dispute.amount) : 'N/A'}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(dispute.status)}>{dispute.status.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell><Badge variant={getPriorityVariant(dispute.priority)}>{dispute.priority}</Badge></TableCell>
                      <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                      {role === 'admin' && (
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateDispute(dispute.id, { status: 'under_review' })}>Review</Button>
                            <Button variant="outline" size="sm" onClick={() => updateDispute(dispute.id, { status: 'resolved', resolution: 'Resolved by admin review.' })}>Resolve</Button>
                            <Button variant="danger" size="sm" onClick={() => updateDispute(dispute.id, { status: 'rejected', resolution: 'Rejected after review.' })}>Reject</Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
