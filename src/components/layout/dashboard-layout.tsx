'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: 'admin' | 'advertiser' | 'publisher';
  };
  walletBalance?: string;
}

export function DashboardLayout({ children, user, walletBalance }: DashboardLayoutProps) {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <Header user={user} walletBalance={walletBalance} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
