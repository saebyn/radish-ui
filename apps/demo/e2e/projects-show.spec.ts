import { expect, test } from "@playwright/test";

test.describe("Projects show", () => {
  test("renders show details and activity sections", async ({ page }) => {
    await page.goto("/#/projects/1/show");

    await expect(page.getByRole("heading", { name: "Details", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Episodes", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();

    await expect(page.getByRole("link", { name: /edit/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
  });
});
