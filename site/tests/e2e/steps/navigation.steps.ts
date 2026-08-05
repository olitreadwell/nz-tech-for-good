import { expect } from "@playwright/test";
import { Given, Then, When } from "./fixtures";

// baseURL (see playwright.config.ts) already includes the site's base path
// (/nz-tech-for-good/), so every path below is relative with no leading
// slash: a leading slash would resolve against the origin and drop the base.

Given("I am on the homepage", async ({ page }) => {
  await page.goto("./");
});

Given("I am on the directory page", async ({ page }) => {
  await page.goto("directory/");
});

Given("I am on the domains index page", async ({ page }) => {
  await page.goto("domains/");
});

Given("I am on the regions index page", async ({ page }) => {
  await page.goto("regions/");
});

Given("I am on the ecosystem page", async ({ page }) => {
  await page.goto("ecosystem/");
});

When("I visit an unknown page", async ({ page }) => {
  await page.goto("this-page-does-not-exist/");
});

Then("the page title contains {string}", async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

Then("I see a heading {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("heading", { level: 1, name: text })).toBeVisible();
});
