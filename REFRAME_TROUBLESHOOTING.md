# Reframe Preview Not Showing - Troubleshooting

**Date:** December 12, 2025  
**Issue:** "AI Reframe Processing" page shows but no preview appears  
**Status:** Investigating

---

## 🔍 Current Situation

The page shows:
- ✅ "AI Reframe Processing" message
- ✅ Reframe settings displayed (9:16, picture_in_picture, #000000)
- ❌ No video preview
- ❌ Processing seems stuck

---

## 🐛 Possible Causes

### **1. Upload Still in Progress**
- Large video files take time to upload
- Frontend may show processing page before upload completes
- **Check:** Wait 2-3 minutes and refresh the page

### **2. Job Not Queued**
- The reframe job may not have been added to the queue
- **Check logs:** No "Triggering reframe processing" messages found
- **Possible cause:** Frontend upload may have failed silently

### **3. Processing Failed**
- Job may have started but failed during processing
- **Check logs:** Look for error messages in API logs

### **4. Frontend Polling Issue**
- Frontend may not be polling for status updates correctly
- **Check:** Browser console for errors

---

## ✅ Diagnostic Steps

### **Step 1: Check Browser Console**
Open browser DevTools (F12) and look for:
- Network errors (failed API calls)
- Console errors (JavaScript errors)
- Look for status polling requests to `/v1/projects/{id}`

### **Step 2: Check API Logs**
```bash
# Check for recent reframe activity
docker logs clipforge-api --tail 200 | grep -i "reframe"

# Check for the specific project ID
docker logs clipforge-api --tail 200 | grep "cmj2bhrg"

# Check for errors
docker logs clipforge-api --tail 100 | grep -i "error"
```

### **Step 3: Check Project Status in Database**
```bash
# Connect to database
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev

# Check project status
SELECT id, status, "createdAt", "updatedAt" 
FROM "Project" 
WHERE id LIKE 'cmj2bhrg%' 
ORDER BY "createdAt" DESC 
LIMIT 5;

# Check if reframe asset exists
SELECT p.id, p.status, a.kind, a.url 
FROM "Project" p 
LEFT JOIN "Asset" a ON a."projectId" = p.id 
WHERE p.id LIKE 'cmj2bhrg%';
```

### **Step 4: Check Queue Status**
```bash
# Check if reframe jobs are in the queue
docker exec -it clipforge-redis redis-cli

# In Redis CLI:
KEYS bull:reframe:*
LLEN bull:reframe:wait
LLEN bull:reframe:active
LLEN bull:reframe:completed
LLEN bull:reframe:failed
```

---

## 🔧 Quick Fixes

### **Fix 1: Refresh the Page**
- Simply refresh the browser
- The page should poll for status updates
- If video is ready, it will appear

### **Fix 2: Go Back to Dashboard**
- Click "Projects" in sidebar
- Find the project in the list
- Click on it to open again
- Check if status shows "READY"

### **Fix 3: Re-upload the Video**
- If stuck for >5 minutes, the upload likely failed
- Go back to dashboard
- Delete the stuck project (if any)
- Upload again with the same settings

### **Fix 4: Check Video File**
- Make sure video file is valid (not corrupted)
- Try with a smaller video first (<50MB)
- Supported formats: MP4, MOV, AVI, MKV

---

## 📊 Expected Timeline

**Normal Processing:**
1. Upload: 10-30 seconds (depends on file size)
2. Transcription: 30-60 seconds
3. Reframe: 90-120 seconds
4. **Total: 2-3 minutes**

**If Stuck:**
- After 5 minutes: Something is wrong
- Check logs and browser console
- Try re-uploading

---

## 🎯 What Should Happen

### **Successful Flow:**
1. ✅ User uploads video
2. ✅ Page shows "AI Reframe Processing"
3. ✅ Backend logs show:
   ```
   📐 Triggering reframe processing for project {id}
      Strategy: picture_in_picture
   ✅ Reframe job queued for project {id}
   🎬 Reframe job reframe-{id} started
   🎬 Executing FFmpeg: ffmpeg -i ...
   ✅ Reframe job completed
   ```
4. ✅ Project status changes: INGESTING → DETECTING → READY
5. ✅ Frontend polls and detects READY status
6. ✅ Page shows video preview with picture-in-picture effect

### **Current Flow (Broken):**
1. ✅ User uploads video
2. ✅ Page shows "AI Reframe Processing"
3. ❌ No backend logs (job not triggered)
4. ❌ Project stuck in INGESTING or DETECTING
5. ❌ Frontend keeps polling but never gets READY
6. ❌ No video preview

---

## 🚨 Known Issues

### **Issue 1: Frontend Upload Timeout**
- Large videos may timeout during upload
- **Solution:** Increase timeout in frontend or use smaller videos

### **Issue 2: Transcription Processor Not Triggering Reframe**
- The new queue-based approach may not be triggered correctly
- **Check:** `transcription.service.ts` line 222-270
- **Verify:** `reframeMode` flag is being set correctly

### **Issue 3: Circular Dependency**
- Fixed earlier with `forwardRef()`
- **Verify:** API is running without errors

---

## 🔍 Debug Commands

### **Check if API is Running:**
```bash
docker ps | grep clipforge-api
curl http://localhost:3000/health
```

### **Check Recent API Logs:**
```bash
docker logs clipforge-api --tail 100
```

### **Check Reframe Queue:**
```bash
docker exec -it clipforge-redis redis-cli
KEYS bull:reframe:*
```

### **Check Project in Database:**
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT id, status, \"sourceUrl\" FROM \"Project\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

---

## 💡 Recommendations

### **Immediate Actions:**
1. **Refresh the page** - May just be a polling issue
2. **Check browser console** - Look for errors
3. **Wait 5 minutes** - Processing may be slow
4. **Try re-uploading** - If stuck, start fresh

### **If Still Not Working:**
1. Check API logs for errors
2. Verify project status in database
3. Check if reframe queue is processing jobs
4. Look for frontend errors in browser console

---

## 📝 Next Steps

1. **User:** Refresh the page and check browser console
2. **Dev:** Check API logs for the specific project ID
3. **Dev:** Verify reframe job was queued
4. **Dev:** Check if FFmpeg is executing
5. **Dev:** Verify asset is created after processing

---

**Status:** Awaiting user action (refresh page, check console)  
**Expected Resolution Time:** 5-10 minutes
