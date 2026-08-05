#!/usr/bin/env python3
"""Export data/entries/*.yaml as machine-readable JSON and CSV.

Reads every YAML file in data/entries/ and writes:
  - data/exports/entries.json — the full entry list, one JSON object per
    entry, sorted by name.
  - data/exports/entries.csv — the same data flattened to columns, with
    list fields (tags, related_to, linkedin_people) joined into a single
    cell.

Every entry is written with the same fixed field order (matching
schema/entry.schema.json), regardless of key order in the source YAML, so
both outputs are byte-for-byte reproducible across runs. Safe to re-run any
time an entry is added or changed.

Usage:
    python3 scripts/export.py
"""

import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
EXPORTS_DIR = ROOT / "data" / "exports"
JSON_OUT = EXPORTS_DIR / "entries.json"
CSV_OUT = EXPORTS_DIR / "entries.csv"

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

# Fixed field order, matching schema/entry.schema.json. Used for both
# outputs so column/key order never depends on YAML key order or dict
# iteration order.
FIELDS = [
    "name",
    "domain",
    "what",
    "region",
    "website",
    "github",
    "linkedin_org",
    "linkedin_people",
    "tags",
    "related_to",
    "source",
    "founding_year",
    "takes_contributors",
    "careers_url",
    "last_verified",
]

DEFAULTS = {
    "website": "",
    "github": "",
    "linkedin_org": "",
    "linkedin_people": [],
    "tags": [],
    "related_to": [],
    "founding_year": None,
    "takes_contributors": None,
    "careers_url": "",
}


def load_entries():
    entries = []
    skipped = 0
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        with open(path, encoding="utf-8") as f:
            try:
                e = yaml.safe_load(f)
            except yaml.YAMLError:
                skipped += 1
                continue
        if not isinstance(e, dict) or not e.get("name"):
            skipped += 1
            continue
        ordered = {field: e.get(field, DEFAULTS.get(field)) for field in FIELDS}
        entries.append(ordered)
    entries.sort(key=lambda e: e["name"].lower())
    return entries, skipped


def write_json(entries):
    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False, sort_keys=False)
        f.write("\n")


def bool_or_blank(value):
    if value is None:
        return ""
    return "true" if value else "false"


def to_row(entry):
    row = dict(entry)
    row["linkedin_people"] = "; ".join(
        f"{p['name']} ({p['role']}): {p['linkedin_url']}"
        for p in entry["linkedin_people"] or []
    )
    row["tags"] = "; ".join(entry["tags"] or [])
    row["related_to"] = "; ".join(entry["related_to"] or [])
    row["founding_year"] = "" if entry["founding_year"] is None else entry["founding_year"]
    row["takes_contributors"] = bool_or_blank(entry["takes_contributors"])
    return row


def write_csv(entries):
    with open(CSV_OUT, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, lineterminator="\n")
        writer.writeheader()
        for entry in entries:
            writer.writerow(to_row(entry))


def main():
    if not ENTRIES_DIR.exists():
        print(f"ERROR: {ENTRIES_DIR} does not exist")
        return 1

    entries, skipped = load_entries()
    if not entries:
        print(f"ERROR: no valid entries found in {ENTRIES_DIR}")
        return 1

    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    write_json(entries)
    write_csv(entries)

    print("wrote", JSON_OUT)
    print("wrote", CSV_OUT)
    print("total entries", len(entries))
    print("skipped invalid files:", skipped)
    return 0


if __name__ == "__main__":
    sys.exit(main())
