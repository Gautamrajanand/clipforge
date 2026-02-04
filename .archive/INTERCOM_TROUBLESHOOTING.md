# Intercom Troubleshooting Guide

**Issue:** Intercom widget opens but shows blank screen  
**Priority:** P1  
**Impact:** Support channel unavailable

---

## 🔍 Quick Diagnosis

### Step 1: Check Browser Console
Open browser console (F12) and look for:

```javascript
// Success indicators:
✅ Intercom: Successfully booted with settings
✅ Intercom messenger loaded

// Error indicators:
❌ Intercom: Failed to boot
❌ CORS error
❌ CSP violation
❌ Network error loading Intercom
```

### Step 2: Check Intercom Dashboard
1. Log into [Intercom Dashboard](https://app.intercom.com)
2. Go to **Settings → Messenger**
3. Verify:
   - ✅ Messenger is **enabled**
   - ✅ **Identity verification** is OFF (or properly configured)
   - ✅ **Domains** include `localhost:3000` and your production domain
   - ✅ **Messenger settings** allow anonymous users (if needed)

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "intercom"
3. Look for failed requests
4. Check response codes (should be 200)

---

## 🛠️ Common Fixes

### Fix 1: Messenger Not Enabled
**Symptom:** Widget appears but is blank

**Solution:**
1. Go to Intercom Dashboard → Settings → Messenger
2. Toggle "Enable Messenger" to ON
3. Click "Save changes"
4. Refresh your app

---

### Fix 2: Development Domain Not Whitelisted
**Symptom:** Works in production but not localhost

**Solution:**
1. Go to Intercom Dashboard → Settings → Installation
2. Add `localhost:3000` to allowed domains
3. Add `127.0.0.1:3000` as well
4. Save and refresh

---

### Fix 3: Identity Verification Mismatch
**Symptom:** User data not showing, blank messenger

**Solution:**
1. Go to Intercom Dashboard → Settings → Identity verification
2. **Option A:** Disable identity verification (easier for dev)
3. **Option B:** Implement HMAC signature properly:

```typescript
// Backend: Generate user hash
import crypto from 'crypto';

const generateIntercomHash = (userId: string) => {
  const secret = process.env.INTERCOM_SECRET_KEY;
  return crypto
    .createHmac('sha256', secret)
    .update(userId)
    .digest('hex');
};

// Frontend: Pass hash to Intercom
Intercom('boot', {
  app_id: 'fre16aaf',
  user_id: user.id,
  user_hash: userHash, // From backend
  email: user.email,
  name: user.name,
});
```

---

### Fix 4: CSP (Content Security Policy) Blocking
**Symptom:** Console shows CSP violation errors

**Solution:**
Add Intercom domains to your CSP headers:

```typescript
// next.config.js or middleware
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://widget.intercom.io https://js.intercomcdn.com;
  connect-src 'self' https://api-iam.intercom.io wss://nexus-websocket-a.intercom.io;
  frame-src 'self' https://intercom-sheets.com;
  img-src 'self' data: https://static.intercomcdn.com https://js.intercomcdn.com;
`;
```

---

### Fix 5: Adblocker Interference
**Symptom:** Works for some users, not others

**Solution:**
1. Disable adblocker (uBlock Origin, AdBlock Plus, etc.)
2. Add exception for your domain
3. Test in incognito mode
4. Consider using Intercom's alternative loading method

---

### Fix 6: Incorrect App ID
**Symptom:** Widget doesn't load at all

**Solution:**
Verify your app ID in the code matches Intercom dashboard:

```typescript
// Current app ID
const INTERCOM_APP_ID = 'fre16aaf';

// Check in Intercom Dashboard → Settings → Installation
// Should match exactly
```

---

### Fix 7: User Data Missing
**Symptom:** Messenger loads but doesn't identify user

**Solution:**
Ensure user data is passed correctly:

```typescript
// components/IntercomWidget.tsx
Intercom('boot', {
  app_id: 'fre16aaf',
  user_id: user.id,           // ✅ Required
  email: user.emailAddresses[0]?.emailAddress, // ✅ Required
  name: user.fullName || user.firstName,       // ✅ Recommended
  created_at: Math.floor(new Date(user.createdAt).getTime() / 1000), // Unix timestamp
  // Custom attributes
  tier: 'FREE',
  credits: 60,
});
```

---

## 🧪 Testing Steps

### Test 1: Basic Load
```javascript
// In browser console
window.Intercom('show');
// Should open messenger
```

### Test 2: User Identification
```javascript
// In browser console
window.Intercom('getVisitorId');
// Should return visitor ID
```

### Test 3: Send Test Message
```javascript
// In browser console
window.Intercom('showNewMessage', 'Test message from console');
// Should open messenger with pre-filled message
```

---

## 📋 Verification Checklist

Before marking as fixed, verify:

- [ ] Widget visible in bottom-right corner
- [ ] Clicking widget opens messenger (not blank)
- [ ] User name and email displayed correctly
- [ ] Can send and receive messages
- [ ] No console errors
- [ ] Works in incognito mode
- [ ] Works on different browsers (Chrome, Firefox, Safari)
- [ ] Works on mobile devices
- [ ] Custom attributes showing in Intercom dashboard
- [ ] Conversations appear in Intercom inbox

---

## 🔧 Advanced Debugging

### Enable Intercom Debug Mode
```javascript
// In browser console
localStorage.setItem('intercom-debug', 'true');
// Reload page
// Check console for detailed logs
```

### Check Intercom Status
```javascript
// In browser console
window.Intercom('onShow', () => console.log('Messenger opened'));
window.Intercom('onHide', () => console.log('Messenger closed'));
window.Intercom('onUnreadCountChange', (count) => console.log('Unread:', count));
```

### Manually Trigger Boot
```javascript
// If auto-boot fails, try manual boot
window.Intercom('boot', {
  app_id: 'fre16aaf',
  email: 'test@example.com',
  name: 'Test User',
});
```

---

## 🚨 Known Issues

### Issue 1: Blank Screen on First Load
**Cause:** Intercom script not fully loaded  
**Fix:** Add loading state and retry logic

```typescript
const [intercomReady, setIntercomReady] = useState(false);

useEffect(() => {
  const checkIntercom = setInterval(() => {
    if (window.Intercom) {
      setIntercomReady(true);
      clearInterval(checkIntercom);
    }
  }, 100);

  return () => clearInterval(checkIntercom);
}, []);
```

### Issue 2: Widget Disappears After Navigation
**Cause:** React re-rendering unmounts widget  
**Fix:** Use `useEffect` cleanup properly

```typescript
useEffect(() => {
  // Boot Intercom
  Intercom('boot', {...});

  // Don't shutdown on unmount
  return () => {
    // Intercom('shutdown'); // ❌ Don't do this
  };
}, []);
```

### Issue 3: Multiple Intercom Instances
**Cause:** Component mounting multiple times  
**Fix:** Add singleton check

```typescript
const [isBooted, setIsBooted] = useState(false);

useEffect(() => {
  if (isBooted) return;
  
  Intercom('boot', {...});
  setIsBooted(true);
}, [isBooted]);
```

---

## 📞 Escalation Path

If none of the above fixes work:

1. **Check Intercom Status Page**
   - https://status.intercom.com
   - Look for ongoing incidents

2. **Contact Intercom Support**
   - Email: support@intercom.com
   - Include:
     - App ID: `fre16aaf`
     - Browser console logs
     - Network tab screenshots
     - Steps to reproduce

3. **Alternative Support Channels**
   - Implement fallback: Email support button
   - Add "Contact Us" form
   - Link to help documentation

---

## ✅ Success Criteria

Intercom is working when:
- ✅ Widget loads without errors
- ✅ Messenger opens with content (not blank)
- ✅ User information displays correctly
- ✅ Messages send and receive
- ✅ Conversations sync to Intercom dashboard
- ✅ No console errors
- ✅ Works across browsers and devices

---

## 📚 Resources

- [Intercom Developer Docs](https://developers.intercom.com/)
- [Intercom JavaScript API](https://developers.intercom.com/installing-intercom/docs/intercom-javascript)
- [Intercom Messenger Settings](https://www.intercom.com/help/en/articles/180-customize-the-intercom-messenger)
- [Identity Verification](https://developers.intercom.com/installing-intercom/docs/enable-identity-verification-on-your-web-product)

---

**Last Updated:** December 5, 2025  
**Status:** Troubleshooting guide complete  
**Next Steps:** Test each fix systematically
