/**
 * 【關卡 6】登入表單（關卡 7：註冊拆到 RegisterForm，各自一個頁面）
 *
 * 【關卡 14】改用 React Hook Form + Zod。對照第 6 關的手寫版：
 *   useState 一個欄位一個       → useForm 一次管所有欄位
 *   onChange={(e) => setX(...)}  → {...register("x")}
 *   手算 canLogin               → formState.isValid（由 zod schema 決定）
 *   useState 存錯誤訊息          → setError("root", ...) 放進表單狀態
 *   event.preventDefault()      → handleSubmit 幫你做
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { loginSchema, type LoginInput } from "../schemas/auth";
import { inputStyle } from "./styles";

export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const { login } = useAuth();
  const {
    register, // 把 input 接上表單：register("email") 回傳 name、onChange、onBlur、ref
    handleSubmit, // 先跑 zod 驗證，全部通過才呼叫你的 onSubmit
    setError, // 把後端回的錯誤放進表單狀態（"root" 代表「整張表單」而不是某個欄位）
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema), // 驗證規則交給 zod
    mode: "onChange", // 每次輸入都驗證，isValid 才會即時更新（預設是送出時才驗）
    defaultValues: { email: defaultEmail, password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // 成功後 store 更新為已登入 → GuestOnly 發現已登入，自動導到首頁（或原本想去的頁面）
      await login(data.email, data.password);
    } catch (error) {
      setError("root", { message: `登入失敗：${getErrorMessage(error)}` });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Email" autoComplete="email" {...register("email")} style={inputStyle} />
      <input
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
        style={inputStyle}
      />
      {/* isSubmitting：onSubmit 還在 await 時是 true，擋住連點兩次 */}
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "登入中..." : "登入"}
      </button>
      {errors.root && <p style={{ color: "crimson" }}>{errors.root.message}</p>}
    </form>
  );
}
