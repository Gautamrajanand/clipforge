# Railway Deployment Guide
**Deploy API + Auto-run Database Migrations**

---

## 🎯 WHY RAILWAY FIRST?

Your local network has connectivity issues to cloud databases. Railway will:
- ✅ Run migrations automatically from their infrastructure
- ✅ Handle all environment variables securely
- ✅ Auto-deploy on Git push
- ✅ Provide production URL immediately

---

## 📋 STEP 1: CREATE RAILWAY ACCOUNT (2 minutes)

1. Go to: https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your GitHub
4. You'll get $5 free credit (enough for testing)

---

## 📋 STEP 2: CREATE NEW PROJECT (2 minutes)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `windsurf-project` repository
4. Railway will detect it's a monorepo

---

## 📋 STEP 3: CONFIGURE API SERVICE (5 minutes)

### Set Root Directory
1. Click on the deployed service
2. Go to "Settings" tab
3. Find "Root Directory"
4. Set to: `apps/api`
5. Click "Save"

### Set Build & Start Commands
1. Still in Settings
2. Find "Build Command"
3. Set to: `npm install && npx prisma generate && npm run build`
4. Find "Start Command"
5. Set to: `npx prisma migrate deploy && npm run start:prod`
6. Click "Save"

**Important:** The start command runs migrations BEFORE starting the server!

---

## 📋 STEP 4: ADD ENVIRONMENT VARIABLES (5 minutes)

1. Go to "Variables" tab
2. Click "New Variable"
3. Add these one by one:

```bash
# Database (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_YQ89oBVncANX@ep-calm-sky-aevo0buo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Node Environment
NODE_ENV=production
PORT=3000

# API Configuration
API_JWT_SECRET=clipforge-production-secret-2024-change-this-later
API_JWT_EXPIRY=24h

# Clerk Authentication (use your existing keys)
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Stripe (keep test mode for now)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_key_here

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_1SWBfe62BJnrL0SqUcbjUWR8
STRIPE_PRICE_PRO=price_1SWBiG62BJnrL0SqYZu4Adx9
STRIPE_PRICE_BUSINESS=price_1SWBjo62BJnrL0SqAGKawrxE

# Email (Resend)
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=ClipForge <noreply@clipforge.ai>

# Storage (MinIO/S3 - we'll set up R2 next)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=clipforge
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# Redis (we'll add Upstash later)
REDIS_URL=redis://localhost:6379

# ML Workers
ML_WORKER_URL=http://ml-workers:8000

# OpenAI
OPENAI_API_KEY=sk-proj-your_key_here

# AssemblyAI
ASSEMBLYAI_API_KEY=your_key_here
```

---

## 📋 STEP 5: DEPLOY (2 minutes)

1. Click "Deploy" button
2. Railway will:
   - Install dependencies
   - Generate Prisma client
   - Build the API
   - Run database migrations ✅
   - Start the server
3. Wait 3-5 minutes for deployment

---

## 📋 STEP 6: GET PUBLIC URL (1 minute)

1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy the URL (e.g., `clipforge-api.up.railway.app`)
5. Save this URL - you'll need it for frontend

---

## 📋 STEP 7: VERIFY DEPLOYMENT (2 minutes)

### Check Logs
1. Go to "Deployments" tab
2. Click latest deployment
3. Check logs for:
   ```
   ✔ Migrations applied successfully
   ✔ Server started on port 3000
   ```

### Test API
```bash
curl https://clipforge-api.up.railway.app/health
# Should return: {"status":"ok"}
```

---

## 📋 STEP 8: VERIFY DATABASE TABLES (2 minutes)

1. Go to your Neon dashboard: https://console.neon.tech
2. Click on your project
3. Go to "SQL Editor"
4. Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected tables:**
- User
- Organization
- Project
- Moment
- Credit
- Subscription
- ApiKey
- _prisma_migrations

If you see all these tables, **migrations succeeded!** ✅

---

## ✅ SUCCESS CHECKLIST

- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] Root directory set to `apps/api`
- [ ] Build/start commands configured
- [ ] All environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] Public URL generated
- [ ] Health endpoint returns 200
- [ ] Database tables created in Neon

---

## 🎯 NEXT STEPS

Once Railway deployment is successful:
1. ✅ Database migrations (DONE automatically by Railway)
2. ⏭️ Set up Cloudflare R2 storage
3. ⏭️ Deploy Frontend to Vercel
4. ⏭️ Connect everything together
5. ⏭️ Test end-to-end
6. ⏭️ Invite beta users

---

## 🆘 TROUBLESHOOTING

### Build Failed
- Check logs for specific error
- Verify root directory is `apps/api`
- Ensure all dependencies in package.json

### Migration Failed
- Check DATABASE_URL is correct
- Verify Neon database is accessible
- Check Prisma schema is valid

### Server Won't Start
- Check environment variables
- Verify PORT is set to 3000
- Check for missing dependencies

---

## 💡 TIPS

- Railway auto-deploys on Git push to main branch
- Use Railway CLI for local testing: `railway run npm run dev`
- Monitor logs in real-time from dashboard
- Set up custom domain later: Settings → Networking → Custom Domain
