/**
 * 【關卡 6】API 的底層：所有跟後端溝通的共用邏輯都在這裡
 *
 * 這個檔案「不是 React」，只是一般的 TypeScript 模組。
 * 好處：不受元件重新渲染影響，任何地方（元件、hook、其他模組）都能直接 import 使用。
 *
 * 裡面有四塊：
 * 1. access token 的存放（記憶體）
 * 2. refreshAccessToken：用 refresh token 換新的 access token（single-flight）
 * 3. apiFetch：呼叫需要登入的 API，遇到 401 自動 refresh 再重試
 * 4. 錯誤處理：把後端的錯誤統一轉成 ApiError
 */

// 【關卡 2】後端網址從環境變數讀，沒設定就用本機預設值
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ============================================================
// 1. access token 存放在記憶體（模組裡的變數）
// ============================================================
// 不放 localStorage：被 XSS 注入的惡意 JS 一行就能偷走。
// 放在記憶體：重新整理就消失，所以 App 啟動時要用 refresh token 換回來（見 AuthProvider）。

let accessToken: string | null = null;
const tokenListeners = new Set<(token: string | null) => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  // 通知所有訂閱者（AuthProvider 會訂閱，用來更新畫面上的登入狀態）
  tokenListeners.forEach((listener) => listener(token));
}

/** 訂閱 access token 的變化；回傳「取消訂閱」的函式（給 useEffect 的 cleanup 用） */
export function subscribeAccessToken(listener: (token: string | null) => void): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

// ============================================================
// 2. refresh：用 cookie 裡的 refresh token 換新的 access token
// ============================================================
// 【關卡 1】single-flight：同一時間只送出一個 refresh 請求。
// 後端有輪替，同一個 refresh token 只能用一次；如果同時送兩次，
// 第二次會被當成「重複使用」而把使用者整個登出。
// 原本存在 useRef 裡，現在放在模組變數，效果一樣，但不用依附在某個元件上。

let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // 讓瀏覽器帶上 refresh token cookie
    })
      .then(async (res) => (res.ok ? ((await res.json()) as TokenResponse).access_token : null))
      .catch(() => null) // 網路錯誤也當作 refresh 失敗
      .finally(() => {
        refreshPromise = null; // 結束後清掉，下次才會重新發
      });
  }
  return refreshPromise;
}

// ============================================================
// 3. apiFetch：呼叫「需要登入」的 API
// ============================================================

// refresh 也失敗（refresh token 過期或被撤銷）時要通知誰
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

/**
 * 自動帶上 Authorization header；遇到 401 時：
 *   refresh 成功 → 換上新 token，重送一次
 *   refresh 失敗 → 清掉 token，通知「登入已過期」
 *
 * ⚠️ 只用在需要登入的 API。登入、註冊這類 API 要用一般的 fetch，
 *    不然「密碼錯誤」的 401 會被誤以為是 token 過期，跑去 refresh。
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const send = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await send(getAccessToken());

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
      res = await send(newToken);
    } else {
      setAccessToken(null);
      sessionExpiredHandler?.();
    }
  }

  return res;
}

// ============================================================
// 4. 錯誤處理
// ============================================================

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

/** 後端回傳錯誤（status 不是 2xx）時丟出的錯誤，帶著狀態碼和整理過的訊息 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * 把後端的 detail 整理成人看得懂的文字
 * - 一般錯誤：detail 是字串，例如 "Incorrect email or password"
 * - 422 驗證錯誤：detail 是陣列，每一項的 msg 是錯誤原因
 */
function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: { msg?: string }) => (item.msg ?? "").replace(/^Value error, /, ""))
      .join("；");
  }
  return "發生未知錯誤";
}

/** 讀取回應的 JSON；status 不是 2xx 就丟出 ApiError */
export async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, formatDetail(body.detail));
  }
  if (res.status === 204) {
    return undefined as T; // 204 No Content：沒有內容可以讀
  }
  return (await res.json()) as T;
}

/** 從任何錯誤取出要顯示給使用者的文字 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
