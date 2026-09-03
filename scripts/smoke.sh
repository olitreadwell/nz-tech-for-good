#!/usr/bin/env bash
# Boots the production server on a throwaway port and curls every route.
set -euo pipefail

PORT="${SMOKE_PORT:-3521}"
BASE="http://localhost:$PORT"

echo "building..."
npm run build >/dev/null

echo "starting server on port $PORT..."
HOSTNAME="0.0.0.0" PORT="$PORT" node .next/standalone/server.js &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -fsS "$BASE/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" != "$expected" ]; then
    echo "FAIL: $label: got $actual, want $expected"
    exit 1
  fi
  echo "ok: $label"
}

# Optional routes: only present in apps that ship them. The template ships
# /api/hello, OpenAPI/Swagger docs; older apps may not.
run_if_present() {
  local file="$1" label="$2" expected="$3" actual="$4"
  [ -f "$file" ] || { echo "skip: $label (route not present)"; return 0; }
  check "$label" "$expected" "$actual"
}

check "health status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/health")"
run_if_present src/app/api/hello/route.ts "hello status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/hello?name=Smoke")"
# Optional routes: only present in apps that ship OpenAPI/Swagger docs.
run_if_present src/app/api/openapi.json/route.ts "openapi status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/openapi.json")"
run_if_present src/app/docs/route.ts "docs status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/docs")"
check "homepage status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")"

echo "smoke: all green"
