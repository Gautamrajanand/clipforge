'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  memberships: Array<{
    org: {
      id: string;
      name: string;
      tier: string;
      credits: number;
    };
  }>;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState({ amount: 0, reason: '' });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    loadUsers();
  }, [isLoaded, isSignedIn]);

  const loadUsers = async (query?: string) => {
    try {
      setLoading(true);
      const endpoint = query
        ? `http://localhost:3000/admin/users/search?q=${encodeURIComponent(query)}`
        : 'http://localhost:3000/admin/users/recent?limit=50';

      const response = await fetchWithAuth(endpoint, {
        method: 'GET',
        getToken: getClerkToken,
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadUsers(searchQuery);
    } else {
      loadUsers();
    }
  };

  const handleAdjustCredits = async (orgId: string) => {
    if (!creditAdjustment.reason.trim()) {
      alert('Please provide a reason for the adjustment');
      return;
    }

    if (creditAdjustment.amount === 0) {
      alert('Please enter a non-zero amount');
      return;
    }

    try {
      setAdjusting(true);
      console.log('Adjusting credits:', { orgId, ...creditAdjustment });
      const response = await fetchWithAuth(
        `http://localhost:3000/admin/organizations/${orgId}/credits/adjust`,
        {
          method: 'POST',
          getToken: getClerkToken,
          body: JSON.stringify(creditAdjustment),
        }
      );

      if (response.ok) {
        alert('Credits adjusted successfully');
        setCreditAdjustment({ amount: 0, reason: '' });
        setSelectedUser(null);
        loadUsers(searchQuery || undefined);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        alert(`Failed to adjust credits: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adjusting credits:', err);
      alert('Failed to adjust credits');
    } finally {
      setAdjusting(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/admin/users/${userId}/admin`,
        {
          method: 'PATCH',
          getToken: getClerkToken,
          body: JSON.stringify({ isAdmin: !currentStatus }),
        }
      );

      if (response.ok) {
        alert('Admin status updated successfully');
        loadUsers(searchQuery || undefined);
      } else {
        alert('Failed to update admin status');
      }
    } catch (err) {
      console.error('Error updating admin status:', err);
      alert('Failed to update admin status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">Search and manage users</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadUsers();
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.memberships?.[0] ? (
                        <div className="text-sm text-gray-900">{user.memberships[0].org.name}</div>
                      ) : (
                        <span className="text-sm text-gray-400">No organization</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.memberships?.[0] && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.memberships[0].org.tier === 'FREE' ? 'bg-gray-100 text-gray-800' :
                          user.memberships[0].org.tier === 'STARTER' ? 'bg-blue-100 text-blue-800' :
                          user.memberships[0].org.tier === 'PRO' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.memberships[0].org.tier}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.memberships?.[0] && (
                        <div className="text-sm font-medium text-gray-900">
                          {user.memberships[0].org.credits}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.memberships?.[0] && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Adjust Credits
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Credit Adjustment Modal */}
      {selectedUser && selectedUser.memberships?.[0] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Adjust Credits</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">User: {selectedUser.name}</p>
              <p className="text-sm text-gray-600">Organization: {selectedUser.memberships[0].org.name}</p>
              <p className="text-sm text-gray-600">Current Credits: {selectedUser.memberships[0].org.credits}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  value={creditAdjustment.amount === 0 ? '' : creditAdjustment.amount}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setCreditAdjustment({ ...creditAdjustment, amount: isNaN(value) ? 0 : value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 100 or -50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (required)
                </label>
                <textarea
                  value={creditAdjustment.reason}
                  onChange={(e) => setCreditAdjustment({ ...creditAdjustment, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Compensation for bug, Promotional bonus"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAdjustCredits(selectedUser.memberships[0].org.id)}
                  disabled={adjusting || !creditAdjustment.reason.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {adjusting ? 'Adjusting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setCreditAdjustment({ amount: 0, reason: '' });
                  }}
                  disabled={adjusting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
