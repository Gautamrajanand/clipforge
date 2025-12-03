# 🚀 How to Start All Servers

## ❌ **Current Issue**

The web app is running, but the API server is not. That's why you see 404 errors:
```
❌ v1/plg/content/onboarding: 404 Not Found
❌ v1/projects?take=1000: 404 Not Found
❌ v1/credits/balance: 404 Not Found
```

---

## ✅ **Solution: Start Docker & API**

### **Step 1: Start Docker Desktop**
```bash
# Open Docker Desktop application
# Wait for it to fully start (whale icon in menu bar)
```

### **Step 2: Start Database & API**
```bash
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
docker-compose up -d
```

This will start:
- ✅ PostgreSQL database
- ✅ NestJS API server (port 3000)

### **Step 3: Verify Servers Running**
```bash
# Check Docker containers
docker ps

# Should see:
# - clipforge-postgres (database)
# - clipforge-api (API server)
```

---

## 🎯 **Current Status**

### **Running** ✅:
- Web app (Next.js) on port 3000
- Intercom widget loaded successfully
- PostHog analytics working
- Mixpanel tracking working

### **Not Running** ❌:
- Docker Desktop
- PostgreSQL database
- NestJS API server

---

## 📋 **Complete Startup Sequence**

### **1. Start Docker Desktop**
```
Open Docker Desktop app
Wait for "Docker Desktop is running" message
```

### **2. Start Database & API**
```bash
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
docker-compose up -d
```

### **3. Verify API is Running**
```bash
# Check API health
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

### **4. Refresh Dashboard**
```
Go to: http://localhost:3000/dashboard
Refresh page (Cmd+R)
```

---

## 🧪 **What You'll See After API Starts**

### **Before** (Current):
- ❌ 404 errors in console
- ❌ "Resets Loading..." stuck
- ❌ No projects loading
- ❌ Credits not showing

### **After** (With API):
- ✅ No 404 errors
- ✅ Credits balance loaded
- ✅ Projects list loaded
- ✅ Onboarding content loaded
- ✅ Full functionality!

---

## 🔧 **Quick Commands**

### **Start Everything**:
```bash
# 1. Start Docker services
docker-compose up -d

# 2. Check status
docker ps

# 3. View API logs
docker logs clipforge-api -f
```

### **Stop Everything**:
```bash
docker-compose down
```

### **Restart API Only**:
```bash
docker-compose restart api
```

---

## 💡 **Why Two Servers?**

### **Web App (Next.js)** - Port 3000:
- Serves the frontend UI
- React components
- Client-side routing

### **API (NestJS)** - Also Port 3000:
- Handles backend logic
- Database operations
- Authentication
- Business logic

**Note**: In development, they run on the same port with Next.js proxying API requests.

---

## 🎊 **Summary**

### **To Fix 404 Errors**:
1. ✅ Open Docker Desktop
2. ✅ Run: `docker-compose up -d`
3. ✅ Wait 30 seconds for API to start
4. ✅ Refresh dashboard

### **Then You'll Have**:
- ✅ Full working dashboard
- ✅ Projects loading
- ✅ Credits showing
- ✅ Onboarding working
- ✅ All PLG features active

---

**Start Docker Desktop, then run `docker-compose up -d` to fix the 404 errors!** 🚀
