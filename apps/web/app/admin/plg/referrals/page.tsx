'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Gift, TrendingUp, Users, Award, Clock, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface ReferralData {
  id: string;
  referralCode: string;
  referrer: {
    id: string;
    name: string;
  };
  referred: {
    id: string;
    name: string;
    createdAt: string;
  };
  status: string;
  referrerReward: number;
  referredReward: number;
  referrerRewarded: boolean;
  referredRewarded: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface TopReferrer {
  org: {
    id: string;
    name: string;
    referralCode: string;
  };
  referralCount: number;
  creditsEarned: number;
}

export default function AdminReferralsPage() {
  const { getToken } = useAuth();
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overview, recent, leaderboard] = await Promise.all([
        fetchWithAuth('/admin/plg/referrals/overview', getToken),
        fetchWithAuth('/admin/plg/referrals/recent?limit=50', getToken),
        fetchWithAuth('/admin/plg/referrals/leaderboard?limit=10', getToken),
      ]);

      setStats(overview);
      setReferrals(recent);
      setTopReferrers(leaderboard);
    } catch (err) {
      console.error('Failed to load referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(r =>
    r.referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Referral Program Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage the viral growth engine
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
              <Gift className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">{stats?.totalReferrals || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Referrals</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold">{stats?.conversionRate?.toFixed(1) || 0}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold">{stats?.totalCreditsDistributed || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Credits Given</h3>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold">{stats?.pendingReferrals || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Referrals */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Referrals</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{referral.referrer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{referral.referred.name}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{referral.referralCode}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          referral.status === 'REWARDED' ? 'bg-green-100 text-green-800' :
                          referral.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Referrers</h2>
            </div>
            <div className="p-6 space-y-4">
              {topReferrers.map((referrer, index) => (
                <div key={referrer.org.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{referrer.org.name}</div>
                    <div className="text-xs text-gray-500">{referrer.org.referralCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{referrer.referralCount}</div>
                    <div className="text-xs text-gray-500">{referrer.creditsEarned} credits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
