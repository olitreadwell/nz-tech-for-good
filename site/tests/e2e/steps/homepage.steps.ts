import { expect } from "@playwright/test";
import { Then, When } from "./fixtures";

Then(
  'I see primary navigation links for {string}, {string}, {string}, and {string}',
  async ({ page }, a: string, b: string, c: string, d: string) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const label of [a, b, c, d]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  }
);

When("I click the {string} link", async ({ page }, text: string) => {
  await page.getByRole("link", { name: new RegExp(text) }).first().click();
});

Then("I am taken to the directory page", async ({ page }) => {
  await expect(page).toHaveURL(/\/directory\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Directory" })).toBeVisible();
});
