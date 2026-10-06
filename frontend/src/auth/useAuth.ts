/**
 * 【關卡 6】在任何元件裡取得登入狀態：
 *   const { status, user, login, logout } = useAuth();
 */
import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    // 忘記在外層包 <AuthProvider> 時，給一個看得懂的錯誤，而不是莫名其妙的 null
    throw new Error("useAuth 必須在 <AuthProvider> 裡面使用");
  }
  return value;
}
