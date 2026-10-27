# API.md：這個模板的 API 慣例（練習專案開第 3 步前複製成自己的）

> 用途：`PLAN-FULLSTACK.md` 第 2 節 A6 說「第 3 步開始前把這一頁複製成自己的」，這就是那一頁。它寫的是**本模板現在實際的做法**（每一條都能在程式裡找到），加上新功能會碰到、模板還沒有的三件事（列表、授權的狀態碼、從 OpenAPI 產型別）的建議。
> 練習專案：複製這份到你的 repo，把「建議」改成你的決定，之後每個端點照它。AI 做功能的計畫（`PLAN-FULLSTACK.md` 第 4 節六步循環的第 2 步）要寫「照 `API.md` 第幾條」。
> 讀法：第 1～7 條是規矩，第 8 條是每個新端點的檢查表，第 9 條是一個完整例子。

## 1. 路徑

- 全部在 `/api` 底下（`main.py` 的 `api = APIRouter(prefix="/api")`）。前端只打自己網域的 `/api`，本機 Vite 代理、正式 Vercel 代理，不直接打後端網址（跨站會讓 cookie 失效）。
- 資源用**複數名詞、小寫、連字號**：`/api/todos`、`/api/todos/{id}`、`/api/todos/{id}/items`。動作靠 HTTP 方法（GET 讀、POST 建、PATCH 改一部分、PUT 整個換、DELETE 刪），路徑裡不放動詞。
- 例外：不是資源的動作用動詞，只有登入這一組：`/api/auth/register`、`/login`、`/refresh`、`/logout`、`/logout-all`、`/change-password`。
- 每個資源一個檔：`routes/todos.py` 裡 `router = APIRouter(prefix="/todos", tags=["todos"])`，在 `main.py` 用 `api.include_router(todos.router)` 掛上。
- id 用整數自增（模板現狀）。要對外隱藏數量或防猜的資源可以用 UUID，但一個專案裡不要混。

## 2. 認證與授權

- **認證**（你是誰）：請求帶 `Authorization: Bearer <access token>`；端點用 `Depends(get_current_user)` 拿到 `User`（`dependencies.py`）。access token 30 分鐘（`config.py` 的 `jwt_expire_minutes`），過期回 401，前端的 `api` 實例收到 401 會自動打 `/api/auth/refresh` 再重送一次（`client.ts` 的回應攔截器，只重送一次）。
- refresh token 放 httpOnly cookie，`path=/api/auth`、`SameSite=Lax`、正式環境 `Secure`。前端的 JS 碰不到它，也不用管它。
- **授權**（你能不能動這一筆）：模板只有「登入才能看 `/me`」，沒有別人的資料可以越權，所以**練習專案的第一個功能就要定**：
  - 查詢一律帶 `WHERE owner_id = current_user.id`（SQLModel：`select(Todo).where(Todo.id == id, Todo.owner_id == user.id)`）。
  - **不存在、或存在但不是你的 → 404**，訊息一樣（`"Not found"`）。不回 403，免得讓人知道那個 id 有東西。
  - **登入了但角色不夠**（功能 4 加角色之後）→ 403，`"Forbidden"`。
  - 用 `GET /api/todos` 這種列表時不用 404，回空陣列。
- 每個需要登入的端點至少三個測試：成功、沒帶 token 回 401、拿別人的 id 回 404（`tests/test_auth.py` 的 `test_重複註冊回400` 是寫法範例）。

## 3. 狀態碼（模板用到的，照這張表挑）

| 碼 | 什麼時候 | 模板裡的例子 |
| --- | --- | --- |
| 200 | 讀、改成功 | `GET /api/me`、`POST /api/auth/login` |
| 201 | 建立成功，回建立後的物件 | `POST /api/auth/register` |
| 204 | 成功但沒東西好回（刪除、登出） | `POST /api/auth/logout` |
| 400 | 業務規則不過（格式對、但不能做） | `Email already registered`、`新密碼不能和目前密碼相同` |
| 401 | 沒登入、token 壞或過期 | `Not authenticated`、`Incorrect email or password`、refresh token 被重用 |
| 403 | 登入了但沒權限（模板還沒用到） | 功能 4 的角色 |
| 404 | 找不到、或不是你的 | `/api/_boom` 沒開時 |
| 422 | 格式不對（Pydantic 自動） | email 沒有 `@`、密碼太短 |
| 429 | 太頻繁（slowapi） | 登入 10 次／分鐘 |
| 503 | 服務暫時不收 | 註冊額滿（`MAX_USERS`） |
| 500 | 沒接住的例外，Sentry 會收到 | 資料庫連不上 |

唯一性衝突（email 重複）模板用 400；業界也常用 409。選一個，全專案一致；前端只讀 `detail`，兩者都能顯示。

## 4. 錯誤格式

- 一律 `{"detail": ...}`，這是 FastAPI 的預設，前端 `getErrorMessage()`（`client.ts`）只認這個鍵。**不要自創別的鍵**（`error`、`message`）。
- 一般錯誤 `detail` 是字串；422 的 `detail` 是陣列，每一項有 `loc`（哪個欄位）、`msg`、`type`，前端會把 `msg` 串起來顯示。
- 429 自己寫了 handler 讓它也回 `detail`（`main.py` 的 `rate_limit_exceeded`），並帶 `Retry-After` 與 `X-RateLimit-*` 標頭。
- 寫法：`raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="人看得懂的一句話")`。訊息給使用者看，所以用中文或固定的英文短句都可以，但**不要把例外內容、SQL、堆疊丟進去**。
- 不洩漏：登入失敗一律 `Incorrect email or password`（不分「帳號不存在」和「密碼錯」）；之後做忘記密碼也一樣，不管信箱存不存在都回「已寄出」。

## 5. 請求與回應的格式

- 請求 body 一律 JSON，用 Pydantic schema 收（`schemas.py`），長度、格式的限制寫在 schema（`Field(min_length=8)`），不要在路由裡手刻 `if`。
- 回應一律 `response_model=` 指定 schema（`UserRead`），**不要直接回 ORM 物件**，免得多露欄位（密碼雜湊）。
- 單筆回物件，不包一層：`{"id": 1, "email": "..."}`。
- 時間一律 UTC、ISO 8601、帶 `Z`（`"2026-10-27T07:18:08.276359Z"`），前端用 `new Date(s)` 就能讀；要顯示本地時間在前端轉。
- 欄位用 `snake_case`（`created_at`、`last_login_at`），前後端一樣，不轉 camelCase（少一層對應）。
- **列表（模板還沒有，功能 2 要定）**，建議先用 offset 分頁：

  ```
  GET /api/todos?page=1&page_size=20&sort=-created_at&q=牛奶
  → {"items": [...], "total": 137, "page": 1, "page_size": 20}
  ```

  `page_size` 上限 100（超過就當 100）；`sort` 用 `-` 表示倒序，只允許白名單裡的欄位；`q` 是關鍵字。資料超過幾萬筆、要無限捲動時再換 cursor（`next_cursor`），關卡 18 的索引要對到 `sort` 的欄位。

## 6. 標頭

- `X-Request-ID`：每個回應都有。請求帶了就用你的，沒帶後端產一個（12 碼）。log 的每一行都有它，使用者回報「剛剛出錯」時請他附上 ID，`RUNBOOK.md` 第 1 節。
- `Cache-Control: no-store`：所有 `/api` 回應預設都有（登入相關的 API 不能被任何地方快取）。之後公開的、可快取的列表再個別覆寫。
- 頻率限制：`@limiter.limit("10/minute")` 寫在端點上；代理後面要設 `TRUSTED_PROXY_HOPS` 才會算到真正的客戶端 IP（`rate_limit.py`、`/api/_ip`）。新功能裡「會寄信、會花錢、會猜」的端點都要加。

## 7. 健康、除錯、文件

- `GET /api/ping`：活著嗎，不碰資料庫，Render 的 health check 打這個。
- `GET /api/health`：能服務嗎，回 `status`、`db`、`migration`（alembic 版本）、`version`（commit）。部署後第一個看的東西（`RUNBOOK.md` 第 0 節）。
- `GET /api/_boom`、`GET /api/_ip`：演練與除錯，`ENABLE_DEBUG_ENDPOINTS=true` 才開，平常回 404。
- 自動文件：本機 <http://localhost:8000/docs>（互動頁）和 `/openapi.json`。**在根路徑不在 `/api` 底下**，所以正式環境從前端網域開不到，要用 Render 的網址開。
- 從 OpenAPI 產前端型別（模板還沒做，功能 1 做完可以加）：`npx openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.d.ts`（免費、不用裝任何服務；實測過：對本模板產出約 500 行，前端 `tsc` 吃得下），之後 `src/api/todos.ts` 的請求／回應型別從它 import，後端改了欄位前端 `tsc` 會紅。

## 8. 新端點檢查表（每個 PR 的 review 照這個看）

1. 路徑照第 1 條，掛在 `/api` 底下，有 `tags`。
2. 需要登入的有 `Depends(get_current_user)`；查詢有 `owner_id` 條件；不是你的回 404。
3. 輸入是 Pydantic schema，限制寫在 schema；輸出有 `response_model`。
4. 錯誤全是 `HTTPException` + `detail` 字串；狀態碼照第 3 條的表。
5. 列表有分頁、`page_size` 上限、排序白名單；排序欄位有索引（改 `models.py` 就要產遷移）。
6. 會寄信、會花錢、會被猜的端點有 `@limiter.limit`。
7. 測試至少：成功、401、404（別人的）、422（一個壞輸入）。
8. 前端：API 呼叫放 `src/api/<資源>.ts`、用 `api`（會自動 refresh）；query／mutation 的 hook 放 `src/features/<功能>/queries.ts`，query key 照 `useMe.ts` 的樣子（`CHAIN.md` 附錄 A）；錯誤顯示用 `getErrorMessage`。

## 9. 一個完整的例子：待辦事項

```
POST /api/todos                  Authorization: Bearer ...
{"title": "買牛奶", "due_at": "2026-11-01T00:00:00Z"}
→ 201 {"id": 12, "title": "買牛奶", "done": false, "due_at": "2026-11-01T00:00:00Z", "created_at": "2026-10-27T07:18:08Z"}

GET /api/todos?page=1&page_size=20&sort=-created_at
→ 200 {"items": [{...}, {...}], "total": 2, "page": 1, "page_size": 20}

PATCH /api/todos/12
{"done": true}
→ 200 {"id": 12, ..., "done": true}

DELETE /api/todos/12
→ 204

GET /api/todos/999            （不存在，或是別人的）
→ 404 {"detail": "Not found"}

POST /api/todos
{"title": ""}
→ 422 {"detail": [{"loc": ["body", "title"], "msg": "String should have at least 1 character", "type": "string_too_short"}]}
```

後端骨架（照 `routes/users.py` 的樣子）：

```python
router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/{todo_id}", response_model=TodoRead)
async def get_todo(todo_id: int, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    todo = (await session.exec(select(Todo).where(Todo.id == todo_id, Todo.owner_id == user.id))).first()
    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return todo
```

版本：v1（2026-10-27）。依據：`main.py`、`routes/auth.py`、`routes/users.py`、`dependencies.py`、`rate_limit.py`、`schemas.py`、`frontend/src/api/client.ts`，以及在乾淨目錄起服務實際打出來的回應。
