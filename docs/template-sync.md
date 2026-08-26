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
- `merge` — `package.json`: union of `scripts`, `dependencies`, and
  `devDependencies`, local values winning on conflict.
- Everything else (`src/**`, `app/**`, `README.md`, tests) is left alone.

## Run it

```bash
node scripts/sync-from-template.mjs            # dry-run: what would change
node scripts/sync-from-template.mjs --apply    # write + commit on chore/template-sync
node scripts/sync-from-template.mjs --apply --push  # + push + open a PR
node scripts/sync-from-template.mjs --repo ../my-repo --apply --push
```

`TEMPLATE_URL` env var overrides the template remote.

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
