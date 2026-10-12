# 專案導覽：從零讀懂整個專案（到關卡 8）

給**剛接手這個專案的人**，也給**複習用**。

`LEARNING.md` 是照「關卡」寫的，記錄每一關**改了什麼**。
這份是照「**一個請求怎麼跑**」寫的，帶你把**現在的程式碼**從頭讀一遍，不管它是哪一關加的。

---

## 怎麼用這份文件

- 分成 **15 站**，一站讀 1～3 個檔案，大約 15～30 分鐘
- 每站的格式都一樣：
  - **讀哪些檔案**（照順序讀）
  - **一句話**：這站在做什麼
  - **比喻**
  - **重點**（⭐ 越多越重要）
  - **自我檢查**：答得出來就可以往下一站；答不出來，回去看程式或問人
- 細節不重複寫，會標「詳見 LEARNING.md 關卡 X」
- **建議邊讀邊跑**：後端、前端都開著，瀏覽器開 DevTools 的 Network 分頁

### 路線圖

| 站 | 主題 | 檔案 | 重要度 |
|---|---|---|---|
| 0 | 全景：這專案在做什麼 | `README.md` | ⭐⭐⭐ |
| **後端** | | | |
| 1 | 後端怎麼啟動 | `main.py`、`config.py`、`database.py` | ⭐⭐ |
| 2 | 資料表長怎樣 | `models.py`、`migrations/` | ⭐⭐ |
| 3 | 門口檢查：請求格式 | `schemas.py` | ⭐⭐ |
| 4 | 工具箱：密碼與 token | `security.py` | ⭐⭐⭐ |
| 5 | 註冊與登入 | `routes/auth.py`（register、login） | ⭐⭐⭐ |
| 6 | 帶通行證進門 | `dependencies.py`、`routes/users.py` | ⭐⭐⭐ |
| 7 | 續期：refresh 輪替 | `routes/auth.py`（refresh） | ⭐⭐⭐ |
| 8 | 登出與改密碼 | `routes/auth.py`（其餘） | ⭐⭐ |
| 9 | 自動化測試 | `tests/` | ⭐ |
| **前端** | | | |
| 10 | 前端怎麼啟動、換頁 | `main.tsx`、`app/router.tsx`、`app/AppLayout.tsx` | ⭐⭐ |
| 11 | 守門員 | `auth/RequireAuth.tsx`、`auth/GuestOnly.tsx` | ⭐⭐ |
| 12 | 登入狀態放哪 | `auth/authStore.ts`、`auth/authService.ts`、`auth/useAuth.ts` | ⭐⭐⭐ |
| 13 | 跟後端講話 | `api/client.ts`、`api/auth.ts` | ⭐⭐⭐ |
| 14 | 畫面 | `pages/`、`components/`、`utils/` | ⭐ |
| **總複習** | | | |
| 15 | 前後端串起來走一遍 + 踩過的坑 | — | ⭐⭐⭐ |

**時間不夠的話**：先走 0 → 4 → 5 → 6 → 7 → 12 → 13 → 15，這幾站就是 JWT 登入的核心。

---

## 第 0 站：全景

**讀**：`README.md` 的「專案結構」

### 一句話

一個「**註冊、登入、保持登入、登出**」的完整範例，前端 React、後端 FastAPI、資料庫 PostgreSQL。

### 三個角色

```
瀏覽器（React，port 5173）  ←→  後端（FastAPI，port 8000）  ←→  資料庫（PostgreSQL）
```

### ⭐⭐⭐ 整個專案最核心的觀念：兩張卡

拿**健身房**來比喻：

| | 🎫 Access token（通行證） | 💳 Refresh token（會員卡） |
|---|---|---|
| 用途 | 每次進門給警衛看 | 通行證過期時，拿去櫃台換新的 |
| 有效期 | 短（30 分鐘） | 長（7 天） |
| 放在哪 | 前端**記憶體**（Zustand store），重新整理就消失 | 瀏覽器 **httpOnly cookie**，JS 讀不到 |
| 長怎樣 | JWT（裡面寫著「我是 user 5，幾點到期」，有簽名） | 一串隨機字，資料庫存它的雜湊值 |
| 警衛怎麼檢查 | 看簽名對不對，**不查資料庫** | 櫃台**要查資料庫** |

**為什麼要兩張？**
- 只有一張長效卡：被偷了，小偷可以用很久
- 只有一張短效卡：使用者每 30 分鐘就要重新登入一次
- 兩張搭配：通行證被偷頂多能用 30 分鐘；會員卡放在 JS 讀不到的地方，比較難偷

### 自我檢查

- [ ] 重新整理網頁後，access token 還在嗎？那為什麼還是登入狀態？
- [ ] 警衛檢查 access token 時會查資料庫嗎？這帶來什麼好處和壞處？

---

# 後端

## 第 1 站：後端怎麼啟動

**讀**：`main.py` → `config.py` → `database.py`

### 一句話

`uvicorn main:app` 執行 `main.py` → 讀設定 → 準備好資料庫連線 → 掛上所有 API。

### 比喻

開店前的準備：看營業手冊（config）、接好水管（database）、掛上各櫃台的招牌（router）。

### 重點

**⭐⭐ `config.py`：所有設定集中在一個地方**（詳見 LEARNING.md 關卡 2）
- `.env` 裡的值都是字串，`Settings` 會自動轉成正確型別（`int`、`bool`）
- **沒有預設值的欄位就是必填**（`database_url`、`jwt_secret`），沒填的話後端**直接起不來**
  - 這叫 **fail fast**：寧可啟動就失敗，也不要等到有人登入時才爆 500
- 其他檔案都用 `from config import settings` 拿設定

**⭐ `main.py`**
- `CORSMiddleware`：允許 `localhost:5173`（前端）呼叫 `localhost:8000`（後端）。網址不同，瀏覽器預設會擋
- `allow_credentials=True`：允許帶 cookie，refresh token 才送得過來
- `include_router`：把 `routes/auth.py`、`routes/users.py` 的 API 掛上來

**⭐ `database.py`**
- `engine`：資料庫連線池，整個程式共用一個
- `get_session()`：每個請求借一條連線，用完自動還（`async with`）

### 自我檢查

- [ ] `.env` 少填 `JWT_SECRET` 會發生什麼事？什麼時候發生？
- [ ] 前端網址改成 `localhost:3000`，要改哪個設定？

---

## 第 2 站：資料表長怎樣

**讀**：`models.py` → `migrations/versions/0001_...py` → `0002_...py`

### 一句話

`models.py` 定義兩張表，**Alembic** 負責把定義變成資料庫裡真正的表。

### 兩張表

```
user                              refreshtoken
├── id                            ├── id
├── email（不能重複）              ├── token_hash   ← 只存雜湊，不存原文
├── hashed_password ← 不存明碼     ├── user_id      → 指向 user.id
├── created_at                    ├── revoked      ← 用過了沒
└── last_login_at（關卡 5 加的）   ├── expires_at
                                  └── created_at
```

一個 user 可以有好幾張 refresh token，一台裝置一張。

### 重點

**⭐⭐ Alembic（詳見 LEARNING.md 關卡 5）**
- 比喻：資料庫的「**改裝紀錄本**」。每一頁（遷移檔）寫一次改裝內容，照順序施工
- 為什麼需要它：舊做法 `create_all` **只會建新表，不會改已存在的表**（關卡 1 就因此出過 500）
- 改資料表的固定流程：
  1. 改 `models.py`
  2. `alembic revision --autogenerate --rev-id 0005 -m "說明"`：產生遷移檔
  3. **打開遷移檔檢查**（autogenerate 不一定完全正確）
  4. `alembic upgrade head`：套用到資料庫
- `0003` 加 nickname、`0004` 刪掉 nickname：這是你自己練習的紀錄，示範「改錯了就再寫一個遷移改回來」，**不要去改已經套用過的遷移檔**

### 自我檢查

- [ ] 為什麼存 `hashed_password` 和 `token_hash`，而不是原文？
- [ ] 同事 `git pull` 後看到新的遷移檔，他要執行什麼指令？

---

## 第 3 站：門口檢查：請求格式

**讀**：`schemas.py`

### 一句話

規定「前端送來的資料長什麼樣子」和「後端回傳什麼」，格式不對**還沒進到你的程式就被擋掉**（422）。

### 比喻

櫃台的**申請表格**：欄位沒填、格式錯，櫃台直接退件，不會送進辦公室。

### 重點

**⭐⭐ 密碼規則（詳見 LEARNING.md 關卡 0）**
- 8～72 個**可列印 ASCII 字元**（英文、數字、空白、符號）
- 為什麼是 72：bcrypt 最多處理 72 bytes。中文一個字 3 bytes，會超過然後爆 500，這就是關卡 0 修的 bug
- `@field_validator("password")` + `@classmethod`：「這個函式負責檢查 password 欄位」，`raise ValueError` 就會變成 422

**⭐⭐ 同一份資料，不同表格**

| Schema | 用在哪 | 密碼要套規則嗎 |
|---|---|---|
| `UserCreate` | 註冊 | ✅ 要 |
| `UserLogin` | 登入 | ❌ 不用（規則改了的話，舊使用者會登不進來） |
| `ChangePasswordRequest` | 改密碼 | 舊密碼不用、新密碼要 |
| `UserRead` | 回傳使用者資料 | — （**刻意沒有** `hashed_password`） |

### 自我檢查

- [ ] 為什麼登入時不檢查密碼規則？
- [ ] 前端 `utils/password.ts` 也有一份規則，為什麼後端還要再檢查一次？

---

## 第 4 站：工具箱：密碼與 token

**讀**：`security.py`（全部都是小函式，不碰資料庫）

### 一句話

所有「加密、簽名、產生隨機字」的工具都在這裡。

### 重點

| 函式 | 做什麼 | 比喻 |
|---|---|---|
| `hash_password` / `verify_password` | bcrypt 雜湊、比對密碼 | 把密碼打成果汁：打得出來，倒不回去 |
| `create_access_token` | 簽一張 JWT：`{"sub": "5", "exp": 到期時間}` | 開通行證，蓋上**只有後端有的印章**（`JWT_SECRET`） |
| `decode_access_token` | 驗簽名、驗過期 | 警衛看印章是不是真的、過期了沒 |
| `create_refresh_token` | 產生 32 bytes 隨機字串 | 做一張會員卡 |
| `hash_token` | SHA-256 雜湊 | 資料庫只存會員卡的「指紋」 |

**⭐⭐⭐ JWT 的兩個特性**（詳見 LEARNING.md 關卡 1 補充觀念）
1. **內容任何人都看得到**（只是 base64，不是加密），所以裡面不能放密碼等機密
2. **但沒人能偽造**：改了內容，簽名就對不上。沒有 `JWT_SECRET` 簽不出合法的 token

**⭐ 為什麼密碼用 bcrypt，token 用 SHA-256？**
- 密碼是人想的，可能很好猜 → 要用**很慢**的 bcrypt，讓暴力猜測變得很貴
- token 是 32 bytes 隨機字，根本猜不到 → 快速的 SHA-256 就夠

### 自我檢查

- [ ] 把 JWT 貼到 jwt.io 能看到什麼？能改掉裡面的 user id 嗎？
- [ ] `JWT_SECRET` 外洩會怎樣？

---

## 第 5 站：註冊與登入

**讀**：`routes/auth.py` 的 `register`、`login`，以及上面的 `set_refresh_cookie`、`issue_refresh_token`

### 註冊流程

```
收到 email + 密碼（已經過 UserCreate 檢查）
→ 查 email 有沒有人用過（有 → 400）
→ 密碼雜湊後存進 user 表
→ 回傳 UserRead（201）
```

### ⭐⭐⭐ 登入流程

```
收到 email + 密碼
→ 找 user、比對密碼（錯 → 401，訊息故意不說是哪個錯）
→ 簽 access token
→ 更新 last_login_at、順便清掉過期的 refresh token
→ 產生 refresh token：DB 存雜湊，原文放進 cookie
→ commit
→ 回傳 { access_token }（cookie 在 response header 的 Set-Cookie 裡）
```

### 重點

**⭐⭐⭐ refresh token 的 cookie 設定**（`set_refresh_cookie`）

| 參數 | 意思 |
|---|---|
| `httponly=True` | JS 讀不到 → 網站被注入惡意 JS 也偷不走 |
| `samesite="lax"` | 別的網站發起的請求不帶這個 cookie → 防 CSRF |
| `secure` | 只在 HTTPS 傳送。本機是 http 所以設 False，正式環境要 True |
| `path="/api/auth"` | 只有呼叫 `/api/auth/*` 時才帶上，其他 API 不會帶（關卡 10 起所有 API 都在 `/api` 底下） |

**⭐ session 的用法**：`session.add()` 只是「排進待辦」，`await session.commit()` 才真正寫進資料庫。

### 自我檢查

- [ ] 為什麼登入失敗時不告訴使用者「email 不存在」或「密碼錯誤」？
- [ ] access token 放在 response body，refresh token 放在 cookie，為什麼分開放？

---

## 第 6 站：帶通行證進門

**讀**：`dependencies.py` → `routes/users.py`

### 一句話

`get_current_user` 是**警衛**：任何 API 只要寫 `Depends(get_current_user)`，就必須帶有效的 access token 才進得去。

### 流程

```
請求 header：Authorization: Bearer eyJhbGc...
→ HTTPBearer 取出 token（沒帶 → 401/403）
→ decode_access_token 驗簽名、驗過期（失敗 → 401）
→ 用 payload["sub"] 去 DB 找 user（找不到 → 401）
→ 把 user 交給 API 函式
```

### 重點

**⭐⭐⭐ `Depends`（依賴注入）**
- 比喻：API 函式說「我需要一個已登入的 user」，FastAPI 就**先幫你跑警衛**，通過了才把 user 交給你
- `/api/me` 只有 `return current_user` 一行，因為檢查都在警衛那邊做完了
- 以後新增「要登入才能用」的 API，參數加上 `current_user: User = Depends(get_current_user)` 就好

**⭐⭐ 401 是前端的暗號**：前端看到 401，就會以為「通行證過期了」而去換新的。所以「目前密碼打錯」這種情況要回 **400** 而不是 401（見第 8 站）。

### 自我檢查

- [ ] 要新增一個 `GET /my-orders`，怎麼讓它只有登入的人能用？
- [ ] 被刪掉的使用者拿著還沒過期的 token 來，會發生什麼事？

---

## 第 7 站：續期：refresh 輪替

**讀**：`routes/auth.py` 的 `refresh`（**整個專案最值得慢慢讀的一個函式**）

### 一句話

拿會員卡換新通行證。**每換一次，會員卡也換一張新的，舊的作廢**（輪替）。

### ⭐⭐⭐ 流程

```
cookie 裡的 refresh token
→ 雜湊後查 DB，並鎖住這一列（with_for_update）
→ 找不到 → 401
→ 已經 revoked（用過了）→ 🚨 可能被偷了！刪掉這個人所有的 refresh token → 401
→ 過期 → 刪掉 → 401
→ 舊的標記 revoked、發新的 refresh token（放進 cookie）
→ 簽新的 access token 回傳
```

### 重點

**⭐⭐⭐ 重複使用偵測（reuse detection）**（詳見 LEARNING.md 關卡 1）
- 正常使用者手上只會有**最新的**那張會員卡
- 如果有人拿**已經換過的舊卡**來，代表這張卡至少有兩個人拿著，其中一個是小偷
- 分不出誰是小偷，所以**全部作廢**，所有裝置都要重新登入
- 這就是為什麼用過的 token 標記 `revoked`，而不是直接刪掉：要留著才認得出「這張用過了」

**⭐⭐ `with_for_update()`**：同一張卡同時來兩個請求時，第二個要等第一個做完才能讀。不然兩個都會換成功。

**⭐⭐ `MissingGreenlet` 的坑**
- `commit()` 之後，物件的屬性會「過期」，再讀會觸發重新查詢資料庫，在 async 裡會直接報錯（500）
- 解法：**commit 之前**先把要用的值存到變數（`user_id = rt.user_id`）

**⭐ 重複使用偵測那段要在 `raise` 之前 `commit`**：`raise` 之後的程式碼不會執行，刪除就不會生效。

### 自我檢查

- [ ] 小偷偷到一張 refresh token，在使用者之前先用掉了，接下來會發生什麼？
- [ ] 為什麼 `user_id = rt.user_id` 要寫在 `commit()` 前面？

---

## 第 8 站：登出與改密碼

**讀**：`routes/auth.py` 的 `logout`、`logout_all`、`change_password`，以及 `revoke_all_refresh_tokens`

### 比較

| API | 要帶 access token 嗎 | 做什麼 | 影響範圍 |
|---|---|---|---|
| `POST /api/auth/logout` | ❌ 靠 cookie | 刪掉這張 refresh token、清 cookie | 這台裝置 |
| `POST /api/auth/logout-all` | ✅ | 刪掉這個人**所有** refresh token | 所有裝置 |
| `POST /api/auth/change-password` | ✅ | 改密碼 → 刪掉所有 refresh token → **幫這台發一張新的** | 其他裝置登出，這台保持登入 |

### 重點

**⭐⭐⭐ 一定要知道的限制**（詳見 LEARNING.md 關卡 3）
- 「登出所有裝置」之後，其他裝置手上的 **access token 還能用到過期**（最多 30 分鐘）
- 因為警衛檢查 access token **不查資料庫**，沒辦法提前作廢
- 等它過期、去換新的時候，才會發現會員卡沒了而被登出
- 這是 JWT 的取捨：換來「不用每次查 DB」的速度。想要立刻生效，就得付出查 DB 的代價（例如黑名單）

**⭐⭐ 改密碼打錯舊密碼回 400，不是 401**：回 401 的話，前端會以為通行證過期而跑去 refresh（第 6 站的暗號）。

### 自我檢查

- [ ] 手機遺失，按了「登出所有裝置」，撿到手機的人還能用多久？
- [ ] 為什麼 `logout` 不需要 access token？

---

## 第 9 站：自動化測試

**讀**：`tests/conftest.py` → `tests/helpers.py` → `tests/test_auth.py` 挑幾個測試看

### 一句話

把「手動點點看」寫成程式，`python -m pytest` 一次跑完 35 個情境，改了程式馬上知道有沒有改壞。

### 重點

**⭐⭐ 安全第一**：測試會**清空資料表**，所以一定要用另一個資料庫（`TEST_DATABASE_URL`）。`conftest.py` 開頭會檢查，兩個一樣就拒絕執行。

**⭐ `conftest.py` 做的三件事**（詳見 LEARNING.md 關卡 4）
1. 每個測試前清空資料（`clean_database`，`autouse=True` 自動套用）
2. 把 API 的資料庫換成測試資料庫（`dependency_overrides`）
3. 提供 `client`：一個假的瀏覽器，會自動存 cookie

**⭐ 讀一個測試**：準備（註冊）→ 動作（登入）→ 檢查（`assert` 狀態碼、cookie、資料筆數）

### 自我檢查

- [ ] 怎麼只跑名字裡有 refresh 的測試？（`python -m pytest -k refresh`）
- [ ] `make_client` 和 `client` 差在哪？什麼測試需要它？

---

# 前端

## 第 10 站：前端怎麼啟動、換頁

**讀**：`main.tsx` → `app/router.tsx` → `app/AppLayout.tsx`

### 一句話

`main.tsx` 先檢查登入狀態，再依照網址顯示對應頁面。

### 重點

**⭐⭐ `main.tsx`**
- `initializeAuth()`：網頁一打開就拿會員卡試著換通行證（第 12 站）
- 不等它做完就先畫畫面（顯示「載入中」），檢查完畫面自動更新

**⭐⭐ `router.tsx`：路由是一棵樹**（詳見 LEARNING.md 關卡 7）

```
AppLayout（導覽列）
├── GuestOnly（只給未登入的人）
│   ├── /login
│   └── /register
├── RequireAuth（要登入）
│   ├── /
│   └── /settings
└── *（找不到頁面）
```

- 外層的 `element` 會**包住**裡面的頁面
- `<Outlet />` = 「子頁面放這裡」的空位

**⭐ `AppLayout.tsx`**：每一頁共用的導覽列，依登入狀態顯示不同連結。`NavLink` 會知道自己是不是目前的頁面（用來加粗）。

### 自我檢查

- [ ] 要新增一個「要登入才能看」的 `/orders` 頁，要改哪裡？
- [ ] 打開網頁的瞬間，畫面為什麼會先閃一下「載入中」？

---

## 第 11 站：守門員

**讀**：`auth/RequireAuth.tsx` → `auth/GuestOnly.tsx`

### 一句話

兩個守門員，一個擋「沒登入的人」，一個擋「已登入的人」。

| 狀態 | RequireAuth（首頁、設定） | GuestOnly（登入、註冊） |
|---|---|---|
| loading | 載入中 | 載入中 |
| 未登入 | 導到 `/login`，**記住原本想去哪** | 顯示頁面 |
| 已登入 | 顯示頁面 | 導回原本想去的頁面（或首頁） |

### 重點

**⭐⭐ 登入成功後是誰負責跳轉？** 不是 `LoginForm`，是 **GuestOnly**：
登入 → store 有 token → 狀態變成「已登入」→ GuestOnly 重新渲染，發現已登入 → 自動導走。
**登出也一樣**：狀態變成「未登入」→ RequireAuth 自動導到 `/login`。

這就是「**狀態驅動畫面**」：程式只負責改狀態，畫面自己跟著變。

**⭐ `<Navigate replace state={...}>`**
- `replace`：取代這筆瀏覽紀錄，按「上一頁」不會又回到進不去的頁面
- `state`：附帶資料給下一頁（這裡記住原本想去的路徑）

**⭐ 前端守門員只是使用體驗**：真正的保護在後端的 `get_current_user`。前端的檢查可以被繞過，後端的不行。

### 自我檢查

- [ ] 沒登入時直接打開 `/settings`，登入後會到哪一頁？為什麼？

---

## 第 12 站：登入狀態放哪

**讀**：`auth/authStore.ts` → `auth/authService.ts` → `auth/useAuth.ts`

### 一句話

**公布欄**（store）記資料、**辦事員**（service）去後端辦事、**服務窗口**（useAuth）給畫面用。

| 檔案 | 比喻 | 內容 |
|---|---|---|
| `authStore.ts` | 📋 公布欄 | accessToken、user、notice、initialized |
| `authService.ts` | 🧑‍💼 辦事員 | initializeAuth、login、logout、logoutAll、changePassword、reloadUser |
| `useAuth.ts` | 🪟 服務窗口 | 元件用 `const { status, user, login } = useAuth()` |

### 重點

**⭐⭐⭐ Zustand 的兩種看法**（詳見 LEARNING.md 關卡 8）

| 誰 | 怎麼寫 | 特性 |
|---|---|---|
| 畫面（元件） | `useAuthStore((s) => s.user)` | 盯著看，**一變就自動重新渲染** |
| 非畫面（axios、service） | `useAuthStore.getState()` | 瞄一眼當下的值 |

axios 不是元件，以前用 React Context 拿不到 token，Zustand 兩邊都能用。

**⭐⭐ 狀態用「算」的，不另外存**（`selectStatus`）
- 還沒初始化 → loading；有 token → 已登入；沒 token → 未登入
- 這樣不可能出現「token 清掉了，狀態卻還是已登入」的矛盾

**⭐⭐ 每個辦事員函式都是同一個模式**：呼叫 API → 把結果寫上公布欄。畫面不用知道細節。

**⭐ `useAuth` 的好處**：關卡 8 把底層從 Context 換成 Zustand，但 `useAuth()` 的用法沒變，**所有元件一行都不用改**。

### 自我檢查

- [ ] 為什麼 access token 放在 store（記憶體）而不是 localStorage？
- [ ] `clearSession` 被呼叫後，畫面會發生哪些連鎖反應？

---

## 第 13 站：跟後端講話

**讀**：`api/client.ts` → `api/auth.ts`

### 一句話

所有請求都經過 axios。需要登入的請求有**攔截器**：自動貼通行證，被退回（401）就自動換證重寄。

### ⭐⭐⭐ 兩個 axios 實例

| | `publicApi` | `api` |
|---|---|---|
| 攔截器 | 沒有 | 有 |
| 用在 | 註冊、登入、refresh、登出 | `/api/me`、logout-all、change-password |

**登入一定要用 `publicApi`**：密碼錯也是 401，走 `api` 的話會被誤當成「通行證過期」而去 refresh。

### ⭐⭐⭐ 攔截器

```
請求攔截器：送出前 → 從 store 拿 token → 貼上 Authorization: Bearer xxx

回應攔截器：收到 401
  → 已經重寄過（_retry）？ → 放棄
  → 蓋上 _retry 章
  → refreshAccessToken() 換新通行證
      → 換到了：寫進 store、貼新 token、重寄原本的請求
      → 換不到：clearSession("登入已過期，請重新登入")
```

### 重點

**⭐⭐⭐ single-flight（`refreshPromise`）**（詳見 LEARNING.md 關卡 1、6）
- 三個請求同時 401，**只送一次** refresh，其他兩個等同一個結果
- 為什麼一定要：refresh 會**輪替**。如果送三次，第二次拿的是已經作廢的舊卡 → 觸發**重複使用偵測** → 全部登出！
- 這是前端（single-flight）和後端（輪替 + 重複使用偵測）**必須搭配**的地方

**⭐ `getErrorMessage`**：把後端的 `detail`（字串或 422 的陣列）整理成人看得懂的文字。

**⭐ `api/auth.ts`**：一個後端 API 對應一個函式，型別 `User` 對應後端的 `UserRead`。

### 自我檢查

- [ ] 拿掉 `_retry` 會發生什麼事？
- [ ] 拿掉 single-flight，同時發三個請求剛好都 401，結果會怎樣？

---

## 第 14 站：畫面

**讀**：`pages/` 挑一個、`components/LoginForm.tsx`、`utils/password.ts`

### 一句話

`pages/` 是「一個網址一個頁面」，`components/` 是頁面裡可以重複使用的零件。

### 重點

- **⭐ 表單的固定寫法**（`LoginForm`）：
  - `useState` 存輸入值
  - `<form onSubmit>` + `event.preventDefault()`：按 Enter 也能送出，而且不會重新整理頁面
  - `try` 呼叫 `useAuth` 的函式，`catch` 顯示 `getErrorMessage(error)`
- **⭐ 註冊完帶 email 到登入頁**：`navigate("/login", { state: { registeredEmail } })`，登入頁用 `useLocation().state` 讀出來
- **⭐ `utils/password.ts`**：跟後端一樣的密碼規則，只為了**即時提示**，真正把關的是後端
- `UserPanel` 顯示 token 前 40 字是**學習用**，正式專案要拿掉

### 自我檢查

- [ ] 想在登入表單加一個「記住我」的勾選框，要改哪些檔案？（提示：前端、schema、cookie 的 max_age）

---

# 總複習

## 第 15 站：前後端串起來走一遍

一邊看這張表，一邊在瀏覽器實際操作、看 Network 分頁。

### 情境 A：第一次登入

| # | 前端 | 後端 | 資料庫 |
|---|---|---|---|
| 1 | `LoginForm` → `authService.login` → `publicApi.post("/auth/login")`（baseURL 是 `/api`，所以實際送到 `/api/auth/login`） | | |
| 2 | | `UserLogin` 檢查格式 → 比對密碼 → 簽 access token | 查 user |
| 3 | | 產生 refresh token，`Set-Cookie` | 新增 refreshtoken（雜湊） |
| 4 | 把 access token 寫進 store → 呼叫 `api.get("/me")`（攔截器自動貼 token） | `get_current_user` 驗 JWT | 查 user |
| 5 | user 寫進 store → 狀態變「已登入」→ GuestOnly 導到首頁 | | |

### 情境 B：重新整理網頁

| # | 前端 | 後端 |
|---|---|---|
| 1 | 記憶體清空，store 回到初始值（loading） | |
| 2 | `initializeAuth` → `refreshAccessToken()`（瀏覽器自動帶 cookie） | `refresh`：輪替，回傳新 access token + 新 cookie |
| 3 | 寫進 store → `getMe()` → 狀態變「已登入」 | |

### 情境 C：30 分鐘後點「重新取得我的資料」

| # | 前端 | 後端 |
|---|---|---|
| 1 | `api.get("/me")`，帶著過期的 token | `get_current_user` → 401 |
| 2 | 回應攔截器：蓋 `_retry` 章 → refresh | 輪替，回傳新 token |
| 3 | 寫進 store → 重寄 `/api/me` | 200 |
| 4 | 使用者完全沒感覺 | |

### 情境 D：7 天後回來

refresh → 後端說會員卡過期（401）→ `initializeAuth` 換不到 → 狀態「未登入」→ RequireAuth 導到 `/login`。

### 情境 E：refresh token 被偷

小偷先用了那張會員卡（輪替成功）→ 使用者之後拿舊卡來 → 後端發現 `revoked` → **刪掉全部** → 雙方都要重新登入 → 小偷手上的新卡也失效了。

---

## 踩過的坑（一次整理）

| 症狀 | 原因 | 學到什麼 | 關卡 |
|---|---|---|---|
| 中文密碼註冊 500 | bcrypt 只能處理 72 bytes | 輸入要在門口（schema）擋好 | 0 |
| 登入 500，DB 缺欄位 | `create_all` 不會改已存在的表 | 用 Alembic 管資料表 | 1、5 |
| refresh 500 `MissingGreenlet` | commit 後讀屬性 | commit 前先存變數 | 1 |
| 後端起不來 `ValidationError` | `.env` 少填必填設定 | fail fast 是好事，看錯誤訊息補上 | 2 |
| `ModuleNotFoundError` | 沒用 `uv run` 執行，或還沒 `uv sync` | 指令前加 `uv run`；在 `backend` 跑 `uv sync` | 9 |
| Alembic `UnicodeDecodeError` | Windows 讀 `alembic.ini` 的中文註解 | 設定檔保持 ASCII | 5 |
| `greenlet` 找不到 | SQLAlchemy 2.1 不再自動安裝 | 用 `sqlalchemy[asyncio]` | 8 |

---

## 讀完之後

- 每一站的「自我檢查」都答得出來，就代表你讀懂這個專案了
- 想知道某一關**為什麼**這樣設計 → `LEARNING.md` 對應的關卡
- 要把登入功能**搬到別的專案** → `LEARNING.md` 關卡 6「之後其他專案怎麼用」（注意關卡 8 之後的檔案清單）
- 下一步 → `LEARNING.md` 關卡 9：Docker 與 CI（之後是關卡 10 部署、11 維護）
