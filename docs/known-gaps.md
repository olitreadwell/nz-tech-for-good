# Known gaps

## Scope changes (2026-08-25)

- 2026-08-07: 20 entries added across 6 under-covered domains (financial
  inclusion, disability employment, housing, health tech, mental health,
  journalism). Total 117 to 170.
- 2026-08-25: 45 entries pruned where technology is incidental to the
  mission (refugee support, legal advice, housing, food rescue, media,
  advocacy bodies). Total 170 to 131 across 24 domains. Pruned orgs:
  ARCC, ASST, Belong Aotearoa, ChangeMakers, HOST International, RASNZ,
  CAB, Community Law Centres, Wellington Community Justice Project,
  Community Housing Aotearoa, Housing First Auckland, The People's
  Project, IHC, Workbridge, Choices NZ, Consumer NZ, JustSpeak, Hui E!,
  Volunteering NZ, Cooperative Business NZ, Sustainable Business Network,
  Para Kore, Everybody Eats, Kaibosh, KiwiHarvest, Good Shepherd, Ngā
  Tāngata Microfinance, Money Sweetspot, Community Finance, Newsroom,
  The Spinoff, Public Interest, elocal, NZ On Air PIJF, Hāpai Te Hauora,
  Birds NZ, Auckland Co-design Lab, GOVIS, Privacy Foundation, Trust
  Democracy, Public Good Aotearoa, NZDEN, The Good Registry, Screen Sense.
  Reversible via git history.

## People / LinkedIn enrichment

No entry currently has `linkedin_people` filled in, even though the schema
supports it (`name`, `role`, `linkedin_url` per person). This isn't an
oversight in the data. It's a gap in the tooling used to build the
directory so far.

Finding accurate, current people-to-organisation links (e.g. "who is the
founder / who runs the tech team") reliably requires an authenticated
LinkedIn search tool, since public web search and unauthenticated scraping
return unreliable or stale results for this kind of query. That tooling
wasn't available when this directory was built.

**If you want to help close this gap:**

- Only add a person if you can verify their name, role, and LinkedIn URL
  against a real, current source (their own LinkedIn profile, or the
  organisation's team page).
- Follow the [People and privacy](../CONTRIBUTING.md#people-and-privacy)
  rules in CONTRIBUTING.md: public professional information only.
- Add entries to the `linkedin_people` list on the relevant YAML file, then
  run `scripts/validate.py` and `scripts/build_guide.py` as usual.
