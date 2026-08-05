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
except ImportError:
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml jsonschema")
    sys.exit(1)

try:
    import jsonschema
except ImportError:
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

        if validator is not None:
            errors = sorted(validator.iter_errors(entry), key=lambda e: e.path)
            error_msgs = [f"{'/'.join(str(p) for p in e.path) or '<root>'}: {e.message}" for e in errors]
        else:
            error_msgs = basic_check(entry, schema)

        if error_msgs:
            print(f"FAIL  {path.name}")
            for msg in error_msgs:
                print(f"      - {msg}")
            total_fail += 1
        else:
            print(f"pass  {path.name}")
            total_pass += 1

    dup_found = False
    for name, paths in names_seen.items():
        if len(paths) > 1:
            dup_found = True
            print(f"FAIL  duplicate name '{name}' used in: {', '.join(paths)}")

    for slug, paths in slugs_seen.items():
        if len(paths) > 1:
            dup_found = True
            print(f"FAIL  duplicate slug '{slug}' used in: {', '.join(paths)}")

    print()
    print(f"{total_pass} passed, {total_fail} failed, {len(files)} total entries")

    if total_fail > 0 or dup_found:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
