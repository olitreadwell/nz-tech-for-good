#!/usr/bin/env python3
"""Render README.md as a plain-language awesome list from data/entries/*.yaml.

The YAML files remain the structured source for the website. This script
renders the public list: one bullet per organisation, grouped by broad
category and domain, with the shortest useful description and a link.

Usage:
    python3 scripts/build_readme.py          # write README.md
    python3 scripts/build_readme.py --check  # fail when README.md is stale
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ENTRIES_DIR = ROOT / "data" / "entries"
README_PATH = ROOT / "README.md"
REPO_SLUG = ROOT.name
SITE_URL = f"https://{REPO_SLUG}.vercel.app"
REPO_URL = f"https://github.com/olitreadwell/{REPO_SLUG}"
COUNTRY_PREFIX = REPO_SLUG.split("-", 1)[0].upper()
TITLE = {
    "NZ": "NZ Tech-for-Good",
    "UK": "UK Tech-for-Good",
    "USA": "USA Tech-for-Good",
}.get(COUNTRY_PREFIX, "Tech-for-Good")
REGION_LABEL = {
    "NZ": "Aotearoa New Zealand",
    "UK": "the United Kingdom",
    "USA": "the United States",
}.get(COUNTRY_PREFIX, "the country")

# Broad categories keep the Contents short enough to scan. Each domain sits
# under one category, so every organisation appears exactly once.
CATEGORIES: tuple[tuple[str, tuple[str, ...]], ...] = (
    (
        "Data and knowledge",
        (
            "open-data",
            "environmental citizen-science",
        ),
    ),
    (
        "Civic and community",
        (
            "civic-tech",
            "govtech",
            "nonprofit / NGO tech",
            "volunteering / giving platforms",
            "crisis / humanitarian-tech",
            "human-rights tech",
            "legal-aid / justice tech",
            "journalism / media-tech",
        ),
    ),
    (
        "Māori and indigenous data",
        (
            "Māori data sovereignty / indigenous data",
            "iwi / Māori tech initiatives",
        ),
    ),
    (
        "Access and inclusion",
        (
            "digital-inclusion",
            "disability & accessibility tech",
            "education equity tech",
        ),
    ),
    (
        "Health and wellbeing",
        (
            "mental-health tech",
            "health tech for good / hauora Māori",
        ),
    ),
    (
        "Climate, food and housing",
        (
            "green / climate-tech",
            "food-rescue / food-security tech",
            "housing / homelessness tech",
        ),
    ),
    (
        "Work, money and learning",
        (
            "worker-coop / platform-coop tech",
            "financial-inclusion / fintech-for-good",
            "research / education tech",
            "makerspaces / hackerspaces",
        ),
    ),
    (
        "Tech ethics and responsible AI",
        ("tech-ethics / responsible-AI",),
    ),
)

DOMAIN_LABELS = {
    "open-data": "Open data",
    "environmental citizen-science": "Environmental citizen science",
    "civic-tech": "Civic tech",
    "govtech": "Government technology",
    "nonprofit / NGO tech": "Nonprofit and NGO technology",
    "volunteering / giving platforms": "Volunteering and giving",
    "crisis / humanitarian-tech": "Crisis and humanitarian technology",
    "human-rights tech": "Human rights technology",
    "legal-aid / justice tech": "Legal aid and justice technology",
    "journalism / media-tech": "Journalism and media technology",
    "Māori data sovereignty / indigenous data": "Māori data sovereignty",
    "iwi / Māori tech initiatives": "Iwi and Māori technology",
    "digital-inclusion": "Digital inclusion",
    "disability & accessibility tech": "Disability and accessibility technology",
    "education equity tech": "Education equity technology",
    "mental-health tech": "Mental health technology",
    "health tech for good / hauora Māori": "Health technology and hauora Māori",
    "green / climate-tech": "Climate technology",
    "food-rescue / food-security tech": "Food rescue and food security",
    "housing / homelessness tech": "Housing and homelessness technology",
    "worker-coop / platform-coop tech": "Worker and platform co-ops",
    "financial-inclusion / fintech-for-good": "Financial inclusion and fintech",
    "research / education tech": "Research and education technology",
    "makerspaces / hackerspaces": "Makerspaces and hackerspaces",
    "tech-ethics / responsible-AI": "Technology ethics and responsible AI",
}

DOMAIN_ORDER = tuple(
    domain for _category, domains in CATEGORIES for domain in domains
)


def slug_from_path(path: Path) -> str:
    """Return the entry slug used by the website."""
    return path.stem


def load_entries() -> list[dict[str, object]]:
    """Load every YAML entry, adding its slug and source path."""
    entries: list[dict[str, object]] = []
    for path in sorted(ENTRIES_DIR.glob("*.yaml")):
        with open(path, encoding="utf-8") as handle:
            entry = yaml.safe_load(handle)
        if not isinstance(entry, dict) or not entry.get("name"):
            continue
        entry["slug"] = slug_from_path(path)
        entries.append(entry)
    return entries


def public_url(entry: dict[str, object]) -> str:
    """Return the best public link for one entry."""
    for field in ("website", "github", "linkedin_org", "community_url", "events_url"):
        value = str(entry.get(field) or "").strip()
        if value:
            return value
    slug = str(entry.get("slug") or "").strip()
    if slug:
        return f"{SITE_URL}/entry/{slug}"
    return ""


def escape_markdown(text: str) -> str:
    """Escape the characters that would break a Markdown link or bullet."""
    return text.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")


def normalise_description(text: str, name: str = "") -> str:
    """Make one description fit the awesome-list grammar and plain English.

    awesome-lint rejects a description that repeats the item name, and the
    repeat adds reading work for no new information. Strip a leading copy of
    the name, then drop the verb that followed it when the sentence still
    makes sense without it.
    """
    value = " ".join(str(text).split()).strip()
    if not value:
        return ""

    if name:
        pattern = re.compile(
            rf"^{re.escape(name)}(?=\s|$|[,.])\s*(?:\([^)]*\)\s*)?",
            re.IGNORECASE,
        )
        value = pattern.sub("", value, count=1).strip()
        value = re.sub(r"^(?:is|are|was|were)\s+", "", value, flags=re.IGNORECASE)
        value = value.lstrip(" ,;:-")

    value = re.sub(r"\s*;\s*", ". ", value)
    value = re.sub(r"(?<=[.!?])\s+([a-z])", lambda match: match.group(0).upper(), value)
    if value:
        value = value[:1].upper() + value[1:]

    first_word = value.split(maxsplit=1)[0] if value else ""
    if (
        first_word[:1].isalpha()
        and first_word[:1].islower()
        and not any(character.isupper() for character in first_word[1:])
    ):
        value = value[:1].upper() + value[1:]
    if value and not value.endswith((".", "!", "?")):
        value += "."
    return value


def render_entry(entry: dict[str, object]) -> str | None:
    """Render one organisation as an awesome-list bullet."""
    name = str(entry.get("name") or "").strip()
    description = normalise_description(str(entry.get("what") or ""), name)
    url = public_url(entry)
    if not name or not description or not url:
        return None
    return f"- [{escape_markdown(name)}]({url}) - {escape_markdown(description)}"


def render_contents(
    categories: tuple[tuple[str, tuple[str, ...]], ...],
    available_domains: set[str],
) -> list[str]:
    """Render the Contents block in heading order, skipping empty sections."""
    lines: list[str] = ["- [Start here](#start-here)"]
    for category, domains in categories:
        present = [domain for domain in domains if domain in available_domains]
        if not present:
            continue
        lines.append(f"- [{category}](#{anchor(category)})")
        for domain in present:
            lines.append(f"  - [{DOMAIN_LABELS[domain]}](#{anchor(DOMAIN_LABELS[domain])})")
    return lines


def anchor(text: str) -> str:
    """Approximate GitHub's heading anchor for plain headings."""
    value = text.strip().lower()
    value = re.sub(r"[^\w\s-]", "", value)
    return re.sub(r"\s+", "-", value)


def render_readme(entries: list[dict[str, object]]) -> str:
    """Render the whole README."""
    entries_by_domain: dict[str, list[dict[str, object]]] = {}
    for entry in entries:
        domain = str(entry.get("domain") or "")
        entries_by_domain.setdefault(domain, []).append(entry)
    for domain_entries in entries_by_domain.values():
        domain_entries.sort(key=lambda item: str(item["name"]).lower())

    visible = [entry for entry in entries if public_url(entry)]
    count = len(visible)
    noun = "organisation" if count == 1 else "organisations"

    lines = [
        f"# {TITLE} [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)",
        "",
        f"A plain-language list of {count} {noun}, projects, and networks in {REGION_LABEL} that use technology for public good.",
        "",
        "## Contents",
        "",
        *render_contents(CATEGORIES, set(entries_by_domain)),
        "",
        "## Start here",
        "",
        f"The [live directory]({SITE_URL}/) has search, filters, and a page for each organisation.",
        "",
        f"Read [how entries are chosen]({REPO_URL}/blob/main/docs/how-entries-are-chosen.md). To add or correct an entry, [open an issue]({REPO_URL}/issues/new/choose).",
        "",
        f"Download the data as [JSON]({REPO_URL}/blob/main/data/exports/entries.json) or [CSV]({REPO_URL}/blob/main/data/exports/entries.csv).",
        "",
    ]

    for category, domains in CATEGORIES:
        present = [domain for domain in domains if entries_by_domain.get(domain)]
        if not present:
            continue
        lines.extend([f"## {category}", ""])
        for domain in present:
            lines.extend([f"### {DOMAIN_LABELS[domain]}", ""])
            for entry in entries_by_domain[domain]:
                line = render_entry(entry)
                if line:
                    lines.append(line)
            lines.append("")

    lines.extend(
        [
            "## Footnotes",
            "",
            "This list is maintained by the community. Every entry is checked against a live source before it is added.",
            "",
            f"Read [CONTRIBUTING.md]({REPO_URL}/blob/main/CONTRIBUTING.md) for the review rules.",
            "",
            "The website is the searchable version of this list. The data is available under CC BY-SA 4.0. The code is under the MIT licence.",
            "",
            "If you are listed here and want your information corrected or removed, use the issue link in Start here. That request takes priority over completeness.",
            "",
            "### Words used in this list",
            "",
            "**API**: a way for one computer program to ask another for data.",
            "",
            "**GIS**: software for making and reading maps from data.",
            "",
            "**AI**: software that can do tasks that usually need human judgement.",
            "",
        ]
    )
    return "\n".join(lines)


def check_readme(path: Path, entries: list[dict[str, object]]) -> bool:
    """Return whether the README on disk matches a fresh render."""
    expected = render_readme(entries)
    actual = path.read_text(encoding="utf-8") if path.exists() else ""
    return actual == expected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when README.md is stale")
    args = parser.parse_args()

    entries = load_entries()
    if args.check:
        if check_readme(README_PATH, entries):
            print(f"{README_PATH.name}: up to date")
            return 0
        print(f"{README_PATH.name}: stale. Run: python3 scripts/build_readme.py")
        return 1

    README_PATH.write_text(render_readme(entries), encoding="utf-8")
    print(f"Wrote {README_PATH.name} with {len(entries)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
