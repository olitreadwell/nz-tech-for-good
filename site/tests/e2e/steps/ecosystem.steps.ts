import { expect } from "@playwright/test";
import { Then } from "./fixtures";

Then("there are no JavaScript console errors", async ({ page, world }) => {
  // Give any deferred script errors a moment to surface before asserting.
  await page.waitForTimeout(200);
  expect(world.consoleErrors, world.consoleErrors.join("\n")).toEqual([]);
});

Then("I see the relationship diagram", async ({ page }) => {
  await expect(page.locator("svg[role='img']").first()).toBeVisible();
});
