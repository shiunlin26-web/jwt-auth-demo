/** 【關卡 6】登入後顯示：修改密碼表單 */
import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { getPasswordError, PASSWORD_HINT } from "../utils/password";
import { hintStyle, inputStyle } from "./styles";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // 新密碼套用和註冊一樣的規則；目前密碼不套（跟登入一樣，只判斷對不對）
  const newPasswordError = newPassword === "" ? null : getPasswordError(newPassword);
  const canSubmit = currentPassword !== "" && newPassword !== "" && newPasswordError === null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setMessage("");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage(`改密碼失敗：${getErrorMessage(error)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>修改密碼</h3>
      <input
        placeholder="目前密碼"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="新密碼"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={inputStyle}
      />
      <p style={hintStyle(newPasswordError !== null)}>{newPasswordError ?? PASSWORD_HINT}</p>
      <button type="submit" disabled={!canSubmit}>
        修改密碼
      </button>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
    </form>
  );
}
