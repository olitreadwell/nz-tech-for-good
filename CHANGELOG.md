# Changelog

## 2026-08-25 - Prune weak-fit entries, restore automation, site feedback loop

- Pruned 45 weak-fit entries (176 -> 131): refugee/migrant support, legal
  advice, housing, food rescue, media, and advocacy orgs where technology is
  incidental to the mission. Regenerated GUIDE.md and exports, cleaned
  `related_to` refs, untracked build artifacts.
- Restored the weekly link-check workflow (`linkcheck.yml`, had gone missing
  from `.github/workflows`); backfilled its unit tests.
- Added Wayback Machine archiving (`scripts/archive_wayback.py`, weekly
  `wayback.yml`, `data/archives.json`).
- Added a weekly data-quality freshness sweep (`dataquality.yml`).
- Backfilled optional fields (github, linkedin_org, founding_year,
  takes_contributors, careers_url) for the 74 campaign orgs.
- Added a contact page (`/contact`) and a "spot a mistake / update this entry"
  feedback action on entry pages (pre-filled GitHub issue).
- Git workflow: features land on `development`; a blocked `development -> main`
  PR (#101) carries the full set. Old branches (dev, production, claude/*,
  fix/*, dependabot/*, renovate/*) and stale worktrees cleaned up.


All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added — 2026-08-06 (loop iteration 3)

**13 new directory entries (152 total, up from 139), targeted at thin domains**

*Health tech / housing tech*
- **Karo** — Māori-owned health tech for primary/community providers (`health tech for good / hauora Māori`)
- **Whānau Tahi** — Māori-owned case-management software, 100+ health/social orgs (`health tech for good / hauora Māori`)
- **Housing First Auckland** — homelessness collective backed by a referral/outcomes data system (`housing / homelessness tech`)
- **Renters United** — Wellington renter advocacy group, built the TenancyHelp tool (`housing / homelessness tech`)

*Volunteering / disability employment*
- **SEEK Volunteer** — free volunteer-matching platform, run by SEEK since 2015 (`volunteering / giving platforms`)
- **Boosted** — Aotearoa's arts crowdfunding platform (`volunteering / giving platforms`)
- **The Good Registry** — Wellington social enterprise, charity gift cards and corporate giving (`volunteering / giving platforms`)
- **One in Six** — disability employment hub with an accessible recruitment model, launched Feb 2026 (`disability employment tech`)

*Tech ethics / regional NZ*
- **Brainbox Institute** — public interest think tank, builds the NZ AI Policy Tracker (`tech-ethics / responsible-AI`)
- **Centre for Artificial Intelligence and Public Policy (CAIPP)** — Otago University research centre on AI policy and governance (`tech-ethics / responsible-AI`)
- **Tolaga Bay Innovation** — digital skills hub, Te Tairāwhiti Digital Equity Collective (`digital-inclusion`, Gisborne)
- **Te Au Pūngao** — council-backed makerspace with 3D printers and microgrants (`makerspaces / hackerspaces`, Marlborough)
- **EPIC Westport** — innovation hub and digital literacy programme (`digital-inclusion`, West Coast)

Every domain now has at least 3 entries (`scripts/coverage.py` no longer flags any thin domains).

**Site/tooling**
- Cached pip dependencies in `ci.yml` and `linkcheck.yml` (`actions/setup-python` built-in cache)
- Added an `ocr` (alibaba/open-code-review) delegation-mode review step before every push: no new API key needed, findings reviewed against `ocr`'s security/correctness/reliability ruleset before merging to main
- Added a worktree/branch cleanup step at the end of each successful iteration
- Added a cost-aware model policy for subagents: cheap model for mechanical writing, default model kept for org-verification research and judgment calls

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
