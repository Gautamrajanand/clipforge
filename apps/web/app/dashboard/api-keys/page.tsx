'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Key,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

interface Organization {
  tier: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
}

export default function ApiKeysPage() {
  const { getToken } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load organization
      const orgResponse = await fetchWithAuth('/v1/organizations/current', {
        method: 'GET',
        getToken,
      });
      const orgData = await orgResponse.json();
      setOrg(orgData);

      // Load API keys if BUSINESS tier
      if (orgData.tier === 'BUSINESS' || orgData.tier === 'ENTERPRISE') {
        const keysResponse = await fetchWithAuth('/v1/api-keys', {
          method: 'GET',
          getToken,
        });
        const keysData = await keysResponse.json();
        setApiKeys(keysData.apiKeys || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for your API key');
      return;
    }

    try {
      setCreatingKey(true);

      const response = await fetchWithAuth('/v1/api-keys', {
        method: 'POST',
        getToken,
        body: JSON.stringify({
          name: newKeyName,
          description: newKeyDescription || undefined,
        }),
      });
      const data = await response.json();

      setNewlyCreatedKey(data.key);
      setNewKeyName('');
      setNewKeyDescription('');
      await loadData();
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key. Please try again.');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone and will immediately invalidate the key.`)) {
      return;
    }

    try {
      setRevokingKeyId(keyId);

      await fetchWithAuth(`/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        getToken,
      });

      await loadData();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('Failed to revoke API key. Please try again.');
    } finally {
      setRevokingKeyId(null);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 8) + '••••••••••••••••••••••••••••';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Check if user has access to API keys
  if (org?.tier !== 'BUSINESS' && org?.tier !== 'ENTERPRISE') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">API Access Required</h2>
            <p className="text-gray-600 mb-6">
              API keys are available on the Business and Enterprise plans.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Upgrade to Business
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="mt-2 text-gray-600">
                Manage your API keys to integrate ClipForge into your applications
              </p>
            </div>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create API Key
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Keep your API keys secure</p>
            <p className="text-sm text-blue-700 mt-1">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first API key to start integrating with ClipForge
            </p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                      {apiKey.isActive ? (
                        <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      {apiKey.lastUsedAt && (
                        <> • Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  {apiKey.isActive && (
                    <button
                      onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                      disabled={revokingKeyId === apiKey.id}
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center disabled:opacity-50"
                    >
                      {revokingKeyId === apiKey.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Revoke
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center flex-1 mr-4">
                    <code className="text-sm font-mono text-gray-900 flex-1">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedKeyId === apiKey.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documentation Link */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">API Documentation</h3>
          <p className="text-gray-600 mb-4">
            Learn how to integrate ClipForge into your applications with our comprehensive API documentation.
          </p>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
          >
            View API Documentation
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create API Key</h2>

            {newlyCreatedKey ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">API Key Created!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Make sure to copy your API key now. You won't be able to see it again.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <code className="text-sm font-mono text-gray-900 break-all">
                    {newlyCreatedKey}
                  </code>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedKeyId === 'new' ? 'Copied!' : 'Copy Key'}
                  </button>
                  <button
                    onClick={() => {
                      setNewlyCreatedKey(null);
                      setShowNewKeyModal(false);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                    placeholder="What will this key be used for?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateKey}
                    disabled={creatingKey || !newKeyName.trim()}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {creatingKey ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Key
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName('');
                      setNewKeyDescription('');
                    }}
                    disabled={creatingKey}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
