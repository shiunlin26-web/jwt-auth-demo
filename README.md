# JWT Auth Demo

JWT 登入的教學模板：FastAPI + React + Neon，部署在 Render + Vercel，用來被複製到其他專案當登入的起點；同時是一條從登入一路到 CI、部署、Kubernetes、訊息佇列的學習路線（`docs/LEARNING.md`）。**每次都是乾淨機器？直接看「每次開機怎麼把專案跑起來」。**

- **後端**：FastAPI + SQLModel（async）+ PostgreSQL（Neon 或本地 Postgres）
- **前端**：React + TypeScript + Vite（React Router、Zustand、axios、TanStack Query、React Hook Form + Zod、Tailwind CSS）

## 這個專案展示了什麼

四條路徑（請求、部署、事件、觀測）的圖在 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) 第 1 節，這裡只列每一段做了什麼、怎麼證明：

| 這條鏈的一段 | 做了什麼 | 怎麼證明它會動 |
| --- | --- | --- |
| 登入 | JWT access token + 輪替的 refresh token（HttpOnly cookie、重複使用偵測）、前後端同站代理 | `uv run pytest -q`（67 個測試，以輸出為準）、`npm test` |
| 上線 | Docker image；Render + Vercel + Neon 全免費方案；`/api/health` 報遷移版本與 commit | 線上開 `/api/health` |
| CI/CD | ruff、pyright、alembic check、pytest、Docker smoke、eslint、prettier、vitest、tsc；CI 綠才部署 | Actions 的 **CI** workflow |
| 本機整套與 E2E | `docker compose` 一個指令起整套；Playwright 在真瀏覽器走註冊 → 登入 → 重整 → 登出 | **Infra** workflow 的 `compose`、`e2e` job |
| 可觀測性 | JSON log + Sentry；Prometheus 指標與 Grafana 儀表板（進 git）；OpenTelemetry 追蹤，log ↔ trace 互相找得到 | `observability` job |
| Kubernetes | kustomize 清單：遷移 Job、2 副本、探針、資源、非 root；換版期間 80 次請求全部 200、`rollout undo`、壞 image 被擋住 | `k8s` job |
| 非同步訊息 | transactional outbox；worker 送 Kafka；consumer 同一筆只處理一次；線上免費方案用 inline worker | `messaging` job |

整條鏈的地圖、每一塊怎麼擴充與換棧對照：[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。每一段怎麼做、為什麼：[`docs/LEARNING.md`](docs/LEARNING.md) 關卡 0～25。

## 專案結構

```
jwt-auth-demo/
├── backend/
│   ├── main.py            # FastAPI 入口、CORS
│   ├── database.py        # DB 連線（讀 DATABASE_URL）
│   ├── models.py          # User、RefreshToken 資料表
│   ├── schemas.py         # 請求 / 回應格式
│   ├── security.py        # 密碼雜湊、JWT 簽發與驗證、refresh token 產生
│   ├── dependencies.py    # get_current_user（驗 Bearer token）
│   ├── routes/
│   │   ├── auth.py        # 註冊、登入、refresh、登出、登出所有裝置、修改密碼
│   │   └── users.py       # /me（需要登入）
│   ├── config.py          # 所有設定集中在這裡（讀 .env）
│   ├── logging_config.py  # log 格式（文字 / JSON）
│   ├── rate_limit.py      # 登入 / 註冊的頻率限制，與代理後面的客戶端 IP
│   ├── metrics.py         # 【關卡 22】/metrics 與請求計數、耗時直方圖（METRICS_ENABLED 才開）
│   ├── tracing.py         # 【關卡 22】OpenTelemetry 追蹤（設了 OTEL_EXPORTER_OTLP_ENDPOINT 才開）
│   ├── outbox.py          # 【關卡 24】transactional outbox：enqueue、worker、冪等的 consumer
│   ├── worker.py, consumer.py  # 【關卡 24】同一個 image 的另外兩種入口（compose 的 messaging profile）
│   ├── alembic.ini        # Alembic（資料庫遷移）設定
│   ├── migrations/        # 資料庫遷移檔，記錄資料表結構的每一次變更
│   ├── tests/, pytest.ini # pytest 自動化測試
│   ├── pyproject.toml     # 套件清單 + ruff、pyright 設定（用 uv 安裝）
│   ├── .python-version    # 固定 Python 3.13，uv 會自動用這個版本
│   ├── uv.lock            # 鎖定每個套件的實際版本，本機 / CI / Docker 裝出來一模一樣
│   ├── Dockerfile         # 把後端打包成 image（部署用）
│   ├── .dockerignore      # build image 時排除 .env、.venv 等
│   └── .env.example
├── render.yaml                # Render 部署設定（後端）
├── AGENTS.md                  # 給 AI 工具（與人）看的專案規矩；CLAUDE.md 指向它
├── .editorconfig              # 編輯器共用的縮排、換行規則
├── .github/workflows/ci.yml   # CI：每次 push / PR 自動跑 ruff、pyright、alembic check、pytest、Docker build；前端 prettier / lint / vitest / build
├── .github/workflows/infra.yml  # 只在 PR 跑：compose、e2e（Playwright）、observability、k8s（kind）、messaging（Redpanda）
├── .github/workflows/codeql.yml # CodeQL 靜態分析（SAST）：PR 與每週一掃程式碼的漏洞模式；公開 repo 免費
├── .github/workflows/audit.yml  # 每週一：pip-audit、npm audit 掃套件的已知漏洞（不擋 PR）
├── .github/workflows/deploy.yml # 【關卡 25-D，選配】CI 綠後叫 Render 部署、等 /api/health 版本對上；沒設 secret 就跳過
├── .github/dependabot.yml     # 每週自動開 PR 更新套件
├── docs/                      # 文件；每份是什麼、什麼時候看：docs/HANDOFF.md 第 6 節的文件地圖
├── docs/labs/, docs/drills/   # 關卡 18 的 SQL 實驗、關卡 20 的故障演練 patch
├── infra/                     # 關卡 21～24：compose、k8s（kustomize）、prometheus、grafana、otel；怎麼跑看 infra/README.md
├── scripts/setup.ps1          # 乾淨的 Windows 機器一鍵建置（裝工具、拉 main、.env、sync、測試）
├── scripts/setup.sh           # 同一件事的 Mac 版
├── scripts/doctor.sh, .ps1    # 這台能做哪幾關（有沒有 Docker、kind）
└── frontend/src/
    ├── app/
    │   ├── router.tsx     # 路由表：哪個網址顯示哪個頁面、哪些頁面要登入
    │   └── AppLayout.tsx  # 所有頁面共用的導覽列
    ├── pages/             # 每個網址一個頁面：登入、註冊、首頁、帳號設定、404
    ├── api/
    │   ├── client.ts      # axios 設定：自動帶 token、401 自動 refresh（single-flight）
    │   ├── auth.ts        # 每個登入相關 API 一個函式：login()、getMe()……
    │   └── queryClient.ts # TanStack Query 的快取（後端資料的副本放這裡；登出時清空）
    ├── auth/              # 登入狀態（Zustand store、useAuth）、使用者資料（useMe）與守門員（RequireAuth、GuestOnly）
    ├── components/        # 頁面裡的零件：登入表單、註冊表單、修改密碼……（React Hook Form）；ui.tsx 是共用的 Tailwind 元件
    ├── schemas/           # 表單規則（Zod），和後端 schemas.py 一致
    └── test/              # Vitest 的 setup 與 MSW 假後端；測試檔放在被測檔案旁邊（*.test.ts、*.test.tsx）
    frontend/vitest.config.ts  # 前端測試設定（沿用 vite.config.ts）
    frontend/e2e/, playwright.config.ts  # 【關卡 21】Playwright E2E：真瀏覽器走登入主路徑（npm run test:e2e）
    frontend/index.html, main.tsx, index.css  # 入口：HTML、掛上 React（QueryClientProvider、Router）、Tailwind
    frontend/vercel.json   # Vercel 部署設定：把 /api/* 轉發到 Render、SPA 路由
    frontend/vite.config.ts  # 本機開發：把 /api/* 轉發到 localhost:8000
    frontend/.prettierrc, .nvmrc, eslint.config.js, tsconfig*.json  # 格式化、Node 版本、lint、TypeScript（strict）
```

**前後端怎麼接**：前端只打「自己網域的 `/api/...`」。本機由 Vite 轉發到 `localhost:8000`，正式環境由 Vercel 轉發到 Render。
對瀏覽器來說前後端永遠是同一個網站，refresh cookie 才會被帶上，也不需要 CORS。說明見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 10。

## 每次開機怎麼把專案跑起來（乾淨機器，Windows；Mac 見本節末）

電腦每次開機都是乾淨系統（連 repo 都會消失）的話，不用照後面的手動步驟，每次開機在 PowerShell 貼兩行：

```powershell
git clone https://github.com/shiunlin26-web/jwt-auth-demo.git $HOME\jwt-auth-demo
powershell -ExecutionPolicy Bypass -File $HOME\jwt-auth-demo\scripts\setup.ps1 -SkipTests
```

- 連 git 都沒有時，先到 git-scm.com 裝，或有 winget 的話 `winget install Git.Git`。
- repo 是公開的，`git clone` 不用登入；之後要 `git push` 時才會跳瀏覽器登入 GitHub。
- `-ExecutionPolicy Bypass -File` 是為了繞過 Windows 預設擋 `.ps1` 的設定；你的機器本來就允許的話，`& .\scripts\setup.ps1 -SkipTests` 也可以。
- repo 還在（沒被清掉）的話只要第二行，腳本自己會 `git pull`。

腳本會：沒有 Node 與 uv 就裝、Node 比 `frontend/.nvmrc` 的大版號舊也重裝（舊版 Node 裝出來的 `node_modules` 少東西，見 `docs/DEBUGGING.md`；有 winget 用 winget，沒有就從官網下載 zip，不需要管理員權限）→ `git pull` → 設定 git 身分 → `uv sync` → 建立 `backend/.env`（問你 Neon 的兩個連線字串，**直接貼 Neon 後台的原始格式即可，會自動轉成 asyncpg 格式**；`JWT_SECRET` 自動產生）→ `alembic upgrade head` → `npm ci`。約三到五分鐘。**任何一步失敗會停在那一步印紅字**，不會印「完成」。

| 參數 | 用途 |
| --- | --- |
| `-SkipTests` | 跳過最後的 pytest + vitest（測試資料庫在 Neon，跑一次約 4 分鐘；想確認基準線時再拿掉） |
| `-EnvFile D:\jwt.env` | 不手打連線字串，從 USB 或雲端硬碟上的檔案複製成 `backend/.env`（內容就是一份 `.env`，**不要**放進 repo） |

**跑完之後**，開兩個終端機：

```powershell
cd backend;  uv run uvicorn main:app --reload --port 8000
cd frontend; npm run dev
```

瀏覽器開 <http://localhost:5173>。連線字串打錯：`Ctrl+C`，`Remove-Item backend\.env -ErrorAction SilentlyContinue`，重跑第二行；其他症狀見 [`docs/DEBUGGING.md`](docs/DEBUGGING.md)「安裝與啟動」。

**Mac / Linux**：`bash scripts/setup.sh --skip-tests`，做的事和 `setup.ps1` 一樣，參數是 `--skip-tests`、`--env-file ~/jwt.env`。Mac 不會清空，之後再跑只是 `git pull` 加同步套件。開任何一關之前先跑 `bash scripts/doctor.sh`（Windows：`powershell -ExecutionPolicy Bypass -File scripts\doctor.ps1`），它會印出這台能做哪幾關；關卡 21 起的路線在 [`docs/PLAN-INFRA.md`](docs/PLAN-INFRA.md)。

> 下面「需要先安裝」到「3. 啟動前端」是手動版，腳本做的就是這些事；想知道每一步為什麼、或不是 Windows，照手動版做。

## 需要先安裝

| 工具 | 版本 |
| --- | --- |
| Python | 3.13（`backend/.python-version` 固定），**不用自己裝**：uv 會自動下載這個版本 |
| uv | Python 的套件管理工具（取代 pip + venv）。安裝方式見 [uv 官方文件](https://docs.astral.sh/uv/getting-started/installation/)：macOS / Linux 用 `curl -LsSf https://astral.sh/uv/install.sh \| sh`，Windows PowerShell 用 `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 \| iex"`。裝完用 `uv --version` 確認 |
| Node.js | **22.22 以上**（React Router 8 的要求），用 `node -v` 確認 |
| PostgreSQL | 用 [Neon](https://neon.tech) 免費雲端資料庫，或本地 Postgres（見下方） |

## 1. 準備資料庫（二選一）

### A. Neon（免費雲端；正式環境也用它）

`setup.ps1`／`setup.sh` 會問你連線字串並自動轉格式，這段是手動版。在 Neon 建一個專案，按 **Connect** 複製連線字串，長得像這樣：

```
postgresql://neondb_owner:xxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

要改三個地方（後端用的 asyncpg 不認得 `sslmode` 和 `channel_binding`）：

1. 開頭 `postgresql://` 改成 `postgresql+asyncpg://`
2. `sslmode=require` 改成 `ssl=require`
3. 刪掉 `&channel_binding=require`

改完：

```
postgresql+asyncpg://neondb_owner:xxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?ssl=require
```

### B. 本地 Postgres（有 Docker 的機器）

用關卡 21 的 compose 只起資料庫：

```bash
docker compose -f infra/compose.yaml up -d --wait postgres
```

連線字串：

```
postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/jwtdemo
```

> 資料表會在下一步用 `alembic upgrade head` 建立。

## 2. 啟動後端

```bash
cd backend

# 安裝套件（第一次，以及之後 pyproject.toml / uv.lock 有變時）
# 會自動建立 backend/.venv 並照 uv.lock 安裝所有套件（含測試用的）
uv sync

# 建立 .env
cp .env.example .env              # Windows: copy .env.example .env
```

> **不用再手動啟用 venv。** 之後所有指令都用 `uv run <指令>` 執行（例如 `uv run pytest`），
> uv 會自動用 `backend/.venv` 裡的 Python 和套件，Windows、macOS 都一樣，也不會有「指令碼執行被停用」的問題。

編輯 `backend/.env`，**必填的只有兩個**：

```env
DATABASE_URL=postgresql+asyncpg://...   # 第 1 步的連線字串
JWT_SECRET=至少32個字元的隨機字串
```

其他設定（token 有效期、CORS 網址、cookie、SQL log）都有預設值，要改的話看 `.env.example` 裡的說明。
所有設定集中定義在 `backend/config.py`，少填或格式不對，後端啟動時就會直接報錯並指出是哪一個。

產生隨機 `JWT_SECRET`：

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

建立資料表（第一次，以及之後每次 `git pull` 有新的遷移檔時都要跑；在 `backend` 資料夾執行）：

```bash
uv run alembic upgrade head
```

啟動：

```bash
uv run uvicorn main:app --reload --port 8000
```

確認：

- <http://localhost:8000/api/ping> 回傳 `{"message":"pong"}`
- <http://localhost:8000/docs> 可以看到 Swagger API 文件，也能直接在這裡測試

## 3. 啟動前端

開另一個終端機：

```bash
cd frontend
npm ci        # 照 package-lock.json 嚴格安裝（和 CI 一樣）；npm install 也可以，但可能更新 lock 檔
npm run dev
```

打開 <http://localhost:5173>。

> 前端的 API 請求（`/api/...`）由 Vite 轉發到 `localhost:8000`，所以後端要先跑起來。
> 用 `localhost` 或 `127.0.0.1` 開都可以。

## 4. 試玩流程

1. 到「註冊」頁輸入 Email 與密碼（8～72 個英文字母、數字或符號）→ 註冊成功後自動跳到登入頁
2. 登入 → 拿到 access token（存在記憶體），refresh token 以 httpOnly cookie 存在瀏覽器，進到首頁
3. 首頁會帶 `Authorization: Bearer <token>` 呼叫 `/me`，顯示使用者資料
4. **重新整理頁面** → 前端啟動時呼叫 `/auth/refresh`，靠 cookie 自動恢復登入
5. 「帳號設定」頁可以修改密碼、登出所有裝置
6. 按導覽列的「登出」→ 刪掉 DB 裡的 refresh token 並清 cookie，回到登入頁
7. 沒登入時直接打開 `/settings` → 被導到登入頁，登入後自動回到 `/settings`

### 想觀察 access token 過期後自動 refresh？

在 `backend/.env` 加上 `JWT_EXPIRE_MINUTES=1`，重啟後端。登入後等一分鐘再按首頁的「重新取得我的資料」，
打開瀏覽器 DevTools → Network，會看到：

```
GET  /api/me            → 401
POST /api/auth/refresh  → 200（拿到新的 access token）
GET  /api/me            → 200（用新 token 重試）
```

## 5. 跑測試（選用）

前端：在 `frontend` 執行 `npm test`（Vitest + MSW 假後端，不需要後端在跑）。下面是後端的測試。

測試會清空資料表，所以要用**另一個資料庫**：

- Neon：到 SQL Editor 執行 `CREATE DATABASE jwtdemo_test;`
- Docker：`docker exec -it jwt-demo-db psql -U postgres -c "CREATE DATABASE jwtdemo_test;"`

再到 `backend/.env` 加上：

```env
TEST_DATABASE_URL=postgresql+asyncpg://...（資料庫名稱改成 jwtdemo_test）
```

```bash
cd backend
uv run pytest
```

詳細說明見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 4。

## 6. 程式碼檢查與 CI

推之前要跑的全部檢查（ruff、pyright、pytest、eslint、prettier、vitest、tsc、build）列在 [`AGENTS.md`](AGENTS.md)「常用指令」。推上 GitHub 之後 `.github/workflows/ci.yml` 自動跑同一套再加 Docker build/run/smoke，結果在 repo 的 **Actions** 分頁看；說明見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 9。

## 7. 部署（選用）

後端在 Render（`render.yaml`）、前端在 Vercel（`frontend/vercel.json`）、資料庫在 Neon，全部免費方案。
完整步驟、觀念與會踩的坑見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 10；出問題先查 [`docs/DEBUGGING.md`](docs/DEBUGGING.md)。
上線後的維運（看 log、退版、換密鑰、備份與還原演練）見 [`docs/RUNBOOK.md`](docs/RUNBOOK.md)，關卡 11。寫新端點前看 API 慣例：[`docs/API.md`](docs/API.md)。
選配：`.github/workflows/deploy.yml` 把部署變成 GitHub 上的一步（CI 綠 → 叫 Render → 等線上版本對上，Environments 分頁有紀錄）；設了 secret `RENDER_DEPLOY_HOOK` 才啟用，步驟見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 25。

## API 一覽

| Method | Path | 說明 | 認證 |
| --- | --- | --- | --- |
| GET | `/api/ping` | 活著嗎（不碰資料庫，Render health check 用） | – |
| GET | `/api/health` | 能服務嗎：資料庫連線、遷移版本、目前 commit | – |
| POST | `/api/auth/register` | 註冊 `{ email, password }`（每個 IP 每分鐘 10 次，超過回 429） | – |
| POST | `/api/auth/login` | 登入，回傳 access token，並設定 `refresh_token` cookie（每個 IP 每分鐘 10 次，超過回 429） | – |
| POST | `/api/auth/refresh` | 用 cookie 裡的 refresh token 換新的 access token（同時輪替 refresh token） | Cookie |
| POST | `/api/auth/logout` | 刪除 refresh token 並清 cookie | Cookie |
| POST | `/api/auth/logout-all` | 登出所有裝置（刪除此使用者所有 refresh token） | Bearer |
| POST | `/api/auth/change-password` | 修改密碼 `{ current_password, new_password }`，其他裝置全部登出，目前裝置拿到新 token | Bearer |
| GET | `/api/me` | 取得目前使用者 | Bearer |

## Token 設計

| | Access Token | Refresh Token |
| --- | --- | --- |
| 格式 | JWT（HS256） | 隨機字串（`secrets.token_urlsafe`） |
| 有效期 | `JWT_EXPIRE_MINUTES`（預設 30 分鐘） | `REFRESH_TOKEN_EXPIRE_DAYS`（預設 7 天） |
| 存放 | 前端記憶體（Zustand store，重新整理就消失） | httpOnly cookie（`path=/api/auth`），DB 只存 SHA-256 雜湊 |
| 用途 | 呼叫受保護 API | 換新的 access token |
| 輪替 | – | 每次 refresh 都發新的、舊的作廢；舊的被重複使用 → 該使用者所有 refresh token 全部撤銷 |

## 每次 `git pull` 之後

拿到新的程式碼後，視情況做這幾件事（不確定就全部跑一次，已經是最新的會自動跳過）：

| 改了什麼 | 要做什麼 |
| --- | --- |
| `backend/pyproject.toml` 或 `backend/uv.lock` | 在 `backend`：`uv sync` |
| `backend/migrations/versions/` 多了新檔案 | 在 `backend`：`uv run alembic upgrade head` |
| `frontend/package.json` | 在 `frontend`：`npm ci` |

或者直接 `powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -SkipTests`，它會 `git pull` 並把這三件事都做一遍。

## 文件

每份文件是什麼、什麼時候看：[`docs/HANDOFF.md`](docs/HANDOFF.md) 第 6 節的文件地圖。要接手帶人或換一個 AI 工具繼續：從 HANDOFF 第 0 節開始；學習路線與每一關：[`docs/LEARNING.md`](docs/LEARNING.md)；要把這套搬到新專案：[`docs/CHAIN.md`](docs/CHAIN.md) 附錄 A。

## 壞掉了

症狀 → 原因 → 修法都在 [`docs/DEBUGGING.md`](docs/DEBUGGING.md)，先查「安裝與啟動」那張表；上線後的維運（看 log、退版、換密鑰、備份與還原）在 [`docs/RUNBOOK.md`](docs/RUNBOOK.md)。
