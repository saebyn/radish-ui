import { expect, test } from "@playwright/test";

test.describe("Projects approval workflow", () => {
  test("transitions draft to in review", async ({ page }) => {
    await page.goto("/#/projects/2/show");

    const statusBadge = page.getByTestId("project-status-badge");
    await expect(statusBadge).toHaveAttribute("data-status", "draft");

    await page.getByRole("button", { name: "Submit for Review", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Submit for Review", exact: true }),
    ).toBeVisible();
    await page.getByLabel(/add a note/i).fill("E2E: submitting for reviewer pass.");

    const openDialog = page.locator("dialog[open]");
    await openDialog.getByRole("button", { name: "Submit", exact: true }).click();

    await expect(statusBadge).toHaveAttribute("data-status", "in_review");
    await expect(
      page.getByRole("button", { name: "Approve & Publish", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject", exact: true })).toBeVisible();
  });

  test("transitions in review back to draft", async ({ page }) => {
    await page.goto("/#/projects/1/show");

    const statusBadge = page.getByTestId("project-status-badge");
    await expect(statusBadge).toHaveAttribute("data-status", "in_review");

    await page.getByRole("button", { name: "Reject", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Reject", exact: true })).toBeVisible();
    await page.getByLabel(/add a note/i).fill("E2E: needs revisions before publish.");

    const openDialog = page.locator("dialog[open]");
    await openDialog.getByRole("button", { name: "Reject", exact: true }).click();

    await expect(statusBadge).toHaveAttribute("data-status", "draft");
    await expect(
      page.getByRole("button", { name: "Submit for Review", exact: true }),
    ).toBeVisible();
  });
});
