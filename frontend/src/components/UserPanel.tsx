/** 【關卡 6】使用者資料（關卡 7：登出移到導覽列、登出所有裝置移到帳號設定頁） */
import { useState } from "react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";

export function UserPanel() {
  const { user, accessToken, reloadUser } = useAuth();
  const [message, setMessage] = useState("");

  const handleReload = async () => {
    setMessage("");
    try {
      // 走 apiFetch：token 過期時會自動 refresh，可以在 Network 觀察
      await reloadUser();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      {/* 學習用：顯示 access token 的前 40 個字，正式專案不需要 */}
      <p style={{ fontSize: 12, wordBreak: "break-all", color: "gray" }}>Token: {accessToken?.slice(0, 40)}...</p>

      <button onClick={handleReload}>重新取得我的資料</button>
      {message && <p style={{ color: "crimson" }}>{message}</p>}

      {user && (
        <pre style={{ background: "#f0f0f0", color: "#333", padding: 12, borderRadius: 4, overflowX: "auto" }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}
