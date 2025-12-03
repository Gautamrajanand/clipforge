# 🚀 ClipForge PLG & Self-Service Strategy

## Core Principle
**Every feature, UI decision, and architectural choice must optimize for self-service and product-led growth. Users discover value, upgrade, and succeed WITHOUT human intervention.**

---

## 📚 FRAMEWORKS WE FOLLOW

### Wes Bush PLG Principles
1. Design for the end user (not the buyer)
2. Reduce time-to-value (<5 minutes to aha moment)
3. Let the product sell itself (show, don't tell)
4. Build virality into the product (watermark, sharing)
5. Optimize for product-qualified leads (PQLs)

### PLG Flywheel
```
Acquisition → Activation → Revenue → Retention → Referral → Loop
```

---

## 🎯 COMPETITIVE LEARNINGS

### Opus Clip - Best Practices
**Onboarding:**
- No credit card for trial
- Instant processing (paste URL → clips in 5 min)
- Clear progress indicators
- Social proof everywhere

**Upgrade Triggers:**
- Usage limits: "2/10 free clips used"
- Feature gating: "Unlock AI B-Roll with Pro"
- Quality gating: "Get HD exports with Pro"
- Branding: "Remove watermark with Pro"

**Pricing:**
- $29/month Creator (sweet spot)
- $99/month Pro (3.4x value)
- 20% annual discount
- Clear comparison table

### Podcastle - Best Practices
**Onboarding:**
- Interactive tutorial
- Template library
- Contextual tooltips
- Progress checklist
- Email nurture sequence

**Upgrade Triggers:**
- Collaboration: "Invite team with Pro"
- Storage: "80% storage used"
- AI features: "AI enhancement with Pro"
- Integrations: "Publish to Spotify with Pro"

**Self-Service:**
- In-app help center
- Video tutorials
- Community forum
- Live chat for paid users

### Loom - PLG Gold Standard
- Instant value (30 seconds to share)
- Viral loop (every share = exposure)
- Freemium (25 videos free forever)
- Seamless in-app upgrade
- Usage-based pricing

---

## 🎨 CLIPFORGE PLG IMPLEMENTATION

### 1. ACQUISITION (Get Users In)

**Landing Page:**
- Hero: "Turn 1 Video Into 10+ Content Pieces in 5 Minutes"
- Live demo (no signup required)
- Social proof: "10,000+ creators"
- CTA: "Start Free - No Credit Card"

**Signup Flow:**
- OAuth (Google, LinkedIn) - fastest
- Optional profile questions (skippable)
- Instant redirect to dashboard
- Pre-loaded sample video

### 2. ACTIVATION (Aha Moment <5 Min)

**First-Time Experience:**
```
Welcome Modal:
"Let's create your first AI clips in 3 steps"
1. Upload or paste video URL
2. Wait 3-5 minutes (show progress)
3. See your clips! (instant value)

Progress Bar:
[●●●○○] "Analyzing video... 60% complete"
"We're finding the best moments for clips"

First Success:
🎉 "Your clips are ready!"
- Show 3-5 clips immediately
- "Download" and "Share" CTAs
- "Made with ClipForge" watermark
```

**Onboarding Checklist:**
- [ ] Upload first video
- [ ] Generate AI clips
- [ ] Download a clip
- [ ] Try AI Subtitles
- [ ] Customize caption style
- [ ] Invite a team member (PRO feature teaser)

### 3. REVENUE (Convert to Paid)

**Upgrade Triggers (In-App):**

**Usage Limits:**
```
Dashboard Banner:
"⚠️ You've used 4/5 free videos this month"
[Upgrade to Pro] → Unlock 50 videos/month
```

**Feature Gating:**
```
AI Clips Modal:
✓ Single-segment clips (FREE)
🔒 Multi-segment clips (PRO) - "Combine multiple moments"
🔒 Custom branding (PRO) - "Add your logo"

[Unlock with Pro - $29/month]
```

**Quality Gating:**
```
Export Modal:
✓ 720p export (FREE)
🔒 1080p HD export (PRO)
🔒 4K export (BUSINESS)
✓ With watermark (FREE)
🔒 No watermark (PRO)

[Upgrade to remove watermark]
```

**Time Gating:**
```
Processing Queue:
FREE: "Your video is #12 in queue (~15 min wait)"
PRO: "Priority processing - starting now!"

[Skip the line with Pro]
```

**Collaboration:**
```
Settings > Team:
"Invite team members to collaborate"
🔒 Team workspaces (BUSINESS)
🔒 Role-based permissions (BUSINESS)

[Upgrade to Business - $99/month]
```

**Upgrade Modal (Contextual):**
```
When user hits limit:

"You've reached your FREE plan limit"

FREE (Current)          PRO ($29/month)
5 videos/month    →     50 videos/month
With watermark    →     No watermark
Single clips      →     Multi-segment clips
Community support →     Priority support

[Upgrade Now] [Maybe Later]

💡 "Save $70/year with annual billing"
✅ "Cancel anytime, no questions asked"
```

### 4. RETENTION (Keep Users Active)

**Email Sequences:**

**Day 1:** Welcome + Quick Start Guide
**Day 3:** "Here's what you can do with ClipForge"
**Day 7:** Success story + tips
**Day 14:** "You're running low on credits" (if applicable)
**Day 30:** Feature spotlight (AI Subtitles, Reframe)

**In-App Engagement:**
- Weekly usage summary email
- "Your clips got 10K views!" (if integrated)
- New feature announcements
- Template library updates
- Best practices blog posts

**Usage Dashboard:**
```
Your Usage This Month:
Videos processed: 4/5 ████░ 80%
Clips generated: 23
Total views: 1,234 (if tracking enabled)
Time saved: ~8 hours

[Upgrade to Pro] for unlimited videos
```

### 5. REFERRAL (Viral Growth)

**Built-In Virality:**

**Watermark (FREE tier):**
```
Bottom-right corner of every export:
"Made with ClipForge 🎬"
Clickable → lands on signup page
```

**Share Features:**
```
After generating clips:
"Share your clips"
- Copy link (with ClipForge branding)
- Social media (auto-includes "Made with @ClipForge")
- Embed code (with attribution)
```

**Referral Program:**
```
Settings > Referrals:
"Give 1 month free, Get 1 month free"

Your referral link:
clipforge.ai/ref/gautam123

Referrals: 3 friends joined
Rewards: 3 months free earned

[Share on Twitter] [Copy Link]
```

**Team Invites:**
```
When inviting team member:
"Invite [email] to ClipForge"

They get: 1 month free trial
You get: 1 month free when they upgrade

[Send Invite]
```

---

## 🏗️ ARCHITECTURAL REQUIREMENTS

### Self-Service Infrastructure

**Must Have:**
- [ ] Stripe integration (instant upgrades)
- [ ] Stripe customer portal (self-service billing)
- [ ] Usage tracking (real-time limits)
- [ ] Feature flags (A/B testing)
- [ ] Analytics (Mixpanel/Amplitude)
- [ ] In-app messaging (Intercom/Chameleon)
- [ ] Email automation (Customer.io/Loops)
- [ ] Webhook system (payment events)

**Database Schema:**
```sql
-- Track everything for PLG
organizations:
  - tier (FREE/PRO/BUSINESS/ENTERPRISE)
  - usage_limit (videos per month)
  - usage_current (videos used this month)
  - trial_ends_at
  - subscribed_at
  - cancelled_at
  - referral_code (unique)
  - referred_by (user_id)

users:
  - onboarding_completed (boolean)
  - onboarding_step (1-5)
  - aha_moment_at (timestamp)
  - last_active_at
  - feature_flags (json)

analytics_events:
  - event_name (video_uploaded, clip_generated, etc.)
  - user_id
  - properties (json)
  - created_at
```

### Feature Gating System

**Implementation:**
```typescript
// apps/api/src/common/guards/feature.guard.ts
export class FeatureGuard {
  canAccess(user: User, feature: Feature): boolean {
    const tier = user.organization.tier;
    
    const features = {
      'multi_segment_clips': ['PRO', 'BUSINESS', 'ENTERPRISE'],
      'no_watermark': ['PRO', 'BUSINESS', 'ENTERPRISE'],
      'team_collaboration': ['BUSINESS', 'ENTERPRISE'],
      'api_access': ['BUSINESS', 'ENTERPRISE'],
      'white_label': ['ENTERPRISE'],
    };
    
    return features[feature]?.includes(tier) || false;
  }
  
  getUpgradeMessage(feature: Feature): string {
    const messages = {
      'multi_segment_clips': 'Upgrade to Pro to unlock multi-segment clips',
      'no_watermark': 'Upgrade to Pro to remove watermarks',
      'team_collaboration': 'Upgrade to Business for team features',
    };
    return messages[feature];
  }
}
```

### Usage Tracking

**Implementation:**
```typescript
// apps/api/src/common/services/usage.service.ts
export class UsageService {
  async checkLimit(orgId: string, action: 'video_upload'): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    
    const limits = {
      FREE: 5,
      PRO: 50,
      BUSINESS: -1, // unlimited
      ENTERPRISE: -1,
    };
    
    const limit = limits[org.tier];
    if (limit === -1) return true; // unlimited
    
    const usage = await this.getCurrentMonthUsage(orgId);
    return usage < limit;
  }
  
  async incrementUsage(orgId: string, action: 'video_upload'): Promise<void> {
    await this.prisma.organization.update({
      where: { id: orgId },
      data: { usage_current: { increment: 1 } },
    });
    
    // Track event for analytics
    await this.analytics.track({
      userId: orgId,
      event: 'usage_incremented',
      properties: { action, timestamp: new Date() },
    });
  }
  
  async getRemainingUsage(orgId: string): Promise<number> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    
    const limits = { FREE: 5, PRO: 50, BUSINESS: -1, ENTERPRISE: -1 };
    const limit = limits[org.tier];
    
    if (limit === -1) return Infinity;
    return Math.max(0, limit - org.usage_current);
  }
}
```

---

## 📊 KEY METRICS TO TRACK

### Acquisition Metrics
- Signups per day/week/month
- Signup conversion rate (visitor → signup)
- Traffic sources (organic, paid, referral)
- Landing page conversion rate

### Activation Metrics
- Time to first video upload
- Time to first clip generated (aha moment)
- Onboarding completion rate
- % users who complete first project

### Revenue Metrics
- Free → Paid conversion rate
- Average revenue per user (ARPU)
- Customer lifetime value (LTV)
- Churn rate (monthly, annual)
- Expansion revenue (upgrades)

### Retention Metrics
- Daily/Weekly/Monthly active users (DAU/WAU/MAU)
- Retention cohorts (Day 1, 7, 30, 90)
- Feature adoption rates
- NPS score

### Referral Metrics
- Viral coefficient (K-factor)
- Referral conversion rate
- Watermark click-through rate
- Social shares per user

---

## 🎯 SUCCESS CRITERIA

### Month 1-3 (Beta)
- 1,000 signups
- 30% activation rate (complete first video)
- 5% free → paid conversion
- <5 min time to aha moment

### Month 4-6 (Launch)
- 5,000 signups
- 40% activation rate
- 8% free → paid conversion
- $10K MRR

### Month 7-12 (Growth)
- 20,000 signups
- 50% activation rate
- 10% free → paid conversion
- $50K MRR

---

## ✅ IMPLEMENTATION CHECKLIST

### Immediate (Next 2 Weeks)
- [ ] Add usage tracking to all video uploads
- [ ] Display usage limits in dashboard
- [ ] Create upgrade modal (contextual triggers)
- [ ] Implement feature gating for PRO features
- [ ] Add Stripe integration for upgrades
- [ ] Create billing portal link

### Short-Term (Next Month)
- [ ] Build onboarding checklist UI
- [ ] Add progress indicators to processing
- [ ] Create email welcome sequence
- [ ] Implement referral system
- [ ] Add analytics tracking (Mixpanel)
- [ ] Create upgrade comparison page

### Medium-Term (Next Quarter)
- [ ] Build in-app help center
- [ ] Add video tutorials
- [ ] Create template library
- [ ] Implement A/B testing framework
- [ ] Add team collaboration features
- [ ] Build usage dashboard

---

**This is our PLG playbook. Every feature we build, every UI we design, every email we send must serve this strategy. Self-service is not optional—it's our competitive advantage.** 🚀
