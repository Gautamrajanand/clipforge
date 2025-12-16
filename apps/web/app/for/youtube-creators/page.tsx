import { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationSchema, getFAQSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge for YouTube Creators - Turn Long Videos into Viral Shorts',
  description: 'Transform your YouTube videos into engaging Shorts, TikToks, and Reels. AI-powered clip generation, captions, and reframing for creators.',
  openGraph: {
    title: 'ClipForge for YouTube Creators',
    description: 'Turn your YouTube videos into viral Shorts with AI',
    images: ['/og-youtube-creators.png'],
  },
};

export default function YouTubeCreatorsPage() {
  const faqs = [
    {
      question: 'How does ClipForge help YouTube creators?',
      answer: 'ClipForge automatically identifies the most engaging moments from your long-form YouTube videos and turns them into short, viral-ready clips perfect for YouTube Shorts, TikTok, and Instagram Reels.',
    },
    {
      question: 'Can I customize the captions?',
      answer: 'Yes! Choose from 14 animated caption styles, customize colors, fonts, sizes, and positions to match your brand.',
    },
    {
      question: 'How long does it take to process a video?',
      answer: 'A 10-minute video typically processes in 6 minutes. You can process multiple videos simultaneously.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([getOrganizationSchema(), getFAQSchema(faqs)]),
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              For YouTube Creators
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Your YouTube Videos<br />Into Viral Shorts
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Transform long-form content into engaging YouTube Shorts, TikToks, and Reels. 
              AI-powered clip generation, automatic captions, and smart reframing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">10x Faster</h3>
              <p className="text-gray-600">
                Create 10 clips in the time it takes to manually edit one. Process videos in minutes, not hours.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered</h3>
              <p className="text-gray-600">
                Our AI identifies the most engaging moments and creates clips optimized for virality.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">20x Cheaper</h3>
              <p className="text-gray-600">
                $5 per video vs $100 with a video editor. Professional quality at a fraction of the cost.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="text-2xl">✂️</div>
                <div>
                  <h3 className="font-bold mb-2">AI Clip Generation</h3>
                  <p className="text-gray-600">Automatically find the best moments from your videos</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">📱</div>
                <div>
                  <h3 className="font-bold mb-2">Smart Reframing</h3>
                  <p className="text-gray-600">Convert 16:9 to 9:16 with intelligent cropping</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="font-bold mb-2">Auto Captions</h3>
                  <p className="text-gray-600">14 animated styles with 95%+ accuracy</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🎨</div>
                <div>
                  <h3 className="font-bold mb-2">Brand Customization</h3>
                  <p className="text-gray-600">Match your brand colors, fonts, and style</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-purple-50 rounded-2xl p-12 mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Trusted by 10,000+ Creators</h2>
              <p className="text-gray-600">Join creators who are growing faster with ClipForge</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
                <div className="text-gray-600">Clips Generated</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">10x</div>
                <div className="text-gray-600">Faster Than Manual</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-gray-600">Caption Accuracy</div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Go Viral?</h2>
            <p className="text-xl mb-8 opacity-90">Start creating viral clips in minutes</p>
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
