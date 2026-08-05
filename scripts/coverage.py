#!/usr/bin/env python3
"""Coverage report for data/entries/*.yaml: counts per domain and region.

Runs fully offline (no network calls). Reports, in order:

  TOTAL
    - How many entries were read.

  ENTRIES PER DOMAIN
    - A count for every valid `domain` enum value from
      schema/entry.schema.json, sorted most entries first.

  ENTRIES PER REGION
    - A count for every distinct `region` value seen in the data, sorted
      most entries first (region is a free string in the schema, not an
      enum, so only regions actually present are listed).

  THIN DOMAINS (< 3 entries)
    - Every valid domain with fewer than THIN_THRESHOLD entries, including
      domains with zero entries. Flags where more coverage is needed.

This is a report, not a gate: it always exits 0, matching the non-fatal
freshness and slug checks in dataquality.py.

Usage:
    python3 scripts/coverage.py
"""

import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
SCHEMA_PATH = ROOT / "schema" / "entry.schema.json"

THIN_THRESHOLD = 3

try:
    import yaml
except ImportError:  # pragma: no cover - needs pyyaml missing to trigger
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)


def load_valid_domains():
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        schema = json.load(f)
    return list(schema["properties"]["domain"]["enum"])


def load_entries():
    entries = []
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        try:
            with open(path, encoding="utf-8") as f:
                entry = yaml.safe_load(f)
        except yaml.YAMLError as e:
            print(f"WARN  {path.name}: could not parse YAML ({e}), skipped")
            continue
        if not isinstance(entry, dict):
            print(f"WARN  {path.name}: not a YAML mapping, skipped")
            continue
        entries.append(entry)
    return entries


def print_counts(title, counts):
    print(f"== {title} ==")
    if not counts:
        print("(none)")
        print()
        return
    width = max(len(name) for name in counts)
    for name, n in counts.most_common():
        noun = "entry" if n == 1 else "entries"
        print(f"  {name.ljust(width)}  {n} {noun}")
    print()


def print_thin_domains(domain_counts, valid_domains):
    thin = [(d, domain_counts.get(d, 0)) for d in valid_domains if domain_counts.get(d, 0) < THIN_THRESHOLD]
    thin.sort(key=lambda row: (row[1], row[0]))

    print(f"== Thin domains (< {THIN_THRESHOLD} entries) ==")
    if not thin:
        print(f"(none, every domain has at least {THIN_THRESHOLD} entries)")
        print()
        return
    for domain, n in thin:
        noun = "entry" if n == 1 else "entries"
        print(f"  {domain}: {n} {noun}")
    print()


def main():
    if not ENTRIES_DIR.exists():
        print(f"ERROR: {ENTRIES_DIR} does not exist")
        return 0

    valid_domains = load_valid_domains()
    entries = load_entries()

    print(f"Coverage report: {len(entries)} entries in {ENTRIES_DIR}")
    print()

    domain_counts = Counter(e.get("domain") for e in entries if e.get("domain"))
    region_counts = Counter(e.get("region") for e in entries if e.get("region"))

    print_counts("Entries per domain", domain_counts)
    print_counts("Entries per region", region_counts)
    print_thin_domains(domain_counts, valid_domains)

    return 0


if __name__ == "__main__":
    sys.exit(main())
