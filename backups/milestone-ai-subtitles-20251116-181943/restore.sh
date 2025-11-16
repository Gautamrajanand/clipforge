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
