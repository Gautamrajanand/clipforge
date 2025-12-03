'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

interface LockedFeatureProps {
  featureName: string;
  requiredTier: 'STARTER' | 'PRO' | 'BUSINESS';
  benefit: string;
  children?: React.ReactNode;
  className?: string;
}

export default function LockedFeature({
  featureName,
  requiredTier,
  benefit,
  children,
  className = '',
}: LockedFeatureProps) {
  const handleUpgradeClick = () => {
    analytics.track(AnalyticsEvents.UPGRADE_PROMPT_CLICKED, {
      source: 'locked_feature',
      feature: featureName,
      requiredTier,
    });
  };

  const tierColors = {
    STARTER: 'from-blue-600 to-cyan-600',
    PRO: 'from-purple-600 to-pink-600',
    BUSINESS: 'from-orange-600 to-red-600',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 to-gray-100/95 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          {/* Lock Icon */}
          <div className={`w-16 h-16 bg-gradient-to-br ${tierColors[requiredTier]} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Lock className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🔒 {requiredTier} Feature
          </h3>

          {/* Feature Name */}
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {featureName}
          </p>

          {/* Benefit */}
          <p className="text-sm text-gray-600 mb-6">
            {benefit}
          </p>

          {/* Upgrade Button */}
          <Link
            href="/pricing"
            onClick={handleUpgradeClick}
            className={`inline-block px-6 py-3 bg-gradient-to-r ${tierColors[requiredTier]} text-white font-semibold rounded-lg hover:shadow-xl transition-all transform hover:scale-105`}
          >
            Upgrade to {requiredTier}
          </Link>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            Unlock this and more premium features
          </p>
        </div>
      </div>

      {/* Grayed out content */}
      <div className="opacity-30 pointer-events-none blur-sm">
        {children}
      </div>
    </div>
  );
}
