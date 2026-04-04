import { test, expect } from "@playwright/test";
import { MOCK_POSTS } from "./fixtures";

const FIRST_POST = MOCK_POSTS[0];

test.describe("Post edit page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) =>
        url.hostname === "jsonplaceholder.typicode.com" &&
        url.pathname === `/posts/${FIRST_POST.id}`,
      async (route) => {
        if (route.request().method() === "PUT") {
          const body = route.request().postData() ?? "{}";
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body,
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(FIRST_POST),
          });
        }
      },
    );

    await page.goto(`/#/posts/${FIRST_POST.id}`);
  });

  test("renders the form fields pre-populated with record data", async ({ page }) => {
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByLabel("Body")).toBeVisible();
    await expect(page.getByLabel("User ID")).toBeVisible();

    await expect(page.getByLabel("Title")).toHaveValue(FIRST_POST.title);
    await expect(page.getByLabel("Body")).toHaveValue(FIRST_POST.body);
    await expect(page.getByLabel("User ID")).toHaveValue(`${FIRST_POST.userId}`);
  });

  test("can update the title and save", async ({ page }) => {
    await expect(page.getByLabel("Title")).toBeVisible();

    await page.getByLabel("Title").fill("Updated Title");
    await page.getByRole("button", { name: /save/i }).click();

    // After undoable save the form should still be visible (undo notification shown)
    await expect(page.getByLabel("Title")).toBeVisible();
  });
});
