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

## Performance

- Lighthouse CI (`.github/workflows/quality.yml`) runs against the built
  app with budgets in `lighthouserc.cjs`: a11y/best-practices ≥ 0.95,
  perf/SEO ≥ 0.90, FCP ≤ 2000ms, LCP ≤ 2500ms, TBT ≤ 200ms, CLS ≤ 0.1.

## Local equivalents

- `pnpm test:a11y` — axe route audit only.
- `pnpm run perf` — runs Lighthouse via `pnpm dlx @lhci/cli` (no persistent
  dependency; the CI action bundles its own LHCI).
- `pnpm run check` — everything else.
