/** 【關卡 7】找不到頁面：網址不在路由表裡時顯示 */
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section>
      <h2>404：找不到這個頁面</h2>
      <Link to="/">回首頁</Link>
    </section>
  );
}
