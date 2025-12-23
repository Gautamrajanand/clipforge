'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Gift,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Book,
} from 'lucide-react';

const navItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'PLG Growth',
    icon: TrendingUp,
    children: [
      { label: 'PLG Dashboard', href: '/admin/plg', icon: BarChart3 },
      { label: 'PLG Overview', href: '/admin/plg', icon: TrendingUp },
      { label: 'Referrals', href: '/admin/plg/referrals', icon: Gift },
      { label: 'NPS & Feedback', href: '/admin/plg/nps', icon: MessageSquare },
      { label: 'Onboarding', href: '/admin/plg/onboarding', icon: GraduationCap },
      { label: 'Content Manager', href: '/admin/plg/content', icon: FileText },
      { label: 'Documentation', href: '/admin/plg/documentation', icon: Book },
    ],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen p-6 shadow-2xl">
      {/* Logo & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400">ClipForge</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-4"></div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <div className="ml-2 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                        }`}
                      >
                        <child.icon className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`} />
                        <span className="flex-1 font-medium">{child.label}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon className={`w-4 h-4 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className="flex-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Access Card */}
      <div className="mt-8 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">Quick Access</p>
        </div>
        <div className="space-y-2">
          <Link
            href="/admin/plg"
            className="group flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 font-medium transition-colors"
          >
            <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
            <span>PLG Metrics</span>
          </Link>
          <Link
            href="/admin/plg/nps"
            className="group flex items-center gap-2 text-xs text-gray-300 hover:text-purple-400 font-medium transition-colors"
          >
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
            <span>NPS Score</span>
          </Link>
          <Link
            href="/admin/plg/referrals"
            className="group flex items-center gap-2 text-xs text-gray-300 hover:text-green-400 font-medium transition-colors"
          >
            <span className="text-green-400 group-hover:translate-x-1 transition-transform">→</span>
            <span>Referrals</span>
          </Link>
        </div>
      </div>
      
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700 hover:border-gray-600"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Dashboard</span>
      </Link>
    </nav>
  );
}
