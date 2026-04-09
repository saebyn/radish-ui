import { expect, test } from "@playwright/test";

test.describe("Projects list", () => {
  test("renders list columns and row actions", async ({ page }) => {
    await page.goto("/#/projects");

    await expect(page.getByRole("columnheader", { name: "ID", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Title", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Series ID", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Owner ID", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actions", exact: true })).toBeVisible();

    await expect(
      page.getByRole("cell", { name: "Creator Spotlight - Spring Cut", exact: true }),
    ).toBeVisible();

    const firstDataRow = page.getByRole("row").nth(1);
    await expect(firstDataRow.getByRole("link", { name: /show/i })).toBeVisible();
    await expect(firstDataRow.getByRole("link", { name: /edit/i })).toBeVisible();
    await expect(firstDataRow.getByRole("button", { name: /delete/i })).toBeVisible();
  });

  test("exposes view toggles for list, board, and timeline", async ({ page }) => {
    await page.goto("/#/projects");

    await expect(page.getByRole("button", { name: "List", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Board", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Timeline", exact: true })).toBeVisible();
  });
});
