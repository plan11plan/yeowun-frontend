import { expect, test } from "@playwright/test";

test.describe("여운 frontend smoke", () => {
  test("renders the home screen and calls the backend health endpoint", async ({ page }) => {
    let healthRequestCount = 0;

    await page.route("**/api/actuator/health", async (route) => {
      healthRequestCount += 1;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "UP" }),
      });
    });

    await page.goto("/");

    await expect(page.getByText("여운")).toBeVisible();
    await expect
      .poll(() => healthRequestCount, {
        message: "the frontend should request backend health status",
      })
      .toBeGreaterThan(0);
  });
});
