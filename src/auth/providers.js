// 공개 OAuth 설정. client-id는 공개값(백엔드 application.yaml 기본값과 동일하게 미러).
// redirect_uri는 런타임 origin에서 도출해 로컬(3000)/운영(vercel)에 자동 적응한다.
export const PROVIDERS = {
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    // 카카오 테스트앱 "여운-TEST"(앱ID 1500036) REST 키. 동의항목(이메일·연령대·출생연도)이 설정된 앱.
    clientId: "bba3e1d954ec548062bc3c13fd9f72bc",
    scope: "account_email,age_range,birthyear",
    extraParams: {},
  },
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId:
      "238940430553-ikggojb7ssr0knf6u3ga8f00npsuv0s3.apps.googleusercontent.com",
    scope: "openid email profile",
    extraParams: { access_type: "offline", prompt: "consent" },
  },
};

// authorize에 보내는 값과 백엔드 login에 보내는 값이 정확히 같아야 한다(화이트리스트·콘솔 등록값과도 일치).
export const redirectUri = () => `${window.location.origin}/login`;
