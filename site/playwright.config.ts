import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

// playwright-bdd generates plain Playwright test files from the .feature
// files at config-load time (into .features-gen/, gitignored). testDir below
// points Playwright at that generated output rather than at the .feature
// files themselves.
const testDir = defineBddConfig({
  features: "tests/e2e/features/**/*.feature",
  // fixtures.ts exports `test` (extended with the `world` fixture); every
  // other file in this glob registers Given/When/Then against it.
  steps: "tests/e2e/steps/**/*.ts",
});

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}/nz-tech-for-good/`;

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Build then serve the static site once per run; e2e/a11y tests exercise
  // the real built output (astro preview), not the dev server.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
