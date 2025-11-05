# Changelog

All notable changes to ClipForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-11-05

### 🎉 Initial Release - MVP Foundation

This is the first release of ClipForge, establishing the core foundation for an AI-powered video clipping platform.

### Added

#### Backend Infrastructure
- NestJS API server with modular architecture
- PostgreSQL database with Prisma ORM
- MinIO object storage for video files
- Docker Compose development environment
- JWT-based authentication system
- API key authentication for partner integrations
- Swagger/OpenAPI documentation

#### Video Management
- Video file upload endpoint with multipart/form-data support
- Video metadata storage (title, source URL, status)
- MinIO integration for secure video storage
- Authenticated video streaming with blob URLs
- CORS configuration for cross-origin media access
- Video preview endpoint

#### Clip Detection & Export
- Simulated AI clip detection with scoring system
- Feature analysis breakdown:
  - Hook strength (attention-grabbing opening)
  - Emotional engagement
  - Narrative structure
  - Content novelty
  - Clarity and comprehension
  - Memorable quotes
  - Visual focus quality
- FFmpeg integration for video processing
- Timestamp-based clip extraction
- Export status tracking (PENDING, PROCESSING, COMPLETED, FAILED)
- Clip download endpoint with proper headers
- Multiple clip export in single request

#### User Interface
- Next.js web application with TypeScript
- Modern dashboard with project listing
- Video upload modal with:
  - Project title input
  - File selection with drag-and-drop
  - Upload progress tracking
- Project detail page featuring:
  - Full video player with authenticated streaming
  - AI-detected clips list with detailed cards
  - Visual feature breakdown with color-coded progress bars
  - "Why This Clip Stands Out" natural language explanations
  - Clip selection with checkboxes
  - Export configuration (aspect ratio, template)
- Exported clips section with:
  - Video preview players for each clip
  - Clip metadata (score, reason, timestamps, duration)
  - Download buttons
  - Share functionality (placeholder)
- Responsive design with TailwindCSS
- Lucide React icons

#### Documentation
- Comprehensive API documentation
- Architecture overview (ARCHITECTURE.md)
- Deployment guide (DEPLOYMENT.md)
- Partner integration guide (partners/INTEGRATION_GUIDE.md)
- Product roadmap (ROADMAP.md)
- This changelog

### Technical Details

#### Database Schema
- Organizations table for multi-tenancy
- Users table with authentication
- Projects table for video management
- Assets table for video files and exports
- Moments table for detected clips
- Exports table for exported clips
- Transcripts table (prepared for future use)

#### API Endpoints
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User authentication
- `GET /v1/projects` - List projects
- `POST /v1/projects` - Create project
- `GET /v1/projects/:id` - Get project details
- `POST /v1/projects/:id/upload` - Upload video
- `GET /v1/projects/:id/video` - Stream video
- `POST /v1/projects/:id/detect` - Trigger clip detection
- `POST /v1/projects/:id/export` - Export clips
- `GET /v1/projects/exports/:id/download` - Download exported clip

#### Dependencies
- **Backend:** NestJS, Prisma, PostgreSQL, MinIO, FFmpeg, Passport, JWT
- **Frontend:** Next.js, React, TailwindCSS, Lucide React
- **DevOps:** Docker, Docker Compose

### Known Limitations

- AI clip detection is simulated (not using real ML models)
- Video processing is synchronous (no background jobs)
- Limited error handling and retry logic
- No video format validation
- No file size limits enforced
- Basic test coverage

### Security

- JWT tokens for API authentication
- API keys for partner integrations
- Secure video streaming with authorization
- CORS properly configured
- Helmet security headers
- Password hashing with bcrypt

### Performance

- Video streaming uses blob URLs to avoid CORS issues
- Proper cleanup of object URLs to prevent memory leaks
- BigInt serialization handled for JSON responses

---

## [Unreleased]

### Planned for v0.2.0
- Real AI model integration
- Background job processing
- Redis caching
- Transcription service
- Enhanced error handling

---

[0.1.0]: https://github.com/yourusername/clipforge/releases/tag/v0.1.0
