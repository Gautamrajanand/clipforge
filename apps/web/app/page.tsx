'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Scissors, Type, Maximize, Video, ChevronDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ClipForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              Free sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Text */}
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
            What will you create?
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            ClipForge is designed to let content creators do what they do best, from viral clips to multi-format videos to AI-powered captions.
          </p>

          {/* Use Case Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="px-6 py-3 bg-card-yellow rounded-full text-gray-900 font-medium">Social Media Clips</span>
            <span className="px-6 py-3 bg-card-mint rounded-full text-gray-900 font-medium">Explainer Videos</span>
            <span className="px-6 py-3 bg-gray-100 rounded-full text-gray-900 font-medium">Onboarding</span>
            <span className="px-6 py-3 bg-card-yellow rounded-full text-gray-900 font-medium">Training Videos</span>
            <span className="px-6 py-3 bg-card-mint rounded-full text-gray-900 font-medium">Webinars</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <span className="px-6 py-3 bg-gray-100 rounded-full text-gray-900 font-medium">Video Essays</span>
            <span className="px-6 py-3 bg-card-mint rounded-full text-gray-900 font-medium">Internal Comms</span>
            <span className="px-6 py-3 bg-card-yellow rounded-full text-gray-900 font-medium">Voiceovers</span>
            <span className="px-6 py-3 bg-gray-100 rounded-full text-gray-900 font-medium">Text to Speech</span>
            <span className="px-6 py-3 bg-card-mint rounded-full text-gray-900 font-medium">Voice Cloning</span>
          </div>

          {/* CTA Button */}
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-lime-cta font-medium rounded-full transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-8 bg-gray-900 rounded-3xl mx-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Trusted by content creators across the world
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-white text-2xl font-bold">SiriusXM</span>
            <span className="text-white text-2xl font-bold">WSJ</span>
            <span className="text-white text-2xl font-bold">Netflix</span>
            <span className="text-white text-2xl font-bold">Disney</span>
            <span className="text-white text-2xl font-bold">BBC</span>
            <span className="text-white text-2xl font-bold">Discovery</span>
            <span className="text-white text-2xl font-bold">Google</span>
            <span className="text-white text-2xl font-bold">ESPN</span>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The power of AI at your fingertips
            </h2>
            <p className="text-xl text-gray-600">
              ClipForge's AI Assistant is packed with tools that let you move faster and create better content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card-mint rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                AI Clips <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                Find viral moments and create engaging clips optimized for TikTok, Shorts, and Reels.
              </p>
            </div>

            <div className="bg-card-peach rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                AI Reframe <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                Convert videos to any aspect ratio with smart tracking for every platform.
              </p>
            </div>

            <div className="bg-card-yellow rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                AI Subtitles <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                Automatically generate customized captions for your videos with AI in 20+ languages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card-purple rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                Filler Word Removal <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                Remove umms, ahhs and other filler words from audio automatically.
              </p>
            </div>

            <div className="bg-card-yellow rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                Smart Editing <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                AI-powered scene detection and automatic transitions for professional results.
              </p>
            </div>

            <div className="bg-card-blue rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                Transcription <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
              </h3>
              <p className="text-gray-700 mb-6">
                Convert any audio into text to repurpose and improve accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Create amazing content from start to finish
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recording Studio */}
            <div className="bg-card-mint rounded-3xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                NEW
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Recording Studio
              </h3>
              <p className="text-gray-700 mb-6">
                Record video effortlessly
              </p>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Video Editor */}
            <div className="bg-card-yellow rounded-3xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                NEW
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Video Editor
              </h3>
              <p className="text-gray-700 mb-6">
                Edit videos at lightning speed
              </p>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Scissors className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* AI Voices */}
            <div className="bg-card-peach rounded-3xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Voices
              </h3>
              <p className="text-gray-700 mb-6">
                Create audio just by typing
              </p>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Type className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-lime-cta font-medium rounded-full transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Bottom Message */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              The only platform you need post-recording
            </p>
            <p className="text-lg text-gray-600 mb-6">
              From clips to captions to scheduling — all in one place
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What creators love about ClipForge
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "ClipForge saved me 20 hours per week. Absolute game changer for my content workflow!",
                author: "Sarah Chen",
              },
              {
                quote: "The AI is incredibly accurate. My audience engagement is up 300% since I started using ClipForge.",
                author: "Mike Rodriguez",
              },
              {
                quote: "We repurpose our webinars into 50+ clips per month. ClipForge pays for itself 20x over.",
                author: "Emily Watson",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-card-yellow rounded-2xl p-8 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">{testimonial.author[0]}</span>
                </div>
                <p className="text-lg text-gray-800 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {testimonial.author} →
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to create amazing content?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators using ClipForge to produce professional content
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-lime-cta hover:bg-lime-cta-dark text-gray-900 font-semibold rounded-full transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ClipForge</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Features</a>
              <a href="#" className="hover:text-gray-900">Pricing</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2025 ClipForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
