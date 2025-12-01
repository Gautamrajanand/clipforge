'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Target, TrendingDown, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface OnboardingStats {
  totalUsers: number;
  completedOnboarding: number;
  completionRate: number;
  averageStepsCompleted: number;
  stepCompletionRates: Record<string, number>;
  dropOffPoints: Array<{
    step: string;
    dropOffRate: number;
    usersDropped: number;
  }>;
}

const STEP_NAMES: Record<string, string> = {
  WELCOME: '1. Welcome',
  UPLOAD_VIDEO: '2. Upload Video',
  VIEW_CLIPS: '3. View Clips',
  CUSTOMIZE_CLIP: '4. Customize Clip',
  EXPORT_CLIP: '5. Export Clip',
  SHARE_REFERRAL: '6. Share Referral',
  COMPLETED: '7. Completed',
};

export default function AdminOnboardingPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/plg/onboarding/stats', getToken);
      setStats(data);
    } catch (err) {
      console.error('Failed to load onboarding stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Onboarding Analytics
            </h1>
            <p className="text-gray-600">
              Track user activation and identify drop-off points
            </p>
          </div>
          <Link
            href="/admin/plg"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back to PLG Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold">{stats?.completedOnboarding || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold">{stats?.completionRate?.toFixed(1) || 0}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold">{stats?.averageStepsCompleted?.toFixed(1) || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Avg Steps</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step Completion Rates */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Step Completion Rates</h2>
            </div>
            <div className="p-6 space-y-4">
              {stats?.stepCompletionRates && Object.entries(stats.stepCompletionRates).map(([step, rate]) => (
                <div key={step}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{STEP_NAMES[step] || step}</span>
                    <span className="text-sm font-bold text-gray-900">{rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        rate >= 80 ? 'bg-green-500' :
                        rate >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop-off Points */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Drop-off Points</h2>
              <p className="text-sm text-gray-600 mt-1">Where users are getting stuck</p>
            </div>
            <div className="p-6 space-y-4">
              {stats?.dropOffPoints && stats.dropOffPoints.length > 0 ? (
                stats.dropOffPoints.map((dropOff, index) => (
                  <div key={dropOff.step} className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">
                        {STEP_NAMES[dropOff.step] || dropOff.step}
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {dropOff.dropOffRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {dropOff.usersDropped} users dropped off at this step
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No drop-off data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">💡 Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {stats && stats.completionRate < 50 && (
              <li>• <strong>Low completion rate:</strong> Consider simplifying the onboarding flow or adding more guidance</li>
            )}
            {stats && stats.stepCompletionRates?.UPLOAD_VIDEO < 70 && (
              <li>• <strong>Upload drop-off:</strong> Add clearer instructions or example videos</li>
            )}
            {stats && stats.stepCompletionRates?.EXPORT_CLIP < 60 && (
              <li>• <strong>Export friction:</strong> Simplify the export process or add tooltips</li>
            )}
            {stats && stats.averageStepsCompleted < 4 && (
              <li>• <strong>Early drop-off:</strong> Users aren't reaching the core value. Improve first-time experience</li>
            )}
            {stats && stats.completionRate >= 70 && (
              <li>• <strong>Great job!</strong> Your onboarding is performing well. Keep monitoring for improvements</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
