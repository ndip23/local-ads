'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface WalletData {
  balance: string;
  pendingBalance: string;
  totalEarnings: string;
  totalSpent: string;
  totalWithdrawn: string;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('paypal');
  const [withdrawEmail, setWithdrawEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      setWallet(data.wallet);
      setTransactions(data.recentTransactions || []);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 10) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          paymentMethod: 'demo',
        }),
      });
      if (res.ok) {
        setShowDepositModal(false);
        setDepositAmount('');
        fetchWallet();
      }
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 10) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          paymentMethod: withdrawMethod,
          paymentDetails: { email: withdrawEmail },
        }),
      });
      if (res.ok) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawEmail('');
        fetchWallet();
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('earning') || type === 'deposit') {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600">Manage your funds and transactions</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(wallet?.balance || '0')}
                </p>
              </div>
              <Wallet className="h-10 w-10 text-blue-200" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Deposit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowUpRight className="h-4 w-4 mr-1" /> Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(wallet?.pendingBalance || '0')}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting clearance</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(wallet?.totalEarnings || '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(wallet?.totalSpent || '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Withdrawn</span>
                <span className="font-semibold">
                  {formatCurrency(wallet?.totalWithdrawn || '0')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.type)}
                        <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <span className={parseFloat(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {parseFloat(tx.amount) >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Add Funds">
        <div className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            min="10"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount (min $10)"
          />
          <p className="text-sm text-gray-500">
            For demo purposes, deposits are credited instantly.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDepositModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} loading={processing}>
              Deposit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            min="10"
            step="0.01"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount (min $10)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="paypal">PayPal</option>
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>
          <Input
            label="PayPal Email / Wallet Address"
            type="text"
            value={withdrawEmail}
            onChange={(e) => setWithdrawEmail(e.target.value)}
            placeholder="Enter payment details"
          />
          <p className="text-sm text-gray-500">
            Withdrawals are processed within 24-48 hours. A 2% fee applies.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} loading={processing}>
              Request Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
