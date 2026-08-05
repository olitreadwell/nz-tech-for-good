import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Then } from "./fixtures";

const SERIOUS_IMPACTS = new Set(["critical", "serious"]);

Then("there are no critical or serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const seriousOrWorse = results.violations.filter(
    (v) => v.impact && SERIOUS_IMPACTS.has(v.impact)
  );
  expect(seriousOrWorse, JSON.stringify(seriousOrWorse, null, 2)).toEqual([]);
});
