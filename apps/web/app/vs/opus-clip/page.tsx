import { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge vs Opus Clip - Better Value, Same Quality',
  description: 'Compare ClipForge and Opus Clip. Get the same AI-powered video repurposing at 25% lower cost with more caption styles and better support.',
};

export default function VsOpusClipPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }} />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ClipForge vs Opus Clip
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Same AI-powered quality. 25% lower cost. More features.
            </p>
            <Link
              href="/sign-up"
              className="inline-block bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Try ClipForge Free
            </Link>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid md:grid-cols-3 divide-x divide-gray-200">
              {/* Header */}
              <div className="p-6 bg-gray-50">
                <h3 className="font-bold text-lg">Feature</h3>
              </div>
              <div className="p-6 bg-purple-50">
                <h3 className="font-bold text-lg text-purple-600">ClipForge</h3>
              </div>
              <div className="p-6 bg-gray-50">
                <h3 className="font-bold text-lg">Opus Clip</h3>
              </div>

              {/* Pricing */}
              <div className="p-6 font-semibold">Starter Plan</div>
              <div className="p-6 bg-purple-50 text-purple-600 font-bold">$29/month</div>
              <div className="p-6">$39/month</div>

              <div className="p-6 font-semibold">Pro Plan</div>
              <div className="p-6 bg-purple-50 text-purple-600 font-bold">$79/month</div>
              <div className="p-6">$99/month</div>

              {/* Features */}
              <div className="p-6">AI Clip Generation</div>
              <div className="p-6 bg-purple-50">✅ Yes</div>
              <div className="p-6">✅ Yes</div>

              <div className="p-6">Processing Speed</div>
              <div className="p-6 bg-purple-50">⚡ 6 min (10-min video)</div>
              <div className="p-6">⚡ 6 min (10-min video)</div>

              <div className="p-6">Caption Styles</div>
              <div className="p-6 bg-purple-50 font-bold">✨ 14 styles</div>
              <div className="p-6">5 styles</div>

              <div className="p-6">Caption Accuracy</div>
              <div className="p-6 bg-purple-50">✅ 95%+</div>
              <div className="p-6">✅ 95%+</div>

              <div className="p-6">AI Reframing</div>
              <div className="p-6 bg-purple-50">✅ Yes</div>
              <div className="p-6">✅ Yes</div>

              <div className="p-6">Multi-Segment Clips</div>
              <div className="p-6 bg-purple-50">✅ Yes</div>
              <div className="p-6">✅ Yes</div>

              <div className="p-6">Payment Options</div>
              <div className="p-6 bg-purple-50 font-bold">💳 Stripe + Razorpay</div>
              <div className="p-6">Stripe only</div>

              <div className="p-6">India Pricing</div>
              <div className="p-6 bg-purple-50 font-bold">₹2,299/month</div>
              <div className="p-6">₹3,000+/month</div>

              <div className="p-6">Credit Refunds</div>
              <div className="p-6 bg-purple-50 font-bold">✅ Auto refund on failure</div>
              <div className="p-6">❌ No refunds</div>

              <div className="p-6">API Access</div>
              <div className="p-6 bg-purple-50">✅ BUSINESS tier</div>
              <div className="p-6">✅ Available</div>

              <div className="p-6">Free Trial</div>
              <div className="p-6 bg-purple-50 font-bold">🎁 7-day PRO trial</div>
              <div className="p-6">Limited free tier</div>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose ClipForge?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">25% Lower Cost</h3>
                <p className="text-gray-700">
                  Save $10/month on Starter ($29 vs $39) and $20/month on Pro ($79 vs $99). Same quality, better value.
                </p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-xl font-bold mb-3">More Caption Styles</h3>
                <p className="text-gray-700">
                  14 animated caption styles vs 5. Bounce, Wave, Rainbow, 3D, Neon, Glitch, and more.
                </p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-3">Better for India</h3>
                <p className="text-gray-700">
                  Razorpay integration with local pricing (₹2,299 vs ₹3,000+). UPI, cards, net banking supported.
                </p>
              </div>
              <div className="bg-purple-50 p-8 rounded-xl">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-3">Credit Refunds</h3>
                <p className="text-gray-700">
                  Automatic credit refund if processing fails. Never lose credits due to technical issues.
                </p>
              </div>
            </div>
          </div>

          {/* What Users Say */}
          <div className="bg-gray-50 rounded-2xl p-12 mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">What Switchers Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Switched from Opus Clip and saved $120/year. Same quality, better price, and I love the extra caption styles!"
                </p>
                <p className="font-semibold">- Sarah K., YouTube Creator</p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "The Razorpay integration made it so easy to pay in INR. Plus the credit refund feature saved me twice already."
                </p>
                <p className="font-semibold">- Raj M., Podcaster</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Switch?</h2>
            <p className="text-xl mb-8 opacity-90">Try ClipForge free for 7 days. No credit card required.</p>
            <Link
              href="/sign-up"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
