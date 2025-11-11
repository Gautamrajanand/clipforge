# Changelog

All notable changes to ClipForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2025-11-11

### 🎉 Major Feature: URL Import for Videos

This release adds support for importing videos directly from URLs (YouTube, Vimeo, Rumble, Twitter, TikTok), achieving competitive parity with OpusClip and Podcastle. Users can now skip the download step and import videos with a single click.

### Added

#### URL Import System
- **VideoDownloadService**: Downloads videos from multiple platforms using yt-dlp
- **Platform Detection**: Automatic detection of YouTube, Vimeo, Rumble, Twitter/X, TikTok
- **Metadata Extraction**: Auto-fills project title, duration, and thumbnail from video metadata
- **Async Processing**: Non-blocking downloads with real-time status updates
- **Progress Tracking**: Full status polling through IMPORTING → INGESTING → TRANSCRIBING → READY

#### Frontend Enhancements
- **Tabbed Upload Modal**: Switch between "Upload File" and "Import from URL"
- **URL Input Field**: Paste any supported video URL
- **Platform Indicators**: Visual feedback for detected platform
- **Custom Title Override**: Optional custom title or auto-fill from video
- **Real-time Progress**: Shows download progress and processing stages

#### Backend Infrastructure
- **New Project Status**: Added `IMPORTING` and `ERROR` to ProjectStatus enum
- **Import Endpoint**: `POST /v1/projects/:id/import-url` for URL imports
- **Database Schema**: Updated Prisma schema with new statuses
- **Docker Integration**: yt-dlp and python3-pip installed in API container

### Technical Details

#### Supported Platforms
- ✅ YouTube (all formats)
- ✅ Vimeo (public and unlisted)
- ✅ Rumble
- ✅ Twitter/X
- ✅ TikTok

#### Processing Flow
1. User pastes URL in modal
2. Frontend creates project with temporary title
3. Backend downloads video using yt-dlp
4. Extracts metadata (title, duration, thumbnail)
5. Uploads to MinIO storage
6. Updates project with video title
7. Triggers transcription and clip detection
8. User redirected to project page

#### Performance
- Async download (1-3 minutes for typical videos)
- No frontend timeout issues
- Proper cleanup of temporary files
- Memory-efficient streaming

### Changed
- Extended polling timeout to 4 minutes for URL imports
- Improved error handling with user-friendly messages
- Enhanced logging for debugging URL imports

### Fixed
- Title auto-fill from video metadata
- Polling now handles all project statuses
- Empty project creation on errors
- Database enum synchronization

---

## [0.2.0] - 2025-11-11

### 🎉 Major Feature: Long-Form Clips with Animated Captions

This release adds support for 60-90+ second clips with all 14 animated caption styles, achieving competitive parity with OpusClip, Submagic, and Kapwing.

### Added

#### Chunked Rendering Architecture
- **ChunkManagerService**: Splits long clips into 8-second chunks with smart boundary detection
- **VideoMergerService**: Seamless concatenation with FFmpeg concat demuxer
- Automatic routing: ≤15s = single-pass, >15s = chunked rendering
- Memory-efficient sequential processing with 2s recovery pauses
- Chunk validation (resolution, codec, FPS compatibility)

#### Caption System Enhancements
- Extended all 14 animated styles to support 90+ second clips
- Added 4 new viral caption styles:
  - **Rainbow**: Rotating colors for maximum engagement
  - **Fill**: Progressive highlight fill effect
  - **3D Shadow**: Layered depth effect
  - **Tricolor**: Accent color on middle word
  - **Bounce**: Vertical bounce animation (Hormozi/Gary Vee style)
- Improved caption positioning (58% height for optimal face framing)
- Reduced max chars per line (12) for better visual spacing
- Chunk-aware frame generation with progress tracking

#### Memory Optimizations
- Ultra-conservative FFmpeg settings (ultrafast preset, single-threaded)
- 8-second chunks (240 frames @ 30fps)
- Forced garbage collection after each chunk
- Smaller buffers (512k) and bitrate limiting (2M)
- Automatic cleanup of temporary files

### Changed
- Updated caption duration limits from 15s to 90+ seconds for animated styles
- Improved animation parameters (stronger pop/bounce effects)
- Enhanced error handling for chunked rendering
- Updated API documentation with new duration support

### Technical Details
- Processing time: ~5-10 minutes for 60-90s clips
- Memory per chunk: ~100-150MB (stable)
- Seamless concatenation with no visible seams
- Production-tested with 38.6s clip (5 chunks)

### Documentation
- Updated `ARCHITECTURE.md` with chunked rendering architecture
- Updated `API_DOCUMENTATION.md` with new duration limits
- Updated `LONGER_CLIPS_PLAN.md` with implementation status
- Created comprehensive caption system documentation

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
