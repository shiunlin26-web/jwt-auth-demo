/** 【關卡 7】註冊表單（從原本的 LoginForm 拆出來） */
import { useState, type FormEvent } from "react";
import { register } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { getPasswordError, PASSWORD_HINT } from "../utils/password";
import { hintStyle, inputStyle } from "./styles";

/** onSuccess：註冊成功後要做什麼，由使用這個元件的頁面決定（RegisterPage 會導到登入頁） */
export function RegisterForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const passwordError = password === "" ? null : getPasswordError(password);
  const canRegister = email.trim() !== "" && password !== "" && passwordError === null;

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (!canRegister) return;
    setMessage("");
    try {
      const user = await register(email, password);
      onSuccess(user.email);
    } catch (error) {
      setMessage(`註冊失敗：${getErrorMessage(error)}`);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <p style={hintStyle(passwordError !== null)}>{passwordError ?? PASSWORD_HINT}</p>
      <button type="submit" disabled={!canRegister}>
        註冊
      </button>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
    </form>
  );
}
