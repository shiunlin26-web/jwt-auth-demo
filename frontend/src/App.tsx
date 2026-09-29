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
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`註冊成功：${data.email}`);
    } else {
      setMessage(`註冊失敗：${data.detail}`);
    }
  };

  const login = async () => {
    setMessage("");
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.access_token);
      setMessage("登入成功，已拿到 token");
    } else {
      setMessage(`登入失敗：${data.detail}`);
    }
  };

  const fetchMe = async () => {
    setMessage("");
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMe(data);
    } else {
      setMessage(`取得資料失敗：${data.detail}`);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>JWT Auth Demo</h1>

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
        <button onClick={register}>註冊</button>
        <button onClick={login}>登入</button>
      </div>

      {token && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, wordBreak: "break-all" }}>
            Token: {token.slice(0, 40)}...
          </p>
          <button onClick={fetchMe}>取得我的資料</button>
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