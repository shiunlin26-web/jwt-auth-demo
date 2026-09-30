# JWT Auth Demo

練習前後端登入串接與 Refresh Token 的小專案。

- **後端**：FastAPI + SQLModel（async）+ PostgreSQL（Neon 或本地 Postgres）
- **前端**：React + TypeScript + Vite

## 專案結構

```
jwt-auth-demo/
├── backend/
│   ├── main.py            # FastAPI 入口、CORS、啟動時自動建表
│   ├── database.py        # DB 連線（讀 DATABASE_URL）
│   ├── models.py          # User、RefreshToken 資料表
│   ├── schemas.py         # 請求 / 回應格式
│   ├── security.py        # 密碼雜湊、JWT 簽發與驗證、refresh token 產生
│   ├── dependencies.py    # get_current_user（驗 Bearer token）
│   ├── routes/
│   │   ├── auth.py        # /auth/register、/auth/login、/auth/refresh、/auth/logout
│   │   └── users.py       # /me（需要登入）
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/App.tsx        # 登入畫面、apiFetch（401 自動 refresh）、啟動時恢復登入
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

> 資料表不用手動建，後端啟動時會自動 `create_all`。

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

編輯 `backend/.env`：

```env
DATABASE_URL=postgresql+asyncpg://...   # 第 1 步的連線字串
JWT_SECRET=請換成一串隨機字串
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
```

產生隨機 `JWT_SECRET`：

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
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
> 後端 CORS 只允許 `http://localhost:5173`，前端也寫死呼叫 `http://localhost:8000`。
> 如果用 `127.0.0.1:5173` 開頁面，CORS 會擋掉，refresh token cookie 也不會被帶上。

## 4. 試玩流程

1. 輸入 Email 與密碼（至少 8 碼）→ 按「註冊」
2. 按「登入」→ 拿到 access token（存在記憶體），refresh token 以 httpOnly cookie 存在瀏覽器
3. 按「取得我的資料」→ 帶 `Authorization: Bearer <token>` 呼叫 `/me`
4. **重新整理頁面** → 前端啟動時呼叫 `/auth/refresh`，靠 cookie 自動恢復登入
5. 按「登出」→ 刪掉 DB 裡的 refresh token 並清 cookie

### 想觀察 access token 過期後自動 refresh？

在 `backend/.env` 把 `JWT_EXPIRE_MINUTES` 改成 `1`，重啟後端。登入後等一分鐘再按「取得我的資料」，
打開瀏覽器 DevTools → Network，會看到：

```
GET  /me            → 401
POST /auth/refresh  → 200（拿到新的 access token）
GET  /me            → 200（用新 token 重試）
```

## API 一覽

| Method | Path | 說明 | 認證 |
| --- | --- | --- | --- |
| GET | `/ping` | 健康檢查 | – |
| POST | `/auth/register` | 註冊 `{ email, password }` | – |
| POST | `/auth/login` | 登入，回傳 access token，並設定 `refresh_token` cookie | – |
| POST | `/auth/refresh` | 用 cookie 裡的 refresh token 換新的 access token（同時輪替 refresh token） | Cookie |
| POST | `/auth/logout` | 刪除 refresh token 並清 cookie | Cookie |
| GET | `/me` | 取得目前使用者 | Bearer |

## Token 設計

| | Access Token | Refresh Token |
| --- | --- | --- |
| 格式 | JWT（HS256） | 隨機字串（`secrets.token_urlsafe`） |
| 有效期 | `JWT_EXPIRE_MINUTES`（預設 30 分鐘） | 7 天 |
| 存放 | 前端記憶體（React state / ref） | httpOnly cookie（`path=/auth`），DB 只存 SHA-256 雜湊 |
| 用途 | 呼叫受保護 API | 換新的 access token |
| 輪替 | – | 每次 refresh 都發新的、舊的作廢；舊的被重複使用 → 該使用者所有 refresh token 全部撤銷 |

## 學習路線

一步步把這個專案練到接近生產級的過程，記錄在 [`docs/LEARNING.md`](docs/LEARNING.md)。

## 常見問題

- **`TypeError: connect() got an unexpected keyword argument 'sslmode'` / 連不到 DB**：檢查 `DATABASE_URL` 開頭是不是 `postgresql+asyncpg://`，Neon 要用 `ssl=require` 而不是 `sslmode=require`。
- **前端 console 出現 CORS 錯誤**：確認網址是 `http://localhost:5173`，而且後端有在 8000 port 跑。
- **重新整理後沒有自動登入**：DevTools → Application → Cookies 看 `http://localhost:8000` 底下有沒有 `refresh_token`；如果剛剛是用 `127.0.0.1` 開的，換成 `localhost` 再登入一次。
- **5173 被占用**：Vite 會自動改用 5174，但 CORS 只允許 5173，請先關掉占用的程式，或在 `backend/main.py` 的 `allow_origins` 加上新的網址。
