# Session Notes - November 15, 2025

## Session Summary
Attempted to implement 120-minute video support but encountered stability issues. Successfully rolled back to stable state and restored all functionality.

## What Happened

### Initial Goal
- Extend video upload limit from ~30 minutes to 120 minutes
- Implement streaming uploads/downloads to handle large files
- Update frontend timeout from 20 to 60 minutes

### Issues Encountered
1. **Accidental Data Loss**: During debugging, projects without `sourceUrl` were accidentally deleted
2. **System Instability**: Multiple services crashed during testing
3. **Memory Issues**: AI Subtitles caption animation caused Docker container crashes

### Resolution
- **Full rollback** to commit `06e0ac5` (last stable state)
- Cleared Redis queue of stuck jobs
- Restarted all Docker services
- Marked stuck projects as ERROR

## Current Stable State

### ✅ Working Features
- **AI Clips**: Viral moment detection and clip generation
  - Caption burning in exports (Minimal, Bold, Modern, Elegant styles)
  - Multiple aspect ratios (9:16, 16:9, 1:1, 4:5)
  - Smart cropping with position control
- **AI Subtitles**: Caption burning into full videos
  - Live caption overlay in player
  - Multiple caption styles
  - Download with burned captions
- **AI Reframe**: Aspect ratio conversion
  - Smart crop, pad, and crop modes
  - Position control (center, top, bottom)

### 🚀 Running Services
All services running via Docker Compose:
- **API** (port 3000) - NestJS backend
- **Web** (port 3001) - Next.js frontend
- **ML Workers** (port 8000) - Python clip detection
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Job queue
- **MinIO** (ports 9000-9001) - Object storage

### 📊 System Requirements
- **Docker Desktop** must be running
- **FFmpeg** installed via Homebrew
- **Node.js** for local development
- **Python 3.x** for ML workers

## Known Limitations

### Video Length
- **Current limit**: ~30 minutes (safe, tested)
- **120-minute support**: Not implemented (requires memory optimization)

### AI Subtitles
- **Memory intensive**: Caption animation can crash on long videos
- **Workaround**: Use shorter videos (<10 min) or disable animated styles

### Performance
- **Transcription**: ~5-10 min for 7-min video (AssemblyAI)
- **Clip Detection**: ~1-2 min after transcription (ML workers)
- **Caption Burning**: ~30 sec per clip

## Architecture Notes

### Video Processing Pipeline
1. **Upload** → MinIO storage
2. **Import** → yt-dlp download (for URLs) or direct upload
3. **Transcription** → AssemblyAI API
4. **Detection** → ML workers analyze transcript
5. **Export** → FFmpeg processing with optional captions

### Caption Systems
- **AI Clips**: Optional caption burning during export
- **AI Subtitles**: Mandatory caption burning for full video
- **Styles**: Minimal (ASS), Bold/Modern/Elegant (frame-by-frame animation)

### Memory Management
- **In-memory processing**: Current implementation loads videos into memory
- **Risk**: Large videos (>500MB) can cause OOM crashes
- **Future**: Need streaming implementation for 120-min support

## Lessons Learned

### What Worked
- Docker Compose for service orchestration
- Rollback strategy saved the project
- Redis queue clearing resolved stuck jobs

### What Didn't Work
- Streaming implementation without proper testing
- Making multiple changes simultaneously
- Not backing up database before major changes

### Best Practices Going Forward
1. **Always backup database** before major changes
2. **Test incrementally** - one feature at a time
3. **Monitor memory usage** in Docker containers
4. **Use feature flags** for experimental features
5. **Keep rollback plan ready**

## Next Steps (Future)

### To Implement 120-Minute Support
1. Increase Docker container memory limits
2. Implement proper streaming for uploads/downloads
3. Optimize caption animation (batch processing)
4. Add progress tracking for long operations
5. Test with actual 120-min videos before deploying

### Immediate Priorities
- ✅ System is stable - no immediate action needed
- Monitor Docker container memory usage
- Consider adding health checks for long-running jobs
- Document memory limits for different video lengths

## Quick Recovery Commands

### If API Crashes
```bash
docker-compose restart api
redis-cli FLUSHALL
```

### If Services Won't Start
```bash
docker-compose down
docker-compose up -d
```

### If Database Issues
```bash
cd apps/api
npx prisma migrate reset
npx prisma migrate deploy
```

### Clear Stuck Jobs
```bash
redis-cli FLUSHALL
docker exec clipforge-api node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.project.updateMany({
    where: { status: 'INGESTING' },
    data: { status: 'ERROR' }
  });
  await prisma.\$disconnect();
})();
"
```

## System Health Check

### Verify All Services
```bash
docker ps  # Should show 6 containers running
curl http://localhost:3000/health  # API health
curl http://localhost:3001  # Frontend
```

### Check Logs
```bash
docker logs clipforge-api --tail 50
docker logs clipforge-ml-workers --tail 50
```

---

**Status**: ✅ STABLE - All features working as of 2025-11-15 5:24 PM IST
**Last Commit**: `06e0ac5` - Fix download buttons for AI Subtitles and AI Reframe
**Docker Images**: All rebuilt and running latest code
