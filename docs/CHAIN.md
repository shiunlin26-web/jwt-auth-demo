# CHAIN.md：從零把「前端 → 後端 → 登入 → 部署 → 維護」串起來的任務書

> 這份文件**跟技術棧無關**，可以直接餵給任何 AI。每一環四段：給 AI 的任務（可直接貼）、驗收標準（你自己檢查）、常見錯誤、換技術棧會長怎樣。環 1～7 是必走的主線；環 8～11 是基礎設施，選做。
> 附錄才是本 repo 這套技術棧（FastAPI + React）的搬家清單。
> 練習專案照這個順序走，**部署在功能之前**：環 1～6 做完時專案還沒有任何業務功能，這是刻意的。

## 怎麼用

1. 開一個新 repo，把附錄 B 的 `AGENTS.md` 範本放進去。
2. 每一環：把「給 AI 的任務」貼給 AI（把 ＿＿＿ 填上你的題目），AI 做完你照「驗收標準」檢查。**漏掉、做錯的先自己找，再問。**
3. 每一環一個或幾個 commit，commit 訊息和程式裡的中文註解都自己寫，說「為什麼」。git log 就是你的學習紀錄。
4. 卡住先查 `DEBUGGING.md`，再看這裡的「常見錯誤」。
5. 疑問記在練習專案 repo 根目錄的 `QUESTIONS.md`，每三天集中問一次。
6. 環 1～6 做完才做環 7：沒有功能就先上線，是刻意的。AI 只做被要求的事，做完列「注意到但沒做」清單（練習專案的 `AGENTS.md` 會寫進去）。

版本：v1（2026-10-15，練習專案開始前）。v2（2026-10-22）：加環 8～11（基礎設施：本機整套與 E2E、可觀測性、Kubernetes、非同步訊息），選做，對應範例專案的關卡 21～24；環 1～7 沒改。練習專案走完後用踩到的坑再修。

---

## 環 1：最小打通

**目的**：證明前端、後端、資料庫三個東西能互相講話。什麼功能都沒有。

**給 AI 的任務**

> 建立一個新專案：前端一個頁面，一顆按鈕；後端一個 `GET /api/ping` 端點，呼叫時查一次資料庫（例如 `SELECT 1` 或讀目前時間）並回傳 JSON；一個雲端 Postgres（免費方案）。前端打的是**自己網域的 `/api/ping`**，由開發伺服器代理到後端，不要直接打後端的網址。所有設定（資料庫連線字串）從環境變數讀，附 `.env.example`，`.env` 不進 git。寫一份 README 說明怎麼裝、怎麼跑。只做這些，做完列出你注意到但沒做的事。

**驗收標準**

- [ ] 本機跑起前後端，瀏覽器按按鈕，畫面出現資料庫回傳的值
- [ ] DevTools → Network 看到請求網址是 `http://localhost:<前端 port>/api/ping`，不是後端的 port
- [ ] `.env` 在 `.gitignore` 裡，`git status` 看不到它；`.env.example` 有進 git
- [ ] 把 `.env` 的連線字串改錯，後端**啟動時**就失敗並說是哪個設定錯（不是按按鈕時才失敗）

**常見錯誤**

- 前端直接打後端網址：本機能跑，上線後 cookie 失效（環 2 才會發現，但問題在這裡種下）。
- 設定寫死在程式裡：上線時改不了。
- 連線字串格式：非同步驅動通常要不一樣的開頭或參數（本 repo：`postgresql+asyncpg://`、`ssl=require`）。

**換技術棧會長怎樣**

- 代理：Vite `server.proxy`、Next.js `rewrites`、Nginx `location /api`、Create React App 的 `proxy` 欄位，都是同一件事。
- 設定：Node 用 `dotenv` + 啟動時驗證（zod 或 envalid）；Go 用 `envconfig`；Python 用 `pydantic-settings`。原則一樣：**啟動時驗證，缺了就不要起來**。

---

## 環 2：登入

**目的**：註冊、登入、保持登入、登出，而且要安全到可以上線。

**給 AI 的任務**

> 把 `docs/CHAIN.md` 附錄 A 的登入模板搬進這個專案（後端和前端都搬），照附錄的「搬過去要改什麼」調整。要做到：註冊、登入、登出、登出所有裝置、改密碼、`/api/me`；access token 短效放記憶體，refresh token 放 HttpOnly cookie、有輪替和重複使用偵測、資料庫只存雜湊；前端有「需要登入」和「只給未登入」兩種守門員；重新整理後保持登入。資料表用遷移工具建，不要用自動建表。附上後端測試（至少：註冊、登入、refresh 輪替、重複使用偵測、改密碼後其他裝置失效）。只做這些。

**驗收標準**

- [ ] 註冊 → 登入 → 重新整理 → 還在登入狀態 → 關掉瀏覽器再開 → 還在
- [ ] DevTools → Application → Cookies 看到 refresh token 是 `HttpOnly`，`Path` 只涵蓋 refresh / logout 的路徑；Console 裡 `document.cookie` 看不到它
- [ ] 沒登入直接開一個需要登入的網址 → 被導到登入頁 → 登入後回到原本想去的頁
- [ ] 後端測試全綠；遷移工具的「檢查」指令說資料表定義和遷移檔一致
- [ ] 把 access token 的有效期改成 1 分鐘，等 1 分鐘再操作，Network 看到 401 → refresh → 重送，畫面沒感覺

**常見錯誤**

- refresh token 存 localStorage：XSS 一拿就走。要 HttpOnly cookie。
- 沒有輪替：被偷的 refresh token 可以用到過期。
- 有輪替但前端沒有 single-flight：同時三個請求都去 refresh，第二個就被當成重複使用，全部登出。
- 登入請求走了「會自動 refresh 的那個 client」：密碼錯的 401 被當成 token 過期。
- 測試連到正式資料庫：測試會清空資料表。測試用的連線字串要另外一個，而且程式要擋「兩個相同」。

**換技術棧會長怎樣**

- 密碼雜湊：bcrypt / argon2，任何語言都有。
- JWT：每個語言都有函式庫，簽章演算法 HS256 起步就夠。
- 守門員：Next.js 用 middleware 或 layout 檢查；Vue 用 router guard；概念一樣是「狀態驅動跳轉」。
- 遷移：Prisma Migrate、Drizzle Kit、Flyway、Rails migrations。原則一樣：**改了 schema 一定產生遷移檔，不手改已套用的遷移檔**。

---

## 環 3：容器化

**目的**：後端變成一個 image，在任何有 Docker 的地方都能一模一樣地跑。

**給 AI 的任務**

> 幫後端寫 Dockerfile：multi-stage，第一階段裝套件、第二階段只拿結果；先複製套件清單再複製程式碼讓快取有效；不用 root 跑；啟動指令先跑遷移再起伺服器，聽 `0.0.0.0` 和環境變數 `PORT`（沒給就 8000）；附 `.dockerignore` 排除 `.env`、虛擬環境、測試、node_modules。我本機沒有 Docker，所以請在 CI（環 5）裡 build 和跑，這裡先把檔案寫好並解釋每一行為什麼。

**驗收標準**

- [ ] Dockerfile 每一段有註解說為什麼（不是做什麼）
- [ ] `.dockerignore` 有 `.env`
- [ ] 啟動指令裡有 `--host 0.0.0.0`（或等價）和 `$PORT`
- [ ] 遷移在啟動時跑，不是 build 時跑（build 時連不到正式資料庫）
- [ ] （環 5 完成後）CI 的 Docker build → run → curl `/api/ping` 綠，而且 `docker logs` 看得到遷移和伺服器啟動的 log

**常見錯誤**

- 聽 `127.0.0.1`：容器外面連不進來，部署顯示成功但一直 502。
- 把 `.env` 打包進 image：密鑰進了 image，誰拿到 image 誰就有密鑰。
- 先複製程式碼再裝套件：每改一行程式都重裝套件，build 從幾秒變幾分鐘。
- 基底 image 不寫版本（`python:3`、`node:latest`）：哪天升級了行為悄悄變。

**換技術棧會長怎樣**

- Node：`FROM node:22-slim`，`npm ci --omit=dev`，啟動 `node dist/server.js`。
- Go：第一階段 `go build`，第二階段 `FROM gcr.io/distroless/static`，image 只有幾 MB。
- 結構都一樣：裝依賴 → 複製程式 → 非 root → 啟動指令讀 `PORT`。

---

## 環 4：上線

**目的**：手機用 4G 開網址能註冊、登入、重新整理後還在。

**給 AI 的任務**

> 把專案上線，全部免費方案：後端用 Docker 部署到 Render（寫 `render.yaml`），前端部署到 Vercel，資料庫用 Neon。**前後端要同站**：前端只打自己網域的 `/api/*`，由 Vercel rewrites 轉發到 Render，前端程式裡不要出現後端網址；SPA 的其他路徑都回 `index.html`。refresh cookie 保持 `SameSite=Lax`，正式環境加 `Secure`，`Path` 只涵蓋 auth 路徑。連線池要能撐過資料庫休眠（pre-ping）。密鑰只放平台的環境變數。寫下每一步要在哪個平台按什麼，以及要填哪些環境變數。

**驗收標準**

- [ ] 手機（不是 Wi-Fi，用 4G）開前端網址：註冊、登入、重新整理還在登入狀態、登出
- [ ] iPhone Safari 也要過（它對第三方 cookie 最嚴）
- [ ] 直接開一個深層網址（例如 `/settings`）不是 404
- [ ] 後端網址的 `/api/ping` 直接打得通；前端網址的 `/api/ping` 也打得通，Network 裡看到的是前端網域
- [ ] 平台上的環境變數有 `DATABASE_URL`、`JWT_SECRET`、`COOKIE_SECURE=true`；repo 裡 grep 不到密鑰
- [ ] 閒置 20 分鐘後再開：第一個請求慢（冷啟動）但會成功，第二個就正常

**常見錯誤**

- **前端直接打後端網域**：跨站，`SameSite=Lax` 的 cookie 在 refresh 時不會被帶上，重新整理就掉登入。改 `SameSite=None` 在 iPhone 上還是會被擋。**解法是同站（反向代理）**，不是改 cookie。
- rewrite 的目的地少了 `/api`，或後端沒把 API 掛在 `/api` 底下：拿到 HTML 而不是 JSON，Console 出現 `Unexpected token '<'`。
- Vercel 專案的 Root Directory 沒指到前端資料夾：讀不到 `vercel.json`。
- `VITE_*` 環境變數是 build 時打包的，改了要重新 build。
- 資料庫休眠後第一個請求 500 `connection is closed`：連線池要 pre-ping。
- 把冷啟動的 30～60 秒當成壞掉。

**換技術棧會長怎樣**

- 反向代理：Next.js `rewrites`、Nginx `location /api { proxy_pass }`、Cloudflare Workers、Caddy。一樣的概念。
- 平台：Fly.io、Railway（付費）、Cloud Run。都吃 Dockerfile，都用環境變數 `PORT`。
- 前後端放同一個服務（例如 Next.js 全端、或後端直接 serve 靜態檔）就天然同站，不需要 rewrites。

---

## 環 5：自動化

**目的**：每次 push 自動驗證，壞的程式進不了正式環境。

**給 AI 的任務**

> 加 GitHub Actions：push 和 PR 都跑。後端 job：起一個 Postgres service container 當測試資料庫 → 照 lock 檔嚴格安裝 → lint → 遷移升級 + 遷移檢查（schema 和遷移檔一致）→ 測試 → Docker build → `docker run`（注入環境變數和 `PORT`）→ curl `/api/ping` 和 `/api/health` → 印 `docker logs`。前端 job：照 lock 檔安裝 → lint → build。然後：Render 設成 CI 綠了才部署；GitHub 對 main 開 branch protection，要走 PR 且兩個 job 綠才能合併。

**驗收標準**

- [ ] Actions 分頁兩個 job 綠；點進去看得到 Postgres container 起來、Docker build 的每一層、`docker logs` 的內容
- [ ] 開一個分支，故意把一個測試改成會失敗，開 PR → CI 紅 → Merge 按鈕被擋 → 正式環境沒變。關掉 PR
- [ ] 開一個分支，改資料表定義但**不產生遷移檔**，開 PR → 本機測試會過，但 CI 的遷移檢查紅
- [ ] 改了套件清單但沒更新 lock 檔 → CI 安裝那步紅（這是對的，逼你在本機先同步）
- [ ] 直接 push main 被拒絕

**常見錯誤**

- CI 用正式資料庫跑測試：測試會清空它。用 service container，每次都是乾淨的。
- CI 的環境變數和正式環境不一致：CI 綠、正式紅。
- 只跑測試不跑 Docker：Dockerfile 壞了要到部署時才知道。
- `npm install` / 非嚴格安裝：CI 裝的版本和你本機不一樣。要 `npm ci`、`uv sync --frozen` 這類嚴格模式。

**換技術棧會長怎樣**

- GitLab CI、CircleCI 的 YAML 結構幾乎一樣：job → steps → service。
- Node 後端：`npm ci` → `eslint` → `prisma migrate deploy` + `prisma migrate diff` → `vitest` → docker。

---

## 環 6：維護

**目的**：壞掉時看得到、退得回去、換得了密鑰。

**給 AI 的任務**

> 加上線後的維護機制：(1) `/api/ping` 只回 pong（liveness），另外一個 `/api/health` 真的查資料庫並回報遷移版本和目前部署的 commit（readiness），平台的 health check 用 ping；(2) 每個請求一行結構化 log（JSON），含 request id、方法、路徑、狀態碼、耗時，request id 也放進回應 header，沒接住的例外一定記下 traceback；(3) 接 Sentry（免費方案），沒設 DSN 就不啟用，不送個資；(4) 一個用環境變數開關的除錯端點，故意丟例外，用來測 log 和 Sentry；(5) 寫 `RUNBOOK.md`：部署後檢查、網站掛了先做什麼、退版、遷移壞了怎麼辦（roll forward）、換密鑰、換資料庫密碼、備份。寫 `DEBUGGING.md`：到目前為止踩過的每一個坑，症狀 → 原因 → 修法。

**驗收標準**

- [ ] 部署後開 `/api/health`：`db` 是 ok、遷移版本是最新、commit 是剛推的
- [ ] 打開除錯端點 → 平台 log 看到有 traceback 和 request id 的那筆 → Sentry 一分鐘內收到 issue → 關掉除錯端點
- [ ] 平台的退版功能退一版 → `/api/health` 的 commit 變舊的 → 再部署回最新
- [ ] 換一次 JWT 密鑰 → 自己登入的那台重新整理**不用重新登入**（因為 refresh token 不是 JWT）
- [ ] `RUNBOOK.md` 每一節你都能照著做一次

**常見錯誤**

- 平台 health check 用 readiness：資料庫短暫斷線時程式被不斷重啟。
- log 是純文字：正式環境搜不到「哪個請求」。
- 正式環境手動 `downgrade` 遷移：程式碼和資料庫的認知對不上。要 roll forward。
- 刪欄位一次做完：退版時舊程式找不到欄位。分兩次部署：先讓程式不用它，再刪。
- 除錯端點沒有開關：任何人都能幫你灌爆 Sentry 額度。

**換技術棧會長怎樣**

- 結構化 log：Node 用 pino，Go 用 slog，一樣是一行一筆 JSON。
- 錯誤追蹤：Sentry 每個語言都有 SDK。
- health 兩個端點、roll forward、先加後刪：**跟語言無關**，是部署的通則。

---

## 環 7：擴充功能

**目的**：一個功能 = 後端 route + 遷移 + 測試 + 前端頁面 + PR 過 CI 自動上線。這一環會重複很多次。

**給 AI 的任務（每個功能貼一次）**

> 加「＿＿＿」功能。後端：資料表（掛在 `user_id` 底下）、遷移檔、CRUD 端點都要登入、**每個端點都要檢查這筆資料屬於目前使用者**（別人的回 404，不要回 403 洩漏存在）、測試至少包含「A 看不到也改不到 B 的資料」。前端：一個列表頁、一個表單，用伺服器狀態套件（本棧是 TanStack Query）管資料，改完資料讓列表過期重抓。開一個分支，做完開 PR。只做這個功能。

**驗收標準**

- [ ] 兩個帳號 A、B 各建幾筆資料，A 改網址的 id 去讀 B 的資料 → 404；用 API 工具直接打也是 404
- [ ] 測試裡有一個「跨使用者」的測試，把授權檢查那行註解掉它會紅
- [ ] 遷移檢查綠（有產生遷移檔）
- [ ] 前端新增一筆後列表自動更新，沒有手動重新整理；Network 裡只有必要的請求
- [ ] PR 的 CI 綠 → 合併 → 幾分鐘後正式環境有這個功能，`/api/health` 的 commit 對得上

**常見錯誤**

- **只有認證沒有授權**：登入了就能動所有人的資料。這是練習專案最重要的一課，範例專案沒有這個（它只有一張 user 表）。
- 授權檢查寫在前端：可以被繞過。要在後端的查詢條件裡（`WHERE user_id = 目前使用者`）。
- 前端自己維護陣列（push、filter）而不是讓快取過期：兩份資料遲早對不上。
- 一個 PR 塞三個功能：壞了不知道是哪個。

**換技術棧會長怎樣**

- 授權檢查的位置：ORM 查詢加條件（Prisma `where: { userId }`、SQLAlchemy `.where(Todo.user_id == user.id)`），或 Postgres Row Level Security。
- 伺服器狀態：TanStack Query 有 Vue、Svelte、Solid 版；SWR、Apollo（GraphQL）概念一樣：key、過期、重抓。

---

## 環 8～11：基礎設施（選做）

> 環 1～7 做完、環 7 做過幾個功能之後再來。這四環對應範例專案的關卡 21～24，每一環**一個 CI job 證明它會動**，而且用的是環 3 的同一個 image。全部免費；沒有 Docker 的機器用 CI 的 job log 驗收。

## 環 8：本機整套與 E2E

**目的**：一個指令在本機起整套；用真的瀏覽器走一遍登入主路徑；從這環起每一塊基礎設施都有 CI job 證明。

**給 AI 的任務**

> 寫一個 compose 檔（放 `infra/`）用環 3 的同一個 image 把「資料庫 + 後端」整套起來：資料庫和後端都有 healthcheck，後端等資料庫 healthy 才起，連線字串的主機名用服務名，資料放具名 volume。加 E2E 測試（Playwright 或同類，只跑一種瀏覽器）走登入主路徑三條：註冊後登入看到自己的 email、重新整理仍登入、登出後開首頁被擋回登入頁；測試自己起前端開發伺服器（代理 `/api` 到後端）、用 API 直接註冊省掉重複畫面、每條測試用不同帳號、用使用者看得到的東西找元素、不重試。新增一個只在 PR 跑、依路徑過濾、同分支新 run 取消舊 run 的 workflow，job `compose`（up --wait → 打 health 確認遷移版本是最新 → 印後端 log → down -v）和 job `e2e`（compose 起後端 → 裝瀏覽器 → 跑 E2E → HTML 報告上傳成 artifact）。只做這些，做完列出你注意到但沒做的事。

**驗收標準**

- [ ] 一個指令起整套，最後每個服務一行 `Healthy`；`/api/health` 的遷移版本是最新
- [ ] 把「等資料庫 healthy」改成「等資料庫起來」，後端比資料庫先起而退出（log 有 connection refused）；改回來
- [ ] E2E 三條綠；故意改錯一條的預期值會紅，報告看得到那一步的截圖
- [ ] CI 兩個 job 綠；run 頁面底部有報告 artifact；只改 README 的 PR 不會跑這個 workflow

**常見錯誤**

- 後端用 `localhost` 找資料庫：容器裡 localhost 是它自己，要用服務名。
- healthcheck 只看容器起來，不看能不能服務；或 image 裡沒有 curl 卻用 curl。
- E2E 用 CSS class 找元素（改樣式就壞）、共用一個帳號（不能平行、重跑撞「已存在」）、加 retries 把偶發問題藏起來。
- E2E 用假後端：驗不到 cookie 在真瀏覽器裡有沒有帶上，那正是要驗的。

**換技術棧會長怎樣**

- compose 跟語言無關；healthcheck 指令換成該 image 有的工具（`wget`、`pg_isready`、Python 的 `urllib`）。
- E2E：Playwright 有 Node、Python、Java、.NET 版；Cypress 同類。
- 前端開發伺服器代理 `/api` 這件事不變：Vite、Next、Angular CLI 都有 proxy 設定。

---

## 環 9：可觀測性

**目的**：除了錯誤和 log，要有「數字」和「一個請求走了哪幾站」；儀表板進 git；兩個都是開關、預設關。

**給 AI 的任務**

> 加指標：一個 middleware 記每個請求的計數（method、**路由樣板**、狀態碼）與耗時直方圖，`GET /metrics` 只在環境變數打開時才有、而且不放在 `/api` 底下；路由用樣板不用實際路徑，沒對上的一律記 `unmatched`；抓 `/metrics` 本身不算。compose 加一個 profile 起 Prometheus（抓後端的 `/metrics`）和 Grafana（資料來源和一張儀表板都用 provisioning 從檔案載入：每秒請求數依路由、p95 耗時、5xx 比例、請求總數依狀態碼、版本），儀表板 JSON 進 git、畫面上不可存。加追蹤：OpenTelemetry，只有設了 OTLP 端點才啟用，每個 HTTP 請求一個 span、每句 SQL 一個子 span，span 帶回應的 request id，log 帶 trace_id；健康檢查和 `/metrics` 不追蹤；compose 加一個 collector 只印到 log。CI 加 job：起 profile → 打流量 → 查 Prometheus API 有值 → 查 Grafana API 儀表板存在且透過它查得到數字 → 打一次會查資料庫的端點 → collector 的 log 有 HTTP 的 span 和 SQL 的子 span、span 上有 request id → 後端 log 有 trace_id。測試：預設 `/metrics` 404、打開後有計數、抓 `/metrics` 本身不算、沒設端點不啟用追蹤、一個請求一個 span 底下有 SQL 的子 span。只做這些。

**驗收標準**

- [ ] `/metrics` 預設 404；打開後是文字格式一行一個數字、route 是樣板；亂打路徑不會多出新的 label 值
- [ ] Prometheus 的 targets 頁後端 UP；Grafana 開起來儀表板已經在、每張圖有線
- [ ] 打一次查資料庫的端點：collector 的 log 有一棵樹（HTTP span → SQL 子 span）、span 上有 request id、後端 log 同一筆有 trace_id，兩邊的 id 對得上
- [ ] 不給端點重新啟動：log 沒有 trace_id、collector 沒有 span；程式一行沒改
- [ ] 把 collector 停掉再打請求：請求照常 200，只有 export 失敗的 log
- [ ] CI 的 job 綠

**常見錯誤**

- label 用實際路徑、user id、email：每個值一條時間序列，撐爆 Prometheus（cardinality 爆炸）。
- `/metrics` 放在 `/api` 底下：上線被代理轉出去，誰都能看。
- 直接用某家廠商的 SDK：換廠商要改程式。用 OTel，換廠商只改環境變數。
- 儀表板在畫面上點出來：重開就不見、沒有 diff、別的專案不能複製。
- 看平均不看 p95：5% 的人很慢，平均看不出來。

**換技術棧會長怎樣**

- Prometheus client 每個語言都有：Node `prom-client`、Go `client_golang`、Java Micrometer。
- OTel 每個語言都有自動 instrumentation（Express、Spring、Go `net/http`），都是「設端點才送」。
- Grafana provisioning、collector 設定跟語言無關。

---

## 環 10：Kubernetes

**目的**：同一個 image 不靠平台，交給叢集：幾個副本、怎麼探活、怎麼滾動更新與退版。平台幫你做的事，這環讓你親眼看見是誰在做；零停機是數出來的。線上不換平台。

**給 AI 的任務**

> 寫 Kubernetes 清單（kustomize：`base/` + 一個 CI 用的 overlay）：Namespace；ConfigMap 放一般設定；Secret 只放範本、不列進 kustomization（真值用指令建）；遷移用獨立的 Job；Deployment 2 副本：liveness 用 ping、readiness 用 health、resources、非 root、唯讀檔案系統（只掛 `/tmp`）、drop 所有 capability、RollingUpdate `maxSurge: 1`、`maxUnavailable: 0`、preStop 睡幾秒、terminationGracePeriod 夠長、command 蓋掉 image 的啟動指令只跑伺服器；ClusterIP Service。CI 用的單副本資料庫另放。CI 加 job：kind 開叢集 → build → load image → 起資料庫 → 建 Secret → apply -k → 等 Job 完成、等 Deployment rollout → port-forward 打 health 確認遷移最新 → 換版到同內容的 v2 tag，同時在叢集裡開一個 curl pod 每 0.5 秒打 Service 80 次，數不是 200 的次數必須是 0 → rollout history、undo 回到原 tag → set image 成不存在的 tag，確認 rollout 逾時、舊 pod 仍 Ready、Service 仍 200 → undo → 最後印 get / describe / logs。RUNBOOK 加「k8s 的退版」。不換線上平台。只做這些。

**驗收標準**

- [ ] `get pods`：N 個 `Running`、遷移 Job `Completed`；health 的遷移版本最新
- [ ] 換版期間 80 次全部 200；`rollout status` 看得到「先起新的、舊的 pending termination」
- [ ] `rollout undo` 後 image 回到原 tag、history 多一個 revision
- [ ] 壞 tag：一個 pod `ImagePullBackOff`、舊的仍 Ready、Service 仍 200；undo 恢復
- [ ] 刪一個 pod 會自動補一個；在容器裡 `kill 1` 會原地重啟（RESTARTS +1）；改 ConfigMap 不會自動生效（要 `rollout restart`）；在容器裡 `touch` image 的目錄會 Read-only
- [ ] CI 的 job 綠；Secret 的真值不在 git 任何地方（`git log -p -S` 搜不到）

**常見錯誤**

- 遷移放在每個 pod 的啟動指令：多副本同時跑遷移會打架。用 Job。
- liveness 用會查資料庫的端點：資料庫抖動時程式被不斷重啟（環 6 的教訓又來一次）。
- 沒有 readiness、或 `maxUnavailable` 不是 0：換版時掉請求。
- 沒有 preStop：Service 名單還沒更新就關掉 pod，那一兩秒的請求被拒。
- Secret 進 git：base64 不是加密。
- 用 port-forward 量零停機：它黏在一個 pod 上，那個 pod 被換它就斷，量到的不是 Service。

**換技術棧會長怎樣**

- 清單跟語言無關；探針路徑、port、環境變數名換成你的。
- 遷移 Job 的 command 換成你的工具：`prisma migrate deploy`、Flyway、golang-migrate。
- Helm 是另一種疊法（範本 + values）；kustomize 是 kubectl 內建，先學這個。

---

## 環 11：非同步訊息

**目的**：註冊成功要通知別的系統時，不在請求裡做；「待送事件」和使用者寫進同一個交易，worker 再送。Kafka 只是管道，重點是 outbox 和冪等。免費線上也走得通。

**給 AI 的任務**

> 加 transactional outbox：一張待送事件表（uuid 主鍵、topic、JSON payload、created_at、published_at 可空且有索引），註冊成功時**在同一個交易裡**寫一筆「使用者註冊了」（payload 只放 id 和必要欄位，不放密碼雜湊），commit 之後叫醒 worker。worker：撿 published_at 為空的、`FOR UPDATE SKIP LOCKED`，有設 broker 位址就送 Kafka（key 用事件 id、acks=all），沒設就印到 log，送完標 published_at；沒事做時等鈴或等輪詢間隔。consumer：訂閱 topic，處理前先把事件 id INSERT 進一張 processed 表（主鍵 = 事件 id），撞主鍵就記 duplicate 跳過；要做的事和這個 INSERT 同一個交易；commit 之後才 commit offset（關掉 auto commit，從最早的開始讀）。worker 和 consumer 是同一個 image、不同 command。compose 加 profile：Kafka 相容的單機 broker（Redpanda）、一個建 topic 的 init 容器、worker、consumer。線上免費方案開不了第二個服務：加一個模式讓 web 程序啟動時在背景跑 worker，輪詢間隔用環境變數設長（讓免費資料庫能休眠）、靠鈴即時；加一個帳號數上限環境變數，到了註冊回 503。CI 加 job：up → 註冊 → worker 的 log 有 published（transport=kafka）→ consumer 的 log 有 consumed 帶那個 email → 兩張表各一列 → 把 topic 裡那筆原封不動再送一次 → consumer 記 duplicate、processed 表仍一列。測試：註冊成功有一筆待送、註冊失敗沒有（同一個交易）、worker 送出並標記、同一筆只處理一次、背景模式會開 task、註冊後會叫醒。只做這些。

**驗收標準**

- [ ] 註冊的回應沒變慢；outbox 一列、published_at 幾秒內從空變有
- [ ] worker 的 published、consumer 的 consumed、processed 表：三個地方同一個 uuid
- [ ] 重送同一筆：consumer 記 duplicate，processed 表仍一列
- [ ] 停掉 consumer 再註冊：worker 照送、訊息留在 broker；consumer 回來補上
- [ ] worker 開兩個、註冊五筆：published 是 5 不是 10
- [ ] 線上：log 搜 published 看得到、transport 是 log；沒開第二個服務、沒接付費 broker；資料庫閒置時仍能休眠
- [ ] CI 的 job 綠

**常見錯誤**

- register 直接送 broker：commit 失敗仍送出、送出前當掉丟事件。broker 不參與資料庫交易。
- enqueue 寫在 commit 之後：不在同一個交易，那就不是 outbox。
- consumer 用記憶體判斷重複：重啟就忘。要用資料庫的主鍵。
- 「要做的事」和處理標記不在同一個交易：標記了卻沒做。
- auto commit offset：處理到一半當掉，那筆就丟了。
- worker 輪詢太頻繁：免費資料庫永遠休眠不了，額度被吃光。

**換技術棧會長怎樣**

- outbox、at-least-once + 冪等：跟語言無關，是分散式系統的通則。
- Kafka 客戶端每個語言都有（kafkajs、franz-go、confluent-kafka）；RabbitMQ、SQS、NATS 概念相同，保證不同（先確認是不是 at-least-once）。
- `SKIP LOCKED` 是 Postgres / MySQL 8 的功能；沒有的資料庫用狀態欄位 + 樂觀鎖。

---

## 附錄 A：本技術棧（FastAPI + React）的搬家清單

從本 repo 複製到練習專案。**先搬、跑起來、再改**。每個檔案開頭有中文註解說為什麼這樣寫，搬過去請保留。

> 2026-10-27 照這份清單在乾淨目錄實際搬過一次（PR #75）：後端 ruff、pyright、`alembic revision --autogenerate`、`alembic check`、67 個測試、起服務註冊登入；前端 lint、prettier、tsc、vitest、build，全綠。那次補上的漏洞已經改進下面的表。

### 後端（`backend/`）

| 檔案 | 搬過去要改什麼 |
| --- | --- |
| `pyproject.toml`、`uv.lock`、`.python-version` | 改 `name`、`description`；套件清單、ruff / pyright 設定不用改。搬完跑 `uv sync` |
| `config.py` | 不用改。所有設定都從這裡讀，新專案的新設定加在這裡 |
| `database.py` | 不用改 |
| `models.py` | `User`、`RefreshToken`、`OutboxEvent`、`ProcessedEvent` 四張都保留（後兩張是關卡 24 的，註冊時會寫 outbox，拆掉要連 `outbox.py` 一起改，先不要）；練習專案的表加在後面，都要有指向 `user.id` 的 `owner_id` 外鍵（命名照 `API.md` 第 2 條；模板自己的 `refreshtoken` 用 `user_id` 是舊名，不用改） |
| `schemas.py` | 保留；新功能的請求 / 回應格式加在後面 |
| `security.py`、`rate_limit.py` | 不用改（密碼雜湊、JWT、refresh token；頻率限制與代理後的客戶端 IP）。正式環境記得設 `TRUSTED_PROXY_HOPS`（`render.yaml` 已有） |
| `dependencies.py` | 不用改。新端點用 `Depends(get_current_user)` 拿目前使用者 |
| `routes/__init__.py`、`routes/auth.py`、`routes/users.py` | 不用改。新功能另開 `routes/todos.py` 之類，在 `main.py` 掛進 `api` router |
| `main.py` | 保留 middleware（request id、no-store）、`/api` 前綴、`ping`、`health`、`_boom`、`_ip`；`include_router` 加新的 |
| `logging_config.py` | 不用改 |
| `metrics.py`、`tracing.py`、`outbox.py` | **要搬，不用改**。`main.py` 直接 import `metrics` 和 `tracing`，`routes/auth.py` 直接 import `outbox`，少一個後端起不來（ruff 也會因為 import 分組錯而報 I001）。全靠環境變數開關：什麼都不設就是「`/metrics` 有、追蹤不送、註冊事件只印到 log」 |
| `alembic.ini`、`migrations/env.py`、`migrations/script.py.mako` | 不用改。**不要**複製 `migrations/versions/` 裡的檔案，新專案從頭產生：`uv run alembic revision --autogenerate --rev-id 0001 -m "init"` |
| `tests/` 整個資料夾（`conftest.py`、`helpers.py`、`test_auth.py`、`test_rules.py`、`test_health.py`、`test_rate_limit.py`、`test_register_cap.py`、`test_metrics.py`、`test_outbox.py`、`test_tracing.py`）、`pytest.ini` | 不用改。`conftest.py` 的 `TRUNCATE` 那行要把新專案的表名加進去（現在已經有四張） |
| `Dockerfile`、`.dockerignore`、`.env.example` | 不用改 |

搬完先跑：`uv sync` → 設 `.env`（`DATABASE_URL`、`JWT_SECRET`、`TEST_DATABASE_URL`；`.env.example` 裡 `TEST_DATABASE_URL` 那行是註解掉的，取消註解再填）→ `uv run alembic revision --autogenerate --rev-id 0001 -m "init"`（預期印出 Detected added table 四次：`outboxevent`、`processedevent`、`user`、`refreshtoken`）→ `uv run alembic upgrade head` → `uv run alembic check`（預期 `No new upgrade operations detected.`）→ `uv run pytest -q`（67 個測試應該全綠，數字以輸出為準）→ `uv run uvicorn main:app --reload --port 8000`，開 `/api/health` 要看到 `"migration":"0001"`。

### 前端（`frontend/`）

| 檔案 | 搬過去要改什麼 |
| --- | --- |
| `package.json`、`package-lock.json`、`.nvmrc`、`.env.example` | 改 `name`。搬完 `npm ci` |
| `vite.config.ts`、`vitest.config.ts`、`vercel.json`、`tsconfig*.json`、`eslint.config.js`、`.prettierrc`、`.prettierignore`、`index.html` | `vercel.json` 的 `destination` 改成新的 Render 網址（是 `render.yaml` 的 `name` 加 `.onrender.com`）；`index.html` 的 `<title>`；其他不用改。`tsconfig.node.json` 的 include 有列 `playwright.config.ts` 和 `e2e`，環 8 前不搬那兩個也沒關係，tsc 不會因為找不到而報錯 |
| `src/test/setup.ts`、`src/test/server.ts`、`src/api/client.test.ts`、`src/auth/RequireAuth.test.tsx`、`src/components/LoginForm.test.tsx` | 不用改。新功能的測試照 `LoginForm.test.tsx` 的樣子寫在被測檔案旁邊；`server.ts` 的 `handlers` 加新 API 的預設回應 |
| `src/main.tsx` | 不用改（`initializeAuth()`、`QueryClientProvider`、`RouterProvider`） |
| `src/api/client.ts`、`src/api/auth.ts`、`src/api/queryClient.ts` | 不用改。新功能的 API 另開 `src/api/todos.ts`，用 `api.get` / `api.post`（會自動帶 token、自動 refresh） |
| `src/auth/authStore.ts`、`authService.ts`、`useAuth.ts`、`useMe.ts`、`RequireAuth.tsx`、`GuestOnly.tsx` | 不用改。新功能的 query / mutation 照 `useMe.ts` 的樣子另開 `src/features/<功能>/queries.ts`（`LEARNING.md` 關卡 12 有範例） |
| `src/app/router.tsx`、`src/app/AppLayout.tsx` | 加新頁面的路由（要登入的放在 `RequireAuth` 底下）、導覽列加連結 |
| `src/pages/`（Login、Register、Home、Settings、NotFound） | 保留；Home 改成你的功能頁或留著 |
| `src/components/`（LoginForm、RegisterForm、ChangePasswordForm、UserPanel、ui.tsx） | 保留；`ui.tsx` 是共用的 Tailwind 元件，新頁面也用它；`UserPanel` 顯示 token 的那行是學習用，正式專案拿掉 |
| `src/schemas/auth.ts`、`src/index.css`、`public/favicon.svg` | 不用改（`index.css` 只有 Tailwind 的 import 和 body 底色；`favicon.svg` 被 `index.html` 引用，不搬會 404）。新功能的表單規則照 `schemas/auth.ts` 的樣子另開 `src/schemas/<功能>.ts` |

### 其他

| 檔案 | 搬過去要改什麼 |
| --- | --- |
| `.github/workflows/ci.yml`、`.github/dependabot.yml`、`.editorconfig`、`.gitattributes` | 如果後端 / 前端資料夾名稱一樣就完全不用改（`ci.yml` 裡的 `jwt-backend:ci` 只是 CI 內部的 image 名，留著沒關係） |
| `.github/workflows/codeql.yml`、`audit.yml` | 不用改。公開 repo 免費；⚠️ 練習專案如果設成私有，CodeQL 要付費，那就把 `codeql.yml` 拿掉 |
| `.github/workflows/deploy.yml` | 選配。沒設 secret `RENDER_DEPLOY_HOOK` 就自動跳過，要用看 `docs/RUNBOOK.md` 第 0 節 |
| `render.yaml` | 改 `name`（Render 的網址跟著它，`frontend/vercel.json` 要對上）；其他不用改 |
| `.gitignore`、`CLAUDE.md` | 不用改 |
| `README.md` | 自己寫，不要複製（本 repo 的 README 是學習專案的說明） |
| `scripts/setup.ps1` | 第 8～9 行的 clone 網址與資料夾名改成新 repo（README 如果照抄那兩行也要改）；其餘不用改 |
| `AGENTS.md` | 用附錄 B 的範本，不要直接複製本 repo 的（它有學習專案專屬的規矩） |
| `docs/DEBUGGING.md`、`docs/RUNBOOK.md` | 複製過去當起點，練習專案踩到的坑加上去 |
| `scripts/setup.sh`、`scripts/doctor.sh`、`scripts/doctor.ps1` | 不用改（裡面沒有 repo 網址，都是從目前所在的 repo 動作） |
| `infra/`、`.github/workflows/infra.yml` | 環 8～11 才要，可以先不搬。搬的話：compose 的 `name`、k8s 的 namespace、image 名、Grafana 儀表板 JSON 的 `uid` 與 `title` 改成新專案的 |
| `frontend/e2e/`、`frontend/playwright.config.ts` | 環 8 才要；測試裡的文案（按鈕、標題、placeholder）換成新專案的 |
| `backend/worker.py`、`consumer.py` | 環 11 才要（compose 裡獨立的 worker 與 consumer 程序）；不用改。`metrics.py`、`tracing.py`、`outbox.py` 不在這裡，它們是必搬的，見後端表 |

### 搬家後第一次要做的外部步驟

1. Neon：和本 repo 一樣開**兩個**專案（`<題目>-prod` 給 Render，本機不碰；`<題目>` 給本機的 `DATABASE_URL`），連線字串改成 `postgresql+asyncpg://`、`ssl=require`；測試資料庫在本機那個專案裡另建（SQL Editor 跑 `CREATE DATABASE <題目>_test;`，填 `TEST_DATABASE_URL`）。為什麼分兩個：`HANDOFF.md` 第 7 節
2. GitHub：開 repo，推上去，確認 CI 綠
3. Render：New → Blueprint → 選 repo → 填 `DATABASE_URL`、`JWT_SECRET` → 等 Deploy live → 開 `/api/health`
4. Vercel：Import repo，Root Directory 設 `frontend`，**先**把 `vercel.json` 的 Render 網址改好再 Import（`DEBUGGING.md` 有為什麼）
5. Render：Auto-Deploy 改成 After CI Checks Pass（⚠️ 免費方案不一定有這個選項，沒有就用 `deploy.yml` 的 Deploy Hook，`RUNBOOK.md` 第 0 節）；GitHub：main 開 branch protection
6. Sentry：開專案，DSN 填進 Render 的 `SENTRY_DSN`

這六步在 `LEARNING.md` 關卡 10、11 的「⚠️ 開始前」有逐格的點法。

---

## 附錄 B：練習專案的 `AGENTS.md` 範本

```markdown
# AGENTS.md

這是一個由學習者指揮 AI 拼出來的練習專案：＿＿＿（題目一句話）。
技術棧與結構照 jwt-auth-demo（FastAPI + React + Neon，Render + Vercel），登入模板是從那裡搬來的。

## 結構
（搬完之後照實際情況填）

## 常用指令
（從 jwt-auth-demo 的 AGENTS.md 複製）

## 規則
（複製 jwt-auth-demo 的 `AGENTS.md`「AI 在練習專案裡的規則」「慣例」「不要碰」三節，一字不改，只在規則後面加這一條）
5. 每個需要登入的端點都要檢查資料屬於目前使用者（不是你的回 404），並有對應的測試。見 jwt-auth-demo 的 `docs/API.md` 第 2 條。
```
