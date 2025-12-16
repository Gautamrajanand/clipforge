'use client';

import { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

interface WatermarkUpgradeNudgeProps {
  onDismiss?: () => void;
}

export default function WatermarkUpgradeNudge({ onDismiss }: WatermarkUpgradeNudgeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-2xl border-2 border-primary-500 p-6 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-bold text-gray-900">Remove Watermark</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upgrade to create professional, watermark-free exports
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span>No watermark on all exports</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span>2.5x more credits (150 min/month)</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span>All premium features unlocked</span>
        </div>
      </div>

      <Link
        href="/pricing"
        className="block w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
      >
        Upgrade to Starter - $29/mo
      </Link>

      <p className="text-xs text-center text-gray-500 mt-3">
        30-day money-back guarantee
      </p>
    </div>
  );
}
