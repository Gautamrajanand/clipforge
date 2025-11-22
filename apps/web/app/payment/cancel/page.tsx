'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Canceled
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Your payment was canceled. No charges have been made to your account.
          </p>

          {/* Why Upgrade Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              Why Upgrade?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">✓</span>
                <span>Remove watermark from all exports</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">✓</span>
                <span>Get 5x more credits (150-300 credits/month)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">✓</span>
                <span>Projects never expire</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">✓</span>
                <span>Export in 4K resolution</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">✓</span>
                <span>Priority processing</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Support */}
          <p className="text-sm text-gray-500 mt-8">
            Have questions?{' '}
            <Link href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact our support team
            </Link>
          </p>
        </div>

        {/* Reassurance */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
