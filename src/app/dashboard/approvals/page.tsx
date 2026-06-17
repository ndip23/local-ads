import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ApprovalCentre } from '@/components/features/approval-centre';

export const metadata = {
  title: 'Approval Centre | Local Ads',
};

export default async function ApprovalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ApprovalCentre role={user.role} />;
}
