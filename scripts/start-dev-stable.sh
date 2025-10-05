#!/bin/bash

# Stable Development Server Startup Script
# This script starts the development servers and keeps them running

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Starting MyCats Development Environment (Stable Mode)"
echo "========================================================"
echo ""

# Kill any existing processes on the ports
echo "🧹 Cleaning up ports..."
pnpm run predev || true
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
nohup pnpm run backend:dev > backend.out 2> backend.log &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: backend.out / backend.log"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:3004/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Backend failed to start within 30 seconds"
    echo "   Check backend.log for errors"
    exit 1
  fi
  sleep 1
  echo -n "."
done
echo ""

# Start frontend in background  
echo "🎨 Starting frontend server..."
cd frontend
nohup pnpm run dev > ../frontend.out 2> ../frontend.log &
FRONTEND_PID=$!
cd ..
echo $FRONTEND_PID > frontend.pid
echo "   Frontend PID: $FRONTEND_PID"
echo "   Logs: frontend.out / frontend.log"
echo ""

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠️  Frontend might still be starting (this is normal)"
    echo "   Check frontend.log if issues persist"
  fi
  sleep 1
  echo -n "."
done
echo ""

echo "✨ Development servers are running!"
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:3004"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:3004/api/docs"
echo "   Health:   http://localhost:3004/health"
echo ""
echo "📝 Process IDs saved to:"
echo "   backend.pid  (PID: $BACKEND_PID)"
echo "   frontend.pid (PID: $FRONTEND_PID)"
echo ""
echo "🛑 To stop servers:"
echo "   ./scripts/stop-dev.sh"
echo "   or"
echo "   kill $(cat backend.pid) $(cat frontend.pid)"
echo ""
echo "📊 To view logs:"
echo "   tail -f backend.out    # Backend stdout"
echo "   tail -f backend.log    # Backend stderr"
echo "   tail -f frontend.out   # Frontend stdout"
echo "   tail -f frontend.log   # Frontend stderr"
