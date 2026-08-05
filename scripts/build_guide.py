#!/usr/bin/env python3
"""Build GUIDE.md from data/entries/*.yaml.

Reads every YAML file in data/entries/ and writes GUIDE.md: an intro, a
domain legend and count, an ecosystem-overview Mermaid diagram, per-domain
Mermaid close-ups for any domain with internal related_to links, one H2
section per domain with a scannable bullet block per entry, and a footer
explaining how to add an entry.

Safe to re-run any time an entry is added or changed — it always rebuilds
GUIDE.md from scratch, so it stays in sync with the data. Cwd-independent:
paths are resolved relative to this script's location.

Usage:
    python3 scripts/build_guide.py
"""

import re
import sys
from collections import defaultdict, OrderedDict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
OUT = ROOT / "GUIDE.md"

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

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
    entries.append(e)

# Keep output order stable regardless of filesystem glob order.
entries.sort(key=lambda e: e["name"].lower())


def norm(s):
    return re.sub(r"\s*\(.*?\)\s*", "", s).strip().lower()


names = set(e["name"] for e in entries)
namemap = {norm(e["name"]): e["name"] for e in entries}


def resolve(r):
    """Match a related_to reference to an entry's real name, even if the
    reference uses a shortened or differently-cased form (e.g. "LINZ Data
    Service" -> "LINZ Data Service (Toitū Te Whenua)"). Returns None if no
    entry matches — such references are dropped rather than guessed at."""
    if r in names:
        return r
    if norm(r) in namemap:
        return namemap[norm(r)]
    for n in names:
        if norm(r) in norm(n) or norm(n) in norm(r):
            return n
    return None


by_domain = defaultdict(list)
for e in entries:
    by_domain[e["domain"]].append(e)

# preserve first-seen domain order (by sorted entry name, for reproducibility)
domain_order = list(OrderedDict.fromkeys(e["domain"] for e in entries))

entry_domain = {e["name"]: e["domain"] for e in entries}


def mid(s):
    """Short mermaid-safe node id, unique per entry name."""
    h = re.sub(r"[^a-zA-Z0-9]", "", s)[:24]
    return "n_" + h


# --- resolve edges (undirected, deduped) ---
edge_set = set()
unresolved_refs = []
for e in entries:
    for r in e.get("related_to", []) or []:
        target = resolve(r)
        if not target:
            unresolved_refs.append((e["name"], r))
            continue
        a, b = e["name"], target
        if a == b:
            continue
        key = tuple(sorted((a, b)))
        edge_set.add(key)

# --- domain-level overview edges ---
domain_edge_counts = defaultdict(int)
for a, b in edge_set:
    da, db = entry_domain[a], entry_domain[b]
    if da == db:
        continue
    key = tuple(sorted((da, db)))
    domain_edge_counts[key] += 1

# --- per-domain internal edges ---
internal_edges = defaultdict(list)
for a, b in edge_set:
    da, db = entry_domain[a], entry_domain[b]
    if da == db:
        internal_edges[da].append((a, b))

# domains getting mini diagrams: has >=1 internal edge (denser / hub-shaped)
mini_domains = [d for d in domain_order if len(internal_edges[d]) >= 1]

domain_label_short = {
    "open-data": "Open Data",
    "worker-coop / platform-coop tech": "Worker & Platform Co-ops",
    "civic-tech": "Civic Tech",
    "human-rights tech": "Human Rights Tech",
    "green / climate-tech": "Green & Climate Tech",
    "crisis / humanitarian-tech": "Crisis & Humanitarian Tech",
    "journalism / media-tech": "Journalism & Media Tech",
    "nonprofit / NGO tech": "Nonprofit & NGO Tech",
    "govtech": "GovTech",
    "Māori data sovereignty / indigenous data": "Māori Data Sovereignty",
    "disability & accessibility tech": "Disability & Accessibility Tech",
    "research / education tech": "Research & Education Tech",
    "legal-aid / justice tech": "Legal Aid & Justice Tech",
    "refugee / migrant support tech": "Refugee & Migrant Support Tech",
    "iwi / Māori tech initiatives": "Iwi & Māori Tech Initiatives",
    "makerspaces / hackerspaces": "Makerspaces & Hackerspaces",
    "mental-health tech": "Mental Health Tech",
    "health tech for good / hauora Māori": "Health Tech for Good / Hauora Māori",
    "food-rescue / food-security tech": "Food Rescue & Food Security Tech",
    "financial-inclusion / fintech-for-good": "Financial Inclusion & Fintech for Good",
    "education equity tech": "Education Equity Tech",
    "digital-inclusion": "Digital Inclusion",
    "tech-ethics / responsible-AI": "Tech Ethics & Responsible AI",
    "volunteering / giving platforms": "Volunteering & Giving Platforms",
    "housing / homelessness tech": "Housing & Homelessness Tech",
    "disability employment tech": "Disability Employment Tech",
    "environmental citizen-science": "Environmental Citizen Science",
}

lines = []
lines.append("# New Zealand Tech-for-Good Guide")
lines.append("")
lines.append(
    "This is a living directory of New Zealand organisations, projects, "
    "networks, and people who use technology for public good — open data, "
    "civic tech, climate tech, accessibility, Māori data sovereignty, "
    "humanitarian response, and more."
)
lines.append("")
lines.append(
    "**Who this is for:** people looking for NZ tech-for-good groups to "
    "work with, volunteer with, learn from, or connect to each other."
)
lines.append("")
lines.append(
    "**How this guide is built:** it's generated from the YAML entries in "
    "`data/entries/`. Accuracy comes first — an entry is only added once "
    "its website (or another reliable source) confirms the details. This "
    "is a work in progress. It will grow, and some links or details may "
    "go out of date over time. See [CONTRIBUTING.md](CONTRIBUTING.md) to "
    "add or fix an entry."
)
lines.append("")
lines.append("## How to read this")
lines.append("")
lines.append(
    "Entries are grouped by **domain** — the area of public good the "
    "organisation works in. Each entry is a short, plain-language block: "
    "what the organisation does, where it's based, its links, and its tags. "
    "Where two entries are linked (for example, one runs on another's data, "
    "or they grew out of the same network), that connection is shown as a "
    "line in the diagrams below. No connection is invented — a line only "
    "appears if it's recorded in the underlying data."
)
lines.append("")
lines.append("**Legend — domains in this guide:**")
lines.append("")
for d in domain_order:
    n = len(by_domain[d])
    noun = "entry" if n == 1 else "entries"
    lines.append(f"- **{domain_label_short.get(d, d)}** ({d}) — {n} {noun}")
lines.append("")

total = len(entries)
lines.append(f"**Total entries: {total}, across {len(domain_order)} domains.**")
lines.append("")

# --- overview mermaid diagram ---
lines.append("## Ecosystem overview")
lines.append("")
lines.append(
    "This diagram shows the domains as nodes, sized by how many entries "
    "each holds, with a line drawn between two domains whenever at least "
    "one entry in one domain lists an entry in the other as related. "
    "Domains with no cross-domain links are shown on their own."
)
lines.append("")
lines.append("```mermaid")
lines.append("flowchart TD")
domain_ids = {d: f"d{i}" for i, d in enumerate(domain_order)}
for d in domain_order:
    label = domain_label_short.get(d, d)
    n = len(by_domain[d])
    noun = "entry" if n == 1 else "entries"
    lines.append(f'    {domain_ids[d]}["{label}<br/>({n} {noun})"]')
seen_domain_edges = set()
for (da, db), count in domain_edge_counts.items():
    key = tuple(sorted((da, db)))
    if key in seen_domain_edges:
        continue
    seen_domain_edges.add(key)
    label = f"{count} link" + ("s" if count != 1 else "")
    lines.append(f'    {domain_ids[da]} ---|"{label}"| {domain_ids[db]}')
lines.append("```")
lines.append("")

# --- per-domain mini diagrams ---
lines.append("### Domain close-ups")
lines.append("")
lines.append(
    "The domains below have enough internal connections to be worth "
    "zooming in on. Isolated entries (no recorded links) are included as "
    "standalone nodes so the diagram still shows the whole domain."
)
lines.append("")
for d in mini_domains:
    label = domain_label_short.get(d, d)
    ents = by_domain[d]
    lines.append(f"**{label}**")
    lines.append("")
    lines.append("```mermaid")
    lines.append("flowchart TD")
    ids = {}
    for e in ents:
        nid = mid(e["name"])
        ids[e["name"]] = nid
        safe_label = e["name"].replace('"', "'")
        lines.append(f'    {nid}["{safe_label}"]')
    for a, b in internal_edges[d]:
        lines.append(f"    {ids[a]} --- {ids[b]}")
    lines.append("```")
    lines.append("")

# --- per-domain sections ---
for d in domain_order:
    label = domain_label_short.get(d, d)
    ents = sorted(by_domain[d], key=lambda e: e["name"].lower())
    lines.append(f"## {label}")
    lines.append("")
    noun = "entry" if len(ents) == 1 else "entries"
    lines.append(f"_{len(ents)} {noun} in this domain._")
    lines.append("")
    for e in ents:
        link_parts = []
        if e.get("website"):
            link_parts.append(f"[Website]({e['website']})")
        if e.get("github"):
            link_parts.append(f"[GitHub]({e['github']})")
        if e.get("linkedin_org"):
            link_parts.append(f"[LinkedIn]({e['linkedin_org']})")
        links_str = " · ".join(link_parts) if link_parts else "_no links on file_"
        tags_str = ", ".join(e.get("tags", []) or [])
        lines.append(f"**{e['name']}**")
        lines.append("")
        lines.append(f"- {e['what']}")
        lines.append(f"- Region: {e['region']}")
        lines.append(f"- Links: {links_str}")
        if tags_str:
            lines.append(f"- Tags: {tags_str}")
        related = e.get("related_to", []) or []
        if related:
            lines.append(f"- Related: {', '.join(related)}")
        lines.append("")

# --- footer ---
lines.append("## How this is maintained / how to add an entry")
lines.append("")
lines.append(
    "This guide is generated from the YAML files in `data/entries/`, one "
    "file per entry. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full "
    "step-by-step walkthrough. In short:"
)
lines.append("")
lines.append(
    "1. Copy `data/entry.template.yaml` to `data/entries/<slug>.yaml`."
)
lines.append("2. Fill in the fields, verifying each against a live source.")
lines.append("3. Run `python3 scripts/validate.py` to check it against the schema.")
lines.append(
    "4. Run `python3 scripts/build_guide.py` to regenerate this file, "
    "then open a pull request."
)
lines.append("")
lines.append(
    "Entries are only added once verified against a live source. If you "
    "spot something out of date, check the entry's `source` field first, "
    "then update the YAML file in `data/entries/`."
)
lines.append("")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print("wrote", OUT)
print("total entries", total)
print("domains", len(domain_order))
print("mini diagrams for:", mini_domains)
print("skipped invalid files:", skipped)
print("unresolved refs:", unresolved_refs)
