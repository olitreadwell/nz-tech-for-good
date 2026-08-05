#!/usr/bin/env python3
"""Write .github/badges/entry-count.json from data/entries/*.yaml.

Counts the entry files and writes a shields.io "endpoint" JSON badge
(https://shields.io/badges/endpoint-badge) with that count as the message.
README.md points its Entries badge at this file (served raw from GitHub), so
the badge always matches the data instead of being hand-edited and going
stale.

Safe to re-run any time an entry is added or removed — it always rewrites
the file from scratch. Cwd-independent: paths are resolved relative to this
script's location.

Usage:
    python3 scripts/badge_entry_count.py
"""

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
OUT = ROOT / ".github" / "badges" / "entry-count.json"

count = len(list(ENTRIES_DIR.glob("*.yaml")))

badge = {
    "schemaVersion": 1,
    "label": "entries",
    "message": str(count),
    "color": "brightgreen",
}

OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(badge, f, indent=2)
    f.write("\n")

print(f"Wrote {OUT.relative_to(ROOT)}: {count} entries")
