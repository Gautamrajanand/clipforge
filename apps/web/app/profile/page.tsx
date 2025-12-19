'use client';

import { useUser } from '@clerk/nextjs';
import { UserProfile } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Clerk UserProfile Component */}
        <div className="bg-white rounded-lg shadow-sm">
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none',
                navbar: 'hidden',
                pageScrollBox: 'p-6',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600',
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
                formFieldInput: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
                identityPreviewText: 'text-gray-900',
                identityPreviewEditButton: 'text-primary-600 hover:text-primary-700',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
