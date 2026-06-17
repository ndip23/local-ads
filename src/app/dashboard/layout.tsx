import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.status !== 'active' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your account is currently pending approval. You&apos;ll be notified once an admin reviews your account.
          </p>
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      user={{
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }}
      walletBalance={user.wallet?.balance || '0.00'}
    >
      {children}
    </DashboardLayout>
  );
}
