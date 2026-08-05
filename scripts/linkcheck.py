#!/usr/bin/env python3
"""Check website/github/linkedin_org URLs across all entries for dead links.

Prefers `lychee` (https://github.com/lycheeverse/lychee) if it's on PATH,
since it handles redirects, concurrency, and rate limits well. Falls back
to a plain urllib HEAD/GET check if lychee isn't installed.

Reports genuinely dead links (404, DNS failure, connection refused)
separately from bot-blocked links (403, 999 — LinkedIn does this a lot).
Only exits non-zero for genuine deaths, since bot-blocks are expected
and not actionable.

Usage:
    python3 scripts/linkcheck.py
"""

import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

URL_FIELDS = ["website", "github", "linkedin_org"]

BOT_BLOCK_CODES = {403, 999}


def collect_urls():
    urls = {}  # url -> list of (entry name, field)
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        with open(path, encoding="utf-8") as f:
            entry = yaml.safe_load(f)
        if not isinstance(entry, dict):
            continue
        name = entry.get("name", path.stem)
        for field in URL_FIELDS:
            url = entry.get(field)
            if url:
                urls.setdefault(url, []).append((name, field))
    return urls


def run_lychee(urls):
    """Run lychee against a temp file of URLs, parse its output for status."""
    import tempfile

    dead = []
    bot_blocked = []

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("\n".join(urls.keys()))
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["lychee", "--format", "json", "--no-progress", tmp_path],
            capture_output=True,
            text=True,
            timeout=300,
        )
        import json

        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            print("WARNING: could not parse lychee JSON output; raw output:")
            print(result.stdout[:2000])
            print(result.stderr[:2000])
            return None, None

        # lychee's JSON report keys error_map by the *input source*
        # (our temp file path here), with a list of per-URL failures under
        # it — not by URL directly. Flatten across all sources to be safe
        # regardless of how lychee was invoked.
        for items in data.get("error_map", {}).values():
            for item in items:
                url = item.get("url")
                status = item.get("status", {})
                code = status.get("code")
                if code in BOT_BLOCK_CODES:
                    bot_blocked.append((url, code))
                else:
                    dead.append((url, code or status.get("text", "unknown")))
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    return dead, bot_blocked


def fallback_check(urls):
    """Plain urllib check, used if lychee isn't installed."""
    dead = []
    bot_blocked = []

    for url in urls:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        try:
            urllib.request.urlopen(req, timeout=10)
        except urllib.error.HTTPError as e:
            if e.code in BOT_BLOCK_CODES:
                bot_blocked.append((url, e.code))
            elif e.code == 404:
                dead.append((url, e.code))
            else:
                # Other 4xx/5xx: treat as informational, not a hard failure,
                # since many sites reject HEAD requests but serve GET fine.
                bot_blocked.append((url, e.code))
        except urllib.error.URLError as e:
            dead.append((url, f"DNS/connection error: {e.reason}"))
        except Exception as e:  # noqa: BLE001 - best-effort fallback checker
            dead.append((url, f"error: {e}"))

    return dead, bot_blocked


def find_refs(url, urls):
    """Look up which entries a (possibly slash-normalized) URL came from.

    lychee sometimes reports a URL with a trailing slash added even when
    the source YAML didn't have one, so try an exact match first and fall
    back to a trailing-slash-insensitive match before giving up.
    """
    if url in urls:
        return urls[url]
    stripped = url.rstrip("/")
    for stored_url, refs in urls.items():
        if stored_url.rstrip("/") == stripped:
            return refs
    return []


def main():
    urls = collect_urls()
    print(f"Checking {len(urls)} unique URLs across {sum(len(v) for v in urls.values())} references...")

    if shutil.which("lychee"):
        print("Using lychee for link checking.")
        dead, bot_blocked = run_lychee(urls)
        if dead is None:
            print("lychee run failed to produce parseable output; falling back to urllib.")
            dead, bot_blocked = fallback_check(urls)
    else:
        print("lychee not found on PATH; using a basic urllib fallback.")
        dead, bot_blocked = fallback_check(urls)

    print()
    if bot_blocked:
        print(f"Bot-blocked or non-404 responses ({len(bot_blocked)}) — not treated as failures:")
        for url, code in bot_blocked:
            refs = ", ".join(f"{n} ({f})" for n, f in find_refs(url, urls))
            print(f"  [{code}] {url}  <- {refs}")
        print()

    if dead:
        print(f"DEAD LINKS ({len(dead)}):")
        for url, code in dead:
            refs = ", ".join(f"{n} ({f})" for n, f in find_refs(url, urls))
            print(f"  [{code}] {url}  <- {refs}")
        print()
        print(f"FAIL: {len(dead)} dead link(s) found.")
        return 1

    print("No genuinely dead links found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
