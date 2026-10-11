# Keeping projects in sync with the template

`scripts/sync-from-template.mjs` pulls template-owned files into a project
so the quality gates and docs never drift. It never touches app code.

## What syncs

Policies live in `template-manifest.json` (in the template repo, so they can
evolve with the template):

- `copy` — replaced verbatim: lint/format/CI configs, a11y + audit docs,
  issue templates, security checks.
- `copyIfAbsent` — added only when missing: `AGENTS.md`, `CLAUDE.md`,
  `.nvmrc`, `.env.example`, contact/FAQ docs, the weekly sync workflow.
- `merge` — `package.json`: union of `scripts` only, local values winning on
  conflict. `dependencies` and `devDependencies` always stay local: the
  template's app deps (Radix, next, nodemailer, …) and tooling majors (vitest,
  playwright, …) are opt-in per repo, never forced by a sync. A sync must
  never break `npm install`.
- Everything else (`src/**`, `app/**`, `README.md`, tests) is left alone.

### Conditions, so a repo only gets what it needs

Any entry can carry an `if` value, matched against the repo being synced. A
bare name is a glob against the repo root (`package.json`, `next.config.*`). A
value containing a slash is a path relative to the repo root, so
`.github/dependabot.yml` and `.github/workflows/*.yml` both work.

Two shapes are worth knowing:

- **Capability gate** — `.github/workflows/docker.yml` with
  `"if": "Dockerfile"` and `.github/workflows/ci.yml` with
  `"if": "next.config.*"` only reach repos where the file makes sense.
- **Opt-in gate** — a path whose own presence is its condition. The dependabot
  workflows and `.github/dependabot.yml` all carry
  `"if": ".github/dependabot.yml"`, which reads as "update this only in repos
  that already run a dependency bot". It never adds a bot to a repo that does
  not have one, and it keeps the schedule in those repos following the
  template instead of drifting.

## Run it

```bash
node scripts/sync-from-template.mjs            # dry-run: what would change
node scripts/sync-from-template.mjs --apply    # write + commit on chore/template-sync
node scripts/sync-from-template.mjs --apply --push  # + push + open a PR
node scripts/sync-from-template.mjs --repo ../my-repo --apply --push
```

`TEMPLATE_URL` env var overrides the template remote.

`scripts/sync-template-fanout.sh` runs the sync across every private repo that
carries it: dry run by default, `--apply` to commit, push and open one PR per
repo, `--repo <name>` for a single repo. It pushes the template's own sync
script into each clone first, so a repo whose copy predates a manifest feature
does not evaluate the new conditions with the old logic. `TEMPLATE_REF` points
it at a template branch that has not merged yet.

Add `--drop-renovate` to that command and each PR also removes `renovate.json`
(or `.github/renovate.json`) from any repo that has, or is about to get, a
`.github/dependabot.yml`. One bot per repo is the policy: Dependabot is built
into GitHub and the auto-merge workflow is already keyed to `dependabot[bot]`,
so Renovate is the one that goes. Where Renovate was the only bot, the same PR
adds the template's Dependabot config, so a repo is never left without updates.
The core-runtime packages that Renovate held for manual review (`react`, `next`,
`typescript`, `three` and friends) are now held by
`scripts/dependabot-auto-merge.mjs` instead.

## Automated weekly sync

`.github/workflows/template-sync.yml` runs weekly (Monday 03:00 UTC) and on
demand (`workflow_dispatch`). It opens a PR named "chore: sync template
files" when anything changed. To let the workflow clone the (private)
template, add a PAT with repo read access as `TEMPLATE_SYNC_TOKEN`; without
it the workflow uses `GITHUB_TOKEN` and only works for public templates.

## Adopting on an existing repo

1. `gh repo clone <repo>` and run the dry-run above.
2. Run with `--apply --push` — this adds the sync script, manifest,
   workflow, and configs, and opens the first PR.
3. After merge, the repo is on the weekly cadence.

Run `pnpm install` after a merge that touched `package.json` (the PR
includes `pnpm-lock.yaml` updates only if the lockfile policy allows it —
regenerate locally and commit when required).
