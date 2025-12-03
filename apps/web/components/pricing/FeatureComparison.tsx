'use client';

import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

const FEATURES: Feature[] = [
  { name: 'Monthly Credits', free: '60', starter: '150', pro: '300', business: 'Unlimited' },
  { name: 'Video Processing', free: true, starter: true, pro: true, business: true },
  { name: 'AI Clips Detection', free: true, starter: true, pro: true, business: true },
  { name: 'Watermark', free: 'Yes', starter: 'No', pro: 'No', business: 'No' },
  { name: 'HD Exports (1080p)', free: false, starter: true, pro: true, business: true },
  { name: '4K Exports', free: false, starter: false, pro: true, business: true },
  { name: 'AI Subtitles', free: true, starter: true, pro: true, business: true },
  { name: 'AI Reframe', free: true, starter: true, pro: true, business: true },
  { name: 'Caption Styles', free: '5 basic', starter: '14 styles', pro: '20+ styles', business: '20+ styles' },
  { name: 'Multi-segment Clips', free: false, starter: false, pro: true, business: true },
  { name: 'Priority Processing', free: false, starter: false, pro: true, business: true },
  { name: 'Team Workspace', free: false, starter: false, pro: true, business: true },
  { name: 'Brand Templates', free: false, starter: false, pro: true, business: true },
  { name: 'API Access', free: false, starter: false, pro: false, business: true },
  { name: 'Custom Integrations', free: false, starter: false, pro: false, business: true },
  { name: 'Dedicated Support', free: false, starter: false, pro: false, business: true },
];

interface FeatureComparisonProps {
  highlightTier?: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
  compact?: boolean;
}

export default function FeatureComparison({ highlightTier, compact = false }: FeatureComparisonProps) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    
    if (value === 'Yes') {
      return <span className="text-red-600 font-medium">Yes</span>;
    }
    
    if (value === 'No') {
      return <Check className="w-5 h-5 text-green-600 mx-auto" />;
    }
    
    return <span className="font-medium text-gray-900">{value}</span>;
  };

  const getTierClass = (tier: string) => {
    if (highlightTier && tier.toUpperCase() === highlightTier) {
      return 'bg-blue-50 border-2 border-blue-500';
    }
    return 'bg-gray-50';
  };

  if (compact) {
    // Compact version for modals
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">FREE</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">STARTER</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">PRO</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">BUSINESS</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.slice(0, 10).map((feature, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">{feature.name}</td>
                <td className="py-3 px-4 text-center">{renderValue(feature.free)}</td>
                <td className="py-3 px-4 text-center">{renderValue(feature.starter)}</td>
                <td className="py-3 px-4 text-center">{renderValue(feature.pro)}</td>
                <td className="py-3 px-4 text-center">{renderValue(feature.business)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Full version for pricing page
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Features</th>
              <th className={`text-center py-4 px-6 ${getTierClass('FREE')}`}>
                <div className="font-bold text-gray-900 text-lg">FREE</div>
                <div className="text-sm text-gray-600 mt-1">$0/month</div>
              </th>
              <th className={`text-center py-4 px-6 ${getTierClass('STARTER')}`}>
                <div className="font-bold text-gray-900 text-lg">STARTER</div>
                <div className="text-sm text-gray-600 mt-1">$29/month</div>
              </th>
              <th className={`text-center py-4 px-6 ${getTierClass('PRO')}`}>
                <div className="font-bold text-gray-900 text-lg">PRO</div>
                <div className="text-sm text-gray-600 mt-1">$79/month</div>
              </th>
              <th className={`text-center py-4 px-6 ${getTierClass('BUSINESS')}`}>
                <div className="font-bold text-gray-900 text-lg">BUSINESS</div>
                <div className="text-sm text-gray-600 mt-1">$99/month</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6 text-gray-700 font-medium">{feature.name}</td>
                <td className={`py-4 px-6 text-center ${getTierClass('FREE')}`}>
                  {renderValue(feature.free)}
                </td>
                <td className={`py-4 px-6 text-center ${getTierClass('STARTER')}`}>
                  {renderValue(feature.starter)}
                </td>
                <td className={`py-4 px-6 text-center ${getTierClass('PRO')}`}>
                  {renderValue(feature.pro)}
                </td>
                <td className={`py-4 px-6 text-center ${getTierClass('BUSINESS')}`}>
                  {renderValue(feature.business)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <a
              href="/sign-up"
              className="block px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Start Free
            </a>
          </div>
          <div className="text-center">
            <a
              href="/pricing"
              className="block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get STARTER
            </a>
          </div>
          <div className="text-center">
            <a
              href="/pricing"
              className="block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Get PRO
            </a>
          </div>
          <div className="text-center">
            <a
              href="/pricing"
              className="block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors"
            >
              Get BUSINESS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
