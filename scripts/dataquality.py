#!/usr/bin/env python3
"""Data-quality checks for data/entries/*.yaml, on top of scripts/validate.py.

Runs fully offline (no network calls). Checks:

  DUPLICATES (fatal — exit non-zero)
    - Two entries with the same `name`, compared case-insensitively.
    - Two entries with the same normalised `website` (scheme, "www.",
      and trailing slash stripped, compared case-insensitively).

  FRESHNESS (warning — non-fatal)
    - Entries whose `last_verified` is more than 6 months old, or missing
      / unparseable. Printed oldest-first.

  SLUG SANITY (warning — non-fatal)
    - Entries whose filename doesn't match the slug you'd derive from
      their `name`, per the convention in CONTRIBUTING.md (lowercase,
      macrons dropped, everything else non-alphanumeric collapsed to a
      single hyphen).

Usage:
    python3 scripts/dataquality.py
"""

import re
import sys
import unicodedata
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"

FRESHNESS_WINDOW_DAYS = 183  # ~6 months

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

MACRON_MAP = str.maketrans("āēīōū", "aeiou")


def slugify(name):
    """Derive the expected filename slug for an entry name.

    Mirrors CONTRIBUTING.md's convention: lowercase, macrons dropped from
    the slug (kept in content), everything else non-alphanumeric collapsed
    to a single hyphen, leading/trailing hyphens stripped.
    """
    s = name.lower().translate(MACRON_MAP)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def normalise_website(url):
    """Strip scheme, "www.", and trailing slash; lowercase. Empty -> None."""
    if not url:
        return None
    u = url.strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    u = u.rstrip("/")
    return u or None


def load_entries():
    entries = []
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        try:
            with open(path, encoding="utf-8") as f:
                entry = yaml.safe_load(f)
        except yaml.YAMLError as e:
            print(f"WARN  {path.name}: could not parse YAML — {e} (skipped)")
            continue
        if not isinstance(entry, dict):
            print(f"WARN  {path.name}: not a YAML mapping (skipped)")
            continue
        entries.append((path, entry))
    return entries


def check_duplicates(entries):
    """Returns True if any genuine duplicate was found (fatal)."""
    fatal = False

    by_name = defaultdict(list)
    for path, entry in entries:
        name = entry.get("name")
        if name:
            by_name[name.strip().lower()].append((path.name, name))

    for _, occurrences in sorted(by_name.items()):
        if len(occurrences) > 1:
            fatal = True
            files = ", ".join(f"{fn} ({n!r})" for fn, n in occurrences)
            print(f"FAIL  duplicate name (case-insensitive): {files}")

    by_website = defaultdict(list)
    for path, entry in entries:
        norm = normalise_website(entry.get("website"))
        if norm:
            by_website[norm].append((path.name, entry.get("website")))

    for _, occurrences in sorted(by_website.items()):
        if len(occurrences) > 1:
            fatal = True
            files = ", ".join(f"{fn} ({w!r})" for fn, w in occurrences)
            print(f"FAIL  duplicate website (normalised): {files}")

    if not fatal:
        print("pass  no duplicate names or websites found")

    return fatal


def check_freshness(entries):
    today = date.today()
    cutoff = today - timedelta(days=FRESHNESS_WINDOW_DAYS)

    stale = []  # (last_verified or None, path.name, name)
    for path, entry in entries:
        raw = entry.get("last_verified")
        name = entry.get("name", path.stem)
        if not raw:
            stale.append((None, path.name, name))
            continue
        try:
            parsed = date.fromisoformat(str(raw))
        except ValueError:
            stale.append((None, path.name, name))
            continue
        if parsed < cutoff:
            stale.append((parsed, path.name, name))

    if not stale:
        print(f"pass  all entries verified within the last {FRESHNESS_WINDOW_DAYS} days")
        return

    # Oldest/missing first.
    stale.sort(key=lambda row: (row[0] is not None, row[0] or date.min))

    print(f"WARN  {len(stale)} entries older than {FRESHNESS_WINDOW_DAYS} days (or missing last_verified):")
    for parsed, filename, name in stale:
        when = parsed.isoformat() if parsed else "MISSING"
        print(f"      - {when}  {filename}  ({name})")


def check_slugs(entries):
    mismatches = []
    for path, entry in entries:
        name = entry.get("name")
        if not name:
            continue
        expected = slugify(name)
        actual = path.stem
        if expected and actual != expected:
            mismatches.append((path.name, name, expected))

    if not mismatches:
        print("pass  all filenames match the expected slug of their name")
        return

    print(f"WARN  {len(mismatches)} filename/slug mismatches:")
    for filename, name, expected in mismatches:
        print(f"      - {filename}  ({name!r}) — expected slug: {expected}.yaml")


def main():
    if not ENTRIES_DIR.exists():
        print(f"ERROR: {ENTRIES_DIR} does not exist")
        return 1

    entries = load_entries()
    if not entries:
        print(f"ERROR: no readable .yaml files found in {ENTRIES_DIR}")
        return 1

    print(f"Checking {len(entries)} entries in {ENTRIES_DIR}")
    print()

    print("== Duplicates (fatal) ==")
    dup_found = check_duplicates(entries)
    print()

    print("== Freshness (warning) ==")
    check_freshness(entries)
    print()

    print("== Slug sanity (warning) ==")
    check_slugs(entries)
    print()

    if dup_found:
        print("RESULT: FAIL — duplicate entries found (see above)")
        return 1

    print("RESULT: pass (warnings above, if any, are non-fatal)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
