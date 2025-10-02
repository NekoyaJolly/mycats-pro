#!/usr/bin/env bash
set -euo pipefail

PORT="3004"

if [ "${1:-}" != "" ]; then
  PORT="$1"
fi

echo "[kill-backend] Checking processes listening on :$PORT" >&2
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN || true)
else
  echo "lsof が見つかりません" >&2
  exit 1
fi

if [ -z "${PIDS}" ]; then
  echo "[kill-backend] No process is listening on :$PORT" >&2
  exit 0
fi

echo "[kill-backend] Found PIDs: $PIDS" >&2
for PID in $PIDS; do
  echo "[kill-backend] Sending SIGTERM to $PID" >&2
  kill "$PID" 2>/dev/null || true
done

sleep 1

LEFT=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN || true)
if [ -n "$LEFT" ]; then
  echo "[kill-backend] Still alive: $LEFT -> SIGKILL" >&2
  kill -9 $LEFT 2>/dev/null || true
else
  echo "[kill-backend] Successfully freed :$PORT" >&2
fi

exit 0
