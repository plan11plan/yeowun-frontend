import { useEffect, useRef, useState } from "react";
import { startLogin, consumeState } from "@auth/oauth";
import { exchangeCode } from "@api/auth";
import { useAuth } from "@auth/AuthContext";

const LoginPage = () => {
  const { user, setUser, logout } = useAuth();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const handled = useRef(false);

  // 콜백 처리: /login?code=...&state=... 진입 시 1회만 교환한다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const oauthError = params.get("error");

    if (!code && !oauthError) return;
    if (handled.current) return; // StrictMode 이중 호출 가드
    handled.current = true;

    // URL에서 code 제거(재사용·새로고침 방지).
    window.history.replaceState({}, "", window.location.pathname);

    // setState는 effect 동기 본문이 아닌 비동기 흐름에서 호출한다.
    (async () => {
      if (oauthError) {
        setError(`로그인 취소/오류: ${oauthError}`);
        return;
      }

      let provider;
      try {
        provider = consumeState(returnedState);
      } catch (e) {
        setError(e.message);
        return;
      }

      setBusy(true);
      try {
        const u = await exchangeCode(provider, code);
        setUser(u);
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    })();
  }, [setUser]);

  if (user) {
    return (
      <div>
        <p>
          로그인됨: {user.nickname ?? "(닉네임 없음)"} ({user.provider})
        </p>
        {user.email && <p>{user.email}</p>}
        <button onClick={logout}>로그아웃</button>
      </div>
    );
  }

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      {busy ? (
        <p>로그인 처리 중…</p>
      ) : (
        <>
          <button onClick={() => startLogin("kakao")}>카카오로 로그인</button>
          <button onClick={() => startLogin("google")}>구글로 로그인</button>
        </>
      )}
    </div>
  );
};

export default LoginPage;
