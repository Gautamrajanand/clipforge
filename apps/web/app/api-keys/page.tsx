'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  rateLimit: number;
  quotaMinutes: number;
  quotaExports: number;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export default function ApiKeysPage() {
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; id: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    // TODO: Replace with real auth when implemented
    console.log('API Keys page - Using mock data (no real auth yet)');
    setLoading(false);
    
    // Set mock API keys
    setKeys([
      {
        id: '1',
        name: 'Production API Key',
        rateLimit: 10,
        quotaMinutes: 60,
        quotaExports: 10,
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: null,
      },
    ]);
  }, []);

  const fetchKeys = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/v1/api-keys', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: keyName || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyData({ key: data.key, id: data.id });
        setShowNewKeyModal(true);
        setKeyName('');
        fetchKeys();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getTierLimits = (tier: string) => {
    const limits: Record<string, number> = {
      FREE: 1,
      STARTER: 3,
      PRO: 10,
      BUSINESS: 50,
    };
    return limits[tier] || 1;
  };

  const maxKeys = getTierLimits(user?.planType || 'FREE');
  const canCreateMore = keys.length < maxKeys;

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
                <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your API keys for programmatic access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {keys.length} / {maxKeys} keys
              </div>
              {canCreateMore && (
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create API Key
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Keep your API keys secure</p>
            <p className="text-blue-700">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>

        {/* API Keys List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : keys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first API key to start using the ClipForge API
            </p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Rate Limit</div>
                        <div className="font-medium text-gray-900">
                          {key.rateLimit} req/min
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Quota</div>
                        <div className="font-medium text-gray-900">
                          {key.quotaMinutes} min/month
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Last Used
                        </div>
                        <div className="font-medium text-gray-900">
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created
                        </div>
                        <div className="font-medium text-gray-900">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke API key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!canCreateMore && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">API key limit reached</p>
              <p className="text-yellow-700">
                You've reached the maximum number of API keys for your plan ({maxKeys} keys).{' '}
                <Link href="/pricing" className="underline font-medium">
                  Upgrade your plan
                </Link>{' '}
                to create more keys.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            {newKeyData ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">API Key Created!</h2>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-900 font-medium mb-2">
                    ⚠️ Save this key now - it won't be shown again!
                  </p>
                  <div className="bg-white rounded-lg p-3 font-mono text-sm break-all border border-yellow-300">
                    {newKeyData.key}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newKeyData.key)}
                    className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Key
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyData(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New API Key</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Production Server"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createApiKey}
                    className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Create Key
                  </button>
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
