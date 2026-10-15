/** 【關卡 7】註冊表單（從原本的 LoginForm 拆出來）；【關卡 14】改用 React Hook Form + Zod */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { register as registerUser } from "../api/auth"; // 改名：避免和 useForm 的 register 撞名
import { getErrorMessage } from "../api/client";
import { PASSWORD_HINT, registerSchema, type RegisterInput } from "../schemas/auth";
import { hintStyle, inputStyle } from "./styles";

/** onSuccess：註冊成功後要做什麼，由使用這個元件的頁面決定（RegisterPage 會導到登入頁） */
export function RegisterForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const user = await registerUser(data.email, data.password);
      onSuccess(user.email);
    } catch (error) {
      setError("root", { message: `註冊失敗：${getErrorMessage(error)}` });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Email" autoComplete="email" {...register("email")} style={inputStyle} />
      {errors.email && <p style={hintStyle(true)}>{errors.email.message}</p>}
      <input
        placeholder="Password"
        type="password"
        autoComplete="new-password"
        {...register("password")}
        style={inputStyle}
      />
      {/* errors.password 是 zod 第一條沒過的規則的訊息；沒錯誤就顯示規則提示 */}
      <p style={hintStyle(errors.password !== undefined)}>
        {errors.password?.message ?? PASSWORD_HINT}
      </p>
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "註冊中..." : "註冊"}
      </button>
      {errors.root && <p style={{ color: "crimson" }}>{errors.root.message}</p>}
    </form>
  );
}
