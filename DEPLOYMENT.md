# ClipForge Deployment Guide

Production deployment guide for ClipForge across multiple platforms.

---

## Quick Deployment Options

### Option 1: Vercel + AWS (Recommended)
- **Web**: Vercel (Next.js)
- **API**: AWS ECS/Fargate
- **Workers**: AWS EC2 (GPU) or Runpod
- **Database**: AWS RDS PostgreSQL
- **Storage**: AWS S3
- **CDN**: CloudFront

### Option 2: Render + Fly.io
- **Web**: Vercel or Render
- **API**: Render
- **Workers**: Fly.io
- **Database**: Render PostgreSQL
- **Storage**: AWS S3
- **CDN**: Cloudflare

### Option 3: All-in-One Kubernetes
- **Platform**: AWS EKS, GCP GKE, or DigitalOcean
- **All services**: Kubernetes pods
- **Database**: Managed PostgreSQL
- **Storage**: S3-compatible storage
- **CDN**: Ingress + CloudFlare

---

## 1. Web App Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps

```bash
# 1. Connect repository to Vercel
# Go to https://vercel.com/new and import your repository

# 2. Configure environment variables
NEXT_PUBLIC_API_URL=https://api.clipforge.dev
NEXT_PUBLIC_APP_URL=https://app.clipforge.dev

# 3. Deploy
# Automatic on push to main branch
```

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "NEXT_PUBLIC_APP_URL": "@app_url"
  }
}
```

---

## 2. API Deployment (AWS ECS/Farcel)

### Prerequisites
- AWS account
- Docker image built and pushed to ECR

### Steps

```bash
# 1. Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -f Dockerfile.api -t clipforge-api:latest .
docker tag clipforge-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/clipforge-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/clipforge-api:latest

# 2. Deploy with Terraform
cd infra/terraform
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars

# 3. Configure environment
aws ecs update-service \
  --cluster clipforge-prod \
  --service clipforge-api \
  --force-new-deployment
```

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/clipforge
REDIS_URL=redis://elasticache-endpoint:6379
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=clipforge-prod
JWT_SECRET=$(openssl rand -base64 32)
```

---

## 3. ML Workers Deployment

### Option A: AWS EC2 (GPU)

```bash
# 1. Launch GPU instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type g4dn.xlarge \
  --key-name clipforge-key \
  --security-groups clipforge-workers

# 2. SSH and setup
ssh -i clipforge-key.pem ec2-user@instance-ip

# 3. Install dependencies
sudo yum update -y
sudo yum install -y python3 python3-pip ffmpeg

# 4. Deploy workers
pip install -r workers/requirements.txt
python workers/main.py
```

### Option B: Runpod (Recommended for Whisper)

```bash
# 1. Create Runpod account and API key

# 2. Deploy container
curl -X POST https://api.runpod.io/graphql \
  -H "Content-Type: application/json" \
  -H "api_key: your-api-key" \
  -d '{
    "query": "mutation { podFindAndDeployOnDemand(input: { cloudType: SECURE, gpuCount: 1, volumeInGb: 50, containerDiskInGb: 10, minVolumeInGb: 50, gpuTypeId: \"NVIDIA RTX A6000\", name: \"clipforge-workers\", imageName: \"clipforge-workers:latest\", ports: \"8000/http\" }) { id } }"
  }'

# 3. Configure environment
export RUNPOD_API_KEY=your-key
export ASR_PROVIDER=whisper
export WHISPER_MODEL_SIZE=base
```

### Option C: Modal (Serverless)

```bash
# 1. Install Modal CLI
pip install modal

# 2. Deploy
modal deploy workers/main.py

# 3. Access endpoint
# https://your-workspace--clipforge-workers.modal.run
```

---

## 4. Database Setup (AWS RDS)

### Create PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier clipforge-prod \
  --db-instance-class db.t3.small \
  --engine postgres \
  --master-username admin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 100 \
  --backup-retention-period 7 \
  --multi-az
```

### Run Migrations

```bash
# 1. Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier clipforge-prod \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# 2. Set DATABASE_URL
export DATABASE_URL=postgresql://admin:password@$RDS_ENDPOINT:5432/clipforge

# 3. Run migrations
cd apps/api
npm run prisma:migrate deploy
npm run prisma:seed
```

---

## 5. Storage Setup (AWS S3)

### Create S3 Bucket

```bash
aws s3api create-bucket \
  --bucket clipforge-prod \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket clipforge-prod \
  --versioning-configuration Status=Enabled

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket clipforge-prod \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "Archive old exports",
      "Status": "Enabled",
      "Transitions": [{
        "Days": 90,
        "StorageClass": "GLACIER"
      }],
      "Expiration": {
        "Days": 365
      }
    }]
  }'

# Enable CORS
aws s3api put-bucket-cors \
  --bucket clipforge-prod \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://app.clipforge.dev"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"]
    }]
  }'
```

---

## 6. CDN Setup (CloudFront)

```bash
# 1. Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "clipforge-prod",
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3Origin",
        "DomainName": "clipforge-prod.s3.amazonaws.com",
        "S3OriginConfig": {}
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      },
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      }
    },
    "Enabled": true
  }'

# 2. Get CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].DomainName' \
  --output text)

echo "CDN URL: https://$CLOUDFRONT_DOMAIN"
```

---

## 7. Monitoring & Logging

### CloudWatch Logs

```bash
# Create log groups
aws logs create-log-group --log-group-name /clipforge/api
aws logs create-log-group --log-group-name /clipforge/workers
aws logs create-log-group --log-group-name /clipforge/web

# Set retention
aws logs put-retention-policy \
  --log-group-name /clipforge/api \
  --retention-in-days 30
```

### CloudWatch Alarms

```bash
# API error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name clipforge-api-errors \
  --alarm-description "Alert on API errors" \
  --metric-name ErrorCount \
  --namespace AWS/ECS \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## 8. SSL/TLS Certificates

### AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name clipforge.dev \
  --subject-alternative-names app.clipforge.dev api.clipforge.dev \
  --validation-method DNS

# Validate via DNS (follow AWS console)
# Then attach to CloudFront/ALB
```

---

## 9. Backup & Disaster Recovery

### Database Backups

```bash
# Enable automated backups (already set in RDS)
# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier clipforge-prod \
  --db-snapshot-identifier clipforge-backup-$(date +%Y%m%d)

# Cross-region backup
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier clipforge-backup-20241104 \
  --target-db-snapshot-identifier clipforge-backup-20241104-dr \
  --source-region us-east-1 \
  --destination-region us-west-2
```

### S3 Backups

```bash
# Enable S3 replication
aws s3api put-bucket-replication \
  --bucket clipforge-prod \
  --replication-configuration '{
    "Role": "arn:aws:iam::ACCOUNT:role/s3-replication",
    "Rules": [{
      "Status": "Enabled",
      "Priority": 1,
      "Destination": {
        "Bucket": "arn:aws:s3:::clipforge-prod-dr",
        "ReplicationTime": {"Status": "Enabled", "Time": {"Minutes": 15}}
      }
    }]
  }'
```

---

## 10. Scaling & Performance

### Auto-Scaling API

```bash
# Create auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name clipforge-api-asg \
  --launch-template LaunchTemplateName=clipforge-api \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --availability-zones us-east-1a us-east-1b

# Create scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name clipforge-api-asg \
  --policy-name scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    }
  }'
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_exports_project_id ON exports(project_id);
CREATE INDEX idx_moments_project_id ON moments(project_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM exports WHERE project_id = 'xxx';
```

---

## 11. Troubleshooting

### Check API Health

```bash
curl https://api.clipforge.dev/health
```

### View Logs

```bash
# API logs
aws logs tail /clipforge/api --follow

# Worker logs
aws logs tail /clipforge/workers --follow
```

### Database Connection Issues

```bash
# Test connection
psql postgresql://user:pass@rds-endpoint:5432/clipforge -c "SELECT 1"

# Check RDS security group
aws ec2 describe-security-groups --group-ids sg-xxx
```

---

## 12. Rollback Procedures

### API Rollback

```bash
# Get previous task definition
PREVIOUS_TASK=$(aws ecs describe-task-definition \
  --task-definition clipforge-api:1 \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# Update service to use previous version
aws ecs update-service \
  --cluster clipforge-prod \
  --service clipforge-api \
  --task-definition $PREVIOUS_TASK
```

### Database Rollback

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier clipforge-prod-restored \
  --db-snapshot-identifier clipforge-backup-20241104
```

---

## Checklist

- [ ] AWS account set up
- [ ] Vercel project created
- [ ] RDS PostgreSQL instance running
- [ ] S3 bucket created with lifecycle policies
- [ ] CloudFront distribution configured
- [ ] SSL certificates issued
- [ ] API deployed to ECS
- [ ] ML workers deployed (Runpod/Modal)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Monitoring and alarms set up
- [ ] Backups configured
- [ ] DNS records updated
- [ ] Load testing completed
- [ ] Security audit passed

---

**Deployment complete! 🚀**
