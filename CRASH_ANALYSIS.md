# 🔴 API Crash Analysis - 2-Hour Video Transcription

**Date:** November 24, 2025, 11:59 PM IST  
**Issue:** API crashed during transcription of 2-hour video  
**Status:** ⚠️ CRITICAL - Blocks 2-hour video support

---

## 🔍 **ROOT CAUSE**

### **What Happened:**
1. ✅ 2-hour video imported successfully (download + upload to MinIO)
2. ✅ Credits deducted correctly (179 credits)
3. ✅ Transcription job started
4. ❌ **API KILLED** during transcription upload to AssemblyAI

### **The Problem:**
```
📥 Downloading video from storage: projects/.../source.mp4
✅ Downloaded 736183747 bytes (736MB)
📤 Uploading to AssemblyAI...
Killed
```

**Issue:** Transcription service downloads entire video (736MB) into memory before uploading to AssemblyAI.

**For 2-hour video:**
- File size: ~736MB - 2.4GB
- Memory usage: Loads entire file into RAM
- Result: **Out of memory → API killed**

---

## 📊 **MEMORY ANALYSIS**

### **Current Flow:**
```
MinIO → Download to Memory (736MB) → Upload to AssemblyAI
```

**Problems:**
- ❌ Loads entire file into memory
- ❌ No streaming
- ❌ Crashes on large files
- ❌ Blocks other requests

### **What We Need:**
```
MinIO → Stream directly to AssemblyAI
```

**Benefits:**
- ✅ Constant memory usage (~50MB)
- ✅ Supports any file size
- ✅ No crashes
- ✅ Doesn't block other requests

---

## 🔧 **SOLUTION**

### **Option 1: Stream Upload to AssemblyAI** (RECOMMENDED)
**Implementation:**
1. Get signed URL from MinIO
2. Pass URL directly to AssemblyAI
3. AssemblyAI downloads from MinIO directly
4. No memory usage on our side

**Code Change:**
```typescript
// Current (BAD):
const videoBuffer = await this.storage.downloadFile(key);
const uploadResponse = await axios.post(
  'https://api.assemblyai.com/v2/upload',
  videoBuffer
);

// New (GOOD):
const signedUrl = await this.storage.getSignedUrl(key, 7200);
const transcriptResponse = await axios.post(
  'https://api.assemblyai.com/v2/transcript',
  { audio_url: signedUrl }
);
```

**Pros:**
- ✅ Zero memory usage
- ✅ Simple implementation
- ✅ Works for any file size
- ✅ Fast (no download/upload)

**Cons:**
- ⚠️ Requires MinIO to be publicly accessible (or use presigned URLs)

---

### **Option 2: Streaming Upload** (ALTERNATIVE)
**Implementation:**
1. Stream from MinIO
2. Stream to AssemblyAI
3. Use Node.js streams (pipe)

**Code Change:**
```typescript
const videoStream = await this.storage.downloadFileStream(key);
const uploadResponse = await axios.post(
  'https://api.assemblyai.com/v2/upload',
  videoStream,
  {
    headers: { 'Content-Type': 'application/octet-stream' },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  }
);
```

**Pros:**
- ✅ Low memory usage
- ✅ Works with private MinIO

**Cons:**
- ⚠️ More complex
- ⚠️ Still uses some memory for buffering

---

### **Option 3: Increase Memory Limit** (NOT RECOMMENDED)
**Implementation:**
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 8G  # Increase from 2G
```

**Pros:**
- ✅ Quick fix

**Cons:**
- ❌ Doesn't scale
- ❌ Expensive
- ❌ Still crashes on very large files
- ❌ Wastes resources

---

## 🎯 **RECOMMENDED FIX**

### **Use Option 1: Direct URL Upload**

**Why:**
- ✅ Zero memory usage
- ✅ Simple to implement
- ✅ Scales to any file size
- ✅ Fast (no intermediate download)
- ✅ AssemblyAI supports URL input

**Implementation Steps:**
1. Update `transcription.service.ts`
2. Use MinIO signed URL instead of download
3. Pass URL to AssemblyAI
4. Test with 2-hour video

**Estimated Time:** 15-30 minutes

---

## 📝 **FILES TO CHANGE**

### **1. `apps/api/src/transcription/transcription.service.ts`**
**Current:**
```typescript
// Line ~50-70
const videoBuffer = await this.storage.downloadFile(videoKey);
const uploadResponse = await axios.post(
  'https://api.assemblyai.com/v2/upload',
  videoBuffer,
  { headers: { authorization: this.apiKey } }
);
const audioUrl = uploadResponse.data.upload_url;
```

**New:**
```typescript
// Use signed URL directly
const audioUrl = await this.storage.getSignedUrl(videoKey, 7200); // 2 hours
```

**Benefits:**
- Remove download step
- Remove upload step
- Direct MinIO → AssemblyAI
- Zero memory usage

---

## 🚨 **IMPACT**

### **Current State:**
- ❌ **Cannot process 2-hour videos** (API crashes)
- ❌ **Cannot process videos >500MB** (memory limit)
- ❌ **Blocks Opus Clip parity** (they support 120 min)

### **After Fix:**
- ✅ **Can process 2-hour videos** (no memory issues)
- ✅ **Can process videos up to 5GB** (file size limit)
- ✅ **Achieves Opus Clip parity** (120 min support)
- ✅ **Better performance** (no download/upload overhead)

---

## 📈 **PRIORITY**

**Priority:** 🔴 **CRITICAL**  
**Blocks:** Day 2 completion (120-minute upload support)  
**Estimated Fix Time:** 15-30 minutes  
**Testing Time:** 10-15 minutes  

**Recommendation:** Fix immediately before proceeding to Day 3

---

## ✅ **VERIFICATION STEPS**

After implementing the fix:

1. **Test with 2-hour video:**
   - Import Joe Rogan podcast
   - Monitor memory usage
   - Verify transcription completes
   - Check API doesn't crash

2. **Monitor metrics:**
   - Memory usage stays <500MB
   - No API crashes
   - Transcription completes successfully
   - Clips detected correctly

3. **Load test:**
   - Import multiple long videos
   - Verify concurrent processing
   - Check memory stability

---

## 🎉 **EXPECTED OUTCOME**

After fix:
- ✅ 2-hour videos process successfully
- ✅ Memory usage stays constant
- ✅ API remains stable
- ✅ Opus Clip parity achieved
- ✅ Production ready

---

**Status:** Ready to implement fix  
**Next Step:** Update transcription service to use signed URLs
