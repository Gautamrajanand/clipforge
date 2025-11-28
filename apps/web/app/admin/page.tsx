'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    paid: number;
    recentSignups: number;
  };
  organizations: {
    total: number;
    tierDistribution: Record<string, number>;
  };
  projects: {
    total: number;
    byStatus: Record<string, number>;
  };
  content: {
    totalClips: number;
    totalExports: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  credits: {
    total: number;
    average: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    loadDashboardStats();
  }, [isLoaded, isSignedIn]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('http://localhost:3000/admin/dashboard', {
        method: 'GET',
        getToken: getClerkToken,
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (response.status === 401) {
          setError('Authentication required. Please sign in again.');
        } else {
          setError(`Failed to load dashboard stats: ${errorData.message || response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(`Failed to load dashboard stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={loadDashboardStats}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Monitor your ClipForge application</p>
            </div>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.users.active} active (7d)
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Paid Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.paid}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((stats.users.paid / stats.users.total) * 100).toFixed(1)}% conversion
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.projects.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.content.totalClips} clips generated
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${(stats.revenue.total / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.revenue.currency}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.organizations.tierDistribution).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      tier === 'FREE' ? 'bg-gray-400' :
                      tier === 'STARTER' ? 'bg-blue-500' :
                      tier === 'PRO' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-700">{tier}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
            <div className="space-y-3">
              {Object.entries(stats.projects.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      status === 'READY' ? 'bg-green-500' :
                      status === 'PENDING' ? 'bg-yellow-500' :
                      status === 'FAILED' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credits Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.credits.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average per Org</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.credits.average}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.content.totalExports.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
