import { expect, test, type Page } from "@playwright/test";

async function openProjectsTimeline(page: Page) {
  await page.goto("/#/projects");
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(page.getByText("March 2026", { exact: true })).toBeVisible();
}

test.describe("Projects Timeline", () => {
  test("filters by status", async ({ page }) => {
    await openProjectsTimeline(page);

    await page.getByTestId("timeline-filter-draft").click();
    await expect(page.getByText("Patch Notes Episode Pack", { exact: true })).toBeVisible();
    await expect(page.getByText("Behind The Build Highlights", { exact: true })).toHaveCount(0);

    await page.getByTestId("timeline-filter-published").click();
    await expect(page.getByText("Behind The Build Highlights", { exact: true })).toBeVisible();
    await expect(page.getByText("Patch Notes Episode Pack", { exact: true })).toHaveCount(0);
  });

  test("toggles sort order", async ({ page }) => {
    await openProjectsTimeline(page);

    const firstTitle = page.locator('[data-testid^="timeline-link-"]').first();
    await expect(firstTitle).toContainText("Behind The Build Highlights");

    await page.getByTestId("timeline-sort-toggle").click();
    await expect(page.getByTestId("timeline-sort-toggle")).toContainText("Oldest first");
    await expect(firstTitle).toContainText("Creator Spotlight - Spring Cut");
  });

  test("opens project show page from timeline item link", async ({ page }) => {
    await openProjectsTimeline(page);

    await page.getByTestId("timeline-link-1").click();

    await expect(page).toHaveURL(/#\/projects\/1\/show$/);
    await expect(page.getByText("Details", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /edit/i })).toBeVisible();
  });
});
