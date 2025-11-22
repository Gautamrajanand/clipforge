'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { usePageTracking } from '@/hooks/useAnalytics';
import { trackCheckoutInitiated } from '@/lib/analytics';

// Note: Since this is a client component, metadata should be set in layout or use next/head
// For now, we'll add it via the parent layout's template feature

const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceYearly: 24, // $24/mo when billed annually ($288/year)
    credits: 150,
    popular: false,
    features: [
      { text: 'Up to 1 Brand template', included: true },
      { text: '150 credits', included: true },
      { text: 'AI clipping with Virality Score', included: true },
      { text: 'AI animated captions in 20+ languages', included: true },
      { text: 'Auto-post to YouTube Shorts, TikTok, IG Reels, or download', included: true },
      { text: 'Powerful editor', included: true },
      { text: '1 brand template', included: true },
      { text: 'Filler & silence removal', included: true },
      { text: 'Remove Watermark', included: true },
    ],
  },
  pro: {
    name: 'Pro',
    price: 79,
    priceYearly: 66, // $66/mo when billed annually ($792/year)
    credits: 3600,
    creditsMonthly: 300,
    popular: true,
    features: [
      { text: 'Up to 2 Brand template', included: true },
      { text: '3,600 credits per year, available instantly', included: true },
      { text: 'Team workspace with 2 seats. Upgrade to support up to 4 seats', included: true },
      { text: '2 brand templates', included: true },
      { text: '5 social media connections', included: true },
      { text: 'AI B-Roll', included: true },
      { text: 'Input from 10+ sources', included: true },
      { text: 'Export to Adobe Premiere Pro & DaVinci Resolve', included: true },
      { text: 'Multiple aspect ratios (9:16, 1:1, 16:9)', included: true },
      { text: 'Social media scheduler', included: true },
      { text: 'Intercom chat support', included: true },
      { text: 'Custom fonts', included: true },
      { text: 'Speech enhancement', included: true },
    ],
  },
  business: {
    name: 'Business',
    price: 99,
    priceYearly: 83, // $83/mo when billed annually ($996/year)
    credits: 'Custom',
    popular: false,
    features: [
      { text: 'Custom solutions for brand template', included: true },
      { text: 'Everything in Pro plan, plus:', included: true },
      { text: 'Priority project processing', included: true },
      { text: 'Customized credits and team seats', included: true },
      { text: 'Tailored business assets: brand templates, fonts, vocabulary, social media connections & more', included: true },
      { text: 'Dedicated storage', included: true },
      { text: 'API & custom integrations', included: true },
      { text: 'Master Service Agreement (MSA)', included: true },
      { text: 'Priority support with a dedicated Slack channel', included: true },
      { text: 'Enterprise-level security', included: true },
    ],
  },
};

export default function PricingPage() {
  const { isSignedIn, getToken: getClerkToken } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  
  // Track pricing page view
  usePageTracking('Pricing');

  const handleUpgrade = async (tier: 'STARTER' | 'PRO' | 'BUSINESS') => {
    if (!isSignedIn) {
      window.location.href = '/sign-in?redirect_url=/pricing';
      return;
    }

    try {
      setLoading(tier);
      
      // Track checkout initiation
      const tierPrices = { STARTER: 29, PRO: 79, BUSINESS: 99 };
      trackCheckoutInitiated(tier, tierPrices[tier]);
      
      const response = await fetchWithAuth('http://localhost:3000/v1/payments/checkout', {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          interval: billingCycle,
          gateway: 'stripe', // Default to Stripe, can add gateway selection later
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Checkout error:', error);
        alert('Failed to create checkout session. Please try again.');
        return;
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ClipForge</span>
          </Link>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Title */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
            Upgrade your plan
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
            Choose the perfect plan for your content creation needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 lg:gap-3 bg-white rounded-full p-1 border border-gray-200 shadow-sm text-sm lg:text-base">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-primary-600">(up to 50% off)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PRICING_TIERS.starter.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'yearly' ? PRICING_TIERS.starter.priceYearly : PRICING_TIERS.starter.price}
                </span>
                <span className="text-gray-600">USD</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-gray-600">
                  ${PRICING_TIERS.starter.priceYearly * 12} billed annually
                </p>
              )}
            </div>

            <button 
              onClick={() => handleUpgrade('STARTER')}
              disabled={loading === 'STARTER'}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mb-6"
            >
              {loading === 'STARTER' ? 'Loading...' : 'Get Starter'}
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro - Most Popular */}
          <div className="bg-white rounded-2xl p-8 border-2 border-primary-500 hover:border-primary-400 transition-all relative shadow-lg">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PRICING_TIERS.pro.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'yearly' ? PRICING_TIERS.pro.priceYearly : PRICING_TIERS.pro.price}
                </span>
                <span className="text-gray-600">USD</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-gray-600">
                  ${PRICING_TIERS.pro.priceYearly} billed annually
                </p>
              )}
            </div>

            <button 
              onClick={() => handleUpgrade('PRO')}
              disabled={loading === 'PRO'}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mb-6 flex items-center justify-center gap-2"
            >
              {loading === 'PRO' ? 'Loading...' : (
                <>
                  Get Pro
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{PRICING_TIERS.business.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'yearly' ? PRICING_TIERS.business.priceYearly : PRICING_TIERS.business.price}
                </span>
                <span className="text-gray-600">USD</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-gray-600">
                  ${(PRICING_TIERS.business.priceYearly || 0) * 12} billed annually
                </p>
              )}
            </div>

            <button 
              onClick={() => handleUpgrade('BUSINESS')}
              disabled={loading === 'BUSINESS'}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mb-6"
            >
              {loading === 'BUSINESS' ? 'Loading...' : 'Get Business'}
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.business.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free Plan Info */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Currently on Free Plan</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What you get:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  60 processing credits per month
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  Up to 1080p rendered clips
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  Auto reframe
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  AI captions with emoji and keyword highlighter
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  Has watermark
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  No editing
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  Projects expire after 48 hours
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  Limited to 60 credits per month
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions about pricing?{' '}
            <Link href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
