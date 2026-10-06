/** 【關卡 7】登入頁：/login */
import { Link, useLocation } from "react-router";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  // 從註冊頁跳過來時，RegisterPage 會用 navigate 的 state 帶上剛註冊的 email
  const location = useLocation();
  const registeredEmail = (location.state as { registeredEmail?: string } | null)?.registeredEmail;

  return (
    <section>
      <h2>登入</h2>
      {registeredEmail && <p style={{ color: "green" }}>註冊成功，請登入</p>}
      <LoginForm defaultEmail={registeredEmail} />
      <p style={{ fontSize: 14 }}>
        還沒有帳號？<Link to="/register">註冊</Link>
      </p>
    </section>
  );
}
