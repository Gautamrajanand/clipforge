# ✅ Quick Test Checklist - Post Ad Blocker Disable

## 🎯 **Test These Now:**

### **1. Refresh Dashboard**
```
URL: http://localhost:3001/dashboard
```

**Check:**
- [ ] Video thumbnails showing (not grey)
- [ ] Credits showing "151 / 150"
- [ ] STARTER Plan badge visible
- [ ] Trial banner showing

---

### **2. Check Browser Console**
```
Press F12 → Console tab
```

**Look for:**
- [ ] `✅ Mixpanel initialized`
- [ ] NO `ERR_BLOCKED_BY_CLIENT` errors
- [ ] `📊 Event tracked:` messages
- [ ] `📄 Page viewed:` messages

---

### **3. Test Mixpanel Tracking**
```
1. Open dashboard
2. Create a new project (or click on existing)
3. Check console for event tracking
4. Go to Mixpanel dashboard
5. Check Events tab
```

**Expected:**
- [ ] Console shows events being tracked
- [ ] No blocking errors
- [ ] Events appear in Mixpanel dashboard within 1-2 minutes

---

### **4. Test Project Page**
```
URL: http://localhost:3001/project/[any-project-id]
```

**Check:**
- [ ] Credits showing "151 / 150" in sidebar
- [ ] STARTER Plan badge in sidebar
- [ ] Main video loading
- [ ] Clips visible

---

### **5. Test Subscription Page**
```
URL: http://localhost:3001/subscription
```

**Check:**
- [ ] Shows STARTER Plan
- [ ] Shows 151 / 150 credits
- [ ] Trial message visible (not downgrade button)
- [ ] No errors when page loads

---

## 🔍 **Mixpanel Verification:**

### **In Browser Console:**
```javascript
// Check if Mixpanel is loaded
console.log(window.mixpanel);  // Should show object

// Check token
console.log(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);  // Should show your token
```

### **In Mixpanel Dashboard:**
1. Go to https://mixpanel.com/
2. Click on your "ClipForge" project
3. Go to **Events** tab
4. Set date range to "Last 24 hours"
5. Look for these events:
   - `$mp_web_page_view`
   - `page_viewed`
   - `user_identified`
   - `project_created` (if you create a project)
   - `clip_exported` (if you export a clip)

---

## 📊 **What Should Work Now:**

### **✅ Working:**
1. Mixpanel initialization
2. Event tracking
3. Page view tracking
4. User identification
5. Custom events
6. No blocking errors

### **✅ Already Working:**
1. Trial system (151/150 credits)
2. Plan badges (STARTER)
3. Credits display
4. Video thumbnails (after refresh)
5. Subscription page

---

## 🎉 **Success Criteria:**

You'll know everything is working when:
- ✅ No `ERR_BLOCKED_BY_CLIENT` in console
- ✅ Console shows `📊 Event tracked:` messages
- ✅ Mixpanel dashboard shows events
- ✅ Video thumbnails load on dashboard
- ✅ Credits show 151/150 everywhere
- ✅ STARTER Plan badge everywhere

---

## 🐛 **If Something's Not Working:**

### **Thumbnails Still Grey?**
```bash
# Restart web container
docker-compose restart web

# Wait 30 seconds, then refresh browser
```

### **Mixpanel Still Blocked?**
```
1. Check Shields icon is disabled (should be grey)
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Clear cache and reload
```

### **Credits Still Wrong?**
```
1. Hard refresh the page
2. Check browser console for API errors
3. Verify API is running: docker-compose ps
```

---

## 📝 **Quick Commands:**

### **Restart Everything:**
```bash
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
docker-compose restart web
```

### **Check Logs:**
```bash
# Web logs
docker logs clipforge-web --tail 50

# API logs
docker logs clipforge-api --tail 50
```

### **Check Mixpanel in Console:**
```javascript
// In browser console
mixpanel.track('test_event', { test: true });
```

---

## ✅ **Final Checklist:**

- [ ] Shields disabled (grey icon)
- [ ] Dashboard refreshed
- [ ] Console checked (no blocking errors)
- [ ] Thumbnails loading
- [ ] Credits showing 151/150
- [ ] Plan badge showing STARTER
- [ ] Mixpanel events in console
- [ ] Mixpanel events in dashboard
- [ ] Subscription page working
- [ ] Project page working

---

**Once all checked, you're ready to move forward!** 🚀

**Next:** Week 3 Day 2 - API Documentation (Swagger)
