#!/bin/bash

# Stop Development Servers Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🛑 Stopping MyCats Development Servers"
echo "======================================"
echo ""

# Stop backend
if [ -f backend.pid ]; then
  BACKEND_PID=$(cat backend.pid)
  echo "Stopping backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null || echo "   Backend process not found"
  rm backend.pid
else
  echo "No backend.pid found"
fi

# Stop frontend
if [ -f frontend.pid ]; then
  FRONTEND_PID=$(cat frontend.pid)
  echo "Stopping frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID 2>/dev/null || echo "   Frontend process not found"
  rm frontend.pid
else
  echo "No frontend.pid found"
fi

# Extra cleanup - kill any process on the ports
echo ""
echo "🧹 Cleaning up ports..."
pnpm run predev || true

echo ""
echo "✅ Development servers stopped"
