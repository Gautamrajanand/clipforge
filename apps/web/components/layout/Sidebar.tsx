'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  Palette, 
  Library,
  Calendar, 
  BarChart3,
  Share2,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Plus,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  requiresPro?: boolean;
}

const createItems: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Brand template', href: '/brand-template', icon: Palette, requiresPro: true },
  { name: 'Asset library', href: '/asset-library', icon: Library, requiresPro: true },
];

const postItems: NavItem[] = [
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, requiresPro: true },
  { name: 'Social accounts', href: '/social', icon: Share2, requiresPro: true },
];

const bottomItems: NavItem[] = [
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Learning center', href: '/learning', icon: GraduationCap },
  { name: 'Help center', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    // If item requires Pro and user is on free plan, redirect to pricing
    if (item.requiresPro && user?.planType === 'FREE') {
      e.preventDefault();
      router.push('/pricing');
    }
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const isPro = item.requiresPro;
    const isLocked = isPro && user?.planType === 'FREE';

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={(e) => handleNavClick(item, e)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-gray-100 text-gray-900'
            : isLocked
            ? 'text-gray-400 hover:bg-gray-50 cursor-pointer'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
        {isPro && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 rounded">
            Pro
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">ClipForge</span>
        </Link>
      </div>

      {/* Create Button */}
      <div className="p-4">
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Create Section */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Create
          </div>
          <div className="space-y-1">
            {createItems.map(renderNavItem)}
          </div>
        </div>

        {/* Post Section */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Post
          </div>
          <div className="space-y-1">
            {postItems.map(renderNavItem)}
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Bottom Items */}
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Credit Balance Widget */}
      <div className="p-4 m-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Credits</span>
          <Zap className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold text-gray-900">{user?.creditBalance || 0}</span>
          <span className="text-sm text-gray-500">/ {user?.creditsPerMonth || 60}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          Resets {new Date(user?.nextCreditReset || Date.now()).toLocaleDateString()}
        </div>
        <Link
          href="/pricing"
          className="block w-full text-center px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          Add more credits
        </Link>
      </div>
    </div>
  );
}
