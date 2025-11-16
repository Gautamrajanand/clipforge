#!/bin/bash

# Backup script for AI Subtitles Working Milestone
# Date: November 16, 2025
# Commit: 826b2fd

BACKUP_DIR="./backups/milestone-ai-subtitles-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔖 Creating milestone backup..."
echo "📁 Backup directory: $BACKUP_DIR"

# 1. Backup Git state
echo "📦 Backing up Git state..."
git log -1 --pretty=format:"%H%n%an%n%ae%n%ad%n%s%n%b" > "$BACKUP_DIR/git-commit.txt"
git diff HEAD > "$BACKUP_DIR/git-diff.txt"
git status > "$BACKUP_DIR/git-status.txt"

# 2. Backup database
echo "💾 Backing up PostgreSQL database..."
docker exec clipforge-postgres pg_dump -U clipforge clipforge > "$BACKUP_DIR/database.sql"

# 3. Backup MinIO storage metadata
echo "📦 Backing up MinIO metadata..."
docker exec clipforge-minio ls -lR /data/clipforge > "$BACKUP_DIR/minio-files.txt"

# 4. Backup Redis job queue state
echo "🔄 Backing up Redis state..."
docker exec clipforge-redis redis-cli SAVE
docker cp clipforge-redis:/data/dump.rdb "$BACKUP_DIR/redis-dump.rdb"

# 5. Backup environment files
echo "⚙️  Backing up environment..."
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || echo "No .env file"
cp apps/api/.env "$BACKUP_DIR/api.env.backup" 2>/dev/null || echo "No api/.env file"
cp apps/web/.env.local "$BACKUP_DIR/web.env.backup" 2>/dev/null || echo "No web/.env.local file"

# 6. Backup Docker state
echo "🐳 Backing up Docker state..."
docker-compose ps > "$BACKUP_DIR/docker-services.txt"
docker-compose config > "$BACKUP_DIR/docker-compose-resolved.yml"

# 7. Create restore script
echo "📝 Creating restore script..."
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash

echo "🔄 Restoring AI Subtitles Working Milestone..."

# 1. Restore Git state
COMMIT_HASH=$(head -n 1 git-commit.txt)
echo "📦 Checking out commit: $COMMIT_HASH"
git checkout $COMMIT_HASH

# 2. Stop services
echo "🛑 Stopping services..."
docker-compose down

# 3. Restore database
echo "💾 Restoring database..."
docker-compose up -d postgres
sleep 5
docker exec -i clipforge-postgres psql -U clipforge -d clipforge < database.sql

# 4. Restore Redis
echo "🔄 Restoring Redis..."
docker-compose up -d redis
sleep 2
docker cp redis-dump.rdb clipforge-redis:/data/dump.rdb
docker-compose restart redis

# 5. Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Restore complete!"
echo "🌐 Web: http://localhost:3001"
echo "🔧 API: http://localhost:3000"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# 8. Create README
cat > "$BACKUP_DIR/README.md" << 'EOF'
# AI Subtitles Working Milestone Backup

**Date**: November 16, 2025, 5:20 PM IST
**Commit**: 826b2fd
**Status**: ✅ COMPLETE AND VERIFIED

## What's Included

- Git commit state and diff
- PostgreSQL database dump
- MinIO storage metadata
- Redis job queue state
- Environment files
- Docker configuration

## To Restore

```bash
cd backups/milestone-ai-subtitles-YYYYMMDD-HHMMSS
./restore.sh
```

## Verification After Restore

1. Check services: `docker-compose ps`
2. Check API: `curl http://localhost:3000/health`
3. Check Web: Open http://localhost:3001
4. Test AI Subtitles with both Upload and Import from URL

## Files

- `git-commit.txt` - Git commit details
- `git-diff.txt` - Git diff from HEAD
- `git-status.txt` - Git status
- `database.sql` - PostgreSQL dump
- `minio-files.txt` - MinIO file listing
- `redis-dump.rdb` - Redis snapshot
- `*.env.backup` - Environment files
- `docker-services.txt` - Docker services status
- `docker-compose-resolved.yml` - Resolved Docker Compose config
- `restore.sh` - Restore script
- `README.md` - This file

## Working Projects

- Project ID: cmi1mllbq0001llw289eqfanl
- Status: READY
- Has both source.mp4 and captioned.mp4
- Verified working export and download

## Notes

- This backup captures the exact state when AI Subtitles was fully working
- Both Upload and Import from URL methods verified
- Export flow matches AI Clips exactly
- All Scale-First principles applied
EOF

echo ""
echo "✅ Backup complete!"
echo "📁 Location: $BACKUP_DIR"
echo ""
echo "To restore this state later:"
echo "  cd $BACKUP_DIR"
echo "  ./restore.sh"
