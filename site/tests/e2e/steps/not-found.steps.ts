import { expect } from "@playwright/test";
import { Then } from "./fixtures";

Then("I see a link back to the homepage", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
});
