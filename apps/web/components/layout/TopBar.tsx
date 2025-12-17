'use client';

import { Bell, HelpCircle, User, Menu, Shield } from 'lucide-react';
import { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  // Check if user is admin
  const isAdmin = user?.emailAddresses?.some(email => 
    email.emailAddress === 'gautam@hubhopper.com' || 
    email.emailAddress.includes('gautamrajanand')
  );

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between px-4 lg:px-8">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (Mobile Only) */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        {/* Workspace Selector */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Personal Workspace</p>
            <p className="text-xs text-gray-500">Basic • 1 Premier limit</p>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Try Premium Button */}
        <button className="hidden md:flex px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg text-sm transition-colors items-center gap-2">
          <span>✨</span>
          <span className="hidden lg:inline">Try Premium for free</span>
          <span className="lg:hidden">Premium</span>
        </button>

        {/* Help */}
        <button className="hidden sm:flex w-10 h-10 rounded-lg hover:bg-gray-100 items-center justify-center transition-colors">
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
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Profile settings
              </Link>
              <Link href="/dashboard/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Billing
              </Link>
              <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Help & support
              </Link>
              <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Blog
              </Link>
              {isAdmin && (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-primary-600 hover:bg-gray-50 font-medium flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                </div>
              )}
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
