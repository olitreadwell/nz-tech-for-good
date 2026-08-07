# Roadmap

A prioritised backlog of improvements for this directory. Grouped by theme,
best value first within each group. Each item is a concrete task, small
enough to do in one change. Tick items off as they ship.

This is a living file. If you pick up an item, link the PR next to it. If an
item stops making sense, strike it out with a one-line note.

Legend: `[ ]` not started · `[x]` done · items marked **(needs Oli)** are
account-level settings only the repo owner can change.

---

## Automation

- [x] Add a scheduled weekly link-check workflow that runs
  `scripts/linkcheck.py` and opens/updates a single tracking issue on genuine
  dead links, closing it when they recover. (`.github/workflows/linkcheck.yml`)
- [x] Add Dependabot for the `github-actions`, `pip`, and `npm` (site/)
  ecosystems. (`.github/dependabot.yml`)
- [x] Auto-merge patch/minor Dependabot updates after a 3-day cooling-off
  period, all checks green, no changes-requested review, and no `on-hold`
  label. Major bumps always wait for a human. (`.github/workflows/
  dependabot-label.yml` + `dependabot-automerge-sweep.yml`, done 2026-08-06)
- [ ] Auto-close stale link-check issues if left open with no new failures for
  N weeks (belt-and-braces on top of the recover-close logic).
- [x] Add a `stale` workflow (actions/stale) to nudge and close abandoned
  issues/PRs politely, with generous timeouts (this is a low-traffic repo).
  (`.github/workflows/stale.yml`, done 2026-08-07)
- [x] Add a labeler workflow that auto-labels PRs touching `data/entries/`
  vs `scripts/` vs `docs/` so triage is faster. (`.github/workflows/labeler.yml`
  + `.github/labeler.yml`, done 2026-08-07)
- [ ] Add an "entry count" badge or shield to the README, generated from a
  small step in CI (keeps the headline number honest as the directory grows).

## CI & quality gates

- [x] Pin all GitHub Actions to commit SHAs (not just major tags) for supply-
  chain safety; let Dependabot bump them. (Done 2026-08-07, all 7 workflows
  pinned — Dependabot already configured to bump github-actions ecosystem.)
- [x] Add a lint step for the YAML entries (e.g. `yamllint`) so formatting
  stays consistent, not just schema-valid. (`.yamllint.yml` + CI step, done
  2026-08-07, non-blocking.)
- [x] Add a spell/style check for `GUIDE.md` and docs (e.g. a lightweight
  vale or codespell pass, non-blocking at first). (`codespell` CI step, done
  2026-08-07, non-blocking.)
- [x] Cache pip dependencies in CI to speed up runs (`actions/setup-python`
  cache key on `requirements.txt`). (`.github/workflows/ci.yml`, `.github/workflows/linkcheck.yml`, done 2026-08-06)
- [x] Run the link check inside the main CI as advisory only (already
  non-blocking) but surface a summary in the job step summary
  (`$GITHUB_STEP_SUMMARY`) so it is visible without opening logs.
  (Done 2026-08-07)
- [x] Auto-close stale link-check issues if left open with no new failures for
  N weeks (belt-and-braces on top of the recover-close logic). (Added nag
  comment after 4 weeks of unresolved dead links, done 2026-08-07)

## Content & knowledge

- [x] Add a "Related directories & further reading" section to the README
  linking verified NZ open-data, tech-for-good, and accessibility resources.
- [ ] Close the people/LinkedIn enrichment gap described in
  [docs/known-gaps.md](known-gaps.md): add `linkedin_people` to entries, one
  verified person at a time, following the people-and-privacy rules.
- [x] Add a short "How entries are chosen" doc explaining the scope boundary
  (what counts as tech-for-good, what is out of scope) so contributors self-
  select before opening an issue. (`docs/how-entries-are-chosen.md`, done
  2026-08-07)
- [x] Add a `CHANGELOG.md` or a dated "recent additions" section so returning
  visitors can see what is new without diffing. (`CHANGELOG.md` added 2026-08-05)
- [ ] Cross-link related entries in the data (an optional `related` field) and
  render those links in `GUIDE.md`, deepening the existing connection diagrams.

## Data quality

- [x] Add a `last_verified` freshness check: a script that flags entries whose
  `last_verified` date is older than, say, 12 months, for re-checking.
  (`scripts/dataquality.py`, done 2026-08-05)
- [x] Add duplicate-URL detection to `validate.py` (two entries pointing at the
  same website often means an accidental duplicate). (done 2026-08-05)
- [x] Add a coverage report: count entries per domain and per region, and flag
  thin domains that need more entries. Surface it in the job summary.
  (`scripts/coverage.py`, done 2026-08-06)
- [x] Normalise region values against a fixed list (schema `enum`) so filtering
  and mapping stay reliable. (93 entries normalised, schema enum with 16
  canonical NZ regions, done 2026-08-07)
- [ ] Backfill `github` and `linkedin_org` fields where missing but publicly
  available, one verified source at a time. (2026-08-07 audit: 162/176 entries
  missing `github`, 126/176 missing `linkedin_org`.)
- [ ] Backfill `founding_year` where discoverable from about pages or official
  sources — 141/176 entries currently missing it.
- [ ] Backfill `takes_contributors` where the org has a public volunteering or
  open-source contribution page — 164/176 entries currently null.
- [ ] Backfill `careers_url` where the org has a careers, jobs, or volunteering
  page — 169/176 entries currently empty.
- [ ] Cross-link entries via `related_to` where real, verifiable connections
  exist (e.g. same network, data dependency, shared founder) — 77/176 entries
  currently have empty `related_to`.

## Community & discoverability

- [x] Set repo topics for discoverability
  (`new-zealand`, `aotearoa`, `civic-tech`, `open-data`, `accessibility`,
  `tech-for-good`, `directory`).
- [ ] **(needs Oli)** Enable GitHub Discussions for questions and suggestions
  that are not yet concrete issues.
- [ ] **(needs Oli)** Turn on branch protection for `main` (require the CI
  check to pass, require a PR) once there is more than one maintainer.
- [ ] **(needs Oli)** Add a social-preview image so shared links look good.
- [ ] Publish `GUIDE.md` as a browsable GitHub Pages site. Non-trivial: needs
  a static-site build step (the guide is a single 70KB+ page) with in-page
  search and per-domain navigation. Scope it as its own change, do not
  half-build it. Options: a minimal Jekyll/MkDocs setup, or a small generator
  that emits one HTML page per domain from the YAML.
- [x] Add a `CODEOWNERS` file so review requests route automatically.
  (`.github/CODEOWNERS`, done 2026-08-07)
- [ ] Add a `.github/FUNDING.yml` if/when there is a funding channel to point
  at (skip until there is a real one, do not invent).
- [x] Add an all-contributors setup to credit everyone who adds or verifies
  entries. (`.all-contributorsrc` + README section, done 2026-08-07)
- [x] Add a short "good first issue" set (e.g. verify N entries, add one
  resource) to lower the barrier for new contributors. (Issues #23, #24,
  #25 created, done 2026-08-07)
- [x] Backfill `github` and `linkedin_org` fields where missing but publicly
  available, one verified source at a time. (9 GitHub orgs backfilled:
  InternetNZ, Enspiral, ActionStation, GeoNet, GovHackNZ, Figure.NZ,
  Summer of Tech, Catalyst IT, Tinkd Makerspace, done 2026-08-07)
- [x] Cross-link entries via `related_to` where real, verifiable connections
  exist (e.g. same network, data dependency, shared founder). (9 new
  cross-links added: ActionStation↔Amnesty, Choices NZ↔Workbridge,
  BenefitMe↔DAC, Headstrong↔SPARX, Figure.NZ↔data.govt.nz,
  Newsroom↔Spinoff, Public Interest↔Newsroom+Spinoff, Hackland↔Tinkd,
  NZDEN↔Workbridge, done 2026-08-07)

## Get involved (research-backed, added 2026-08-06)

This directory currently answers "what exists" well and "what do I do next"
poorly. See `docs/research-get-involved.md` for the comparative research
behind this section (Civic Tech Field Guide, Tech for Good Organisers
Network, Digital Aotearoa Collective, Tech for Good New Zealand, Catchafire)
and why these items exist.

**Data-only, safe for a loop iteration to just do:**

- [x] Add **Tech for Good New Zealand** (meetup.com/tech-for-good-new-zealand,
  Auckland-based, part of the global NetSquared network) as a directory
  entry. Directly answers "where do I find the next event."
- [x] Add **Digital Aotearoa Collective** (digitalaotearoa.github.io/chat,
  active NZ Slack community, own GitHub org) as a directory entry.
- [ ] Research and add any other currently-active NZ tech-for-good meetups,
  Slack/Discord communities, or event series not yet in the directory
  (verify each is genuinely active, not a dead group, before adding).

**Needs a design/product decision before building (do not silently build
these in a loop iteration, bring to Oli first):**

- [x] A "Get involved" page on the site with a small number of clear, low-
  commitment next actions (join a community, find an event, add an entry,
  read the guide for a domain), modeled on Civic Tech Field Guide's four-
  entry-point homepage pattern, not a wall of links. (`site/src/pages/
  get-involved.astro`, done 2026-08-07)
- [x] Short "what is this and why does it matter" explainer text for each
  domain (e.g. what "food-rescue / food-security tech" covers and why it's
  its own category), shown on each domain page. (
  `data/domain-descriptions.yaml` — all 27 domains have descriptions,
  done 2026-08-07)
- [x] Consider new optional schema fields for a `community_url` (Slack/
  Discord invite) and `events_url` (meetup/events page), separate from
  `website`. (Already added to `schema/entry.schema.json`,
  `data/entry.template.yaml`, and all scripts/pages — fields exist and
  are rendered on entry detail pages, done 2026-08-07)
- [x] A prominent "Add an entry" call to action on the directory/homepage
  (not just a CONTRIBUTING.md link), pointing at the existing
  add-entry issue form. (Present on index.astro, directory.astro, and
  get-involved.astro, done 2026-08-07)
- [ ] Consider whether this project should have its own social presence
  (a place to follow for new entries). **(needs Oli)** this means
  creating and owning an account, not something to invent.

---

## Recently shipped

- Weekly link-check workflow (`.github/workflows/linkcheck.yml`).
- Dependabot config + `requirements.txt` (CI now installs from it).
- README "Related directories & further reading" section (8 verified links).
- Repo topics set for discoverability.
- 20 new entries across 6 domains: financial inclusion (+3), disability
  employment (+3), housing (+4), health tech (+3), mental health (+4),
  journalism (+2), plus IndigiShare in iwi/Māori tech (+1). Total: 117→170
  entries, 27 domains. (2026-08-07)
- 6 more entries across civic-tech and digital-inclusion: Lobby for Good,
  FYI.org.nz, Trust Democracy, Digital Equity Coalition Aotearoa, Community IT,
  Tu Mai Digital. Total: 170→176 entries. (2026-08-07)
- Optional-field audit added to Data quality roadmap: 162 entries missing
  `github`, 126 missing `linkedin_org`, 141 missing `founding_year`, 164
  missing `takes_contributors`, 169 missing `careers_url`, 77 missing
  `related_to`. (2026-08-07)
- All GitHub Actions pinned to commit SHAs across 7 workflows; stale workflow
  added (`.github/workflows/stale.yml`); labeler workflow added
  (`.github/workflows/labeler.yml` + `.github/labeler.yml`); CODEOWNERS file
  added; yamllint and codespell added to CI (both non-blocking). (2026-08-07)
