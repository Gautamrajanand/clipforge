# 🚀 Deploy ClipForge to Production - READY TO GO!
**All credentials configured - Ready for deployment**

---

## ✅ WHAT'S READY

1. **Database:** Neon PostgreSQL with all 23 tables ✅
2. **Storage:** Cloudflare R2 bucket configured ✅
3. **Environment:** All API keys added to `.env.production` ✅
4. **Code:** Production-ready monorepo ✅

---

## 🎯 DEPLOYMENT PLAN (Next 90 Minutes)

### Phase 1: Deploy API to Railway (30 min)
### Phase 2: Deploy Frontend to Vercel (20 min)
### Phase 3: Set up Upstash Redis (10 min)
### Phase 4: Test End-to-End (20 min)
### Phase 5: Invite First Beta Users (10 min)

---

## 📋 PHASE 1: RAILWAY API DEPLOYMENT

### Step 1: Create Railway Account (2 min)
1. Go to: https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You'll get $5 free credit

### Step 2: Create New Project (2 min)
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Search and select: `windsurf-project`
4. Railway will detect it's a monorepo

### Step 3: Configure Service (5 min)

#### Set Root Directory
1. Click on the deployed service
2. Go to "Settings" tab
3. Find "Root Directory"
4. Enter: `apps/api`
5. Click "Update"

#### Set Build Command
1. Still in Settings
2. Find "Build Command"
3. Enter: `npm install && npx prisma generate && npm run build`
4. Click "Update"

#### Set Start Command
1. Find "Start Command"
2. Enter: `npx prisma migrate deploy && npm run start:prod`
3. Click "Update"

**Important:** This runs migrations before starting the server!

### Step 4: Add Environment Variables (15 min)

Go to "Variables" tab and add these (copy from `.env.production`):

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_YQ89oBVncANX@ep-calm-sky-aevo0buo.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Storage
S3_ENDPOINT=https://9ab23a593dd7e1214efa862e870cebdf.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clipforge-production
S3_ACCESS_KEY_ID=5aac93ef359c87082bc0a5621d1e26b4
S3_SECRET_ACCESS_KEY=f637f3f70320345d93a9e9d8df841534e1d99508a9550dc1b9d5590437900ecf
CDN_URL=https://9ab23a593dd7e1214efa862e870cebdf.r2.cloudflarestorage.com

# Node
NODE_ENV=production
API_PORT=3000
API_HOST=0.0.0.0

# Security
API_JWT_SECRET=clipforge-production-jwt-secret-2024-change-this
API_JWT_EXPIRY=24h
WEBHOOK_SECRET=clipforge-webhook-secret-2024

# Clerk
CLERK_SECRET_KEY=sk_test_HDxBd9tzinwO6dNNFbVdETXaFRGEzh8V13LuluC8wu
CLERK_PUBLISHABLE_KEY=pk_test_dW5iaWFzZWQtbW9zcXVpdG8tNjMuY2xlcmsuYWNjb3VudHMuZGV2JA

# Stripe
STRIPE_SECRET_KEY=sk_test_51SWBB662BJnrL0Sql0Al2chpIOBlqocjRjDWNXYlUetXPuLcGSG3334oQlVM6YV82xyOuKPhOP46T17VeCFA0gxO00uyW48kYw
STRIPE_PUBLISHABLE_KEY=pk_test_51SWBB662BJnrL0Sqhb7bR7sLUBK0oEZbfRtsx5Z3dFO0DZCEs1B2qJPIyN2LDzfEJuQqvNvyk32FXhgOurfyzIUq00wThpRFL0
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_PRICE_STARTER=price_1SWBfe62BJnrL0SqUcbjUWR8
STRIPE_PRICE_PRO=price_1SWBiG62BJnrL0SqYZu4Adx9
STRIPE_PRICE_BUSINESS=price_1SWBjo62BJnrL0SqAGKawrxE

# Email
RESEND_API_KEY=re_L4SBCzhx_X1EH2fPhGN9fKDYy5bHkfJAL
FROM_EMAIL=ClipForge <onboarding@resend.dev>
APP_URL=https://app.clipforge.ai

# Redis (temporary)
REDIS_URL=redis://localhost:6379

# ML Workers (temporary)
ML_WORKER_URL=http://ml-workers:8000

# AI Services
ASR_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=16e3cbc95572499088bcb6086efd08be
OPENAI_API_KEY=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

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=603fc822ee6a3bf68a426ab45a2dc99c
NEXT_PUBLIC_POSTHOG_KEY=phc_hAy9bVNlTqE588Ps6iRApdkNgN1xa3D6iqAGshn3Anx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_INTERCOM_APP_ID=fre16aaf

# Rate Limiting
RATE_LIMIT_FREE=50
RATE_LIMIT_STARTER=100
RATE_LIMIT_PRO=200
RATE_LIMIT_BUSINESS=500

# CORS
CORS_ALLOWED_ORIGINS=https://app.clipforge.ai,https://clipforge.ai

# Upload Limits
MAX_UPLOAD_SIZE_MB=1000
MAX_VIDEO_DURATION_MINUTES=120

# Feature Flags
FF_ASPECT_RATIO=true
FF_CAPTION_STYLES=true
FF_INPAGE_PLAYBACK=true
```

### Step 5: Deploy (5 min)
1. Click "Deploy" button (or it auto-deploys)
2. Watch the logs in "Deployments" tab
3. Wait 3-5 minutes for:
   - Dependencies installation
   - Prisma client generation
   - Build completion
   - Database migrations
   - Server start

### Step 6: Get Public URL (1 min)
1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy the URL (e.g., `clipforge-api.up.railway.app`)
5. **SAVE THIS URL** - you'll need it for frontend

### Step 7: Test API (2 min)
```bash
# Test health endpoint
curl https://your-api-url.up.railway.app/health

# Expected response:
{"status":"ok","database":"connected"}
```

---

## 📋 PHASE 2: VERCEL FRONTEND DEPLOYMENT

### Step 1: Create Vercel Account (2 min)
1. Go to: https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

### Step 2: Import Project (2 min)
1. Click "Add New..." → "Project"
2. Import `windsurf-project` repository
3. Vercel will detect Next.js

### Step 3: Configure Project (5 min)

#### Set Root Directory
1. Framework Preset: Next.js (auto-detected)
2. Root Directory: `apps/web`
3. Build Command: `npm run build` (auto-detected)
4. Output Directory: `.next` (auto-detected)

#### Add Environment Variables
Click "Environment Variables" and add:

```bash
# API URL (use Railway URL from Phase 1)
NEXT_PUBLIC_API_URL=https://your-api-url.up.railway.app

# App URL (will be Vercel URL)
NEXT_PUBLIC_APP_URL=https://clipforge.vercel.app

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dW5iaWFzZWQtbW9zcXVpdG8tNjMuY2xlcmsuYWNjb3VudHMuZGV2JA

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=603fc822ee6a3bf68a426ab45a2dc99c
NEXT_PUBLIC_POSTHOG_KEY=phc_hAy9bVNlTqE588Ps6iRApdkNgN1xa3D6iqAGshn3Anx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_INTERCOM_APP_ID=fre16aaf

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SWBB662BJnrL0Sqhb7bR7sLUBK0oEZbfRtsx5Z3dFO0DZCEs1B2qJPIyN2LDzfEJuQqvNvyk32FXhgOurfyzIUq00wThpRFL0
```

### Step 4: Deploy (5 min)
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Vercel will provide a URL: `https://clipforge.vercel.app`

### Step 5: Update CORS (2 min)
Go back to Railway and add Vercel URL to CORS:
```bash
CORS_ALLOWED_ORIGINS=https://clipforge.vercel.app,https://clipforge.ai
```

### Step 6: Test Frontend (2 min)
1. Visit your Vercel URL
2. Try to sign up
3. Check if API calls work

---

## 📋 PHASE 3: UPSTASH REDIS (10 min)

### Step 1: Create Upstash Account (2 min)
1. Go to: https://console.upstash.com
2. Sign up with GitHub
3. Verify email

### Step 2: Create Database (2 min)
1. Click "Create Database"
2. Name: `clipforge-production`
3. Type: Regional
4. Region: US East 1
5. Click "Create"

### Step 3: Get Connection String (1 min)
1. Click on your database
2. Copy "Redis URL" (with password)
3. Format: `redis://default:password@endpoint.upstash.io:6379`

### Step 4: Update Railway (2 min)
1. Go to Railway → Variables
2. Update `REDIS_URL` with Upstash URL
3. Click "Update"
4. Service will auto-restart

---

## 📋 PHASE 4: END-TO-END TESTING (20 min)

### Test Checklist
- [ ] Visit frontend URL
- [ ] Sign up with email
- [ ] Verify email works
- [ ] Upload a video (small test file)
- [ ] Check video appears in dashboard
- [ ] Try generating AI clips (may fail without ML workers - OK for now)
- [ ] Check database in Neon (verify user created)
- [ ] Check R2 bucket (verify video uploaded)
- [ ] Test logout/login
- [ ] Check Clerk dashboard (verify user)

### Expected Issues (OK for Beta)
- ❌ AI Clips won't work (ML workers not deployed yet)
- ❌ AI Reframe won't work (ML workers not deployed yet)
- ❌ AI Subtitles won't work (ML workers not deployed yet)
- ✅ Upload should work
- ✅ Authentication should work
- ✅ Dashboard should work
- ✅ User management should work

---

## 📋 PHASE 5: INVITE BETA USERS (10 min)

### Grant PRO Access via Admin Panel
1. Go to: `https://your-vercel-url.vercel.app/admin`
2. Search for user by email
3. Set tier to "PRO"
4. Set credits to 999999 (unlimited for beta)
5. Save

### Send Invite Email
Use template from `BETA_USER_SETUP.md`

---

## ✅ SUCCESS CRITERIA

### API Deployment
- [ ] Railway deployment successful
- [ ] Health endpoint returns 200
- [ ] Database migrations ran
- [ ] Public URL accessible

### Frontend Deployment
- [ ] Vercel deployment successful
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads

### Infrastructure
- [ ] Neon database connected
- [ ] R2 storage working
- [ ] Upstash Redis connected
- [ ] Clerk authentication working

---

## 🎯 WHAT'S NOT DEPLOYED (OK FOR BETA)

### ML Workers (Can deploy later)
- Not critical for testing auth/upload/dashboard
- Can be deployed when needed for AI features
- Users can still upload and manage videos

### Sentry (Can add later)
- Not critical for beta
- Add after initial testing

### Custom Domains (Can add later)
- Using Railway/Vercel subdomains for now
- Add custom domains after validation

---

## 📞 NEXT STEPS AFTER DEPLOYMENT

1. **Test Everything:** Go through test checklist
2. **Invite 5 Users:** Core team/friends
3. **Monitor Logs:** Check Railway/Vercel logs
4. **Gather Feedback:** Ask users what works/doesn't work
5. **Fix Issues:** Iterate quickly on bugs
6. **Deploy ML Workers:** When ready for AI features

---

## 🆘 TROUBLESHOOTING

### Railway Build Failed
- Check logs for specific error
- Verify root directory is `apps/api`
- Ensure all dependencies in package.json

### Vercel Build Failed
- Check logs for specific error
- Verify root directory is `apps/web`
- Ensure environment variables are set

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check Neon database is running
- Test connection from Railway logs

### CORS Errors
- Add Vercel URL to CORS_ALLOWED_ORIGINS
- Restart Railway service
- Clear browser cache

---

## 💡 READY TO DEPLOY?

**You have everything you need:**
- ✅ Database configured
- ✅ Storage configured
- ✅ All API keys added
- ✅ Deployment guides ready

**Time to complete:** 60-90 minutes
**Result:** Live beta app with auth, upload, and dashboard working

**Let's go! 🚀**
