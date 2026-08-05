import { test as base, createBdd } from "playwright-bdd";

/**
 * Scenario-scoped scratch space so one step can hand data to a later step in
 * the same scenario (e.g. "note the first organisation's name" then "assert
 * the detail page shows that name"). Each scenario gets its own fresh object.
 */
export interface World {
  consoleErrors: string[];
  firstEntryName?: string;
  firstEntryHref?: string;
  firstDomainLabel?: string;
  firstDomainHref?: string;
  firstRegionLabel?: string;
  firstRegionHref?: string;
}

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world: World = { consoleErrors: [] };
    page.on("pageerror", (err) => world.consoleErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") world.consoleErrors.push(msg.text());
    });
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test);
