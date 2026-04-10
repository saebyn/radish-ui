import { expect, test, type Page } from "@playwright/test";

async function openProjectsBoard(page: Page) {
  await page.goto("/#/projects");
  await page.getByRole("button", { name: "Board", exact: true }).click();
  await expect(page.getByTestId("kanban-column-draft")).toBeVisible();
  await expect(page.getByTestId("kanban-column-in_review")).toBeVisible();
  await expect(page.getByTestId("kanban-column-published")).toBeVisible();
}

test.describe("Projects Kanban", () => {
  test("shows board columns and cards", async ({ page }) => {
    await openProjectsBoard(page);

    await expect(page.getByText("Patch Notes Episode Pack", { exact: true })).toBeVisible();
    await expect(page.getByText("Creator Spotlight - Spring Cut", { exact: true })).toBeVisible();
    await expect(page.getByText("Behind The Build Highlights", { exact: true })).toBeVisible();
  });

  test("opens project show page from card title link", async ({ page }) => {
    await openProjectsBoard(page);

    await page.getByRole("link", { name: "Patch Notes Episode Pack", exact: true }).click();

    await expect(page).toHaveURL(/#\/projects\/2\/show$/);
    await expect(page.getByText("Details", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /edit/i })).toBeVisible();
  });

  test("moves a draft project into in-review by drag and drop", async ({ page }) => {
    await openProjectsBoard(page);

    const draftColumn = page.getByTestId("kanban-column-draft");
    const reviewColumn = page.getByTestId("kanban-column-in_review");
    const patchNotesCard = page.getByTestId("kanban-card-2");

    await expect(draftColumn.getByText("Patch Notes Episode Pack", { exact: true })).toBeVisible();

    const sourceBox = await patchNotesCard.boundingBox();
    const targetBox = await reviewColumn.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error("Could not resolve kanban drag coordinates.");
    }

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 80, targetBox.y + 80, { steps: 10 });
    await page.mouse.up();

    await expect(reviewColumn.getByText("Patch Notes Episode Pack", { exact: true })).toBeVisible();
    await expect(draftColumn.getByText("Patch Notes Episode Pack", { exact: true })).toHaveCount(0);
  });
});
