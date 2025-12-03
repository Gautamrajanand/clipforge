'use client';

import { useState } from 'react';
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
  ChevronRight,
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['PLG Growth']);

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500">ClipForge Management</p>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span className="flex-1">{child.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4" />}
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Quick Access</p>
        <div className="space-y-2">
          <Link
            href="/admin/plg"
            className="block text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            → View PLG Metrics
          </Link>
          <Link
            href="/admin/plg/nps"
            className="block text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            → Check NPS Score
          </Link>
          <Link
            href="/admin/plg/referrals"
            className="block text-xs text-green-600 hover:text-green-700 font-medium"
          >
            → Referral Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
