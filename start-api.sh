#!/bin/bash

# Kill any existing API processes
echo "🔪 Killing existing API processes..."
pkill -9 -f "nest" 2>/dev/null
pkill -9 -f "node.*api" 2>/dev/null
pkill -9 -f "npm.*api" 2>/dev/null

# Wait for port to be free
sleep 3

# Check if port 3000 is free
if lsof -i :3000 > /dev/null 2>&1; then
  echo "❌ Port 3000 is still in use!"
  exit 1
fi

echo "✅ Port 3000 is free"

# Start API
echo "🚀 Starting API..."
cd apps/api && npm run start:dev
