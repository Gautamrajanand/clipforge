'use client';

import { X, Zap, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'credits_low' | 'credits_depleted' | 'feature_locked' | 'export_limit' | 'quality_upgrade';
  currentTier: 'FREE' | 'STARTER' | 'PRO';
  creditsRemaining?: number;
}

/**
 * Upgrade Modal Component
 * Smart, contextual upgrade prompts
 * 
 * Features:
 * - Trigger-specific messaging
 * - Tier-appropriate recommendations
 * - Clear value propositions
 * - Social proof
 * - Easy dismissal
 */

const UPGRADE_CONTENT = {
  credits_low: {
    title: "You're Running Low on Credits! 🔥",
    subtitle: "Don't let your momentum stop",
    description: "You've created amazing clips. Upgrade now to keep going without interruption.",
    urgency: "high",
    cta: "Upgrade to Continue",
  },
  credits_depleted: {
    title: "Out of Credits! 😅",
    subtitle: "Your clips are waiting",
    description: "You've used all your credits this month. Upgrade to get back to creating viral content.",
    urgency: "critical",
    cta: "Get More Credits Now",
  },
  feature_locked: {
    title: "Unlock Pro Features 🚀",
    subtitle: "Take your content to the next level",
    description: "This feature is available on paid plans. Upgrade to access advanced tools and grow faster.",
    urgency: "medium",
    cta: "Unlock This Feature",
  },
  export_limit: {
    title: "Export Limit Reached 📊",
    subtitle: "You're creating great content!",
    description: "You've hit your export limit. Upgrade to export unlimited clips and scale your content.",
    urgency: "high",
    cta: "Upgrade for Unlimited",
  },
  quality_upgrade: {
    title: "Want Better Quality? ✨",
    subtitle: "Professional results await",
    description: "Upgrade to access 4K exports, priority processing, and advanced caption styles.",
    urgency: "low",
    cta: "Upgrade to Pro",
  },
};

const TIER_BENEFITS = {
  STARTER: [
    "150 credits/month (2.5x more)",
    "No watermark",
    "Priority processing",
    "Advanced caption styles",
    "Email support",
  ],
  PRO: [
    "300 credits/month (5x more)",
    "Everything in Starter",
    "4K exports",
    "Team workspace",
    "Brand templates",
    "Priority support",
  ],
};

export default function UpgradeModal({
  isOpen,
  onClose,
  trigger,
  currentTier,
  creditsRemaining = 0,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const content = UPGRADE_CONTENT[trigger];
  const recommendedTier = currentTier === 'FREE' ? 'STARTER' : 'PRO';
  const benefits = TIER_BENEFITS[recommendedTier];
  const price = recommendedTier === 'STARTER' ? 29 : 79;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {content.title}
              </h2>
              <p className="text-indigo-100 text-lg">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <p className="text-gray-700 text-lg mb-6">
            {content.description}
          </p>

          {/* Current Status */}
          {trigger === 'credits_low' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">
                  Only {creditsRemaining} credits remaining
                </span>
              </div>
            </div>
          )}

          {trigger === 'credits_depleted' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold">
                  0 credits remaining • Resets in {Math.ceil((new Date().getDate() - new Date().getDate()) + 30)} days
                </span>
              </div>
            </div>
          )}

          {/* Recommended Plan */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Recommended
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {recommendedTier}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">
                  ${price}
                </div>
                <div className="text-sm text-gray-600">
                  per month
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>
                <strong>2,847 creators</strong> upgraded this month
              </span>
            </div>
            <p className="text-xs text-gray-500 italic">
              "Best investment I made for my content business. Paid for itself in the first week!" - Sarah C.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                {content.cta}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>

            <button
              onClick={onClose}
              className="block w-full text-gray-600 text-center py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Guarantee */}
          <p className="text-center text-sm text-gray-500 mt-4">
            💯 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
