#!/bin/bash

# Troubleshooting Script for MyCats Development Environment
# This script helps diagnose common issues

echo "🔧 MyCats Development Environment Troubleshooter"
echo "================================================="
echo ""

# Check Node.js version
echo "📦 Node.js Version:"
node --version
echo ""

# Check pnpm availability
echo "📦 pnpm Availability:"
if command -v pnpm &> /dev/null; then
  pnpm --version
else
  echo "❌ pnpm not found. Install with: npm install -g pnpm"
fi
echo ""

# Check PostgreSQL status
echo "🗄️  PostgreSQL Status:"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
  else
    echo "❌ PostgreSQL is not running or not accessible"
    echo "   Start with: sudo systemctl start postgresql (Linux) or brew services start postgresql (macOS)"
  fi
else
  echo "❌ PostgreSQL not found. Install PostgreSQL."
fi
echo ""

# Check for environment file
echo "⚙️  Environment Configuration:"
if [ -f "backend/.env" ]; then
  echo "✅ backend/.env found"
  # Test database connection if DATABASE_URL exists
  if grep -q "DATABASE_URL" backend/.env; then
    DATABASE_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f 2 | tr -d '"')
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
      echo "✅ Database connection successful"
    else
      echo "❌ Database connection failed"
      echo "   Check DATABASE_URL in backend/.env"
    fi
  fi
else
  echo "❌ backend/.env not found"
  echo "   Copy from backend/.env.example and configure"
fi
echo ""

# Check port availability
echo "🌐 Port Availability:"
check_port() {
  local port=$1
  if lsof -i :$port > /dev/null 2>&1; then
    echo "❌ Port $port is in use"
    echo "   Process: $(lsof -i :$port | tail -n 1 | awk '{print $2}' | xargs ps -p | tail -n 1)"
  else
    echo "✅ Port $port is available"
  fi
}

check_port 3000
check_port 3004
echo ""

# Check dependencies
echo "📦 Dependencies Status:"
if [ -d "node_modules" ]; then
  echo "✅ Root dependencies installed"
else
  echo "❌ Root dependencies missing. Run: pnpm install"
fi

if [ -d "backend/node_modules" ]; then
  echo "✅ Backend dependencies installed"
else
  echo "❌ Backend dependencies missing"
fi

if [ -d "frontend/node_modules" ]; then
  echo "✅ Frontend dependencies installed"
else
  echo "❌ Frontend dependencies missing"
fi
echo ""

# Check Prisma client
echo "🔧 Prisma Status:"
if [ -d "node_modules/.pnpm/@prisma+client"* ] 2>/dev/null; then
  echo "✅ Prisma client generated"
else
  echo "❌ Prisma client not generated. Run: pnpm run db:generate"
fi

# Check if migrations are applied
cd backend 2>/dev/null
if [ -f ".env" ]; then
  # Load env vars and check migration status
  set -a; source .env; set +a
  if npx prisma migrate status > /dev/null 2>&1; then
    echo "✅ Database migrations up to date"
  else
    echo "❌ Database migrations pending. Run: pnpm run db:migrate"
  fi
fi
cd ..
echo ""

# Quick fixes section
echo "🚀 Quick Fixes:"
echo "   1. Install all dependencies:   pnpm install"
echo "   2. Generate Prisma client:     pnpm run db:generate"
echo "   3. Run migrations:             pnpm run db:migrate"
echo "   4. Kill ports in use:          pnpm run predev"
echo "   5. Start development servers:  pnpm run dev"
echo "   6. Full setup from scratch:    pnpm run setup"
echo ""

echo "📚 Documentation:"
echo "   - docs/README.md: Documentation index"
echo "   - docs/functional-blueprint.md: UI/API/DB overview"
echo "   - docs/troubleshooting.md: Detailed troubleshooting"