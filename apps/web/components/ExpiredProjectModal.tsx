'use client';

import { X, Lock, Sparkles, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ExpiredProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  expirationDate?: string;
}

/**
 * Expired Project Modal - PLG Best Practice
 * 
 * Shows when user tries to access expired project
 * Encourages upgrade with clear value proposition
 * 
 * PLG Principles:
 * - Clear problem statement
 * - Value-first messaging
 * - Easy upgrade path
 * - No hard blocking (can close and explore other features)
 */
export default function ExpiredProjectModal({
  isOpen,
  onClose,
  projectTitle = 'this project',
  expirationDate,
}: ExpiredProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Project Expired</h2>
              <p className="text-white/90 text-sm">Upgrade to access your content</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              <strong>{projectTitle}</strong> has expired after 48 hours and is no longer accessible on the free plan.
            </p>
            {expirationDate && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Created on {new Date(expirationDate).toLocaleDateString()} • Expired after 48 hours
              </p>
            )}
          </div>

          {/* Value Props */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Upgrade to Premium and get:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited project storage</strong> - Never lose your work</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>10x more credits</strong> - Process longer videos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Priority processing</strong> - Faster results</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Advanced AI features</strong> - More customization</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
            >
              Upgrade to Premium
            </Link>
            <button
              onClick={onClose}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Explore Other Projects
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Questions? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
