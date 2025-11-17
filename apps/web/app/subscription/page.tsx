'use client';

import Link from 'next/link';
import { Sparkles, Zap, Check, X, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function SubscriptionPage() {
  const { user } = useAuth();

  const planFeatures = {
    FREE: [
      { text: '60 processing credits per month', included: true },
      { text: 'Up to 1080p rendered clips', included: true },
      { text: 'Auto reframe', included: true },
      { text: 'AI captions with emoji and keyword highlighter', included: true },
      { text: 'Has watermark', included: false },
      { text: 'No editing', included: false },
      { text: 'Projects expire after 48 hours', included: false },
    ],
    STARTER: [
      { text: '150 processing credits per month', included: true },
      { text: 'AI clipping with Virality Score', included: true },
      { text: 'AI animated captions in 20+ languages', included: true },
      { text: 'Powerful editor', included: true },
      { text: 'Remove Watermark', included: true },
      { text: 'Filler & silence removal', included: true },
      { text: 'Projects never expire', included: true },
    ],
    PRO: [
      { text: '3,600 credits per year, available instantly', included: true },
      { text: 'Team workspace with 2 seats', included: true },
      { text: '2 brand templates', included: true },
      { text: '5 social media connections', included: true },
      { text: 'Multiple aspect ratios (9:16, 1:1, 16:9)', included: true },
      { text: 'Social media scheduler', included: true },
      { text: 'Custom fonts', included: true },
      { text: 'Speech enhancement', included: true },
    ],
  };

  const features = planFeatures[user?.planType || 'FREE'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ClipForge</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Subscription</h1>

        {/* Current Plan Card */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {user?.planType === 'FREE' ? 'Free Plan' : `${user?.planType} Plan`}
              </h2>
              <div className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
            {user?.planType === 'FREE' && (
              <Link
                href="/pricing"
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Email account</div>
              <div className="text-white font-medium">{user?.email || 'user@example.com'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Current balance</div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-bold">{user?.creditBalance || 0}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Next cycle credits</div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-bold">{user?.creditsPerMonth || 60}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Resets on</div>
              <div className="text-white font-medium">
                {new Date(user?.nextCreditReset || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-700">
            <div>
              <div className="text-sm text-gray-400 mb-1">Packs</div>
              <div className="text-white font-medium">1</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Seats</div>
              <div className="text-white font-medium">
                {user?.planType === 'FREE' ? '1/1' : user?.planType === 'PRO' ? '1/2' : '1/1'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Brand Templates</div>
              <div className="text-white font-medium">
                {user?.planType === 'FREE' ? '1/1' : user?.planType === 'PRO' ? '1/2' : '1/1'}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Features</h3>
            <Link
              href="/pricing"
              className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1"
            >
              Compare plans
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500'}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing & Payment Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-6">Billing & Payment</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Next payment</span>
              <span className="text-white font-medium">
                {user?.planType === 'FREE' ? '$0 / mo' : user?.planType === 'STARTER' ? '$9 / mo' : '$9.5 / mo'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Renewal period</span>
              <span className="text-white font-medium">Monthly</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Renew date</span>
              <span className="text-white font-medium">
                {new Date(user?.nextCreditReset || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {user?.planType !== 'FREE' && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button className="text-red-500 hover:text-red-400 text-sm font-medium">
                Cancel subscription
              </button>
            </div>
          )}
        </div>

        {/* Upgrade CTA for Free Users */}
        {user?.planType === 'FREE' && (
          <div className="mt-8 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-8 border border-primary-500/30">
            <h3 className="text-2xl font-bold mb-2">Ready to unlock more?</h3>
            <p className="text-gray-300 mb-6">
              Upgrade to Pro and get 300 credits per month, no watermarks, team collaboration, and much more.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              View Plans
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
