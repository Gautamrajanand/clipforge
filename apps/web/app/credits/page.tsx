'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface CreditTransaction {
  id: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: string;
  description: string;
  videoDuration?: number;
  createdAt: string;
  projectId?: string;
}

interface CreditBalance {
  balance: number;
  usedThisMonth: number;
  allocation: number;
  resetDate: string;
  tier: string;
}

export default function CreditsPage() {
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false,
  });

  useEffect(() => {
    // TODO: Replace with real auth when implemented
    // For now, use mock data like dashboard does
    console.log('Credits page - Using mock data (no real auth yet)');
    setLoading(false);
    
    // Set mock balance data
    setBalance({
      balance: 42,
      usedThisMonth: 18,
      allocation: 60,
      resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      tier: 'FREE',
    });
    
    // Set mock transactions
    setTransactions([
      {
        id: '1',
        amount: -5,
        balanceBefore: 47,
        balanceAfter: 42,
        type: 'VIDEO_UPLOAD',
        description: 'Video upload: 58 Years Apart - A Glimpse...',
        videoDuration: 300,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        amount: 60,
        balanceBefore: 0,
        balanceAfter: 60,
        type: 'MONTHLY_RENEWAL',
        description: 'Monthly credit renewal',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }, []);

  const fetchCreditData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch balance
      const balanceRes = await fetch('http://localhost:3000/v1/credits/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!balanceRes.ok) {
        console.error('Failed to fetch balance:', balanceRes.status, await balanceRes.text());
        setLoading(false);
        return;
      }
      
      const balanceData = await balanceRes.json();
      setBalance(balanceData);

      // Fetch history
      const historyRes = await fetch(
        `http://localhost:3000/v1/credits/history?limit=${pagination.limit}&offset=${pagination.offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const historyData = await historyRes.json();
      setTransactions(historyData.transactions);
      setPagination(prev => ({
        ...prev,
        total: historyData.pagination.total,
        hasMore: historyData.pagination.hasMore,
      }));
    } catch (error) {
      console.error('Failed to fetch credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type.startsWith('DEDUCTION')) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <TrendingUp className="w-4 h-4 text-green-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type.startsWith('DEDUCTION')) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  const formatType = (type: string) => {
    return type
      .replace('DEDUCTION_', '')
      .replace('ADDITION_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const daysUntilReset = balance
    ? Math.ceil((new Date(balance.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading && !balance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
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
                <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your credit balance and view transaction history
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credit Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Current Balance</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {balance?.balance || 0}
              </span>
              <span className="text-lg text-gray-500">credits</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">{balance?.tier || 'FREE'}</span>
              </div>
            </div>
          </div>

          {/* Monthly Allocation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Monthly Allocation</span>
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {balance?.allocation || 60}
              </span>
              <span className="text-lg text-gray-500">credits</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Used this month</span>
                <span className="font-medium text-gray-900">{balance?.usedThisMonth || 0}</span>
              </div>
            </div>
          </div>

          {/* Next Reset */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Next Reset</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {daysUntilReset}
              </span>
              <span className="text-lg text-gray-500">days</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reset date</span>
                <span className="font-medium text-gray-900">
                  {balance?.resetDate
                    ? new Date(balance.resetDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-500 mt-1">
              View all your credit transactions and usage
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <div className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="text-sm font-medium text-gray-900">
                            {formatType(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tx.description}
                        {tx.videoDuration && (
                          <div className="text-xs text-gray-400 mt-1">
                            {tx.videoDuration.toFixed(2)} minutes
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {tx.balanceAfter}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      offset: Math.max(0, prev.offset - prev.limit),
                    }))
                  }
                  disabled={pagination.offset === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      offset: prev.offset + prev.limit,
                    }))
                  }
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
