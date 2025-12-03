# 🔧 Popup Stacking & Intercom Fixes

## ✅ **Issue 1: Popups Stacking - FIXED!**

**Problem**: Onboarding modal and dynamic popup showing at the same time

**Solution**: Modified `DynamicPopup.tsx` to not show popups during onboarding

**What Changed**:
```typescript
// Now checks if onboarding is completed before showing popups
const onboardingCompleted = localStorage.getItem('onboardingCompleted');
if (!onboardingCompleted) {
  return; // Don't show popups during onboarding
}
```

**Result**: 
- ✅ Onboarding shows first (when user hasn't completed it)
- ✅ Popups only show after onboarding is done
- ✅ No more stacking!

**To Test**:
```bash
# Clear onboarding status
localStorage.removeItem('onboardingCompleted');
# Refresh page
# You'll see ONLY onboarding (no popup behind it)
# Complete onboarding
# Then you'll see popups
```

---

## ⚠️ **Issue 2: Intercom Not Showing - NEEDS YOUR ACTION**

### **The Problem**:
You're using the wrong credentials! The OAuth Client ID is not the APP_ID.

### **What You Have** (from screenshots):
```
Client ID: 23215762-9505-498d-8d27-e68611702d02  ❌ Wrong!
Client Secret: 2d674287-aae8-4db0-a2d8-4e1ed32469e9  ❌ Wrong!
```

These are for **server-side API calls**, not the chat widget!

### **What You Need**:
**APP_ID** - An 8-character code like `abc12345`

---

## 🎯 **How to Find Your APP_ID**

### **Method 1: Look at Your URL** (Easiest!)
```
When you're in Intercom dashboard, look at the URL:
https://app.intercom.com/a/apps/ABC12345/inbox
                                 ^^^^^^^^
                                 This is your APP_ID!
```

### **Method 2: Installation Page**
```
1. Intercom Dashboard → Settings → Installation → Web
2. Look for JavaScript code:
   window.intercomSettings = {
     app_id: "ABC12345"  <-- Copy this!
   };
```

### **Method 3: Developer Hub**
```
Settings → Developer Hub → Your App → Basic Information
Look for "App ID" or "Workspace ID"
```

---

## 📝 **How to Fix**

### **Step 1: Get APP_ID**
Find the 8-character APP_ID using one of the methods above.

### **Step 2: Update .env.local**
```bash
# Edit file
nano apps/web/.env.local

# Change this line:
NEXT_PUBLIC_INTERCOM_APP_ID=e2960994_558b_464e_9507_916255921e164  # ❌ Wrong format

# To (example):
NEXT_PUBLIC_INTERCOM_APP_ID=abc12345  # ✅ Correct format (8 chars)

# Save: Ctrl+X, Y, Enter
```

### **Step 3: Restart Server**
```bash
# Stop server (Ctrl+C)
cd apps/web
npm run dev
```

### **Step 4: Clear Cache & Test**
```bash
# In browser console (F12):
localStorage.clear();
# Refresh page
# Look for Intercom chat bubble in bottom-right corner!
```

---

## 🧪 **Verify It's Working**

### **Check Browser Console**:
```
Open F12 → Console
Look for:
✅ "Intercom: Initializing with APP_ID: abc12345"
✅ "Intercom: Successfully booted with settings: {...}"

If you see:
❌ "Intercom: Failed to load" → APP_ID is wrong
```

### **Check for Chat Bubble**:
- ✅ Should see blue/purple chat bubble in bottom-right
- ✅ Click it to open messenger
- ✅ Your name/email should be pre-filled

---

## 📊 **Summary**

### **Fixed** ✅:
- Popup stacking issue resolved
- Onboarding shows first, popups show after
- No more overlapping modals

### **Needs Action** ⚠️:
- Find correct 8-character APP_ID from Intercom
- Update `NEXT_PUBLIC_INTERCOM_APP_ID` in `.env.local`
- Restart web server
- Intercom chat will appear!

---

## 🎯 **Quick Action Items**

1. ✅ **Popup Fix**: Already done! Refresh browser to see it work
2. ⚠️ **Intercom**: 
   - Find APP_ID from Intercom dashboard URL
   - Update `.env.local`
   - Restart server
   - See chat bubble appear!

---

**Popup stacking is fixed! Intercom just needs the correct APP_ID (8 characters, not the OAuth credentials).** 🚀

See `INTERCOM_CORRECT_SETUP.md` for detailed Intercom instructions!
