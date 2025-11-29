# 🔑 Get Authentication Token for Load Testing

**Time:** 1:15 PM IST  
**Duration:** 5 minutes  
**Purpose:** Get auth token to run load tests without rate limiting

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Open ClipForge in Browser**

```bash
# Open the app
open http://localhost:3001
```

Or manually navigate to: `http://localhost:3001`

---

### **Step 2: Login to Your Account**

- Use your existing account
- Or create a new account if needed

---

### **Step 3: Open Browser DevTools**

**Chrome/Brave:**
- Press `Cmd + Option + I` (Mac)
- Or right-click → Inspect

**Firefox:**
- Press `Cmd + Option + I` (Mac)

---

### **Step 4: Go to Application Tab**

1. Click on **Application** tab (Chrome) or **Storage** tab (Firefox)
2. In the left sidebar, expand **Cookies**
3. Click on `http://localhost:3001`

---

### **Step 5: Find __session Cookie**

Look for a cookie named `__session` (Clerk authentication token)

**It will look like:**
```
__session: sess_2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...
```

---

### **Step 6: Copy the Token Value**

1. Click on the `__session` cookie
2. Copy the entire **Value** (starts with `sess_`)
3. It's a long string (100+ characters)

---

### **Step 7: Export as Environment Variable**

Open a new terminal and run:

```bash
export AUTH_TOKEN="sess_YOUR_TOKEN_HERE"
```

**Example:**
```bash
export AUTH_TOKEN="sess_2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc890def123ghi456jkl789mno012pqr345stu678vwx901yz234"
```

---

### **Step 8: Verify Token is Set**

```bash
echo $AUTH_TOKEN
```

You should see your token printed.

---

### **Step 9: Run Load Tests**

Now you can run the load tests with authentication:

```bash
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
./run-all-tests.sh
```

---

## ⚠️ **Important Notes**

1. **Token Expires:** Clerk tokens expire after some time. If tests fail with 401, get a fresh token.

2. **Keep Terminal Open:** Don't close the terminal where you exported AUTH_TOKEN.

3. **Multiple Terminals:** If you open a new terminal, you'll need to export AUTH_TOKEN again.

4. **Security:** This token gives full access to your account. Don't share it.

---

## 🚀 **Quick Command Reference**

```bash
# 1. Open app
open http://localhost:3001

# 2. Get token from browser DevTools → Application → Cookies → __session

# 3. Export token
export AUTH_TOKEN="sess_YOUR_TOKEN_HERE"

# 4. Verify
echo $AUTH_TOKEN

# 5. Run tests
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
./run-all-tests.sh
```

---

## 🎯 **What Happens Next**

Once you run the tests, you'll see:

1. **Health Check Test** (5 min) - Verify all services
2. **Credits API Test** (10 min) - Test caching
3. **Database Stress Test** (15 min) - Test connection pool
4. **Video Upload Test** (20 min) - Test critical path
5. **Concurrent Processing Test** (20 min) - Test under load

**Total Time:** ~70 minutes

---

## 📊 **Expected Output**

```
🚀 Starting ClipForge Load Testing Suite
========================================

Test 1/5: Health Check (5 min)
✅ All services healthy
✅ Response time: p95 = 45ms

Test 2/5: Credits API (10 min)
✅ Caching working
✅ Response time: p95 = 120ms

Test 3/5: Database Stress (15 min)
✅ Connection pool stable
✅ Response time: p95 = 250ms

Test 4/5: Video Upload (20 min)
✅ Upload successful
✅ Response time: p95 = 3.2s

Test 5/5: Concurrent Processing (20 min)
✅ System stable under load
✅ Response time: p95 = 4.8s

========================================
🎉 All tests complete!
```

---

**Ready? Let's get that token and start testing!** 🔑
