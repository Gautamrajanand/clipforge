# ClipForge Production Deployment Guide

**Last Updated:** December 17, 2025  
**Environment:** Production  
**Target:** AWS/DigitalOcean/Render

---

## 🏗️ Infrastructure Requirements

### Minimum Requirements
- **API Server:** 4 CPU, 8GB RAM, 100GB SSD
- **ML Workers:** 8 CPU, 16GB RAM, 200GB SSD (GPU optional)
- **Database:** PostgreSQL 15, 4 CPU, 8GB RAM, 100GB SSD
- **Redis:** 2 CPU, 4GB RAM, 20GB SSD
- **Storage:** MinIO/S3, 1TB+ storage

### Recommended Production Setup
- **API Server:** 8 CPU, 16GB RAM, 200GB SSD (auto-scaling 2-10 instances)
- **ML Workers:** 16 CPU, 32GB RAM, 500GB SSD (auto-scaling 2-20 instances)
- **Database:** PostgreSQL 15 with read replicas, 8 CPU, 16GB RAM, 500GB SSD
- **Redis:** 4 CPU, 8GB RAM, 50GB SSD (with persistence)
- **Storage:** S3 with CloudFront CDN
- **Load Balancer:** Application Load Balancer with SSL

---

## 📦 Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.production` with all required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@prod-db:5432/clipforge_prod"
DIRECT_URL="postgresql://user:password@prod-db:5432/clipforge_prod"

# Redis
REDIS_HOST="prod-redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# MinIO/S3
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="your-aws-access-key"
MINIO_SECRET_KEY="your-aws-secret-key"
MINIO_BUCKET_NAME="clipforge-prod"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Stripe (LIVE MODE)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Price IDs (Production)
STRIPE_PRICE_STARTER="price_1SWBfe62BJnrL0SqUcbjUWR8"
STRIPE_PRICE_PRO="price_1SWBiG62BJnrL0SqYZu4Adx9"
STRIPE_PRICE_BUSINESS="price_1SWBjo62BJnrL0SqAGKawrxE"

# Razorpay (Optional for India)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@clipforge.ai"

# Application
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://api.clipforge.ai"
NEXT_PUBLIC_APP_URL="https://clipforge.ai"
API_PORT="3001"
WEB_PORT="3000"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN="..."
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
NEXT_PUBLIC_HOTJAR_ID="..."
NEXT_PUBLIC_POSTHOG_KEY="..."

# Security
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
ENCRYPTION_KEY="your-secure-encryption-key-32-chars"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="10000"

# Feature Flags
ENABLE_TRIAL="true"
ENABLE_REFERRALS="true"
ENABLE_API_ACCESS="true"
```

### 2. Database Migration
```bash
# Run all migrations
cd apps/api
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate
```

### 3. Build Docker Images
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build --no-cache

# Tag images for registry
docker tag clipforge-api:latest registry.clipforge.ai/api:v1.0.0
docker tag clipforge-web:latest registry.clipforge.ai/web:v1.0.0
docker tag clipforge-ml-workers:latest registry.clipforge.ai/ml-workers:v1.0.0

# Push to registry
docker push registry.clipforge.ai/api:v1.0.0
docker push registry.clipforge.ai/web:v1.0.0
docker push registry.clipforge.ai/ml-workers:v1.0.0
```

---

## 🚀 Deployment Steps

### Option 1: Docker Compose (Simple)

1. **Prepare Production Server**
```bash
# SSH into production server
ssh user@prod-server

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose-plugin

# Clone repository
git clone https://github.com/Gautamrajanand/clipforge.git
cd clipforge
git checkout main
```

2. **Configure Environment**
```bash
# Copy production environment file
cp .env.example .env.production
nano .env.production  # Edit with production values
```

3. **Deploy Services**
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Kubernetes (Scalable)

1. **Create Kubernetes Manifests**
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clipforge-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: clipforge-api
  template:
    metadata:
      labels:
        app: clipforge-api
    spec:
      containers:
      - name: api
        image: registry.clipforge.ai/api:v1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: clipforge-secrets
              key: database-url
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
```

2. **Deploy to Kubernetes**
```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/clipforge-api
```

### Option 3: Render/Railway (Managed)

1. **Connect GitHub Repository**
2. **Configure Services:**
   - **API:** Node.js, Dockerfile, 4GB RAM
   - **Web:** Node.js, Dockerfile, 2GB RAM
   - **ML Workers:** Python, Dockerfile, 8GB RAM
   - **PostgreSQL:** Managed database
   - **Redis:** Managed cache

3. **Set Environment Variables** in Render dashboard
4. **Deploy** - Automatic on git push

---

## 🔧 Post-Deployment Configuration

### 1. SSL/TLS Setup
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d clipforge.ai -d www.clipforge.ai -d api.clipforge.ai

# Auto-renewal
sudo certbot renew --dry-run
```

### 2. Nginx Configuration
```nginx
# /etc/nginx/sites-available/clipforge.ai
upstream api_backend {
    server localhost:3001;
}

upstream web_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name clipforge.ai www.clipforge.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clipforge.ai www.clipforge.ai;

    ssl_certificate /etc/letsencrypt/live/clipforge.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clipforge.ai/privkey.pem;

    location / {
        proxy_pass http://web_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.clipforge.ai;

    ssl_certificate /etc/letsencrypt/live/clipforge.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clipforge.ai/privkey.pem;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 2G;
    }
}
```

### 3. Database Backup
```bash
# Create backup script
cat > /opt/clipforge/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/clipforge/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker exec clipforge-postgres pg_dump -U postgres clipforge_prod > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://clipforge-backups/db/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/clipforge/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/clipforge/backup.sh" | crontab -
```

### 4. Monitoring Setup

**Sentry (Error Tracking)**
```bash
# Already configured in .env.production
# Verify in Sentry dashboard: https://sentry.io
```

**UptimeRobot (Uptime Monitoring)**
```bash
# Add monitors:
# - https://clipforge.ai (every 5 min)
# - https://api.clipforge.ai/health (every 5 min)
```

**New Relic/Datadog (Performance)**
```bash
# Install agent
npm install newrelic --save

# Configure in newrelic.js
# Add to startup: node -r newrelic server.js
```

---

## 🔍 Health Checks

### API Health Check
```bash
curl https://api.clipforge.ai/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}
```

### Database Health Check
```bash
docker exec clipforge-postgres pg_isready -U postgres
# Expected: /var/run/postgresql:5432 - accepting connections
```

### Redis Health Check
```bash
docker exec clipforge-redis redis-cli ping
# Expected: PONG
```

### MinIO/S3 Health Check
```bash
curl https://s3.clipforge.ai/minio/health/live
# Expected: OK
```

---

## 🚨 Troubleshooting

### API Not Responding
```bash
# Check logs
docker logs clipforge-api --tail 100

# Restart service
docker restart clipforge-api

# Check resource usage
docker stats clipforge-api
```

### Database Connection Issues
```bash
# Check database logs
docker logs clipforge-postgres --tail 100

# Verify connection
docker exec clipforge-postgres psql -U postgres -c "SELECT 1"

# Check connections
docker exec clipforge-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity"
```

### High Memory Usage
```bash
# Check container stats
docker stats

# Restart ML workers (memory intensive)
docker restart clipforge-ml-workers

# Clear Redis cache
docker exec clipforge-redis redis-cli FLUSHALL
```

### Slow Performance
```bash
# Check database slow queries
docker exec clipforge-postgres psql -U postgres -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"

# Check Redis memory
docker exec clipforge-redis redis-cli INFO memory

# Check disk usage
df -h
```

---

## 📊 Monitoring Dashboards

### Key Metrics to Monitor
- **Uptime:** >99.5%
- **Response Time:** p95 <1s, p99 <3s
- **Error Rate:** <1%
- **CPU Usage:** <70% average
- **Memory Usage:** <80% average
- **Disk Usage:** <80%
- **Database Connections:** <80 active
- **Redis Memory:** <4GB

### Alerts to Configure
- API down for >5 minutes
- Error rate >5%
- Response time p95 >3s
- CPU usage >90% for >10 min
- Memory usage >90% for >10 min
- Disk usage >90%
- Database connections >90

---

## 🔄 Rollback Procedure

If deployment fails or critical issues occur:

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Checkout previous stable version
git checkout <previous-stable-tag>

# 3. Restore database backup (if needed)
gunzip -c /opt/clipforge/backups/db_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i clipforge-postgres psql -U postgres clipforge_prod

# 4. Rebuild and deploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify health
curl https://api.clipforge.ai/health

# 6. Notify users
# Send email to all active users about temporary issues
```

---

## ✅ Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrated successfully
- [ ] Docker images built and pushed
- [ ] Services deployed and running
- [ ] SSL certificates configured
- [ ] Nginx configured and reloaded
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Stripe live mode enabled
- [ ] DNS configured correctly
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured (if applicable)
- [ ] Auto-scaling configured (if applicable)
- [ ] Team notified
- [ ] Documentation updated

**Deployment Status:** ⬜ READY  ⬜ IN PROGRESS  ⬜ COMPLETE

**Deployed By:** _________________  
**Date:** _________________  
**Version:** _________________
