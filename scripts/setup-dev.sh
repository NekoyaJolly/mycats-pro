#!/bin/bash

# Development Environment Setup Script
# This script automates the development environment setup

set -e  # Exit on any error

echo "🚀 Starting development environment setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2)
REQUIRED_NODE_MAJOR="20"
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "❌ Error: Node.js $REQUIRED_NODE_MAJOR+ required, but found $NODE_VERSION"
  exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "❌ Error: PostgreSQL is not running. Please start PostgreSQL:"
  echo "   - Linux: sudo systemctl start postgresql"
  echo "   - macOS: brew services start postgresql"
  exit 1
fi

echo "✅ PostgreSQL is running"

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
  echo "⚙️ Creating backend/.env file..."
  cat > backend/.env << EOF
# Development Environment Configuration
DATABASE_URL="postgresql://runner:password@localhost:5432/mycats_development"
JWT_SECRET="development-jwt-secret-at-least-32-characters-long-for-security"
JWT_EXPIRES_IN="1h"
NODE_ENV="development"
PORT=3004
CORS_ORIGIN="http://localhost:3000"
BCRYPT_ROUNDS=10
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
LOG_LEVEL=debug
HEALTH_CHECK_DATABASE=true
HEALTH_CHECK_MEMORY_THRESHOLD=0.9
SESSION_SECRET="development-session-secret-here"
# Prisma settings for development
PRISMA_CLIENT_ENGINE_TYPE="library"
EOF
  echo "✅ Created backend/.env file"
else
  echo "✅ backend/.env file already exists"
fi

# Test database connection
echo "🔌 Testing database connection..."
if ! psql $(<backend/.env grep DATABASE_URL | cut -d '=' -f 2 | tr -d '"') -c "SELECT 1;" > /dev/null 2>&1; then
  echo "❌ Error: Cannot connect to database. Please check:"
  echo "   1. PostgreSQL is running"
  echo "   2. Database 'mycats_development' exists"
  echo "   3. User credentials are correct"
  echo ""
  echo "To create the database and user, run:"
  echo "   sudo -u postgres createuser --createdb --password runner"
  echo "   sudo -u postgres createdb --owner=runner mycats_development"
  exit 1
fi

echo "✅ Database connection successful"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm run db:generate

# Run migrations
echo "🏗️ Running database migrations..."
pnpm run db:migrate

# Test builds
echo "🏗️ Testing builds..."
pnpm run backend:build
pnpm run frontend:build

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Quick start commands:"
echo "   pnpm run dev          # Start development servers"
echo "   pnpm run db:studio    # Open Prisma Studio"
echo "   pnpm run test:health  # Test API health"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3004"
echo "   API Docs: http://localhost:3004/api/docs"
echo "   Health:   http://localhost:3004/health"