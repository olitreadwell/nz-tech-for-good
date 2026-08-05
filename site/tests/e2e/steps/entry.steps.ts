import { expect } from "@playwright/test";
import { Then, When } from "./fixtures";

When("I open the first organisation's detail page", async ({ page, world }) => {
  const card = page.locator("[data-entry]").first();
  world.firstEntryName = (await card.locator("h3").innerText()).trim();
  const domainPill = card.locator(".pill.domain-flag");
  if (await domainPill.count()) {
    world.firstDomainLabel = (await domainPill.innerText()).trim();
  }
  await card.locator("h3 a").click();
});

Then("I see its name as the page heading", async ({ page, world }) => {
  await expect(
    page.getByRole("heading", { level: 1, name: world.firstEntryName ?? "" })
  ).toBeVisible();
});

Then("I see its domain", async ({ page, world }) => {
  const pill = page.locator(".detail-header .pill").first();
  await expect(pill).toBeVisible();
  if (world.firstDomainLabel) {
    await expect(pill).toHaveText(world.firstDomainLabel);
  }
});

Then("I see its description", async ({ page }) => {
  const lead = page.locator(".detail-header .lead");
  await expect(lead).toBeVisible();
  await expect(lead).not.toHaveText("");
});

Then("I see a link back to the directory", async ({ page }) => {
  await expect(page.locator(".crumbs a", { hasText: "Directory" })).toBeVisible();
});
