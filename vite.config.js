// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@components": path.resolve(__dirname, "src/components"),
      "@router": path.resolve(__dirname, "src/router"),
      "@store": path.resolve(__dirname, "src/store"),
      "@api": path.resolve(__dirname, "src/api"),
      "@auth": path.resolve(__dirname, "src/auth"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
  server: {
    // 화이트리스트(localhost:3000/login)·CORS와 맞추기 위해 포트 고정.
    port: 3000,
    strictPort: true,
    proxy: {
      // 백엔드 인증 API가 그 자체로 /api/v1/auth/... 이므로 prefix를 벗기지 않는다.
      // (상대경로 /api/* 호출 → same-origin으로 보여 refresh HttpOnly 쿠키가 저장된다)
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
