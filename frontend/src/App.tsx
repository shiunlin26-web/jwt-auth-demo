import { useEffect, useRef, useState } from "react";
const API = "http://localhost:8000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [message, setMessage] = useState("");

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

  const canSubmit = email.trim() !== "" && password.length >= 8;

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
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={register} disabled={!canSubmit}>註冊</button>
            <button onClick={login} disabled={!canSubmit}>登入</button>
          </div>
        </>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, wordBreak: "break-all" }}>
            Token: {token.slice(0, 40)}...
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchMe}>取得我的資料</button>
            <button onClick={logout}>登出</button>
          </div>
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