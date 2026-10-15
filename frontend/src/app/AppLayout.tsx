/**
 * 【關卡 7】所有頁面共用的外框：上方導覽列 + 提示訊息 + 頁面內容
 *
 * 在 router.tsx 裡，所有頁面都是它的子頁面，所以每一頁都會有這個導覽列。
 * <Outlet /> 的位置就是各頁面顯示的地方。
 */
import { useState, type CSSProperties } from "react";
import { NavLink, Outlet } from "react-router";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { useMe } from "../auth/useMe";

// NavLink 會告訴我們「這個連結是不是目前所在的頁面」，用來把它加粗
const navLinkStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  fontWeight: isActive ? "bold" : "normal",
  textDecoration: isActive ? "underline" : "none",
});

export function AppLayout() {
  const { status, notice, logout } = useAuth();
  // 【關卡 12】使用者資料改從 TanStack Query 拿（沒登入時 useMe 不會發請求，data 是 undefined）
  const { data: me } = useMe();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    try {
      await logout(); // 登出後 status 變成 unauthenticated，RequireAuth 會自動導到 /login
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 480 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>JWT Auth Demo</h1>
        <nav style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {status === "authenticated" && (
            <>
              <NavLink to="/" end style={navLinkStyle}>
                首頁
              </NavLink>
              <NavLink to="/settings" style={navLinkStyle}>
                帳號設定
              </NavLink>
              <span style={{ marginLeft: "auto", fontSize: 14, color: "gray" }}>{me?.email}</span>
              <button onClick={handleLogout}>登出</button>
            </>
          )}
          {status === "unauthenticated" && (
            <>
              <NavLink to="/login" style={navLinkStyle}>
                登入
              </NavLink>
              <NavLink to="/register" style={navLinkStyle}>
                註冊
              </NavLink>
            </>
          )}
        </nav>
      </header>

      {notice && <p style={{ color: "blue" }}>{notice}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
