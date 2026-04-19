#!/bin/bash
# CampusConnect - Full Docker Launch Script
# Run this once Docker Desktop engine is fully running

set -e

echo "🔧 Step 1: Killing any processes on conflicting ports..."
for port in 5001 5002 5003 5005 5173 27017; do
  pids=$(lsof -t -i:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  → Killing PID(s) on port $port: $pids"
    kill -9 $pids 2>/dev/null || true
  fi
done
echo "✅ Ports cleared."

echo ""
echo "🔧 Step 2: Stopping and removing ALL existing Docker containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
echo "✅ Containers cleaned up."

echo ""
echo "🔧 Step 3: Building and starting all services..."
docker compose up --build -d

echo ""
echo "🎉 All services are starting! Run 'docker compose logs -f' to watch logs."
echo ""
echo "Your app will be available at:"
echo "  Frontend  → http://localhost:5173"
echo "  API Gateway → http://localhost:5005"
