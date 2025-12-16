import { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge vs Descript - Simpler, Faster, More Affordable',
  description: 'Compare ClipForge and Descript. Get faster time-to-value with simpler workflows focused on social media clips at a better price.',
};

export default function VsDescriptPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }} />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ClipForge vs Descript
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simpler workflows. Faster results. Better for social media clips.
            </p>
            <Link href="/sign-up" className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Try ClipForge Free
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid md:grid-cols-3 divide-x divide-gray-200">
              <div className="p-6 bg-gray-50"><h3 className="font-bold text-lg">Feature</h3></div>
              <div className="p-6 bg-purple-50"><h3 className="font-bold text-lg text-purple-600">ClipForge</h3></div>
              <div className="p-6 bg-gray-50"><h3 className="font-bold text-lg">Descript</h3></div>

              <div className="p-6 font-semibold">Starting Price</div>
              <div className="p-6 bg-purple-50 text-purple-600 font-bold">$29/month</div>
              <div className="p-6">$12-24/month</div>

              <div className="p-6 font-semibold">Learning Curve</div>
              <div className="p-6 bg-purple-50 font-bold">⚡ 5 minutes</div>
              <div className="p-6">30+ minutes</div>

              <div className="p-6 font-semibold">Time to First Clip</div>
              <div className="p-6 bg-purple-50 font-bold">⚡ 5 minutes</div>
              <div className="p-6">30+ minutes</div>

              <div className="p-6">AI Clip Generation</div>
              <div className="p-6 bg-purple-50 font-bold">✅ Automatic</div>
              <div className="p-6">❌ Manual selection</div>

              <div className="p-6">Caption Styles</div>
              <div className="p-6 bg-purple-50 font-bold">✨ 14 animated</div>
              <div className="p-6">Basic styles</div>

              <div className="p-6">Social Media Focus</div>
              <div className="p-6 bg-purple-50 font-bold">✅ Built for viral clips</div>
              <div className="p-6">General video editing</div>

              <div className="p-6">Complexity</div>
              <div className="p-6 bg-purple-50 font-bold">🎯 Simple & focused</div>
              <div className="p-6">Complex, many features</div>

              <div className="p-6">Best For</div>
              <div className="p-6 bg-purple-50 font-bold">📱 Social media clips</div>
              <div className="p-6">🎬 Full video editing</div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose ClipForge?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">10x Faster</h3>
                <p className="text-gray-700">Create clips in 5 minutes vs 30+ minutes with Descript. No learning curve, instant results.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Built for Social</h3>
                <p className="text-gray-700">Focused on viral social media clips. Not a general video editor trying to do everything.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-3">True AI</h3>
                <p className="text-gray-700">AI automatically finds the best moments. No manual selection or editing required.</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-xl font-bold mb-3">No Learning Curve</h3>
                <p className="text-gray-700">Upload, generate, export. That's it. No tutorials or training needed.</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready for Simpler Workflows?</h2>
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
