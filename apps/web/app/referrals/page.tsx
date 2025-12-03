'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Copy, Check, Users, Gift, TrendingUp, Mail, Share2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  creditsEarned: number;
  referrals: Array<{
    id: string;
    referredOrgName: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
  }>;
}

export default function ReferralsPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/v1/referrals/stats`, {
        getToken,
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/sign-up?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/sign-up?ref=${stats.referralCode}`;
    const subject = 'Try ClipForge - Get 1 Month Free!';
    const body = `Hey! I've been using ClipForge to create viral clips from my videos and it's amazing. Sign up with my referral link and we both get 1 month free!\n\n${referralLink}\n\nIt's seriously 10x faster than manual editing. Check it out!`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="lg:ml-64 pt-16">
          <div className="p-8 flex items-center justify-center">
            <div className="text-gray-600">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h1>
            <p className="text-gray-600">
              Share ClipForge with friends and get 1 month free for each referral!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Referrals</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalReferrals || 0}</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.pendingReferrals || 0}</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Completed</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.completedReferrals || 0}</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Credits Earned</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.creditsEarned || 0}</div>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Referral Link</h2>
                <p className="text-gray-600">
                  Share this link with friends. When they sign up and upgrade, you both get 1 month free!
                </p>
              </div>
            </div>

            {/* Referral Code Display */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="text-sm text-gray-600 mb-1">Your Referral Code</div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.referralCode}</div>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareViaEmail}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Share via Email</span>
              </button>
              
              <button
                onClick={() => {
                  const referralLink = `${window.location.origin}/sign-up?ref=${stats?.referralCode}`;
                  const text = `Check out ClipForge! Use my referral code ${stats?.referralCode} and we both get 1 month free! ${referralLink}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on Twitter</span>
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Send your unique referral link to friends, colleagues, or share on social media.
                </p>
              </div>

              <div>
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  When they create an account using your link, they'll be tracked as your referral.
                </p>
              </div>

              <div>
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Both Get Rewarded</h4>
                <p className="text-sm text-gray-600">
                  When they upgrade to a paid plan, you both get 1 month free! No limit on referrals.
                </p>
              </div>
            </div>
          </div>

          {/* Referral History */}
          {stats && stats.referrals && stats.referrals.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Referral History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signed Up
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {referral.referredOrgName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            referral.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : referral.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.completedAt ? new Date(referral.completedAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
