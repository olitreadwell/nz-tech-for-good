#!/usr/bin/env python3
"""Voice/style checks for this repo's prose. See docs/STYLE.md for the rules.

Checks two things, both fatal on any hit:

  EM DASHES
    - Any "—" character in README.md, CONTRIBUTING.md, docs/*.md, GUIDE.md,
      or an entry's `what:` field.

  BANNED WORDS
    - Any word from the list below, matched case-insensitively as a whole
      word, in the same files/field.

This only checks prose surfaces, not code comments, YAML field names, or
non-`what:` entry fields (e.g. `source`, which is a verification note, not
voice-governed prose). docs/STYLE.md is excluded: it has to name the banned
words to document them. An entry's own `name` can legitimately contain an
em dash if that's how the organisation styles its real title (e.g. "NZ On
Air — Public Interest Journalism Fund"); that's a fact, not prose, so known
entry names are stripped out of a line before it's checked.

Usage:
    python3 scripts/stylecheck.py
"""

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"

try:
    import yaml
except ImportError:  # pragma: no cover - needs pyyaml missing to trigger
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

EM_DASH = "—"

BANNED_WORDS = [
    "delve",
    "intricate",
    "tapestry",
    "pivotal",
    "underscore",
    "foster",
    "testament",
    "enhance",
    "crucial",
    "multifaceted",
    "synergy",
    "showcase",
    "garner",
    "robust",
    "seamless",
    "leverage",
    "vibrant",
    "thriving",
    "world-class",
    "cutting-edge",
    "breathtaking",
    "passionate",
    "driven",
    "enthusiastic",
]

BANNED_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in BANNED_WORDS) + r")\b",
    re.IGNORECASE,
)

# docs/STYLE.md documents the banned words and the em dash character by
# name, so it can't itself pass a check for their presence.
STYLE_DOC = ROOT / "docs" / "STYLE.md"

PROSE_FILES = [
    ROOT / "README.md",
    ROOT / "CONTRIBUTING.md",
    ROOT / "GUIDE.md",
    *sorted(p for p in (ROOT / "docs").glob("*.md") if p != STYLE_DOC),
]


def load_entries():
    entries = []
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        with open(path, encoding="utf-8") as f:
            try:
                entry = yaml.safe_load(f)
            except yaml.YAMLError:
                continue
        if isinstance(entry, dict):
            entries.append((path, entry))
    return entries


def load_known_names(entries):
    """Real entry names, longest first so overlapping names don't partially
    match. These can contain facts (including an em dash, if that's how the
    organisation styles its own title) that this check must not flag."""
    names = {entry["name"] for _, entry in entries if entry.get("name")}
    return sorted(names, key=len, reverse=True)


def check_text(label, text, violations, known_names=()):
    for i, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line
        for name in known_names:
            if name in line:
                line = line.replace(name, "")
        if EM_DASH in line:
            violations.append((label, i, "em dash", raw_line.strip()))
        for m in BANNED_PATTERN.finditer(line):
            violations.append((label, i, f"banned word {m.group(1)!r}", raw_line.strip()))


def check_prose_files(known_names):
    violations = []
    for path in PROSE_FILES:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        check_text(str(path.relative_to(ROOT)), text, violations, known_names)
    return violations


def check_entries(entries):
    violations = []
    for path, entry in entries:
        what = entry.get("what")
        if not what:
            continue
        label = f"data/entries/{path.name} (what)"
        check_text(label, what, violations)
    return violations


def main():
    entries = load_entries()
    known_names = load_known_names(entries)
    violations = check_prose_files(known_names) + check_entries(entries)

    if not violations:
        print("pass  no em dashes or banned words found")
        return 0

    print(f"FAIL  {len(violations)} style violation(s):")
    for label, lineno, kind, line in violations:
        print(f"      {label}:{lineno}  {kind}")
        print(f"        {line}")

    print()
    print("See docs/STYLE.md for the rules this checks.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
