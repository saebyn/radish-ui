import { test, expect } from "@playwright/test";
import { MOCK_POSTS } from "./fixtures";

test.describe("Posts list", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.hostname === "jsonplaceholder.typicode.com" && url.pathname === "/posts",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: {
            "Access-Control-Expose-Headers": "X-Total-Count",
            "X-Total-Count": `${MOCK_POSTS.length}`,
          },
          body: JSON.stringify(MOCK_POSTS),
        });
      },
    );

    await page.goto("/#/posts");
  });

  test("renders the page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
  });

  test("renders table column headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "ID", exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Title" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "User ID" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });

  test("renders mocked post rows", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "First Post Title" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Second Post Title" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Third Post Title" })).toBeVisible();
  });

  test("shows a Create button linking to the create page", async ({ page }) => {
    const createLink = page.getByRole("link", { name: /create/i });
    await expect(createLink).toBeVisible();
    await expect(createLink).toHaveAttribute("href", expect.stringContaining("/posts/create"));
  });

  test("shows Edit and Delete actions for each row", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "First Post Title" })).toBeVisible();
    const firstRow = page.getByRole("row").nth(1);
    await expect(firstRow.getByRole("link", { name: /edit/i })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: /delete/i })).toBeVisible();
  });
});
