# NZ Tech-for-Good

A directory of Aotearoa New Zealand organisations, projects, networks, and
people who use technology for public good.

## What this is

This repo lists NZ groups working in open data, civic tech, climate tech,
accessibility, Māori data sovereignty, humanitarian response, and more. Each
entry is a short, plain-language description with links, so you can find and
learn about groups doing good work with technology in New Zealand.

## Scope

Aotearoa New Zealand only. "Tech-for-good" here means technology used for a
public benefit — not-for-profit, government, community, or mission-led work,
rather than purely commercial products. See the domain list in
[GUIDE.md](GUIDE.md) for the full range of areas covered.

## Who this is for

- People looking for NZ tech-for-good groups to work with, volunteer with,
  or learn from.
- People looking to connect groups working in similar areas to each other.
- Anyone mapping out who's doing what in this space.

## How to browse

Read **[GUIDE.md](GUIDE.md)**. It's a generated, human-readable version of
the directory: grouped by domain, with a short description, region, links,
and tags for each entry, plus diagrams showing how entries connect to each
other.

## How the data is stored

The actual data lives in [`data/entries/`](data/entries/) — one YAML file
per entry. `GUIDE.md` is generated from these files by
[`scripts/build_guide.py`](scripts/build_guide.py), so if you want the raw,
structured version (for your own tooling, a search index, a map, etc.), read
the YAML files directly. The shape of each entry is defined in
[`schema/entry.schema.json`](schema/entry.schema.json).

## How to contribute

You can suggest a new entry two ways:

1. **Open an issue** using the
   [add-an-entry form](../../issues/new?template=add-entry.yml) — no coding
   needed.
2. **Open a pull request** — copy `data/entry.template.yaml` to
   `data/entries/<slug>.yaml`, fill it in, and submit. Full steps are in
   [CONTRIBUTING.md](CONTRIBUTING.md).

## Accuracy rules

- Every entry must be verified against a live source (the org's own
  website, GitHub, or LinkedIn page) before it's added.
- **Never invent a fact.** If you don't know something — a founding year, a
  careers page, a person's role — leave the field empty or `null` rather
  than guess.
- If you spot something out of date, check the entry's `source` field, then
  fix it via a pull request.

## People and privacy

This directory lists **public professional information only** — things an
organisation or person has already made public (a company LinkedIn page, a
named role on a website). It does not include private contact details.

If you're listed here and want your information corrected or removed,
please [open an issue](../../issues/new) and we'll action it.

No entry currently lists named people — see
[docs/known-gaps.md](docs/known-gaps.md) for why, and how to help close it.

## Licence

This repo has two licences, because code and data need different ones:

- **Code** (scripts, schema, tooling) is [MIT licensed](LICENSE).
- **Data** (the directory entries themselves) is
  [CC-BY-SA-4.0 licensed](LICENSE-DATA.md) — you can reuse and share it,
  including commercially, as long as you credit this project and share
  alike.

## How it started

This directory started as a research project by [Oli Treadwell](https://github.com/olitreadwell),
built with AI-assisted research and human verification of every entry. It's
now open for the community to correct, extend, and maintain.
