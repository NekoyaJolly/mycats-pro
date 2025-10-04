#!/usr/bin/env bash
# Local isolated PostgreSQL cluster manager for development
# Creates a private cluster under .dev/postgres using port 55432 (not to clash with system 5432)
# Usage: scripts/local-postgres.sh [start|stop|status|psql]
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${BASE_DIR}/.dev/postgres/data"
LOG_FILE="${BASE_DIR}/.dev/postgres/postgres.log"
PORT=55432
ROLE=runner
PASSWORD=password
DB=mycats_development

cyan() { printf "\033[36m%s\033[0m\n" "$*"; }
err() { printf "\033[31m%s\033[0m\n" "$*" 1>&2; }

ensure_tools() {
  for c in initdb pg_ctl psql createdb createuser; do
    command -v "$c" >/dev/null 2>&1 || { err "Required command '$c' not found. On macOS: brew install postgresql@15 (and add its bin to PATH)."; exit 1; }
  done
}

init_cluster() {
  if [ ! -d "$DATA_DIR" ]; then
    cyan "Initializing cluster in $DATA_DIR"
    mkdir -p "$(dirname "$DATA_DIR")"
    initdb -D "$DATA_DIR" >/dev/null
    # postgresql.conf tweak: custom port
    echo "port = ${PORT}" >> "$DATA_DIR/postgresql.conf"
  fi
}

start() {
  ensure_tools
  init_cluster
  if pg_isready -h localhost -p ${PORT} >/dev/null 2>&1; then
    cyan "PostgreSQL already running on port ${PORT}"; return 0; fi
  cyan "Starting PostgreSQL (port ${PORT})"
  pg_ctl -D "$DATA_DIR" -l "$LOG_FILE" start
  # Wait until ready
  for i in {1..20}; do
    if pg_isready -h localhost -p ${PORT} >/dev/null 2>&1; then break; fi
    sleep 0.3
  done
  if ! pg_isready -h localhost -p ${PORT} >/dev/null 2>&1; then
    err "Failed to start PostgreSQL (see $LOG_FILE)"; exit 1; fi
  cyan "PostgreSQL started (log: $LOG_FILE)"
  bootstrap
}

bootstrap() {
  # Fresh cluster: trust auth allows connecting without specifying -U.
  # Create role if missing
  if ! psql -h localhost -p ${PORT} -d template1 -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROLE}'" | grep -q 1; then
    cyan "Creating role ${ROLE}"
    psql -h localhost -p ${PORT} -d template1 -c "CREATE ROLE ${ROLE} WITH LOGIN PASSWORD '${PASSWORD}' CREATEDB;" >/dev/null
  fi
  # Create database if missing
  if ! psql -h localhost -p ${PORT} -d template1 -tAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1; then
    cyan "Creating database ${DB} (owner ${ROLE})"
    psql -h localhost -p ${PORT} -d template1 -c "CREATE DATABASE ${DB} OWNER ${ROLE};" >/dev/null
  fi
  cyan "Bootstrap complete. Connection URL: postgresql://${ROLE}:${PASSWORD}@localhost:${PORT}/${DB}"
}

stop_cluster() {
  if [ -d "$DATA_DIR" ]; then
    if pg_isready -h localhost -p ${PORT} >/dev/null 2>&1; then
      cyan "Stopping PostgreSQL (port ${PORT})"
      pg_ctl -D "$DATA_DIR" stop -m fast || true
    else
      cyan "Cluster not running."
    fi
  else
    cyan "No cluster directory ($DATA_DIR)"
  fi
}

status() {
  if pg_isready -h localhost -p ${PORT} >/dev/null 2>&1; then
    cyan "RUNNING on port ${PORT}"; else cyan "STOPPED (expected port ${PORT})"; fi
}

psql_shell() {
  psql "postgresql://${ROLE}:${PASSWORD}@localhost:${PORT}/${DB}" "$@"
}

case "${1:-}" in
  start) start ;;
  stop) stop_cluster ;;
  status) status ;;
  psql) shift; psql_shell "$@" ;;
  *) echo "Usage: $0 {start|stop|status|psql}"; exit 1 ;;
 esac
