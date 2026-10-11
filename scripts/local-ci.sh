#!/usr/bin/env bash
# Local mirror of the GitHub Actions gate.
#
# The local run is the gate that decides a merge. The private repos in this
# family cannot run Actions while the account has a billing block, and the
# public repos queue their runs behind pushes, so the checks have to be
# runnable here. Run this before you merge or push.
#
# Usage:
#   bash scripts/local-ci.sh               full app gate plus local tool checks
#   bash scripts/local-ci.sh --fast         the pre-push subset only
#   bash scripts/local-ci.sh --docker       also build the container image
#   bash scripts/local-ci.sh --lighthouse   also run the Lighthouse budgets
#
# Optional tools (codespell, yamllint, actionlint, docker) are reported as
# skipped when they are not installed. Everything else must pass. The
# dependency audit is advisory, matching the CI job.
set -uo pipefail

MODE="full"
WITH_DOCKER=0
WITH_LIGHTHOUSE=0

for arg in "$@"; do
  case "$arg" in
    --fast) MODE="fast" ;;
    --docker) WITH_DOCKER=1 ;;
    --lighthouse) WITH_LIGHTHOUSE=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

FAILED=0
SKIPPED=()
ADVISORY=()

if [ -f pnpm-lock.yaml ]; then PKG="pnpm"; else PKG="npm"; fi

has_script() {
  node -e "const s=require('./package.json').scripts||{};process.exit(s['$1']?0:1)" 2>/dev/null
}

run() {
  echo
  echo "== $*"
  if ! "$@"; then
    FAILED=1
    echo "FAILED: $*"
  fi
}

advisory() {
  echo
  echo "== $* (advisory)"
  if ! "$@"; then
    ADVISORY+=("$*")
    echo "advisory finding: $*"
  fi
}

need() {
  local tool="$1"; shift
  echo
  echo "== $tool"
  if command -v "$tool" >/dev/null 2>&1; then
    if ! "$@"; then
      FAILED=1
      echo "FAILED: $tool"
    fi
  else
    SKIPPED+=("$tool")
    echo "SKIPPED: $tool is not installed"
  fi
}

if [ "$MODE" = "fast" ] && has_script check:fast; then
  run "$PKG" run check:fast
else
  run "$PKG" run check
fi

run bash scripts/security-checks.sh

if [ -f pnpm-lock.yaml ]; then
  advisory pnpm audit --audit-level=high
else
  advisory npm audit --audit-level=high
fi

need codespell codespell
need yamllint yamllint -c .yamllint.yml .github/ .yamllint.yml
need actionlint actionlint

if [ "$WITH_DOCKER" = "1" ]; then
  need docker docker build -t local-ci-check .
fi

if [ "$WITH_LIGHTHOUSE" = "1" ]; then
  run "$PKG" dlx @lhci/cli@0.15.0 autorun
fi

echo
if [ "${#SKIPPED[@]}" -gt 0 ]; then
  echo "skipped (not installed): ${SKIPPED[*]}"
fi
if [ "${#ADVISORY[@]}" -gt 0 ]; then
  echo "advisory findings: ${ADVISORY[*]}"
fi
if [ "$FAILED" = "0" ]; then
  echo "LOCAL GATE PASSED"
else
  echo "LOCAL GATE FAILED"
  exit 1
fi
