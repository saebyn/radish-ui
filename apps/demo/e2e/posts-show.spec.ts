import { test, expect } from "@playwright/test";
import { MOCK_POSTS } from "./fixtures";

const FIRST_POST = MOCK_POSTS[0];

test.describe("Post show page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) =>
        url.hostname === "jsonplaceholder.typicode.com" &&
        url.pathname === `/posts/${FIRST_POST.id}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(FIRST_POST),
        });
      },
    );

    await page.goto(`/#/posts/${FIRST_POST.id}/show`);
  });

  test("renders all field values for the post", async ({ page }) => {
    await expect(page.getByText(FIRST_POST.title, { exact: true })).toBeVisible();
    await expect(page.getByText(FIRST_POST.body, { exact: true })).toBeVisible();
    await expect(page.getByText(`${FIRST_POST.userId}`, { exact: true })).toBeVisible();
  });

  test("shows an Edit button linking to the edit page", async ({ page }) => {
    await expect(page.getByText(FIRST_POST.title, { exact: true })).toBeVisible();
    const editLink = page.getByRole("link", { name: /edit/i });
    await expect(editLink).toBeVisible();
    await expect(editLink).toHaveAttribute(
      "href",
      expect.stringContaining(`/posts/${FIRST_POST.id}`),
    );
  });
});
