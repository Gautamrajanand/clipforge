'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  Video, 
  Calendar, 
  Palette, 
  Mic2, 
  Radio,
  Sparkles,
  Plus
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard', icon: FolderOpen },
  { name: 'Recordings', href: '#', icon: Video },
  { name: 'Recording planner', href: '#', icon: Calendar },
  { name: 'Brand Kit', href: '#', icon: Palette },
];

const tools = [
  { name: 'Studios', href: '#', icon: Mic2 },
  { name: 'Shows', href: '#', icon: Radio },
  { name: 'AI Voices', href: '#', icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-48 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">ClipForge</span>
        </Link>
      </div>

      {/* Create Button */}
      <div className="px-4 mb-6">
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          Create
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
          <div className="h-px bg-gray-200" />
        </div>

        {tools.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Plan Widget */}
      <div className="p-4 m-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Basic plan</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Video Recording</span>
            <span className="text-gray-900 font-medium">1hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Audio Recording</span>
            <span className="text-gray-900 font-medium">1hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transcription</span>
            <span className="text-gray-900 font-medium">1hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available Storage</span>
            <span className="text-gray-900 font-medium">100%</span>
          </div>
        </div>
        <button className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
          Try free upgrade
        </button>
      </div>
    </div>
  );
}
