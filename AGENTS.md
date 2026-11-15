# agents.md

<!-- coding-standards:begin -->
Project coding rules are in `CODING_STANDARDS.md`. The global baseline is `~/.agents/standards/CODING_STANDARDS.md`. Read both before you change behavior.
<!-- coding-standards:end -->


Notes for automated coding agents in this repo. Read this before you edit anything.

## Where the rules live

- `docs/contributing/` is the shared contributing standard for every change: principles, workflow, quality, testing, git, security, documentation, verification. Read `docs/contributing/00-index.md` first.
- This file and `CLAUDE.md` hold stack-specific rules. Where they conflict with the generic guide, the stack-specific rules win.
- `docs/style-guide.md` and `docs/llm-agent-optimization.md` are the writing rules that make this repo navigable by humans and agents alike.

## What this is

A starter template. It gives a new repo a strong base from the start. The base covers tests, coverage, lint, format, typecheck, build, smoke, e2e, test gate, Docker, and docs.

## Non-negotiables

- The one-command contract is `pnpm run check` = format:check + lint + typecheck + test:coverage + build + smoke + e2e + check:links. test gate mirrors it exactly. A green test gate must mean the same as a green local `check`.
- Run `pnpm run check` before and after every change.
- Pin exact dependency versions. No `^` or `~` ranges.
- No dead code, no commented-out code, no unused dependencies.
- Every exported symbol has a JSDoc comment good enough for editor hover and peek: params and return value where useful.
- Comments explain why and how, never what the code obviously does.
- Tests prove every behavior change. Run them, do not eyeball.
- Input validation at the boundary (zod), structured logs (pino), centralized error handling (src/lib/errors.ts).
- Every internal markdown link must resolve.`npm run check:links` enforces it.

## Contact, feedback, and help

- `docs/contact.md` documents the contact/feedback contract: endpoints, proof-of-work spec, abuse protection, and how agents file issues.
- Pages: `/help`, `/contact`, `/feedback`. APIs: `/api/challenge`, `/api/contact`, `/api/feedback`. Contract: `/.well-known/feedback.json`.
- Feedback creates labelled GitHub issues (`bug`, `enhancement`, `question`) when `GH_TOKEN` + `GH_REPO` are set. Without them the form explains where to go instead.

## Naming and discoverability

## Interface conventions (Radix-first)

- Prefer Radix interface components (`@radix-ui/react-*`, wrapped in `src/components/ui/`) over hand-rolled equivalents for label, select, dialog, accordion, and tooltip. They ship keyboard navigation, focus management, and accessibility attributes for free.
- Only hand-roll a component when Radix has no primitive for it (native inputs/textarea): keep those in `src/components/ui` so every form shares one style.
- Radix Select is not a native form control: keep a hidden `<input type="hidden" name=... value=...>` in the form so values submit.
- Add new interface wrappers to `src/components/ui/` with a doc comment on each export. Never fork a page-local copy of a shared style.

- 2-3 word, domain-prefixed export names (`getUserProfileById`, not `get`).
- One spelling per concept, everywhere.
- No `any` / untyped escape hatches.
- Test files sit next to their source (`logger.test.ts` tests `logger.ts`).

## Workflow

1. Read `docs/contributing/00-index.md`, then this file, `CLAUDE.md`, `docs/engineering.md`, `docs/style-guide.md`.
2. Make the smallest change that does the job.
3. Update docs in the same change as the behavior they describe.
4. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `ci:`, ...).
5. Run `pnpm run check`. Fix failures. Repeat until green.

## Branch policy

- Feature work happens on short-lived branches. pull requests merge into `development`.
- `development` -> `main` is the single integration pull request, kept up to date.
- After merge, feature branches are deleted.

<!-- BEGIN:nextjs-agent-rules -->

# This is not the Next.js you know

This version has breaking changes. Software interfaces, conventions, and file structure may differ from your training data.

Read the guide in `node_modules/next/dist/docs/` before you write code. The path starts at the directory that holds this file. In monorepos, the `next` package may not be visible from the repo root. Heed deprecation notices.

`next dev` writes and re-adds this block. Verify it at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change. Commit it with your work to keep the tree clean.

<!-- END:nextjs-agent-rules -->
