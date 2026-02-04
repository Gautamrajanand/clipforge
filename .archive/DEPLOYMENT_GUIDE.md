# ClipForge Production Deployment Guide
**Fast-Track to Private Beta**

---

## 🎯 DEPLOYMENT APPROACH

**Strategy:** Managed Services (Industry Standard)
**Timeline:** 2-3 days to private beta
**Target Scale:** 1,000+ concurrent users
**Budget:** $400-700/month

---

## 📦 INFRASTRUCTURE STACK

### Frontend: Vercel
- **Why:** Next.js optimized, global CDN, auto-scaling
- **Cost:** $20/month (Pro plan)
- **Setup Time:** 30 minutes
- **Performance:** <100ms global response time

### API: Railway
- **Why:** Auto-scaling, zero-config, Git-based deploys
- **Cost:** $50-100/month (3 instances)
- **Setup Time:** 1 hour
- **Alternative:** Render (similar features)

### ML Workers: Modal
- **Why:** Serverless GPU, pay-per-use, auto-scaling
- **Cost:** $200-400/month (based on usage)
- **Setup Time:** 2 hours
- **Alternative:** Banana, Replicate

### Database: Supabase
- **Why:** Managed PostgreSQL, auto-backups, read replicas
- **Cost:** $25/month (Pro plan)
- **Setup Time:** 30 minutes
- **Performance:** Connection pooling, 100+ connections

### Redis: Upstash
- **Why:** Serverless Redis, pay-per-request
- **Cost:** $10/month
- **Setup Time:** 15 minutes

### Storage: Cloudflare R2
- **Why:** S3-compatible, 10x cheaper than S3, global CDN
- **Cost:** $50-100/month (10TB transfer)
- **Setup Time:** 1 hour

### Monitoring: Sentry
- **Why:** Industry standard error tracking
- **Cost:** $26/month (Team plan)
- **Setup Time:** 30 minutes

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### PHASE 1: Database Setup (30 minutes)

#### 1.1 Create Supabase Project
```bash
# Go to: https://supabase.com/dashboard
# Click "New Project"
# Name: clipforge-production
# Region: US East (closest to users)
# Database Password: Generate strong password
# Plan: Pro ($25/month)
```

#### 1.2 Get Database URL
```bash
# Go to: Project Settings > Database
# Copy "Connection string" (Transaction mode)
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### 1.3 Run Migrations
```bash
# Update .env.production with DATABASE_URL
# Run migrations
npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma
```

---

### PHASE 2: Storage Setup (1 hour)

#### 2.1 Create Cloudflare R2 Bucket
```bash
# Go to: https://dash.cloudflare.com
# Navigate to: R2 > Create bucket
# Name: clipforge-production
# Location: Automatic (global)
```

#### 2.2 Create API Token
```bash
# Go to: R2 > Manage R2 API Tokens
# Create API Token
# Permissions: Object Read & Write
# Copy: Access Key ID and Secret Access Key
```

#### 2.3 Configure Public Access
```bash
# Go to: R2 > clipforge-production > Settings
# Enable: Public Access
# Custom Domain: cdn.clipforge.ai (optional)
# Copy: Public bucket URL
```

#### 2.4 Update Environment Variables
```bash
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clipforge-production
S3_ACCESS_KEY_ID=[access-key-id]
S3_SECRET_ACCESS_KEY=[secret-access-key]
CDN_URL=https://pub-xxxxx.r2.dev
```

---

### PHASE 3: Redis Setup (15 minutes)

#### 3.1 Create Upstash Redis
```bash
# Go to: https://console.upstash.com
# Create Database
# Name: clipforge-production
# Region: US East 1
# Type: Regional (cheaper)
```

#### 3.2 Get Redis URL
```bash
# Copy: Redis URL (with password)
# Format: redis://default:[password]@[endpoint].upstash.io:6379
```

---

### PHASE 4: Stripe Live Mode (30 minutes)

#### 4.1 Switch to Live Mode
```bash
# Go to: https://dashboard.stripe.com
# Toggle: Test mode → Live mode (top right)
```

#### 4.2 Get Live API Keys
```bash
# Go to: Developers > API keys
# Copy: Publishable key (pk_live_...)
# Copy: Secret key (sk_live_...)
```

#### 4.3 Create Live Products & Prices
```bash
# Go to: Products > Add product

# STARTER Plan
Name: Starter
Price: $29/month
Billing: Recurring monthly
Copy: Price ID (price_xxxxx)

# PRO Plan
Name: Pro
Price: $79/month
Billing: Recurring monthly
Copy: Price ID (price_xxxxx)

# BUSINESS Plan
Name: Business
Price: $99/month
Billing: Recurring monthly
Copy: Price ID (price_xxxxx)
```

#### 4.4 Set Up Webhook
```bash
# Go to: Developers > Webhooks
# Add endpoint: https://api.clipforge.ai/v1/webhooks/stripe
# Events to send:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
# Copy: Webhook signing secret (whsec_...)
```

---

### PHASE 5: Sentry Setup (30 minutes)

#### 5.1 Create Sentry Project
```bash
# Go to: https://sentry.io
# Create Organization: ClipForge
# Create Project: clipforge-api (Node.js)
# Create Project: clipforge-web (Next.js)
```

#### 5.2 Get DSN
```bash
# Go to: Settings > Projects > clipforge-api > Client Keys (DSN)
# Copy: DSN URL
```

#### 5.3 Install Sentry
```bash
# API
cd apps/api
npm install @sentry/node @sentry/tracing

# Web
cd apps/web
npm install @sentry/nextjs
```

#### 5.4 Configure Sentry (API)
```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### 5.5 Configure Sentry (Web)
```bash
# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

---

### PHASE 6: Deploy API to Railway (1 hour)

#### 6.1 Create Railway Account
```bash
# Go to: https://railway.app
# Sign up with GitHub
```

#### 6.2 Create New Project
```bash
# Click: New Project
# Select: Deploy from GitHub repo
# Choose: clipforge repository
# Root Directory: apps/api
```

#### 6.3 Configure Environment Variables
```bash
# Go to: Project > Variables
# Add all variables from .env.production.template
# CRITICAL: Use production values (Stripe live keys, etc.)
```

#### 6.4 Configure Build Settings
```bash
# Build Command: npm install && npx prisma generate && npm run build
# Start Command: npm run start:prod
# Port: 3000
```

#### 6.5 Deploy
```bash
# Railway will auto-deploy on push to main
# Or manually trigger: Deploy > Redeploy
```

#### 6.6 Get API URL
```bash
# Copy: Public URL (e.g., clipforge-api.railway.app)
# Configure custom domain: api.clipforge.ai
```

---

### PHASE 7: Deploy ML Workers to Modal (2 hours)

#### 7.1 Install Modal
```bash
pip install modal
modal token new
```

#### 7.2 Create Modal App
```python
# workers/modal_app.py
import modal

stub = modal.Stub("clipforge-ml-workers")

@stub.function(
    image=modal.Image.debian_slim()
        .pip_install("fastapi", "torch", "transformers", "opencv-python"),
    gpu="T4",
    timeout=600,
)
def process_video(video_url: str):
    # Your ML processing logic
    pass

@stub.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.post("/process")
    async def process(video_url: str):
        result = process_video.call(video_url)
        return result
    
    return app
```

#### 7.3 Deploy to Modal
```bash
modal deploy workers/modal_app.py
# Copy: Modal endpoint URL
```

---

### PHASE 8: Deploy Frontend to Vercel (30 minutes)

#### 8.1 Create Vercel Account
```bash
# Go to: https://vercel.com
# Sign up with GitHub
```

#### 8.2 Import Project
```bash
# Click: Add New > Project
# Import: clipforge repository
# Root Directory: apps/web
# Framework: Next.js (auto-detected)
```

#### 8.3 Configure Environment Variables
```bash
# Go to: Project Settings > Environment Variables
# Add all NEXT_PUBLIC_* variables from .env.production.template
```

#### 8.4 Configure Build Settings
```bash
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm install
```

#### 8.5 Deploy
```bash
# Click: Deploy
# Wait for deployment to complete
```

#### 8.6 Configure Custom Domain
```bash
# Go to: Project Settings > Domains
# Add: app.clipforge.ai
# Configure DNS: CNAME to cname.vercel-dns.com
```

---

### PHASE 9: Monitoring Setup (30 minutes)

#### 9.1 UptimeRobot
```bash
# Go to: https://uptimerobot.com
# Add Monitor:
  - Type: HTTPS
  - URL: https://api.clipforge.ai/health
  - Interval: 1 minute
  - Alert Contacts: Your email
```

#### 9.2 Sentry Alerts
```bash
# Go to: Sentry > Alerts
# Create Alert Rule:
  - When: Error count > 10 in 1 hour
  - Then: Send email notification
```

---

### PHASE 10: Testing (2 hours)

#### 10.1 End-to-End Testing
```bash
# Test user flow:
1. Sign up (Clerk)
2. Upload video
3. Generate clips
4. Subscribe to STARTER plan (real payment)
5. Download clip (no watermark)
6. Check Stripe dashboard (payment received)
7. Check Sentry (no errors)
```

#### 10.2 Load Testing
```bash
# Install k6
brew install k6

# Create load test script
# test/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  let res = http.get('https://api.clipforge.ai/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

# Run load test
k6 run test/load-test.js
```

---

## ✅ PRE-LAUNCH CHECKLIST

### Security
- [ ] Stripe in live mode
- [ ] All API keys rotated to production
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (Prisma ✅)
- [ ] XSS protection (React ✅)

### Infrastructure
- [ ] Database: Supabase (with backups)
- [ ] Storage: Cloudflare R2 (with CDN)
- [ ] Redis: Upstash
- [ ] API: Railway (3 instances)
- [ ] ML Workers: Modal (auto-scaling)
- [ ] Frontend: Vercel (global CDN)

### Monitoring
- [ ] Sentry error tracking
- [ ] UptimeRobot monitoring
- [ ] Stripe webhook configured
- [ ] Email notifications working

### Testing
- [ ] End-to-end test passed
- [ ] Real payment test passed
- [ ] Load test passed (100 concurrent users)
- [ ] No critical errors in Sentry

### Legal
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie Policy published

---

## 🎯 PRIVATE BETA LAUNCH

### Day 1: Soft Launch (10 users)
```bash
# Invite 10 beta users (friends, early supporters)
# Monitor closely:
  - Sentry for errors
  - UptimeRobot for downtime
  - Stripe for payments
  - User feedback
```

### Day 2-3: Expand (20-50 users)
```bash
# Invite more users if Day 1 went well
# Fix any critical issues
# Optimize performance bottlenecks
```

### Week 2: Iterate
```bash
# Gather feedback
# Fix bugs
# Improve UX
# Prepare for public launch
```

---

## 📊 SUCCESS METRICS

### Technical
- **Uptime:** >99.5% (target: 99.9%)
- **API Response Time:** <2s (target: <1s)
- **Error Rate:** <1% (target: <0.5%)
- **Video Processing:** <5 min for 10-min video

### Business
- **Activation:** >50% users create first clip
- **Retention:** D7 >20%
- **Conversion:** FREE → PAID >10%
- **NPS:** >40

---

## 🆘 TROUBLESHOOTING

### API Not Responding
```bash
# Check Railway logs
railway logs --project clipforge-api

# Check Sentry for errors
# Check database connection
# Check Redis connection
```

### Video Processing Slow
```bash
# Check Modal logs
modal app logs clipforge-ml-workers

# Check queue depth
# Scale up GPU instances
```

### Payment Failing
```bash
# Check Stripe dashboard
# Check webhook logs
# Verify webhook secret
# Check Sentry for errors
```

---

## 📞 NEXT STEPS

1. **Fill in .env.production.template** with real values
2. **Follow deployment steps** in order
3. **Test end-to-end** with real payment
4. **Invite 10 beta users**
5. **Monitor and iterate**

**Estimated Time:** 8-10 hours total
**Timeline:** Ready for private beta in 2-3 days

---

## 💡 TIPS

- **Start small:** 10 users → 50 users → 100 users
- **Monitor closely:** Check Sentry/UptimeRobot every hour
- **Fix fast:** Respond to issues within 1 hour
- **Gather feedback:** Ask users what they love/hate
- **Iterate quickly:** Ship fixes daily

**Remember:** Perfect is the enemy of good. Launch fast, iterate faster.
