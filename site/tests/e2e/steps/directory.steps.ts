import { expect } from "@playwright/test";
import { Then, When } from "./fixtures";

async function statedTotal(page: import("@playwright/test").Page): Promise<number> {
  const text = await page.locator("#result-count").innerText();
  const match = text.match(/(\d+)/);
  if (!match) throw new Error(`Could not find a count in "${text}"`);
  return Number(match[1]);
}

Then("the number of organisation cards shown matches the page's stated total", async ({ page }) => {
  const total = await statedTotal(page);
  const visibleCards = page.locator("[data-entry]:not([hidden])");
  await expect(visibleCards).toHaveCount(total);
});

When("I search for the name of the first organisation shown", async ({ page, world }) => {
  const firstCard = page.locator("[data-entry]").first();
  world.firstEntryName = (await firstCard.locator("h3").innerText()).trim();
  await page.locator("#q").fill(world.firstEntryName);
});

Then("only organisation cards matching that search remain visible", async ({ page, world }) => {
  const query = (world.firstEntryName ?? "").toLowerCase();
  const visibleCards = page.locator("[data-entry]:not([hidden])");
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const search = await visibleCards.nth(i).getAttribute("data-search");
    expect(search ?? "").toContain(query);
  }
});

When(
  "I filter the directory by the first domain in the domain dropdown",
  async ({ page, world }) => {
    const select = page.locator("#f-domain");
    const value = await select.locator("option").nth(1).getAttribute("value");
    world.firstDomainLabel = value ?? "";
    await select.selectOption(value ?? "");
  }
);

Then("every visible organisation card belongs to that domain", async ({ page, world }) => {
  const visibleCards = page.locator("[data-entry]:not([hidden])");
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(visibleCards.nth(i)).toHaveAttribute("data-domain", world.firstDomainLabel ?? "");
  }
});

When(
  "I filter the directory by the first region in the region dropdown",
  async ({ page, world }) => {
    const select = page.locator("#f-region");
    const value = await select.locator("option").nth(1).getAttribute("value");
    world.firstRegionLabel = value ?? "";
    await select.selectOption(value ?? "");
  }
);

Then("every visible organisation card belongs to that region", async ({ page, world }) => {
  const visibleCards = page.locator("[data-entry]:not([hidden])");
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(visibleCards.nth(i)).toHaveAttribute("data-region", world.firstRegionLabel ?? "");
  }
});

When("I clear the directory filters", async ({ page }) => {
  await page.locator("#clear-filters").click();
});
