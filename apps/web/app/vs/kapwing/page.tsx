import { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge vs Kapwing - Better AI, Faster Processing',
  description: 'Compare ClipForge and Kapwing. Get superior AI clip generation, faster processing, and better value for creators.',
};

export default function VsKapwingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }} />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ClipForge vs Kapwing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Superior AI. Faster processing. Better for creators.
            </p>
            <Link href="/sign-up" className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Try ClipForge Free
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid md:grid-cols-3 divide-x divide-gray-200">
              <div className="p-6 bg-gray-50"><h3 className="font-bold text-lg">Feature</h3></div>
              <div className="p-6 bg-purple-50"><h3 className="font-bold text-lg text-purple-600">ClipForge</h3></div>
              <div className="p-6 bg-gray-50"><h3 className="font-bold text-lg">Kapwing</h3></div>

              <div className="p-6 font-semibold">Pro Plan</div>
              <div className="p-6 bg-purple-50 text-purple-600 font-bold">$29/month</div>
              <div className="p-6">$24/month</div>

              <div className="p-6 font-semibold">AI Clip Generation</div>
              <div className="p-6 bg-purple-50 font-bold">✅ Advanced AI</div>
              <div className="p-6">⚠️ Basic AI</div>

              <div className="p-6 font-semibold">Processing Speed</div>
              <div className="p-6 bg-purple-50 font-bold">⚡ 6 min (10-min video)</div>
              <div className="p-6">10-15 min</div>

              <div className="p-6">Caption Accuracy</div>
              <div className="p-6 bg-purple-50 font-bold">✅ 95%+</div>
              <div className="p-6">85-90%</div>

              <div className="p-6">Caption Styles</div>
              <div className="p-6 bg-purple-50 font-bold">✨ 14 animated</div>
              <div className="p-6">Basic styles</div>

              <div className="p-6">AI Reframing</div>
              <div className="p-6 bg-purple-50 font-bold">✅ Smart crop</div>
              <div className="p-6">✅ Available</div>

              <div className="p-6">Virality Scoring</div>
              <div className="p-6 bg-purple-50 font-bold">✅ AI-powered</div>
              <div className="p-6">❌ Not available</div>

              <div className="p-6">Focus</div>
              <div className="p-6 bg-purple-50 font-bold">🎯 Viral clips</div>
              <div className="p-6">General video editing</div>

              <div className="p-6">Credit System</div>
              <div className="p-6 bg-purple-50 font-bold">💎 1 credit = 1 min</div>
              <div className="p-6">Time-based limits</div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose ClipForge?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-3">Superior AI</h3>
                <p className="text-gray-700">Advanced AI that actually finds viral moments. Not just basic clip extraction.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">2x Faster</h3>
                <p className="text-gray-700">Process videos in 6 minutes vs 10-15 minutes. Get to market faster.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Built for Virality</h3>
                <p className="text-gray-700">Every feature optimized for creating viral social media content.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="text-xl font-bold mb-3">Better Captions</h3>
                <p className="text-gray-700">95%+ accuracy with 14 animated styles. Kapwing's captions are less accurate.</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready for Better AI?</h2>
            <p className="text-xl mb-8 opacity-90">Try ClipForge free for 7 days. No credit card required.</p>
            <Link href="/sign-up" className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
