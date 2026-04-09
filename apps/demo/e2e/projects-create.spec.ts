import { expect, test } from "@playwright/test";

test.describe("Projects create", () => {
  test("creates a project using wizard form", async ({ page }) => {
    const newTitle = `E2E Project ${Date.now()}`;

    await page.goto("/#/projects/create");

    await page.getByLabel("Title").fill(newTitle);
    await page.getByLabel("Description").fill("Created from Playwright wizard flow.");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Create Project", exact: true }).click();

    await expect(page).toHaveURL(/#\/projects\/\d+$/);
    await expect(page.getByLabel("Title")).toHaveValue(newTitle);
  });
});
