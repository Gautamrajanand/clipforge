'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import {
  Users,
  Gift,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface PLGStats {
  referrals: {
    total: number;
    pending: number;
    completed: number;
    rewarded: number;
    creditsDistributed: number;
    conversionRate: number;
  };
  onboarding: {
    totalUsers: number;
    completed: number;
    completionRate: number;
    averageSteps: number;
  };
}

export default function AdminPLGDashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<PLGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [referralData, onboardingData] = await Promise.all([
        fetchWithAuth('/admin/plg/referrals/overview', getToken),
        fetchWithAuth('/admin/plg/onboarding/stats', getToken),
      ]);

      setStats({
        referrals: {
          total: referralData.totalReferrals || 0,
          pending: referralData.pendingReferrals || 0,
          completed: referralData.completedReferrals || 0,
          rewarded: referralData.rewardedReferrals || 0,
          creditsDistributed: referralData.totalCreditsDistributed || 0,
          conversionRate: referralData.conversionRate || 0,
        },
        onboarding: {
          totalUsers: onboardingData.totalUsers || 0,
          completed: onboardingData.completedOnboarding || 0,
          completionRate: onboardingData.completionRate || 0,
          averageSteps: onboardingData.averageStepsCompleted || 0,
        },
      });
    } catch (err: any) {
      console.error('Failed to load PLG stats:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PLG Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PLG Growth Engine Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and control all Product-Led Growth features
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Referrals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.referrals.total || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Referrals</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.referrals.pending || 0} pending
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.referrals.conversionRate.toFixed(1) || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.referrals.completed || 0} completed
            </p>
          </div>

          {/* Credits Distributed */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.referrals.creditsDistributed || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Credits Given</h3>
            <p className="text-xs text-gray-500 mt-1">
              Via referral program
            </p>
          </div>

          {/* Onboarding Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.onboarding.completionRate.toFixed(1) || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Onboarding Rate</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.onboarding.completed || 0} completed
            </p>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Program */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Referral Program
                  </h2>
                  <p className="text-sm text-gray-600">
                    Viral growth engine performance
                  </p>
                </div>
                <Link
                  href="/admin/plg/referrals"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.referrals.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.referrals.completed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Rewarded</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.referrals.rewarded || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Onboarding System */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Onboarding System
                  </h2>
                  <p className="text-sm text-gray-600">
                    User activation tracking
                  </p>
                </div>
                <Link
                  href="/admin/plg/onboarding"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Total Users</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.onboarding.totalUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.onboarding.completed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-700">Avg Steps</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.onboarding.averageSteps.toFixed(1) || 0} / 7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional PLG Features */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Additional PLG Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">In-App Messaging</h3>
              <p className="text-sm text-gray-600 mb-3">
                Intercom integration for user engagement
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Needs Configuration
              </span>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">NPS & Feedback</h3>
              <p className="text-sm text-gray-600 mb-3">
                Delighted surveys for user satisfaction
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Needs Configuration
              </span>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600 mb-3">
                PostHog, Hotjar, GA4 tracking
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Needs Configuration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
