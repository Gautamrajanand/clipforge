'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { ArrowLeft, TrendingUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface NPSStats {
  npsScore: number;
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  responses: Array<{
    id: string;
    score: number;
    feedback: string | null;
    category: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  }>;
}

interface Feedback {
  id: string;
  type: string;
  message: string;
  rating: number | null;
  page: string | null;
  resolved: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function NPSAdminPage() {
  const { getToken } = useAuth();
  const [npsStats, setNpsStats] = useState<NPSStats | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [npsResponse, feedbackResponse] = await Promise.all([
        fetchWithAuth(`${API_URL}/admin/plg/nps/overview`, { getToken }),
        fetchWithAuth(
          `${API_URL}/admin/plg/feedback/list?resolved=${
            filter === 'all' ? '' : filter === 'resolved' ? 'true' : 'false'
          }`,
          { getToken }
        ),
      ]);

      if (npsResponse.ok) {
        setNpsStats(await npsResponse.json());
      }
      if (feedbackResponse.ok) {
        setFeedback(await feedbackResponse.json());
      }
    } catch (error) {
      console.error('Failed to fetch NPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveFeedback = async (feedbackId: string, adminUserId: string) => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/plg/feedback/${feedbackId}/resolve`,
        {
          getToken,
          method: 'PUT',
          body: JSON.stringify({ adminUserId }),
        }
      );

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to resolve feedback:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROMOTER':
        return 'bg-green-100 text-green-800';
      case 'PASSIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DETRACTOR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'BUG':
        return 'bg-red-100 text-red-800';
      case 'FEATURE_REQUEST':
        return 'bg-blue-100 text-blue-800';
      case 'PRAISE':
        return 'bg-green-100 text-green-800';
      case 'COMPLAINT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/plg"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to PLG Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">NPS & Feedback</h1>
        <p className="text-gray-600 mt-2">Monitor customer satisfaction and feedback</p>
      </div>

      {/* NPS Stats Cards */}
      {npsStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">NPS Score</h3>
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{npsStats.npsScore}</p>
            <p className="text-xs text-gray-500 mt-1">
              {npsStats.npsScore >= 50
                ? 'Excellent'
                : npsStats.npsScore >= 30
                ? 'Good'
                : npsStats.npsScore >= 0
                ? 'Fair'
                : 'Needs Improvement'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Promoters</h3>
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{npsStats.promoters}</p>
            <p className="text-xs text-gray-500 mt-1">
              {npsStats.total > 0
                ? `${Math.round((npsStats.promoters / npsStats.total) * 100)}%`
                : '0%'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Passives</h3>
              <MessageSquare size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{npsStats.passives}</p>
            <p className="text-xs text-gray-500 mt-1">
              {npsStats.total > 0
                ? `${Math.round((npsStats.passives / npsStats.total) * 100)}%`
                : '0%'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Detractors</h3>
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{npsStats.detractors}</p>
            <p className="text-xs text-gray-500 mt-1">
              {npsStats.total > 0
                ? `${Math.round((npsStats.detractors / npsStats.total) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      )}

      {/* Recent NPS Responses */}
      {npsStats && npsStats.responses.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent NPS Responses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {npsStats.responses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {response.user.name}
                        </div>
                        <div className="text-sm text-gray-500">{response.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-gray-900">{response.score}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          response.category
                        )}`}
                      >
                        {response.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-md truncate">
                        {response.feedback || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Feedback</h2>
            <div className="flex space-x-2">
              {(['all', 'unresolved', 'resolved'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {feedback.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No feedback found</div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getFeedbackTypeColor(
                          item.type
                        )}`}
                      >
                        {item.type.replace('_', ' ')}
                      </span>
                      {item.rating && (
                        <span className="text-sm text-gray-500">★ {item.rating}/5</span>
                      )}
                      {item.page && (
                        <span className="text-xs text-gray-400">from {item.page}</span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-2">{item.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">{item.user.name}</span>
                      <span className="mx-2">•</span>
                      <span>{item.user.email}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!item.resolved && (
                    <button
                      onClick={() => resolveFeedback(item.id, 'admin-user-id')}
                      className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {item.resolved && (
                    <span className="ml-4 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
