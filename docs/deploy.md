# Deployment

Production runs on Vercel's Git integration and deploys **only** from the
`production` branch. Pushes to `main` run CI but never deploy.

## Flow

1. Merge / push to `main` — CI runs, no deploy.
2. To ship: merge `main` into `production`. Vercel deploys.

```sh
git checkout production
git merge main
git push origin production
```

## Why

Vercel deploys every push to its configured production branch. With `main`
as the production branch, every push to `main` shipped instantly. Pointing
the production branch at `production` makes deploys deliberate: CI proves
`main` is healthy, then a human merges to `production` to ship.

PR previews still work — Vercel deploys every pull request.

## One-time setup (Vercel dashboard)

Vercel project → Settings → Git → Production Branch: change `main` →
`production`.

## Alternative: CLI deploy

```sh
cd apps/web
vercel --prod
```

Deploys directly without touching any branch.

## Deploy budget

Vercel free tier counts every build, production and preview. Levers, biggest
first:

1. **Auto-cancel same-branch builds** — already on (`vercel.json`
   `github.autoJobCancelation: true`). A new commit cancels queued and
   in-progress deploys for that branch.
2. **Skip previews for Dependabot PRs** (Vercel dashboard): Settings → Git →
   Deploy Previews → "Only specific branches", allowlist `main`,
   `production`, `dev`. Dependabot PRs merge automatically anyway, so their
   preview builds are wasted.
3. **Fewer concurrent Dependabot PRs** — `open-pull-requests-limit` in
   `.github/dependabot.yml` caps open update PRs at once.
4. **No git-triggered deploys at all** (last resort): set
   `"git": { "deploymentEnabled": false }` in `vercel.json` and deploy only
   via `vercel --prod` or a workflow with a Vercel token. Kills PR previews.
