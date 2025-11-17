'use client';

import Link from 'next/link';
import { Sparkles, BookOpen, Video, FileText } from 'lucide-react';

export default function LearningCenterPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ClipForge</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Learning Center</h1>
          <p className="text-xl text-gray-400">
            Master ClipForge with our tutorials, guides, and resources
          </p>
        </div>

        {/* Coming Soon */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <Video className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Video Tutorials</h3>
            <p className="text-gray-400 mb-4">
              Step-by-step video guides to help you get started
            </p>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <FileText className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Documentation</h3>
            <p className="text-gray-400 mb-4">
              Comprehensive guides and API documentation
            </p>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <BookOpen className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Best Practices</h3>
            <p className="text-gray-400 mb-4">
              Tips and tricks from content creation experts
            </p>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>
        </div>
      </main>
    </div>
  );
}
