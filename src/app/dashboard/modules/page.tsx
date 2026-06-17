import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardFeatureModules } from '@/components/features/dashboard-feature-modules';

export const metadata = {
  title: 'Module Centre | Local Ads',
};

export default async function ModuleCentrePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardFeatureModules role={user.role} />;
}
