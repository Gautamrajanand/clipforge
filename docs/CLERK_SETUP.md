# Clerk Authentication Setup Guide

## Step 1: Create Clerk Account

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application named "ClipForge"
4. Choose "Next.js" as your framework

## Step 2: Get API Keys

After creating your application, you'll see:

- **Publishable Key** (starts with `pk_test_...`)
- **Secret Key** (starts with `sk_test_...`)

## Step 3: Configure Environment Variables

Add these to your `.env` files:

### Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Backend (`apps/api/.env`)
```bash
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

## Step 4: Configure Clerk Dashboard

### Allowed Redirect URLs
Add these in Clerk Dashboard → Settings → Paths:
- `http://localhost:3001/dashboard`
- `http://localhost:3001/sign-in`
- `http://localhost:3001/sign-up`

### User Metadata
Enable these fields in Clerk Dashboard → User & Authentication → Email, Phone, Username:
- ✅ Email (required)
- ✅ Username (optional)
- ✅ Phone (optional)

### Social Login (Optional)
Enable in Clerk Dashboard → User & Authentication → Social Connections:
- Google
- GitHub
- LinkedIn

## Step 5: Test Authentication

1. Start your app: `npm run dev`
2. Go to `http://localhost:3001`
3. Click "Sign Up" - you should see Clerk's sign-up form
4. Create a test account
5. You should be redirected to `/dashboard`

## Troubleshooting

### "Invalid publishable key"
- Make sure you copied the full key including `pk_test_` prefix
- Check there are no extra spaces

### "Redirect URL not allowed"
- Add your URL in Clerk Dashboard → Settings → Paths

### "User not found"
- Make sure backend is using the same Clerk secret key
- Check that JWT verification is working

## Next Steps

After Clerk is working:
1. Connect user data to database (Organization, User models)
2. Sync Clerk user ID with your database
3. Update all API endpoints to use Clerk authentication
4. Remove mock auth provider
