# PLAN.md：20 天計畫（2026-10-12）的決定紀錄

> 狀態：已過期、已縮減（2026-10-28）。原本是 199 行的 20 天計畫（v3）；時程比它快、內容全部做完，所以只留「當時為什麼這樣排」和還被別處引用的幾段。完整原文在 git 歷史：`git show 5976278:docs/PLAN.md`。
> 活的東西在別處：學習者是誰 → `HANDOFF.md` 第 1 節；已定的事 → `HANDOFF.md` 第 5 節；練習專案的規則 → `CHAIN.md`「怎麼用」；免費方案查證 → `PLAN-INFRA.md` 第 8 節；故障演練題庫 → `drills/README.md`；接下來的路 → `PLAN-FULLSTACK.md`。

## 1. 當時的前提（2026-10-12）

- 學習者 JS/TS 背景、目標全端，之後要能自己開新專案把前端、後端、登入、部署整條鏈串起來；每天 4 小時。
- 以為只剩不到 20 天可以用 Claude（後來不成立）；本機沒有 Docker（後來有了一台 Mac，`HANDOFF.md` 第 1 節）；只用免費方案、不買網域。
- 學習模式：AI 做完整的範例並帶著理解 → 學習者開新專案用 AI 拼出同一條鏈，不是手寫。
- 專案現況：關卡 0～8 完成、34 個測試；尚未做 Docker、部署、CI、維護。

## 2. 核心想法（都做了，理由還有用）

1. **兩個專案分工**：範例專案（本 repo）由 AI 補齊缺的環節後凍結，只改文件；練習專案學習者下任務、AI 做、學習者驗收。
2. **真正帶得走的是跟技術棧無關的任務書** `CHAIN.md`，每環四段：給 AI 的任務、驗收標準、常見錯誤、換棧會長怎樣。
3. **部署在功能之前**：練習專案沒有任何業務功能時就先上線、先有 CI。
4. **練的是指揮與驗收，不是打字**；但讀得懂 log 和關鍵的二十行不能省，AI 卡住時這是唯一的出路。
5. **稀缺的 AI 時間花在沒有 AI 很難自己摸的部分**：部署、CI、維運。

## 3. 當時定下、至今未變的決定

- **正式環境前後端同站**：Vercel rewrites 把 `/api/*` 轉到 Render，cookie 保持 `SameSite=Lax`、`path=/api/auth`，不用 `SameSite=None` 硬撐（iOS Safari 擋第三方 cookie）。做法與理由在 `LEARNING.md` 關卡 10、`QA.md` Q12～Q13、`CHAIN.md` 環 4 常見錯誤第一條。
- 遷移在容器啟動時跑（start command），不用付費的 Pre-Deploy Command。
- CI 綠了才部署，加 branch protection；免費方案沒有「After CI Checks Pass」就改 Deploy Hook（後來做成選配的 25-D）。
- 連線池 `pool_pre_ping=True`；Neon pooled 連線字串時 asyncpg 要 `statement_cache_size=0`。
- 冷啟動不是 bug：Render 閒置 15 分鐘、Neon 閒置 5 分鐘休眠。
- AI 指引寫在 `AGENTS.md`（跨工具），`CLAUDE.md` 只放 `@AGENTS.md`。
- 套件管理換成 `pyproject.toml` + `uv`，lint 用 `ruff`。

## 4. 後來推翻或改掉的

- 「刻意不碰 Kubernetes、docker compose、Tailwind、Zod、Vitest、slowapi」：Tailwind、Zod、Vitest、slowapi 做成關卡 14～17（學習者要求程式碼要專業水準）；compose、Kubernetes、訊息佇列做在 `infra/`、只在 CI 和 Mac 跑（`PLAN-INFRA.md` 第 0 節）。仍然不碰的清單在 `ARCHITECTURE.md` 第 3 節、`HANDOFF.md` 第 5 節第 7 條。
- 題目「待辦含分類」：2026-10-15 改為學習者自己決定；2026-10-27 從三個候選裡選了記帳本（`PLAN-FULLSTACK.md` 第 6 節）。
- Codespaces、docker compose 列為「20 天後再玩」：compose 成了關卡 21，Codespaces 有了 Mac 之後不需要。
- 20 天時程：第 1～7 天的內容（關卡 9～12）在第 3 天前做完；之後由 `HANDOFF.md`、`PLAN-INFRA.md`、`PLAN-FULLSTACK.md` 接手。
- 「本 repo 是私有」：2026-10-22 公開（`PLAN-INFRA.md` 第 7 節）。

## 5. 學習者當時的決定（`HANDOFF.md` 第 5 節的出處）

1. 每天 4 小時，加一天示範 TanStack Query（做成關卡 12）。
2. 只用免費方案。
3. 題目先定「待辦含分類」（後改，見第 4 節）。
4. 不買網域。
5. 故障演練從清單挑（清單已搬到 `docs/drills/README.md`，做成 patch 的有 5 題）。

版本：v1～v3（2026-10-12～10-15）原文；v4（2026-10-28）縮成決定紀錄。
