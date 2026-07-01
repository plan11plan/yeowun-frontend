import { apiFetch } from "@api/client";
import { redirectUri } from "@auth/providers";

/** 콜백 code를 자체 JWT로 교환. access·refresh는 백엔드가 HttpOnly 쿠키로 심어준다(본문엔 user). */
export async function exchangeCode(provider, code) {
  const data = await apiFetch(`/v1/auth/login/${provider}`, {
    method: "POST",
    body: { code, redirectUri: redirectUri() },
  });
  return data.user;
}

/** 새로고침 후 세션 복원: refresh 쿠키로 access를 재발급한다. 쿠키가 없거나 만료면 null. */
export async function restoreSession() {
  try {
    const data = await apiFetch(`/v1/auth/refresh`, { method: "POST" });
    return data.user;
  } catch {
    return null;
  }
}

/**
 * 현재 로그인 사용자의 프로필(access 쿠키 인증, 401이면 refresh 후 재시도).
 * 백엔드에는 별도의 `/auth/me`가 없고 프로필 조회는 `/api/v1/users/me`가 담당한다.
 * 응답 shape는 로그인/재발급의 user(userId·nickname·provider·email·profileCompleted)와 달리
 * 프로필 중심(userId·provider·nickname·profileImageUrl·ageGroup·birthYear·residenceRegion·residenceDistrict·tasteKeywords·stats)이다.
 */
export function fetchMe() {
  return apiFetch(`/v1/users/me`, { auth: true });
}

/** 로그아웃: 서버가 access·refresh 쿠키를 만료시키고 refresh 토큰을 폐기한다. */
export async function logout() {
  try {
    await apiFetch(`/v1/auth/logout`, { method: "POST" });
  } catch {
    // 네트워크 등으로 실패해도 클라 상태는 비운다(쿠키는 만료 시각에 사라짐).
  }
}
