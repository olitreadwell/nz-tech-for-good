# Postmortem: Vercel deploy failure — 2026-08-07

## Timeline

| Time | Event |
|------|-------|
| ~00:30 | Created vercel.json at repo root, pushed |
| ~00:35 | Vercel deploy failed — unknown error (did not check logs) |
| ~00:38 | Hypothesised root dir issue — moved vercel.json into apps/web/ |
| ~00:40 | Deploy still failing — still guessing, still not checking Vercel logs |
| ~01:00 | Asked user what the actual error was — user unable to see logs |
| ~01:10 | Set up CI + pre-push hooks to prevent future blind pushes |

## What happened

Vercel deploy failed after pushing the Next.js monorepo. Error was never
diagnosed because build logs were not checked before attempting fixes.

## Root cause

1. **No pre-push gate.** Build + tests were not run locally before pushing.
   A failing build was pushed 3 times without local verification.

2. **Did not read error logs.** Instead of checking the Vercel dashboard for
   the actual build failure message, we guessed (wrong root directory?) and
   made config changes blindly.

3. **Turbo.json had invalid `schema` key** that broke `turbo build`.

## Impact

- 3 failed deploys
- ~30 minutes of debugging time wasted on guesswork
- vercel.json moved between root and apps/web/ unnecessarily

## Resolution

Still pending — the actual Vercel error has not been read. Next step:
open Vercel dashboard → Deployments → click failed build → read logs.

Known fixes applied proactively:
- Removed invalid `schema` key from turbo.json
- Added `.husky/pre-push` hook running `npm run prepush`
- Created CI workflow (format, lint, type-check, test, build)

## Prevention

1. **Pre-push hook** — `npm run prepush` blocks pushes that fail local build
2. **CI gate** — `.github/workflows/ci.yml` catches the same on PRs
3. **Incident response checklist**:
   1. Read the error logs FIRST
   2. Reproduce locally
   3. Form hypothesis based on evidence, not guesswork
   4. Fix ONE thing at a time
   5. Verify before pushing again

## Action items

- [ ] Check Vercel dashboard for actual build error
- [ ] Fix the root cause identified in logs
- [ ] Verify deploy succeeds
- [ ] Enable Vercel deploy status badge in README
