/** 【關卡 7】註冊頁：/register */
import { Link, useNavigate } from "react-router";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  // useNavigate：用程式碼換頁（相當於點了一個連結）
  const navigate = useNavigate();

  return (
    <section>
      <h2>註冊</h2>
      {/* 註冊成功 → 換到登入頁，並把 email 帶過去，登入頁的 email 欄位會自動填好 */}
      <RegisterForm onSuccess={(email) => navigate("/login", { state: { registeredEmail: email } })} />
      <p style={{ fontSize: 14 }}>
        已經有帳號了？<Link to="/login">登入</Link>
      </p>
    </section>
  );
}
