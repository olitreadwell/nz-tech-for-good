/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// Unit tests only exercise site/src/lib (pure TypeScript, no browser). Astro
// components and pages are covered by the Playwright-BDD e2e suite instead,
// so they are excluded from both test discovery and the coverage gate.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.d.ts"],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 95,
      },
    },
  },
});
