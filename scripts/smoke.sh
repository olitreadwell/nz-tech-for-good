#!/usr/bin/env bash
# Builds the app and checks the static export it produces.
#
# The web app uses `output: 'export'`, so there is no server to boot. Smoke
# means the exported site has the files a deploy needs.
set -euo pipefail

OUT_DIR="${SMOKE_OUT_DIR:-apps/web/out}"

echo "building..."
npm run build >/dev/null

check_file() {
  local label="$1" path="$2"
  if [ ! -s "$path" ]; then
    echo "FAIL: $label missing or empty: $path"
    exit 1
  fi
  echo "ok: $label"
}

check_file "homepage" "$OUT_DIR/index.html"
check_file "404 page" "$OUT_DIR/404.html"
check_file "directory page" "$OUT_DIR/directory.html"
check_file "sitemap" "$OUT_DIR/sitemap.xml"
check_file "feed" "$OUT_DIR/feed.xml"

echo "smoke: all green"
