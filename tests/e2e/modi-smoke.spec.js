import { expect, test } from "@playwright/test";

test.describe("여운 frontend smoke", () => {
  test("renders home and shows social login buttons", async ({ page }) => {
    // 앱 로드 시 세션 복원(refresh)이 나가므로, 비로그인 상태를 결정적으로 만든다.
    await page.route("**/api/v1/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          meta: {
            result: "FAIL",
            errorCode: "NO_REFRESH_TOKEN",
            message: "재발급 토큰이 없습니다.",
          },
          data: null,
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByText("여운")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "카카오로 로그인" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "구글로 로그인" }),
    ).toBeVisible();
  });
});
