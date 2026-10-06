/** 【關卡 7】首頁：/（需要登入） */
import { useAuth } from "../auth/useAuth";
import { UserPanel } from "../components/UserPanel";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section>
      <h2>嗨，{user?.email}</h2>
      <UserPanel />
    </section>
  );
}
