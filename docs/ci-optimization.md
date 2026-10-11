# CI/CD cost & speed optimization

How this template keeps CI minutes, storage, and egress low — and how to
keep it that way as a project grows. Strategies are platform-agnostic; the
snippets here are the GitHub Actions form used by this repo.

## What is already wired

1. **Conditional triggers (path and branch awareness)** — `.github/workflows/ci.yml`,
   `quality.yml`, and `docker.yml` skip pushes that touch only `docs/**` and
   markdown. All four push-triggered workflows (`ci`, `security`, `quality`,
   `docker`) are also limited to long-lived branches (`main`, `master`, `dev`,
   `development`). Bot branches push to the repo on every new revision, so
   without the branch filter each dependabot or renovate commit paid for both a
   push run and a pull-request run of the same jobs. The PR is the quality
   gate, so nothing is lost.
2. **Fail-fast ordering** — the `check` job runs cheap gates first
   (format → lint → typecheck), then coverage → build → smoke; `e2e`
   waits for `check`. A broken format fails in ~10s, not after a build.
3. **Concurrency cancellation** — every workflow has a
   `concurrency: { group: <name>-${{ github.ref }}, cancel-in-progress: true }`
   block, so a new push to the same branch kills the in-flight run.
4. **Skip token** — a `preflight` job skips the whole run when the commit
   message or PR title contains `[skip ci]` or `[ci skip]`.
5. **Dependency caching** — every `actions/setup-node` step passes a `cache`
   value chosen from the lockfile that is actually present
   (`hashFiles('pnpm-lock.yaml') != '' && 'pnpm' || ...`), so npm-managed repos
   cache too and repos with neither lockfile skip caching instead of failing.
   `pnpm install --frozen-lockfile` is used everywhere (CI, Docker, local) so
   installs are reproducible and warm. This was documented as wired long before
   it was: the `cache` input was missing from all four setup steps, which cost
   the install phase on every job.
6. **Docker layer caching** — `docker.yml` builds with
   `--cache-from=type=gha --cache-to=type=gha,mode=max`; the Dockerfile
   copies `package.json` + `pnpm-lock.yaml` before `pnpm install`, so the
   dependency layer only rebuilds when the lockfile changes.
7. **Test splitting** — Playwright e2e runs on a 2-shard matrix
   (`--shard=1/2`, `--shard=2/2`), cutting e2e wall time roughly in half.
   The unit suite stays single-run because it is fast and coverage is
   computed from one pass.
8. **Artifact retention** — `playwright-report` uploads expire after 3
   days; nothing else is stored. Docker images are built and tested, not
   pushed to a registry, so there is no image-bloat cost.
9. **Left-shifted checks** — `pre-commit` runs lint + typecheck + tests in
   parallel; `pre-push` runs the full `check` plus a blocking
   `pnpm audit --audit-level=high`. CI runs the exact same contract.
10. **Scheduled jobs** — the only cron is the weekly template sync
    (Monday 03:00 UTC). Dependabot handles dependency updates as PRs, not
    nightly scans. There are no staging/preview environments; the Docker
    job is a throwaway container with a healthcheck.

11. **Dependabot auto-merge (low-risk bumps)** — `.github/dependabot.yml`
    targets `development`; the `dependabot-auto-merge.yml` workflow approves
    and auto-merges patch/minor PRs once the required checks pass (`Check
    (mirrors npm run check)` + both e2e shards). Major bumps stay open for
    a human. Branch protection on `development` enforces those checks for
    PR merges.

## The one-minute floor per job

GitHub bills a whole minute per job, rounded up. A job that runs for eight
seconds costs the same as a job that runs for fifty-nine. That makes **job
count**, not job duration, the dominant cost driver in a repo whose checks are
fast:

- Splitting the three lint checks (`actionlint`, `yamllint`, `codespell`) into
  three jobs cost three billed minutes per CI run. They share one `meta-lint`
  job now.
- The dependency audit ran in both `ci.yml` and `security.yml`. It only runs in
  `security.yml` now, alongside the committed-secrets scan in one job.
- `dependabot-auto-merge.yml` re-ran on `edited`, `labeled`, and `unlabeled`,
  and dependabot labels its own PRs on open, so a single PR triggered it three
  or four times. Only `opened`, `synchronize`, `reopened`, and
  `ready_for_review` trigger it now, and a newer event cancels a queued one.
- `code-review.yml` re-ran the whole LLM review on every push to a PR. It now
  runs on `opened`, `reopened`, and `ready_for_review` only.

Before adding a job, ask whether it can be a step in an existing job. Add a job
only when the parallelism buys something (a shard matrix, or a gate that must
start before another job finishes).

## When the account is billing-blocked

Jobs that never get a runner still show up in the UI with a start and end time,
because GitHub stamps them with their queue window and then fails them. They
read as hour-long failures but bill nothing. The tell is in the check
annotation:

```
The job was not started because recent account payments have failed or your
spending limit needs to be increased.
```

They still hold a queue slot and make the Actions tab unreadable, so treat them
as a signal to fix billing or to disable the workflow, not as a code failure.

## Scaling rules of thumb (apply as you grow)

- Add a remote build cache (Turborepo/Nx/Bazel) when builds exceed ~5 min
  or the monorepo has >3 packages — unchanged packages then skip
  compilation entirely.
- Keep the test matrix Linux-only unless telemetry shows otherwise;
  spread files with `--shard` before adding OS variants.
- Push container images only when you actually deploy them, and prune
  untagged tags (keep latest 5 per major) in the registry lifecycle rules.
- Preview environments: spot instances, auto-scale, hard TTL of 4–6 hours,
  destroyed on PR close.

## Realistic savings (typical Next.js template usage)

- CI runner minutes: **30–50%** (path-skipped pushes, cancelled
  superseded runs, sharded e2e, cached installs).
- Storage: **~80%** of artifact GB-months (3-day retention vs 90-day).
- Docker build time: **50–70%** after the first run (layer cache hits).
- Overall infrastructure spend: **20–40%** once preview/registry
  lifecycle rules are applied at scale.

Numbers assume a single-dev repo on hosted runners; savings compound with
more pushes per day.

## The gate is the local run

GitHub Actions is not the merge gate for these repos. The gate is
`npm run check:ci`, which runs the same checks on the machine that is about to
merge or push.

| CI job | local equivalent |
| --- | --- |
| Check | `npm run check` (format, lint, typecheck, coverage, build, smoke, e2e, links) |
| Dependency audit | `pnpm audit --audit-level=high` (advisory, as in CI) |
| Committed secrets scan | `bash scripts/security-checks.sh` |
| Workflow lint | `actionlint` |
| YAML lint | `yamllint -c .yamllint.yml .github/ .yamllint.yml` |
| Spell check | `codespell` |
| E2E shards | `npx playwright test` (shards exist to fit runner time limits, not to be complete) |
| Docker | `docker build -t local-ci-check .` (`--docker`) |
| Quality Gates | `pnpm dlx @lhci/cli@0.15.0 autorun` (`--lighthouse`) |

Why:

- The private repos in this family cannot run Actions at all while the account
  has a billing block. Their workflows are disabled on purpose, so a missing
  check on those repos is expected rather than a failure.
- The public repos do run Actions, but runs queue behind other pushes. A red or
  pending check can belong to a commit that is not the one being merged.

How to run it:

```bash
bash scripts/local-ci.sh                        # full gate
bash scripts/local-ci.sh --fast                 # the pre-push subset
bash scripts/local-ci.sh --docker --lighthouse  # optional extras
npm run check:ci                                # same as the first line
```

`codespell`, `yamllint`, `actionlint`, and `docker` are optional. The script
reports them as skipped when they are not installed, and the dependency audit
is advisory, matching CI. Everything else must pass.

The pre-commit hook runs `check:fast` and the pre-push hook runs `check:fast`
plus the dependency audit. Those are convenience gates, not the full gate. Run
the full gate before merging, and merge with `gh pr merge` once it passes. A
push never needs a green check to go through; nothing in these repos requires
one.
