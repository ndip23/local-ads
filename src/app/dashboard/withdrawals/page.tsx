'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Check, X, DollarSign } from 'lucide-react';

interface Withdrawal {
  id: string;
  amount: string;
  fee: string;
  netAmount: string;
  status: string;
  paymentMethod: string;
  paymentDetails: Record<string, string>;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [transactionRef, setTransactionRef] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/withdrawals?${params}`);
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedWithdrawal) return;
    setProcessing(true);

    try {
      await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          transactionRef: action === 'complete' ? transactionRef : undefined,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });
      setShowModal(false);
      setSelectedWithdrawal(null);
      setTransactionRef('');
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Failed to process withdrawal:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (withdrawal: Withdrawal, actionType: 'approve' | 'reject' | 'complete') => {
    setSelectedWithdrawal(withdrawal);
    setAction(actionType);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
      pending: 'warning',
      approved: 'info',
      rejected: 'error',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-600">Process publisher withdrawal requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardContent className="p-0">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No withdrawal requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {withdrawal.user?.firstName && withdrawal.user?.lastName
                            ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                            : withdrawal.user?.email
                          }
                        </p>
                        <p className="text-sm text-gray-500">{withdrawal.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(withdrawal.fee)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(withdrawal.netAmount)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="capitalize">{withdrawal.paymentMethod}</p>
                        <p className="text-sm text-gray-500">
                          {withdrawal.paymentDetails?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => openActionModal(withdrawal, 'approve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openActionModal(withdrawal, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => openActionModal(withdrawal, 'complete')}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={
          action === 'approve' ? 'Approve Withdrawal' :
          action === 'reject' ? 'Reject Withdrawal' :
          'Complete Withdrawal'
        }
      >
        <div className="space-y-4">
          {selectedWithdrawal && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Amount: <span className="font-medium">{formatCurrency(selectedWithdrawal.amount)}</span></p>
              <p className="text-sm text-gray-600">Net Amount: <span className="font-medium text-green-600">{formatCurrency(selectedWithdrawal.netAmount)}</span></p>
              <p className="text-sm text-gray-600">Method: <span className="font-medium capitalize">{selectedWithdrawal.paymentMethod}</span></p>
              <p className="text-sm text-gray-600">To: <span className="font-medium">{selectedWithdrawal.paymentDetails?.email}</span></p>
            </div>
          )}

          {action === 'complete' && (
            <Input
              label="Transaction Reference"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Enter payment transaction ID"
            />
          )}

          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Explain why this withdrawal is being rejected..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              loading={processing}
              variant={action === 'reject' ? 'danger' : 'primary'}
            >
              {action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Mark as Paid'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
