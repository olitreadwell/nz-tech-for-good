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
- [x] Add Dependabot for the `github-actions` and `pip` ecosystems.
  (`.github/dependabot.yml` + `requirements.txt`)
- [ ] Auto-close stale link-check issues if left open with no new failures for
  N weeks (belt-and-braces on top of the recover-close logic).
- [ ] Add a `stale` workflow (actions/stale) to nudge and close abandoned
  issues/PRs politely, with generous timeouts (this is a low-traffic repo).
- [ ] Add a labeler workflow that auto-labels PRs touching `data/entries/`
  vs `scripts/` vs `docs/` so triage is faster.
- [ ] Add an "entry count" badge or shield to the README, generated from a
  small step in CI (keeps the headline number honest as the directory grows).

## CI & quality gates

- [ ] Pin all GitHub Actions to commit SHAs (not just major tags) for supply-
  chain safety; let Dependabot bump them. (Currently pinned to `@v4`/`@v5`.)
- [ ] Add a lint step for the YAML entries (e.g. `yamllint`) so formatting
  stays consistent, not just schema-valid.
- [ ] Add a spell/style check for `GUIDE.md` and docs (e.g. a lightweight
  vale or codespell pass, non-blocking at first).
- [x] Cache pip dependencies in CI to speed up runs (`actions/setup-python`
  cache key on `requirements.txt`). (`.github/workflows/ci.yml`, `.github/workflows/linkcheck.yml`, done 2026-08-06)
- [ ] Run the link check inside the main CI as advisory only (already
  non-blocking) but surface a summary in the job step summary
  (`$GITHUB_STEP_SUMMARY`) so it is visible without opening logs.

## Content & knowledge

- [x] Add a "Related directories & further reading" section to the README
  linking verified NZ open-data, tech-for-good, and accessibility resources.
- [ ] Close the people/LinkedIn enrichment gap described in
  [docs/known-gaps.md](known-gaps.md): add `linkedin_people` to entries, one
  verified person at a time, following the people-and-privacy rules.
- [ ] Add a short "How entries are chosen" doc explaining the scope boundary
  (what counts as tech-for-good, what is out of scope) so contributors self-
  select before opening an issue.
- [ ] Add a `CHANGELOG.md` or a dated "recent additions" section so returning
  visitors can see what is new without diffing.
- [ ] Cross-link related entries in the data (an optional `related` field) and
  render those links in `GUIDE.md`, deepening the existing connection diagrams.

## Data quality

- [ ] Add a `last_verified` freshness check: a script that flags entries whose
  `last_verified` date is older than, say, 12 months, for re-checking.
- [ ] Add duplicate-URL detection to `validate.py` (two entries pointing at the
  same website often means an accidental duplicate).
- [ ] Add a coverage report: count entries per domain and per region, and flag
  thin domains that need more entries. Surface it in the job summary.
- [ ] Normalise region values against a fixed list (schema `enum`) so filtering
  and mapping stay reliable.
- [ ] Backfill `github` and `linkedin_org` fields where missing but publicly
  available, one verified source at a time.

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
- [ ] Add a `CODEOWNERS` file so review requests route automatically.
- [ ] Add a `.github/FUNDING.yml` if/when there is a funding channel to point
  at (skip until there is a real one, do not invent).
- [ ] Add an all-contributors setup to credit everyone who adds or verifies
  entries.
- [ ] Add a short "good first issue" set (e.g. verify N entries, add one
  resource) to lower the barrier for new contributors.

---

## Recently shipped

- Weekly link-check workflow (`.github/workflows/linkcheck.yml`).
- Dependabot config + `requirements.txt` (CI now installs from it).
- README "Related directories & further reading" section (8 verified links).
- Repo topics set for discoverability.
