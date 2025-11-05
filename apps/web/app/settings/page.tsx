'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [apiKey] = useState('sk_live_abc123def456ghi789');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* API Keys Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Keys</h2>
          <p className="text-gray-600 mb-6">
            Use API keys to authenticate requests to the ClipForge API.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Production Key</p>
                <p className="text-sm text-gray-600 mt-1 font-mono">{apiKey}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="ml-4"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        {/* Webhooks Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Webhooks</h2>
          <p className="text-gray-600 mb-6">
            Receive real-time notifications when exports are ready.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">https://example.com/webhook</p>
                  <p className="text-sm text-gray-600 mt-1">export.ready, export.failed</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Add Webhook
          </Button>
        </div>

        {/* Organization Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Organization</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="My Company"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="admin@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
