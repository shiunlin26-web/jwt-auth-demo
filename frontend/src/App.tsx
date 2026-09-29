import { useState } from "react";

const API = "http://localhost:8000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [message, setMessage] = useState("");

  const register = async () => {
    setMessage("");
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
      setToken(data.access_token);
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
    setToken(null);
    setMe(null);
    setMessage("已登出");
  };

  const fetchMe = async () => {
    setMessage("");
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
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