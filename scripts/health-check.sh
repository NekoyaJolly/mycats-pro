#!/bin/bash

# Health Check Script for Development Servers

echo "🏥 MyCats Development Servers Health Check"
echo "=========================================="
echo ""

check_service() {
  local name=$1
  local url=$2
  local pid_file=$3
  
  echo "Checking $name..."
  
  # Check if PID file exists
  if [ -f "$pid_file" ]; then
    PID=$(cat "$pid_file")
    if ps -p $PID > /dev/null 2>&1; then
      echo "  ✅ Process running (PID: $PID)"
    else
      echo "  ❌ PID file exists but process not running"
      return 1
    fi
  else
    echo "  ⚠️  No PID file found"
  fi
  
  # Check if service responds
  if curl -s "$url" > /dev/null 2>&1; then
    echo "  ✅ Service responding at $url"
    return 0
  else
    echo "  ❌ Service not responding at $url"
    return 1
  fi
}

cd "$(dirname "$0")/.."

echo "Backend Server:"
check_service "Backend" "http://localhost:3004/health" "backend.pid"
BACKEND_STATUS=$?

echo ""
echo "Frontend Server:"
check_service "Frontend" "http://localhost:3000" "frontend.pid"
FRONTEND_STATUS=$?

echo ""
echo "=========================================="
if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
  echo "✅ All services are healthy"
  exit 0
else
  echo "❌ Some services are not healthy"
  echo ""
  echo "To restart servers:"
  echo "  ./scripts/stop-dev.sh"
  echo "  ./scripts/start-dev-stable.sh"
  exit 1
fi
