# Deployment

Git-triggered deploys are disabled (`vercel.json` → `git.deploymentEnabled:
false`). Vercel builds nothing on pushes or PRs, so no Vercel checks appear
on pull requests.

## Deploy manually

```sh
cd apps/web
vercel --prod
```

Needs Vercel CLI auth. This is the only way to ship.

## Why

The repo gets many Dependabot PRs; Vercel preview builds on every one of
them burned the free-tier build allowance and added noisy CI checks. Git
integration also auto-deployed on every push to `main`. Disabling
git-triggered deploys makes shipping deliberate and cheap.
