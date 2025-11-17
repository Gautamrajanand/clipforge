'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';

const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 9,
    priceYearly: 9,
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
    price: 9.5,
    priceYearly: 114, // $9.5/mo billed annually
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
    price: null,
    priceYearly: null,
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

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
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upgrade your plan
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Choose the perfect plan for your content creation needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-primary-400">(up to 50% off)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PRICING_TIERS.starter.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'yearly' ? PRICING_TIERS.starter.priceYearly : PRICING_TIERS.starter.price}
                </span>
                <span className="text-gray-400">USD</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-gray-400">
                  ${PRICING_TIERS.starter.priceYearly * 12} billed annually
                </p>
              )}
            </div>

            <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors mb-6">
              Get Starter
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro - Most Popular */}
          <div className="bg-gray-800 rounded-2xl p-8 border-2 border-primary-500 hover:border-primary-400 transition-all relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PRICING_TIERS.pro.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'yearly' ? '9.5' : PRICING_TIERS.pro.price}
                </span>
                <span className="text-gray-400">USD</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-gray-400">
                  ${PRICING_TIERS.pro.priceYearly} billed annually
                </p>
              )}
            </div>

            <button className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors mb-6 flex items-center justify-center gap-2">
              Get Pro
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PRICING_TIERS.business.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">Let's talk</span>
              </div>
              <p className="text-sm text-gray-400">
                Fit for business, dressed in a tux
              </p>
            </div>

            <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors mb-6">
              Contact us
            </button>

            <div className="space-y-3">
              {PRICING_TIERS.business.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free Plan Info */}
        <div className="mt-16 max-w-3xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Currently on Free Plan</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">What you get:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
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
              <h4 className="font-semibold mb-3 text-gray-300">Limitations:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
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
          <p className="text-gray-400">
            Questions about pricing?{' '}
            <Link href="/help" className="text-primary-500 hover:text-primary-400">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
