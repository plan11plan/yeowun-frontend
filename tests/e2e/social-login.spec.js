import { expect, test } from "@playwright/test";

// 실제 provider 로그인은 자동화 불가 → 콜백(code 교환) 이후 흐름만 백엔드 mock으로 검증한다.
test.describe("social login callback", () => {
  test("exchanges code on callback and shows logged-in state", async ({
    page,
  }) => {
    // 세션 복원(refresh)은 비로그인으로 고정.
    await page.route("**/api/v1/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          meta: { result: "FAIL", errorCode: "NO_REFRESH_TOKEN", message: "no token" },
          data: null,
        }),
      });
    });

    // startLogin이 저장하는 값을 앱 스크립트 실행 전에 심어 state 검증을 통과시킨다.
    await page.addInitScript(() => {
      sessionStorage.setItem("oauth_state", "test-state");
      sessionStorage.setItem("oauth_provider", "kakao");
    });

    // code 교환 성공 mock.
    await page.route("**/api/v1/auth/login/kakao", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          meta: { result: "SUCCESS", errorCode: null, message: null },
          data: {
            accessToken: "fake-access-token",
            user: {
              userId: 1,
              nickname: "테스트유저",
              profileCompleted: false,
              provider: "kakao",
              email: "test@example.com",
            },
          },
        }),
      });
    });

    // 로그아웃은 서버가 쿠키를 만료시키는 엔드포인트를 호출한다.
    await page.route("**/api/v1/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          meta: { result: "SUCCESS", errorCode: null, message: null },
          data: null,
        }),
      });
    });

    await page.goto("/login?code=test-code&state=test-state");

    await expect(page.getByText("로그인됨: 테스트유저 (kakao)")).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();

    // 로그아웃 → 다시 로그인 버튼이 보인다.
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(
      page.getByRole("button", { name: "카카오로 로그인" })
    ).toBeVisible();
  });
});
