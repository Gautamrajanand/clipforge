'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Loader2,
  Key,
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  tier: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  credits: number;
  creditsUsedThisMonth: number;
  creditsResetDate: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  invoiceUrl?: string;
  pdfUrl?: string;
}

const TIER_FEATURES = {
  FREE: {
    name: 'Free',
    price: '$0',
    credits: 60,
    features: [
      '60 minutes per month',
      'AI Clips with watermark',
      'Basic captions',
      '48-hour project storage',
      'Community support',
    ],
  },
  STARTER: {
    name: 'Starter',
    price: '$29',
    credits: 150,
    features: [
      '150 minutes per month',
      'No watermark',
      'AI Clips + Reframe + Subtitles',
      '14 caption styles',
      '90-day project storage',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: '$79',
    credits: 300,
    features: [
      '300 minutes per month',
      'Everything in Starter',
      'Pro Clips (multi-segment)',
      'Advanced framing',
      'Unlimited project storage',
      'Priority support',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: '$99',
    credits: 500,
    features: [
      '500 minutes per month',
      'Everything in Pro',
      'API access',
      'Team collaboration',
      'Custom branding',
      'Dedicated support',
    ],
  },
};

export default function BillingPage() {
  const { getToken } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch organization data
      const orgResponse = await fetchWithAuth('/v1/organizations/current', {
        method: 'GET',
        token,
      });
      setOrg(orgResponse);

      // Fetch invoices if user has subscription
      if (orgResponse.stripeCustomerId || orgResponse.razorpayCustomerId) {
        try {
          const invoicesResponse = await fetchWithAuth('/v1/payments/invoices', {
            method: 'GET',
            token,
          });
          setInvoices(invoicesResponse.invoices || []);
        } catch (err) {
          console.error('Failed to load invoices:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setManagingBilling(true);
      const token = await getToken();
      
      const response = await fetchWithAuth('/v1/payments/portal', {
        method: 'POST',
        token,
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setManagingBilling(false);
    }
  };

  const handleUpgrade = (tier: string) => {
    window.location.href = `/pricing?upgrade=${tier}`;
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to paid features at the end of your billing period.')) {
      return;
    }

    try {
      const token = await getToken();
      await fetchWithAuth('/v1/payments/cancel', {
        method: 'POST',
        token,
      });
      
      alert('Subscription canceled successfully. You will retain access until the end of your billing period.');
      loadBillingData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load billing information</p>
        </div>
      </div>
    );
  }

  const currentTier = TIER_FEATURES[org.tier];
  const creditsUsedPercent = (org.creditsUsedThisMonth / currentTier.credits) * 100;
  const creditsRemaining = currentTier.credits - org.creditsUsedThisMonth;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">Manage your subscription, credits, and billing information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Plan & Credits */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {org.tier === 'FREE' ? 'You are on the free plan' : `Active subscription`}
                  </p>
                </div>
                {org.tier !== 'FREE' && org.subscriptionStatus === 'active' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentTier.name}</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{currentTier.price}<span className="text-lg text-gray-600">/month</span></p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-primary-500 opacity-50" />
                </div>

                {org.currentPeriodEnd && (
                  <div className="mt-4 flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Renews on {new Date(org.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Plan Features:</h4>
                {currentTier.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {org.tier === 'FREE' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleUpgrade('STARTER')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    Upgrade to Starter
                    <ArrowUpRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {org.tier !== 'FREE' && org.tier !== 'BUSINESS' && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => handleUpgrade(org.tier === 'STARTER' ? 'PRO' : 'BUSINESS')}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {managingBilling ? 'Loading...' : 'Manage Billing'}
                  </button>
                </div>
              )}
            </div>

            {/* Credit Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Usage</h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {creditsRemaining} minutes remaining
                  </span>
                  <span className="text-sm text-gray-600">
                    {org.creditsUsedThisMonth} / {currentTier.credits} used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      creditsUsedPercent > 90
                        ? 'bg-red-500'
                        : creditsUsedPercent > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(creditsUsedPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Monthly Allowance</p>
                  <p className="text-2xl font-bold text-gray-900">{currentTier.credits}</p>
                  <p className="text-xs text-gray-500 mt-1">minutes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Resets On</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(org.creditsResetDate).getDate()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(org.creditsResetDate).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                </div>
              </div>

              {creditsRemaining < 20 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Running low on credits</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Consider upgrading to get more minutes per month
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/credits"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                >
                  View detailed credit history
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Billing History */}
            {invoices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {invoice.currency === 'USD' ? '$' : '₹'}
                            {(invoice.amount / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {invoice.pdfUrl && (
                              <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Payment Method */}
            {org.tier !== 'FREE' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="flex items-center mb-4">
                  <CreditCard className="w-10 h-10 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {org.stripeCustomerId ? 'Stripe' : 'Razorpay'}
                    </p>
                    <p className="text-xs text-gray-600">•••• •••• •••• ••••</p>
                  </div>
                </div>
                <button
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {managingBilling ? 'Loading...' : 'Update Payment Method'}
                </button>
              </div>
            )}

            {/* API Access */}
            {org.tier === 'BUSINESS' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your API keys and integrate ClipForge into your workflow
                </p>
                <Link
                  href="/dashboard/api-keys"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Manage API Keys
                </Link>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="block text-sm text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  View all plans
                </Link>
                <Link
                  href="/credits"
                  className="block text-sm text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Credit history
                </Link>
                <Link
                  href="/subscription"
                  className="block text-sm text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Subscription details
                </Link>
                <a
                  href="mailto:support@clipforge.ai"
                  className="block text-sm text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Contact support
                </a>
              </div>
            </div>

            {/* Cancel Subscription */}
            {org.tier !== 'FREE' && org.subscriptionStatus === 'active' && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You'll retain access until the end of your billing period
                </p>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
