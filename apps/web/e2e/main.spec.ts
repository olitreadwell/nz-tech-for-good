import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("homepage", () => {
  test("renders title and stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("tech for public good");
    await expect(page.locator("text=organisations")).toBeVisible();
    await expect(page.locator("text=domains")).toBeVisible();
    await expect(page.locator("text=regions")).toBeVisible();
  });

  test("browse link navigates to directory", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Browse");
    await expect(page).toHaveURL(/\/directory/);
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});

test.describe("directory page", () => {
  test("renders entry cards", async ({ page }) => {
    await page.goto("/directory");
    await expect(page.locator("h3 a").first()).toBeVisible();
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto("/directory");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});

test.describe("adversarial", () => {
  test("404 page returns not-found", async ({ page }) => {
    const response = await page.goto("/nonexistent");
    expect(response?.status()).toBe(404);
  });

  test("handles missing entry gracefully", async ({ page }) => {
    await page.goto("/entry/nonexistent-entry");
    await expect(page.locator("text=not found")).toBeVisible();
  });
});
