/**
 * 【關卡 6】所有跟登入有關的 API，一個後端端點對應一個函式
 *
 * 元件不直接寫 fetch，而是呼叫這裡的函式：
 *   const user = await getMe();
 * 好處：網址、HTTP 方法、要不要帶 token，都集中在這裡管理；元件只關心「拿到什麼資料」。
 */
import { API_URL, apiFetch, readJson, type TokenResponse } from "./client";

// 對應後端 schemas.py 的 UserRead
export type User = {
  id: number;
  email: string;
  created_at: string;
  last_login_at: string | null;
};

const jsonHeaders = { "Content-Type": "application/json" };

// ---------- 不需要登入的 API：用一般的 fetch ----------

export async function register(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  return readJson<User>(res);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include", // 讓瀏覽器存下後端回傳的 refresh token cookie
    body: JSON.stringify({ email, password }),
  });
  return readJson<TokenResponse>(res);
}

export async function logout(): Promise<void> {
  // 靠 cookie 找到要刪的 refresh token，不需要 access token
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

// ---------- 需要登入的 API：用 apiFetch（自動帶 token、自動 refresh）----------

export async function getMe(): Promise<User> {
  return readJson<User>(await apiFetch("/me"));
}

export async function logoutAll(): Promise<void> {
  return readJson<void>(await apiFetch("/auth/logout-all", { method: "POST" }));
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<TokenResponse> {
  const res = await apiFetch("/auth/change-password", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  return readJson<TokenResponse>(res);
}
