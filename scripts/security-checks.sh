#!/usr/bin/env bash
# Fails when secrets or env files are committed, or secret patterns appear
# in tracked files. Runs locally and in CI (workflow: security.yml).
set -euo pipefail

ROOT="${1:-$(pwd)}"
FAILED=0

cd "$ROOT"

echo "== security-checks =="

# 1. Committed .env files (allow .env.example and docs).
TRACKED_ENV=$(git ls-files | grep -E '(^|/)\.env([.-][a-zA-Z0-9_-]+)?$' || true)
TRACKED_ENV=$(printf '%s\n' "$TRACKED_ENV" | grep -v '\.env\.example$' || true)
if [[ -n "$TRACKED_ENV" ]]; then
  echo "FAIL: committed env files (secrets risk):"
  printf '%s\n' "$TRACKED_ENV"
  FAILED=1
fi

# 2. Secret patterns in tracked files. The check itself is excluded.
SECRET_PATTERN='(ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|sk_live_[A-Za-z0-9]{20,}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY)'
LEAKS=$(git ls-files -z | grep -zv 'scripts/security-checks.sh' | xargs -0 -r grep -lE "$SECRET_PATTERN" 2>/dev/null || true)
if [[ -n "$LEAKS" ]]; then
  echo "FAIL: possible secret patterns in tracked files:"
  printf '%s\n' "$LEAKS"
  FAILED=1
fi

if [[ "$FAILED" -eq 1 ]]; then
  echo "==> security-checks FAILED"
  exit 1
fi
echo "==> security-checks ok"
