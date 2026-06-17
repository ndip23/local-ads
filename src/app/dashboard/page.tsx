import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { AdvertiserDashboard } from '@/components/dashboards/advertiser-dashboard';
import { PublisherDashboard } from '@/components/dashboards/publisher-dashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'advertiser') {
    return <AdvertiserDashboard />;
  }

  return <PublisherDashboard />;
}
