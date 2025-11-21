'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  CreditCard,
  Check,
  Zap,
  ArrowLeft,
  Globe,
  IndianRupee,
  DollarSign,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface PricingPlan {
  stripe: {
    monthly: { amount: number; currency: string };
    yearly: { amount: number; currency: string };
  };
  razorpay: {
    monthly: { amount: number; currency: string };
    yearly: { amount: number; currency: string };
  };
}

interface Pricing {
  STARTER: PricingPlan;
  PRO: PricingPlan;
  BUSINESS: PricingPlan;
}

const FEATURES = {
  STARTER: [
    '300 minutes per month',
    '3 API keys',
    '30 requests per minute',
    'AI clipping with Virality Score',
    'Animated captions in 20+ languages',
    'Powerful editor',
    'Filler & silence removal',
  ],
  PRO: [
    '1000 minutes per month',
    '10 API keys',
    '100 requests per minute',
    'Everything in Starter',
    'Team workspace (2 seats)',
    'AI B-Roll',
    'Multiple aspect ratios',
    'Social media scheduler',
    'Priority support',
  ],
  BUSINESS: [
    '5000 minutes per month',
    '50 API keys',
    '500 requests per minute',
    'Everything in Pro',
    'Team workspace (10 seats)',
    'Custom branding',
    'Dedicated account manager',
    'SLA guarantee',
    'Advanced analytics',
  ],
};

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with real auth when implemented
    console.log('Billing page - Using mock data (no real auth yet)');
    
    // Set mock pricing data
    setPricing({
      STARTER: {
        stripe: { monthly: { amount: 19, currency: 'USD' }, yearly: { amount: 190, currency: 'USD' } },
        razorpay: { monthly: { amount: 1499, currency: 'INR' }, yearly: { amount: 14990, currency: 'INR' } },
      },
      PRO: {
        stripe: { monthly: { amount: 49, currency: 'USD' }, yearly: { amount: 490, currency: 'USD' } },
        razorpay: { monthly: { amount: 3999, currency: 'INR' }, yearly: { amount: 39990, currency: 'INR' } },
      },
      BUSINESS: {
        stripe: { monthly: { amount: 99, currency: 'USD' }, yearly: { amount: 990, currency: 'USD' } },
        razorpay: { monthly: { amount: 7999, currency: 'INR' }, yearly: { amount: 79990, currency: 'INR' } },
      },
    });
    setLoading(false);
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/v1/payments/pricing');
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: 'STARTER' | 'PRO' | 'BUSINESS') => {
    if (!token) {
      alert('Please log in to subscribe');
      return;
    }

    try {
      setProcessingPlan(tier);
      const response = await fetch('http://localhost:3000/v1/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          interval,
          gateway,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to checkout
        window.location.href = data.url;
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      alert('Failed to create checkout session');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/v1/payments/portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  const getPrice = (tier: keyof Pricing) => {
    if (!pricing) return { amount: 0, currency: 'USD' };
    return pricing[tier][gateway][interval];
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString()}`;
    }
    return `$${amount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the perfect plan for your needs
                </p>
              </div>
            </div>
            {user?.planType !== 'FREE' && (
              <button
                onClick={handleManageBilling}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Manage Billing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gateway & Interval Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Gateway Selector */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setGateway('stripe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                gateway === 'stripe'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              Global (USD)
            </button>
            <button
              onClick={() => setGateway('razorpay')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                gateway === 'razorpay'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              India (INR)
            </button>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                interval === 'monthly'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                interval === 'yearly'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STARTER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice('STARTER').amount, getPrice('STARTER').currency)}
                </span>
                <span className="text-gray-500">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {FEATURES.STARTER.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('STARTER')}
              disabled={processingPlan === 'STARTER'}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingPlan === 'STARTER' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>

          {/* PRO */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-primary-500 p-6 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice('PRO').amount, getPrice('PRO').currency)}
                </span>
                <span className="text-gray-500">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {FEATURES.PRO.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('PRO')}
              disabled={processingPlan === 'PRO'}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingPlan === 'PRO' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>

          {/* BUSINESS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice('BUSINESS').amount, getPrice('BUSINESS').currency)}
                </span>
                <span className="text-gray-500">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {FEATURES.BUSINESS.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('BUSINESS')}
              disabled={processingPlan === 'BUSINESS'}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingPlan === 'BUSINESS' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">🌍 Global Payments (Stripe)</p>
              <p>Accepts all major credit cards worldwide. Secure checkout with Stripe.</p>
            </div>
            <div>
              <p className="font-medium mb-1">🇮🇳 India Payments (Razorpay)</p>
              <p>UPI, Cards, NetBanking, and Wallets. Optimized for Indian customers.</p>
            </div>
            <div>
              <p className="font-medium mb-1">💳 Secure & Encrypted</p>
              <p>All payments are PCI-DSS compliant and fully encrypted.</p>
            </div>
            <div>
              <p className="font-medium mb-1">🔄 Cancel Anytime</p>
              <p>No long-term contracts. Cancel your subscription anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
