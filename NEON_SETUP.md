# Neon Database Setup (Supabase Alternative)
**Faster, simpler, better IPv4 support**

---

## 🎯 STEP 1: CREATE NEON ACCOUNT (2 minutes)

1. Go to: https://neon.tech
2. Click "Sign up"
3. Sign up with GitHub (recommended)
4. No email verification needed - instant access!

---

## 🎯 STEP 2: CREATE PROJECT (1 minute)

1. You'll be taken to "Create a project" page automatically
2. Fill in:
   ```
   Project name: clipforge-production
   Region: US East (Ohio) - aws-us-east-2
   PostgreSQL version: 16 (latest)
   ```
3. Click "Create project"
4. **INSTANT** - project created in seconds!

---

## 🎯 STEP 3: GET CONNECTION STRING (30 seconds)

After project creation, you'll see a connection string immediately:

```
postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

Example format:
```
postgresql://neondb_owner:npg_xxxxxxxxx@ep-cool-name-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🎯 STEP 4: TEST CONNECTION (Optional)

You can test the connection immediately:
```bash
psql "postgresql://[your-connection-string]"
```

Or just proceed to migrations - Neon works instantly!

---

## ✅ ADVANTAGES OVER SUPABASE

| Feature | Neon | Supabase |
|---------|------|----------|
| IPv4 Support | ✅ Native | ❌ IPv6 only |
| Setup Time | 30 seconds | 3-5 minutes |
| Cold Start | <100ms | ~1 second |
| Free Tier | 0.5GB, 191h | 500MB, limited |
| Branching | ✅ Git-like | ❌ No |
| Auto-pause | ✅ Yes | ❌ No |

---

## 💰 PRICING

**Free Tier (Perfect for Beta):**
- 0.5 GB storage
- 191 compute hours/month
- Unlimited projects
- Auto-pause after 5 min inactivity

**Launch Plan ($19/month):**
- 10 GB storage
- 300 compute hours
- Point-in-time recovery
- Autoscaling

**Scale Plan ($69/month):**
- 50 GB storage
- 750 compute hours
- Read replicas
- 99.95% SLA

---

## 🚀 NEXT STEPS

Once you have the Neon connection string:
1. Share it with me
2. I'll run the migrations (takes 30 seconds)
3. We move to Cloudflare R2 setup
4. Then deploy everything!

**Timeline:** Database ready in 5 minutes total!
