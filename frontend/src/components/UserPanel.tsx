/** 【關卡 6】登入後顯示：使用者資料與登出按鈕 */
import { useState } from "react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { rowStyle } from "./styles";

export function UserPanel() {
  const { user, accessToken, reloadUser, logout, logoutAll } = useAuth();
  const [message, setMessage] = useState("");

  // 包一層：執行動作，失敗時顯示錯誤
  const run = (action: () => Promise<void>) => async () => {
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <p>
        已登入：<strong>{user?.email}</strong>
      </p>
      {/* 學習用：顯示 access token 的前 40 個字，正式專案不需要 */}
      <p style={{ fontSize: 12, wordBreak: "break-all", color: "gray" }}>Token: {accessToken?.slice(0, 40)}...</p>

      <div style={rowStyle}>
        {/* 重新取得資料會走 apiFetch：token 過期時會自動 refresh，可以在 Network 觀察 */}
        <button onClick={run(reloadUser)}>重新取得我的資料</button>
        <button onClick={run(logout)}>登出</button>
        <button onClick={run(logoutAll)}>登出所有裝置</button>
      </div>

      {message && <p style={{ color: "crimson" }}>{message}</p>}

      {user && (
        <pre style={{ background: "#f0f0f0", color: "#333", padding: 12, borderRadius: 4, overflowX: "auto" }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}
