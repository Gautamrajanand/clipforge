# Clerk Email Issue - Fix Required

## 🔴 Problem Identified

**Root Cause:** Clerk JWT tokens don't include the user's email address by default.

**Evidence:**
- Backend logs show: `user_35mUyfMlUB3csLy2NAV0v0P2ThS@clerk.local`
- User not created in database with real email
- All API calls fail with 401 because user doesn't exist

## 🔧 Solution

### Option 1: Configure Clerk JWT Template (RECOMMENDED)

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to: **JWT Templates**
3. Create or edit the default template
4. Add these claims to the token:
   ```json
   {
     "email": "{{user.primary_email_address}}",
     "email_verified": "{{user.primary_email_address_verified}}",
     "name": "{{user.full_name}}",
     "first_name": "{{user.first_name}}",
     "last_name": "{{user.last_name}}"
   }
   ```

### Option 2: Use Clerk's User API (Fallback)

If JWT template doesn't work, we can fetch user data from Clerk's API in the backend:

```typescript
// In ClerkAuthGuard
import { clerkClient } from '@clerk/clerk-sdk-node';

// After verifying token
const clerkUser = await clerkClient.users.getUser(payload.sub);
const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
```

## 📋 Steps to Fix

### Immediate Fix (Option 1):

1. **Login to Clerk Dashboard**
   - URL: https://dashboard.clerk.com
   - Select your application

2. **Configure JWT Template**
   - Go to "JWT Templates" in sidebar
   - Click "New template" or edit "Default"
   - Template name: `default` or `clipforge`
   - Add custom claims (see above)
   - Save template

3. **Update Frontend (if using custom template)**
   ```typescript
   // In dashboard/page.tsx and other places
   const token = await getClerkToken({ template: 'clipforge' });
   ```

4. **Test**
   - Delete old user from database
   - Sign out and sign in again
   - Check if email appears in JWT

### Verification:

```bash
# Check if new user was created with real email
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT id, email, \"clerkId\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

## 🎯 Expected Result

After fix:
- JWT token includes real email address
- User created in database with `gautamranand@gmail.com`
- All API calls work (no more 401 errors)
- Onboarding progress tracked correctly

## 🔍 Debug Commands

### Check JWT Token Contents:
```javascript
// In browser console
const token = await window.Clerk.session.getToken();
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);
```

### Check Backend Logs:
```bash
docker logs clipforge-api --tail 100 | grep -i "email\|sync"
```

### Check Database:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT * FROM \"User\";"
```

## ⚠️ Important Notes

1. **Clerk Test vs Production**
   - We're using test keys: `pk_test_...` and `sk_test_...`
   - JWT template must be configured for test environment

2. **Token Refresh**
   - After changing JWT template, users must sign out and sign in again
   - Old tokens won't have new claims

3. **Privacy**
   - Only include necessary claims in JWT
   - Email is required for our app to function

## 🚀 Alternative Quick Fix

If Clerk dashboard is not accessible, we can modify the backend to fetch email from Clerk API:

```typescript
// apps/api/src/auth/guards/clerk-auth.guard.ts

import { clerkClient } from '@clerk/clerk-sdk-node';

// After line 65 (after verifying token)
let email = payload.email || 
            payload.email_address ||
            payload.primary_email_address;

// If no email in token, fetch from Clerk API
if (!email || email.includes('@clerk.local')) {
  try {
    const clerkUser = await clerkClient.users.getUser(payload.sub);
    email = clerkUser.emailAddresses.find(
      e => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
  } catch (error) {
    console.error('Failed to fetch user from Clerk:', error);
  }
}
```

This requires installing `@clerk/clerk-sdk-node`:
```bash
cd apps/api
npm install @clerk/clerk-sdk-node
```

## 📊 Status

- [ ] Clerk JWT template configured
- [ ] User signs out and back in
- [ ] User created in database with real email
- [ ] API calls working (no 401 errors)
- [ ] Onboarding flow tested end-to-end
