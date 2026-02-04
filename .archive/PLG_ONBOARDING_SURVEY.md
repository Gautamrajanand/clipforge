# PLG Onboarding Survey - Best Practices

## Why Add an Onboarding Survey?

**Industry Best Practices:**
- Notion asks about team size and use case
- Loom asks about role and recording goals
- Canva asks about design purpose
- Grammarly asks about writing goals

**Benefits:**
1. **Personalization** - Show relevant features first
2. **Segmentation** - Target messaging by user type
3. **Conversion** - Higher activation with relevant onboarding
4. **Data** - Understand your users better
5. **Retention** - Users who complete survey have 2-3x better retention

---

## Recommended Questions for ClipForge

### Question 1: What's your role?
**Options:**
- 📹 Content Creator
- 📱 Social Media Manager
- 🎬 Video Editor
- 🏢 Marketing Professional
- 🎯 Agency Owner
- 👥 Other

**Why:** Determines feature priority and messaging

---

### Question 2: What's your main goal?
**Options:**
- 🚀 Grow my audience
- ⏱️ Save time editing
- 💰 Monetize my content
- 📊 Improve engagement
- 🎨 Create professional content
- 🔄 Repurpose long-form content

**Why:** Helps show relevant use cases and templates

---

### Question 3: Where do you publish?
**Options (multi-select):**
- YouTube
- TikTok
- Instagram Reels
- LinkedIn
- Twitter/X
- Facebook
- Other

**Why:** Determines aspect ratio defaults and export settings

---

### Question 4: How often do you create content?
**Options:**
- 📅 Daily
- 📆 Weekly
- 🗓️ Monthly
- 🎯 Occasionally
- 🆕 Just starting

**Why:** Determines credit allocation and upgrade timing

---

### Question 5: Team size?
**Options:**
- 👤 Solo creator
- 👥 2-5 people
- 🏢 6-20 people
- 🏭 20+ people

**Why:** Determines collaboration features and pricing tier

---

## Implementation Plan

### Phase 1: Modal Design
```tsx
<WelcomeModal>
  <Step 1: Welcome + Value Prop />
  <Step 2: Role Selection />
  <Step 3: Goal Selection />
  <Step 4: Platform Selection />
  <Step 5: Quick Tutorial />
</WelcomeModal>
```

### Phase 2: Data Storage
```prisma
model User {
  // ... existing fields
  onboardingRole       String?  // Content Creator, etc.
  onboardingGoal       String?  // Grow audience, etc.
  onboardingPlatforms  String[] // [YouTube, TikTok, etc.]
  onboardingFrequency  String?  // Daily, Weekly, etc.
  onboardingTeamSize   String?  // Solo, 2-5, etc.
  onboardingCompletedAt DateTime?
}
```

### Phase 3: Personalization
- Show relevant templates based on platform
- Adjust aspect ratio defaults
- Customize email sequences
- Target upgrade prompts

---

## Best Practices

### DO:
✅ Keep it short (3-5 questions max)
✅ Make it skippable (with "Skip for now" option)
✅ Show progress indicator
✅ Use visuals/icons for options
✅ Explain why you're asking
✅ Save partial progress
✅ Show immediate value after completion

### DON'T:
❌ Ask for too much information upfront
❌ Make it mandatory (creates friction)
❌ Use long text fields
❌ Ask sensitive questions
❌ Make it feel like a form
❌ Forget to use the data

---

## Example Flow

### Welcome Screen:
```
🎬 Welcome to ClipForge!

Let's personalize your experience in 30 seconds.
This helps us show you the most relevant features.

[Get Started] [Skip for now]
```

### Question Screen:
```
What's your role? (1/3)

[📹 Content Creator]
[📱 Social Media Manager]
[🎬 Video Editor]
[🏢 Marketing Professional]

[Back] [Next]
```

### Completion Screen:
```
🎉 You're all set!

Based on your answers, we've:
✅ Set default aspect ratio to 9:16 (TikTok/Reels)
✅ Enabled auto-captions
✅ Prepared templates for content creators

[Start Creating]
```

---

## Analytics to Track

1. **Completion Rate** - % who finish survey
2. **Drop-off Points** - Which question causes abandonment
3. **Time to Complete** - Should be < 60 seconds
4. **Skip Rate** - % who skip vs complete
5. **Activation Correlation** - Survey completers vs non-completers

---

## Priority: HIGH

**Why implement this:**
- Industry standard for PLG products
- Significantly improves activation rates
- Provides valuable user insights
- Enables better personalization
- Increases conversion to paid

**When to implement:**
- After current onboarding flow is stable
- Before major marketing push
- As part of PLG optimization sprint

---

## Next Steps

1. Design survey questions (DONE above)
2. Create modal UI component
3. Add database fields
4. Implement data collection
5. Build personalization logic
6. Track analytics
7. A/B test survey vs no survey

**Estimated effort:** 2-3 days for full implementation
**Expected impact:** +20-30% activation rate improvement
