# 20 天計畫：把「前端 → 後端 → 部署 → 維護」這條鏈打通

> 狀態：v2，已經過獨立審查並依審查意見修正。審查結論：「修正以下幾點後可以開始」，
> 四個必須修正（B1～B4）與十一個建議修正（N1～N11）都已納入本版。

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
- 尚未做：Docker、部署、CI、維護

## 核心想法

1. **兩個專案，分工明確**
   - **範例專案 = 本 repo**：Claude 補齊缺的環節，學習者讀、跑、弄壞再修好。第 7 天後凍結，只改文件。
   - **練習專案 = 學習者自己開的新 repo**：照同一條鏈再走一次。學習者下任務、AI 拼、學習者驗收。
2. **真正帶得走的是一份「跟技術棧無關、可直接餵給 AI 的任務書」`CHAIN.md`**。
   每一環寫四段：給 AI 的任務描述、驗收標準、常見錯誤、換技術棧會長怎樣。
3. **部署在功能之前**。練習專案在沒有任何業務功能時就要先上線、先有 CI。
4. **練的是指揮與驗收，不是打字**。但「讀得懂 log 和關鍵的二十行程式」不能省，AI 卡住時這是唯一的出路。
5. **稀缺的 Claude 時間花在「沒有 AI 很難自己摸」的部分**：部署、CI、維運。
   純前端套件（TanStack Query、Zod、Vitest、Tailwind）文件極好、JS/TS 背景自己學得會，移到 20 天後的自學清單。

## 鏈路定義（兩個專案都照這個順序）

| 環 | 內容 | 驗收標準 | 範例專案現況 |
| --- | --- | --- | --- |
| 1 最小打通 | 前端按鈕打後端 `/ping`，後端查一次 DB | 瀏覽器看到 DB 回傳的值 | ✅ |
| 2 登入 | 註冊、登入、保護路由、refresh | 關掉瀏覽器再開還是登入狀態 | ✅ |
| 3 容器化 | 後端 Dockerfile（multi-stage + uv）、`.dockerignore` | CI 裡 build → run → `curl /ping` 成功、看得到 `docker logs` | 缺 |
| 4 上線 | 後端 Render、前端 Vercel、DB Neon；**前後端同站**（Vercel rewrites 代理 `/api`）；啟動時自動跑遷移 | 手機用 4G 開網址能註冊、登入、重新整理後還在登入狀態 | 缺 |
| 5 自動化 | GitHub Actions 跑 ruff + pytest + Docker；**CI 綠了才部署**；branch protection | 推一個讓測試失敗的 commit 到 PR → CI 紅 → merge 被擋 → 正式環境沒變 | 缺 |
| 6 維護 | `/health`、結構化 log、Sentry、遷移回滾、換密鑰流程、備份概念、冷啟動 | 壞掉時知道去哪看、怎麼復原 | 缺 |
| 7 擴充功能 | 一個功能 = 後端 route + 遷移 + 測試 + 前端頁面 + PR 過 CI 自動上線 | 每個功能有測試、能自動上線 | 練習專案做 |

## 第 3 天之前就要定的架構決定：正式環境前後端同站

這不是「踩坑」，是會把登入打爛的決策，審查特別點出來。

- 現在 refresh cookie 是 `samesite="lax"`、`path="/auth"`（`backend/routes/auth.py`）。
  前端在 `*.vercel.app`、後端在 `*.onrender.com` 是**跨站**，Lax cookie 在跨站的 `POST /auth/refresh` 不會被帶上，
  部署後「重新整理保持登入」直接失效。
- 改 `SameSite=None; Secure` 技術上可行，但 iOS Safari 預設擋第三方 cookie，Chrome 也在逐步限制，
  驗收標準「手機用 4G 開網址」在 iPhone 上會過不了。
- **決定：同站。** Vercel 的 `vercel.json` 加 `rewrites`，把 `/api/:path*` 轉發到 Render；
  前端 `VITE_API_URL` 改成相對路徑 `/api`；cookie 的 `path` 改成 `/api/auth`。
  沒有跨站，連 CORS 都不用設，cookie 保持 Lax 更安全。
- 這就是「反向代理」，換技術棧長一樣：Next.js rewrites、Nginx `location /api`、Cloudflare 都是同一個概念。
  寫進 `CHAIN.md` 第 4 環「常見錯誤」第一條，「為什麼不用 SameSite=None 硬撐」寫進 `QA.md`。

## 沒有本機 Docker 的替代方案

- 後端 Dockerfile 寫進 repo，觀念要懂：image vs container、layer 快取、multi-stage build、`.dockerignore`、`$PORT`。
- **CI 就是你的 Docker 練習場**：workflow 用 `services: postgres:16` 起一個 container 當測試 DB（親眼看到「container 起來、服務連上去」），
  再 build 後端 image → `docker run` 注入環境變數 → `curl /ping` → `docker logs`。
  這一段涵蓋 run、logs、port mapping、環境變數注入四個核心概念，而且是真的在跑，壞了會紅。
- Render 的 build log 與 runtime log 是第二個觀察點。
- 前端 Dockerfile（nginx 靜態檔）列選讀：Vercel 不吃 Dockerfile，做了沒人用。
- `docker compose` 與 Codespaces 列為「20 天後有空再玩」。

## 技術選擇

- **保留現有技術棧**，練習專案也用同一套。換棧移植是 20 天後自己做的事。
- 順手現代化：`requirements.txt` → `pyproject.toml` + `uv`；lint 用 `ruff`。
- 部署：後端 **Render** 免費方案（Railway 已無長期免費方案；學習者第 1 天自行確認最新定價），前端 Vercel，DB Neon。
- 遷移時機：start command 寫成 `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`。
  最通用的做法，Render、Fly、Docker CMD 全部適用，不依賴付費的 Pre-Deploy 功能。
- 連線池：`create_async_engine(..., pool_pre_ping=True)`；用 Neon pooled 連線字串時 asyncpg 要 `statement_cache_size=0`。
- **冷啟動**：Render 免費方案閒置 15 分鐘休眠、Neon 閒置約 5 分鐘休眠，第一個請求可能等 30～60 秒，這是正常現象不是 bug。寫進 `DEBUGGING.md`。
- CI 綠了才部署：Render 設定「Auto-Deploy: After CI Checks Pass」（或關掉自動部署改由 Actions 打 deploy hook）；GitHub 開 branch protection。
- 錯誤追蹤：Sentry 免費方案。
- AI 指引檔：內容寫在 `AGENTS.md`（跨工具慣例），`CLAUDE.md` 只放 `@AGENTS.md`。
- **刻意不碰**：Kubernetes、Terraform、完整 AWS、docker compose、前端 Dockerfile、Tailwind、TanStack Query、Zod、Vitest（後四個進 20 天後自學清單）、slowapi（環 6 順手加或略過）。
- 免費額度：Render 免費實例時數跨所有服務合計；Neon 免費方案專案數要確認，不夠就用 Neon branch 或同專案第二個 database；Vercel Hobby 限非商業用途。

## 每日安排

| 天 | 專案 | 做什麼 | 產出 |
| --- | --- | --- | --- |
| 1～2 | 範例 | 環 3 + 環 5 前半：uv + ruff + `pyproject.toml`；後端 Dockerfile、`.dockerignore`；GitHub Actions：postgres service → ruff → pytest → docker build/run/curl/logs | LEARNING.md 關卡 9（Docker 與 CI） |
| 3～4 | 範例 | 環 4：**第一件事是同站架構**（Vercel rewrites、cookie path、`VITE_API_URL`）；Render 後端、Vercel 前端、Neon 正式 DB；`pool_pre_ping`；啟動時跑遷移；密鑰放哪 | LEARNING.md 關卡 10（部署）；踩到的坑記進 `DEBUGGING.md` |
| 5～6 | 範例 | 環 6：`/health`、結構化 log、Sentry、遷移回滾、換 JWT 密鑰流程、備份概念、冷啟動說明；CI 綠了才部署 + branch protection；`AGENTS.md` | LEARNING.md 關卡 11（維護） |
| 7 | 範例 | 寫 `CHAIN.md` 任務書初版，含附錄「本技術棧的搬家清單」（後端 7 個檔案 + alembic 初始化、前端 7 個檔案）；**範例專案凍結** | `CHAIN.md` v1 |
| 8 | 緩衝 | 範例專案部署最可能爆的時候，留一天 | — |
| 9 | 練習 | 學習者開新 repo，題目限制「兩張表、一個外鍵、一個列表頁、一個表單」；環 1 | 練習專案 ping 通 |
| 10～11 | 練習 | 環 2：照搬家清單搬登入模板，前後端都搬；搬不動的地方記下來 | 練習專案可登入 |
| 12～13 | 練習 | 環 3～5：Dockerfile、Render、Vercel 同站、CI 綠了才部署。**此時還沒有任何業務功能，刻意的** | 練習專案上線 |
| 14～15 | 練習 | 環 7：用現有的 axios + Zustand 做 CRUD，重點是「一個功能走完整條鏈」；每個功能一個 PR 過 CI 自動上線 | 練習專案有功能 |
| 16 | 練習 | 故障演練：學習者**自己挑**一種故障（遷移跑壞、少一個環境變數、換了 JWT_SECRET），由 Claude 執行，學習者靠 log 與測試找出來。環 6 套到練習專案標為「時間不夠可砍」 | `DEBUGGING.md` 素材 |
| 17 | 兩邊 | 用練習的痛點修訂 `CHAIN.md` v2 與 `DEBUGGING.md` | 真正帶得走的兩份 |
| 18 | 兩邊 | `QA.md`、補齊 LEARNING.md 與 TOUR.md、20 天後自學清單 | 收尾 |
| 19～20 | 緩衝 | 延誤吸收與總問答 | — |

## 練習專案的規則

1. 學習者下任務（可直接複製 `CHAIN.md` 的任務描述），Claude **只做被要求的事**；
   做完要**列出「我注意到但你沒要求、所以我沒做」的清單，只列不做**。這條寫進練習專案的 `AGENTS.md`，不靠學習者每次提醒。
2. 做完由學習者照驗收標準檢查；漏掉、做錯的要**先自己找出來**再問。
3. 學習者自己 commit、自己寫中文註解「為什麼這樣寫」，git log 就是學習紀錄。
4. 開 `QUESTIONS.md` 累積疑問，每三天集中問一次。

## 與既有文件的銜接

- LEARNING.md 路線圖：Docker 與 CI、部署、維護插為關卡 9、10、11；原 9～13 改編號為 12～16 並標「20 天後自學」。
- LEARNING.md 第 2010 行的空殼段落改標題為「關卡 12～16」；TOUR.md 結尾「下一步」改指向關卡 9。
- LEARNING.md 第 8 行「不需要部署、不需要 CI，全部在本地」改成「關卡 0～8 全部在本地；關卡 9 起會用到免費雲端服務」。
- 搬家清單放在 LEARNING.md 關卡 6「之後其他專案怎麼用」下方，`CHAIN.md` 附錄引用它。`CHAIN.md` 主體保持跟技術棧無關。

## 最終產出清單

- 本 repo：後端 Dockerfile、CI、可上線、維護機制、`AGENTS.md` + `CLAUDE.md`、LEARNING.md 關卡 9～11、TOUR.md 更新
- `docs/CHAIN.md`：跟技術棧無關、可餵給任何 AI 的鏈路任務書 + 本技術棧搬家清單附錄
- `docs/DEBUGGING.md`：症狀 → 原因 → 修法
- `docs/QA.md`：JWT 與部署的觀念問答
- 20 天後自學清單：TanStack Query、Zod、Vitest、Tailwind、docker compose、自訂網域與 DNS
- 練習專案：一個由學習者指揮 AI 拼出來、已上線、有 CI 的完整小專案

## 學習者要自己決定的事

1. **每天時數**。2 小時和 4 小時是兩個不同的計畫；本版以 2～3 小時為準，所以砍了前端套件。若有 4 小時，可在第 7 天前加一天讓 Claude 在範例專案示範 TanStack Query 取代 `getMe`。
2. **後端平台**：本版寫 Render，請在第 1 天自己看最新定價確認。
3. **練習專案題目**：記帳或待辦含分類都可以，條件是「兩張表、一個外鍵、一個列表頁、一個表單」。
4. **正式網域**：用 `*.vercel.app` 就好，還是買自己的網域多學 DNS 與自訂網域 HTTPS（多半天）。
5. **故障演練要演練什麼**：第 16 天自己挑，不要讓 Claude 挑。

## 已知風險

- 範例專案部署（第 3～4 天）與練習專案部署（第 12～13 天）最容易爆，所以緩衝放在第 8 天和第 19～20 天。
- 「只做被要求的事」的副作用是練習專案可能悄悄留安全洞，靠規則 1 的「只列不做」清單補。
- 20 天後換 AI 工具，`CHAIN.md` 與 `AGENTS.md` 都避免綁定 Claude 專屬語法。
