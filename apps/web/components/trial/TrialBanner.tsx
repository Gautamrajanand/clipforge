'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TrialBannerProps {
  isActive: boolean;
  daysLeft: number;
  onDismiss?: () => void;
}

export default function TrialBanner({ isActive, daysLeft, onDismiss }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if not in trial or dismissed
  if (!isActive || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Color based on days left
  const getColorClasses = () => {
    if (daysLeft <= 1) {
      return 'bg-gradient-to-r from-red-500 to-pink-500';
    } else if (daysLeft <= 3) {
      return 'bg-gradient-to-r from-orange-500 to-yellow-500';
    } else {
      return 'bg-gradient-to-r from-blue-500 to-purple-500';
    }
  };

  return (
    <div className={`${getColorClasses()} text-white shadow-lg fixed top-0 left-64 right-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm lg:text-base">
                {daysLeft === 1 ? (
                  <>🔥 Last day of your FREE TRIAL!</>
                ) : daysLeft <= 3 ? (
                  <>⏰ Only {daysLeft} days left in your FREE TRIAL</>
                ) : (
                  <>🎉 You're on a 7-day FREE TRIAL ({daysLeft} days left)</>
                )}
              </p>
              <p className="text-xs lg:text-sm opacity-90 mt-0.5 hidden sm:block">
                Enjoying ClipForge? Upgrade to keep all features.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/subscription">
              <button className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
