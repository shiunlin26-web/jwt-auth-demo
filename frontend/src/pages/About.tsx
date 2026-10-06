/** 【關卡 7】首頁：/（需要登入） */
import { useAuth } from "../auth/useAuth";

export function About() {
  const { user } = useAuth();

  return (
    <section>
      <h2>About，{user?.email}</h2>
    </section>
  );
}
