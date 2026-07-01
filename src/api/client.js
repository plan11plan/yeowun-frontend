// 모든 호출은 상대경로 /api/* 로 나간다(로컬은 Vite 프록시, 운영은 Vercel rewrite가
// 백엔드로 same-origin처럼 전달). access·refresh 토큰은 백엔드가 HttpOnly 쿠키로 관리하므로
// 프론트는 토큰 값을 직접 들지 않고 credentials:"include" 로 쿠키를 자동 동봉하기만 한다.
const BASE = "/api";

function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include", // access·refresh HttpOnly 쿠키 송수신
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function toData(res) {
  // 백엔드 공통 래퍼: { meta: {result, errorCode, message}, data }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.meta?.message || `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  return json?.data ?? null;
}

/**
 * API 호출. auth:true 요청이 401이면 refresh 쿠키로 access를 1회 재발급한 뒤 재시도한다.
 * (access 쿠키가 만료돼도 refresh 쿠키가 살아있으면 사용자는 끊김 없이 이어진다)
 */
export async function apiFetch(path, opts = {}) {
  let res = await request(path, opts);

  if (res.status === 401 && opts.auth) {
    const refreshed = await request("/v1/auth/refresh", { method: "POST" });
    if (refreshed.ok) {
      res = await request(path, opts); // 새 access 쿠키로 재시도
    }
  }

  return toData(res);
}
