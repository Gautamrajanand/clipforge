# Admin Panel Documentation

## Overview
The ClipForge Admin Panel provides comprehensive tools for managing users, organizations, credits, and monitoring key SaaS metrics.

## Features

### 1. User Management (`/admin/users`)
- **View all users** with search and filtering
- **User details**: Name, email, organization, tier, credits, admin status
- **Actions**:
  - Adjust credits (add/deduct)
  - Change organization tier (FREE/STARTER/PRO/BUSINESS)
  - Toggle admin status
  - Delete user (with confirmation)

### 2. Analytics Dashboard (`/admin/analytics`)
- **Key Metrics**:
  - MRR (Monthly Recurring Revenue)
  - Churn Rate
  - LTV (Customer Lifetime Value)
  - ARPU (Average Revenue Per User)
  - Growth Rate (30/60/90 days)

- **Visualizations**:
  - Revenue trend line chart
  - User growth line chart
  - Revenue by tier pie chart
  - Customers by tier bar chart
  - Cohort retention table

- **Time Range Selector**: 7/30/90 days

### 3. Dashboard Overview (`/admin`)
- Total users count
- Active organizations
- Total credits issued
- Recent activity
- Quick navigation to Users and Analytics

## Access Control

### Admin Guard
- Only users with `isAdmin: true` can access admin routes
- Implemented at API level (`AdminGuard`)
- Checks both user ID and email (for Clerk users)

### Granting Admin Access
```sql
-- Via Prisma Studio or direct SQL
UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@example.com';
```

## API Endpoints

### User Management
- `GET /admin/users/recent?limit=10` - Get recent users
- `GET /admin/users/search?query=email` - Search users
- `PATCH /admin/users/:id/admin` - Toggle admin status
- `DELETE /admin/users/:id` - Delete user

### Organization Management
- `POST /admin/organizations/:id/credits/adjust` - Adjust credits
- `PATCH /admin/organizations/:id/tier` - Change tier

### Analytics
- `GET /admin/analytics` - Get all metrics
- `GET /admin/analytics/timeseries?days=30` - Get time series data

## Credit Adjustment

### How It Works
1. Admin selects a user
2. Enters amount (positive to add, negative to deduct)
3. Provides reason (required)
4. System creates credit transaction record
5. Updates organization credits

### Transaction Types
- `ADMIN_ADJUSTMENT` - Credits added by admin
- `ADMIN_DEDUCTION` - Credits removed by admin

## Tier Pricing

| Tier | Price/Month | Credits/Month |
|------|-------------|---------------|
| FREE | $0 | 60 |
| STARTER | $29 | 150 |
| PRO | $79 | 300 |
| BUSINESS | $99 | Unlimited |

## Analytics Calculations

### MRR (Monthly Recurring Revenue)
```
MRR = Sum of all paid tier prices
ARR = MRR × 12
Growth Rate = (Current MRR - Last Month MRR) / Last Month MRR × 100
```

### Churn Rate
```
Churn Rate = (Churned Customers / Total Customers) × 100
Churned = Organizations that downgraded to FREE in last 30 days
```

### LTV (Customer Lifetime Value)
```
LTV = ARPU / Monthly Churn Rate
ARPU = Average Revenue Per User (paid customers only)
```

### Cohort Retention
```
Retention Rate = (Retained Customers / Total Signups) × 100
Grouped by signup month
```

## Security

### Authentication
- Clerk authentication required
- JWT token validation on all requests
- Admin guard on all admin routes

### Authorization
- Only admins can access admin panel
- User actions logged for audit trail
- Credit transactions tracked with reasons

## Best Practices

### User Management
1. Always provide clear reasons for credit adjustments
2. Confirm before deleting users (irreversible)
3. Monitor admin activity logs
4. Review user list regularly

### Analytics
1. Check metrics daily for anomalies
2. Monitor churn rate (target < 5%)
3. Track cohort retention for product health
4. Use time range selector for trend analysis

### Credit Management
1. Document all manual adjustments
2. Set up alerts for low credit balances
3. Review credit usage patterns
4. Adjust tier pricing based on usage

## Troubleshooting

### Admin Access Issues
- Verify `isAdmin` flag in database
- Check Clerk user ID matches database
- Review API logs for auth errors

### Analytics Not Loading
- Check API connection
- Verify database has data
- Review browser console for errors

### Credit Adjustment Fails
- Ensure amount is non-zero
- Provide reason text
- Check organization exists
- Verify API is running

## Future Enhancements

### Planned Features
- [ ] Bulk user operations
- [ ] Email notifications for credit adjustments
- [ ] Advanced filtering and sorting
- [ ] Export analytics to CSV
- [ ] Custom date range picker
- [ ] Real-time dashboard updates
- [ ] User activity timeline
- [ ] Revenue forecasting
- [ ] Automated churn alerts
- [ ] A/B testing dashboard

## Support

For issues or questions:
1. Check API logs: `docker-compose logs api`
2. Check web logs: `docker-compose logs web`
3. Review Prisma Studio for data verification
4. Contact development team
