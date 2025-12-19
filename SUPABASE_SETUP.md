# Supabase Production Database Setup
**Step-by-step guide to migrate from local PostgreSQL to Supabase**

---

## 📋 STEP 1: CREATE SUPABASE ACCOUNT (5 minutes)

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended for easy integration)
4. Verify your email

---

## 📋 STEP 2: CREATE PROJECT (5 minutes)

1. Click "New Project"
2. Fill in details:
   ```
   Name: clipforge-production
   Database Password: [Generate strong password - SAVE THIS!]
   Region: US East (N. Virginia) - closest to most users
   Plan: Pro ($25/month)
   ```
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

---

## 📋 STEP 3: GET DATABASE CONNECTION STRING (2 minutes)

1. Go to: Project Settings (gear icon) > Database
2. Scroll to "Connection string"
3. Select: "Transaction" mode (recommended for Prisma)
4. Copy the connection string:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created

**IMPORTANT:** Save this connection string securely!

---

## 📋 STEP 4: UPDATE ENVIRONMENT VARIABLES (2 minutes)

Create a new file: `.env.production`

```bash
# Copy from .env.production.template and fill in:
DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Keep other variables from your current .env
```

---

## 📋 STEP 5: RUN DATABASE MIGRATION (5 minutes)

```bash
# Navigate to API directory
cd apps/api

# Set production database URL temporarily
export DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Generate Prisma client
npx prisma generate

# Run migrations to create all tables
npx prisma migrate deploy

# Verify migration
npx prisma studio
# This will open Prisma Studio - you should see all your tables
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migrations:
  - 20231101_init
  - 20231102_add_clerk_id
  - [all your migrations]
```

---

## 📋 STEP 6: VERIFY DATABASE (5 minutes)

### Check Tables Created
```sql
-- Go to Supabase Dashboard > SQL Editor
-- Run this query:

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
- [all your other tables]

### Test Connection from Local
```bash
# Test connection
npx prisma db pull

# Should show: "Introspected X models and wrote them into prisma/schema.prisma"
```

---

## 📋 STEP 7: OPTIONAL - MIGRATE EXISTING DATA (10 minutes)

**Only if you have important data in local database:**

```bash
# Export data from local database
docker exec clipforge-postgres pg_dump -U postgres clipforge > local_backup.sql

# Import to Supabase
psql "postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < local_backup.sql
```

**For beta:** Skip this - start fresh in production

---

## 📋 STEP 8: CONFIGURE SUPABASE FEATURES (5 minutes)

### Enable Connection Pooling
1. Go to: Project Settings > Database
2. Connection pooling: Already enabled ✅
3. Pool mode: Transaction (default) ✅

### Enable Point-in-Time Recovery
1. Go to: Project Settings > Database
2. Scroll to "Point in Time Recovery"
3. Enable PITR (included in Pro plan)

### Configure Backups
1. Go to: Project Settings > Database
2. Backups: Automatic daily backups ✅
3. Retention: 7 days (Pro plan)

---

## 📋 STEP 9: SECURITY CONFIGURATION (5 minutes)

### Enable SSL (Already enabled by default)
```bash
# Supabase uses SSL by default
# Your connection string already includes SSL
```

### Configure IP Allowlist (Optional)
1. Go to: Project Settings > Database
2. Scroll to "Connection Pooler"
3. Add IP addresses if needed (or leave open for Railway/Vercel)

### Enable Row Level Security (Optional - for future)
```sql
-- For now, skip this
-- We'll add RLS when we need multi-tenancy
```

---

## 📋 STEP 10: TEST CONNECTION (5 minutes)

### Test from Local Development
```bash
# Update .env with Supabase URL
DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Restart Docker containers
docker-compose down
docker-compose up -d

# Test API
curl http://localhost:3001/health
# Should return: {"status":"ok","database":"connected"}
```

### Test Prisma Studio
```bash
npx prisma studio
# Should open browser with all tables visible
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string copied
- [ ] Environment variable updated
- [ ] Migrations ran successfully
- [ ] All tables created
- [ ] Connection pooling enabled
- [ ] Backups configured
- [ ] Local connection tested
- [ ] Prisma Studio works

---

## 🎯 NEXT STEPS

Once database is set up:
1. ✅ Supabase Database (DONE)
2. ⏭️ Cloudflare R2 Storage
3. ⏭️ Sentry Error Tracking
4. ⏭️ Deploy to Railway
5. ⏭️ Deploy to Vercel

---

## 🆘 TROUBLESHOOTING

### "Connection refused"
- Check if connection string is correct
- Verify password doesn't have special characters (URL encode if needed)
- Check if IP is allowlisted (if you enabled IP restrictions)

### "Too many connections"
- Supabase Pro plan: 200 connections
- Use connection pooling (already enabled)
- Check for connection leaks in code

### "Migration failed"
- Check if tables already exist
- Run `npx prisma migrate reset` (WARNING: deletes all data)
- Or manually drop tables and re-run migration

### "SSL required"
- Supabase requires SSL by default
- Add `?sslmode=require` to connection string if needed

---

## 📞 READY FOR NEXT STEP?

Once you've completed Supabase setup, let me know and we'll move to:
**Cloudflare R2 Storage Setup** (30 minutes)
