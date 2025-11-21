'use client';

import { Bell, HelpCircle, User } from 'lucide-react';
import { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      {/* Workspace Selector */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Personal Workspace</p>
          <p className="text-xs text-gray-500">Basic • 1 Premier limit</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Try Premium Button */}
        <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
          <span>✨</span>
          Try Premium for free
        </button>

        {/* Help */}
        <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium hover:shadow-md transition-all"
          >
            {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                </p>
              </div>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Profile settings
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Feature requests
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Help & support
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Blog
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Press
              </a>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>🚪</span>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
