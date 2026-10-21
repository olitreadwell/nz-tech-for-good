#!/usr/bin/env python3
"""Archive every entry's website URL via the Wayback Machine.

Reads data/entries/*.yaml, asks the Wayback Machine Save Page Now endpoint
(https://web.archive.org/save/<url>) for each entry's website, and records
the result in data/archives.json as {slug: {url, archive_url, archived_at,
status}}. Failed requests are recorded with status 'error' plus a note
instead of stopping the run.

Records are merged with any existing data/archives.json, so re-running
never clobbers history for other entries. Entries whose last successful
archive is younger than --min-age-days are skipped (default 7) unless
--force is given. HTTP uses only the Python standard library (urllib),
with a short delay between requests to be polite to web.archive.org.

Usage:
    python3 scripts/archive_wayback.py
    python3 scripts/archive_wayback.py --slug access-advisors
    python3 scripts/archive_wayback.py --dry-run
    python3 scripts/archive_wayback.py --force --min-age-days 14
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
ARCHIVES_PATH = ROOT / "data" / "archives.json"

DEFAULT_MIN_AGE_DAYS = 7
REQUEST_TIMEOUT_SECONDS = 60
REQUEST_DELAY_SECONDS = 2
USER_AGENT = (
    "Mozilla/5.0 (compatible; nz-tech-for-good wayback archiver; "
    "+https://github.com/olitreadwell/nz-tech-for-good)"
)

try:
    import yaml
except ImportError:  # pragma: no cover - needs pyyaml missing to trigger
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)


def now_utc():
    """Current time as a tz-aware UTC datetime (patched in tests)."""
    return datetime.now(timezone.utc)


def load_entries():
    """Return {slug: entry} for every parseable YAML file in data/entries/."""
    entries = {}
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        with open(path, encoding="utf-8") as f:
            try:
                entry = yaml.safe_load(f)
            except yaml.YAMLError as e:
                print(f"WARNING: skipping {path.name}: {e}")
                continue
        if isinstance(entry, dict):
            entries[path.stem] = entry
    return entries


def load_archives():
    """Return the existing data/archives.json dict, or {} when absent."""
    if not ARCHIVES_PATH.exists():
        return {}
    try:
        with open(ARCHIVES_PATH, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"WARNING: {ARCHIVES_PATH} unreadable ({e}); starting fresh")
        return {}
    return data if isinstance(data, dict) else {}


def write_archives(archives):
    """Write the merged archive records, preserving unknown keys."""
    ARCHIVES_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(ARCHIVES_PATH, "w", encoding="utf-8") as f:
        json.dump(archives, f, indent=2, ensure_ascii=False, sort_keys=True)
        f.write("\n")


def is_recently_archived(record, min_age_days, now):
    """True when record is a successful archive newer than min_age_days."""
    if not isinstance(record, dict):
        return False
    if record.get("status") != "archived":
        return False
    archived_at = record.get("archived_at")
    if not archived_at:
        return False
    try:
        archived = datetime.fromisoformat(archived_at)
    except (TypeError, ValueError):
        return False
    if archived.tzinfo is None:
        archived = archived.replace(tzinfo=timezone.utc)
    return now - archived < timedelta(days=min_age_days)


def fetch_save_page(url):
    """Ask the Wayback Machine to capture url; return (archive_url, error).

    The Save Page Now endpoint answers with a redirect to the finished
    snapshot, which urllib follows by default, so response.geturl() is the
    archive URL. Returns (None, note) when the request fails so the caller
    can record it.
    """
    save_url = "https://web.archive.org/save/" + url
    request = urllib.request.Request(
        save_url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            archive_url = response.geturl()
            if "/web/" not in archive_url:
                # Rarely the endpoint answers 200 with a status page instead
                # of redirecting; fall back to the newest snapshot form.
                archive_url = "https://web.archive.org/web/2/" + url
            return archive_url, None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code} {e.reason}".strip()
    except urllib.error.URLError as e:
        return None, f"network error: {e.reason}"
    except Exception as e:  # noqa: BLE001 - record any unexpected failure
        return None, f"error: {e}"


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Archive entry websites through the Wayback Machine.",
    )
    parser.add_argument(
        "--slug",
        help="archive only this one entry (data/entries/<slug>.yaml)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print what would be archived without any network requests",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="re-archive even when the last archive is younger than --min-age-days",
    )
    parser.add_argument(
        "--min-age-days",
        type=int,
        default=DEFAULT_MIN_AGE_DAYS,
        help="skip entries archived less than N days ago (default: %(default)s)",
    )
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)

    if not ENTRIES_DIR.exists():
        print(f"ERROR: {ENTRIES_DIR} does not exist")
        return 1

    entries = load_entries()
    if args.slug:
        if args.slug not in entries:
            print(f"ERROR: no entry file data/entries/{args.slug}.yaml found")
            return 1
        entries = {args.slug: entries[args.slug]}

    archives = load_archives()
    now = now_utc()

    pending = []  # (slug, url) pairs that will be archived this run
    skipped = 0
    no_website = 0
    for slug, entry in sorted(entries.items()):
        url = (entry.get("website") or "").strip()
        if not url:
            print(f"skip {slug}: entry has no website URL")
            no_website += 1
            continue
        record = archives.get(slug)
        if not args.force and is_recently_archived(record, args.min_age_days, now):
            print(
                f"skip {slug}: last archived {record['archived_at']} "
                f"(< {args.min_age_days} days ago)"
            )
            skipped += 1
            continue
        pending.append((slug, url))

    if args.dry_run:
        for slug, url in pending:
            print(f"would archive {slug}: {url}")
        print(f"dry run: {len(pending)} of {len(entries)} entries would be archived")
        return 0

    archived = 0
    errors = 0
    for i, (slug, url) in enumerate(pending):
        if i > 0:
            time.sleep(REQUEST_DELAY_SECONDS)
        archive_url, note = fetch_save_page(url)
        if note:
            archives[slug] = {
                "url": url,
                "archived_at": now.isoformat(),
                "status": "error",
                "note": note,
            }
            errors += 1
            print(f"error {slug}: {note}")
        else:
            archives[slug] = {
                "url": url,
                "archive_url": archive_url,
                "archived_at": now.isoformat(),
                "status": "archived",
            }
            archived += 1
            print(f"archived {slug}: {archive_url}")

    write_archives(archives)
    print(f"done: archived {archived}, errors {errors}, skipped {skipped}, no website {no_website}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
