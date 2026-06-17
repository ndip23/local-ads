'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';
import { AlertTriangle, Check, ExternalLink, Globe, Link2, Search, ShieldCheck, UserCog, X } from 'lucide-react';

interface PublisherProfile {
  websiteUrl: string | null;
  socialMedia: Record<string, string> | null;
  niches: string[] | null;
}

interface AdvertiserProfile {
  companyName: string | null;
  website: string | null;
  industry: string | null;
  country: string | null;
}

interface PublisherSite {
  id: string;
  domain: string;
  name: string | null;
  verified: boolean;
  verificationToken: string | null;
  verificationMethod: string | null;
  category: string | null;
  monthlyPageviews: number | null;
  adsenseApproved: boolean;
  active: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
  wallet?: { balance: string };
  publisherProfile?: PublisherProfile | null;
  advertiserProfile?: AdvertiserProfile | null;
  publisherSites?: PublisherSite[];
}

function ensureUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function getDisplayName(user: User): string {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(`${userId}-${newStatus}`);
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === userId ? { ...user, status: newStatus } : user
      )));
      setSelectedUser((currentUser) => (
        currentUser?.id === userId ? { ...currentUser, status: newStatus } : currentUser
      ));
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      active: 'success',
      pending: 'warning',
      suspended: 'error',
      banned: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'info' | 'success' | 'default'> = {
      admin: 'info',
      advertiser: 'success',
      publisher: 'default',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const selectedSubmittedLinks = useMemo(() => {
    if (!selectedUser) return [];

    const links: { label: string; url: string }[] = [];
    const websiteUrl = selectedUser.publisherProfile?.websiteUrl;

    if (websiteUrl) {
      links.push({ label: 'Website / Blog', url: websiteUrl });
    }

    const socialMedia = selectedUser.publisherProfile?.socialMedia || {};
    for (const [platform, url] of Object.entries(socialMedia)) {
      if (url) links.push({ label: platform, url });
    }

    return links;
  }, [selectedUser]);

  const countSubmittedLinks = (user: User) => {
    const profileLinks = [
      user.publisherProfile?.websiteUrl,
      ...Object.values(user.publisherProfile?.socialMedia || {}),
    ].filter(Boolean).length;
    const submittedSites = user.publisherSites?.length || 0;
    return profileLinks + submittedSites;
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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Review publisher links before approving accounts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Roles</option>
              <option value="advertiser">Advertisers</option>
              <option value="publisher">Publishers</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <Button variant="outline" onClick={fetchUsers}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted Links</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const submittedLinksCount = user.role === 'publisher' ? countSubmittedLinks(user) : 0;
                  const verifiedSiteCount = user.publisherSites?.filter((site) => site.verified).length || 0;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getDisplayName(user)}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.role === 'publisher' ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-gray-400" />
                              <span>{submittedLinksCount} link{submittedLinksCount === 1 ? '' : 's'}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {verifiedSiteCount}/{user.publisherSites?.length || 0} site verified
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(user.wallet?.balance || '0')}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === 'publisher' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <UserCog className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                loading={actionLoading === `${user.id}-active`}
                                onClick={() => handleStatusChange(user.id, 'active')}
                                title={user.role === 'publisher' ? 'Approve only after checking the submitted links' : 'Approve account'}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                loading={actionLoading === `${user.id}-banned`}
                                onClick={() => handleStatusChange(user.id, 'banned')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {user.status === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-600 hover:text-yellow-700"
                              loading={actionLoading === `${user.id}-suspended`}
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                            >
                              Suspend
                            </Button>
                          )}
                          {user.status === 'suspended' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              loading={actionLoading === `${user.id}-active`}
                              onClick={() => handleStatusChange(user.id, 'active')}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="Publisher Verification Review"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">Publisher</p>
                <p className="font-semibold text-gray-900 mt-1">{getDisplayName(selectedUser)}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">Account Status</p>
                <div className="mt-2">{getStatusBadge(selectedUser.status)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">Niches</p>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedUser.publisherProfile?.niches?.length
                    ? selectedUser.publisherProfile.niches.join(', ')
                    : 'No niche submitted'}
                </p>
              </div>
            </div>

            {selectedSubmittedLinks.length === 0 && (!selectedUser.publisherSites || selectedUser.publisherSites.length === 0) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No verification link was submitted.</p>
                  <p className="text-sm">Approving this publisher blindly is a bad fraud-control decision. Ask the publisher to submit a website or social profile first.</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-600" />
                Submitted Website and Social Links
              </h3>
              {selectedSubmittedLinks.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-lg p-4">No profile links submitted.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSubmittedLinks.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={ensureUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize text-gray-900">{link.label}</p>
                        <p className="text-xs text-gray-500 break-all">{link.url}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Publisher Site Submissions
              </h3>
              {!selectedUser.publisherSites || selectedUser.publisherSites.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-lg p-4">No site verification record exists for this publisher yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUser.publisherSites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{site.domain}</p>
                            {site.name && site.name !== site.domain && (
                              <p className="text-xs text-gray-500">{site.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{site.category || '-'}</TableCell>
                        <TableCell>
                          {site.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Pending</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={site.active ? 'success' : 'default'}>{site.active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(site.createdAt)}</TableCell>
                        <TableCell>
                          <a href={ensureUrl(site.domain)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
              {selectedUser.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    loading={actionLoading === `${selectedUser.id}-banned`}
                    onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                  >
                    Reject Publisher
                  </Button>
                  <Button
                    loading={actionLoading === `${selectedUser.id}-active`}
                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Approve Publisher
                  </Button>
                </>
              )}
              {selectedUser.status === 'active' && (
                <Button
                  variant="outline"
                  className="text-yellow-700"
                  loading={actionLoading === `${selectedUser.id}-suspended`}
                  onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                >
                  Suspend Publisher
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
