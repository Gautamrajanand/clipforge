'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Lock Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {feature} is a Pro Feature
          </h2>
          <p className="text-lg text-gray-600">
            {description || `Upgrade your account now to access powerful ${feature.toLowerCase()} for all your content needs.`}
          </p>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg p-6 mb-6 text-left">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Pro Plan Includes:
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>300 credits per month (3,600/year)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>No watermarks on exports</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Projects never expire</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Social media scheduler</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Team workspace (2 seats)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 
                     text-gray-900 font-semibold rounded-lg transition-colors shadow-lg"
          >
            Upgrade to Pro
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 
                     bg-white hover:bg-gray-100 text-gray-700 font-medium 
                     rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Questions? <Link href="/help" className="text-primary-500 hover:text-primary-400">Contact support</Link>
        </p>
      </div>
    </div>
  );
}
