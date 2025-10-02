#!/usr/bin/env bash
set -euo pipefail

WAIT=false
for arg in "$@"; do
  case "$arg" in
    --wait) WAIT=true ;;
  esac
done

echo "[preflight] Backend preflight checks starting..."

PORT=${PORT:-3004}
DB_URL=${DATABASE_URL:-}

if [ ! -f backend/.env ]; then
  echo "[preflight] WARNING: backend/.env がありません。テンプレート (backend/.env.example) から作成してください" >&2
fi

# 既存プロセスの残骸待機 (watch 再起動直後など)
ATTEMPTS=0
MAX_ATTEMPTS=10
SLEEP=0.3
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  if [ "$WAIT" = false ]; then
    echo "[preflight] ERROR: Port $PORT is already in use (use --wait to待機)" >&2
    exit 2
  fi
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "[preflight] ERROR: Port $PORT is still busy after $MAX_ATTEMPTS attempts" >&2
    exit 2
  fi
  echo "[preflight] Port $PORT busy -> waiting ($ATTEMPTS/$MAX_ATTEMPTS)" >&2
  sleep $SLEEP
done
echo "[preflight] Port $PORT is free"

if [ -z "$DB_URL" ]; then
  if grep -q '^DATABASE_URL=' backend/.env 2>/dev/null; then
    echo "[preflight] DATABASE_URL detected in backend/.env"
  else
    echo "[preflight] WARNING: DATABASE_URL が未設定" >&2
  fi
else
  echo "[preflight] DATABASE_URL provided via environment"
fi

echo "[preflight] Running prisma generate (idempotent)" 
pnpm --filter backend run prisma:generate >/dev/null 2>&1 || echo "[preflight] prisma generate skipped/error"

echo "[preflight] OK"