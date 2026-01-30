# Production Debugging Steps

## Current Issue
Credits showing "... / 60 Needs Loading..." on production dashboard at https://clipforge-seven.vercel.app/dashboard

## What We Know
✅ API is healthy: https://clipforge-api.onrender.com/health returns OK
✅ Redis, Database, Storage all connected
✅ Clerk env vars set on Render API
✅ Vercel env vars set correctly (NEXT_PUBLIC_API_URL, Clerk keys)
✅ CORS allows clipforge-seven.vercel.app
❌ Credits API call failing with authentication error

## Most Likely Causes

### 1. Browser Console Errors (CHECK THIS FIRST)
Open browser DevTools on https://clipforge-seven.vercel.app/dashboard:
- Press F12 or Cmd+Option+I
- Go to **Console** tab
- Look for errors like:
  - "No authentication token available"
  - "Failed to fetch credits"
  - CORS errors
  - Network errors

### 2. Network Tab Investigation
In DevTools:
- Go to **Network** tab
- Refresh the page
- Look for request to `https://clipforge-api.onrender.com/v1/credits/balance`
- Click on it and check:
  - **Status Code:** Should be 200, probably showing 401
  - **Request Headers:** Check if `Authorization: Bearer <token>` is present
  - **Response:** Check error message

### 3. Clerk Token Issue
The frontend calls `getToken()` from Clerk's `useAuth()` hook. If this returns null:
- User might not be fully authenticated
- Clerk session might be expired
- Clerk configuration mismatch between frontend and backend

## Quick Tests

### Test 1: Check if user is signed in
In browser console on dashboard:
```javascript
console.log('Signed in:', window.Clerk?.user?.id)
```

### Test 2: Try to get token manually
```javascript
const token = await window.Clerk?.session?.getToken()
console.log('Token:', token ? 'EXISTS' : 'NULL')
```

### Test 3: Manual API call with token
```javascript
const token = await window.Clerk?.session?.getToken()
fetch('https://clipforge-api.onrender.com/v1/credits/balance', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

## Possible Solutions

### Solution A: Clear Browser Cache & Cookies
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data: DevTools → Application → Clear storage
3. Sign out and sign back in

### Solution B: Verify Clerk Configuration Match
Frontend (Vercel) and Backend (Render) must use the SAME Clerk instance:
- Frontend: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
- Backend: `CLERK_SECRET_KEY=sk_test_...`

Both should start with `pk_test_` and `sk_test_` (same test/prod environment)

### Solution C: Redeploy Both Services
1. Redeploy Vercel frontend (to ensure env vars loaded)
2. Redeploy Render API (to ensure Clerk SDK initialized)

### Solution D: Check Clerk Dashboard
Go to https://dashboard.clerk.com:
1. Verify the application is active
2. Check if there are any API key issues
3. Verify JWT template is correct

## Next Steps

1. **Open browser console** on production dashboard
2. **Share the console errors** with me
3. **Check Network tab** for the failing API request
4. Based on errors, we'll know exactly what's wrong

The issue is definitely authentication-related. We need to see the actual browser error to pinpoint it.
