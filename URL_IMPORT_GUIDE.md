# URL Import Feature Guide

**Version:** 0.3.0  
**Last Updated:** November 11, 2025

---

## Overview

ClipForge now supports importing videos directly from URLs, eliminating the need to download videos locally. This feature provides competitive parity with OpusClip and Podcastle, saving users time and storage space.

### Supported Platforms

✅ **YouTube** - All formats, playlists, live streams  
✅ **Vimeo** - Public and unlisted videos  
✅ **Rumble** - All public videos  
✅ **Twitter/X** - Video tweets  
✅ **TikTok** - All public videos  

---

## User Guide

### How to Import a Video

1. **Open Upload Modal**
   - Click the "Create" button on the dashboard
   - Or click "Upload Video" from any page

2. **Switch to URL Import Tab**
   - Click "Import from URL" tab in the modal
   - The tab will show a URL input field

3. **Paste Video URL**
   - Paste any supported video URL
   - Platform will be automatically detected
   - Supported platforms are listed below the input

4. **Optional: Add Custom Title**
   - Leave blank to use the video's original title (recommended)
   - Or enter a custom title to override

5. **Click "Import & Process"**
   - Video will start downloading (1-3 minutes)
   - Progress will be shown in real-time
   - You'll be redirected when complete

### Status Messages

During import, you'll see these status updates:

- **"Creating project..."** - Setting up the project
- **"Downloading video from URL..."** - Fetching video (1-3 min)
- **"Processing video file..."** - Uploading to storage
- **"Transcribing audio..."** - Generating transcript
- **"Detecting viral moments..."** - AI analysis
- **"Processing complete!"** - Ready to edit

---

## Technical Documentation

### Architecture

#### Components

**Backend:**
- `VideoDownloadService` - Handles video downloads
- `ProjectsService.importVideoFromUrl()` - Orchestrates import
- `ProjectsService.processUrlImport()` - Async processing

**Frontend:**
- `UploadModal.tsx` - Tabbed upload interface
- `dashboard/page.tsx` - Import handler with polling

#### Flow Diagram

```
User Input (URL)
    ↓
Frontend: Create Project (temporary title)
    ↓
Backend: Validate URL & Platform
    ↓
Backend: Extract Metadata (yt-dlp)
    ↓
Backend: Download Video (async)
    ↓
Backend: Upload to MinIO
    ↓
Backend: Update Project (with video title)
    ↓
Backend: Trigger Transcription
    ↓
Backend: Trigger Clip Detection
    ↓
Frontend: Poll Status → Redirect
```

### API Endpoint

```http
POST /v1/projects/:id/import-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Optional Custom Title"
}
```

**Response:**
```json
{
  "message": "Video import started",
  "projectId": "cmhui0u060013cys9sqgy8gfw",
  "status": "IMPORTING"
}
```

### Project Status Flow

```
PENDING     → Initial state
IMPORTING   → Downloading from URL (1-3 min)
INGESTING   → Processing video file
TRANSCRIBING → Generating transcript
DETECTING   → Finding viral moments
READY       → Complete, ready for editing
ERROR       → Failed (with error message)
```

### Database Schema

**New Enum Values:**
```prisma
enum ProjectStatus {
  PENDING
  IMPORTING    // NEW - downloading from URL
  INGESTING
  TRANSCRIBING
  DETECTING
  READY
  FAILED
  ERROR        // NEW - import/processing error
}
```

### Dependencies

**Docker Container:**
```dockerfile
RUN apt-get update && apt-get install -y \
    python3-pip \
    && pip3 install --no-cache-dir yt-dlp \
    && apt-get clean
```

**Node.js:**
- `fluent-ffmpeg` - Video processing
- `@prisma/client` - Database ORM
- `@nestjs/common` - Framework

---

## Development

### Local Setup

1. **Install yt-dlp in Docker:**
   ```bash
   docker-compose build api
   ```

2. **Update Database Schema:**
   ```bash
   cd apps/api
   npx prisma migrate dev --name add_importing_status
   npx prisma generate
   ```

3. **Restart Containers:**
   ```bash
   docker-compose restart api web
   ```

### Testing

**Test URL Import:**
```bash
# Create project
curl -X POST http://localhost:3000/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Import"}'

# Import from URL
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/import-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Check status
curl http://localhost:3000/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Check Logs:**
```bash
# API logs
docker logs clipforge-api --tail 100 -f

# Look for these messages:
# "📥 Importing video from URL"
# "📹 Video info extracted"
# "📝 Setting project title"
# "✅ URL import complete"
```

### Debugging

**Common Issues:**

1. **"Processing timeout"**
   - Increase polling timeout in `dashboard/page.tsx`
   - Check API logs for actual error
   - Verify network connectivity

2. **"Title shows 'Imported Video'"**
   - Check if yt-dlp extracted metadata
   - Look for "Video info extracted" in logs
   - Verify title logic in `processUrlImport()`

3. **"Video not downloading"**
   - Verify yt-dlp is installed: `docker exec clipforge-api yt-dlp --version`
   - Check platform support
   - Try URL manually: `yt-dlp --dump-json "URL"`

4. **"Database enum error"**
   - Run migrations: `npx prisma migrate dev`
   - Regenerate client: `npx prisma generate`
   - Restart API container

---

## Performance

### Benchmarks

**Typical Import Times:**
- 5-minute video: ~1-2 minutes
- 15-minute video: ~2-3 minutes
- 30-minute video: ~3-5 minutes

**Factors:**
- Video length and quality
- Network speed
- Platform throttling
- Server resources

### Optimization

**Current Optimizations:**
- Async processing (non-blocking)
- Streaming downloads (memory-efficient)
- Automatic temp file cleanup
- Parallel transcription trigger

**Future Improvements:**
- Progress percentage tracking
- Resume failed downloads
- Batch URL imports
- Download queue system

---

## Security

### Considerations

1. **URL Validation**
   - Platform whitelist enforcement
   - URL format validation
   - No arbitrary command execution

2. **File Storage**
   - Temporary files in `/tmp/clipforge/downloads/`
   - Automatic cleanup after upload
   - MinIO access control

3. **Rate Limiting**
   - Consider adding rate limits per user
   - Prevent abuse of download service
   - Monitor yt-dlp usage

### Best Practices

- Always validate URLs before processing
- Clean up temp files in error cases
- Log all import attempts
- Monitor disk space usage

---

## Roadmap

### Completed ✅
- YouTube, Vimeo, Rumble, Twitter, TikTok support
- Auto-fill title from metadata
- Async processing with status polling
- Error handling and user feedback

### Planned 📋
- **Batch Import**: Multiple URLs at once
- **Playlist Support**: Import entire playlists
- **Progress Tracking**: Real-time download percentage
- **Resume Downloads**: Handle network interruptions
- **More Platforms**: Instagram, Facebook, Twitch
- **Direct Upload**: Skip MinIO for faster processing
- **Webhook Notifications**: Alert when import complete

---

## Support

### Getting Help

**Documentation:**
- API Documentation: `API_DOCUMENTATION.md`
- Architecture: `ARCHITECTURE.md`
- Changelog: `CHANGELOG.md`

**Logs:**
```bash
# API logs
docker logs clipforge-api --tail 100

# Web logs
docker logs clipforge-web --tail 100

# Database check
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev
```

**Common Commands:**
```bash
# Restart services
docker-compose restart api web

# Rebuild API (after Dockerfile changes)
docker-compose build api
docker-compose up -d api

# Check yt-dlp version
docker exec clipforge-api yt-dlp --version

# Test video info extraction
docker exec clipforge-api yt-dlp --dump-json "URL"
```

---

## Credits

**Built with:**
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video download
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Prisma](https://www.prisma.io/) - Database ORM

**Inspired by:**
- OpusClip - URL import UX
- Podcastle - Multi-platform support
- Descript - Seamless workflow

---

**Version History:**
- v0.3.0 (Nov 11, 2025) - Initial release
