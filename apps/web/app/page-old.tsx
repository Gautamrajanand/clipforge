'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Play, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Navigation */}
      <nav className="container py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">ClipForge</h1>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-blue-700">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-blue-600 hover:bg-slate-100">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="container py-20 text-center text-white">
        <h2 className="text-5xl font-bold mb-6">
          Turn Long Videos Into Viral Clips
        </h2>
        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
          AI-powered highlight detection, auto-captions, and one-click publishing to YouTube Shorts, Instagram Reels, and more.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              <Plus className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-blue-700 bg-opacity-50 rounded-lg p-6">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Highlights</h3>
            <p className="text-blue-100">
              Automatically detect the best moments in your videos
            </p>
          </div>
          <div className="bg-blue-700 bg-opacity-50 rounded-lg p-6">
            <Play className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Format</h3>
            <p className="text-blue-100">
              Export to 9:16, 1:1, 16:9 with auto-captions
            </p>
          </div>
          <div className="bg-blue-700 bg-opacity-50 rounded-lg p-6">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">One-Click Publish</h3>
            <p className="text-blue-100">
              Publish directly to YouTube Shorts and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
