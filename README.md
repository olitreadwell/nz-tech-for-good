# NZ Tech-for-Good

A directory of Aotearoa New Zealand organisations, projects, networks, and
people who use technology for public good.

[![CI](https://github.com/olitreadwell/nz-tech-for-good/actions/workflows/ci.yml/badge.svg)](https://github.com/olitreadwell/nz-tech-for-good/actions/workflows/ci.yml)
[![Entries](https://img.shields.io/badge/entries-117-brightgreen)](GUIDE.md)
[![License: MIT (code) / CC-BY-SA-4.0 (data)](https://img.shields.io/badge/license-MIT%20%2F%20CC--BY--SA--4.0-blue)](#use-the-data)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)](#add-an-organisation--contribute)

## Contents

- [What this is](#what-this-is)
- [Browse it now](#browse-it-now)
- [Add an organisation / contribute](#add-an-organisation--contribute)
- [Use the data](#use-the-data)
- [How it's maintained](#how-its-maintained)
- [Related directories & further reading](#related-directories--further-reading)
- [For developers](#for-developers)

## What this is

This is a living, community-maintained directory of NZ groups working in
open data, civic tech, climate tech, accessibility, Māori data sovereignty,
humanitarian response, and more. Each entry is a short, plain-language
description with links, verified against a live source.

It's for people looking for NZ tech-for-good groups to work with, volunteer
with, or learn from. It's also for anyone mapping out who's doing what in
this space.

"Tech-for-good" here means technology used for a public benefit:
not-for-profit, government, community, or mission-led work, rather than
purely commercial products. Aotearoa New Zealand only.

## Browse it now

**🌐 [Browse the live website](https://olitreadwell.github.io/nz-tech-for-good/)**: searchable, filter by
domain, region, or tag, with a page for every organisation and ecosystem
diagrams. (Deploys from `main`; give it a minute after a change.)

**📖 [Or read the full directory in GUIDE.md](GUIDE.md)**: every entry, grouped
by domain, with a short description, region, links, tags, and diagrams
showing how entries connect to each other.

### Domains at a glance

117 entries across 27 domains:

| Domain | Entries |
| --- | --- |
| Open Data | 24 |
| Green & Climate Tech | 11 |
| Legal Aid & Justice Tech | 7 |
| Refugee & Migrant Support Tech | 6 |
| Research & Education Tech | 6 |
| Disability & Accessibility Tech | 5 |
| Civic Tech | 5 |
| Māori Data Sovereignty | 5 |
| Human Rights Tech | 4 |
| GovTech | 4 |
| Worker & Platform Co-ops | 4 |
| Nonprofit & NGO Tech | 4 |
| Iwi & Māori Tech Initiatives | 4 |
| Crisis & Humanitarian Tech | 4 |
| Environmental Citizen Science | 3 |
| Food Rescue & Food Security Tech | 3 |
| Journalism & Media Tech | 3 |
| Makerspaces & Hackerspaces | 2 |
| Mental Health Tech | 2 |
| Financial Inclusion & Fintech for Good | 2 |
| Disability Employment Tech | 2 |
| Education Equity Tech | 2 |
| Tech Ethics & Responsible AI | 1 |
| Housing & Homelessness Tech | 1 |
| Volunteering & Giving Platforms | 1 |
| Health Tech for Good / Hauora Māori | 1 |
| Digital Inclusion | 1 |

See the full breakdown, with entries listed under each domain, in
[GUIDE.md](GUIDE.md).

### A couple of example entries

**data.govt.nz** (Open Data): the New Zealand government's central website
for finding and downloading open datasets published by government agencies,
covering topics like health, education, transport, and the environment.

**DigitalNZ** (Open Data): run by the National Library of New Zealand, a
search service and open API that brings together more than 30 million
digitised items from over 200 NZ museums, libraries, and archives into one
searchable place.

**🌐 [Browse the live website](https://olitreadwell.github.io/nz-tech-for-good/)**: the full directory as a
searchable, filterable site.

## Add an organisation / contribute

Know a group that should be listed? There are two ways to add one, no
coding needed for the first:

1. **[Suggest an entry](../../issues/new?template=add-entry.yml)**: fill in
   a short issue form with what you know. Someone will verify it and add it.
2. **Open a pull request**: copy `data/entry.template.yaml` to
   `data/entries/<slug>.yaml`, fill it in, and submit. Full steps are in
   [CONTRIBUTING.md](CONTRIBUTING.md).

Every entry must be verified against a live source before it's added.
**Never invent a fact**: leave a field empty rather than guess.

## Use the data

The raw data lives in [`data/entries/`](data/entries/): one YAML file per
entry, shaped by [`schema/entry.schema.json`](schema/entry.schema.json).
[`GUIDE.md`](GUIDE.md) is generated from these files, so if you want the
structured version for your own tooling (a search index, a map, etc.), read
the YAML directly.

- **Code** (scripts, schema, tooling) is [MIT licensed](LICENSE).
- **Data** (the directory entries) is
  [CC-BY-SA-4.0 licensed](LICENSE-DATA.md): reuse and share it, including
  commercially, as long as you credit this project and share alike.

### Machine-readable data

If you'd rather not parse YAML, the whole directory is also exported as
[`data/exports/entries.json`](data/exports/entries.json) (one JSON object
per entry) and [`data/exports/entries.csv`](data/exports/entries.csv) (the
same data flattened to columns), both regenerated from `data/entries/` by
`scripts/export.py` and kept in sync by CI.

## How it's maintained

- Links are checked automatically every week
  ([`.github/workflows/linkcheck.yml`](.github/workflows/linkcheck.yml)); a
  tracking issue opens on genuine dead links and closes when they recover.
- `GUIDE.md` is regenerated from the YAML entries, so it's always in sync
  with the underlying data. CI fails a PR if it's out of date.
- Accuracy comes first: every entry is verified against a live source, and
  nothing is invented. See [CONTRIBUTING.md](CONTRIBUTING.md) for the rules.
- This directory lists **public professional information only**. It does
  not currently list any named people: see
  [docs/known-gaps.md](docs/known-gaps.md) for why, and how to help close
  that gap.

## Related directories & further reading

Other Aotearoa New Zealand places to find open data, tech-for-good, and
accessibility work. Every link below was checked and resolves:

- **[data.govt.nz](https://data.govt.nz)** is the New Zealand government's
  open data catalogue: public datasets from across government.
- **[Stats NZ / Tatauranga Aotearoa](https://www.stats.govt.nz)** is the
  official statistics agency; source data on people, economy, and environment.
- **[LINZ Data Service](https://data.linz.govt.nz)** is Land Information New
  Zealand's open geospatial, land, and mapping data.
- **[Figure.NZ](https://figure.nz)** is a charity that turns New Zealand data
  into free, easy-to-read charts so more people can understand it.
- **[Te Mana Raraunga](https://www.temanararaunga.maori.nz)** is the Māori Data
  Sovereignty Network, advocating for Māori rights and interests in data.
- **[Digital.govt.nz: accessibility](https://www.digital.govt.nz/standards-and-guidance/design-and-ux/accessibility/)**
  is the New Zealand Government Web Accessibility Standard and related guidance.
- **[New Zealand Open Source Society](https://nzoss.nz)** is a community group
  promoting open source software and open standards in New Zealand.
- **[IT Professionals NZ](https://itp.nz)** is a professional body and community
  for people working in tech across New Zealand.

Know a directory, registry, or community hub that belongs here? Please
[open an issue](../../issues/new) or a pull request.

## For developers

Clone the repo and set up the scripts used to validate and regenerate the
directory:

```bash
git clone https://github.com/olitreadwell/nz-tech-for-good.git
cd nz-tech-for-good
pip install -r requirements.txt

python3 scripts/validate.py      # check entries against the schema
python3 scripts/build_guide.py   # regenerate GUIDE.md from data/entries/
python3 scripts/linkcheck.py     # optional: check all links for dead ones
```

Run both `validate.py` and `build_guide.py` after adding or editing an
entry, and commit the regenerated `GUIDE.md`. CI fails a PR if it's out of
date. Full contribution steps, including commit message style, are in
[CONTRIBUTING.md](CONTRIBUTING.md).

## How it started

This directory started as a research project by [Oli Treadwell](https://github.com/olitreadwell),
built with AI-assisted research and human verification of every entry. It's
now open for the community to correct, extend, and maintain.

## People and privacy

If you're listed here and want your information corrected or removed,
please [open an issue](../../issues/new) and we'll action it. This takes
priority over completeness.
