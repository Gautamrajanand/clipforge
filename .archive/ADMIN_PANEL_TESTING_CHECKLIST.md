# Admin Panel Testing Checklist
**Date:** December 16, 2025  
**Status:** Ready for Real-Data Regression Testing

---

## 🎯 Testing Objectives

1. Verify all admin endpoints work with real production data
2. Ensure proper authentication and authorization
3. Test data integrity and consistency
4. Validate UI displays data correctly
5. Test all CRUD operations
6. Verify analytics and reporting accuracy

---

## ✅ Backend Endpoints Testing

### Dashboard & Analytics
- [ ] **GET /admin/dashboard** - Dashboard stats
  - Total users count
  - Total organizations count
  - Total projects count
  - Total revenue (MRR/ARR)
  - Active subscriptions by tier
  - Credit usage statistics
  
- [ ] **GET /admin/analytics** - Analytics overview
  - User growth metrics
  - Revenue metrics
  - Conversion rates
  - Churn rates
  
- [ ] **GET /admin/analytics/timeseries** - Time series data
  - Daily/weekly/monthly trends
  - User acquisition over time
  - Revenue over time

### User Management
- [ ] **GET /admin/users/recent** - Recent users list
  - Returns last 10 users by default
  - Includes user details (email, name, created date)
  - Shows tier and credits
  
- [ ] **GET /admin/users/search?q={query}** - Search users
  - Search by email
  - Search by name
  - Search by Clerk ID
  - Returns relevant results
  
- [ ] **GET /admin/users/:id** - User details
  - Complete user profile
  - Organization memberships
  - Credit balance and history
  - Project count
  - Subscription status
  
- [ ] **PATCH /admin/users/:id/admin** - Toggle admin status
  - Grant admin access
  - Revoke admin access
  - Updates user metadata
  
- [ ] **DELETE /admin/users/:id** - Delete user
  - Soft delete user account
  - Cascade to related data
  - Maintains data integrity

### Organization Management
- [ ] **GET /admin/organizations/recent** - Recent organizations
  - Returns last 10 organizations
  - Shows tier, credits, members
  
- [ ] **GET /admin/organizations/search?q={query}** - Search organizations
  - Search by name
  - Search by ID
  - Returns relevant results
  
- [ ] **GET /admin/organizations/:id** - Organization details
  - Complete organization profile
  - Member list
  - Credit balance and allocation
  - Subscription details
  - Project count and list
  - Transaction history
  
- [ ] **POST /admin/organizations/:id/credits/adjust** - Adjust credits
  - Add credits (positive amount)
  - Deduct credits (negative amount)
  - Requires reason for audit trail
  - Creates credit transaction record
  - Sends email notification to org owner
  
- [ ] **PATCH /admin/organizations/:id/tier** - Update tier
  - Change subscription tier
  - Updates credit allocation
  - Maintains billing consistency
  - Logs tier change

### Project Management
- [ ] **GET /admin/projects/recent** - Recent projects
  - Returns last 10 projects
  - Shows status, duration, owner
  - Includes processing details

### Transaction Management
- [ ] **GET /admin/transactions/recent** - Recent transactions
  - Returns last 10 credit transactions
  - Shows type, amount, reason
  - Includes user/org details

### System Health
- [ ] **GET /admin/health** - System health check
  - Database connection status
  - Redis connection status
  - MinIO connection status
  - ML worker status
  - Queue status
  - Memory usage
  - CPU usage

---

## 🎨 Frontend UI Testing

### Admin Dashboard Page (`/admin`)
- [ ] Dashboard loads without errors
- [ ] Stats cards display correct numbers
  - Total Users
  - Total Organizations
  - Total Projects
  - Total Revenue
  
- [ ] Charts render correctly
  - User growth chart
  - Revenue chart
  - Tier distribution pie chart
  
- [ ] Recent activity feed shows latest data
- [ ] Quick actions work (search, navigate)

### User Management Page (`/admin/users`)
- [ ] User list loads with pagination
- [ ] Search functionality works
  - Search by email
  - Search by name
  - Real-time search results
  
- [ ] User details modal opens correctly
- [ ] User details show complete information
  - Profile data
  - Organization memberships
  - Credit balance
  - Projects
  - Subscription status
  
- [ ] Admin toggle works
  - Can grant admin access
  - Can revoke admin access
  - Shows confirmation dialog
  
- [ ] Delete user works
  - Shows confirmation dialog
  - Deletes user successfully
  - Updates list after deletion

### Organization Management Page (`/admin/organizations`)
- [ ] Organization list loads with pagination
- [ ] Search functionality works
- [ ] Organization details modal opens
- [ ] Organization details show complete information
  - Profile data
  - Members list
  - Credit balance
  - Projects
  - Transactions
  
- [ ] Credit adjustment works
  - Can add credits
  - Can deduct credits
  - Requires reason
  - Shows success message
  - Updates balance immediately
  
- [ ] Tier update works
  - Can change tier
  - Shows confirmation
  - Updates tier successfully
  - Reflects in UI immediately

### Analytics Page (`/admin/analytics`)
- [ ] Analytics dashboard loads
- [ ] Key metrics display correctly
  - MRR/ARR
  - User growth rate
  - Conversion rate
  - Churn rate
  - ARPU
  - LTV
  
- [ ] Time series charts render
  - User acquisition over time
  - Revenue over time
  - Can filter by date range
  
- [ ] Export functionality works
  - Can export to CSV
  - Can export to PDF

---

## 🔒 Security Testing

### Authentication
- [ ] Non-admin users cannot access admin routes
- [ ] Returns 403 Forbidden for non-admins
- [ ] Admin guard works correctly
- [ ] Clerk JWT verification works
- [ ] Token expiration handled properly

### Authorization
- [ ] Admin users can access all admin features
- [ ] Regular users redirected from admin pages
- [ ] API endpoints protected by AdminGuard
- [ ] Frontend routes protected by admin check

### Data Protection
- [ ] Sensitive data not exposed in logs
- [ ] Credit adjustments require reason
- [ ] Audit trail maintained for all admin actions
- [ ] User deletion is soft delete (data retained)

---

## 📊 Data Integrity Testing

### Credit System
- [ ] Credit adjustments reflect immediately
- [ ] Transaction log created for all changes
- [ ] Balance calculations are accurate
- [ ] Negative balances prevented
- [ ] Refunds work correctly

### Tier Management
- [ ] Tier changes update credit allocation
- [ ] Tier changes reflect in billing
- [ ] Tier changes logged in transactions
- [ ] Feature access updated based on tier

### User/Organization Relationships
- [ ] User-org memberships maintained
- [ ] Deleting user doesn't break org data
- [ ] Org data consistent across queries
- [ ] Project ownership maintained

---

## 🧪 Edge Cases & Error Handling

### Invalid Inputs
- [ ] Invalid user ID returns 404
- [ ] Invalid org ID returns 404
- [ ] Invalid credit amount rejected
- [ ] Invalid tier rejected
- [ ] Empty search query handled
- [ ] Malformed requests return 400

### Concurrent Operations
- [ ] Multiple credit adjustments handled correctly
- [ ] Race conditions prevented
- [ ] Database transactions used appropriately
- [ ] Optimistic locking where needed

### Large Datasets
- [ ] Pagination works with 1000+ users
- [ ] Search performs well with large datasets
- [ ] Analytics queries optimized
- [ ] No timeout errors

---

## 📝 Testing Procedure

### 1. Setup Test Environment
```bash
# Ensure Docker services running
docker-compose ps

# Check database has real data
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT COUNT(*) FROM \"User\";"
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT COUNT(*) FROM \"Organization\";"
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT COUNT(*) FROM \"Project\";"
```

### 2. Test Backend Endpoints
```bash
# Get admin token (replace with your admin user token)
export ADMIN_TOKEN="your-clerk-jwt-token"

# Test dashboard
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/admin/dashboard

# Test user search
curl -H "Authorization: Bearer $ADMIN_TOKEN" "http://localhost:3000/admin/users/search?q=test"

# Test credit adjustment
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"amount": 10, "reason": "Test adjustment"}' \
  http://localhost:3000/admin/organizations/{org-id}/credits/adjust
```

### 3. Test Frontend UI
1. Navigate to http://localhost:3001/admin
2. Verify admin access (should see dashboard)
3. Test each section systematically
4. Document any issues found

### 4. Test with Real Data
1. Use actual user accounts
2. Perform real credit adjustments
3. Test with production-like data volumes
4. Verify data consistency

---

## ✅ Success Criteria

- [ ] All backend endpoints return correct data
- [ ] All frontend pages load without errors
- [ ] All CRUD operations work correctly
- [ ] Authentication and authorization work properly
- [ ] Data integrity maintained across operations
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Performance acceptable (< 1s response time)
- [ ] UI responsive and user-friendly
- [ ] Edge cases handled gracefully

---

## 🐛 Known Issues

*Document any issues found during testing here*

---

## 📈 Test Results

**Date Tested:** _____________  
**Tested By:** _____________  
**Environment:** Development / Staging / Production  
**Overall Status:** ✅ Pass / ⚠️ Pass with Issues / ❌ Fail

### Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Blocked: ___

### Critical Issues
*List any critical issues that block launch*

### Minor Issues
*List any minor issues that can be fixed post-launch*

---

## 🚀 Sign-off

- [ ] Backend testing complete
- [ ] Frontend testing complete
- [ ] Security testing complete
- [ ] Data integrity verified
- [ ] Performance acceptable
- [ ] Ready for production

**Approved By:** _____________  
**Date:** _____________
