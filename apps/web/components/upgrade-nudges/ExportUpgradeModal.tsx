'use client';

import { X, Download, Sparkles, Check, Crown } from 'lucide-react';
import Link from 'next/link';

interface ExportUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAnyway?: () => void;
}

export default function ExportUpgradeModal({ 
  isOpen, 
  onClose,
  onExportAnyway 
}: ExportUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Crown className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">Remove Watermark</h2>
              <p className="text-sm text-white/90 mt-1">Create professional exports without branding</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  FREE
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span>Watermark on exports</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span>60 minutes/month</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span>48-hour project expiry</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-primary-500 rounded-lg p-4 bg-primary-50">
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  STARTER - $29/mo
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-900 font-medium">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>No watermark ✨</span>
                </div>
                <div className="flex items-center text-sm text-gray-900 font-medium">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>150 minutes/month</span>
                </div>
                <div className="flex items-center text-sm text-gray-900 font-medium">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>90-day storage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
              What You Get with Starter
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Professional, watermark-free exports</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>2.5x more credits (150 min/mo)</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>All 14+ caption styles</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>AI Reframe & Subtitles</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>90-day project storage</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Priority email support</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white text-center font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Upgrade to Starter - $29/month
            </Link>
            
            {onExportAnyway && (
              <button
                onClick={onExportAnyway}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export with Watermark (Free)
              </button>
            )}
          </div>

          {/* Guarantee */}
          <p className="text-center text-sm text-gray-600 mt-4">
            💯 <strong>30-day money-back guarantee.</strong> Cancel anytime, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
