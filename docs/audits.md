# Audit gates

Every pull request and push runs the gates below. Anything marked **blocking** must pass before merge. test gate mirrors them so a green local `pnpm run check` is a green test gate.

## Code review

- `alibaba/open-code-review` (`.github/workflows/code-review.yml`) reviews every pull request: deterministic rule checks always run, and it adds a model-assisted pass when the `LLM_API_KEY` / `LLM_MODEL` / `LLM_BASE_URL` secrets are configured (OpenAI- or Anthropic-compatible endpoints).
- Clean-code is enforced locally by ESLint (incl. `jsx-a11y`, jsdoc coverage on domain exports) + Prettier + strict `tsc`, all part of `pnpm run check`.

## Accessibility

- Automated: axe (Web Content Accessibility Guidelines 2.2 levels A and AA, plus best practice) on every route in `e2e/a11y.spec.ts`, plus `vitest-axe` in component tests.
- Manual AAA checklist: `docs/a11y.md`, required before release.

## Security

- `pnpm audit --audit-level=high` blocks on high/critical advisories (`.github/workflows/security.yml`).
- Committed-secret scan via `scripts/security-checks.sh`.
- Baseline security headers on every response (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HTTP Strict Transport Security, and a Content Security Policy. `/docs` (Swagger interface) gets a looser Content Security Policy that allows unpkg. The nonce-based strict Content Security Policy in the Next.js docs is the upgrade path if pages move to dynamic rendering.

## Standards coverage

- Progressive web app: `public/manifest.webmanifest` (linked from the root layout) plus a minimal service worker (`public/sw.js`) registered only in production (`src/components/providers/service-worker-register.tsx`). The worker is network-first for navigations, cache-first for same-origin static assets, and never caches `/api/*`.
- Language-model discoverability: `public/llms.txt` describes the site for automated crawlers, with relative links so it stays correct in every scaffolded repo.
- Internationalization: the site is English-only. `hreflang` (`en` and `x-default`) is declared in the root layout so crawlers know there is no localized variant. Locale routing (e.g. next-intl) is a deliberate non-goal for the template. Add it per-app when a second language lands.
- Theme tokens: `--default-transition-*` are registered with `@property` in `globals.css` so the browser treats them as typed, animatable values and the cascade stays deterministic when the theme class flips after load.

## Performance

- Lighthouse test gate (`.github/workflows/quality.yml`) runs against the built app with budgets in `lighthouserc.cjs`: a11y/best-practices ≥ 0.95, performance and search engine optimisation ≥ 0.90, First Contentful Paint ≤ 2000ms, Largest Contentful Paint ≤ 2500ms, Total Blocking Time ≤ 200ms, and Cumulative Layout Shift ≤ 0.1.
- `content-visibility: auto` on `main` (with `contain-intrinsic-size`) skips rendering off-screen content. The docs page preconnects to unpkg for Swagger interface assets.
- Image guidance for apps scaffolded from the template: use `fetchPriority="high"` on the Largest Contentful Paint image, `loading="lazy"` + `decoding="async"` on below-fold images, and `srcSet`/`sizes` for responsive images. The template ships no images, so there is nothing to annotate yet.

## Local equivalents

- `pnpm test:a11y`: axe route audit only.
- `pnpm run perf`: runs Lighthouse via `pnpm dlx @lhci/cli` (no persistent dependency. The test gate action bundles its own Lighthouse continuous integration tool).
- `pnpm run check`: everything else.
