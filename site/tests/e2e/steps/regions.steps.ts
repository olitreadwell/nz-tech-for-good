import { expect } from "@playwright/test";
import { Then, When } from "./fixtures";

Then("I see at least one region tile", async ({ page }) => {
  expect(await page.locator("a.tile").count()).toBeGreaterThan(0);
});

When("I open the first region tile", async ({ page, world }) => {
  const tile = page.locator("a.tile").first();
  world.firstRegionLabel = (await tile.locator(".tile-name").innerText()).trim();
  await tile.click();
});

Then("every organisation card on the page belongs to that region", async ({ page }) => {
  const cards = page.locator("[data-entry]");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  const regions = new Set<string>();
  for (let i = 0; i < count; i++) {
    regions.add((await cards.nth(i).getAttribute("data-region")) ?? "");
  }
  expect(regions.size).toBe(1);
});
