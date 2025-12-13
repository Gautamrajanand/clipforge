# Reframe Video Streaming Fix

**Date:** December 12, 2025  
**Issue:** 500 error when trying to stream reframed video  
**Root Cause:** Asset URLs stored with internal MinIO hostname instead of S3 keys

---

## 🐛 **Problem**

### **What Was Happening:**
1. ✅ Reframe job completes successfully
2. ✅ Video is uploaded to MinIO
3. ✅ Asset record created in database
4. ❌ Asset URL contains internal MinIO URL: `http://minio:9000/clipforge/...`
5. ❌ Browser tries to stream from this URL
6. ❌ Storage service can't access internal hostname
7. ❌ 500 Internal Server Error

### **Console Logs:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
/v1/projects/cmj2tohgg000lhd2bbdy5z0r0/video
```

### **API Logs:**
```
[ProjectsService] Streaming video: http://minio:9000/clipforge/projects/cmj2tohgg000lhd2bbdy5z0r0/reframed.mp4?AWSAccessKeyId=minioadmin&Expires=1765548476&Signature=...
[ExceptionsHandler] BadRequest: null
```

---

## ✅ **Solution**

### **The Fix:**
Store the **S3 key** in the database instead of the **signed URL**.

**Before (Broken):**
```typescript
// reframe.processor.ts line 102
const reframedUrl = await this.storage.getSignedUrl(reframedKey);
await this.prisma.asset.create({
  data: {
    projectId,
    kind: 'CLIP',
    url: reframedUrl, // ❌ Signed URL with internal hostname
    mimeType: 'video/mp4',
  },
});
```

**After (Fixed):**
```typescript
// reframe.processor.ts line 102
// Store the S3 key, not the signed URL (signed URLs expire)
await this.prisma.asset.create({
  data: {
    projectId,
    kind: 'CLIP',
    url: reframedKey, // ✅ Just the S3 key: "projects/{id}/reframed.mp4"
    mimeType: 'video/mp4',
  },
});
```

### **Why This Works:**
1. **S3 keys are portable** - They work with any S3-compatible service
2. **No expiration** - Keys don't expire like signed URLs
3. **Storage service handles it** - `storage.getFileStream(key)` works with keys
4. **No hostname issues** - Storage service knows how to resolve the key

---

## 🎯 **How It Works Now**

### **Upload Flow:**
1. ✅ User uploads video with picture-in-picture mode
2. ✅ Reframe job processes video
3. ✅ Reframed video uploaded to: `projects/{id}/reframed.mp4`
4. ✅ Asset created with **S3 key** (not signed URL)
5. ✅ Project status set to READY

### **Streaming Flow:**
1. ✅ Frontend requests: `GET /v1/projects/{id}/video`
2. ✅ API finds reframed asset with key: `projects/{id}/reframed.mp4`
3. ✅ API calls: `storage.getFileStream('projects/{id}/reframed.mp4')`
4. ✅ Storage service resolves key to MinIO internally
5. ✅ Video streams successfully to browser

---

## 🧪 **Testing**

### **Test With New Upload:**
1. Go to dashboard
2. Upload a **new video** with picture-in-picture mode
3. Wait for processing (2-3 minutes)
4. Video should stream successfully!

### **Fix Existing Projects:**
Existing projects still have the bad URLs. They need to be updated manually or re-uploaded.

**Option 1: Re-upload**
- Delete the stuck project
- Upload again

**Option 2: Database Fix (Advanced)**
```sql
-- Update existing reframed assets to use keys instead of URLs
UPDATE "Asset"
SET url = REGEXP_REPLACE(url, '^http://minio:9000/clipforge/', '')
WHERE url LIKE 'http://minio:9000/clipforge/projects/%/reframed.mp4%'
AND kind = 'CLIP';
```

---

## 📊 **Files Modified**

### **1. reframe.processor.ts**
- **Line 102-110:** Changed to store S3 key instead of signed URL
- **Removed:** `const reframedUrl = await this.storage.getSignedUrl(reframedKey);`
- **Changed:** `url: reframedKey` instead of `url: reframedUrl`

---

## ✅ **Verification**

### **Check New Upload:**
```bash
# Watch API logs during upload
docker logs clipforge-api -f | grep -E "(Reframe|Asset|Streaming)"
```

**Expected Output:**
```
✅ Reframe complete for project cmj2...
🎬 streamVideo debug: projectId=cmj2..., isReframeMode=true, assets count=2
  Asset: ORIGINAL - projects/cmj2.../source.mp4
  Asset: CLIP - projects/cmj2.../reframed.mp4  ✅ Just the key!
Streaming video: projects/cmj2.../reframed.mp4 (reframe: true)
```

### **Check Database:**
```sql
SELECT id, kind, url 
FROM "Asset" 
WHERE "projectId" = 'cmj2...' 
AND kind = 'CLIP';
```

**Expected:**
```
| id | kind | url |
|----|------|-----|
| ... | CLIP | projects/cmj2.../reframed.mp4 |
```

**NOT:**
```
| id | kind | url |
|----|------|-----|
| ... | CLIP | http://minio:9000/clipforge/projects/... | ❌
```

---

## 🎉 **Result**

**Status:** ✅ **FIXED**

- ✅ New uploads will work correctly
- ✅ Video streaming will succeed
- ✅ Picture-in-picture effect will be visible
- ⚠️ Existing projects need to be re-uploaded or manually fixed

**Next Upload:** Will stream successfully! 🎬
