# 📊 NPS & Feedback Setup Guide

**Goal:** Measure user satisfaction and collect actionable feedback

---

## 🎯 Why NPS (Net Promoter Score)?

**Industry Standard Metric:**
- Single question: "How likely are you to recommend us?" (0-10)
- Segments: Promoters (9-10), Passives (7-8), Detractors (0-6)
- NPS Score = % Promoters - % Detractors
- Target: NPS > 50 (excellent), > 70 (world-class)

**Used By:**
- Dropbox: NPS 66
- Notion: NPS 72
- Loom: NPS 68
- Target for ClipForge: NPS > 50

---

## 📋 Tool Choice: Delighted

**Why Delighted:**
- Simple, focused on NPS
- Affordable ($224/mo for 250 responses)
- Great for PLG companies
- Easy integration
- Beautiful surveys

**Alternatives:**
- Hotjar (more features, more expensive)
- Typeform (custom surveys)
- SurveyMonkey (enterprise)

---

## 🚀 Setup Steps

### 1. Create Delighted Account

```bash
# Go to: https://delighted.com/
# Sign up for free trial (14 days)
# Choose "Essentials" plan ($224/mo after trial)
```

### 2. Get Your API Key

```bash
# After signup:
# 1. Go to Settings → API
# 2. Copy your API Key
# 3. Add to .env.local:

NEXT_PUBLIC_DELIGHTED_API_KEY=your_api_key_here
```

### 3. Add to Layout

The widget is already created! Just add it to your root layout:

```tsx
// apps/web/app/layout.tsx
import NPSWidget from '@/components/NPSWidget';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <NPSWidget />
        </Providers>
      </body>
    </html>
  );
}
```

---

## 🎯 Survey Triggers

### Trigger 1: After 3 Exports (Aha Moment)

**When:** User completes 3rd export  
**Why:** They've experienced the value  
**Delay:** Immediately after 3rd export

**Setup:**
```typescript
// In your export success handler
if (exportCount === 3) {
  window.delighted.survey({
    email: user.email,
    name: user.name,
    delay: 0, // Show immediately
    properties: {
      trigger: 'after_3_exports',
      export_count: 3,
    },
  });
}
```

### Trigger 2: After 14 Days (Established User)

**When:** User has been active for 14 days  
**Why:** Long enough to form opinion  
**Delay:** On login after 14 days

**Setup:**
```typescript
// In your app initialization
const daysSinceSignup = Math.floor(
  (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
);

if (daysSinceSignup === 14) {
  window.delighted.survey({
    email: user.email,
    name: user.name,
    properties: {
      trigger: 'after_14_days',
      days_active: 14,
    },
  });
}
```

### Trigger 3: Before Cancellation (Save Opportunity)

**When:** User clicks "Cancel Subscription"  
**Why:** Last chance to understand issues  
**Delay:** Before cancellation confirmation

**Setup:**
```typescript
// In your cancellation flow
function handleCancelClick() {
  window.delighted.survey({
    email: user.email,
    name: user.name,
    properties: {
      trigger: 'before_cancel',
      tier: user.tier,
      reason: 'cancellation_intent',
    },
  });
}
```

### Trigger 4: After Upgrade (Paid User Feedback)

**When:** User upgrades to paid plan  
**Why:** Understand what drove conversion  
**Delay:** 7 days after upgrade

**Setup:**
```typescript
// 7 days after upgrade
if (daysSinceUpgrade === 7) {
  window.delighted.survey({
    email: user.email,
    name: user.name,
    properties: {
      trigger: 'after_upgrade',
      tier: user.tier,
      days_since_upgrade: 7,
    },
  });
}
```

---

## 🎨 Survey Customization

### Question Text

**Default:**
"How likely are you to recommend ClipForge to a friend or colleague?"

**Custom Follow-ups by Score:**

**Promoters (9-10):**
"That's great! What do you love most about ClipForge?"

**Passives (7-8):**
"Thanks for your feedback! What could we improve?"

**Detractors (0-6):**
"We're sorry to hear that. What's the main reason for your score?"

### Survey Appearance

**Colors:**
- Primary: `#4F46E5` (Indigo - matches brand)
- Background: `#FFFFFF`
- Text: `#1F2937`

**Position:**
- Bottom right
- Slide-in animation
- Dismissible

---

## 📊 User Segmentation

Segment responses by:

### 1. User Tier
```typescript
properties: {
  tier: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
}
```

**Analysis:**
- FREE tier NPS (expect lower)
- STARTER tier NPS (target: 40+)
- PRO tier NPS (target: 60+)
- BUSINESS tier NPS (target: 70+)

### 2. Usage Level
```typescript
properties: {
  export_count: number,
  days_active: number,
  last_export_date: string,
}
```

**Segments:**
- Power users (10+ exports): Expect high NPS
- Regular users (3-10 exports): Target segment
- Light users (1-2 exports): May have lower NPS

### 3. Feature Usage
```typescript
properties: {
  used_ai_clips: boolean,
  used_ai_reframe: boolean,
  used_ai_subtitles: boolean,
  caption_styles_used: number,
}
```

**Analysis:**
- Users of all features: Highest NPS
- Single feature users: Identify gaps
- Non-users: Onboarding issues?

---

## 📈 NPS Calculation

### Formula
```
NPS = % Promoters - % Detractors

Promoters: Score 9-10
Passives: Score 7-8
Detractors: Score 0-6
```

### Example
- 100 responses
- 60 Promoters (60%)
- 20 Passives (20%)
- 20 Detractors (20%)
- **NPS = 60% - 20% = 40**

### Benchmarks
- **< 0:** Poor (fix immediately)
- **0-30:** Good (room for improvement)
- **30-50:** Great (competitive)
- **50-70:** Excellent (industry leading)
- **> 70:** World-class (rare)

---

## 🎯 Action Plan by Score

### Promoters (9-10)
**Actions:**
1. Request testimonial
2. Ask for referral
3. Invite to case study
4. Feature on website
5. Offer affiliate program

**Automated Email:**
```
Subject: Thanks for the 10! 🎉

We're thrilled you love ClipForge!

Would you mind:
• Leaving a review on Product Hunt?
• Sharing your referral link (earn 30 credits)?
• Telling us your success story?

Your feedback helps us grow!
```

### Passives (7-8)
**Actions:**
1. Identify improvement areas
2. Offer product tour
3. Share new features
4. Request specific feedback
5. Follow up in 30 days

**Automated Email:**
```
Subject: How can we improve?

Thanks for your feedback!

You gave us a 7/8. We'd love to know:
• What would make it a 10?
• Which features do you use most?
• What's missing for you?

Let's chat! [Book 15-min call]
```

### Detractors (0-6)
**Actions:**
1. Immediate outreach (within 24h)
2. Understand core issues
3. Offer solution/refund
4. Prevent churn
5. Learn and improve

**Automated Email:**
```
Subject: We want to make this right

We're sorry ClipForge didn't meet your expectations.

Can we help?
• Schedule a call with our founder
• Get a full refund (no questions asked)
• Try a different plan

Your feedback is invaluable. Let's fix this.
```

---

## 📊 Analytics Dashboard

### Key Metrics to Track

**Overall:**
- NPS Score (target: > 50)
- Response rate (target: > 30%)
- Trend over time (improving?)

**By Segment:**
- NPS by tier (FREE vs PAID)
- NPS by usage (power vs light users)
- NPS by feature (which features drive satisfaction?)

**By Trigger:**
- After 3 exports NPS
- After 14 days NPS
- Before cancellation NPS
- After upgrade NPS

### Monthly Review

**Questions to Ask:**
1. Is NPS improving month-over-month?
2. Which segment has lowest NPS? (focus area)
3. What are common themes in feedback?
4. Are we converting detractors to promoters?
5. What features do promoters love most?

---

## 🔄 Feedback Loop

### 1. Collect Feedback
- NPS surveys (quantitative)
- Follow-up questions (qualitative)
- Support tickets
- Feature requests

### 2. Analyze Patterns
- Common complaints
- Feature requests
- Usability issues
- Performance problems

### 3. Prioritize Actions
- Quick wins (< 1 week)
- Medium term (1-4 weeks)
- Long term (1-3 months)

### 4. Implement Changes
- Fix bugs
- Add features
- Improve UX
- Update docs

### 5. Close the Loop
- Email users about fixes
- Thank them for feedback
- Show impact of their input
- Re-survey after changes

---

## 🎨 Additional Feedback Channels

### 1. In-App Feedback Widget

Simple feedback button in app:

```tsx
// components/FeedbackButton.tsx
export default function FeedbackButton() {
  return (
    <button
      onClick={() => {
        window.delighted.survey({
          email: user.email,
          name: user.name,
          properties: {
            trigger: 'manual_feedback',
            page: window.location.pathname,
          },
        });
      }}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700"
    >
      💬 Feedback
    </button>
  );
}
```

### 2. Feature Request Board

Use Canny or similar:
- Public roadmap
- Upvoting
- Comments
- Status updates

### 3. User Interviews

For deep insights:
- 30-min calls with power users
- Understand workflows
- Identify pain points
- Test new features

---

## 💰 Cost Optimization

**Delighted Pricing:**
- Essentials: $224/mo (250 responses)
- Premium: $449/mo (1,000 responses)
- Enterprise: Custom

**Tips to Save:**
- Target specific segments (not all users)
- Limit survey frequency (once per user per quarter)
- Use follow-up questions wisely
- Archive old responses

**ROI Calculation:**
- Cost: $224/mo
- If prevents 1 churn/month: $29-79 saved
- If drives 1 upgrade/month: $29-79 gained
- If improves product: Priceless
- **Break-even: 3-8 users impacted/month**

---

## 🎯 Success Metrics

**Week 1 Goals:**
- 30% response rate
- NPS > 30
- 50+ responses

**Month 1 Goals:**
- 40% response rate
- NPS > 40
- 200+ responses
- 10+ testimonials from promoters

**Quarter 1 Goals:**
- 50% response rate
- NPS > 50
- 1,000+ responses
- Clear improvement trends
- 5+ product improvements from feedback

---

## 🆘 Troubleshooting

**Low Response Rate?**
- Survey too frequent
- Bad timing (right after signup)
- Not enough value delivered yet
- Survey too long

**Low NPS?**
- Product issues (bugs, performance)
- Missing features
- Poor onboarding
- Pricing concerns
- Support issues

**No Feedback?**
- Follow-up questions not engaging
- No incentive to respond
- Survey dismissed too easily
- Technical issues

---

## 📚 Resources

**Documentation:**
- Delighted Docs: https://delighted.com/docs
- NPS Best Practices: https://delighted.com/nps
- Survey Design: https://delighted.com/blog/survey-design

**Books:**
- "The Ultimate Question 2.0" by Fred Reichheld
- "Measuring Customer Satisfaction and Loyalty" by Bob E. Hayes

**Benchmarks:**
- SaaS NPS Benchmarks: https://www.retently.com/blog/saas-nps-benchmarks/

---

**Status:** Ready to implement! Just need Delighted account + API Key 🚀

**Next Steps:**
1. Sign up for Delighted
2. Add API key to `.env.local`
3. Add NPSWidget to layout
4. Configure survey triggers
5. Start collecting feedback!
