#!/bin/bash

# Production Build and Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🏗️  Starting production build process..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies with frozen lockfile..."
pnpm install --frozen-lockfile

# Run security audit
echo "🔒 Running security audit..."
pnpm audit --audit-level moderate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm -w run db:generate

# Lint code
echo "🧹 Linting code..."
pnpm run lint:backend
pnpm run lint:frontend

# Type checking
echo "🔍 Type checking..."
pnpm --filter backend run type-check
pnpm --filter frontend run type-check

# Build backend
echo "🏗️  Building backend..."
pnpm run backend:build

# Build frontend
echo "🏗️  Building frontend..."
pnpm run frontend:build

# Run tests (optional, uncomment if tests exist)
# echo "🧪 Running tests..."
# pnpm run test:e2e

echo "✅ Production build completed successfully!"
echo ""
echo "📋 Deployment checklist:"
echo "  1. Set production environment variables"
echo "  2. Run database migrations: pnpm -w run db:deploy"
echo "  3. Start application: pnpm run frontend:start"
echo "  4. Verify health check: curl http://localhost:3004/health"
echo ""
echo "🚀 Ready for deployment!"