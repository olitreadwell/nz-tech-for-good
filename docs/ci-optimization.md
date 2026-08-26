# CI/CD cost & speed optimization

How this template keeps CI minutes, storage, and egress low — and how to
keep it that way as a project grows. Strategies are platform-agnostic; the
snippets here are the GitHub Actions form used by this repo.

## What is already wired

1. **Conditional triggers (path awareness)** — `.github/workflows/ci.yml`
   and `quality.yml` skip pushes that touch only `docs/**` and markdown.
   The PR is the quality gate, so nothing is lost.
2. **Fail-fast ordering** — the `check` job runs cheap gates first
   (format → lint → typecheck), then coverage → build → smoke; `e2e`
   waits for `check`. A broken format fails in ~10s, not after a build.
3. **Concurrency cancellation** — every workflow has a
   `concurrency: { group: <name>-${{ github.ref }}, cancel-in-progress: true }`
   block, so a new push to the same branch kills the in-flight run.
4. **Skip token** — a `preflight` job skips the whole run when the commit
   message or PR title contains `[skip ci]` or `[ci skip]`.
5. **Dependency caching** — `actions/setup-node` with `cache: 'pnpm'`
   keys on the lockfile checksum; `pnpm install --frozen-lockfile` is used
   everywhere (CI, Docker, local) so installs are reproducible and warm.
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
