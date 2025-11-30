'use client';

import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface UpgradeBannerProps {
  message: string;
  cta: string;
  variant: 'info' | 'warning' | 'success';
  dismissible?: boolean;
}

/**
 * Upgrade Banner Component
 * Non-intrusive upgrade prompts
 * 
 * Features:
 * - Multiple variants (info, warning, success)
 * - Dismissible
 * - Sticky positioning
 * - Clear CTA
 */

export default function UpgradeBanner({
  message,
  cta,
  variant = 'info',
  dismissible = true,
}: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantStyles = {
    info: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
  };

  return (
    <div className={`${variantStyles[variant]} text-white py-3 px-4 sticky top-0 z-40 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Icon */}
        <Sparkles className="w-5 h-5 flex-shrink-0" />

        {/* Message */}
        <p className="flex-1 text-sm font-medium">
          {message}
        </p>

        {/* CTA */}
        <Link
          href="/pricing"
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Dismiss */}
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
