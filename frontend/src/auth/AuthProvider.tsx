/**
 * 【關卡 6】登入狀態的「大腦」：保存目前誰登入了，並提供 login / logout 等動作
 *
 * 在 main.tsx 用 <AuthProvider> 把整個 App 包起來，裡面所有元件都能用 useAuth() 取得登入狀態。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import type { User } from "../api/auth";
import {
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
  setSessionExpiredHandler,
  subscribeAccessToken,
} from "../api/client";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  // 畫面用的 access token：跟 client.ts 裡的變數保持同步（下面的 subscribeAccessToken）
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState("");

  // 登入狀態由「是否還在初始化」和「有沒有 token」推算出來，不另外存，就不會跟 token 對不上
  const status: AuthStatus = initializing ? "loading" : accessToken ? "authenticated" : "unauthenticated";

  // client.ts 裡的 token 一變（登入、refresh、過期），畫面就跟著更新
  useEffect(() => subscribeAccessToken(setAccessTokenState), []);

  // apiFetch 的 refresh 也失敗時（refresh token 過期或被撤銷）→ 顯示「登入已過期」
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setNotice("登入已過期，請重新登入");
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  // App 啟動時：用 cookie 裡的 refresh token 換 access token，換得到就代表之前登入過
  const didInit = useRef(false);
  useEffect(() => {
    // React StrictMode 在開發模式會把 effect 跑兩次，用 ref 擋掉
    // （refreshAccessToken 本身也是 single-flight，這裡算雙重保險）
    if (didInit.current) return;
    didInit.current = true;

    const init = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          setAccessToken(token);
          setUser(await authApi.getMe());
        }
      } catch {
        // 沒登入過或網路錯誤，維持未登入狀態
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  // ---------- 提供給元件使用的動作 ----------

  const login = async (email: string, password: string) => {
    setNotice("");
    const { access_token } = await authApi.login(email, password); // 失敗會丟出 ApiError，交給呼叫的元件顯示
    setAccessToken(access_token);
    setUser(await authApi.getMe());
    setNotice("登入成功");
  };

  // 登出後共同要做的事
  const clearSession = (message: string) => {
    setAccessToken(null);
    setUser(null);
    setNotice(message);
  };

  const logout = async () => {
    await authApi.logout();
    clearSession("已登出");
  };

  const logoutAll = async () => {
    await authApi.logoutAll();
    clearSession("已登出所有裝置");
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setNotice("");
    const { access_token } = await authApi.changePassword(currentPassword, newPassword);
    setAccessToken(access_token); // 後端撤銷了所有 refresh token，並發新的給這台裝置
    setNotice("密碼已更新，其他裝置都已登出");
  };

  const reloadUser = async () => {
    setUser(await authApi.getMe());
  };

  const value: AuthContextValue = {
    status,
    user,
    accessToken,
    notice,
    login,
    logout,
    logoutAll,
    changePassword,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
