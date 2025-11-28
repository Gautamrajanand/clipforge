# 🚀 How to Test Emails - SIMPLE GUIDE

## ⚡ **Quick Start (3 Steps)**

### **Step 1: Open DevTools**
1. You're already on the admin dashboard (I can see it in your screenshot!)
2. Press **F12** (or right-click → Inspect)
3. Click on the **"Network"** tab at the top

### **Step 2: Get Your Token**
1. **Refresh the page** (Cmd+R on Mac, Ctrl+R on Windows)
2. You'll see a list of requests appear
3. Click on **any request** (like "dashboard" or "analytics")
4. On the right side, look for **"Request Headers"**
5. Scroll down and find the line that says:
   ```
   authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2...
   ```
6. **Copy everything AFTER "Bearer "** (the long string starting with eyJ...)

### **Step 3: Run the Script**
Open your terminal and run:
```bash
./trigger-emails-now.sh
```

Then **paste your token** when asked!

---

## 🎯 **What Will Happen**

The script will:
1. ✅ Trigger all 5 email cron jobs immediately
2. ✅ Show you the results
3. ✅ Display the logs
4. ✅ Tell you to check your email

---

## 📧 **Where to Check for Emails**

**Email**: gautam@hubhopper.com  
**Folder**: **SPAM** (because we're using test domain)

---

## 🖼️ **Visual Guide - Where to Find Token**

When you open DevTools Network tab, you'll see:

```
Name                Status    Type
────────────────────────────────────
dashboard           200       xhr
analytics           200       xhr
users               200       xhr
```

Click on any of these, then on the right:

```
Headers
  General
  Response Headers
  Request Headers  ← LOOK HERE
    authorization: Bearer eyJhbGc... ← COPY THIS PART
    content-type: application/json
```

---

## ❓ **Troubleshooting**

### "Token expired" or "Unauthorized"
- Refresh the admin page
- Get a NEW token (they expire after a while)
- Try again

### "No emails sent"
- This is NORMAL! 
- Emails only send if users match criteria:
  - Signed up 1 day ago (Day 1 email)
  - Signed up 3 days ago (Day 3 email)
  - Trial expiring in 3 days
  - Inactive for 7 days
- The script will show "0 users found" - that's OK!

### "Can't find authorization header"
- Make sure you're logged in
- Make sure you refreshed the page
- Try clicking on a different request in the Network tab

---

## 🎉 **Alternative: Just Wait**

If you don't want to manually trigger:
- The cron jobs will run **automatically at 9:00 AM** tomorrow
- Check logs after 9 AM:
  ```bash
  docker-compose logs api --since=1h | grep "email job"
  ```

---

## 📝 **Summary**

1. **F12** → Network tab
2. **Refresh page**
3. **Click any request** → Find "authorization: Bearer ..."
4. **Copy the token** (after "Bearer ")
5. **Run**: `./trigger-emails-now.sh`
6. **Paste token**
7. **Check spam folder** at gautam@hubhopper.com

**That's it!** 🚀
