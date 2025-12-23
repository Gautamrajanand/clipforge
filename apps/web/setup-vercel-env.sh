#!/bin/bash

# Setup Vercel Environment Variables
# Run this from apps/web directory

echo "🔧 Setting up Vercel environment variables..."

# Clerk Authentication
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development <<< "pk_test_dW5iaWFzZWQtbW9zcXVpdG8tNjMuY2xlcmsuYWNjb3VudHMuZGV2JA"
vercel env add CLERK_SECRET_KEY production preview development <<< "sk_test_HDxBd9tzinwO6dNNFbVdETXaFRGEzh8V13LuluC8wu"

# Clerk Paths
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production preview development <<< "/sign-in"
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production preview development <<< "/sign-up"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production preview development <<< "/dashboard"
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production preview development <<< "/dashboard"

# Analytics
vercel env add NEXT_PUBLIC_MIXPANEL_TOKEN production preview development <<< "603fc822ee6a3bf68a426ab45a2dc99c"
vercel env add NEXT_PUBLIC_POSTHOG_KEY production preview development <<< "phc_hAy9bVNlTqE588Ps6iRApdkNgN1xa3D6iqAGshn3Anx"
vercel env add NEXT_PUBLIC_POSTHOG_HOST production preview development <<< "https://app.posthog.com"

# Intercom
vercel env add NEXT_PUBLIC_INTERCOM_APP_ID production preview development <<< "fre16aaf"

# API URL (will need to update after getting Vercel URL)
vercel env add NEXT_PUBLIC_API_URL production preview development <<< "http://localhost:3001"

echo "✅ Environment variables added to Vercel!"
echo ""
echo "⚠️  IMPORTANT: After deployment, update NEXT_PUBLIC_API_URL with your production API URL"
echo "   Run: vercel env rm NEXT_PUBLIC_API_URL production"
echo "   Then: vercel env add NEXT_PUBLIC_API_URL production <<< 'https://your-api-url.com'"
