# ClipForge Bootstrap Guide

Complete setup and development guide for ClipForge.

## Prerequisites

- **Node.js**: 18+ (for API and web app)
- **Python**: 3.10+ (for ML workers)
- **Docker & Docker Compose**: Latest version
- **PostgreSQL**: 14+ (or use Docker)
- **Redis**: 7+ (or use Docker)
- **FFmpeg**: Latest version (for video processing)
- **Git**: For version control

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Quick Start (Docker Compose)

The fastest way to get started is using Docker Compose, which spins up all services.

```bash
# Clone the repository
git clone <repo-url>
cd clipforge

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 10

# Run migrations
docker-compose exec api npm run prisma:migrate

# Check status
docker-compose ps
```

Services will be available at:
- **Web App**: http://localhost:3001
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **ML Workers**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO (S3)**: http://localhost:9000

## Manual Setup (Development)

For local development without Docker:

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb clipforge_dev

# Or use Docker for just the database
docker run -d \
  --name clipforge-postgres \
  -e POSTGRES_USER=clipforge \
  -e POSTGRES_PASSWORD=clipforge \
  -e POSTGRES_DB=clipforge_dev \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Redis Setup

```bash
# Using Docker
docker run -d \
  --name clipforge-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 3. API Setup

```bash
cd apps/api

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

API will be available at http://localhost:3000

### 4. ML Workers Setup

```bash
cd workers

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
python -m uvicorn main:app --reload --port 8000
```

Workers will be available at http://localhost:8000

### 5. Web App Setup

```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Web app will be available at http://localhost:3001

## Environment Configuration

Edit `.env` file to customize:

```bash
# Database
DATABASE_URL=postgresql://clipforge:clipforge@localhost:5432/clipforge_dev

# API
API_PORT=3000
NODE_ENV=development

# ML Workers
ML_WORKER_PORT=8000

# Storage (S3/R2)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=clipforge

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-prod

# ASR Provider
ASR_PROVIDER=whisper  # or 'assemblyai'
WHISPER_MODEL_SIZE=base  # tiny, base, small, medium, large

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Development Workflow

### Running All Services

**Option 1: Docker Compose (Recommended)**
```bash
docker-compose up
```

**Option 2: Individual Terminals**

Terminal 1 - API:
```bash
cd apps/api
npm run start:dev
```

Terminal 2 - Workers:
```bash
cd workers
source venv/bin/activate
python -m uvicorn main:app --reload
```

Terminal 3 - Web:
```bash
cd apps/web
npm run dev
```

### Database Migrations

```bash
cd apps/api

# Create new migration
npm run prisma:migrate -- --name add_feature

# View schema
npm run prisma:studio

# Reset database (dev only)
npm run prisma:migrate reset
```

### Testing

```bash
# API tests
cd apps/api
npm test

# Worker tests
cd workers
pytest

# Web tests
cd apps/web
npm test
```

### Linting & Formatting

```bash
# API
cd apps/api
npm run lint

# Web
cd apps/web
npm run lint
```

## API Usage

### Authentication

All API requests require authentication. Use either:

**JWT Token:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/v1/projects
```

**API Key:**
```bash
curl -H "X-Api-Key: <api-key>" http://localhost:3000/v1/projects
```

### Example Workflow

1. **Register/Login**
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

2. **Create Project**
```bash
curl -X POST http://localhost:3000/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Video",
    "sourceUrl": "https://example.com/video.mp4"
  }'
```

3. **Get Presigned Upload URL**
```bash
curl -X POST http://localhost:3000/v1/uploads/sign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "video.mp4",
    "mimeType": "video/mp4",
    "size": 104857600
  }'
```

4. **Run Highlight Detection**
```bash
curl -X POST http://localhost:3000/v1/projects/<project-id>/detect \
  -H "Authorization: Bearer <token>"
```

5. **Export Clip**
```bash
curl -X POST http://localhost:3000/v1/clips/<clip-id>/export \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "MP4",
    "aspectRatio": "9:16",
    "template": "default"
  }'
```

See `samples.http` for more examples.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U clipforge -d clipforge_dev -c "SELECT 1"

# Reset database
cd apps/api
npm run prisma:migrate reset
```

### FFmpeg Not Found

```bash
# Verify FFmpeg installation
ffmpeg -version

# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
```

### Whisper Model Download

First run will download model (~1.5GB for 'base'):
```bash
# Pre-download model
python -c "import whisper; whisper.load_model('base')"
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

## Production Deployment

See `DEPLOYMENT.md` for:
- Kubernetes setup
- AWS deployment
- GCP deployment
- Environment configuration
- Scaling guidelines

## Performance Tuning

### API
- Enable caching with Redis
- Use connection pooling for database
- Enable compression for responses

### Workers
- Allocate GPU for Whisper (if available)
- Tune FFmpeg encoding parameters
- Use worker pools for parallel processing

### Database
- Add indexes for frequently queried fields
- Enable query logging for optimization
- Regular VACUUM and ANALYZE

## Monitoring

### Logs

```bash
# Docker Compose
docker-compose logs -f api
docker-compose logs -f ml-workers
docker-compose logs -f web

# Manual
tail -f logs/api.log
tail -f logs/workers.log
```

### Metrics

- Prometheus: http://localhost:9090 (if enabled)
- Grafana: http://localhost:3000 (if enabled)

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Workers health
curl http://localhost:8000/health/live
curl http://localhost:8000/health/ready
```

## Support & Issues

- **Documentation**: See README.md and ARCHITECTURE.md
- **API Docs**: http://localhost:3000/api/docs (Swagger UI)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## Next Steps

1. ✅ Set up development environment
2. 📚 Read ARCHITECTURE.md for system design
3. 🔧 Explore API endpoints in samples.http
4. 🎨 Customize brand kits and templates
5. 🚀 Deploy to production (see DEPLOYMENT.md)

Happy clipping! 🎬
