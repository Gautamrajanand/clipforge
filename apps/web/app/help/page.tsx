'use client';

import Link from 'next/link';
import { Sparkles, HelpCircle, Mail, MessageCircle } from 'lucide-react';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-bold text-lg">ClipForge</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">
            We're here to help you succeed with ClipForge
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <Mail className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Get help from our support team via email
            </p>
            <a
              href="mailto:support@clipforge.com"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <MessageCircle className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with our team in real-time (Pro plan)
            </p>
            <button
              disabled
              className="px-6 py-3 bg-gray-700 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
            >
              Pro Feature
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do credits work?</h3>
              <p className="text-gray-600 text-sm">
                Credits are used to process videos. Each minute of video costs a certain number of credits based on the features you use. Free users get 60 credits per month.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What happens when my projects expire?</h3>
              <p className="text-gray-600 text-sm">
                On the free plan, projects expire after 48 hours. Upgrade to a paid plan to keep your projects forever.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time from the Subscription page. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How do I remove the watermark?</h3>
              <p className="text-gray-600 text-sm">
                Watermarks are removed automatically when you upgrade to the Starter plan or higher.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
