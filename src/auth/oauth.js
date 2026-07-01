import { PROVIDERS, redirectUri } from "@auth/providers";

const STATE_KEY = "oauth_state";
const PROVIDER_KEY = "oauth_provider";

/**
 * 소셜 로그인 시작: state(CSRF) 생성·저장 후 provider authorize 화면으로 이동한다.
 * (백엔드 FE-주도 login은 state를 검증하지 않으므로 state 검증은 FE 책임)
 */
export function startLogin(provider) {
  const cfg = PROVIDERS[provider];
  if (!cfg) {
    throw new Error(`지원하지 않는 provider: ${provider}`);
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(PROVIDER_KEY, provider);

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(),
    response_type: "code",
    state,
    ...(cfg.scope ? { scope: cfg.scope } : {}),
    ...cfg.extraParams,
  });
  window.location.assign(`${cfg.authorizeUrl}?${params.toString()}`);
}

/**
 * 콜백에서 받은 state를 저장값과 대조(소비)하고, 시작 시 저장한 provider를 돌려준다.
 * 불일치/만료면 throw.
 */
export function consumeState(returnedState) {
  const saved = sessionStorage.getItem(STATE_KEY);
  const provider = sessionStorage.getItem(PROVIDER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(PROVIDER_KEY);

  if (!saved || saved !== returnedState) {
    throw new Error("state 불일치 — 만료되었거나 유효하지 않은 로그인 시도입니다.");
  }
  if (!provider || !PROVIDERS[provider]) {
    throw new Error("provider 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
  }
  return provider;
}
