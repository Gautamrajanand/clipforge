# ClipForge Architecture Documentation

**Last Updated:** November 19, 2025  
**Version:** 2.0 (Docker-First Architecture)

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Docker Services](#docker-services)
3. [Service Communication](#service-communication)
4. [Data Flow](#data-flow)
5. [Environment Configuration](#environment-configuration)
6. [Feature Flags](#feature-flags)
7. [Storage Architecture](#storage-architecture)
8. [Queue System](#queue-system)
9. [Security](#security)
10. [Monitoring & Health Checks](#monitoring--health-checks)

---

## System Overview

ClipForge is a **Docker-first** microservices architecture for AI-powered video content repurposing.

### Core Principles:
- **Docker-First**: All services run in containers for consistency
- **Microservices**: Separate services for API, ML, Database, Storage
- **Async Processing**: Queue-based job processing for long-running tasks
- **Scalable**: Horizontal scaling of ML workers and API instances
- **Self-Hosted**: Complete control over data and infrastructure

### Technology Stack:
- **Frontend**: Next.js 14 (React, TypeScript, TailwindCSS)
- **API**: NestJS (Node.js, TypeScript)
- **ML Workers**: FastAPI (Python, PyTorch, Whisper)
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Video Processing**: FFmpeg
- **AI**: OpenAI GPT-3.5/4, Whisper, Custom ML models

---

## Docker Services

### Service Topology

```
┌─────────────────────────────────────────────────────────────┐
│                         ClipForge                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   Web    │───▶│   API    │───▶│ ML Worker│              │
│  │ :3001    │    │  :3000   │    │  :8000   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                        │                │                     │
│                        ▼                ▼                     │
│              ┌──────────────┐  ┌──────────────┐            │
│              │  PostgreSQL  │  │    Redis     │            │
│              │    :5432     │  │    :6379     │            │
│              └──────────────┘  └──────────────┘            │
│                        │                                      │
│                        ▼                                      │
│              ┌──────────────┐                               │
│              │    MinIO     │                               │
│              │  :9000-9001  │                               │
│              └──────────────┘                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1. **Web Frontend** (`clipforge-web`)
- **Container**: Not containerized (runs on host)
- **Port**: 3001
- **Purpose**: User interface
- **Tech**: Next.js 14, React, TypeScript
- **Connects To**: API (localhost:3000)

### 2. **API Service** (`clipforge-api`)
- **Container**: Yes
- **Port**: 3000
- **Purpose**: Control plane, business logic, orchestration
- **Tech**: NestJS, TypeScript, Prisma ORM
- **Connects To**: 
  - PostgreSQL (postgres:5432)
  - Redis (redis:6379)
  - MinIO (minio:9000)
  - ML Workers (ml-workers:8000)

**Key Responsibilities**:
- User authentication & authorization
- Project management
- Video upload & processing orchestration
- Job queue management
- Export generation
- API endpoints for frontend

### 3. **ML Workers** (`clipforge-ml-workers`)
- **Container**: Yes
- **Port**: 8000
- **Purpose**: AI/ML processing
- **Tech**: FastAPI, Python, PyTorch, Whisper
- **Connects To**: None (stateless)

**Key Responsibilities**:
- Video transcription (Whisper)
- Clip detection & ranking
- Scene analysis
- AI-powered content generation

### 4. **PostgreSQL** (`clipforge-postgres`)
- **Container**: Yes
- **Port**: 5432
- **Purpose**: Primary data store
- **Tech**: PostgreSQL 15 Alpine
- **Data**: Users, projects, clips, transcripts, exports

**Schema**:
- `User` - User accounts
- `Organization` - Multi-tenant organizations
- `Project` - Video projects
- `Asset` - Video files (source, reframed, clips)
- `Moment` - Detected clips/moments
- `Transcript` - Transcription data
- `Export` - Generated exports

### 5. **Redis** (`clipforge-redis`)
- **Container**: Yes
- **Port**: 6379
- **Purpose**: Cache & job queue
- **Tech**: Redis 7 Alpine

**Usage**:
- Session storage
- Job queues (BullMQ)
- Cache for expensive operations
- Rate limiting

### 6. **MinIO** (`clipforge-minio`)
- **Container**: Yes
- **Ports**: 9000 (API), 9001 (Console)
- **Purpose**: Object storage (S3-compatible)
- **Tech**: MinIO latest

**Storage Structure**:
```
clipforge/
├── projects/
│   ├── {projectId}/
│   │   ├── source.mp4
│   │   ├── reframed.mp4
│   │   └── clips/
│   │       ├── clip-1.mp4
│   │       └── clip-2.mp4
└── exports/
    └── {exportId}.mp4
```

---

## Service Communication

### Internal Docker Network

All services communicate via Docker's internal network using service names:

```yaml
# API connects to other services
DATABASE_URL: postgresql://clipforge:clipforge@postgres:5432/clipforge_dev
REDIS_URL: redis://redis:6379
S3_ENDPOINT: http://minio:9000
ML_WORKER_URL: http://ml-workers:8000
```

### External Access

Only these ports are exposed to the host:
- **3000**: API (HTTP)
- **3001**: Web (HTTP) - runs on host
- **5432**: PostgreSQL (for debugging)
- **6379**: Redis (for debugging)
- **8000**: ML Workers (HTTP)
- **9000-9001**: MinIO (HTTP)

---

## Data Flow

### 1. **Video Upload Flow**

```
User → Web → API → MinIO
                 ↓
              Database (create project)
                 ↓
              Redis (queue transcription job)
                 ↓
              ML Workers (transcribe)
                 ↓
              Database (save transcript)
                 ↓
              Redis (queue clip detection job)
                 ↓
              ML Workers (detect clips)
                 ↓
              Database (save moments)
                 ↓
              Project Status: READY
```

### 2. **AI Reframe Flow**

```
User → Web → API → MinIO (download source)
                 ↓
              FFmpeg (convert aspect ratio)
                 ↓
              FFmpeg (add watermark if FREE tier)
                 ↓
              MinIO (upload reframed.mp4)
                 ↓
              Database (create asset)
                 ↓
              Project Status: READY
```

### 3. **Export Flow**

```
User → Web → API → MinIO (download clips)
                 ↓
              FFmpeg (merge clips)
                 ↓
              FFmpeg (apply aspect ratio)
                 ↓
              FFmpeg (burn captions if requested)
                 ↓
              FFmpeg (add watermark if FREE tier)
                 ↓
              MinIO (upload export)
                 ↓
              Database (create export record)
                 ↓
              User downloads export
```

---

## Environment Configuration

### Critical Environment Variables

#### API Service:
```bash
# Database
DATABASE_URL=postgresql://clipforge:clipforge@postgres:5432/clipforge_dev

# Redis
REDIS_URL=redis://redis:6379

# Storage (MinIO)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=clipforge

# ML Workers
ML_WORKER_URL=http://ml-workers:8000

# Feature Flags
FF_ASPECT_RATIO=true
FF_CAPTION_STYLES=false

# API Keys
OPENAI_API_KEY=sk-proj-...
ASSEMBLYAI_API_KEY=...

# Security
JWT_SECRET=dev-secret-key-change-in-prod
```

#### ML Workers:
```bash
ML_WORKER_PORT=8000
ML_WORKER_HOST=0.0.0.0
ASR_PROVIDER=whisper
OPENAI_API_KEY=sk-proj-...
```

### Configuration Hierarchy

1. **docker-compose.yml** - Primary source of truth
2. **apps/api/.env** - Local overrides (gitignored)
3. **Code defaults** - Fallback values

⚠️ **IMPORTANT**: Always use Docker. Local `.env` can cause configuration drift.

---

## Feature Flags

Feature flags control experimental and new features.

### Available Flags:

#### `FF_ASPECT_RATIO` (CRITICAL)
- **Default**: `false`
- **Required**: `true`
- **Purpose**: Enable aspect ratio video processing
- **Impact**: If disabled, videos are copied without conversion
- **Used By**: AI Reframe, AI Clips export

#### `FF_CAPTION_STYLES`
- **Default**: `false`
- **Purpose**: Enable caption styling options
- **Impact**: If disabled, basic captions only

#### `FF_INPAGE_PLAYBACK`
- **Default**: `false`
- **Purpose**: Enable in-page video playback
- **Impact**: If disabled, videos download instead of playing

### Implementation:

```typescript
// apps/api/src/config/feature-flags.ts
export const FeatureFlags = {
  ASPECT_RATIO: process.env.FF_ASPECT_RATIO === 'true',
  CAPTION_STYLES: process.env.FF_CAPTION_STYLES === 'true',
  INPAGE_PLAYBACK: process.env.FF_INPAGE_PLAYBACK === 'true',
} as const;
```

---

## Storage Architecture

### MinIO Bucket Structure

```
clipforge/
├── projects/
│   └── {projectId}/
│       ├── source.mp4          # Original uploaded video
│       ├── reframed.mp4        # AI Reframe output
│       ├── proxy-{momentId}.mp4 # Pro Clip multi-segment videos
│       └── clips/
│           ├── clip-{momentId}-1.mp4
│           └── clip-{momentId}-2.mp4
├── exports/
│   └── {exportId}.mp4          # User exports
└── temp/
    └── {uuid}.mp4              # Temporary processing files
```

### Storage Policies

- **Retention**: Indefinite (user manages)
- **Cleanup**: Manual or scheduled jobs
- **Backup**: User responsibility (self-hosted)
- **Encryption**: At rest (MinIO), in transit (TLS)

---

## Queue System

### BullMQ Queues

#### 1. **Transcription Queue**
- **Name**: `transcription`
- **Purpose**: Video transcription jobs
- **Worker**: API service
- **Calls**: ML Workers `/v1/ranker/transcribe`

#### 2. **Clip Detection Queue**
- **Name**: `clip-detection`
- **Purpose**: Clip detection & ranking
- **Worker**: API service
- **Calls**: ML Workers `/v1/ranker/detect`

#### 3. **Video Import Queue**
- **Name**: `video-import`
- **Purpose**: Download videos from URLs
- **Worker**: API service
- **Uses**: yt-dlp for YouTube, direct download for others

#### 4. **Subtitle Export Queue**
- **Name**: `subtitle-export`
- **Purpose**: Generate subtitle files
- **Worker**: API service
- **Output**: SRT, VTT files

### Job Flow

```
API → Redis (add job) → Worker (process) → Redis (update status) → API (complete)
```

---

## Security

### Authentication
- **Method**: JWT tokens
- **Storage**: HTTP-only cookies
- **Expiry**: 7 days
- **Refresh**: Automatic

### Authorization
- **Model**: Organization-based multi-tenancy
- **Checks**: Every API endpoint validates orgId
- **Isolation**: Users can only access their org's data

### API Keys
- **OpenAI**: Stored in environment, not in database
- **AssemblyAI**: Stored in environment
- **JWT Secret**: Stored in environment

### Network Security
- **Docker Network**: Internal services not exposed
- **CORS**: Configured for localhost:3001
- **Rate Limiting**: Redis-based

---

## Monitoring & Health Checks

### Health Check Endpoints

#### API Health:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "database": { "status": "ok", "message": "Database connection successful" },
  "redis": { "status": "ok", "message": "Redis connection successful" }
}
```

#### ML Worker Health:
```bash
curl http://localhost:8000/v1/ranker/health
```

### Docker Health Checks

All services have health checks defined in `docker-compose.yml`:

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U clipforge"]
    interval: 10s
    timeout: 5s
    retries: 5

redis:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5

minio:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
    interval: 30s
    timeout: 20s
    retries: 3
```

### Monitoring Commands

```bash
# Check all services
docker-compose ps

# View API logs
docker-compose logs -f api

# View ML Worker logs
docker-compose logs -f ml-workers

# Check resource usage
docker stats
```

---

## Deployment

### Development Setup

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Considerations

1. **Environment Variables**:
   - Change `JWT_SECRET` to secure random string
   - Use production API keys
   - Set `NODE_ENV=production`

2. **Database**:
   - Use managed PostgreSQL (RDS, Cloud SQL)
   - Enable backups
   - Configure replication

3. **Storage**:
   - Use S3, GCS, or Azure Blob Storage
   - Enable versioning
   - Configure lifecycle policies

4. **Scaling**:
   - Horizontal scaling of API and ML Workers
   - Load balancer for API
   - CDN for static assets

5. **Security**:
   - Enable TLS/SSL
   - Configure firewall rules
   - Use secrets management (Vault, AWS Secrets Manager)

---

## Troubleshooting

### Common Issues

#### 1. **API can't connect to ML Workers**
```bash
# Check ML_WORKER_URL
docker exec clipforge-api printenv ML_WORKER_URL
# Should be: http://ml-workers:8000

# Check ML Workers are running
docker ps | grep ml-workers
```

#### 2. **Aspect ratio not working**
```bash
# Check feature flag
docker exec clipforge-api printenv FF_ASPECT_RATIO
# Should be: true
```

#### 3. **Database connection failed**
```bash
# Check PostgreSQL is healthy
docker-compose ps postgres
# Should show: healthy

# Check DATABASE_URL
docker exec clipforge-api printenv DATABASE_URL
# Should be: postgresql://clipforge:clipforge@postgres:5432/clipforge_dev
```

#### 4. **Videos not uploading**
```bash
# Check MinIO is running
docker-compose ps minio
# Should show: healthy

# Check S3_ENDPOINT
docker exec clipforge-api printenv S3_ENDPOINT
# Should be: http://minio:9000
```

### Debug Mode

Enable debug logging:
```bash
# In docker-compose.yml
api:
  environment:
    LOG_LEVEL: debug
```

---

## Best Practices

### DO:
✅ Always run services in Docker  
✅ Use `docker-compose up -d` to start services  
✅ Check health endpoints before deploying  
✅ Monitor logs for errors  
✅ Validate environment variables on startup  
✅ Use service names (not localhost) for inter-service communication  

### DON'T:
❌ Run API locally with `npm run start:dev`  
❌ Mix local and Docker services  
❌ Modify `.env` without updating `docker-compose.yml`  
❌ Expose sensitive ports to public internet  
❌ Disable feature flags without understanding impact  
❌ Use `127.0.0.1` or `localhost` for Docker service URLs  

---

## Changelog

### Version 2.0 (Nov 19, 2025)
- **Docker-First Architecture**: All services containerized
- **Environment Validation**: Startup checks for required variables
- **Feature Flags**: Proper configuration management
- **Health Checks**: Comprehensive monitoring
- **Documentation**: Complete architecture documentation

### Version 1.0 (Nov 16, 2025)
- Initial stable release
- All core features working
- Basic Docker setup

---

**Maintained By**: Development Team  
**Last Review**: November 19, 2025  
**Next Review**: December 1, 2025
