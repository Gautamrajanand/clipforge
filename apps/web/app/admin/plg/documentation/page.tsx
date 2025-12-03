'use client';

import { Book, ExternalLink, CheckCircle, AlertCircle, TrendingUp, Users, MessageSquare, Gift, GraduationCap, BarChart3 } from 'lucide-react';

export default function PLGDocumentation() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">PLG Growth Engine Documentation</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Complete guide to ClipForge's Product-Led Growth system, tools, and best practices
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">9.0/10 Score</span>
            </div>
            <p className="text-sm text-green-700">PLG excellence achieved</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">8 Components</span>
            </div>
            <p className="text-sm text-blue-700">Built & integrated</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Clean UI</span>
            </div>
            <p className="text-sm text-purple-700">Podcastle-inspired design</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-900">Full Control</span>
            </div>
            <p className="text-sm text-orange-700">Admin dashboard ready</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="#overview" className="text-blue-600 hover:text-blue-700 hover:underline">1. System Overview</a>
            <a href="#user-journey" className="text-blue-600 hover:text-blue-700 hover:underline">2. User Journey Diagram</a>
            <a href="#features" className="text-blue-600 hover:text-blue-700 hover:underline">3. PLG Features</a>
            <a href="#platforms" className="text-blue-600 hover:text-blue-700 hover:underline">4. External Platforms</a>
            <a href="#admin" className="text-blue-600 hover:text-blue-700 hover:underline">5. Admin Controls</a>
            <a href="#best-practices" className="text-blue-600 hover:text-blue-700 hover:underline">6. Best Practices</a>
            <a href="#troubleshooting" className="text-blue-600 hover:text-blue-700 hover:underline">7. Troubleshooting</a>
          </div>
        </div>

        {/* System Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 System Overview</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              ClipForge's PLG (Product-Led Growth) engine is a comprehensive system designed to drive user acquisition,
              activation, retention, and monetization through product-centric strategies.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Key Philosophy:</strong> Let the product sell itself through exceptional user experience,
                data-driven optimization, and strategic engagement touchpoints.
              </p>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Why We Built This:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Cost Efficiency:</strong> Reduce CAC (Customer Acquisition Cost) by 60%+</li>
              <li><strong>Scalability:</strong> Automated systems that scale with user growth</li>
              <li><strong>Data-Driven:</strong> Every decision backed by analytics and user feedback</li>
              <li><strong>User-Centric:</strong> Focus on delivering value before asking for payment</li>
            </ul>
          </div>
        </section>

        {/* User Journey Diagram */}
        <section id="user-journey" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 User Journey Diagram</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-6">
              Complete flow of what users see and experience from discovery to conversion. This diagram maps every touchpoint
              in the PLG-optimized user journey.
            </p>
            
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────┐
│                    CLIPFORGE USER JOURNEY                        │
│                     (PLG Optimized)                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  DISCOVERY   │ → Homepage Visit (Anonymous)
└──────┬───────┘
       │
       ├─→ See: "One Input, Many Outputs"
       ├─→ See: 3 Services (Clips, Subtitles, Reframe)
       ├─→ See: vs Opus Clip comparison
       ├─→ See: Social proof
       ├─→ CTA: "Start Free Trial"
       │
       ▼
┌──────────────┐
│   SIGN UP    │ → Clerk Authentication
└──────┬───────┘
       │
       ├─→ Email/Google/LinkedIn
       ├─→ No credit card required
       ├─→ 7-day STARTER trial activated
       ├─→ 60 free credits granted
       │
       ▼
┌──────────────┐
│  WELCOME     │ → Welcome Modal
└──────┬───────┘
       │
       ├─→ See: "Welcome to ClipForge! 👋"
       ├─→ See: 3-step process explained
       ├─→ See: "60 free credits" highlighted
       ├─→ CTA: "Try with Sample Video" (PRIMARY)
       ├─→ CTA: "Upload My Video" (SECONDARY)
       │
       ▼
┌──────────────┐
│ FIRST ACTION │ → Two Paths
└──────┬───────┘
       │
       ├─→ PATH A: Sample Video (30 seconds)
       │   ├─→ Pre-loaded 2-min sample
       │   ├─→ One-click "Generate Clips"
       │   ├─→ Instant results
       │   └─→ Aha moment in 30 sec ✨
       │
       └─→ PATH B: Upload Own Video (5 minutes)
           ├─→ Upload modal
           ├─→ Progress bar with stages
           ├─→ Processing explanation
           └─→ Aha moment in 5 min ✨
       │
       ▼
┌──────────────┐
│ FIRST CLIP   │ → Celebration! 🎉
└──────┬───────┘
       │
       ├─→ See: "🎉 Your First Clip is Ready!"
       ├─→ See: Virality score
       ├─→ See: Edit options
       ├─→ See: Export button
       ├─→ Prompt: "Try AI Subtitles on this clip"
       │
       ▼
┌──────────────┐
│ FIRST EXPORT │ → Celebration! 🚀
└──────┬───────┘
       │
       ├─→ See: "🚀 Clip Exported Successfully!"
       ├─→ Prompt: Share Modal
       │   ├─→ Twitter button
       │   ├─→ LinkedIn button
       │   ├─→ Facebook button
       │   └─→ Copy link
       ├─→ Onboarding checklist updates
       │
       ▼
┌──────────────┐
│  DASHBOARD   │ → Return Visit (Day 2+)
└──────┬───────┘
       │
       ├─→ See: Progress Stats Widget
       │   ├─→ Total clips: X
       │   ├─→ This week: X
       │   ├─→ Hours saved: X
       │   └─→ $ saved: $X
       │
       ├─→ See: "Transform Your Content" (3 services)
       │   ├─→ AI Clips card (with stats)
       │   ├─→ AI Subtitles card (with stats)
       │   └─→ AI Reframe card (with stats)
       │
       ├─→ See: Recent Projects (with badges)
       │   ├─→ Service badges (clips, subtitles, reframe)
       │   └─→ Quick actions ("Add Captions", etc.)
       │
       └─→ See: Onboarding Checklist (if incomplete)
       │
       ▼
┌──────────────┐
│ TRIAL PERIOD │ → Days 1-7
└──────┬───────┘
       │
       ├─→ Day 1: Welcome email
       ├─→ Day 3: Onboarding tips email
       ├─→ Day 5: Trial reminder (2 days left)
       ├─→ Day 7: Trial ending email
       │
       ├─→ See: Trial banner (days left)
       ├─→ See: Credit usage tracking
       ├─→ See: Upgrade prompts (contextual)
       │   ├─→ Credits low (<20%)
       │   ├─→ Feature locked
       │   └─→ Export limit reached
       │
       ▼
┌──────────────┐
│ CONVERSION   │ → Upgrade to Paid
└──────┬───────┘
       │
       ├─→ See: Value Calculator
       │   ├─→ "You've created X clips"
       │   ├─→ "Worth $X in editing time"
       │   └─→ "Don't lose access to..."
       │
       ├─→ Choose Plan:
       │   ├─→ STARTER ($29/mo)
       │   ├─→ CREATOR ($49/mo)
       │   └─→ PRO ($99/mo)
       │
       └─→ One-click upgrade via Stripe
       │
       ▼
┌──────────────┐
│ PAID USER    │ → Ongoing Engagement
└──────┬───────┘
       │
       ├─→ Unlimited credits
       ├─→ All features unlocked
       ├─→ Priority support
       ├─→ Referral rewards
       └─→ NPS surveys (monthly)
`}</pre>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Key Milestones</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• First clip (30 sec - 5 min)</li>
                  <li>• First export (Day 1)</li>
                  <li>• First share (Day 1-2)</li>
                  <li>• Conversion (Day 5-7)</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Critical Moments</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Welcome modal (first impression)</li>
                  <li>• First clip generation (aha moment)</li>
                  <li>• Trial day 5 (upgrade prompt)</li>
                  <li>• Credits low (upgrade trigger)</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📈 Optimization Focus</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Reduce time to first clip</li>
                  <li>• Increase trial activation rate</li>
                  <li>• Improve trial-to-paid conversion</li>
                  <li>• Maximize referral sharing</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-900">
                <strong>📝 Note:</strong> This journey is continuously optimized based on analytics data from PostHog, 
                Mixpanel, and user feedback. Review quarterly and update based on conversion metrics.
              </p>
            </div>
          </div>
        </section>

        {/* PLG Features */}
        <section id="features" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 PLG Features</h2>
          
          {/* Feature 1: Referral Program */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Referral Program</h3>
                <p className="text-gray-700 mb-3">
                  Incentivize users to invite friends with credit rewards for both referrer and referee.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">How It Works:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Each user gets a unique referral code</li>
                      <li>• Referrer gets 30 credits per successful referral</li>
                      <li>• Referee gets 20 bonus credits on sign-up</li>
                      <li>• Track conversions and leaderboard</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Why It Works:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Viral coefficient &gt; 1.0 target</li>
                      <li>• Lower CAC through word-of-mouth</li>
                      <li>• Higher trust from peer recommendations</li>
                      <li>• Gamification drives engagement</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin/plg/referrals" className="text-blue-600 hover:underline">PLG Dashboard → Referrals</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Onboarding System */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Multi-Step Onboarding</h3>
                <p className="text-gray-700 mb-3">
                  Interactive, admin-controlled onboarding flow that guides new users to their "aha moment."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Multi-step interactive modals</li>
                      <li>• Progress tracking & completion rates</li>
                      <li>• Admin-controlled content (no code changes!)</li>
                      <li>• Drop-off analysis at each step</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Best Practices:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Keep to 3-5 steps maximum</li>
                      <li>• Focus on value, not features</li>
                      <li>• Show progress indicators</li>
                      <li>• Allow skipping (but track it!)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin/plg/content" className="text-blue-600 hover:underline">PLG Dashboard → Content Manager</a> | 
                    <a href="/admin/plg/onboarding" className="text-blue-600 hover:underline ml-2">Onboarding Analytics</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: NPS & Feedback */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. NPS & Feedback System</h3>
                <p className="text-gray-700 mb-3">
                  Custom NPS (Net Promoter Score) system to measure customer satisfaction and collect actionable feedback.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Metrics Tracked:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• NPS Score (Promoters - Detractors)</li>
                      <li>• Promoters (9-10): Brand advocates</li>
                      <li>• Passives (7-8): Satisfied but not loyal</li>
                      <li>• Detractors (0-6): At-risk customers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Why Custom vs. Delighted:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Save $6,000+/year in tool costs</li>
                      <li>• Full control over timing & targeting</li>
                      <li>• Integrated with our data pipeline</li>
                      <li>• Custom follow-up workflows</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin/plg/nps" className="text-blue-600 hover:underline">PLG Dashboard → NPS & Feedback</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Trial & Credits */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Trial & Credit System</h3>
                <p className="text-gray-700 mb-3">
                  7-day free trial with 60 credits to let users experience full value before payment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Trial Strategy:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 7 days = optimal conversion window</li>
                      <li>• 60 credits = enough to create 5-10 clips</li>
                      <li>• No credit card required (lower friction)</li>
                      <li>• Email reminders at day 3, 5, 7</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Upgrade Nudges:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Low credits warning (&lt; 10 remaining)</li>
                      <li>• Trial expiring soon (3 days left)</li>
                      <li>• Feature-based (export limits)</li>
                      <li>• Success-based (after 5+ exports)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin" className="text-blue-600 hover:underline">Admin Dashboard → Credit System</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Dynamic Popups */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Dynamic Popups & Messaging</h3>
                <p className="text-gray-700 mb-3">
                  Rule-based popup system for feature announcements, help prompts, and targeted messaging.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Display Rules:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Page-specific targeting</li>
                      <li>• Frequency control (once, daily, weekly)</li>
                      <li>• Time delays (show after X seconds)</li>
                      <li>• Priority system for multiple popups</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Use Cases:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Feature announcements</li>
                      <li>• Help prompts for stuck users</li>
                      <li>• Upgrade prompts for power users</li>
                      <li>• Survey & feedback collection</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin/plg/content" className="text-blue-600 hover:underline">PLG Dashboard → Content Manager → Popups</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Analytics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Comprehensive Analytics</h3>
                <p className="text-gray-700 mb-3">
                  Track every user interaction, conversion funnel, and growth metric in one place.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Key Metrics:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• User activation rate</li>
                      <li>• Trial-to-paid conversion</li>
                      <li>• Feature adoption rates</li>
                      <li>• Churn rate & reasons</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Dashboards:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• PLG Overview (all metrics)</li>
                      <li>• Referral performance</li>
                      <li>• Onboarding funnel</li>
                      <li>• NPS trends</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Admin Access:</strong> <a href="/admin/plg" className="text-blue-600 hover:underline">PLG Dashboard</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* External Platforms */}
        <section id="platforms" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔗 External Platforms</h2>
          <p className="text-gray-600 mb-6">
            While most PLG features are built in-house, we integrate with best-in-class external platforms for specialized needs.
          </p>

          {/* PostHog */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">PostHog</h3>
                <p className="text-sm text-gray-600">Product Analytics & Session Replay</p>
              </div>
              <a 
                href="https://app.posthog.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open PostHog <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What It's Used For:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Product analytics & event tracking</li>
                  <li>• Session replay (watch user sessions)</li>
                  <li>• Feature flags & A/B testing</li>
                  <li>• Conversion funnels</li>
                  <li>• User cohorts & retention</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Key Events Tracked:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">project_created</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">clips_generated</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">project_exported</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">subscription_started</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">onboarding_completed</code></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Pro Tip:</strong> Use session replay to watch exactly how users interact with your product. 
                This is invaluable for identifying UX issues and optimization opportunities.
              </p>
            </div>
          </div>

          {/* Intercom */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Intercom</h3>
                <p className="text-sm text-gray-600">Customer Support & Engagement</p>
              </div>
              <a 
                href="https://app.intercom.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open Intercom <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What It's Used For:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Live chat support</li>
                  <li>• Automated messages (welcome, help, upgrade)</li>
                  <li>• Product tours</li>
                  <li>• Email campaigns</li>
                  <li>• User segmentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Recommended Messages:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Welcome message for new users</li>
                  <li>• Help prompt after 2 min of inactivity</li>
                  <li>• Upgrade prompt for power users</li>
                  <li>• Trial expiring reminder (day 5)</li>
                  <li>• Feature announcement popups</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Pro Tip:</strong> Set up automated messages based on user behavior. For example, 
                if a user hasn't created a project after 5 minutes, show a help message.
              </p>
            </div>
          </div>

          {/* Mixpanel */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Mixpanel</h3>
                <p className="text-sm text-gray-600">Event Tracking & User Analytics</p>
              </div>
              <a 
                href="https://mixpanel.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open Mixpanel <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What It's Used For:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Event tracking & analytics</li>
                  <li>• User journey mapping</li>
                  <li>• Retention analysis</li>
                  <li>• Funnel optimization</li>
                  <li>• Cohort analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Integration Status:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ✅ Already integrated</li>
                  <li>• ✅ Event tracking active</li>
                  <li>• ✅ User properties synced</li>
                  <li>• 📊 Complements PostHog</li>
                  <li>• 🔄 Real-time data pipeline</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Pro Tip:</strong> Use Mixpanel for high-level metrics and PostHog for detailed session analysis. 
                They complement each other perfectly.
              </p>
            </div>
          </div>
        </section>

        {/* Admin Controls */}
        <section id="admin" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Admin Controls</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              All PLG features can be controlled from the admin dashboard without code changes.
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Content Manager</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Create and edit onboarding steps, popups, and banners without touching code.
                </p>
                <a href="/admin/plg/content" className="text-blue-600 hover:underline text-sm">
                  Go to Content Manager →
                </a>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Referral Management</h3>
                <p className="text-sm text-gray-600 mb-2">
                  View all referrals, leaderboard, and adjust reward amounts.
                </p>
                <a href="/admin/plg/referrals" className="text-blue-600 hover:underline text-sm">
                  Go to Referrals →
                </a>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">NPS & Feedback</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Monitor NPS scores, read feedback, and resolve issues.
                </p>
                <a href="/admin/plg/nps" className="text-blue-600 hover:underline text-sm">
                  Go to NPS Dashboard →
                </a>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Onboarding Analytics</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Track completion rates, identify drop-off points, optimize flow.
                </p>
                <a href="/admin/plg/onboarding" className="text-blue-600 hover:underline text-sm">
                  Go to Onboarding Analytics →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">📊 Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Check PostHog daily for user behavior insights</li>
                <li>• Review NPS scores weekly</li>
                <li>• Monitor trial-to-paid conversion monthly</li>
                <li>• Set up alerts for critical metrics</li>
                <li>• A/B test major changes before full rollout</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Onboarding</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Keep onboarding under 2 minutes</li>
                <li>• Focus on "aha moment" not features</li>
                <li>• Test different flows with A/B tests</li>
                <li>• Update content based on drop-off data</li>
                <li>• Personalize based on user segment</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">💬 Support</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Respond to Intercom messages within 1 hour</li>
                <li>• Use canned responses for common questions</li>
                <li>• Escalate product issues to development</li>
                <li>• Follow up on negative NPS responses</li>
                <li>• Turn feedback into feature requests</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🚀 Growth</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Promote referral program in success moments</li>
                <li>• Test different credit reward amounts</li>
                <li>• Optimize trial length based on data</li>
                <li>• Experiment with upgrade nudge timing</li>
                <li>• Celebrate user milestones</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Troubleshooting</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Onboarding not showing?</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check if steps are marked as "Active" in Content Manager</li>
                  <li>• Clear localStorage: <code className="bg-gray-100 px-1 rounded">localStorage.removeItem('onboardingCompleted')</code></li>
                  <li>• Verify API is returning steps: Check browser console</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Popups not appearing?</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check "Show On Pages" setting matches current page</li>
                  <li>• Verify frequency setting (may have been shown already)</li>
                  <li>• Clear popup views: <code className="bg-gray-100 px-1 rounded">localStorage.clear()</code></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics not tracking?</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check browser console for PostHog errors</li>
                  <li>• Verify API keys in environment variables</li>
                  <li>• Test with PostHog debug mode enabled</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Intercom not loading?</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Verify INTERCOM_APP_ID in .env.local</li>
                  <li>• Check browser console for script errors</li>
                  <li>• Ensure user is signed in (Intercom only loads for authenticated users)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">📚 Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a href="/admin/plg" className="text-blue-600 hover:underline">→ PLG Dashboard</a>
            <a href="/admin/plg/content" className="text-blue-600 hover:underline">→ Content Manager</a>
            <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">→ PostHog Analytics</a>
            <a href="https://app.intercom.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">→ Intercom Support</a>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              Last updated: December 2, 2025 | Questions? Contact the development team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
