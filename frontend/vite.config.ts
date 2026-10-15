import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 【關卡 10】本機的「反向代理」：瀏覽器打 http://localhost:5173/api/...，
    // Vite 收到後轉發給 http://localhost:8000/api/...，再把回應（含 Set-Cookie）原封不動送回瀏覽器。
    // 對瀏覽器來說前後端是同一個網站，所以：不需要 CORS、cookie 直接帶上、localhost 和 127.0.0.1 都能用。
    // 正式環境由 Vercel 的 rewrites 做同一件事（vercel.json）。
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
