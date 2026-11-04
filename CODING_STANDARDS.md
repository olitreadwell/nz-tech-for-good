<!-- generated-by: coding-standards ensure -->
# Coding standards: nz-tech-for-good

Project rules for this repo. The global baseline is
`~/.agents/standards/CODING_STANDARDS.md` and applies unless this file
adds a stricter rule. Read `AGENTS.md` for layout and scope.

## Stack

- Language and framework: TypeScript
- Package manager: npm
- Test tools: Vitest, Playwright
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Commands

- Full gate: `npm run check`
- Tests: `npm run test`

## Test-first in this repo

- Start with a failing test at the nearest seam. Name the seam in one
  line before writing it.
- Watch the test fail for the right reason, then write the least code
  that passes it.
- Run the full gate above before claiming done.
- No test needed for docs, config, dependency bumps, or one-off data
  fixes. Say `no test: <reason>` in the change.
- Never skip, delete, or weaken a test, assertion, type check, or lint
  rule to reach green.

## Conventions

- Follow `AGENTS.md`, `CLAUDE.md`, and `CONTRIBUTING.md` for layout,
  naming, and review rules. This file does not repeat them.
- Export names use 2 to 3 domain words (`getUserProfileById`, not `get`).
- One spelling per concept across the repo.
- No `any` or untyped escape hatches. Fix types at the boundary.
- Test files sit next to their source and are named after it.
- Comments explain why, directly above the code they explain.

## Branch names

`<type>/<domain>/<kebab-description>/<issue-id>`. Omit the trailing id
when no issue exists. Follow the upstream or org convention when one is
clearly in use.

## Done when

`npm run check` passes and every changed behaviour has a test, or a one-line
reason it has none.
