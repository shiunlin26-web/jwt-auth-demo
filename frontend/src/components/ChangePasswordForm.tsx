/** 【關卡 6】登入後顯示：修改密碼表單；【關卡 14】改用 React Hook Form + Zod */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { PASSWORD_HINT, changePasswordSchema, type ChangePasswordInput } from "../schemas/auth";
import { hintStyle, inputStyle } from "./styles";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    reset, // 成功後把欄位清空
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      reset();
    } catch (error) {
      setError("root", { message: `改密碼失敗：${getErrorMessage(error)}` });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>修改密碼</h3>
      <input
        placeholder="目前密碼"
        type="password"
        autoComplete="current-password"
        {...register("currentPassword")}
        style={inputStyle}
      />
      <input
        placeholder="新密碼"
        type="password"
        autoComplete="new-password"
        {...register("newPassword")}
        style={inputStyle}
      />
      <p style={hintStyle(errors.newPassword !== undefined)}>
        {errors.newPassword?.message ?? PASSWORD_HINT}
      </p>
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "修改中..." : "修改密碼"}
      </button>
      {errors.root && <p style={{ color: "crimson" }}>{errors.root.message}</p>}
    </form>
  );
}
