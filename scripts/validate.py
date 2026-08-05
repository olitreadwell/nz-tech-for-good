#!/usr/bin/env python3
"""Validate every entry in data/entries/*.yaml against schema/entry.schema.json.

Also flags duplicate entry names and duplicate filenames (slugs). Exits
non-zero if any entry fails validation or a duplicate is found.

Usage:
    python3 scripts/validate.py
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
SCHEMA_PATH = ROOT / "schema" / "entry.schema.json"

try:
    import yaml
except ImportError:  # pragma: no cover - needs pyyaml missing to trigger
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml jsonschema")
    sys.exit(1)

try:
    import jsonschema
except ImportError:  # pragma: no cover - needs jsonschema missing to trigger
    print(
        "WARNING: jsonschema is not installed — falling back to a basic "
        "required-fields check only. Run: pip install jsonschema for full "
        "schema validation."
    )
    jsonschema = None


def load_schema():
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def basic_check(entry, schema):
    """Minimal fallback validator used when jsonschema isn't installed."""
    errors = []
    for field in schema.get("required", []):
        if field not in entry or entry[field] in (None, ""):
            errors.append(f"missing required field '{field}'")
    allowed = set(schema.get("properties", {}).keys())
    if schema.get("additionalProperties") is False:
        for key in entry.keys():
            if key not in allowed:
                errors.append(f"unexpected field '{key}' not in schema")
    return errors


def normalise_website_key(url):
    """Strip whitespace and a trailing slash, for duplicate-website matching.

    Deliberately lighter-touch than dataquality.py's normalise_website():
    this only catches exact duplicates (same scheme, same "www."), leaving
    near-duplicates to the data-quality pass.
    """
    return str(url or "").strip().rstrip("/")


def entry_errors(entry, schema, validator):
    """Return a list of human-readable schema error messages for one entry."""
    if validator is not None:
        errors = sorted(validator.iter_errors(entry), key=lambda e: e.path)
        return [f"{'/'.join(str(p) for p in e.path) or '<root>'}: {e.message}" for e in errors]
    return basic_check(entry, schema)


def find_duplicates(seen):
    """Given {key: [occurrence, ...]}, return the entries with more than one
    occurrence, in insertion order."""
    return {key: paths for key, paths in seen.items() if len(paths) > 1}


def main():
    if not ENTRIES_DIR.exists():
        print(f"ERROR: {ENTRIES_DIR} does not exist")
        return 1

    schema = load_schema()
    files = sorted(ENTRIES_DIR.glob("*.yaml"))

    if not files:
        print(f"ERROR: no .yaml files found in {ENTRIES_DIR}")
        return 1

    validator = None
    if jsonschema is not None:
        validator = jsonschema.Draft202012Validator(schema)

    names_seen = defaultdict(list)
    slugs_seen = defaultdict(list)
    websites_seen = defaultdict(list)

    total_pass = 0
    total_fail = 0

    for path in files:
        slug = path.stem
        slugs_seen[slug].append(path.name)

        try:
            with open(path, encoding="utf-8") as f:
                entry = yaml.safe_load(f)
        except yaml.YAMLError as e:
            print(f"FAIL  {path.name}: invalid YAML — {e}")
            total_fail += 1
            continue

        if not isinstance(entry, dict):
            print(f"FAIL  {path.name}: file does not contain a YAML mapping")
            total_fail += 1
            continue

        if entry.get("name"):
            names_seen[entry["name"]].append(path.name)

        raw_url = normalise_website_key(entry.get("website"))
        if raw_url:
            websites_seen[raw_url].append(path.name)

        error_msgs = entry_errors(entry, schema, validator)

        if error_msgs:
            print(f"FAIL  {path.name}")
            for msg in error_msgs:
                print(f"      - {msg}")
            total_fail += 1
        else:
            print(f"pass  {path.name}")
            total_pass += 1

    dup_found = False
    for name, paths in find_duplicates(names_seen).items():
        dup_found = True
        print(f"FAIL  duplicate name '{name}' used in: {', '.join(paths)}")

    # A slug is a path.stem drawn from files that all matched glob("*.yaml"),
    # so two distinct filenames can never produce the same stem — this branch
    # is unreachable in practice and kept only as a defensive guard.
    for slug, paths in find_duplicates(slugs_seen).items():  # pragma: no cover
        dup_found = True
        print(f"FAIL  duplicate slug '{slug}' used in: {', '.join(paths)}")

    for url, paths in find_duplicates(websites_seen).items():
        dup_found = True
        print(f"FAIL  duplicate website URL '{url}' used in: {', '.join(paths)}")

    print()
    print(f"{total_pass} passed, {total_fail} failed, {len(files)} total entries")

    if total_fail > 0 or dup_found:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
