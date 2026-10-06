/** 【關卡 7】帳號設定頁：/settings（需要登入） */
import { useState } from "react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { ChangePasswordForm } from "../components/ChangePasswordForm";

export function SettingsPage() {
  const { logoutAll } = useAuth();
  const [message, setMessage] = useState("");

  const handleLogoutAll = async () => {
    setMessage("");
    try {
      await logoutAll(); // 登出後 RequireAuth 會自動導到 /login
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <section>
      <h2>帳號設定</h2>

      <ChangePasswordForm />

      <h3 style={{ marginTop: 32 }}>登出所有裝置</h3>
      <p style={{ fontSize: 14, color: "gray" }}>手機遺失或在別人的電腦登入忘了登出時使用。</p>
      <button onClick={handleLogoutAll}>登出所有裝置</button>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
    </section>
  );
}
