'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, X, Sparkles, DollarSign, Zap, Globe, Palette, Users, Code, TrendingUp } from 'lucide-react';

export default function VsOpusClipPage() {
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
      <section className="pt-32 pb-20 px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full text-sm text-blue-700 font-medium mb-8">
            <TrendingUp className="w-4 h-4" />
            Honest Comparison
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            ClipForge vs Opus Clip
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Both are great tools. Here's an honest comparison to help you choose what's best for your needs.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Try ClipForge Free
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Comparison */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              At a Glance
            </h2>
            <p className="text-xl text-gray-600">
              Key differences that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ClipForge */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ClipForge</h3>
                  <p className="text-blue-600 font-semibold">The Content OS</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">3 Services in One</p>
                    <p className="text-sm text-gray-600">AI Clips + Subtitles + Reframe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">$29/month</p>
                    <p className="text-sm text-gray-600">More features, lower price</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">14 Caption Styles</p>
                    <p className="text-sm text-gray-600">More customization options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Platform Vision</p>
                    <p className="text-sm text-gray-600">Future: Blogs, scheduling, analytics</p>
                  </div>
                </div>
              </div>

              <Link
                href="/signup"
                className="mt-8 w-full block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Opus Clip */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Opus Clip</h3>
                  <p className="text-gray-600 font-semibold">AI Clip Generator</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">AI Clips Only</p>
                    <p className="text-sm text-gray-600">Focused on clip generation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">$39/month</p>
                    <p className="text-sm text-gray-600">Higher price for fewer features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">8 Caption Styles</p>
                    <p className="text-sm text-gray-600">Limited customization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Single Feature Focus</p>
                    <p className="text-sm text-gray-600">No additional services planned</p>
                  </div>
                </div>
              </div>

              <a
                href="https://opus.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full block text-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Visit Opus Clip
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Feature-by-Feature Comparison
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">ClipForge</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Opus Clip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'AI Clip Generation', clipforge: true, opus: true },
                  { feature: 'Virality Scoring', clipforge: true, opus: true },
                  { feature: 'Auto Captions', clipforge: true, opus: true },
                  { feature: 'Caption Styles', clipforge: '14 styles', opus: '8 styles' },
                  { feature: 'Custom Caption Colors', clipforge: true, opus: true },
                  { feature: 'Custom Caption Fonts', clipforge: true, opus: false },
                  { feature: 'Multi-Language Support', clipforge: '20+ languages', opus: '10+ languages' },
                  { feature: 'AI Reframe (Aspect Ratios)', clipforge: true, opus: false },
                  { feature: 'Platform Presets', clipforge: true, opus: true },
                  { feature: 'Video Length Support', clipforge: 'Up to 2 hours', opus: 'Up to 1 hour' },
                  { feature: 'Export Quality', clipforge: 'Up to 4K', opus: 'Up to 1080p' },
                  { feature: 'Batch Processing', clipforge: true, opus: true },
                  { feature: 'URL Import (YouTube, etc.)', clipforge: true, opus: true },
                  { feature: 'Brand Kit', clipforge: 'Coming Q1 2026', opus: true },
                  { feature: 'Social Scheduler', clipforge: 'Coming Q2 2026', opus: true },
                  { feature: 'Analytics Dashboard', clipforge: 'Coming Q2 2026', opus: true },
                  { feature: 'API Access', clipforge: 'Coming Q3 2026', opus: true },
                  { feature: 'Monthly Price (Starter)', clipforge: '$29', opus: '$39' },
                  { feature: 'Free Trial', clipforge: '7 days', opus: '7 days' },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.clipforge === 'boolean' ? (
                        row.clipforge ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-semibold text-blue-600">{row.clipforge}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.opus === 'boolean' ? (
                        row.opus ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">{row.opus}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Choose ClipForge */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ClipForge?
            </h2>
            <p className="text-xl text-gray-600">
              More than just clips
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: 'Better Value',
                description: '$29/mo vs $39/mo for Opus Clip. Get more features at a lower price.',
                gradient: 'from-green-500 to-green-600',
              },
              {
                icon: Palette,
                title: 'More Customization',
                description: '14 caption styles vs 8. Custom fonts, colors, and positioning for your brand.',
                gradient: 'from-purple-500 to-purple-600',
              },
              {
                icon: Globe,
                title: 'Platform Vision',
                description: 'Not just clips. Future: blogs, scheduling, analytics. Everything post-recording.',
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                icon: Zap,
                title: 'Faster Processing',
                description: 'Optimized infrastructure for faster clip generation and exports.',
                gradient: 'from-yellow-500 to-yellow-600',
              },
              {
                icon: Users,
                title: 'Better Support',
                description: 'Responsive support team. We actually respond to feature requests.',
                gradient: 'from-pink-500 to-pink-600',
              },
              {
                icon: Code,
                title: 'API Coming Soon',
                description: 'Full API access planned for Q3 2026. Automate your workflow.',
                gradient: 'from-indigo-500 to-indigo-600',
              },
            ].map((reason) => (
              <div key={reason.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${reason.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <reason.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pricing Comparison
            </h2>
            <p className="text-xl text-gray-600">
              More features, lower price
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ClipForge Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Recommended
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ClipForge Starter</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-blue-600">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Save $120/year vs Opus Clip</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'AI Clips with virality scoring',
                  'AI Subtitles (20+ languages)',
                  'AI Reframe (4 aspect ratios)',
                  '14 caption styles',
                  'Custom fonts & colors',
                  'Up to 2-hour videos',
                  '4K export quality',
                  'No watermark',
                  '150 credits/month',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="w-full block text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Opus Clip Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Opus Clip Starter</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-gray-900">$39</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-red-600 mt-2">$10 more expensive</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  { text: 'AI Clips with virality scoring', available: true },
                  { text: 'AI Subtitles (10+ languages)', available: true },
                  { text: 'AI Reframe', available: false },
                  { text: '8 caption styles', available: true },
                  { text: 'Custom fonts', available: false },
                  { text: 'Up to 1-hour videos', available: true },
                  { text: '1080p export quality', available: true },
                  { text: 'No watermark', available: true },
                  { text: '100 credits/month', available: true },
                ].map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.available ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.available ? 'text-gray-700' : 'text-gray-400 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="https://opus.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Visit Opus Clip
              </a>
            </div>
          </div>

          <div className="mt-12 text-center p-8 bg-white rounded-2xl shadow-lg">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              ClipForge: More features, lower price
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Get 3 services for less than the cost of 1 with Opus Clip
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

      {/* FAQ */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I switch from Opus Clip to ClipForge?',
                a: 'Yes! Simply sign up for ClipForge and start uploading. Your Opus Clip subscription is separate, so you can try both and decide which works better for you.',
              },
              {
                q: 'Is ClipForge really cheaper than Opus Clip?',
                a: 'Yes. ClipForge Starter is $29/month vs Opus Clip at $39/month. That\'s $120 saved per year, plus you get more features (AI Subtitles, AI Reframe, more caption styles).',
              },
              {
                q: 'What about quality? Is ClipForge as good as Opus Clip?',
                a: 'Yes. Both use advanced AI for clip detection. ClipForge actually offers more customization options (14 caption styles vs 8, custom fonts, 4K exports) and supports longer videos (2 hours vs 1 hour).',
              },
              {
                q: 'Why is ClipForge cheaper if it has more features?',
                a: 'We\'re focused on building a platform, not just a single tool. Our goal is to become your one-stop solution for everything post-recording, so we price competitively to grow our user base.',
              },
              {
                q: 'Can I use both ClipForge and Opus Clip?',
                a: 'Of course! Many creators use multiple tools. We recommend trying both with free trials and seeing which fits your workflow better.',
              },
              {
                q: 'What\'s coming next for ClipForge?',
                a: 'We\'re building the Content OS. Coming soon: content generation (blogs, social posts), social scheduler, cross-platform analytics, and API access. Everything you need post-recording.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to try ClipForge?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start your free 7-day trial. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Join 10,000+ creators who chose ClipForge
          </p>
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
              <Link href="/" className="hover:text-gray-900">Home</Link>
              <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
              <Link href="/vs-opus-clip" className="hover:text-gray-900">vs Opus Clip</Link>
              <a href="mailto:support@clipforge.ai" className="hover:text-gray-900">Contact</a>
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
