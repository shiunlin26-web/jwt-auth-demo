/** 【關卡 6】登入表單（關卡 7：註冊拆到 RegisterForm，各自一個頁面） */
import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { inputStyle } from "./styles";

export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 登入只要有填就好（密碼規則只在設定密碼時檢查，關卡 0）
  const canLogin = email.trim() !== "" && password !== "";

  // 用 <form> 的 onSubmit，在密碼框按 Enter 也能登入
  const handleLogin = async (event: FormEvent) => {
    event.preventDefault(); // 阻止瀏覽器預設的「送出表單後重新整理頁面」
    if (!canLogin) return;
    setMessage("");
    try {
      // 成功後 store 更新為已登入 → GuestOnly 發現已登入，自動導到首頁（或原本想去的頁面）
      await login(email, password);
    } catch (error) {
      setMessage(`登入失敗：${getErrorMessage(error)}`);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" disabled={!canLogin}>
        登入
      </button>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
    </form>
  );
}
