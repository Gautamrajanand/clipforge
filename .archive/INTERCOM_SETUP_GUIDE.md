# 📱 Intercom Setup Guide - In-App Messaging

**Goal:** Enable live chat, automated messages, and product tours for better user engagement

---

## 🎯 Why Intercom?

**Industry Standard:**
- Used by Notion, Loom, Figma, Stripe
- Best-in-class for PLG companies
- Powerful automation and segmentation

**Features We'll Use:**
- ✅ Live chat support
- ✅ Automated welcome messages
- ✅ Contextual help triggers
- ✅ Upgrade prompts
- ✅ Product tours
- ✅ User segmentation
- ✅ Message analytics

---

## 📋 Setup Steps

### 1. Create Intercom Account

```bash
# Go to: https://www.intercom.com/
# Sign up for free trial (14 days)
# Choose "Early Stage" plan ($39/mo after trial)
```

**Pricing:**
- Free: 14-day trial
- Early Stage: $39/mo (up to 1,000 users)
- Growth: $99/mo (up to 10,000 users)

### 2. Get Your App ID

```bash
# After signup:
# 1. Go to Settings → Installation
# 2. Copy your App ID (looks like: abc123de)
# 3. Add to .env.local:

NEXT_PUBLIC_INTERCOM_APP_ID=your_app_id_here
```

### 3. Add to Layout

The widget is already created! Just add it to your root layout:

```tsx
// apps/web/app/layout.tsx
import IntercomWidget from '@/components/IntercomWidget';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <IntercomWidget />
        </Providers>
      </body>
    </html>
  );
}
```

### 4. Restart Dev Server

```bash
cd apps/web
npm run dev
```

---

## 🎨 Configure Automated Messages

### Welcome Message (New Users)

**Trigger:** User signs up  
**Message:**
```
👋 Welcome to ClipForge!

I'm here to help you create viral clips in minutes.

Quick start:
1. Upload your video
2. Let AI detect the best moments
3. Export with captions

Need help? Just ask! 🚀
```

**Setup in Intercom:**
1. Go to Messages → New message
2. Choose "Send automatically"
3. Trigger: User signs up
4. Delay: Immediately
5. Paste message above

### Help Offer (Stuck Users)

**Trigger:** User on page > 2 minutes, no action  
**Message:**
```
Need help getting started? 🤔

I can show you:
• How to upload videos
• How AI clip detection works
• How to customize captions

Want a quick tour?
```

**Setup:**
1. Messages → New message
2. Trigger: Time on page > 2 minutes
3. Target: Users with 0 exports
4. Paste message

### Upgrade Prompt (Credit Limit)

**Trigger:** User reaches 80% of credits  
**Message:**
```
You're almost out of credits! 😅

You've created amazing clips. Want to keep going?

Upgrade to Pro:
• 300 credits/month
• Priority processing
• Advanced styles

[Upgrade Now]
```

**Setup:**
1. Messages → New message
2. Trigger: Custom attribute "credits_remaining" < 20%
3. Target: Free tier users
4. Paste message

### Export Success (Celebration)

**Trigger:** First export completed  
**Message:**
```
🎉 Your first clip is ready!

Great job! Here's what you can do next:

• Download your clip
• Share with your referral link (earn 30 credits!)
• Customize caption styles
• Export more clips

Keep creating! 🚀
```

**Setup:**
1. Messages → New message
2. Trigger: Event "export_completed"
3. Target: Users with 1 export
4. Paste message

---

## 🎯 User Segmentation

Create these segments in Intercom:

### 1. New Users (0-7 days)
- **Purpose:** Onboarding messages
- **Filter:** Created < 7 days ago
- **Messages:** Welcome, help, quick tips

### 2. Active Users (1+ exports)
- **Purpose:** Engagement, upgrades
- **Filter:** Has completed export
- **Messages:** Tips, advanced features, referrals

### 3. Stuck Users (No exports)
- **Purpose:** Activation help
- **Filter:** Created > 3 days, 0 exports
- **Messages:** Help offers, tutorials, support

### 4. Power Users (10+ exports)
- **Purpose:** Retention, testimonials
- **Filter:** 10+ exports
- **Messages:** Thank you, testimonial request, pro features

### 5. Free Tier (Near Limit)
- **Purpose:** Conversion
- **Filter:** Free tier, credits < 20%
- **Messages:** Upgrade prompts, value props

---

## 📊 Track Custom Events

Send events from your app to trigger messages:

```typescript
// When user completes export
window.Intercom('trackEvent', 'export_completed', {
  clip_count: 1,
  aspect_ratio: '9:16',
  caption_style: 'modern',
});

// When user views pricing
window.Intercom('trackEvent', 'viewed_pricing', {
  current_tier: 'FREE',
  credits_remaining: 30,
});

// When user hits credit limit
window.Intercom('trackEvent', 'credits_depleted', {
  tier: 'FREE',
  exports_count: 5,
});
```

---

## 🎨 Customize Widget Appearance

In Intercom Settings → Messenger:

**Colors:**
- Primary: `#4F46E5` (Indigo - matches brand)
- Background: `#FFFFFF`

**Position:**
- Bottom right
- 20px from edge

**Launcher:**
- Show on all pages
- Custom text: "Need help? 💬"

**Away Message:**
- "We typically reply in under 5 minutes"

---

## 🤖 Setup Product Tours

### Tour 1: First Upload

**Steps:**
1. "Click here to upload your video"
2. "AI will analyze and find the best moments"
3. "Preview your clips here"
4. "Customize captions and export!"

**Trigger:** First login, 0 projects

### Tour 2: Export Flow

**Steps:**
1. "Select clips you want to export"
2. "Choose aspect ratio (9:16 for TikTok/Reels)"
3. "Pick a caption style"
4. "Click export and wait 2-3 minutes"

**Trigger:** First project created, 0 exports

---

## 📈 Analytics to Track

Monitor these metrics in Intercom:

**Engagement:**
- Message open rate (target: >60%)
- Response rate (target: >40%)
- Conversation resolution time (target: <5 min)

**Conversion:**
- Messages → Upgrades (track with events)
- Help messages → Exports (activation)
- Tour completion rate (target: >70%)

**Support:**
- Average response time
- Customer satisfaction (CSAT)
- Common questions (create help articles)

---

## 🔧 Advanced Features

### 1. Operator Assignment

Assign conversations to team members:
- Support: General questions
- Sales: Upgrade inquiries
- Product: Feature requests

### 2. Saved Replies

Create templates for common questions:
- "How to upload videos"
- "Credit system explained"
- "Export troubleshooting"
- "Pricing plans comparison"

### 3. Help Center Integration

Link to help articles in messages:
- Getting started guide
- Video tutorials
- FAQ
- API documentation

### 4. Mobile App Support

Intercom works on mobile too:
- iOS SDK available
- Android SDK available
- Same messages, same data

---

## 🚀 Launch Checklist

Before going live:

- [ ] App ID configured in `.env.local`
- [ ] Widget added to layout
- [ ] Welcome message created
- [ ] Help offer message created
- [ ] Upgrade prompt created
- [ ] User segments created
- [ ] Product tours created
- [ ] Custom events tracked
- [ ] Team members invited
- [ ] Away message set
- [ ] Widget appearance customized
- [ ] Test in incognito mode

---

## 💰 Cost Optimization

**Free Tier Limits:**
- 14-day trial
- Unlimited messages
- All features included

**After Trial:**
- Early Stage: $39/mo (1,000 users)
- Only pay for active users
- Pause anytime

**Tips to Save:**
- Archive inactive users
- Use automated messages (free)
- Self-service help center
- Efficient operator assignment

---

## 🎯 Success Metrics

**Week 1 Goals:**
- 50% of users see welcome message
- 20% engage with chat
- 5% complete product tour

**Month 1 Goals:**
- 70% message open rate
- 40% response rate
- 10% conversion from free → paid via chat
- <5 min average response time

**Quarter 1 Goals:**
- 1,000+ conversations
- 80% CSAT score
- 15% upgrade rate from chat
- 50% reduction in support tickets

---

## 🆘 Troubleshooting

**Widget not showing?**
- Check App ID in `.env.local`
- Verify user is signed in
- Check browser console for errors
- Try incognito mode

**Messages not sending?**
- Verify triggers are active
- Check user segments
- Test with test user
- Check Intercom status page

**Events not tracking?**
- Verify `window.Intercom` exists
- Check event names (case-sensitive)
- Test in browser console
- Check Intercom debugger

---

## 📚 Resources

**Documentation:**
- Intercom Docs: https://developers.intercom.com/
- React Integration: https://developers.intercom.com/installing-intercom/docs/intercom-for-web
- API Reference: https://developers.intercom.com/intercom-api-reference/

**Support:**
- Intercom Support: support@intercom.com
- Community: https://community.intercom.com/
- Status: https://status.intercom.com/

---

**Status:** Ready to implement! Just need Intercom account + App ID 🚀
