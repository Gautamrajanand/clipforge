# Mixpanel Setup Guide

**Status:** Ready to configure  
**Time Required:** 5 minutes

---

## 🎯 **What is Mixpanel?**

Mixpanel is a product analytics platform that tracks user behavior and helps you understand:
- Which features users love
- Where users drop off
- Conversion funnels
- User retention
- A/B test results

---

## 📋 **Setup Steps:**

### **1. Create Mixpanel Account**

1. Go to https://mixpanel.com/
2. Click "Get Started Free"
3. Sign up with your email
4. Create a new project called "ClipForge"

### **2. Get Your Project Token**

1. In Mixpanel dashboard, click **Settings** (gear icon)
2. Go to **Project Settings**
3. Copy your **Project Token** (looks like: `abc123def456...`)

### **3. Add Token to Environment**

**For Local Development:**
```bash
# apps/web/.env.local
NEXT_PUBLIC_MIXPANEL_TOKEN=YOUR_TOKEN_HERE
```

**For Docker:**
```bash
# Add to docker-compose.yml under web service
environment:
  - NEXT_PUBLIC_MIXPANEL_TOKEN=YOUR_TOKEN_HERE
```

### **4. Restart Frontend**

```bash
# If using Docker
docker-compose restart web

# If running locally
cd apps/web
npm run dev
```

### **5. Verify Setup**

1. Open http://localhost:3001
2. Open browser console (F12)
3. Look for: `✅ Mixpanel initialized`
4. Perform an action (create project, upload video)
5. Check Mixpanel dashboard → **Events** tab
6. You should see events appearing!

---

## 📊 **Events We Track:**

### **User Events:**
- `user_signed_up` - New user registration
- `user_signed_in` - User login
- `user_upgraded` - Subscription upgrade

### **Project Events:**
- `project_created` - New project created
- `video_uploaded` - Video file uploaded
- `video_imported_from_url` - Video imported from URL

### **Processing Events:**
- `clips_detected` - AI clip detection completed
- `clip_exported` - Clip exported
- `video_reframed` - Video reframed to new aspect ratio
- `subtitles_generated` - Subtitles generated

### **Payment Events:**
- `checkout_started` - User clicked upgrade
- `subscription_activated` - Payment successful
- `subscription_cancelled` - User cancelled

---

## 🔍 **Debugging:**

### **No Events Showing?**

1. **Check Token:**
   ```bash
   # In browser console
   console.log(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)
   ```
   Should show your token, not `undefined`

2. **Check Initialization:**
   ```bash
   # In browser console
   mixpanel
   ```
   Should show Mixpanel object, not `undefined`

3. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "mixpanel"
   - Should see POST requests to `api.mixpanel.com`

4. **Enable Debug Mode:**
   ```typescript
   // apps/web/lib/analytics.ts
   mixpanel.init(mixpanelToken, {
     debug: true, // Always show debug logs
     track_pageview: true,
     persistence: 'localStorage',
   });
   ```

### **Events Not Appearing in Dashboard?**

- **Wait 1-2 minutes** - Mixpanel has a slight delay
- **Check project** - Make sure you're viewing the correct project
- **Check date range** - Set to "Last 24 hours"
- **Check filters** - Remove any active filters

---

## 📈 **Recommended Dashboards:**

### **1. User Funnel**
```
Sign Up → Create Project → Upload Video → Export Clip
```

### **2. Feature Adoption**
```
- % users who use AI Clips
- % users who use AI Reframe
- % users who use AI Subtitles
```

### **3. Conversion Funnel**
```
Free User → View Pricing → Start Checkout → Complete Payment
```

### **4. Retention Cohorts**
```
- Day 1, 7, 30 retention
- By signup source
- By tier (FREE vs PAID)
```

---

## 🎨 **Custom Properties:**

We track these properties with every event:

```typescript
{
  // User Properties
  userId: 'user_123',
  email: 'user@example.com',
  tier: 'STARTER',
  signupDate: '2025-11-23',
  
  // Event Properties
  projectId: 'proj_456',
  videoLength: 120, // seconds
  creditsUsed: 2,
  processingType: 'CLIPS',
  aspectRatio: '9:16',
  platform: 'YouTube',
}
```

---

## 🚀 **Advanced Features:**

### **A/B Testing**
```typescript
// Check if user is in test group
const variant = mixpanel.get_group('pricing_test');
if (variant === 'variant_a') {
  // Show $29/month
} else {
  // Show $39/month
}
```

### **User Profiles**
```typescript
// Set user properties
mixpanel.people.set({
  $email: user.email,
  $name: user.name,
  tier: 'PRO',
  totalCreditsUsed: 1500,
  projectsCreated: 25,
});
```

### **Revenue Tracking**
```typescript
// Track subscription revenue
mixpanel.people.track_charge(29.00, {
  tier: 'STARTER',
  interval: 'monthly',
});
```

---

## 💡 **Tips:**

1. **Name events consistently** - Use `snake_case`
2. **Add context** - Include relevant IDs and metadata
3. **Track failures** - Don't just track successes
4. **Use cohorts** - Group users by behavior
5. **Set up alerts** - Get notified of anomalies

---

## 📚 **Resources:**

- **Mixpanel Docs:** https://docs.mixpanel.com/
- **Event Tracking Guide:** https://docs.mixpanel.com/docs/tracking/how-tos/events-and-properties
- **Funnel Analysis:** https://docs.mixpanel.com/docs/analysis/funnels
- **Retention Reports:** https://docs.mixpanel.com/docs/analysis/retention

---

## ✅ **Checklist:**

- [ ] Created Mixpanel account
- [ ] Created "ClipForge" project
- [ ] Copied project token
- [ ] Added token to `.env.local`
- [ ] Restarted frontend
- [ ] Verified initialization in console
- [ ] Tested event tracking
- [ ] Checked events in Mixpanel dashboard
- [ ] Set up key funnels
- [ ] Set up retention cohorts

---

**Once configured, you'll have powerful insights into how users interact with ClipForge!** 📊
