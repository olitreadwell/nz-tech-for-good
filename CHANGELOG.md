# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added — 2026-08-06 (loop iteration 2)

**12 new directory entries (139 total, up from 127)**

*Māori / Pasifika tech*
- **Te Pā Tūwatawata** — decentralised, Māori-owned data storage network for marae/hapū/iwi (`Māori data sovereignty / indigenous data`)
- **DigiFale** — Pacific youth teaching elders digital health literacy, Māngere (`digital-inclusion`)
- **Marae Digital Connectivity Programme** — government-backed free broadband/wifi for rural marae (`iwi / Māori tech initiatives`)
- **Code 4 Change NZ** — free coding/robotics for South Auckland Māori and Pacific tamariki (`education equity tech`)

*Regional NZ*
- **Tinkd Makerspace** — Tauranga community workshop, STEM Wana Trust (`makerspaces / hackerspaces`)
- **Digital Inclusion Alliance Aotearoa** — Wellington-based national digital-skills network, 300+ partners (`digital-inclusion`)
- **Kiwi Coast** — Northland pest-control network with AI-enabled traps and kiwi tracking (`environmental citizen-science`)
- **WestREAP** — Hokitika charity running digital literacy workshops on the West Coast (`digital-inclusion`)

*Emerging domains*
- **Gone Good** — surplus-food app cutting cafe/restaurant food waste (`food-rescue / food-security tech`)
- **AI Safety Aotearoa** — Wellington public education initiative on AI risk (`tech-ethics / responsible-AI`)
- **SPARX** — University of Auckland's free CBT self-help game for youth (`mental-health tech`)
- **Sorted** — Retirement Commission's free money-guidance platform (`financial-inclusion / fintech-for-good`)

**Site/tooling**
- `scripts/coverage.py` — new report counting entries per domain and per region, flags domains under 3 entries, surfaced in the CI job summary
- `docs/roadmap.md` — ticked the coverage-report and freshness-check items as done

### Added — 2026-08-05 (loop iteration 1)

**10 new directory entries (127 total, up from 117)**

*Māori / Pasifika tech (batch 1)*
- **Pūhoro STEMM Academy** — kaupapa Māori STEMM pathways for rangatahi, founded 2016 (`iwi / Māori tech initiatives`)
- **Amotai** — Māori and Pasifika supplier diversity marketplace, founded 2018 (`iwi / Māori tech initiatives`)
- **Taiuru & Associates** — Māori data sovereignty and AI governance consultancy (`Māori data sovereignty / indigenous data`)
- **Fibre Fale** — Pasifika digital inclusion, connectivity and skills, founded 2022 (`digital-inclusion`)
- **Te Hapori Matihiko** — global Māori tech community network, founded 2022 (`iwi / Māori tech initiatives`)

*Regional NZ & emerging domains (batch 2)*
- **Com2Tech** — Otago-based digital inclusion for older adults and communities (`digital-inclusion`)
- **Digital Future Aotearoa** — Canterbury coding education and device recycling (`education equity tech`)
- **The Cause Collective** — Tāmaki Makaurau Māori and Pasifika youth tech programmes (`digital-inclusion`)
- **Kai Commitment** — national food-waste measurement data platform (`food-rescue / food-security tech`)
- **Aotearoa Food Rescue Alliance** — national food rescue peak body (`food-rescue / food-security tech`)

**Quality tooling**
- `scripts/validate.py` — added duplicate website URL detection; duplicate URLs now fail the CI quality gate
- `CHANGELOG.md` — this file, tracking changes from loop iteration 1 onward

---

## Historical (pre-changelog)

All changes before 2026-08-05 are captured in the [git log](https://github.com/olitreadwell/nz-tech-for-good/commits/main).

Notable milestones:
- **v0.1 — 2025** — initial directory with first entries and GitHub Pages site
- **117 entries** — reached via multiple rounds of research and verification
- Weekly link-check CI workflow added
- GitHub Pages Astro site with search, domain/region/tag filtering, and ecosystem diagrams
