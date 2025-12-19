# Cloudflare R2 Storage Setup
**S3-compatible object storage with zero egress fees**

---

## 📋 STEP 1: CREATE CLOUDFLARE ACCOUNT (2 minutes)

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up with email (or use existing account if you have one)
3. Verify your email
4. Skip domain setup (not needed for R2)

---

## 📋 STEP 2: ENABLE R2 (1 minute)

1. Go to: https://dash.cloudflare.com
2. Click "R2" in the left sidebar
3. Click "Purchase R2 Plan"
4. Select "Pay as you go" (free tier: 10GB storage, 1M Class A operations)
5. Add payment method (required even for free tier)
6. Click "Enable R2"

---

## 📋 STEP 3: CREATE BUCKET (2 minutes)

1. Click "Create bucket"
2. Fill in:
   ```
   Bucket name: clipforge-production
   Location: Automatic (global distribution)
   ```
3. Click "Create bucket"
4. Bucket created instantly! ✅

---

## 📋 STEP 4: CREATE API TOKEN (3 minutes)

1. Go to: R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Fill in:
   ```
   Token name: clipforge-production-api
   Permissions: Object Read & Write
   TTL: Forever (or set expiration if preferred)
   Specify bucket: clipforge-production (recommended)
   ```
4. Click "Create API Token"
5. **SAVE THESE IMMEDIATELY** (shown only once):
   ```
   Access Key ID: [copy this]
   Secret Access Key: [copy this]
   ```

---

## 📋 STEP 5: GET BUCKET ENDPOINT (1 minute)

1. Go back to R2 → clipforge-production bucket
2. Click "Settings"
3. Find "Bucket Details"
4. Copy the **S3 API endpoint**:
   ```
   https://[account-id].r2.cloudflarestorage.com
   ```

Example: `https://abc123def456.r2.cloudflarestorage.com`

---

## 📋 STEP 6: ENABLE PUBLIC ACCESS (Optional - 2 minutes)

**For serving videos/exports directly:**

1. In bucket settings, scroll to "Public Access"
2. Click "Allow Access"
3. Click "Connect Domain" (or use default R2.dev domain)
4. Copy the public URL:
   ```
   https://pub-[random].r2.dev
   ```

**Or set up custom domain:**
1. Click "Connect Domain"
2. Enter: `cdn.clipforge.ai`
3. Add CNAME record to your DNS:
   ```
   CNAME: cdn.clipforge.ai → [provided-value]
   ```
4. Wait 2-5 minutes for DNS propagation

---

## 📋 STEP 7: UPDATE ENVIRONMENT VARIABLES

Add these to your `.env.production`:

```bash
# Cloudflare R2 Storage
S3_ENDPOINT=https://[your-account-id].r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clipforge-production
S3_ACCESS_KEY_ID=[your-access-key-id]
S3_SECRET_ACCESS_KEY=[your-secret-access-key]

# CDN URL for serving media
CDN_URL=https://pub-[random].r2.dev
# Or if using custom domain:
# CDN_URL=https://cdn.clipforge.ai
```

---

## 📋 STEP 8: TEST CONNECTION (Optional)

```bash
# Install AWS CLI (if not already installed)
brew install awscli

# Configure R2 endpoint
aws configure set aws_access_key_id [your-access-key-id]
aws configure set aws_secret_access_key [your-secret-access-key]

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://clipforge-production/test.txt --endpoint-url https://[account-id].r2.cloudflarestorage.com

# Test list
aws s3 ls s3://clipforge-production/ --endpoint-url https://[account-id].r2.cloudflarestorage.com

# Clean up
rm test.txt
aws s3 rm s3://clipforge-production/test.txt --endpoint-url https://[account-id].r2.cloudflarestorage.com
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Cloudflare account created
- [ ] R2 enabled with payment method
- [ ] Bucket created: clipforge-production
- [ ] API token created and saved
- [ ] S3 endpoint URL copied
- [ ] Public access enabled (optional)
- [ ] Environment variables updated
- [ ] Connection tested (optional)

---

## 💰 PRICING

**Free Tier (Included):**
- 10 GB storage/month
- 1 million Class A operations/month (uploads)
- 10 million Class B operations/month (downloads)

**Beyond Free Tier:**
- Storage: $0.015/GB/month
- Class A operations: $4.50 per million
- Class B operations: $0.36 per million
- **Egress: $0** (FREE - this is huge!)

**Example Cost (1000 users):**
- 100 GB storage: $1.50/month
- 10M uploads: $45/month
- 100M downloads: $3.60/month
- Egress (10TB): **$0** (would be $900 on S3!)
- **Total: ~$50/month** vs $950 on S3

---

## 🎯 NEXT STEPS

Once R2 is set up:
1. ✅ Neon Database (DONE)
2. ✅ Cloudflare R2 Storage (DONE)
3. ⏭️ Sentry Error Tracking
4. ⏭️ Deploy API to Railway
5. ⏭️ Deploy Frontend to Vercel
6. ⏭️ Deploy ML Workers
7. ⏭️ End-to-end testing
8. ⏭️ Beta launch!

---

## 🆘 TROUBLESHOOTING

### Can't create bucket
- Verify payment method is added
- Check bucket name is unique globally
- Try different bucket name

### API token not working
- Verify you copied both Access Key ID and Secret Access Key
- Check token permissions include "Object Read & Write"
- Ensure token is not expired

### Can't access files publicly
- Verify public access is enabled
- Check CORS settings if accessing from browser
- Ensure files are uploaded with correct permissions

---

## 📞 READY FOR NEXT STEP?

Once you've completed R2 setup, share:
1. S3 Endpoint URL
2. Access Key ID
3. Secret Access Key
4. Public CDN URL (if enabled)

And we'll move to Sentry error tracking!
