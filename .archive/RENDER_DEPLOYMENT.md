# Deploy API to Render

## Quick Setup

1. **Sign up**: https://render.com (use GitHub)

2. **Create Web Service**:
   - New + → Web Service
   - Connect repo: `Gautamrajanand/clipforge`
   - Name: `clipforge-api`
   - Region: Oregon (US West)
   - Branch: `main`
   - Root Directory: `apps/api`
   - Runtime: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm run start`
   - Instance Type: Starter ($7/mo) or Free

3. **Environment Variables** (copy from Railway or .env.production):
   - All 72 variables from Railway
   - Make sure `DATABASE_URL` points to Neon
   - Make sure `PORT` is NOT set (Render sets it automatically)

4. **Deploy**: Click "Create Web Service"

## Why Render over Railway?

- No aggressive Docker caching
- More reliable builds
- Better logging
- Automatic health checks
- Free tier available

## After Deployment

Get your API URL from Render dashboard (e.g., `https://clipforge-api.onrender.com`)

Update CORS in `apps/api/src/main.ts` to include this URL.
