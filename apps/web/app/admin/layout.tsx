'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (you can customize this check)
  const userEmails = user?.emailAddresses?.map(e => e.emailAddress) || [];
  console.log('🔍 Admin Check:', { userEmails, publicMetadata: user?.publicMetadata });
  
  const isAdmin = userEmails.some(email => 
    email === 'gautam@hubhopper.com' || 
    email.includes('gautamrajanand') ||
    email.endsWith('@hubhopper.com')
  ) || user?.publicMetadata?.isAdmin;
  
  console.log('✅ Is Admin:', isAdmin);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {/* Modern Header Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your ClipForge platform</p>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
