'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { Copy, Check, Share2, Gift, TrendingUp, Users, Award } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalCreditsEarned: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  referredOrg: {
    id: string;
    name: string;
    createdAt: string;
  };
  status: 'PENDING' | 'COMPLETED' | 'REWARDED';
  reward: number;
  rewarded: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface LeaderboardEntry {
  org: {
    id: string;
    name: string;
    referralCode: string;
  };
  referralCount: number;
  creditsEarned: number;
}

export default function ReferralsPage() {
  const { getToken } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeRes, statsRes, listRes, leaderRes] = await Promise.all([
        fetchWithAuth('http://localhost:3000/v1/referrals/code', { getToken }),
        fetchWithAuth('http://localhost:3000/v1/referrals/stats', { getToken }),
        fetchWithAuth('http://localhost:3000/v1/referrals/list', { getToken }),
        fetchWithAuth('http://localhost:3000/v1/referrals/leaderboard?limit=10', { getToken }),
      ]);

      if (codeRes.ok) {
        const data = await codeRes.json();
        setReferralCode(data.code);
        setReferralUrl(data.referralUrl);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (listRes.ok) {
        const data = await listRes.json();
        setReferrals(data);
      }

      if (leaderRes.ok) {
        const data = await leaderRes.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareVia = (platform: string) => {
    const text = `Check out ClipForge - AI-powered video clipping! Use my referral code for 30 bonus credits: ${referralUrl}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(referralUrl);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      email: `mailto:?subject=Try ClipForge&body=${encodedText}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="mt-2 text-gray-600">
            Earn 30 credits for every friend who signs up and completes their first export!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalReferrals || 0}</p>
              </div>
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.completedReferrals || 0}</p>
              </div>
              <Check className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalCreditsEarned || 0}</p>
              </div>
              <Gift className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.conversionRate.toFixed(0) || 0}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Referral Link & Share */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Link Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Link</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-700 font-mono">{referralUrl}</code>
                  <button
                    onClick={() => copyToClipboard(referralUrl)}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-indigo-900">
                  <strong>Your Code:</strong> <code className="font-mono font-bold">{referralCode}</code>
                </p>
              </div>

              {/* Share Buttons */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Share via:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <button
                    onClick={() => shareVia('twitter')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Twitter
                  </button>
                  <button
                    onClick={() => shareVia('linkedin')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => shareVia('facebook')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareVia('whatsapp')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareVia('email')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Email
                  </button>
                </div>
              </div>
            </div>

            {/* Referral List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referrals</h2>
              
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No referrals yet. Start sharing your link!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{ref.referredOrg.name}</p>
                        <p className="text-sm text-gray-500">
                          Signed up {new Date(ref.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          ref.status === 'REWARDED' ? 'bg-green-100 text-green-800' :
                          ref.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ref.status === 'REWARDED' ? '✓ Rewarded' :
                           ref.status === 'COMPLETED' ? 'Completed' :
                           'Pending'}
                        </span>
                        {ref.rewarded && (
                          <p className="text-sm text-green-600 mt-1">+{ref.reward} credits</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Top Referrers</h2>
              </div>
              
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.org.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{entry.org.name}</p>
                        <p className="text-xs text-gray-500">{entry.referralCount} referrals</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{entry.creditsEarned}</p>
                        <p className="text-xs text-gray-500">credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
