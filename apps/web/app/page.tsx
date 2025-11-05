'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Video, Scissors, Zap, Star } from 'lucide-react';

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
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 mb-8">
            AI-Powered Video Clip Detection
          </div>

          {/* Hero Text */}
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-300">Turn long videos into</span>{' '}
            <span className="text-gray-900">viral clips instantly</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered clip detection finds the best moments in your videos automatically. 
            Upload once, export multiple clips, and share everywhere.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-lime-cta font-medium rounded-full inline-flex items-center gap-2 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
              ))}
            </div>
            <span className="font-semibold text-gray-900">4.9/5</span>
            <span className="text-gray-500">from 1000+ creators</span>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for every content type
            </h2>
            <p className="text-xl text-gray-600">
              Transform your long-form videos into engaging clips for any platform
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              'YouTube Shorts',
              'Instagram Reels',
              'TikTok Videos',
              'Podcast Highlights',
              'Webinar Clips',
              'Tutorial Snippets',
              'Product Demos',
              'Event Highlights',
              'Interview Moments',
            ].map((useCase) => (
              <div
                key={useCase}
                className="px-6 py-3 bg-card-mint rounded-full text-gray-800 font-medium hover:scale-105 transition-transform cursor-pointer"
              >
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How ClipForge works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to create viral clips from your videos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Upload */}
            <div className="bg-card-blue rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-3">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Video
              </h3>
              <p className="text-gray-600 mb-6">
                Upload any long-form video - podcasts, webinars, tutorials, or interviews
              </p>
            </div>

            {/* AI Detection */}
            <div className="bg-card-mint rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-3">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Finds Best Moments
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI analyzes your video and automatically detects the most engaging clips
              </p>
            </div>

            {/* Export */}
            <div className="bg-card-purple rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-200 rounded-xl flex items-center justify-center mb-6">
                <Scissors className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-3">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Export & Share
              </h3>
              <p className="text-gray-600 mb-6">
                Select your favorite clips, export them, and share across all platforms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by advanced AI
            </h2>
            <p className="text-xl text-gray-600">
              Our AI analyzes multiple factors to find the most engaging moments in your videos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Hook Detection',
                description: 'Identifies clips that grab attention in the first few seconds',
                color: 'from-purple-400 to-purple-600',
              },
              {
                title: 'Emotion Analysis',
                description: 'Finds emotionally engaging moments that resonate with viewers',
                color: 'from-pink-400 to-pink-600',
              },
              {
                title: 'Structure Analysis',
                description: 'Detects well-structured narratives with clear beginning and end',
                color: 'from-blue-400 to-blue-600',
              },
              {
                title: 'Novelty Detection',
                description: 'Highlights unique insights and surprising information',
                color: 'from-yellow-400 to-yellow-600',
              },
              {
                title: 'Clarity Scoring',
                description: 'Ensures clips are clear, concise, and easy to understand',
                color: 'from-green-400 to-green-600',
              },
              {
                title: 'Visual Focus',
                description: 'Analyzes visual composition and on-screen activity',
                color: 'from-orange-400 to-orange-600',
              },
            ].map((tool) => (
              <div
                key={tool.title}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {tool.description}
                </p>
              </div>
            ))}
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
                quote: "ClipForge has been a game changer for me as a new podcast.",
                author: "Melissa",
              },
              {
                quote: "ClipForge is such a user-friendly way to start a podcast.",
                author: "Pam",
              },
              {
                quote: "ClipForge has saved me countless hours while editing my podcast.",
                author: "Vanessa",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-card-yellow rounded-2xl p-8 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">G</span>
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
