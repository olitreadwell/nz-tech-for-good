# Known gaps

## Recently filled (2026-08-07)

20 entries added across 6 under-covered domains:
- Financial Inclusion & Fintech: +3 (Ngā Tāngata Microfinance, Community Finance, Money Sweetspot)
- Disability Employment Tech: +3 (NZ Disability Employers' Network, Choices NZ, One in Six)
- Housing & Homelessness Tech: +4 (Housing First Auckland, The People's Project, BenefitMe, Home Steps)
- Health Tech / Hauora Māori: +3 (Awa Digital, Health Navigator Charitable Trust, Whānau Tahi)
- Mental Health Tech: +4 (Headstrong, ignite, Le Va, Screen Sense)
- Journalism & Media Tech: +2 (Public Interest, elocal)
- Iwi & Māori Tech Initiatives: +1 (IndigiShare)

Total entries: 117 → 170 across 27 domains.

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
