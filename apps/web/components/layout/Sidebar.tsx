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
  Zap,
  Key,
  X,
  Shield,
  Gift
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface SidebarProps {
  credits?: number | null;
  creditsAllocation?: number;
  resetDate?: string;
  tier?: string;
  trialInfo?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

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
  { name: 'Refer & Earn', href: '/referrals', icon: Gift },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Learning center', href: '/learning', icon: GraduationCap },
  { name: 'Help center', href: '/help', icon: HelpCircle },
];

const resourceItems: NavItem[] = [
  { name: 'Blog', href: '/blog', icon: GraduationCap },
];

export default function Sidebar({ credits, creditsAllocation = 60, resetDate, tier = 'FREE', trialInfo, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAdmin();
  
  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    // If item requires Pro and user is on free plan, redirect to pricing
    if (item.requiresPro && tier === 'FREE') {
      e.preventDefault();
      router.push('/pricing');
    }
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const isPro = item.requiresPro;
    const isLocked = isPro && tier === 'FREE';

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
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
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

        {/* Resources Section */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Resources
          </div>
          <div className="space-y-1">
            {resourceItems.map(renderNavItem)}
          </div>
        </div>

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
          
          {/* Admin Link (only for admins) */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-200" />
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-red-50 text-red-700'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Current Plan Badge */}
      <div className="px-4 mb-2">
        <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
          tier === 'FREE' ? 'bg-gray-100 text-gray-700' :
          tier === 'STARTER' ? 'bg-blue-100 text-blue-700' :
          tier === 'PRO' ? 'bg-purple-100 text-purple-700' :
          'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700'
        }`}>
          {tier === 'FREE' && trialInfo?.isActive ? 'FREE TRIAL' : `${tier} Plan`}
        </div>
      </div>

      {/* Credit Balance Widget */}
      <Link href="/credits" className="block p-4 mx-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer" data-tour="credits">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Credits</span>
          <Zap className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold text-gray-900">{credits !== null && credits !== undefined ? credits : '...'}</span>
          <span className="text-sm text-gray-500">/ {creditsAllocation}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          Resets {resetDate ? new Date(resetDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'Loading...'}
        </div>
        <div className="w-full text-center px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          View Details
        </div>
      </Link>
      </div>
    </>
  );
}
