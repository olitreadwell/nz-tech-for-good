import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_PATH = "/nz-tech-for-good";

test.describe("homepage", () => {
  test("renders title and stats", async ({ page }) => {
    await page.goto(BASE_PATH);
    await expect(page.locator("h1")).toContainText("tech for public good");
    await expect(page.getByText("organisations", { exact: true })).toBeVisible();
    await expect(page.getByText("domains", { exact: true })).toBeVisible();
    await expect(page.getByText("regions", { exact: true })).toBeVisible();
  });

  test("browse link navigates to directory", async ({ page }, testInfo) => {
    await page.goto(BASE_PATH);
    if (testInfo.project.name === "mobile-chrome") {
      await page.getByTestId("menu-toggle").click();
      await page
        .getByRole("navigation", { name: "Primary mobile" })
        .getByRole("link", { name: "Browse" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Browse" })
        .click();
    }
    await expect(page).toHaveURL(/\/directory/);
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto(BASE_PATH);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});

test.describe("directory page", () => {
  test("renders entry cards", async ({ page }) => {
    await page.goto(`${BASE_PATH}/directory`);
    await expect(page.locator("h3 a").first()).toBeVisible();
  });

  test("has no serious a11y violations", async ({ page }) => {
    await page.goto(`${BASE_PATH}/directory`);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});

test.describe("adversarial", () => {
  test("404 page returns not-found", async ({ page }) => {
    const response = await page.goto(`${BASE_PATH}/nonexistent`);
    expect(response?.status()).toBe(404);
  });

  test("shows the not-found page for unknown routes", async ({ page }) => {
    await page.goto(`${BASE_PATH}/nonexistent`);
    await expect(page.locator("h1")).toHaveText("404");
    await expect(page.getByText("That page could not be found.")).toBeVisible();
  });
});
