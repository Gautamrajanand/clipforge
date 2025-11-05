'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'mint' | 'purple' | 'yellow' | 'peach';
  onClick?: () => void;
}

const colorClasses = {
  pink: 'bg-card-pink hover:shadow-pink-200',
  blue: 'bg-card-blue hover:shadow-blue-200',
  mint: 'bg-card-mint hover:shadow-green-200',
  purple: 'bg-card-purple hover:shadow-purple-200',
  yellow: 'bg-card-yellow hover:shadow-yellow-200',
  peach: 'bg-card-peach hover:shadow-orange-200',
};

const iconColorClasses = {
  pink: 'bg-pink-200 text-pink-600',
  blue: 'bg-blue-200 text-blue-600',
  mint: 'bg-green-200 text-green-600',
  purple: 'bg-purple-200 text-purple-600',
  yellow: 'bg-yellow-200 text-yellow-600',
  peach: 'bg-orange-200 text-orange-600',
};

export default function FeatureCard({ title, icon: Icon, color, onClick }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer w-full text-left`}
    >
      <div className={`w-12 h-12 ${iconColorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-semibold text-gray-800 text-lg">{title}</span>
    </button>
  );
}
