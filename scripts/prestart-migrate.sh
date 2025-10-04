#!/usr/bin/env bash
set -euo pipefail

echo "[prestart] Running prisma migrate deploy..." >&2
pnpm --filter backend prisma:deploy
echo "[prestart] Migration deploy completed." >&2
