import { expect, test } from "@playwright/test";

test.describe("Projects edit", () => {
  test("edits project title and saves", async ({ page }) => {
    const editedTitle = `Creator Spotlight - Spring Cut (edited ${Date.now()})`;

    await page.goto("/#/projects/1");

    await page.getByLabel("Title").fill(editedTitle);
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page).toHaveURL(/#\/projects$/);
    await expect(page.getByRole("cell", { name: editedTitle, exact: true })).toBeVisible();
  });
});
