# 除錯手冊：症狀 → 原因 → 修法

這份是給「沒有 AI 可以問」的時候翻的。照**症狀**找，不用先知道原因。
每一條都是這個專案真的踩過、或部署這條鏈上一定會遇到的。

**通用的三個動作**，任何症狀先做：

1. **看 log**。本機看跑 uvicorn 的終端機；Render 看 Logs 分頁；CI 看 Actions 的那一步。錯誤訊息的**最後幾行**通常就是答案。
2. **看 Network**。瀏覽器 DevTools → Network，點那個失敗的請求，看 Status、Response、Cookies 三個分頁。
3. **分段確認**。先確認後端活著（`/api/ping`），再確認前端打得到後端（Network 裡 `/api/ping` 是 200），最後才看登入。

---

## 安裝與啟動

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| `uv: The term 'uv' is not recognized` | 剛裝好 uv，開著的終端機還是舊的 PATH | 關掉終端機重開；或在同一個視窗跑 `$env:Path = "C:\Users\<帳號>\.local\bin;$env:Path"` | 9 |
| `ModuleNotFoundError: No module named 'xxx'` | 指令沒用 `uv run` 開頭，用到系統的 Python | 指令前加 `uv run`；在 `backend` 跑 `uv sync` | 9 |
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

## 登入邏輯（本機就會遇到）

| 症狀 | 原因 | 修法 | 關卡 |
| --- | --- | --- | --- |
| 同時發三個請求，使用者突然被登出 | 三個都去 refresh，第二、三個用了已輪替的舊 token → 被當成重複使用 | 前端 single-flight（`client.ts` 的 `refreshPromise`） | 1 |
| 改了 `JWT_SECRET`，所有人都要重新登入 | access token 的簽章對不上 | 預期行為。換密鑰就是會這樣，排在流量低的時候做 | 2 |
| 登出所有裝置後，另一台還能用幾分鐘 | access token 不查 DB，過期前都有效 | 預期行為。`JWT_EXPIRE_MINUTES` 越短影響越小 | 3 |
| commit 之後讀物件屬性出現 `MissingGreenlet` | async SQLAlchemy 在 commit 後把屬性標成過期，再讀會偷偷查 DB | commit **前**先把要用的值存到變數 | 1 |
