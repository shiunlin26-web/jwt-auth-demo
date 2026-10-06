/**
 * 【關卡 6】定義「登入狀態」長什麼樣子
 *
 * Context 是 React 內建的功能：讓很深層的元件也能拿到共用的資料，不用一層一層用 props 傳下去。
 * 這個檔案只負責「定義」，真正的資料和邏輯在 AuthProvider.tsx。
 */
import { createContext } from "react";
import type { User } from "../api/auth";

export type AuthStatus =
  | "loading" // App 剛啟動，正在用 refresh token 檢查是否已登入
  | "authenticated" // 已登入
  | "unauthenticated"; // 未登入

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  /** 登入、登出等狀態變化的提示文字，例如「已登出」「登入已過期」 */
  notice: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** 重新向後端取得使用者資料 */
  reloadUser: () => Promise<void>;
};

// 預設值 null：代表「沒有被 AuthProvider 包起來」，useAuth 會檢查這件事
export const AuthContext = createContext<AuthContextValue | null>(null);
