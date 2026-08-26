# AGENTS.md

Instructions for AI coding agents working in this repo. Read this before
editing anything.

## Where the rules live

- `docs/contributing/` is the shared contributing standard for every change:
  principles, workflow, quality, testing, git, security, documentation,
  verification. Read `docs/contributing/00-index.md` first.
- This file and `CLAUDE.md` hold stack-specific rules. Where they conflict
  with the generic guide, the stack-specific rules win.
- `docs/style-guide.md` and `docs/llm-agent-optimization.md` are the writing
  rules that make this repo navigable by humans and agents alike.

## What this is

A starter template. Everything in it exists so a new repo can be scaffolded
with a production-quality baseline already wired: tests, coverage, lint,
format, typecheck, build, smoke, e2e, CI, Docker, docs.

## Non-negotiables

- The one-command contract is `pnpm run check` = format:check + lint +
  typecheck + test:coverage + build + smoke + e2e + check:links. CI mirrors
  it exactly. A green CI must mean the same as a green local `check`.
- Run `pnpm run check` before and after every change.
- Pin exact dependency versions. No `^` or `~` ranges.
- No dead code, no commented-out code, no unused dependencies.
- Every exported symbol has a JSDoc comment good enough for IDE hover/peek:
  params and return value where useful.
- Comments explain WHY and HOW, never WHAT the code obviously does.
- Tests prove every behavior change; run them, do not eyeball.
- Input validation at the boundary (zod), structured logs (pino),
  centralized error handling (src/lib/errors.ts).
- Every internal markdown link must resolve; `npm run check:links` enforces it.

## Contact, feedback, and help

- `docs/contact.md` documents the contact/feedback contract: endpoints,
  proof-of-work spec, abuse protection, and how agents file issues.
- Pages: `/help`, `/contact`, `/feedback`; APIs: `/api/challenge`,
  `/api/contact`, `/api/feedback`; contract: `/.well-known/feedback.json`.
- Feedback creates labelled GitHub issues (`bug`, `enhancement`, `question`)
  when `GH_TOKEN` + `GH_REPO` are set; without them the form explains where
  to go instead.

## Naming and discoverability

## UI conventions (Radix-first)

- Prefer Radix UI primitives (`@radix-ui/react-*`, wrapped in
  `src/components/ui/`) over hand-rolled equivalents for label, select,
  dialog, accordion, and tooltip. They ship keyboard navigation, focus
  management, and ARIA attributes for free.
- Only hand-roll a component when Radix has no primitive for it (native
  inputs/textarea) — keep those in `src/components/ui` so every form shares
  one style.
- Radix Select is not a native form control: keep a hidden
  `<input type="hidden" name=... value=...>` in the form so values submit.
- Add new UI wrappers to `src/components/ui/` with a doc comment on each
  export; never fork a page-local copy of a shared style.

- 2-3 word, domain-prefixed export names (`getUserProfileById`, not `get`).
- One spelling per concept, everywhere.
- No `any` / untyped escape hatches.
- Test files sit next to their source (`logger.test.ts` tests `logger.ts`).

## Workflow

1. Read `docs/contributing/00-index.md`, then this file, `CLAUDE.md`,
   `docs/engineering.md`, `docs/style-guide.md`.
2. Make the smallest change that does the job.
3. Update docs in the same change as the behavior they describe.
4. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `ci:`, ...).
5. Run `pnpm run check`. Fix failures. Repeat until green.

## Branch policy

- Feature work happens on short-lived branches; PRs merge into `development`.
- `development` -> `main` is the single integration PR, kept up to date.
- After merge, feature branches are deleted.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
