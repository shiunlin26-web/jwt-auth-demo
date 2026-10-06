/** 【關卡 6】未登入時顯示：註冊與登入表單 */
import { useState, type FormEvent } from "react";
import { register } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { getPasswordError, PASSWORD_HINT } from "../utils/password";
import { hintStyle, inputStyle, rowStyle } from "./styles";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const passwordError = password === "" ? null : getPasswordError(password);
  const hasEmail = email.trim() !== "";
  // 註冊：要符合密碼規則；登入：有填就好（規則只在設定密碼時檢查）
  const canRegister = hasEmail && password !== "" && passwordError === null;
  const canLogin = hasEmail && password !== "";

  const handleRegister = async () => {
    setMessage("");
    try {
      const user = await register(email, password);
      setMessage(`註冊成功：${user.email}，可以登入了`);
    } catch (error) {
      setMessage(`註冊失敗：${getErrorMessage(error)}`);
    }
  };

  // 用 <form> 的 onSubmit，在密碼框按 Enter 也能登入
  const handleLogin = async (event: FormEvent) => {
    event.preventDefault(); // 阻止瀏覽器預設的「送出表單後重新整理頁面」
    if (!canLogin) return;
    setMessage("");
    try {
      await login(email, password); // 成功後 AuthProvider 會更新狀態，App 自動切換畫面
    } catch (error) {
      setMessage(`登入失敗：${getErrorMessage(error)}`);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <p style={hintStyle(passwordError !== null)}>{passwordError ?? PASSWORD_HINT}</p>

      <div style={rowStyle}>
        <button type="button" onClick={handleRegister} disabled={!canRegister}>
          註冊
        </button>
        <button type="submit" disabled={!canLogin}>
          登入
        </button>
      </div>

      {message && <p style={{ color: "crimson" }}>{message}</p>}
    </form>
  );
}
