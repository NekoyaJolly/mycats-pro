#!/usr/bin/env bash
# Quick start script for strategy A (use existing PostgreSQL on port 5432)
# Idempotent: safe to re-run. Only creates role/DB if missing.
set -euo pipefail

print() { printf "\033[36m[quick-start]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[error]\033[0m %s\n" "$*" 1>&2; }

REQUIRED_PORT=5432
ROLE=runner
PASSWORD=password
DB=mycats_development
ENV_FILE=backend/.env

print "Checking pg_isready on port ${REQUIRED_PORT}..."
if ! command -v pg_isready >/dev/null 2>&1; then
  err "pg_isready command not found. Ensure PostgreSQL client tools are installed (brew install libpq && echo 'export PATH=\"/opt/homebrew/opt/libpq/bin:$PATH\"' >> ~/.zshrc)."; exit 1; fi

if ! pg_isready -h localhost -p ${REQUIRED_PORT} >/dev/null 2>&1; then
  err "PostgreSQL not accepting connections on port ${REQUIRED_PORT}. Start it: 'brew services start postgresql@15' (or adjust port)."; exit 1; fi
print "PostgreSQL is reachable."

print "Ensuring role '${ROLE}' exists..."
if ! psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROLE}'" | grep -q 1; then
  psql -U postgres -c "CREATE ROLE ${ROLE} WITH LOGIN PASSWORD '${PASSWORD}' CREATEDB;"
  print "Role created."
else
  print "Role already present."
fi

print "Ensuring database '${DB}' exists owned by '${ROLE}'..."
if ! psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1; then
  createdb -U postgres -O ${ROLE} ${DB}
  print "Database created."
else
  OWNER=$(psql -U postgres -tAc "SELECT pg_catalog.pg_get_userbyid(datdba) FROM pg_database WHERE datname='${DB}'")
  if [ "${OWNER}" != " ${ROLE}" ] && [ "${OWNER}" != "${ROLE}" ]; then
    print "Database exists with owner '${OWNER}'. (Leave as-is unless you need ownership change)"
  else
    print "Database already present."
  fi
fi

print "Creating '${ENV_FILE}' if missing..."
if [ ! -f "${ENV_FILE}" ]; then
  cat > "${ENV_FILE}" <<EOF
DATABASE_URL="postgresql://${ROLE}:${PASSWORD}@localhost:${REQUIRED_PORT}/${DB}"
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
PRISMA_CLIENT_ENGINE_TYPE="library"
EOF
  print "Created ${ENV_FILE}"
else
  print "${ENV_FILE} already exists (left untouched)."
fi

print "Installing dependencies (pnpm)..."
if ! command -v pnpm >/dev/null 2>&1; then
  err "pnpm not found. Install: 'npm install -g pnpm'"; exit 1; fi
pnpm install

print "Generating Prisma client..."
pnpm run db:generate

print "Applying migrations..."
pnpm run db:migrate

print "(Optional) Seeding database if script exists..."
if pnpm run | grep -q "db:seed"; then
  pnpm run db:seed || print "Seed step failed/skipped (continuing)."
else
  print "No db:seed script defined. Skipping."
fi

print "Starting dev servers (backend + frontend)..."
print "Use Ctrl+C to stop."
exec pnpm run dev
