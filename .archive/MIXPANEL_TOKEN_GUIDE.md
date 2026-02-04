# 🎯 Mixpanel Token Setup - Quick Guide

**Time Required:** 2 minutes  
**Difficulty:** Easy

---

## 📋 **What Token Do You Need?**

You need your **Mixpanel Project Token** - a unique identifier that looks like this:
```
abc123def456ghi789jkl012mno345pqr678
```

---

## 🚀 **Step-by-Step Setup:**

### **1. Get Your Mixpanel Token**

#### **Option A: If you already have a Mixpanel account**
1. Go to https://mixpanel.com/
2. Log in to your account
3. Click on **Settings** (gear icon in bottom left)
4. Click **Project Settings**
5. Copy your **Project Token** (it's at the top)

#### **Option B: If you need to create a new account**
1. Go to https://mixpanel.com/register/
2. Sign up with your email (free plan available)
3. Create a project called **"ClipForge"**
4. After creation, go to **Settings → Project Settings**
5. Copy your **Project Token**

---

### **2. Add Token to Your Environment**

#### **For Local Development:**

Open this file:
```bash
apps/web/.env.local
```

Find this line (around line 15):
```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=YOUR_MIXPANEL_TOKEN_HERE
```

Replace `YOUR_MIXPANEL_TOKEN_HERE` with your actual token:
```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=abc123def456ghi789jkl012mno345pqr678
```

#### **For Docker (Production):**

Add to `docker-compose.yml` under the `web` service:
```yaml
web:
  environment:
    - NEXT_PUBLIC_MIXPANEL_TOKEN=abc123def456ghi789jkl012mno345pqr678
```

---

### **3. Restart Your Application**

#### **If using Docker:**
```bash
docker-compose restart web
```

#### **If running locally:**
```bash
cd apps/web
npm run dev
```

---

### **4. Verify It's Working**

1. Open http://localhost:3001
2. Open browser console (F12)
3. Look for this message:
   ```
   ✅ Mixpanel initialized
   ```
4. Perform an action (create project, upload video)
5. Go to Mixpanel dashboard → **Events** tab
6. You should see events appearing! 🎉

---

## 🎨 **What Events Are Tracked?**

Once configured, ClipForge automatically tracks:

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
- `video_reframed` - Video reframed
- `subtitles_generated` - Subtitles generated

### **Payment Events:**
- `checkout_started` - User clicked upgrade
- `subscription_activated` - Payment successful
- `subscription_cancelled` - User cancelled

---

## 🔍 **Troubleshooting:**

### **"Mixpanel not initialized" in console?**
- Check that your token is correct
- Make sure it starts with `NEXT_PUBLIC_` (required for Next.js)
- Restart your application after adding the token

### **"No events showing in Mixpanel dashboard?"**
- Wait 1-2 minutes (Mixpanel has a slight delay)
- Check you're viewing the correct project
- Set date range to "Last 24 hours"
- Remove any active filters

### **"Events tracked but not appearing?"**
- Open browser DevTools → Network tab
- Filter by "mixpanel"
- You should see POST requests to `api.mixpanel.com`
- If no requests, check browser console for errors

---

## 💡 **Pro Tips:**

1. **Use the same token for all environments** (dev, staging, prod) - Mixpanel has filters to separate them
2. **Set up custom dashboards** in Mixpanel for key metrics
3. **Create funnels** to track user journey (signup → upload → export)
4. **Set up alerts** for important events (e.g., new signups)
5. **Use cohorts** to group users by behavior

---

## 📊 **Recommended Dashboards:**

### **1. User Acquisition**
```
- Sign ups (daily/weekly/monthly)
- Sign up sources
- Trial activations
- Trial → Paid conversions
```

### **2. Feature Usage**
```
- AI Clips usage
- AI Reframe usage
- AI Subtitles usage
- Export count
```

### **3. Revenue Metrics**
```
- Checkout starts
- Successful payments
- Churn rate
- MRR (Monthly Recurring Revenue)
```

---

## 🎯 **Quick Reference:**

| Item | Value |
|------|-------|
| **Token Location** | Settings → Project Settings → Project Token |
| **Token Format** | 32-character alphanumeric string |
| **Environment Variable** | `NEXT_PUBLIC_MIXPANEL_TOKEN` |
| **File Location (Local)** | `apps/web/.env.local` |
| **File Location (Docker)** | `docker-compose.yml` |
| **Verification URL** | http://localhost:3001 (check console) |
| **Dashboard URL** | https://mixpanel.com/report/YOUR_PROJECT_ID/view/events |

---

## ✅ **Checklist:**

- [ ] Created Mixpanel account (or logged in)
- [ ] Created "ClipForge" project
- [ ] Copied Project Token
- [ ] Added token to `.env.local` or `docker-compose.yml`
- [ ] Restarted application
- [ ] Verified "✅ Mixpanel initialized" in console
- [ ] Tested event tracking (create project, upload video)
- [ ] Checked events in Mixpanel dashboard
- [ ] Set up key dashboards (optional)
- [ ] Set up alerts (optional)

---

## 🆘 **Need Help?**

If you're stuck:
1. Check the browser console for error messages
2. Verify your token is correct (no extra spaces)
3. Make sure the environment variable starts with `NEXT_PUBLIC_`
4. Try clearing browser cache and restarting
5. Check Mixpanel status page: https://status.mixpanel.com/

---

**That's it! Once configured, all user actions will be automatically tracked.** 📊

**Current Status:** Token placeholder added, waiting for your actual token.

**Next Steps:** 
1. Get your token from Mixpanel
2. Replace `YOUR_MIXPANEL_TOKEN_HERE` in `.env.local`
3. Restart the app
4. Watch the data flow! 🚀
