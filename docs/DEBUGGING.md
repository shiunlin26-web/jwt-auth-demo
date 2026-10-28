# 除錯手冊：症狀 → 原因 → 修法

這份是給「沒有 AI 可以問」的時候翻的。照**症狀**找，不用先知道原因。想練「怎麼找」：`LEARNING.md` 關卡 20 有除錯的固定流程和五題故障演練（`docs/drills/`）。
每一條都是這個專案真的踩過、或部署這條鏈上一定會遇到的。

**通用的三個動作**，任何症狀先做：

1. **看 log**。本機看跑 uvicorn 的終端機；Render 看 Logs 分頁；CI 看 Actions 的那一步。錯誤訊息的**最後幾行**通常就是答案。
2. **看 Network**。瀏覽器 DevTools → Network，點那個失敗的請求，看 Status、Response、Cookies 三個分頁。
3. **分段確認**。先確認後端活著（`/api/ping`），再確認前端打得到後端（Network 裡 `/api/ping` 是 200），最後才看登入。

---

## 安裝與啟動

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| `uv: The term 'uv' is not recognized` | 剛裝好 uv，開著的終端機還是舊的 PATH | 關掉終端機重開；或在同一個視窗跑 `$env:Path = "C:\Users\<帳號>\.local\bin;$env:Path"`（`setup.ps1` 會自己處理） | 9 |
| `setup.ps1` 問連線字串時打錯了 | Read-Host 沒有上一步 | `Ctrl+C` → `Remove-Item backend\.env -ErrorAction SilentlyContinue` → 重跑；已經寫入的話 `notepad backend\.env` 直接改 | 工具 |
| `& .\scripts\setup.ps1` 說「指令碼執行被停用」 | Windows 預設的執行原則擋 `.ps1` | 用 `powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -SkipTests` 執行 | 工具 |
| `setup.ps1` 一跑就一堆 `Unexpected token`、`Missing closing '}'`，錯誤訊息裡的中文是亂碼 | PowerShell 5.1 讀沒有 BOM 的 UTF-8 檔案會用系統 ANSI 編碼（繁中是 CP950），中文全錯、全形符號被當成語法 | 檔案要存成 UTF-8 **with BOM**（repo 裡已是；`.editorconfig` 有 `[*.ps1] charset = utf-8-bom`）。自己寫 `.ps1` 時 VS Code 右下角選「UTF-8 with BOM」 | 工具 |
| `uv run pytest` 要跑三、四分鐘 | 測試資料庫在 Neon（新加坡），每個測試好幾趟網路來回 | 正常。平常用 `setup.ps1 -SkipTests`；本機有 Postgres 的話把 `TEST_DATABASE_URL` 指到本機會變 20 秒 | 18 |
| `ModuleNotFoundError: No module named 'xxx'` | 指令沒用 `uv run` 開頭，用到系統的 Python | 指令前加 `uv run`；在 `backend` 跑 `uv sync` | 9 |
| `npm run dev` 報 `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`，錯誤最後一行是 `Node.js v18.x` | 跑到的 Node 太舊。Vite 8 底層的 Rolldown 要 Node 20.19 以上（專案 `engines` 要求 `>=22.22`）。常見是機器預裝的舊 Node 排在 PATH 前面，或裝完新版沒重開終端機 | `where.exe node` 看第一行是哪一個；移除舊版（設定 → 應用程式 → Node.js）或把新版目錄移到 PATH 前面，重開終端機確認 `node -v`。新版 `setup.ps1` 遇到太舊的 Node 會自動重裝 | 工具 |
| `npm run dev` 報 `Cannot find native binding`，底下一層層 `Cannot find module '@rolldown/binding-win32-x64-msvc'` | `node_modules` 是在舊版 Node 下裝的：npm 對 engines 不符的**選用**套件會安靜地跳過、不報錯，所以 Rolldown 的原生套件根本沒裝，當時的 `npm ci` 看起來卻成功 | 先確認 `node -v` 是 22 以上，在 `frontend` 跑 `Remove-Item -Recurse -Force node_modules` 再 `npm ci`。**不要**照錯誤訊息刪 `package-lock.json`，repo 的 lockfile 是對的，刪了會重新產生一份、弄髒 git | 工具 |
| 啟動時 `ValidationError ... Field required` | `.env` 少了必填設定（`DATABASE_URL`、`JWT_SECRET`），或 `.env` 不在 `backend` 裡；正式環境則是平台的環境變數沒設 | 本機補 `.env`；Render 到 Environment 分頁補 | 2、10 |
| 啟動時 `ValidationError ... jwt_secret ... at least 32 characters` | `JWT_SECRET` 太短 | `uv run python -c "import secrets; print(secrets.token_urlsafe(32))"` 重新產生 | 2 |
| `relation "user" does not exist` / `column ... does not exist` | 資料表沒建或不是最新 | `uv run alembic upgrade head`；正式環境看 Render log 裡 alembic 那段有沒有失敗 | 5 |
| `TypeError: connect() got an unexpected keyword argument 'sslmode'` | Neon 的連線字串沒改成 asyncpg 格式 | 開頭 `postgresql+asyncpg://`、`sslmode=require` 改 `ssl=require`、刪掉 `channel_binding` | README |

## CI

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| `安裝套件` 那步紅：`The lockfile at uv.lock needs to be updated` | 改了 `pyproject.toml` 沒更新 lock 檔，`--frozen` 拒絕 | 本機在 `backend` 跑 `uv sync`（會更新 `uv.lock`），一起 commit | 9 |
| `npm ci` 紅：`package.json and package-lock.json are not in sync` | 同上，前端版 | 本機 `npm install`，把 `package-lock.json` 一起 commit | 9 |
| `Smoke test` 紅，log 裡 uvicorn 說 `running on http://127.0.0.1:8000` | 後端只聽容器自己的 loopback，外面連不到 | Dockerfile 的 `--host 0.0.0.0` | 9 |
| `Smoke test` 紅，log 裡 alembic 報錯 | 遷移在容器啟動時失敗，uvicorn 根本沒起來 | 看 alembic 的錯誤；通常是遷移檔有問題或 `DATABASE_URL` 連不上 | 9 |
| CI 綠但正式環境壞 | CI 的環境變數、DB、Python 版本和正式環境不同 | 比對 `ci.yml` 的 `env:` 和 Render 的 Environment；看 Render log | 10 |

## 部署：後端（Render）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| 部署一直 `Deploy failed`，log 最後是 `ValidationError ... Field required` | 環境變數沒設（最常見是 `DATABASE_URL` 或 `JWT_SECRET`） | Environment 分頁補上，Manual Deploy | 10 |
| 部署顯示 live，但開網址一直 502 或 `Bad Gateway` | 後端沒聽 Render 給的 `$PORT`，或聽 `127.0.0.1` | Dockerfile 的 CMD 要用 `--host 0.0.0.0 --port ${PORT:-8000}` | 10 |
| 第一個請求等 30～60 秒，或 Vercel 回 504，第二次就正常 | **免費方案冷啟動**：Render 閒置 15 分鐘休眠、Neon 閒置 5 分鐘休眠 | 不是 bug。等它醒來再試一次。要避免只能付費 | 10 |
| 閒置一段時間後第一個請求 500：`connection is closed` / `ConnectionDoesNotExistError` | Neon 休眠後連線池裡的舊連線死了 | `database.py` 的 `pool_pre_ping=True`（已加）。還發生就看是不是 Neon 那邊的 compute 被關掉 | 10 |
| 隨機出現 `prepared statement "__asyncpg_stmt_1__" already exists` | 用了 Neon 的 pooled 連線字串（主機含 `-pooler`）但 asyncpg 的 statement cache 沒關 | `database.py` 已自動處理；或改用非 pooled 的連線字串 | 10 |
| log 裡 alembic 說 `Can't locate revision identified by 'xxxx'` | 正式 DB 的 alembic 版本和程式碼裡的遷移檔對不上（通常是在本機改了遷移檔的 id，或正式 DB 是從別的分支升上去的） | 看 `alembic_version` 表裡的值；對照 `migrations/versions/`；不要手改，先搞清楚哪一邊是對的 | 5、11 |

## 部署：前端（Vercel）與前後端串接

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| 網頁打開了，但註冊、登入都失敗，Console 出現 `SyntaxError: Unexpected token '<'` | 前端打 `/api/...` 拿到的是 HTML（Vercel 的 404 頁或 index.html），不是 JSON：`vercel.json` 的 rewrite 沒生效或目的地網址錯 | 檢查 `frontend/vercel.json` 的 `destination` 是你的 Render 網址、結尾是 `/api/:path*`；Vercel 專案的 Root Directory 要是 `frontend`（否則讀不到 `vercel.json`） | 10 |
| `/api/...` 回 404，Response 是 Render 的 `Not Found` | rewrite 到了 Render，但路徑少了 `/api`，或後端沒把 API 掛在 `/api` 底下 | `destination` 要是 `https://xxx.onrender.com/api/:path*`；後端 `main.py` 的 `APIRouter(prefix="/api")` | 10 |
| 登入成功，**重新整理後掉登入**；DevTools → Application → Cookies 看不到 `refresh_token` | 1. cookie 是跨站設的（前端直接打 Render 網址，`VITE_API_URL` 設了）→ SameSite=Lax 不帶 2. `COOKIE_SECURE=true` 但網址是 http 3. cookie 的 path 和請求路徑對不上 | 1. 拿掉 `VITE_API_URL`，走 `/api` 代理 2. 正式環境一定是 https，本機 `.env` 要 `COOKIE_SECURE=false` 3. path 要是 `/api/auth` | 10 |
| cookie 看得到，但 `/api/auth/refresh` 的 Request Headers 沒有 Cookie | path 不對：cookie 的 path 是 `/api/auth`，請求路徑不是以它開頭 | 確認前端 baseURL 是 `/api`（不是 `/api/`、不是後端網址） | 10 |
| Console 出現 CORS 錯誤 | 前端沒走代理、直接打後端網域 | 平常不該出現；確認 `VITE_API_URL` 沒設、`vercel.json` rewrite 正確 | 10 |
| 直接開 `https://xxx.vercel.app/settings` 是 404，從首頁點過去才正常 | SPA 的路由由前端處理，Vercel 沒有 `/settings` 這個檔案 | `vercel.json` 第二條 rewrite：非 `/api/` 的路徑都回 `index.html` | 10 |
| 經過 Vercel 的 `/api/...` 全部 404，Response 是純文字 `Not Found`、標頭有 `x-render-routing: no-server`，但直接打 Render 網址是通的 | Vercel 轉發到了一個 Render 不認識的主機名稱。最常見是在 Deployments 按 Redeploy 時選到**最早 Import 的那筆**，它的 `vercel.json` 還是佔位字串 | 推一個 commit 到 main 讓 Vercel 從 git 重新部署；或 Deployments 找最新的 git 部署按 Promote to Production。之後 Redeploy 永遠選最上面那筆 | 10 |
| 改了 Vercel 的環境變數，網站沒變 | `VITE_*` 變數是 **build 時**打包進去的，改了要重新 build | Deployments → 最新那筆 → Redeploy | 10 |
| Render Dashboard 找不到以前的服務，以為被新的蓋掉 | 新服務在 Overview 的 Ungrouped Services，舊服務在某個 Project 裡；Project 只是分組 | 點 My projects；或把新服務 Move to project | 10 |
| 推了程式碼，Vercel 有部署、Render 沒有 | Render 只看 `render.yaml` 的 `branch: main`；或 Render 的 Auto-Deploy 被關掉 | 確認推的是 main；Render 服務 Settings → Build & Deploy → Auto-Deploy | 10 |

## 維護（關卡 11）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| `/api/health` 的 `version` 和 main 最新 commit 對不上 | Render 還沒部署完、Auto-Deploy 設成 After CI Checks Pass 但 CI 紅了、或 Auto-Deploy 是 Off | Render Events 看最近一次部署；GitHub Actions 看 CI | 11 |
| `/api/health` 的 `db` 是 `error` | 資料庫連不上：`DATABASE_URL` 錯、Neon 專案被刪或暫停、剛換密碼 | Render Logs 找 `health check: database unreachable` 那筆的 traceback | 11 |
| `/api/health` 的 `migration` 不是最新 | 啟動時的 `alembic upgrade head` 沒成功 | Render Logs 找 alembic 段的錯誤；見 RUNBOOK 第 3 節 | 11 |
| Sentry 沒收到任何東西 | `SENTRY_DSN` 沒設或設錯；或程式有接住例外（接住的不會送） | Render Logs 啟動時有沒有 `Sentry 已啟用`；用 `/api/_boom` 測 | 11 |
| 500 但 log 裡找不到 | middleware 之前就壞了（例如 `config.py` 讀設定失敗），或 log 等級設太高 | 看 Render Logs 啟動段；`LOG_LEVEL` 不要高於 INFO | 11 |
| Render Logs 裡的 log 是一整段 JSON 看不懂 | 正式環境 `LOG_JSON=true` 是刻意的，一行一筆、可搜尋 | 用 Logs 的搜尋欄搜 `request_id`、`"status": 500` | 11 |
| 直接 push main 被拒絕：`protected branch` | branch protection 生效了 | 開分支、開 PR、CI 綠了再 Merge | 11 |

## 頻率限制（關卡 17）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| 登入回 429「請求太頻繁」，但只試了一兩次 | 頻率限制把所有人算成同一個 IP：`TRUSTED_PROXY_HOPS` 比實際代理層數少（正式環境要 2） | 開 `ENABLE_DEBUG_ENDPOINTS` 看 `/api/_ip` 的 `x_forwarded_for` 有幾段，據此設 hops | 17 |
| 後端啟動或第一次登入就 500：`parameter \`response\` must be an instance of starlette.responses.Response` | 被 `@limiter.limit` 裝飾的端點少了 `response: Response` 參數 | 加上參數（slowapi 要用它塞標頭） | 17 |

## 基礎設施（關卡 21～24）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| compose 的 `backend` 一直 `unhealthy` | image 是 `python:3.13-slim`，沒有 curl，healthcheck 用 curl 永遠失敗 | healthcheck 用 image 裡有的工具（Python 的 `urllib`，見 `infra/compose.yaml`） | 21 |
| `up --wait` 等很久才說 backend unhealthy | 啟動要先跑遷移，healthcheck 在那之前就開始算 | `start_period` 給遷移的時間；`logs backend` 看 alembic 那段有沒有錯 | 21 |
| Playwright 說找不到瀏覽器 | 瀏覽器不在 npm 套件裡 | `npx playwright install chromium`（CI 加 `--with-deps`） | 21 |
| E2E 三條全部 timeout | 後端沒起（compose 沒 `up`）或 Vite 代理的 8000 沒人聽；`webServer` 只起前端 | 先 `curl localhost:8000/api/ping` | 21 |
| prettier 檢查紅在 `test-results/.last-run.json` | Playwright 跑過留下的檔 | 進 `.prettierignore` 與 `.gitignore` | 21 |
| `docker compose down` 後 Prometheus、Redpanda 還在跑 | 沒帶 `--profile`，profile 裡的服務不會被關 | `down` 也要帶同一個 `--profile` | 22、24 |
| Grafana 開起來沒有儀表板 | provisioning 的目錄沒掛進容器，或 json 壞掉 | `docker compose logs grafana` 搜 `provisioning`；`curl localhost:3000/api/dashboards/uid/jwt-backend` | 22 |
| collector 的 log 沒有 span | 後端沒拿到 `OTEL_EXPORTER_OTLP_ENDPOINT`（要寫在 `up` 指令前面）；或才剛打、還沒到每 5 秒一批 | `logs backend` 找 `OpenTelemetry 追蹤已啟用`；等 8 秒再看 | 22 |
| Prometheus 查到的數字比 `/metrics` 小 | 取樣：5 秒抓一次，抓的時候請求還沒打完 | 預期行為，等下一次抓 | 22 |
| OTel 的 SQLAlchemy instrumentation 裝不上 | 只支援到 SQLAlchemy 2.0，專案是 2.1 | 掛在 asyncpg 驅動層（`tracing.py`） | 22 |
| Grafana Cloud 回 401 | Instance ID 拿錯（要 OTLP 卡片上的）、base64 有換行、token 沒 write 權限、header 的空格沒寫成 `%20` | 重做 LEARNING 關卡 22「開始前」第二段的第 2～4 步 | 22 |
| `kubectl apply -k` 說檔案在 overlay 目錄外 | kustomize 不讓 overlay 直接引用上層的單一檔案 | 給那個目錄自己的 `kustomization.yaml`，用目錄引用（`infra/k8s/ci/`） | 23 |
| `kind load` 之後 pod 仍 `ErrImagePull` | tag 對不上（overlay 的 `newTag` 和 load 的 tag 不同），或 `imagePullPolicy: Always` 想去 registry 拉 | 對齊 tag；`IfNotPresent` | 23 |
| 壞 image 時 `rollout status` 逾時 | 預期行為：新 pod 永遠不 Ready，`maxUnavailable: 0` 不讓舊的關 | `get pods` 看舊 pod 仍 Running、Service 仍 200，`rollout undo` | 23 |
| Job `backend-migrate` 第二次 apply 被拒 | Job 的 spec 建好不能改 | `kubectl delete job backend-migrate` 再 apply，或名字帶版本 | 23 |
| 改了 ConfigMap 沒生效 | pod 不會因此自動重啟 | `kubectl rollout restart deployment/backend` | 23 |
| consumer 的 log 一直沒有 `consumed` | topic 不存在（`redpanda-init` 沒跑完）、或 `KAFKA_BOOTSTRAP_SERVERS` 用了 localhost | `rpk topic list`；compose 內用服務名 `redpanda:9092` | 24 |
| 本機 `OUTBOX_WORKER=inline` 沒看到 `published` | 改了 `.env` 沒重啟（`--reload` 不看 `.env`） | Ctrl+C 重啟 | 24 |
| pytest 裡 `asyncio.Event` 報 attached to a different loop | 模組層建的 Event 綁在第一個測試的 loop | 在 `run_worker` 裡建 Event，存進模組變數（`outbox.py`） | 24 |
| Neon 的免費計算時數被 worker 吃掉 | worker 每 5 秒輪詢，資料庫永遠不休眠 | Render 設 `OUTBOX_POLL_SECONDS=600`，靠鈴即時 | 24 |

## 登入邏輯（本機就會遇到）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| 同時發三個請求，使用者突然被登出 | 三個都去 refresh，第二、三個用了已輪替的舊 token → 被當成重複使用 | 前端 single-flight（`client.ts` 的 `refreshPromise`） | 1 |
| 換了 `JWT_SECRET`，使用者會全部被登出嗎？ | 不會。access token 是 JWT，換了密鑰舊的全部失效；refresh token 是隨機字串、資料庫存雜湊，和密鑰無關 | 幾乎無感：下一個請求 401 → 前端自動 refresh → 拿到新密鑰簽的 access token。真的看到有人被登出，查的是 refresh token 過期或被撤銷，不是密鑰。`RUNBOOK.md` 第 4 節 | 11 |
| 登出所有裝置後，另一台還能用幾分鐘 | access token 不查 DB，過期前都有效 | 預期行為。`JWT_EXPIRE_MINUTES` 越短影響越小 | 3 |
| commit 之後讀物件屬性出現 `MissingGreenlet` | async SQLAlchemy 在 commit 後把屬性標成過期，再讀會偷偷查 DB | commit **前**先把要用的值存到變數 | 1 |
