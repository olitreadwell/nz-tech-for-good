import { expect } from "@playwright/test";
import { Then, When } from "./fixtures";

Then("I see at least one domain tile", async ({ page }) => {
  expect(await page.locator("a.tile").count()).toBeGreaterThan(0);
});

When("I open the first domain tile", async ({ page, world }) => {
  const tile = page.locator("a.tile").first();
  world.firstDomainLabel = (await tile.locator(".tile-name").innerText()).trim();
  await tile.click();
});

Then("every organisation card on the page belongs to that domain", async ({ page }) => {
  const cards = page.locator("[data-entry]");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  const domains = new Set<string>();
  for (let i = 0; i < count; i++) {
    domains.add((await cards.nth(i).getAttribute("data-domain")) ?? "");
  }
  expect(domains.size).toBe(1);
});
