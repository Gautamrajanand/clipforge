'use client';

import { LucideIcon } from 'lucide-react';

interface AIToolCardProps {
  title: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  soon?: boolean;
  onClick?: () => void;
}

export default function AIToolCard({ 
  title, 
  icon: Icon, 
  gradientFrom, 
  gradientTo, 
  soon,
  onClick 
}: AIToolCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={soon}
      className="bg-white rounded-xl p-4 hover:shadow-md transition-all cursor-pointer text-left relative disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      {soon && (
        <span className="absolute top-3 right-3 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
          Soon
        </span>
      )}
    </button>
  );
}
