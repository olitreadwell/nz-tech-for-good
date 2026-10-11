# Audit gates

Every PR and push runs the gates below. Anything marked **blocking** must
pass before merge; CI mirrors them so a green local `pnpm run check` is a
green CI.

## Code review

- `alibaba/open-code-review` (`.github/workflows/code-review.yml`) reviews
  every PR: deterministic rule checks always run, and it adds an
  LLM-assisted pass when the `LLM_API_KEY` / `LLM_MODEL` / `LLM_BASE_URL`
  secrets are configured (OpenAI- or Anthropic-compatible endpoints).
- Clean-code is enforced locally by ESLint (incl. `jsx-a11y`, jsdoc
  coverage on domain exports) + Prettier + strict `tsc`, all part of
  `pnpm run check`.

## Accessibility

- Automated: axe (WCAG 2.2 A/AA + best practice) on every route in
  `e2e/a11y.spec.ts`, plus `vitest-axe` in component tests.
- Manual AAA checklist: `docs/a11y.md` — required before release.

## Security

- `pnpm audit --audit-level=high` blocks on high/critical advisories
  (`.github/workflows/security.yml`).
- Committed-secret scan via `scripts/security-checks.sh`.
- Baseline security headers on every response (`next.config.ts`):
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS, and a Content Security
  Policy. `/docs` (Swagger UI) gets a looser CSP that allows unpkg.
  The nonce-based strict CSP in the Next.js docs is the upgrade path if
  pages move to dynamic rendering.

## Standards coverage

- PWA: `public/manifest.webmanifest` (linked from the root layout) plus a
  minimal service worker (`public/sw.js`) registered only in production
  (`src/components/providers/service-worker-register.tsx`). The worker is
  network-first for navigations, cache-first for same-origin static
  assets, and never caches `/api/*`.
- LLM discoverability: `public/llms.txt` describes the site for AI
  crawlers, with relative links so it stays correct in every scaffolded
  repo.
- Internationalization: the site is English-only. `hreflang` (`en` and
  `x-default`) is declared in the root layout so crawlers know there is no
  localized variant. Locale routing (e.g. next-intl) is a deliberate
  non-goal for the template; add it per-app when a second language lands.
- Theme tokens: `--default-transition-*` are registered with `@property`
  in `globals.css` so the browser treats them as typed, animatable
  values and the cascade stays deterministic when the theme class flips
  after load.

## Performance

- Lighthouse CI (`.github/workflows/quality.yml`) runs against the built
  app with budgets in `lighthouserc.cjs`: a11y/best-practices ≥ 0.95,
  perf/SEO ≥ 0.90, FCP ≤ 2000ms, LCP ≤ 2500ms, TBT ≤ 200ms, CLS ≤ 0.1.
- `content-visibility: auto` on `main` (with `contain-intrinsic-size`)
  skips rendering off-screen content; the docs page preconnects to unpkg
  for Swagger UI assets.
- Image guidance for apps scaffolded from the template: use
  `fetchPriority="high"` on the LCP image, `loading="lazy"` +
  `decoding="async"` on below-fold images, and `srcSet`/`sizes` for
  responsive images. The template ships no images, so there is nothing to
  annotate yet.

## Local equivalents

- `pnpm test:a11y` — axe route audit only.
- `pnpm run perf` — runs Lighthouse via `pnpm dlx @lhci/cli` (no persistent
  dependency; the CI action bundles its own LHCI).
- `pnpm run check` — everything else.
