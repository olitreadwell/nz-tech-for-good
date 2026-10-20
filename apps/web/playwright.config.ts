import { defineConfig, devices } from "@playwright/test";

// The e2e run boots its own dev server, and it has to be a port nothing else
// holds: 3000 is usually taken, and Playwright reuses a server that is already
// answering there, which would test the wrong app. E2E_PORT moves the port for
// callers that need a different one.
const e2ePort = process.env.E2E_PORT ?? "3301";
const e2eBaseUrl = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `npm run dev -- -p ${e2ePort}`,
    cwd: __dirname,
    url: `${e2eBaseUrl}/kiwi-tech-for-good`,
    reuseExistingServer: !process.env.CI,
  },
});
