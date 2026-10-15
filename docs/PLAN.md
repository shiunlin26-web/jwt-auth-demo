# 20 天計畫：把「前端 → 後端 → 部署 → 維護」這條鏈打通

> 狀態：v3。v2 經獨立審查修正；v3 加入學習者的五項決定、免費方案查證結果、題目評估、故障演練清單。
> 每天時數以 4 小時為準。
>
> **2026-10-15 進度註記**（這份計畫的本文不再改，當設計理由看）：
> 第 1～7 天的內容（關卡 9～12）已全部完成並合併到 main，比時程快。範例專案凍結。
> 第 8 天的交接文件已產出：`HANDOFF.md`（教練手冊）、`CHAIN.md` v1（七環任務書 + 搬家清單）、`QA.md`（觀念問答）、
> 關卡 13 改為「工程品質基線」（型別檢查、格式化、Dependabot），依學習者「程式碼要專業水準」的要求加入；原本列為 20 天後自學的 Zod、Tailwind、Vitest、slowapi 也已由 Claude 做完（關卡 14～17），範例專案到此全部完成並凍結。
> 練習專案的題目**改由學習者另行決定**（原本的「待辦含分類」評估仍可參考），第 10 天起的安排等題目定了再照 `CHAIN.md` 走。
> 下方「與既有文件的銜接」四條已全部做完。

## 背景與目標

**學習者**：JS/TS 背景，目標全端，之後要能自己開新專案把前端、後端、登入、部署整條鏈串起來，
再擴充功能；希望概念貫通後換技術棧也能移植。

**限制**：

- 只剩不到 20 天可以用 Claude，之後可能換別的 AI 工具或沒有 AI。
- 本機**沒有 Docker**（Claude 的雲端環境也沒有 Docker daemon）。
- **只用免費方案**（網域也不買，見下方查證）。
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
   - **範例專案 = 本 repo**：Claude 補齊缺的環節，學習者讀、跑、弄壞再修好。第 8 天後凍結，只改文件。
   - **練習專案 = 學習者自己開的新 repo**：照同一條鏈再走一次。學習者下任務、AI 拼、學習者驗收。
2. **真正帶得走的是一份「跟技術棧無關、可直接餵給 AI 的任務書」`CHAIN.md`**。
   每一環寫四段：給 AI 的任務描述、驗收標準、常見錯誤、換技術棧會長怎樣。
3. **部署在功能之前**。練習專案在沒有任何業務功能時就要先上線、先有 CI。
4. **練的是指揮與驗收，不是打字**。但「讀得懂 log 和關鍵的二十行程式」不能省，AI 卡住時這是唯一的出路。
5. **稀缺的 Claude 時間花在「沒有 AI 很難自己摸」的部分**：部署、CI、維運。
   前端套件只示範 TanStack Query 一個（學習者選擇加一天）；Zod、Vitest、Tailwind 移到 20 天後自學。

## 鏈路定義（兩個專案都照這個順序）

| 環 | 內容 | 驗收標準 | 範例專案現況 |
| --- | --- | --- | --- |
| 1 最小打通 | 前端按鈕打後端 `/ping`，後端查一次 DB | 瀏覽器看到 DB 回傳的值 | ✅ |
| 2 登入 | 註冊、登入、保護路由、refresh | 關掉瀏覽器再開還是登入狀態 | ✅ |
| 3 容器化 | 後端 Dockerfile（multi-stage + uv）、`.dockerignore` | CI 裡 build → run → `curl /ping` 成功、看得到 `docker logs` | 第 1～2 天 |
| 4 上線 | 後端 Render、前端 Vercel、DB Neon；**前後端同站**（Vercel rewrites 代理 `/api`）；啟動時自動跑遷移 | 手機用 4G 開網址能註冊、登入、重新整理後還在登入狀態 | 第 3～4 天 |
| 5 自動化 | GitHub Actions 跑 ruff + pytest + Docker + 前端 build；**CI 綠了才部署**；branch protection | 推一個讓測試失敗的 commit 到 PR → CI 紅 → merge 被擋 → 正式環境沒變 | 第 2、5 天 |
| 6 維護 | `/health`、結構化 log、Sentry、遷移回滾、換密鑰流程、備份概念、冷啟動 | 壞掉時知道去哪看、怎麼復原 | 第 5～6 天 |
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

## 免費方案查證（2026-10-12，由 Claude 查證；正式註冊前請再看一眼官方頁面）

| 服務 | 用途 | 免費方案 | 對本計畫的影響 |
| --- | --- | --- | --- |
| **Render** | 後端 | 免費 web service，每個 workspace 每月 750 小時；閒置 15 分鐘休眠，喚醒約 30～60 秒；休眠中不計時數 | 兩個專案共用 750 小時，靠休眠夠用。**Pre-Deploy Command 只有付費方案有**，所以遷移改在 start command 跑。「After CI Checks Pass」在免費方案是否可用未查到官方說明；不行就關掉 auto-deploy，改由 GitHub Actions 在測試通過後打 Deploy Hook，效果相同 |
| **Railway** | 後端（備案） | **沒有長期免費方案**，一次性 5 美元試用，之後 Hobby 每月 5 美元 | 排除 |
| **Neon** | DB | 免費方案最多 100 個專案，每專案每月 100 CU 小時、1 GB 儲存、10 個 branch；閒置 5 分鐘休眠 | 範例與練習各開一個專案即可，不用擠 |
| **Vercel** | 前端 | Hobby 免費，限非商業用途，rewrites 可用 | 練習專案是個人學習，符合 |
| **GitHub Actions** | CI | 公開 repo 無限；**私有 repo 每月 2000 分鐘**。本 repo 目前是私有 | 一次 CI 約 3～5 分鐘，兩個專案每月約 100 次內沒問題；要省可以把練習專案設成公開 |
| **Sentry** | 錯誤追蹤 | Developer 方案免費：1 個使用者、每月 5000 個錯誤 | 夠用 |
| **網域** | 自訂網址 | 不免費。最便宜的促銷價首年約 1 美元但續約約 11 美元；Cloudflare 以成本價約 10～12 美元/年 | **不買**。用 `*.vercel.app`；DNS 與自訂網域 HTTPS 列入 20 天後自學 |

## 技術選擇

- **保留現有技術棧**，練習專案也用同一套。換棧移植是 20 天後自己做的事。
- 順手現代化：`requirements.txt` → `pyproject.toml` + `uv`（不用再手動啟用 venv，Windows 少踩坑）；lint 用 `ruff`。
- 遷移時機：start command 寫成 `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`。
  最通用的做法，Render、Fly、Docker CMD 全部適用，不依賴付費的 Pre-Deploy 功能。
- 連線池：`create_async_engine(..., pool_pre_ping=True)`；用 Neon pooled 連線字串時 asyncpg 要 `statement_cache_size=0`。
- **冷啟動**：Render 閒置 15 分鐘休眠、Neon 閒置 5 分鐘休眠，第一個請求可能等 30～60 秒，正常現象不是 bug。寫進 `DEBUGGING.md`。
- CI 綠了才部署：Render 設定「Auto-Deploy: After CI Checks Pass」，免費方案不支援就改 Deploy Hook；GitHub 開 branch protection。
- AI 指引檔：內容寫在 `AGENTS.md`（跨工具慣例），`CLAUDE.md` 只放 `@AGENTS.md`。
- **刻意不碰**：Kubernetes、Terraform、完整 AWS、docker compose、前端 Dockerfile、Tailwind、Zod、Vitest、自訂網域、slowapi（環 6 順手加或略過）。

## 練習專案題目評估

**結論：「待辦含分類」足夠，不用換方向。** 判斷標準不是題目大小，而是它會不會逼你走完整條鏈，而且碰到登入之外最重要的一個觀念：**授權（authorization）**。

- 現在的範例專案只有「認證（authentication）」：你是誰。但真實的每一個應用都還有「授權」：你能不能動這筆資料。
  待辦含分類剛好有兩張表（`todo`、`category`）都掛在 `user_id` 底下，A 使用者不能看到、改到 B 的資料，這個檢查要在後端做、要有測試。
  這是範例專案沒有的東西，也是面試和實務一定會問的。
- 兩張表、一個外鍵、一個列表頁、一個表單，剛好能讓 TanStack Query 的「快取、重新抓取、樂觀更新」有意義，又不會壓到時程。
- 記帳也可以（`transaction`、`category`），結構一樣，看你哪個比較有動力。**不要選**聊天室、即時通知、檔案上傳、第三方登入，這些每個都是另一條鏈。

## 每日安排

| 天 | 專案 | 做什麼 | 產出 |
| --- | --- | --- | --- |
| 1 | 範例 | 環 3：uv + ruff + `pyproject.toml`；後端 Dockerfile、`.dockerignore` | 程式與 README 更新 |
| 2 | 範例 | 環 5 前半：GitHub Actions：postgres service → ruff → pytest → docker build/run/curl/logs → 前端 lint + build | LEARNING.md 關卡 9（Docker 與 CI） |
| 3～4 | 範例 | 環 4：**第一件事是同站架構**（Vercel rewrites、cookie path、`VITE_API_URL`）；Render 後端、Vercel 前端、Neon 正式 DB；`pool_pre_ping`；啟動時跑遷移；密鑰放哪 | LEARNING.md 關卡 10（部署）；踩到的坑記進 `DEBUGGING.md` |
| 5～6 | 範例 | 環 6：`/health`、結構化 log、Sentry、遷移回滾、換 JWT 密鑰流程、備份概念、冷啟動說明；CI 綠了才部署 + branch protection；`AGENTS.md` | LEARNING.md 關卡 11（維護） |
| 7 | 範例 | 示範 TanStack Query：用它取代 `getMe` 的手動呼叫，對照「手寫版 vs 套件版」 | LEARNING.md 關卡 12（TanStack Query） |
| 8 | 範例 | 寫 `CHAIN.md` 任務書初版，含附錄「本技術棧的搬家清單」（後端 7 個檔案 + alembic 初始化、前端 7 個檔案）；**範例專案凍結** | `CHAIN.md` v1 |
| 9 | 緩衝 | 範例專案部署最可能爆的時候，留一天 | — |
| 10 | 練習 | 學習者開新 repo（待辦含分類）；環 1 | 練習專案 ping 通 |
| 11～12 | 練習 | 環 2：照搬家清單搬登入模板，前後端都搬；搬不動的地方記下來 | 練習專案可登入 |
| 13～14 | 練習 | 環 3～5：Dockerfile、Render、Vercel 同站、CI 綠了才部署。**此時還沒有任何業務功能，刻意的** | 練習專案上線 |
| 15～16 | 練習 | 環 7：分類與待辦的 CRUD，後端要有「只能動自己的資料」的授權檢查與測試；前端用 TanStack Query；每個功能一個 PR 過 CI 自動上線 | 練習專案有功能 |
| 17 | 練習 | 故障演練：從下方清單挑兩到三個，由 Claude 執行、學習者靠 log 與測試找出來。環 6 套到練習專案標為「時間不夠可砍」 | `DEBUGGING.md` 素材 |
| 18 | 兩邊 | 用練習的痛點修訂 `CHAIN.md` v2 與 `DEBUGGING.md` | 真正帶得走的兩份 |
| 19 | 兩邊 | `QA.md`、補齊 LEARNING.md 與 TOUR.md、20 天後自學清單 | 收尾 |
| 20 | 緩衝 | 延誤吸收與總問答 | — |

> 加了 TanStack Query 示範之後緩衝只剩第 9 天和第 20 天。若第 4 天結束時部署還沒通，第 7 天的示範往後延或取消，優先保住鏈。

## 故障演練清單（第 17 天用，現代開發必定會遇到的）

學習者從中挑兩到三個，告訴 Claude 編號即可，不用說明。每一個都寫「症狀會長怎樣」，但不寫原因，原因是演練時要自己找的。

| 編號 | 故障 | 典型症狀 |
| --- | --- | --- |
| 1 | 正式環境少了一個環境變數 | 後端啟動失敗，Render log 出現 `ValidationError ... Field required` |
| 2 | `JWT_SECRET` 被換掉 | 所有人突然被登出，`/me` 回 401，但登入又正常 |
| 3 | 遷移檔跑到一半失敗 | 部署卡住或啟動失敗，DB 狀態介於兩個版本之間，`alembic current` 對不上 |
| 4 | 新增欄位沒寫遷移，直接改 `models.py` | 本機測試全過（測試用 `create_all`），正式環境 500：`column ... does not exist` |
| 5 | 前端打錯 API 路徑或 rewrites 設錯 | 瀏覽器 404 或拿到 HTML 而不是 JSON，`SyntaxError: Unexpected token <` |
| 6 | cookie 的 `Secure` 或 `path` 設錯 | 登入成功，但重新整理後沒有保持登入；DevTools 看不到 cookie 或 cookie 沒被帶上 |
| 7 | 免費方案冷啟動 | 第一個請求等 30～60 秒或逾時，第二次就正常；被誤判成部署壞了 |
| 8 | DB 連線在休眠後失效 | 閒置一段時間後第一個請求 500：`connection is closed`，再試又好 |
| 9 | 套件升級後行為改變 | CI 突然紅，本機沒動過程式；lock 檔與 CI 安裝版本不一致 |
| 10 | CI 綠、正式環境紅 | 測試環境與正式環境的設定不同（Python 版本、環境變數、DB 版本） |
| 11 | 後端綁錯 port 或 host | Render 顯示部署成功但一直 `502`，log 顯示 `Uvicorn running on 127.0.0.1` |
| 12 | 500 但沒有任何 log | 錯誤被吞掉，沒有結構化 log 和 Sentry 就查不到；演練「加上 log 之後再找」 |
| 13 | 授權漏洞 | A 使用者改網址的 id 就能看到 B 的待辦；測試沒覆蓋到 |
| 14 | 時鐘不同步或 token 過期時間算錯 | 剛登入就 401，或 token 永遠不過期 |

## 練習專案的規則

1. 學習者下任務（可直接複製 `CHAIN.md` 的任務描述），Claude **只做被要求的事**；
   做完要**列出「我注意到但你沒要求、所以我沒做」的清單，只列不做**。這條寫進練習專案的 `AGENTS.md`，不靠學習者每次提醒。
2. 做完由學習者照驗收標準檢查；漏掉、做錯的要**先自己找出來**再問。
3. 學習者自己 commit、自己寫中文註解「為什麼這樣寫」，git log 就是學習紀錄。
4. 開 `QUESTIONS.md` 累積疑問，每三天集中問一次。

## 與既有文件的銜接

- LEARNING.md 路線圖：Docker 與 CI、部署、維護、TanStack Query 插為關卡 9、10、11、12；原 Zod、Tailwind、Vitest、slowapi 改編號為 13～16 並標「20 天後自學」。
- LEARNING.md 第 2010 行的空殼段落改標題為「關卡 13～16」；TOUR.md 結尾「下一步」改指向關卡 9。
- LEARNING.md 第 8 行「不需要部署、不需要 CI，全部在本地」改成「關卡 0～8 全部在本地；關卡 9 起會用到免費雲端服務」。
- 搬家清單放在 LEARNING.md 關卡 6「之後其他專案怎麼用」下方，`CHAIN.md` 附錄引用它。`CHAIN.md` 主體保持跟技術棧無關。

## 最終產出清單

- 本 repo：後端 Dockerfile、CI、可上線、維護機制、`AGENTS.md` + `CLAUDE.md`、LEARNING.md 關卡 9～12、TOUR.md 更新
- `docs/CHAIN.md`：跟技術棧無關、可餵給任何 AI 的鏈路任務書 + 本技術棧搬家清單附錄
- `docs/DEBUGGING.md`：症狀 → 原因 → 修法
- `docs/QA.md`：JWT 與部署的觀念問答
- 20 天後自學清單：Zod、Vitest、Tailwind、docker compose、自訂網域與 DNS、Codespaces
- 練習專案：一個由學習者指揮 AI 拼出來、已上線、有 CI、有授權檢查的完整小專案

## 學習者已做的決定

1. 每天 4 小時，加一天示範 TanStack Query。
2. 只用免費方案；Claude 已查證如上表。
3. 題目：待辦含分類（評估見上）。（2026-10-15 改為學習者另行決定，見頂端註記）
4. 不買網域。
5. 故障演練從上方清單挑，第 17 天再決定。

## 已知風險

- 範例專案部署（第 3～4 天）與練習專案部署（第 13～14 天）最容易爆，緩衝在第 9 天和第 20 天。
- 「只做被要求的事」的副作用是練習專案可能悄悄留安全洞，靠規則 1 的「只列不做」清單補。
- 20 天後換 AI 工具，`CHAIN.md` 與 `AGENTS.md` 都避免綁定 Claude 專屬語法。
- 免費方案的條款會變，表中數字是 2026-10-12 的查證結果。
