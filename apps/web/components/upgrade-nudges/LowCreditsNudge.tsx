'use client';

import { useState } from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LowCreditsNudgeProps {
  creditsRemaining: number;
  creditsTotal: number;
  onDismiss?: () => void;
}

export default function LowCreditsNudge({ 
  creditsRemaining, 
  creditsTotal,
  onDismiss 
}: LowCreditsNudgeProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const percentageRemaining = (creditsRemaining / creditsTotal) * 100;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Only show when credits are low (< 20%)
  if (isDismissed || percentageRemaining >= 20) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Zap className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-yellow-900">
            Running Low on Credits
          </h3>
          <p className="text-sm text-yellow-800 mt-1">
            You have <strong>{creditsRemaining} minutes</strong> remaining this month. 
            Upgrade to get 2.5-5x more credits and never run out!
          </p>
          
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Plans
            </Link>
            <Link
              href="/credits"
              className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
            >
              View Usage →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
