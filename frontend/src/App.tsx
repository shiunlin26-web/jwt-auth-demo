import { useEffect, useRef, useState } from "react";
// 【關卡 2】API 網址改從環境變數讀（frontend/.env 的 VITE_API_URL），沒設定就用本機預設值
// Vite 只會把「VITE_ 開頭」的變數給前端用，避免不小心把其他秘密打包進網頁
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [message, setMessage] = useState("");
  // 【關卡 3】改密碼表單
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 用 ref 讓 apiFetch 讀到最新 token
  const tokenRef = useRef<string | null>(null);

  const updateToken = (t: string | null) => {
    tokenRef.current = t;
    setToken(t);
  };

  // 【關卡 1】single-flight refresh
  // 後端有輪替之後，同一個 refresh token 只能用一次。
  // 如果 3 個請求同時 401、各自去 refresh，第 2、3 個會拿著已作廢的舊 token，
  // 被後端當成「重複使用」→ 全部登出。
  // 所以把「進行中的 refresh」存起來，後來的人直接等同一個 Promise。
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = (): Promise<string | null> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
        .then(async (res) => (res.ok ? (await res.json()).access_token : null))
        .catch(() => null) // 網路錯誤也當作 refresh 失敗
        .finally(() => {
          refreshPromiseRef.current = null; // 結束後清掉，下次才會重新發
        });
    }
    return refreshPromiseRef.current;
  };

  const [isInitializing, setIsInitializing] = useState(true);
const didInit = useRef(false);

useEffect(() => {
  // React StrictMode 在開發模式會把 effect 跑兩次，用 ref 擋掉
  // 【關卡 1】有了輪替，同一個 token 送兩次會觸發重複使用偵測。
  // 現在 refreshAccessToken 本身已是 single-flight，這裡算是雙重保險。
  if (didInit.current) return;
  didInit.current = true;

  const init = async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        updateToken(newToken);
      }
    } catch {
      // 沒登入過，正常
    } finally {
      setIsInitializing(false);
    }
  };

  init();
}, []);


  // 統一處理 401 的 fetch
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const doFetch = (t: string | null) =>
      fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      });

    let res = await doFetch(tokenRef.current);

    if (res.status === 401) {
      // 嘗試刷新（多個請求同時 401 時，只會真的發出一次 refresh）
      const newToken = await refreshAccessToken();

      if (newToken) {
        updateToken(newToken);
        res = await doFetch(newToken);
      } else {
        // refresh 失敗 → 登出
        updateToken(null);
        setMe(null);
        setMessage("登入已過期，請重新登入");
      }
    }

    return res;
  };

  const register = async () => {
    setMessage("");
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`註冊成功：${data.email}`);
    } else {
      setMessage(`註冊失敗：${JSON.stringify(data.detail)}`);
    }
  };

  const login = async () => {
    setMessage("");
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      updateToken(data.access_token);
      setMessage("登入成功");
    } else {
      setMessage(`登入失敗：${JSON.stringify(data.detail)}`);
    }
  };

  const logout = async () => {
    setMessage("");
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    updateToken(null);
    setMe(null);
    setMessage("已登出");
  };

  // 【關卡 3】登出所有裝置：需要 access token，所以用 apiFetch
  const logoutAll = async () => {
    setMessage("");
    const res = await apiFetch(`${API}/auth/logout-all`, { method: "POST" });
    if (res.ok) {
      updateToken(null);
      setMe(null);
      setMessage("已登出所有裝置");
    } else {
      setMessage("登出所有裝置失敗");
    }
  };

  // 【關卡 3】改密碼：成功後後端會發新的 token 給這台裝置，其他裝置全部登出
  const changePassword = async () => {
    setMessage("");
    const res = await apiFetch(`${API}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      updateToken(data.access_token); // 換上新的 access token
      setCurrentPassword("");
      setNewPassword("");
      setMessage("密碼已更新，其他裝置都已登出");
    } else {
      setMessage(`改密碼失敗：${JSON.stringify(data.detail)}`);
    }
  };

  const fetchMe = async () => {
    setMessage("");
    const res = await apiFetch(`${API}/me`);
    const data = await res.json();
    if (res.ok) {
      setMe(data);
    } else {
      setMessage(`取得資料失敗：${JSON.stringify(data.detail)}`);
    }
  };

  // 【關卡 0】密碼規則要和後端 schemas.py 一致：8～72 個可列印 ASCII 字元
  // 前端檢查是為了即時提示，真正的把關在後端（前端檢查可以被繞過）
  const getPasswordError = (pw: string): string | null => {
    if (!/^[\x20-\x7E]*$/.test(pw)) return "密碼只能包含英文字母、數字、空白與符號";
    if (pw.length < 8) return "密碼至少 8 個字元";
    if (pw.length > 72) return "密碼最多 72 個字元";
    return null;
  };
  const passwordError = password === "" ? null : getPasswordError(password);

  const hasEmail = email.trim() !== "";
  // 註冊：要符合密碼規則；登入：有填就好（規則只在設定密碼時檢查）
  const canRegister = hasEmail && password !== "" && passwordError === null;
  const canLogin = hasEmail && password !== "";

  // 【關卡 3】新密碼套用同一套規則（getPasswordError 共用）
  const newPasswordError = newPassword === "" ? null : getPasswordError(newPassword);
  const canChangePassword = currentPassword !== "" && newPassword !== "" && newPasswordError === null;

  if (isInitializing) {
  return <div style={{ padding: 40 }}>載入中...</div>;
}

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>JWT Auth Demo</h1>

      {!token ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
            />
            <p style={{ fontSize: 12, margin: 0, color: passwordError ? "crimson" : "gray" }}>
              {passwordError ?? "8～72 個英文字母、數字或符號"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={register} disabled={!canRegister}>註冊</button>
            <button onClick={login} disabled={!canLogin}>登入</button>
          </div>
        </>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, wordBreak: "break-all" }}>
            Token: {token.slice(0, 40)}...
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={fetchMe}>取得我的資料</button>
            <button onClick={logout}>登出</button>
            <button onClick={logoutAll}>登出所有裝置</button>
          </div>

          <h3 style={{ marginTop: 24 }}>修改密碼</h3>
          <input
            placeholder="目前密碼"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <input
            placeholder="新密碼"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <p style={{ fontSize: 12, margin: "0 0 8px", color: newPasswordError ? "crimson" : "gray" }}>
            {newPasswordError ?? "8～72 個英文字母、數字或符號"}
          </p>
          <button onClick={changePassword} disabled={!canChangePassword}>修改密碼</button>
        </div>
      )}

      {message && <p style={{ color: "blue" }}>{message}</p>}

      {me && (
        <pre style={{ background: "#f0f0f0", padding: 12, borderRadius: 4 }}>
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;