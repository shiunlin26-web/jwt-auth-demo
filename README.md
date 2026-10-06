# JWT Auth Demo

練習前後端登入串接與 Refresh Token 的小專案。

- **後端**：FastAPI + SQLModel（async）+ PostgreSQL（Neon 或本地 Postgres）
- **前端**：React + TypeScript + Vite

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
│   ├── alembic.ini        # Alembic（資料庫遷移）設定
│   ├── migrations/        # 資料庫遷移檔，記錄資料表結構的每一次變更
│   ├── tests/             # pytest 自動化測試
│   ├── requirements.txt
│   ├── requirements-dev.txt  # 測試用套件
│   └── .env.example
└── frontend/src/
    ├── app/
    │   ├── router.tsx     # 路由表：哪個網址顯示哪個頁面、哪些頁面要登入
    │   └── AppLayout.tsx  # 所有頁面共用的導覽列
    ├── pages/             # 每個網址一個頁面：登入、註冊、首頁、帳號設定、404
    ├── api/
    │   ├── client.ts      # token 存放、refresh（single-flight）、apiFetch（401 自動 refresh）
    │   └── auth.ts        # 每個登入相關 API 一個函式：login()、getMe()……
    ├── auth/              # 登入狀態（AuthProvider、useAuth）與守門員（RequireAuth、GuestOnly）
    └── components/        # 頁面裡的零件：登入表單、註冊表單、修改密碼……
```

## 需要先安裝

| 工具 | 版本 |
| --- | --- |
| Python | 3.10 以上（程式有用到 `int \| None` 語法） |
| Node.js | 20 以上 |
| PostgreSQL | 用 [Neon](https://neon.tech) 免費雲端資料庫，或本地 Postgres（見下方） |

## 1. 準備資料庫（二選一）

### A. 使用 Neon（原本的做法）

在 Neon 建一個專案，複製連線字串，**把開頭改成 `postgresql+asyncpg://`**，並把 `sslmode=require` 改成 `ssl=require`（asyncpg 不認得 `sslmode`）：

```
postgresql+asyncpg://<user>:<password>@<host>/<dbname>?ssl=require
```

### B. 使用本地 Postgres（Docker）

```bash
docker run -d --name jwt-demo-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jwtdemo \
  -p 5432:5432 \
  postgres:16
```

連線字串：

```
postgresql+asyncpg://postgres:postgres@localhost:5432/jwtdemo
```

> 資料表會在下一步用 `alembic upgrade head` 建立。

## 2. 啟動後端

```bash
cd backend

# 建立並啟用虛擬環境
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 安裝套件
pip install -r requirements.txt

# 建立 .env
cp .env.example .env              # Windows: copy .env.example .env
```

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

建立資料表（第一次，以及之後每次 `git pull` 有新的遷移檔時都要跑）：

```bash
alembic upgrade head
```

啟動：

```bash
uvicorn main:app --reload --port 8000
```

確認：

- <http://localhost:8000/ping> 回傳 `{"message":"pong"}`
- <http://localhost:8000/docs> 可以看到 Swagger API 文件，也能直接在這裡測試

## 3. 啟動前端

開另一個終端機：

```bash
cd frontend
npm install
npm run dev
```

打開 <http://localhost:5173>。

> ⚠️ **請用 `localhost`，不要用 `127.0.0.1`。**
> 後端 CORS 預設只允許 `http://localhost:5173`（`backend/.env` 的 `CORS_ORIGINS`），前端預設呼叫 `http://localhost:8000`（`frontend/.env` 的 `VITE_API_URL`，不設定就用預設值）。
> 如果用 `127.0.0.1:5173` 開頁面，CORS 會擋掉，refresh token cookie 也不會被帶上。

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
GET  /me            → 401
POST /auth/refresh  → 200（拿到新的 access token）
GET  /me            → 200（用新 token 重試）
```

## 5. 跑測試（選用）

測試會清空資料表，所以要用**另一個資料庫**。在 Neon 的 SQL Editor 執行 `CREATE DATABASE jwtdemo_test;`，再到 `backend/.env` 加上：

```env
TEST_DATABASE_URL=postgresql+asyncpg://...（資料庫名稱改成 jwtdemo_test）
```

```bash
cd backend
python -m pip install -r requirements-dev.txt
python -m pytest
```

詳細說明見 [`docs/LEARNING.md`](docs/LEARNING.md) 關卡 4。

## API 一覽

| Method | Path | 說明 | 認證 |
| --- | --- | --- | --- |
| GET | `/ping` | 健康檢查 | – |
| POST | `/auth/register` | 註冊 `{ email, password }` | – |
| POST | `/auth/login` | 登入，回傳 access token，並設定 `refresh_token` cookie | – |
| POST | `/auth/refresh` | 用 cookie 裡的 refresh token 換新的 access token（同時輪替 refresh token） | Cookie |
| POST | `/auth/logout` | 刪除 refresh token 並清 cookie | Cookie |
| POST | `/auth/logout-all` | 登出所有裝置（刪除此使用者所有 refresh token） | Bearer |
| POST | `/auth/change-password` | 修改密碼 `{ current_password, new_password }`，其他裝置全部登出，目前裝置拿到新 token | Bearer |
| GET | `/me` | 取得目前使用者 | Bearer |

## Token 設計

| | Access Token | Refresh Token |
| --- | --- | --- |
| 格式 | JWT（HS256） | 隨機字串（`secrets.token_urlsafe`） |
| 有效期 | `JWT_EXPIRE_MINUTES`（預設 30 分鐘） | `REFRESH_TOKEN_EXPIRE_DAYS`（預設 7 天） |
| 存放 | 前端記憶體（React state / ref） | httpOnly cookie（`path=/auth`），DB 只存 SHA-256 雜湊 |
| 用途 | 呼叫受保護 API | 換新的 access token |
| 輪替 | – | 每次 refresh 都發新的、舊的作廢；舊的被重複使用 → 該使用者所有 refresh token 全部撤銷 |

## 學習路線

一步步把這個專案練到接近生產級的過程，記錄在 [`docs/LEARNING.md`](docs/LEARNING.md)。

## 常見問題

- **`TypeError: connect() got an unexpected keyword argument 'sslmode'` / 連不到 DB**：檢查 `DATABASE_URL` 開頭是不是 `postgresql+asyncpg://`，Neon 要用 `ssl=require` 而不是 `sslmode=require`。
- **`relation "user" does not exist` / `column ... does not exist`**：資料表還沒建立或不是最新版本，在 `backend` 執行 `alembic upgrade head`。
- **前端 console 出現 CORS 錯誤**：確認網址是 `http://localhost:5173`，而且後端有在 8000 port 跑。
- **重新整理後沒有自動登入**：DevTools → Application → Cookies 看 `http://localhost:8000` 底下有沒有 `refresh_token`；如果剛剛是用 `127.0.0.1` 開的，換成 `localhost` 再登入一次。
- **5173 被占用**：Vite 會自動改用 5174，但 CORS 預設只允許 5173，請先關掉占用的程式，或在 `backend/.env` 設定 `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`。
