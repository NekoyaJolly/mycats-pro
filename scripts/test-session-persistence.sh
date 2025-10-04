#!/usr/bin/env bash
set -euo pipefail

API_BASE="http://localhost:3004/api/v1"
EMAIL="admin@example.com"
PASSWORD="Passw0rd!"
COOKIES="/tmp/test-session-cookies.txt"
COLOR="#10B981"
TAG_NAME="persistence-check-$$"

log() { printf "[test] %s\n" "$*"; }

warn_jq_once() {
  if [[ -z "${__WARNED_JQ:-}" ]]; then
    log "jq が見つかりません。高速/厳密な JSON パースを行うには jq のインストールを推奨します (brew install jq)。fallback 文字列マッチで継続します。";
    __WARNED_JQ=1
  fi
}

cleanup() { rm -f "$COOKIES" || true; }
trap cleanup EXIT

log "1. Login (capture refresh cookie)"
curl -s -D /tmp/login-headers.txt -c "$COOKIES" -o /tmp/login-body.json -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" || { log "Login HTTP error"; exit 1; }
STATUS_LOGIN=$(awk 'NR==1 {print $2}' /tmp/login-headers.txt || echo "")
BODY_LOGIN=$(cat /tmp/login-body.json)
if [[ "$STATUS_LOGIN" != "201" && "$STATUS_LOGIN" != "200" ]]; then
  log "Login failed status=$STATUS_LOGIN"; printf '%s\n' "$BODY_LOGIN"; exit 1; fi
if command -v jq >/dev/null 2>&1; then
  echo "$BODY_LOGIN" | jq -e '.data.access_token' >/dev/null 2>&1 || { log "No access_token in login body"; printf '%s\n' "$BODY_LOGIN"; exit 1; }
else
  warn_jq_once
  # jq が無い場合は単純パターン抽出
  printf '%s' "$BODY_LOGIN" | grep -q '"access_token"' || { log "No access_token pattern (no jq)"; printf '%s\n' "$BODY_LOGIN"; exit 1; }
fi

log "2. Backend restart (graceful)"
if pgrep -f 'node.*backend' >/dev/null; then pkill -f 'node.*backend'; sleep 1; fi
pnpm run backend:dev > /tmp/backend-restart.log 2>&1 &
# wait for ready
for _ in {1..20}; do
  if curl -sf http://localhost:3004/health >/dev/null; then break; fi; sleep 0.4; done
if ! curl -sf http://localhost:3004/health >/dev/null; then
  log "Backend did not come up"; tail -n 80 /tmp/backend-restart.log; exit 1; fi

log "3. Refresh using only cookie"
REFRESH_BODY=$(curl -s -b "$COOKIES" -c "$COOKIES" -X POST "$API_BASE/auth/refresh" -H 'Content-Type: application/json' -d '{}') || { log "Refresh request failed"; exit 1; }
if command -v jq >/null 2>&1; then
  if ! printf '%s' "$REFRESH_BODY" | jq -e '.data.access_token' >/dev/null 2>&1; then
    log "Refresh missing access_token"; printf '%s\n' "$REFRESH_BODY"; exit 1; fi
  ACCESS_TOKEN=$(printf '%s' "$REFRESH_BODY" | jq -r '.data.access_token')
else
  warn_jq_once
  echo "$REFRESH_BODY" | grep -q '"access_token"' || { log "Refresh missing access_token (no jq)"; printf '%s\n' "$REFRESH_BODY"; exit 1; }
  ACCESS_TOKEN=$(printf '%s' "$REFRESH_BODY" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
fi

log "4. Call protected endpoint (create tag)"
CREATE_BODY=$(curl -s -X POST "$API_BASE/tags" -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"name\":\"$TAG_NAME\",\"color\":\"$COLOR\"}") || { log "Create tag request failed"; exit 1; }
if command -v jq >/dev/null 2>&1; then
  if ! printf '%s' "$CREATE_BODY" | jq -e '.success==true' >/dev/null 2>&1; then
    log "Create tag failed"; printf '%s\n' "$CREATE_BODY"; exit 1; fi
  TAG_ID=$(printf '%s' "$CREATE_BODY" | jq -r '.data.id')
else
  warn_jq_once
  echo "$CREATE_BODY" | grep -q '"success":true' || { log "Create tag failed(no jq)"; printf '%s\n' "$CREATE_BODY"; exit 1; }
  TAG_ID=$(printf '%s' "$CREATE_BODY" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)
fi

log "5. List tags and assert presence"
LIST_BODY=$(curl -s "$API_BASE/tags") || { log "List tags failed"; exit 1; }
if command -v jq >/dev/null 2>&1; then
  if ! printf '%s' "$LIST_BODY" | jq -e --arg id "$TAG_ID" '.data[] | select(.id==$id)' >/dev/null 2>&1; then
    log "Tag $TAG_ID not found in listing"; printf '%s\n' "$LIST_BODY"; exit 1; fi
else
  warn_jq_once
  echo "$LIST_BODY" | grep -q "$TAG_ID" || { log "Tag $TAG_ID not found in listing (no jq)"; printf '%s\n' "$LIST_BODY"; exit 1; }
fi

log "✅ Session persistence test passed (tag id=$TAG_ID)"

# Optional: cleanup created tag (uncomment if necessary)
# curl -s -X DELETE "$API_BASE/tags/$TAG_ID" -H "Authorization: Bearer $ACCESS_TOKEN" >/dev/null 2>&1 || true
