/**
 * 【關卡 21】登入主路徑的 E2E：註冊 → 登入 → 重新整理還在 → 登出
 *
 * 這三條就是 docs/RUNBOOK.md 第 0 節「部署後檢查」和 CHAIN.md 環 2 驗收標準的自動化版。
 * 每個測試註冊一個新帳號（email 帶時間戳），所以測試之間不共用資料、可以平行跑、重跑不會撞「email 已存在」。
 *
 * 怎麼找元素：優先用使用者看得到的東西（placeholder、按鈕文字、標題），不用 CSS class 或 id，
 * 改樣式不會讓測試壞掉，改文案才會（那本來就該重新確認）。
 */
import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "Passw0rd!x";

/** 每個測試一個新 email，避免互相影響 */
function uniqueEmail(workerIndex: number): string {
  return `e2e-${Date.now()}-${workerIndex}@example.com`;
}

/** 用 API 直接註冊（省掉每個測試都走一次註冊畫面；註冊畫面本身由第一個測試驗） */
async function registerViaApi(page: Page, email: string): Promise<void> {
  const response = await page.request.post("/api/auth/register", {
    data: { email, password: PASSWORD },
  });
  expect(response.status(), "註冊 API 應回 201").toBe(201);
}

/** 走登入畫面：填表單、按登入、等首頁出現 */
async function loginViaUi(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "登入" }).click();
  await expect(page.getByRole("heading", { name: `嗨，${email}` })).toBeVisible();
}

test("註冊 → 登入 → 首頁看到自己的 email", async ({ page }, testInfo) => {
  const email = uniqueEmail(testInfo.workerIndex);

  await page.goto("/register");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "註冊" }).click();

  // RegisterPage：成功後導到 /login，並把 email 帶過去填好
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("註冊成功，請登入")).toBeVisible();
  await expect(page.getByPlaceholder("Email")).toHaveValue(email);

  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "登入" }).click();

  // GuestOnly：登入後自動導到首頁；HomePage 的標題用 /api/me 的資料
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: `嗨，${email}` })).toBeVisible();
});

test("重新整理後還在登入狀態（refresh token cookie → 新的 access token）", async ({
  page,
}, testInfo) => {
  const email = uniqueEmail(testInfo.workerIndex);
  await registerViaApi(page, email);
  await loginViaUi(page, email);

  // 重新整理：記憶體裡的 access token 消失，main.tsx 的 initializeAuth() 用 cookie 打 /api/auth/refresh 換一張新的
  await page.reload();
  await expect(page.getByRole("heading", { name: `嗨，${email}` })).toBeVisible();
  // 導覽列也顯示 email（AppLayout 和 HomePage 共用同一個 /api/me 快取）
  await expect(page.getByText(email).first()).toBeVisible();
});

test("登出後回到登入頁，再開首頁會被守門員擋回登入頁", async ({ page }, testInfo) => {
  const email = uniqueEmail(testInfo.workerIndex);
  await registerViaApi(page, email);
  await loginViaUi(page, email);

  await page.getByRole("button", { name: "登出" }).click();
  // RequireAuth：status 變成 unauthenticated，導到 /login
  await expect(page).toHaveURL(/\/login$/);

  // 直接開需要登入的頁面：cookie 已被後端清掉，refresh 失敗 → 還是 /login
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "登入" })).toBeVisible();
});
