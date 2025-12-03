# 🔧 Intercom Setup - CORRECT APP_ID Guide

## ⚠️ **IMPORTANT: You're Looking at the Wrong Credentials!**

### **What You Found** (in your screenshots):
```
Client ID: 23215762-9505-498d-8d27-e68611702d02
Client Secret: 2d674287-aae8-4db0-a2d8-4e1ed32469e9
```

**These are OAuth credentials for API calls - NOT the APP_ID for the chat widget!**

---

## ✅ **What We Actually Need: APP_ID**

The APP_ID is a **short 8-character code** that identifies your Intercom workspace.

### **How to Find Your APP_ID**

#### **Method 1: From Your Dashboard URL** (Easiest!)
```
1. Look at your browser URL when in Intercom dashboard
2. URL format: https://app.intercom.com/a/apps/YOUR_APP_ID/...
3. Example: https://app.intercom.com/a/apps/abc12345/inbox
4. Your APP_ID is: abc12345
```

#### **Method 2: From Installation Page**
```
1. Go to: Intercom Dashboard
2. Click: Settings (gear icon) → Installation → Web
3. Look for: "Install Intercom on your website"
4. You'll see JavaScript code like:

   window.intercomSettings = {
     app_id: "abc12345"  <-- THIS IS YOUR APP_ID!
   };

5. Copy that app_id value (usually 8 characters)
```

#### **Method 3: From Developer Hub**
```
1. Go to: Settings → Developer Hub
2. Click on your app (Clipforge)
3. Look for: "App ID" or "Workspace ID"
4. It's displayed at the top of the Basic Information section
```

---

## 🎯 **Correct Format**

### **APP_ID Should Look Like**:
✅ **Correct**: `abc12345` (8 chars, alphanumeric)  
✅ **Correct**: `e2960994` (8 chars, alphanumeric)  
✅ **Correct**: `h7x2k9p1` (8 chars, alphanumeric)  

### **NOT Like This**:
❌ **Wrong**: `e2960994_558b_464e_9507_916255921e164` (too long, has underscores)  
❌ **Wrong**: `23215762-9505-498d-8d27-e68611702d02` (this is OAuth Client ID)  
❌ **Wrong**: `dG9rOmUyOTYwOTk0...` (this is API token)  

---

## 📝 **How to Update**

### **Step 1: Find Your APP_ID**
Look at your Intercom dashboard URL or installation page and find the 8-character code.

### **Step 2: Update Environment Variable**
```bash
# Edit the file
nano apps/web/.env.local

# Find this line:
NEXT_PUBLIC_INTERCOM_APP_ID=e2960994_558b_464e_9507_916255921e164

# Replace with correct APP_ID (example):
NEXT_PUBLIC_INTERCOM_APP_ID=abc12345

# Save: Ctrl+X, then Y, then Enter
```

### **Step 3: Restart Web Server**
```bash
# Stop current server (Ctrl+C)
# Restart:
cd apps/web
npm run dev
```

### **Step 4: Test in Browser**
```bash
# Open browser console (F12)
# Clear cache:
localStorage.clear();
# Refresh page
```

---

## 🧪 **How to Verify It's Working**

### **Test 1: Check Console Logs**
Open browser console (F12) and look for:
```
✅ "Intercom: Initializing with APP_ID: abc12345"
✅ "Intercom: Successfully booted with settings: {...}"

❌ "Intercom: Failed to load - window.Intercom not found" (means wrong APP_ID)
```

### **Test 2: Check Intercom Object**
In browser console:
```javascript
console.log(window.Intercom);
// Should show: function() {...}

console.log(window.intercomSettings);
// Should show: { app_id: "abc12345", user_id: "...", ... }
```

### **Test 3: Look for Chat Bubble**
- ✅ Should see Intercom chat bubble in **bottom-right corner**
- ✅ Clicking it should open messenger
- ✅ Your name and email should be pre-filled

---

## 🎨 **Visual Guide: Where is APP_ID?**

### **In Your Dashboard URL**:
```
https://app.intercom.com/a/apps/ABC12345/inbox
                                 ^^^^^^^^
                                 This is your APP_ID!
```

### **In Installation Code**:
```javascript
<script>
  window.intercomSettings = {
    app_id: "ABC12345",  // <-- This is your APP_ID!
    // ... other settings
  };
</script>
```

---

## 🔐 **What About Those OAuth Credentials?**

The credentials you found (Client ID and Client Secret) are for **server-side API calls**.

### **Already Configured** ✅:
```bash
# In apps/api/.env (backend)
INTERCOM_API_KEY=dG9rOmUyOTYwOTk0XzU1OGJfNDY0ZV85NTA3XzkxNjI1NTkyZTE2NDoxOjA=
```

These are used for:
- Sending messages from server
- Creating/updating users programmatically
- API integrations

### **What We Need Now**:
```bash
# In apps/web/.env.local (frontend)
NEXT_PUBLIC_INTERCOM_APP_ID=abc12345  # <-- The 8-character APP_ID
```

This is used for:
- Loading the chat widget
- Showing messenger to users
- Real-time chat functionality

---

## 🚨 **Common Mistakes**

### **Mistake 1: Using OAuth Client ID**
```bash
❌ NEXT_PUBLIC_INTERCOM_APP_ID=23215762-9505-498d-8d27-e68611702d02
✅ NEXT_PUBLIC_INTERCOM_APP_ID=abc12345
```

### **Mistake 2: Using API Token**
```bash
❌ NEXT_PUBLIC_INTERCOM_APP_ID=dG9rOmUyOTYwOTk0...
✅ NEXT_PUBLIC_INTERCOM_APP_ID=abc12345
```

### **Mistake 3: Using Wrong Format**
```bash
❌ NEXT_PUBLIC_INTERCOM_APP_ID=e2960994_558b_464e_9507_916255921e164
✅ NEXT_PUBLIC_INTERCOM_APP_ID=e2960994
```

---

## 📋 **Quick Checklist**

- [ ] Found APP_ID from Intercom dashboard (should be ~8 characters)
- [ ] Verified it's NOT the OAuth Client ID
- [ ] Verified it's NOT the API token
- [ ] Updated `apps/web/.env.local` with correct APP_ID
- [ ] Restarted web server (`npm run dev`)
- [ ] Cleared browser cache (`localStorage.clear()`)
- [ ] Checked browser console for success message
- [ ] See Intercom chat bubble in bottom-right corner

---

## 💡 **Still Not Working?**

### **1. Check Network Tab**
```
F12 → Network → Filter: "intercom"
Should see: widget.js loading with 200 status
```

### **2. Verify Domain Whitelist**
```
Intercom Settings → Installation → Web
Make sure "localhost:3001" is in allowed domains
```

### **3. Try Incognito Mode**
```
Sometimes browser cache persists
Open incognito window and test there
```

### **4. Check Intercom Status**
```
Visit: https://status.intercom.com
Make sure all systems operational
```

---

## 🎯 **Summary**

### **What You Need**:
1. ✅ Find 8-character APP_ID from Intercom dashboard
2. ✅ Update `NEXT_PUBLIC_INTERCOM_APP_ID` in `.env.local`
3. ✅ Restart web server
4. ✅ See chat bubble appear in bottom-right

### **What You DON'T Need**:
- ❌ OAuth Client ID (already used for API)
- ❌ Client Secret (already used for API)
- ❌ API Token (already configured in backend)

---

**The key is finding that 8-character APP_ID from your Intercom dashboard URL or installation page!** 🔑

**Once you have it, update the .env.local file and restart the server. The chat bubble will appear!** 🎉
