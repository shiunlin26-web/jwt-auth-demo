# 20 天計畫：把「前端 → 後端 → 部署 → 維護」這條鏈打通

> 狀態：草稿，待獨立審查。

## 背景與目標

**學習者**：JS/TS 背景，目標全端，之後要能自己開新專案把前端、後端、登入、部署整條鏈串起來，
再擴充功能；希望概念貫通後換技術棧也能移植。

**限制**：

- 只剩不到 20 天可以用 Claude，之後可能換別的 AI 工具或沒有 AI。
- 本機**沒有 Docker**（Claude 的雲端環境也沒有 Docker daemon）。
- 只學現代常見、之後用得到的東西。
- 學習模式是「Claude 做完整的範例並帶著理解 → 學習者開新專案用 AI 拼積木拼出同一條鏈」，不是手寫。

**專案現況**（本 repo，關卡 0～8 已完成）：

- 後端 FastAPI + SQLModel（async SQLAlchemy）+ Neon Postgres + Alembic + pytest（34 個測試）
- 登入：access token（記憶體）+ refresh token（HttpOnly cookie、輪替、重複使用偵測、DB 存雜湊）
- 前端 React 19 + Vite + React Router + Zustand + axios，已拆成可複製的 `api/`、`auth/` 模板
- 文件：`LEARNING.md`（每關改了什麼）、`TOUR.md`（照請求流程讀程式）
- 尚未做：Docker、部署、CI、維護、關卡 9～13（TanStack Query、Zod、Tailwind、Vitest、slowapi）

## 核心想法

1. **兩個專案，分工明確**
   - **範例專案 = 本 repo**：Claude 補齊缺的環節，學習者讀、跑、弄壞再修好。第 7 天後凍結，只改文件。
   - **練習專案 = 學習者自己開的新 repo**：照同一條鏈再走一次。學習者下任務、AI 拼、學習者驗收。
2. **真正帶得走的是一份「跟技術棧無關、可直接餵給 AI 的任務書」`CHAIN.md`**。
   每一環寫三段：給 AI 的任務描述、驗收標準、常見錯誤。
3. **部署在功能之前**。練習專案在沒有任何業務功能時就要先上線、先有 CI。
4. **練的是指揮與驗收，不是打字**。但「讀得懂 log 和關鍵的二十行程式」不能省，AI 卡住時這是唯一的出路。

## 鏈路定義（兩個專案都照這個順序）

| 環 | 內容 | 驗收標準 | 範例專案現況 |
| --- | --- | --- | --- |
| 1 最小打通 | 前端按鈕打後端 `/ping`，後端查一次 DB | 瀏覽器看到 DB 回傳的值 | ✅ |
| 2 登入 | 註冊、登入、保護路由、refresh | 關掉瀏覽器再開還是登入狀態 | ✅ |
| 3 容器化 | 前後端各一個 Dockerfile、`.dockerignore` | CI 裡 `docker build` 成功 | 缺 |
| 4 上線 | 後端 PaaS、前端 Vercel、DB Neon、部署時自動跑遷移 | 手機用 4G 開網址能註冊登入 | 缺 |
| 5 自動化 | GitHub Actions 跑測試 + build，合併 main 後自動部署 | 推一個壞 commit 會被擋下 | 缺 |
| 6 維護 | healthcheck、結構化 log、錯誤追蹤、遷移回滾、換密鑰流程、備份概念 | 壞掉時知道去哪看、怎麼復原 | 缺 |
| 7 擴充功能 | CRUD、TanStack Query、Zod 表單、Vitest | 每個功能有測試、能自動上線 | 關卡 9～12 |

## 沒有本機 Docker 的替代方案

- Dockerfile 一樣寫進 repo，觀念要懂：image vs container、layer 快取、multi-stage build、`.dockerignore`。
- 驗證改成：GitHub Actions 加 `docker build` 步驟（壞了會紅）＋ 部署平台的 build log。
- 想親手跑 container：GitHub Codespaces 內建 Docker，用免費額度體驗半天 `docker run / logs / exec`。
- `docker compose` 從主線拿掉（本機 DB 已是 Neon，用不到），列為選讀。

## 技術選擇

- **保留現有技術棧**，練習專案也用同一套。換棧移植是 20 天後自己做的事。
- 順手現代化：`requirements.txt` → `pyproject.toml` + `uv`；lint 用 `ruff`。
- 部署平台：後端 Render 或 Railway（擇一，從 Dockerfile build），前端 Vercel，DB Neon。
- 錯誤追蹤：Sentry 免費方案。
- **刻意不碰**：Kubernetes、Terraform、完整 AWS、docker compose（選讀）、Tailwind（自學）、slowapi（維護那環順手加或略過）。
- 加 `CLAUDE.md`：專案結構、慣例、怎麼跑測試，讓 AI 在專案裡不亂拼。

## 每日安排

| 天 | 專案 | 做什麼 | 產出 |
| --- | --- | --- | --- |
| 1～2 | 範例 | 環 3 + 環 5 前半：Dockerfile ×2、`.dockerignore`、uv + ruff、GitHub Actions 跑 pytest + ruff + docker build | LEARNING.md 關卡 9（Docker 與 CI） |
| 3～4 | 範例 | 環 4：Render/Railway 後端、Vercel 前端、Neon 正式 DB、部署時自動 `alembic upgrade head`；跨網域 cookie（SameSite/Secure）、CORS、密鑰放哪 | LEARNING.md 關卡 10（部署）；踩到的坑記進除錯手冊 |
| 5～6 | 範例 | 環 6：`/health`、結構化 log、Sentry、遷移回滾流程、換 JWT 密鑰流程、備份概念；合併 main 自動部署；加 `CLAUDE.md` | LEARNING.md 關卡 11（維護） |
| 7 | 範例 | 寫 `CHAIN.md` 任務書初版；**範例專案凍結** | `CHAIN.md` v1 |
| 8 | 練習 | 學習者開新 repo（題目：只有一兩種資料的小東西，例如記帳或待辦含分類）；環 1 | 練習專案 ping 通 |
| 9～10 | 練習 | 環 2：照 LEARNING.md 第 6 關「之後其他專案怎麼用」搬登入模板；搬不動的地方記下來 | 練習專案可登入 |
| 11 | 練習 | 環 3～5：Dockerfile、部署、CI。**此時還沒有任何業務功能，刻意的** | 練習專案上線 |
| 12～14 | 練習 | 環 7：CRUD，順便拼進 TanStack Query 與 Zod；給一個元件寫 Vitest；每個功能一個 PR 走 CI | 練習專案有功能 |
| 15～16 | 練習 | 環 6 套到練習專案；一次故障演練（Claude 刻意弄壞一個地方，學習者靠 log 與測試找出來） | 除錯手冊素材 |
| 17～19 | 兩邊 | 用練習的痛點修訂 `CHAIN.md` 與除錯手冊；寫 JWT 與部署觀念問答；補齊 LEARNING.md、TOUR.md | `CHAIN.md` v2、`DEBUGGING.md`、`QA.md` |
| 20 | — | 緩衝與總問答 | — |

## 練習專案的規則

1. 學習者下任務（可直接複製 `CHAIN.md` 的任務描述），Claude **只做被要求的事**，不主動補沒講到的東西。
2. 做完由學習者照驗收標準檢查；漏掉、做錯的要**先自己找出來**再問。
3. 學習者自己 commit、自己寫中文註解「為什麼這樣寫」，git log 就是學習紀錄。
4. 開 `QUESTIONS.md` 累積疑問，每三天集中問一次。

## 最終產出清單

- 本 repo：Dockerfile、CI、可上線、維護機制、`CLAUDE.md`、LEARNING.md 關卡 9～11、TOUR.md 更新
- `docs/CHAIN.md`：跟技術棧無關、可餵給任何 AI 的鏈路任務書（每環：任務描述／驗收標準／常見錯誤／換技術棧會長怎樣）
- `docs/DEBUGGING.md`：症狀 → 原因 → 修法
- `docs/QA.md`：JWT 與部署的觀念問答
- 練習專案：一個由學習者指揮 AI 拼出來、已上線、有 CI 的完整小專案

## 已知風險

- 部署那兩天最容易爆時程（跨網域 cookie、平台免費方案限制）。緩衝只有第 20 天。
- 練習專案的「不主動補」規則，Claude 執行起來可能不夠嚴格，學習者要主動提醒。
- 20 天後換 AI 工具，`CHAIN.md` 寫法要避免綁定 Claude 專屬語法。
