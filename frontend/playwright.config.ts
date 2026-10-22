/**
 * 【關卡 21】Playwright 的設定：E2E（end-to-end）測試，用真的瀏覽器走一遍登入主路徑
 *
 * 和關卡 16 的 Vitest 對照：
 *   Vitest + MSW：一個元件、假後端、毫秒級，驗「元件在某個回應下畫得對不對」
 *   Playwright：整個網站、真後端、秒級，驗「使用者從註冊到登出這條路真的走得通」
 * 兩種都要：前者多而快，後者少而真（關卡 20 Q1：便宜的檢查寫成測試，貴的檢查路徑要少）。
 *
 * 後端要先在 localhost:8000 跑起來（本機：uvicorn 或 docker compose；CI：infra.yml 的 e2e job 用 compose）。
 * 前端不用自己起：下面的 webServer 會跑 npm run dev，Vite 再把 /api 代理到後端（vite.config.ts），
 * 所以瀏覽器看到的前後端是同一個網站，cookie 行為和正式環境一樣。
 *
 *   npx playwright test          # 跑全部
 *   npx playwright test --ui     # 開 UI 模式，一步一步看瀏覽器在做什麼（本機學習用）
 *   npx playwright show-report   # 看上一次的 HTML 報告
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // 每個測試用自己的帳號（見 auth.spec.ts），彼此不共用狀態，可以平行跑
  fullyParallel: true,
  // CI 上有人不小心留下 test.only 就讓整個 job 紅，不然其他測試會被默默跳過
  forbidOnly: !!process.env.CI,
  // 不重試：E2E 偶爾紅就該查原因（網路、等待條件），重試只會把問題藏起來
  retries: 0,
  // list：終端機一行一個測試；html：CI 上傳成 artifact，點開能看每一步的截圖與 trace
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
    // 失敗時保留 trace（每一步的 DOM、網路、console），在報告裡可以回放
    trace: "retain-on-failure",
  },
  // 只跑 Chromium：這是登入模板，不是跨瀏覽器相容性專案；要加 Firefox / WebKit 就多一個 project
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    // 本機已經有 npm run dev 在跑就直接用；CI 一定自己起
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
