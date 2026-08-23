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
