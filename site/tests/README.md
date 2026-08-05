# Site tests

This folder holds every automated test for the Astro site in `site/`. There
were no tests here before this suite was added, so the layout below is the
starting point for anyone adding to it.

## Taxonomy

Four kinds of test live here, each with one job.

### Unit (`tests/unit/`)

Plain [Vitest](https://vitest.dev). Covers only pure TypeScript in
`site/src/lib/` (`data.ts` and `url.ts`). No browser, no network, no reading
from the real `data/entries/` directory. `tests/fixtures/entries/` holds a
small set of made-up YAML entries so these tests stay fast and do not break
when someone edits a real directory entry.

Unit tests are plain assertions (`expect(...).toBe(...)`). They do not use
Gherkin. Writing `Given a slug / When I call buildEntryUrl / Then it returns
/entry/slug/` in Gherkin form would add ceremony without adding clarity, so we
keep unit tests as ordinary Vitest.

### E2E (`tests/e2e/`)

[Playwright](https://playwright.dev), run through
[playwright-bdd](https://vitalets.github.io/playwright-bdd/), using formal
Gherkin `.feature` files. These run against the real built site (`astro
build`, served with `astro preview`), covering every page: homepage,
directory (with search and filters), domains, regions, one entry detail page,
the ecosystem diagram, and the 404 page.

- `tests/e2e/features/*.feature`: the Gherkin scenarios, in plain English.
- `tests/e2e/steps/*.steps.ts`: the Playwright code each step runs.
- `tests/e2e/steps/fixtures.ts`: a small shared "world" object so one step
  can pass data to a later step in the same scenario (for example, "read the
  first organisation's name" then "check the detail page shows that name").

Playwright-bdd generates ordinary Playwright test files from the `.feature`
files into `.features-gen/` (gitignored, rebuilt on every run). You never
edit that folder by hand.

### A11y (`tests/e2e/features/accessibility.feature`)

Not a separate framework. These are Playwright-BDD scenarios, tagged
`@a11y`, that run an [axe-core](https://github.com/dequelabs/axe-core) scan
on each page type (homepage, directory, a domain page, a region page, an
entry page, the ecosystem page, and the 404 page). A scenario fails if axe
finds a "critical" or "serious" violation. "Moderate" and "minor" findings
are not treated as failures yet, but worth checking by hand from time to
time.

### Smoke (`@smoke` tag)

A handful of the e2e scenarios are tagged `@smoke`. These are the fastest,
lowest-risk checks: each core page loads and shows its expected heading.
Run them with `npm run test:e2e:smoke` when you want a quick signal, for
example on every push, without waiting for the full a11y and filter-behaviour
suite.

## Running tests locally

From the `site/` directory:

```bash
npm install                # once
npx playwright install --with-deps chromium   # once, downloads the browser

npm run test:unit          # Vitest unit tests, with the coverage gate
npm run test:unit:watch    # Vitest in watch mode while you write code

npm run test:e2e           # full Playwright-BDD suite: e2e + a11y
npm run test:e2e:smoke     # only the @smoke-tagged scenarios
npm run test:a11y          # only the @a11y-tagged scenarios
npm run test:e2e:ui        # Playwright's interactive UI, useful for debugging

npm test                   # unit tests, then the full e2e/a11y suite
```

`npm run test:e2e` builds the site and starts `astro preview` for you (see
`playwright.config.ts`), so you do not need a dev server running first.

## Coverage gate

`vitest.config.ts` measures coverage for `site/src/lib/` only. Astro
components and pages (`.astro` files) are not meaningfully measurable through
Vitest since they render on the server; the e2e layer covers them instead by
checking real page output. The gate fails the run if statements, branches,
functions, or lines in `site/src/lib/` drop below 95%.

## The TDD/BDD workflow, going forward

When you add a page, a component, or a function to `site/src/`:

1. **Write the test first.**
   - For a new function in `site/src/lib/`, write the Vitest test in
     `tests/unit/` before writing the function. Watch it fail
     (`npm run test:unit:watch`).
   - For a new page or a new user-facing behaviour, write the `.feature` file
     in `tests/e2e/features/` first, in plain Gherkin, describing what a
     visitor should be able to do. Add step definitions as needed. Run
     `npm run test:e2e` and watch it fail because the page or behaviour does
     not exist yet.
2. **Build the smallest thing that makes the test pass.**
3. **Run the full suite** (`npm test`) before you commit, and add an `@a11y`
   scan to the new page's scenario if it is a new page.

This keeps every page in `site/src/pages/` backed by at least one e2e
scenario and one a11y check, and keeps `site/src/lib/` backed by real unit
tests instead of hopeful assumptions.

## CI

`.github/workflows/ci.yml` runs a `site-tests` job on every pull request and
push to `main`: it builds the site, runs the unit tests with the coverage
gate, installs Chromium, and runs the full Playwright-BDD suite. Any test
failure or coverage-gate miss fails the build.
