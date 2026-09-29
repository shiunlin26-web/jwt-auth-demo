import { useRef, useState } from "react";

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
      // 嘗試刷新
      const refreshRes = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        updateToken(data.access_token);
        res = await doFetch(data.access_token);
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