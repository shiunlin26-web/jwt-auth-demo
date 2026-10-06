/**
 * 【關卡 6】App 只負責「依登入狀態決定顯示哪個畫面」
 * 登入的邏輯在 auth/，跟後端溝通在 api/，畫面在 components/
 */
import { useAuth } from "./auth/useAuth";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { LoginForm } from "./components/LoginForm";
import { UserPanel } from "./components/UserPanel";

function App() {
  const { status, notice } = useAuth();

  if (status === "loading") {
    return <div style={{ padding: 40 }}>載入中...</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 420 }}>
      <h1>JWT Auth Demo</h1>

      {notice && <p style={{ color: "blue" }}>{notice}</p>}

      {status === "authenticated" ? (
        <>
          <UserPanel />
          <ChangePasswordForm />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;
