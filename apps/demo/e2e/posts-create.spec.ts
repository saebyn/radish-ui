import { test, expect } from "@playwright/test";
import { MOCK_POSTS } from "./fixtures";

test.describe("Post create page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the list endpoint so the post-save redirect to the list page works
    await page.route(
      (url) => url.hostname === "jsonplaceholder.typicode.com" && url.pathname === "/posts",
      async (route) => {
        if (route.request().method() === "POST") {
          const body = route.request().postData() ?? "{}";
          const created = { id: 101, ...JSON.parse(body) };
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify(created),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            headers: {
              "Access-Control-Expose-Headers": "X-Total-Count",
              "X-Total-Count": `${MOCK_POSTS.length}`,
            },
            body: JSON.stringify(MOCK_POSTS),
          });
        }
      },
    );

    await page.goto("/#/posts/create");
  });

  test("renders all form inputs", async ({ page }) => {
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByLabel("Body")).toBeVisible();
    await expect(page.getByLabel("User ID")).toBeVisible();
  });

  test("renders the Create Post submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /create post/i })).toBeVisible();
  });

  test("can fill the form and submit a new post", async ({ page }) => {
    await page.getByLabel("Title").fill("My New Post");
    await page.getByLabel("Body").fill("Some body text");
    await page.getByLabel("User ID").fill("5");

    await page.getByRole("button", { name: /create post/i }).click();

    // After creation, React Admin redirects to the list; the list heading should appear
    await expect(page.getByRole("heading", { name: /posts/i })).toBeVisible();
  });
});
