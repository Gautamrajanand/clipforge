# API Endpoints Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: TBD

## Authentication
All admin endpoints require:
- **Clerk JWT token** in `Authorization` header
- **Admin privileges** (`isAdmin: true` in database)

```bash
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

---

## Admin Endpoints

### Dashboard

#### Get Dashboard Stats
```http
GET /admin/dashboard
```

**Response**:
```json
{
  "totalUsers": 10,
  "totalOrganizations": 5,
  "totalCredits": 1500,
  "activeUsers": 8,
  "recentActivity": [...]
}
```

---

### User Management

#### Get Recent Users
```http
GET /admin/users/recent?limit=10
```

**Query Parameters**:
- `limit` (optional): Number of users to return (default: 10)

**Response**:
```json
[
  {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "memberships": [
      {
        "org": {
          "id": "org_456",
          "name": "Acme Corp",
          "tier": "PRO",
          "credits": 300
        }
      }
    ]
  }
]
```

#### Search Users
```http
GET /admin/users/search?query=john&limit=20
```

**Query Parameters**:
- `query` (required): Search term (email or name)
- `limit` (optional): Max results (default: 20)

**Response**: Same as Get Recent Users

#### Toggle Admin Status
```http
PATCH /admin/users/:id/admin
```

**Request Body**:
```json
{
  "isAdmin": true
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": true
  }
}
```

#### Delete User
```http
DELETE /admin/users/:id
```

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note**: Cascading delete removes all related records (memberships, etc.)

---

### Organization Management

#### Adjust Credits
```http
POST /admin/organizations/:id/credits/adjust
```

**Request Body**:
```json
{
  "amount": 100,
  "reason": "Promotional credit for early adopter"
}
```

**Parameters**:
- `amount`: Integer (positive to add, negative to deduct)
- `reason`: String (required, for audit trail)

**Response**:
```json
{
  "success": true,
  "organization": {
    "id": "org_456",
    "name": "Acme Corp",
    "credits": 400,
    "tier": "PRO"
  },
  "transaction": {
    "id": "txn_789",
    "amount": 100,
    "type": "ADMIN_ADJUSTMENT",
    "reason": "Promotional credit for early adopter",
    "balanceBefore": 300,
    "balanceAfter": 400,
    "createdAt": "2025-11-28T00:00:00.000Z"
  }
}
```

#### Change Tier
```http
PATCH /admin/organizations/:id/tier
```

**Request Body**:
```json
{
  "tier": "BUSINESS"
}
```

**Valid Tiers**: `FREE`, `STARTER`, `PRO`, `BUSINESS`

**Response**:
```json
{
  "success": true,
  "organization": {
    "id": "org_456",
    "name": "Acme Corp",
    "tier": "BUSINESS",
    "credits": 400
  }
}
```

---

### Analytics

#### Get All Analytics
```http
GET /admin/analytics
```

**Response**:
```json
{
  "mrr": {
    "current": 481,
    "arr": 5772,
    "growth": 12.5
  },
  "churn": {
    "rate": 3.2,
    "churned": 2,
    "retained": 60
  },
  "ltv": {
    "value": 1687,
    "arpu": 54,
    "churnRate": 3.2
  },
  "arpu": 54,
  "revenueByTier": [
    {
      "tier": "FREE",
      "count": 50,
      "revenue": 0
    },
    {
      "tier": "STARTER",
      "count": 5,
      "revenue": 145
    },
    {
      "tier": "PRO",
      "count": 3,
      "revenue": 237
    },
    {
      "tier": "BUSINESS",
      "count": 1,
      "revenue": 99
    }
  ],
  "growthMetrics": {
    "current": 9,
    "last30Days": 2,
    "last60Days": 4,
    "last90Days": 5,
    "growthRate30": 28.6,
    "growthRate60": 80.0,
    "growthRate90": 125.0
  },
  "cohortData": [
    {
      "month": "2025-11",
      "total": 20,
      "retained": 18,
      "retentionRate": 90.0
    }
  ],
  "timestamp": "2025-11-28T00:00:00.000Z"
}
```

#### Get Time Series Data
```http
GET /admin/analytics/timeseries?days=30
```

**Query Parameters**:
- `days` (optional): Number of days to return (default: 30)

**Response**:
```json
[
  {
    "date": "2025-11-01",
    "users": 95,
    "paidOrgs": 8,
    "revenue": 552
  },
  {
    "date": "2025-11-02",
    "users": 97,
    "paidOrgs": 8,
    "revenue": 552
  },
  ...
]
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "No authentication token provided"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "amount must be a non-zero integer",
    "reason is required"
  ]
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Future implementation:
- **Rate**: 100 requests per minute per user
- **Burst**: 20 requests per second
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Testing with cURL

### Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### Adjust Credits
```bash
curl -X POST http://localhost:3000/admin/organizations/org_123/credits/adjust \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "reason": "Test credit adjustment"
  }'
```

### Change Tier
```bash
curl -X PATCH http://localhost:3000/admin/organizations/org_123/tier \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "PRO"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/admin/users/user_123 \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Frontend Integration

### Using fetchWithAuth Helper

```typescript
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();

// Get analytics
const response = await fetchWithAuth(
  'http://localhost:3000/admin/analytics',
  {
    method: 'GET',
    getToken,
  }
);

const data = await response.json();
```

### Adjust Credits Example

```typescript
const adjustCredits = async (orgId: string, amount: number, reason: string) => {
  const response = await fetchWithAuth(
    `http://localhost:3000/admin/organizations/${orgId}/credits/adjust`,
    {
      method: 'POST',
      getToken,
      body: JSON.stringify({ amount, reason }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to adjust credits');
  }

  return response.json();
};
```

---

## Webhook Events (Future)

Planned webhook events for external integrations:

- `user.created` - New user signup
- `user.deleted` - User account deleted
- `organization.tier.changed` - Tier upgrade/downgrade
- `credits.adjusted` - Manual credit adjustment
- `subscription.churned` - Customer downgraded to FREE
- `mrr.milestone` - MRR reached milestone ($1k, $10k, etc.)

---

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL versioning:
- `/v1/admin/...`
- `/v2/admin/...`

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Rotate Clerk keys regularly**
3. **Log all admin actions**
4. **Implement rate limiting**
5. **Validate all input**
6. **Use parameterized queries** (Prisma handles this)
7. **Set CORS appropriately**
8. **Monitor for suspicious activity**

---

## Support

For API issues:
1. Check API logs: `docker-compose logs api`
2. Verify Clerk token is valid
3. Confirm user has admin privileges
4. Review request/response in browser DevTools
5. Contact development team
