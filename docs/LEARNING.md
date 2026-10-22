# 學習路線：把 JWT 登入練到接近生產級

這份文件記錄這個專案的練習路線。目標有兩個：

1. 在本地一步步理解「access token + refresh token」登入架構
2. 練完之後，這個專案就是之後其他專案做登入時的**參考範本**

關卡 0～8 全部在本地完成；關卡 9 起會用到 GitHub Actions、Render、Vercel、Neon 這些**免費**的雲端服務，把專案真的上線。關卡 13 起把 repo 提升到專業水準（型別檢查、格式化、表單、樣式、前端測試、頻率限制）；18～20 是 SQL、HTTP、除錯的觀念關。全部 21 關（0～20）已完成。

> 覺得每一關太硬：先看 [`PLAIN.md`](PLAIN.md)，每關三到五句白話，用「一家會員制的店」講完。
> 要 AI 帶著做（2026-10-20 起的預設方式）：[`COACHING.md`](COACHING.md) 有每一關「一次一個指令」的帶做腳本；這份的「驗證方式」是課後自己對照用的。
> 剛接手、或想從頭複習整個專案：先看 [`TOUR.md`](TOUR.md)，它照「一個請求怎麼跑」帶你把現在的程式碼讀一遍。

---

## 學習方式：讀懂 → 跑起來 → 動手改一點

從零開始寫很難，所以每一關換成這個流程：

1. **Claude 寫好程式**，每一關一個 commit，程式裡用中文註解說明「為什麼這樣寫」。
2. **你先讀這份文件裡該關的「觀念」**，搞懂要解決什麼問題。
3. **讀改動**：在 GitHub 打開該關的 commit，或在本地執行：
   ```bash
   git log --oneline          # 找到該關的 commit
   git show <commit-id>       # 看改了什麼（綠色是新增、紅色是刪除）
   ```
4. **跑起來驗證**：照著「驗證方式」操作，親眼看到效果。
5. **做「動手玩」**：這些都是很小的修改，例如改一個數字、註解掉一行，再觀察什麼東西壞掉、為什麼壞掉。**弄壞再修好，是理解程式最快的方法。**
6. **回答「想一想」**：先自己想，再展開答案對照。
7. 有任何看不懂的地方，直接問 Claude，例如「第 12 行的 `await` 是什麼意思？」

> 做完「動手玩」之後，記得把改動還原：`git checkout -- .`（還原所有還沒 commit 的修改）

> **關卡 9 起改用 uv 管理 Python 套件**，不用再啟用 venv。前面關卡寫的指令請這樣讀：
> `python -m pytest ...` → `uv run pytest ...`、`alembic ...` → `uv run alembic ...`、`uvicorn ...` → `uv run uvicorn ...`、
> `python -m pip install -r requirements.txt` → `uv sync`。

---

## 路線圖

| 關卡 | 主題 | 會學到 | 狀態 |
| --- | --- | --- | --- |
| 0 | 密碼規則（修 bcrypt 72 bytes 的 bug） | Pydantic 驗證器、bytes 和字元的差別、註冊與登入分開驗證 | ✅ 完成 |
| 1 | Refresh token 輪替 + 重複使用偵測 + DB 存雜湊 + 前端 single-flight | **refresh token 的核心觀念**（最重要） | ✅ 完成 |
| 2 | 設定抽到 `.env`（pydantic-settings）、關 SQL echo、前端 `VITE_API_URL` | 設定管理 | ✅ 完成 |
| 3 | 「登出所有裝置」、改密碼時撤銷所有 token、清理過期 token | 把第 1 關拿來應用 | ✅ 完成 |
| 4 | pytest 寫測試 | 學 Python 最好的方法，也能自動驗證前面幾關 | ✅ 完成 |
| 5 | Alembic 資料庫遷移 | 為什麼不能一直用 `create_all` | ✅ 完成 |
| 6 | 前端拆成 `api/` + `auth/` + `components/` | 之後其他專案可以直接複製這一套 | ✅ 完成 |
| 7 | React Router：多頁面、需要登入的頁面 | 路由、守門員元件 | ✅ 完成 |
| 8 | Zustand + axios | 用套件取代手寫的登入狀態與 apiFetch | ✅ 完成 |
| 9 | Docker 與 CI（uv、ruff、Dockerfile、GitHub Actions） | 把後端打包成 image、每次 push 自動跑測試 | ✅ 完成 |
| 10 | 部署（Render + Vercel + Neon，前後端同站） | 真的上線，手機開得到 | ✅ 完成 |
| 11 | 維護（healthcheck、log、Sentry、遷移回滾、換密鑰） | 壞掉時知道去哪看、怎麼復原 | ✅ 完成 |
| 12 | TanStack Query | 管理後端資料：快取、loading、錯誤 | ✅ 完成 |
| 13 | 工程品質基線（型別檢查、格式化、Dependabot、幾個專業面的修正） | 什麼叫「專業水準」的 repo | ✅ 完成 |
| 14 | Zod + React Hook Form | 表單驗證（Zod 是前端的 Pydantic） | ✅ 完成 |
| 15 | Tailwind CSS | 樣式（v4、深色模式、共用 UI 元件） | ✅ 完成 |
| 16 | Vitest + MSW | 前端自動化測試（攔截器、守門員、表單） | ✅ 完成 |
| 17 | 登入頻率限制（slowapi） | 防暴力破解；代理後面的客戶端 IP | ✅ 完成 |
| 18 | SQL 與資料庫（看 ORM 底下） | 索引、執行計畫、交易與鎖、N+1 | ✅ 完成 |
| 19 | HTTP 與瀏覽器規則 | 狀態碼、標頭、cookie、CORS、快取 | ✅ 完成 |
| 20 | 讀 log 與除錯（故障演練） | 分段確認、request id、用測試抓 bug | ✅ 完成 |
| 21 | docker compose 與 Playwright E2E | 一個檔案起整套、healthcheck 與 depends_on、真瀏覽器走主路徑 | ✅ 完成 |
| 22 | 指標與追蹤 | Prometheus 拉 /metrics、label 與 cardinality、p95、儀表板進 git、OpenTelemetry 與 collector、log ↔ trace | ✅ 完成 |
| 23 | Kubernetes | Deployment 與探針、Service、遷移 Job、ConfigMap 與 Secret、零停機滾動更新、rollout undo、kustomize | ✅ 完成 |
| 24 | 非同步訊息 | transactional outbox、at-least-once 與冪等、Kafka（Redpanda）、SKIP LOCKED、線上 inline worker | ✅ 完成 |

> 關卡 9～11 是「部署這條鏈」，整體規畫見 [`PLAN.md`](PLAN.md)。

---

## 關卡 0：密碼規則（修 bcrypt 72 bytes 的 bug）✅

**改動的檔案**：`backend/schemas.py`、`backend/security.py`、`backend/routes/auth.py`、`frontend/src/App.tsx`

### 起因：一個 500 的 bug

bcrypt（密碼雜湊演算法）最多只能處理 **72 個 bytes**。原本的程式用 `Field(max_length=72)`，但它算的是**字元數**，而且沒有限制能用哪些字元：

| 密碼 | 字元數 | bytes（UTF-8） |
| --- | --- | --- |
| `abcdefgh` | 8 | 8（英文 1 字 = 1 byte） |
| `密碼密碼密碼密碼` | 8 | 24（中文 1 字 = 3 bytes） |
| 30 個中文字 | 30 ✅ 通過 `max_length=72` | 90 ❌ 超過 bcrypt 上限 |

結果 30 個中文字的密碼能通過驗證，bcrypt 卻丟出 `ValueError`，API 回 **500**（伺服器錯誤），而不是 **422**（你送的資料不合格）。

> **bytes ≠ 字元** 這個觀念很重要，之後處理檔名長度、資料庫欄位長度、API 大小限制時都會遇到。

### 決策：密碼只允許可列印的 ASCII 字元

修 bug 有兩個方向：

| | A. 允許所有字元（NIST 建議） | **B. 只允許英數字與符號（採用）** |
| --- | --- | --- |
| 做法 | 改算 bytes 長度，再做 Unicode 正規化（NFKC） | 只接受可列印的 ASCII，長度 8～72 |
| 優點 | 使用者自由度高 | 規則簡單；沒有輸入法、正規化問題；72 字元剛好 = 72 bytes |
| 缺點 | 要處理正規化；換裝置或輸入法可能打不出密碼 | 使用者選擇較少 |

這個專案之後要當其他專案的參考範本，所以選擇規則簡單明確的 **B**，台灣大部分網站也是這樣做。

**規則**：8～72 個字元，只能是英文大小寫、數字、空白、鍵盤上的符號（`!@#$%^&*` 等）。

### 程式怎麼寫

**1. 註冊用 `UserCreate`，套用規則**（`schemas.py`）

```python
PRINTABLE_ASCII = re.compile(r"^[\x20-\x7E]+$")

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def check_password_chars(cls, v: str) -> str:
        if not PRINTABLE_ASCII.match(v):
            raise ValueError("密碼只能包含英文字母、數字、空白與符號")
        return v
```

- `[\x20-\x7E]` 是正規表達式（regex），意思是「編號 0x20（空白）到 0x7E（`~`）之間的字元」，剛好就是鍵盤上打得出來的英數符號。
- `@xxx` 叫 **decorator（裝飾器）**，意思是「幫下面這個函式加上功能」。這裡是把它註冊成 password 欄位的驗證器。
- 驗證器裡 `raise ValueError`，FastAPI 就會自動回 422；驗證通過一定要 `return v`。

**2. 登入用 `UserLogin`，不套用規則**（`schemas.py`、`routes/auth.py`）

原本註冊和登入共用 `UserCreate`。現在把它分開：**規則只在「設定密碼」時檢查**。

如果登入也檢查規則，那麼規則一改（像這次從「允許中文」改成「不允許」），用舊規則註冊的人就再也登不進來了。登入只需要判斷「密碼對不對」，交給 `verify_password` 就好。

**3. `verify_password` 防呆**（`security.py`）

登入不檢查長度了，那有人送 100 個中文字來登入呢？bcrypt 一樣會丟錯變成 500。所以在 `verify_password` 裡先檢查：超過 72 bytes 的密碼不可能是正確的密碼，直接回傳 `False`，API 回 401。

**4. 前端即時提示**（`App.tsx`）

前端用一樣的規則即時顯示提示，不符合時「註冊」按鈕不能按；「登入」按鈕只要有填就能按。

> 前端檢查只是為了使用者體驗，**真正的把關在後端**。前端的檢查可以被繞過，例如直接用 curl 或 Swagger 打 API。

### 驗證方式

在 <http://localhost:8000/docs> 用 `POST /auth/register` 試試：

| password | 預期結果 |
| --- | --- |
| `abc1234`（7 字元） | 422 至少 8 個字元 |
| `中文密碼中文密碼` | 422 密碼只能包含英文字母、數字、空白與符號 |
| `abcdefgh😀` | 422（emoji 也不行） |
| 73 個 `a` | 422 最多 72 個字元 |
| `P@ss w0rd!~` | 201 成功（空白、符號都可以） |

再到前端 <http://localhost:5173> 輸入密碼，觀察提示文字和按鈕狀態的變化。

### 動手玩

1. 把 `check_password_chars` 裡的 `return v` 刪掉，再註冊一次。會發生什麼事？（提示：看 terminal 的錯誤訊息）
2. 把 `routes/auth.py` 的 `login` 改回用 `UserCreate`，然後用一個 7 個字元的密碼登入，看看回的是 401 還是 422。想想哪一個比較好？
3. 把 `security.py` 裡 `verify_password` 的 `if len(plain_bytes) > 72:` 那段註解掉，用 Swagger 送 30 個中文字去**登入**，看 terminal 出現什麼錯誤。
4. 在前端把 `canLogin` 改成 `canRegister`，再用中文密碼試著登入，看看按鈕狀態怎麼變。

### 想一想

<details>
<summary>Q1：為什麼不直接把密碼截斷成 72 bytes 就好？</summary>

bcrypt 的錯誤訊息確實建議 `my_password[:72]`，但截斷代表「前 72 bytes 一樣的兩個密碼會被當成同一個」。明確拒絕太長的密碼比偷偷截斷安全，也比較不會讓使用者困惑。

</details>

<details>
<summary>Q2：登入時送 7 個字元的密碼，應該回 422 還是 401？</summary>

401（帳號或密碼錯誤）比較好。回 422「密碼至少 8 個字元」等於告訴攻擊者你的密碼規則；而且規則一改，舊帳號就登不進來。登入時就只回答「對」或「不對」。

</details>

<details>
<summary>Q3：回傳的 422 錯誤裡有一個 <code>input</code> 欄位，裡面是什麼？這在正式環境有什麼問題？</summary>

`input` 會把使用者送來的原始密碼原封不動回傳。正式環境最好不要在錯誤訊息裡回傳密碼，因為它可能被 log 或監控工具記錄下來。可以留到之後的關卡處理（自訂 `RequestValidationError` 的 handler）。

</details>

<details>
<summary>Q4：之前用中文密碼註冊的帳號怎麼辦？</summary>

還是可以正常登入，因為登入不檢查規則（`UserLogin`），bcrypt 比對的是當初存的雜湊。只是這些人之後如果要「改密碼」，新密碼就得符合新規則。這也是為什麼「規則只在設定密碼時檢查」這麼重要。

</details>

---

## 關卡 1：Refresh Token 輪替 ✅

**改動的檔案**：`backend/security.py`、`backend/models.py`、`backend/routes/auth.py`、`frontend/src/App.tsx`

### 觀念

```
現在：
  refresh token A ──換──▶ access token（A 還能繼續用 7 天）
  → A 被偷走，攻擊者就能用 7 天，你也察覺不到

輪替（rotation）：
  A ──換──▶ access token + 新的 B（A 作廢）
  B ──換──▶ access token + 新的 C（B 作廢）

重複使用偵測（reuse detection）：
  有人拿已作廢的 A 來換 → 代表 A 被偷過（正常使用者手上不會有舊的）
  → 把這個使用者所有 refresh token 全部刪掉，大家都得重新登入
```

**DB 只存雜湊**：資料庫存 `sha256(token)`，不存原始字串。就算資料庫外洩，攻擊者拿到的也只是雜湊值，不能直接拿去用。這裡不用 bcrypt，是因為 refresh token 本身已經是 32 bytes 的隨機字串，不怕被暴力猜，用快速的 SHA-256 就夠了。

**前端 single-flight**：有了輪替之後，如果畫面同時發出 3 個請求、同時收到 401，會各自去 refresh。第一個把 A 換成 B，後兩個拿著 A 再去換，就被當成重複使用，使用者會被強制登出。所以同一時間只能有一個 refresh 請求，其他人等同一個結果。

### ⚠️ 開始前：升級資料表（一次性）

`create_all` 只會建立**不存在**的表，**不會修改已經存在的表**。這關把 `token` 欄位改名為 `token_hash`，又新增了 `revoked` 欄位，所以要先手動刪表：

1. 到 Neon 後台 → **SQL Editor**，執行：
   ```sql
   DROP TABLE refreshtoken;
   ```
2. 重新啟動後端（`Ctrl+C` 後再 `uvicorn main:app --reload`），表會用新欄位自動重建
3. 原本登入中的狀態會失效，重新登入一次即可（`user` 表不受影響，帳號都還在）

這個麻煩就是第 5 關要學 Alembic 的原因，先記住這種感覺。（第 5 關之後，改欄位改用 Alembic 遷移，不用再刪表）

### 改了哪些檔案

| 檔案 | 改動 |
| --- | --- |
| `backend/security.py` | 新增 `hash_token()`：SHA-256 雜湊 |
| `backend/models.py` | `token` → `token_hash`，新增 `revoked` 欄位 |
| `backend/routes/auth.py` | 抽出 `set_refresh_cookie()`、`issue_refresh_token()`；`/refresh` 加上輪替與重複使用偵測；全部改用雜湊查詢 |
| `frontend/src/App.tsx` | 新增 `refreshAccessToken()`（single-flight），`init` 和 `apiFetch` 都改用它 |

### 建議閱讀順序

1. `security.py` 最下面的 `hash_token`，只有一行
2. `models.py` 的 `RefreshToken`，看兩個欄位的註解
3. `routes/auth.py`：
   - 先看最上面兩個小函式 `set_refresh_cookie`、`issue_refresh_token`
   - 再看 `login` 怎麼用它們（比原本短很多）
   - **重點是 `refresh`**，對照下面的流程圖一段一段看
4. `App.tsx` 的 `refreshAccessToken`，再看 `init` 和 `apiFetch` 哪裡呼叫它

### `/auth/refresh` 流程

```
收到 cookie 裡的 refresh token
  │
  ├─ 沒有 cookie ────────────────────────▶ 401 No refresh token
  │
  ├─ hash 後在 DB 找不到 ────────────────▶ 401 Invalid refresh token
  │
  ├─ 找到了，但 revoked = True（用過了！）
  │     └─ 刪掉這個使用者「所有」refresh token ─▶ 401 Refresh token reused
  │
  ├─ 過期 ─── 刪掉這筆 ──────────────────▶ 401 Refresh token expired
  │
  └─ 正常
        ├─ 舊的標記 revoked = True
        ├─ 產生新的 token，DB 存它的 hash
        ├─ commit
        ├─ Set-Cookie: 新的 token
        └─ 200 + 新的 access token
```

### 驗證方式

**1. 輪替：cookie 每次都會換**

登入後打開 DevTools → Application → Cookies → `http://localhost:8000`，記下 `refresh_token` 的值。重新整理頁面（前端會自動呼叫 refresh），值應該**變了**。

**2. 重複使用偵測**

把剛剛記下的**舊值**拿來用，在 PowerShell 執行：

```powershell
curl.exe -X POST http://localhost:8000/auth/refresh -b "refresh_token=舊的值"
```

應該回 `{"detail":"Refresh token reused"}`。這時重新整理瀏覽器，**也被登出了**，因為這個使用者所有的 refresh token 都被刪掉了。

> PowerShell 裡的 `curl` 其實是 `Invoke-WebRequest` 的別名，要打 `curl.exe` 才是真正的 curl。

**3. 看資料庫**

Neon 後台 → Tables → `refreshtoken`。每重新整理一次頁面，就多一筆 `revoked = false` 的新資料，上一筆變成 `true`。`token_hash` 欄位是一串 64 字元的雜湊，和 cookie 裡的值完全不一樣。

**4. 前端 single-flight**

1. 在 `backend/.env` 加上 `JWT_EXPIRE_MINUTES=0`，重啟後端（access token 一簽出來就過期，每次呼叫 `/me` 都會 401）
2. 登入，打開 DevTools → Network，把節流（throttling）設成 **Slow 4G**，讓請求變慢，比較容易同時發生
3. 快速連點「取得我的資料」三下
4. Network 裡會看到 3 個 `/me` 401，但 **`/auth/refresh` 只有 1 個**，而且沒有被登出

（retry 的 `/me` 還是 401，是因為新的 access token 也馬上過期了，正常。玩完記得把這行刪掉。）

### 動手玩

1. **拿掉 single-flight，看使用者被踢出去**
   在 `App.tsx` 的 `refreshAccessToken` 裡，把 `if (!refreshPromiseRef.current) {` 改成 `if (true) {`，再做一次上面的「驗證 4」。你會看到 3 個 `/auth/refresh`：一個 200，兩個 401 `Refresh token reused`，然後被登出。

2. **重現開發時真的踩到的 bug**
   在 `routes/auth.py` 的 `refresh` 最後，把 `create_access_token(user_id)` 改成 `create_access_token(rt.user_id)`，重新整理頁面。後端會回 500，terminal 顯示 `MissingGreenlet` 錯誤。
   原因：`commit()` 之後，SQLAlchemy 會把 `rt` 的屬性標成「過期」，下次讀取時要重新查 DB。但在 async 裡，這種「偷偷去查 DB」的動作不被允許。所以要在 commit **之前**先把 `user_id` 存到變數。**這是 async SQLAlchemy 最常見的坑之一。**

3. **拿掉 commit，看刪除會不會生效**
   把重複使用偵測那段的 `await session.commit()` 註解掉，再做一次「驗證 2」。回應一樣是 401，但去 Neon 看，token **沒有被刪掉**。因為 `raise` 之後的程式碼不會執行，而沒有 commit 的修改會被丟棄（rollback）。

### 想一想

<details>
<summary>Q1：為什麼用過的 token 要標記 <code>revoked</code>，不直接刪掉？</summary>

如果直接刪掉，之後有人拿舊 token 來，後端只會查到「不存在」，分不出它是**被偷的舊 token**，還是**亂打的假 token**。留著並標記 `revoked`，才認得出「這是真的、但已經用過的」，也才能觸發重複使用偵測。

</details>

<details>
<summary>Q2：開兩個分頁，同時按重新整理，會發生什麼事？</summary>

兩個分頁共用同一個 cookie，會**同時**拿同一個 token 去 refresh。前端的 single-flight 只在同一個分頁內有效，所以其中一個會被判定為重複使用，結果兩個分頁都被登出。

這是輪替機制已知的取捨。實務上的解法有：
- **寬限期**：舊 token 作廢後的幾秒內再被使用，不算重複使用
- 用 `BroadcastChannel` 讓分頁之間協調，只讓一個分頁去 refresh

練習專案先知道有這回事就好。

</details>

<details>
<summary>Q3：<code>revoked = True</code> 的資料會一直累積，要怎麼處理？</summary>

可以定期刪除 `expires_at < 現在` 的資料。過期的 token 無論如何都不能用了，留著沒有意義。可以在第 3 關順便做。

</details>

<details>
<summary>Q4：<code>refresh</code> 裡查詢時加的 <code>.with_for_update()</code> 是做什麼的？</summary>

它會把查到的那一列**鎖住**，直到 commit 為止。如果同一個 token 同時來了兩個請求：
- 沒有鎖：兩個請求可能都讀到 `revoked = False`，兩個都換成功，等於一個 token 被用了兩次
- 有鎖：第二個請求要等第一個 commit 後才讀得到資料，這時已經是 `revoked = True`，就會觸發重複使用偵測

</details>

<details>
<summary>Q5：refresh token 為什麼可以只用 SHA-256，密碼卻一定要用 bcrypt？</summary>

密碼是人想的，範圍很小，攻擊者可以拿常見密碼一個一個試。bcrypt 故意設計得很慢，就是為了讓這種暴力嘗試變得不划算。

refresh token 是 `secrets.token_urlsafe(32)` 產生的 256 bits 隨機值，就算雜湊再快也不可能猜中，所以用快速的 SHA-256 就夠了，每次 refresh 也不用多花時間。

</details>

### 補充觀念

#### Set-Cookie：refresh token 怎麼進到瀏覽器

`Set-Cookie` 是 HTTP 回應的標準 header。後端在回應裡寫「請幫我存這個 cookie」，瀏覽器收到後自動存起來，之後發請求到符合條件的網址時，也會**自動**帶上。前端 JS 完全不用碰它（`HttpOnly` 也讓它碰不到）。

```http
HTTP/1.1 200 OK
Set-Cookie: refresh_token=P68V...; HttpOnly; Path=/auth; Max-Age=604800; SameSite=Lax

{"access_token": "eyJhbGci...", "token_type": "bearer"}
```

refresh token 走 header（瀏覽器自動處理），access token 走 JSON 內容（前端 JS 讀出來放進記憶體）。

前端（5173）和後端（8000）的 port 不同，瀏覽器視為不同來源，fetch 預設不處理 cookie，所以要加 `credentials: "include"`。

#### 三個機制的關係

```
輪替（用一次換一張）
   ↓ 好處
重複使用偵測（舊的又出現 = 被偷）
   ↓ 副作用：同時 refresh 會誤判自己人
Single-flight（同一時間只送一次 refresh）
```

#### Access token 無法提前作廢

後端驗證 access token 時**不查資料庫**，只檢查簽章對不對、有沒有過期（這叫 stateless，無狀態）。好處是快，壞處是**發出去之後就收不回來**：

- 登出時，refresh token 被刪了，但手上的 access token **在過期前還是能用**
- 這就是 access token 要設得很短（30 分鐘）的原因：萬一被偷，損失也有限

想提前作廢就得查資料庫，那就失去 JWT 的意義了。這是 JWT 架構刻意接受的取捨。

#### JWT 的內容任何人都讀得到

JWT 是 `header.payload.signature` 三段，前兩段只是 Base64 編碼，**不是加密**。把 access token 貼到 <https://jwt.io>，就能看到裡面的 `sub`（使用者 id）和 `exp`（過期時間）。

- **簽章**保證內容沒被竄改（改了一個字，簽章就對不上）
- 但**內容不是秘密**，所以 payload 裡絕對不能放密碼之類的敏感資料
- 能產生合法簽章的只有持有 `JWT_SECRET` 的人，所以 `JWT_SECRET` 外洩 = 任何人都能偽造任何使用者的 token


---

## 關卡 2：設定管理 ✅

**改動的檔案**：`backend/config.py`（新增）、`backend/database.py`、`backend/security.py`、`backend/main.py`、`backend/routes/auth.py`、`backend/.env.example`、`backend/requirements.txt`、`frontend/src/App.tsx`、`frontend/.env.example`（新增）

### 觀念

**同一份程式碼，換個環境只要換設定，不用改程式。** 本機開發、正式環境用的資料庫、網址、安全設定都不一樣，這些差異應該放在環境變數（`.env`），而不是寫死在程式碼裡。

原本的問題：

| 問題 | 在哪裡 |
| --- | --- |
| 設定散落各處，每個檔案各自 `load_dotenv()` + `os.getenv()` | `database.py`、`security.py` |
| 寫死在程式碼裡 | CORS 網址（`main.py`）、cookie `secure=False`（`auth.py`）、前端 API 網址（`App.tsx`） |
| `JWT_SECRET` 沒填也能啟動，等到有人登入才爆 500 | `security.py` |
| SQL echo 永遠開著，log 裡會出現 token 雜湊等敏感資料 | `database.py` |

### ⚠️ 開始前（一次性）

1. 安裝新套件：
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   ```
2. **檢查 `backend/.env` 的 `JWT_SECRET` 有沒有至少 32 個字元。** 太短的話後端會起不來，用這行產生一個新的：
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   換掉 `JWT_SECRET` 之後，舊的 access token 都會失效（簽章對不上），重新登入就好。

### 程式怎麼寫

#### 後端：`config.py`

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=Path(__file__).parent / ".env", extra="ignore")

    database_url: str                          # 必填
    jwt_secret: str = Field(min_length=32)     # 必填，至少 32 字元
    jwt_expire_minutes: int = 30               # 選填，有預設值
    cookie_secure: bool = False
    ...

settings = Settings()
```

- **`BaseSettings` 就是第 0 關學的 `BaseModel`**，差別只在資料來源：`BaseModel` 驗證 API 送來的 JSON，`BaseSettings` 驗證環境變數和 `.env`。寫法完全一樣：型別標註、`Field(...)`、預設值。
- **沒有預設值 = 必填**，有預設值 = 選填。
- **型別自動轉換**：`.env` 裡全部都是字串，`jwt_expire_minutes: int` 會自動把 `"30"` 轉成 `30`，`cookie_secure: bool` 會把 `"true"` 轉成 `True`。
- **名稱不分大小寫**：`.env` 裡寫 `JWT_SECRET`，Python 這邊用 `jwt_secret`，會自動對上。
- **`settings = Settings()`** 在 `config.py` 被第一次 import 時執行，建立的當下就讀 `.env` 並驗證。有錯就丟例外，後端直接起不來，這叫 **fail fast**：問題越早爆越好找。
- 其他檔案用 `from config import settings`，然後 `settings.jwt_secret` 這樣取值。

`@property` 是把方法變成「像屬性一樣取值」：`settings.cors_origin_list` 不用加括號，但背後是在執行函式，把 `"a,b"` 切成 `["a", "b"]`。

#### 前端：`VITE_API_URL`

```ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
```

- `import.meta.env` 是 Vite 提供的，會讀 `frontend/.env`。
- **只有 `VITE_` 開頭的變數才會給前端用。** 這是 Vite 的保護機制，避免不小心把其他秘密打包進網頁。
- `??` 表示「左邊是 `undefined` 或 `null` 就用右邊」，所以沒設定也能跑。
- ⚠️ **前端的環境變數會被直接寫進打包後的 JS，任何人打開 DevTools 都看得到。前端 `.env` 絕對不能放秘密。**

### 所有設定一覽

| 設定 | 預設值 | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | （必填） | 資料庫連線字串 |
| `JWT_SECRET` | （必填，≥ 32 字元） | JWT 簽章金鑰 |
| `JWT_ALGORITHM` | `HS256` | JWT 簽章演算法 |
| `JWT_EXPIRE_MINUTES` | `30` | access token 有效分鐘數 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | refresh token 有效天數（DB 和 cookie 都用它） |
| `CORS_ORIGINS` | `http://localhost:5173` | 允許的前端網址，逗號分隔 |
| `COOKIE_SECURE` | `false` | cookie 只走 HTTPS |
| `DB_ECHO` | `false` | terminal 印出 SQL |
| `VITE_API_URL`（前端） | `http://localhost:8000` | 後端網址 |

> 改了 `.env` 之後要**重啟**（後端 `Ctrl+C` 再啟動、前端 `Ctrl+C` 再 `npm run dev`）。`--reload` 只會偵測程式碼的變動，不會重讀 `.env`。

### 驗證方式

1. **fail fast**：把 `backend/.env` 的 `JWT_SECRET` 那行暫時註解掉（前面加 `#`），啟動後端。terminal 會看到：
   ```
   ValidationError: 1 validation error for Settings
   jwt_secret
     Field required
   ```
   後端直接起不來，而且告訴你是哪一個設定出問題。改回來再繼續。
2. **SQL log**：在 `.env` 加上 `DB_ECHO=true`，重啟後登入，terminal 會印出一堆 `SELECT`、`INSERT`。刪掉那行，重啟後就安靜了。
3. **cookie 有效期**：加上 `REFRESH_TOKEN_EXPIRE_DAYS=1`，重啟後登入，到 DevTools → Application → Cookies 看 `refresh_token` 的 Expires，會是明天。
4. **CORS**：前端改用 5174 啟動：`npm run dev -- --port 5174`，打開 <http://localhost:5174> 登入，會看到 CORS 錯誤。在後端 `.env` 加上 `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`，重啟後端，就能登入了。

### 動手玩

1. 在 `.env` 寫 `JWT_EXPIRE_MINUTES=abc`，看看啟動時的錯誤訊息長怎樣。
2. 建立 `frontend/.env`，寫 `VITE_API_URL=http://localhost:9999`，重啟前端，試著登入。打開 Network 分頁看請求送到哪裡去了。玩完刪掉這個檔案。
3. **自己加一個設定**（這題要動手寫，很短）：
   - 在 `config.py` 的 `Settings` 裡加一行 `app_name: str = "JWT Auth Demo"`
   - 在 `main.py` 的 `/ping` 改成 `return {"message": "pong", "app": settings.app_name}`
   - 打開 <http://localhost:8000/ping> 確認
   - 再到 `.env` 加 `APP_NAME=我的登入練習`，重啟後再看一次

### 想一想

<details>
<summary>Q1：為什麼 <code>.env</code> 不能 commit，<code>.env.example</code> 卻要 commit？</summary>

`.env` 裡有真正的秘密（資料庫密碼、`JWT_SECRET`），推上 GitHub 就等於公開了，所以 `.gitignore` 把它排除。

`.env.example` 是「範本」，只列出有哪些設定、格式長怎樣，值都是假的。別人（或未來的你）clone 專案後，複製一份改成自己的值就能跑。

</details>

<details>
<summary>Q2：可以把 <code>JWT_SECRET</code> 放到 <code>frontend/.env</code>，讓前端自己驗證 token 嗎？</summary>

絕對不行。前端的環境變數會被打包進 JS 檔，任何人都能看到。拿到 `JWT_SECRET` 就能偽造任何人的 token。**秘密只能放在後端。**

</details>

<details>
<summary>Q3：為什麼「啟動時就失敗」比「登入時才失敗」好？</summary>

啟動時失敗，你一執行就知道哪裡設定錯了，錯誤訊息也很清楚。登入時才失敗，可能要等使用者回報才發現，而且錯誤是一個看不出原因的 500，要翻 log 才找得到問題。

</details>

<details>
<summary>Q4：如果系統環境變數和 <code>.env</code> 都設定了 <code>JWT_SECRET</code>，會用哪一個？</summary>

**系統環境變數優先**，`.env` 只是補上沒設定的部分。正式環境通常不放 `.env` 檔，而是由雲端平台直接設定環境變數，程式碼完全不用改，這就是把設定抽出來的價值。

</details>

---

## 關卡 3：登出所有裝置、改密碼 ✅

**改動的檔案**：`backend/schemas.py`、`backend/routes/auth.py`、`frontend/src/App.tsx`

這關沒有新的大觀念，而是**把第 0～2 關學到的東西組合起來用**。

### 觀念

第 1 關的「重複使用偵測」裡，有一個動作是「刪掉這個使用者所有 refresh token」，效果是所有裝置都得重新登入。這個動作在其他情境也很有用：

| 情境 | 為什麼要讓所有裝置登出 |
| --- | --- |
| 重複使用偵測（第 1 關） | token 可能被偷了 |
| **登出所有裝置**（這關） | 在網咖登入忘了登出、手機掉了 |
| **改密碼**（這關） | 密碼可能就是因為外洩才改的，舊的登入狀態都不該再信任 |

所以這關先把它抽成共用函式 `revoke_all_refresh_tokens`，再拿來做兩個新功能。

### ⚠️ 一定要知道的限制

**撤銷 refresh token 之後，其他裝置不會「立刻」被登出。** 它們手上的 access token 在過期前（預設最多 30 分鐘）還是能用，因為驗證 access token 不查資料庫（第 1 關補充觀念：access token 無法提前作廢）。

```
手機：access token 還有 20 分鐘 → 這 20 分鐘內呼叫 API 都正常
      ↓ 20 分鐘後過期
      去 refresh → refresh token 已經被刪了 → 401 → 被登出
```

這就是為什麼 access token 要設得很短。重新整理頁面會立刻 refresh，所以重新整理就能馬上看到被登出。

### 程式怎麼寫

#### 1. 密碼規則抽成共用函式（`schemas.py`）

原本規則寫在 `UserCreate` 的驗證器裡面。現在改密碼也要套用同一套規則，所以把它搬出來變成一般函式，兩邊都呼叫它：

```python
def check_password_chars(v: str) -> str:
    if not PRINTABLE_ASCII.match(v):
        raise ValueError("密碼只能包含英文字母、數字、空白與符號")
    return v

class UserCreate(BaseModel):
    ...
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return check_password_chars(v)

class ChangePasswordRequest(BaseModel):
    current_password: str                                  # 不套規則（跟登入一樣的理由）
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return check_password_chars(v)
```

**同一條規則只寫一次**，以後要改規則只改一個地方（第 2 關「同一件事只能有一個來源」的觀念）。

`current_password` 不套規則，理由跟第 0 關的 `UserLogin` 一樣：舊密碼可能是舊規則設的，只要判斷對不對就好。

#### 2. 兩個共用的小函式（`routes/auth.py`）

```python
async def revoke_all_refresh_tokens(session, user_id):
    await session.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))

async def delete_expired_refresh_tokens(session, user_id):
    await session.execute(delete(RefreshToken).where(
        RefreshToken.user_id == user_id,
        RefreshToken.expires_at < datetime.now(timezone.utc),
    ))
```

- 第 1 關 `refresh` 裡的重複使用偵測，改成呼叫 `revoke_all_refresh_tokens`。
- `.where(A, B)` 傳兩個條件，代表「A **而且** B」，相當於 SQL 的 `WHERE A AND B`。
- 這兩個函式都**只是排進待辦，沒有 commit**，由呼叫的人決定什麼時候 commit。這樣就能把多個動作放在同一次 commit 裡，要嘛全部成功、要嘛全部失敗。

#### 3. 登入時順便清掉過期的 token

第 1 關「想一想」Q3 提過：`revoked = True` 的資料會一直累積。現在每次登入時，順便刪掉這個使用者已經過期的 refresh token：

```python
await delete_expired_refresh_tokens(session, user.id)
refresh_token = await issue_refresh_token(session, user.id)
await session.commit()
```

**為什麼只刪「過期的」，不刪「`revoked` 的」？** `revoked` 但還沒過期的 token 要留著做重複使用偵測（第 1 關 Q1）。過期之後就算被拿來用也會被擋，留著沒有意義了。

#### 4. `POST /auth/logout-all`

```python
@router.post("/logout-all", status_code=204)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),   # ← 需要 access token
    session: AsyncSession = Depends(get_session),
):
    await revoke_all_refresh_tokens(session, current_user.id)
    await session.commit()
    response.delete_cookie(key="refresh_token", path="/auth")
```

**`current_user: User = Depends(get_current_user)`** 是這關第一次在 `auth.py` 用到的東西，它在 `dependencies.py`，`/me` 一直都在用：

1. 從 `Authorization: Bearer xxx` header 拿出 access token
2. 驗證簽章和有效期
3. 從 token 裡的 `sub` 找出使用者
4. 任何一步失敗就回 401，函式**不會執行**

所以函式裡拿到的 `current_user` 一定是已登入的使用者。**要求登入的 API，加上這個參數就好。**

> 為什麼 `logout` 不用 access token，`logout-all` 卻要？
> `logout` 只刪「自己手上這張」refresh token，有 cookie 就能證明你持有它。
> `logout-all` 會影響**所有裝置**，是比較重大的操作，所以要求有效的 access token，確認是本人。

#### 5. `POST /auth/change-password`

```
1. 目前密碼對嗎？         錯 → 400「目前密碼錯誤」
2. 新舊密碼一樣嗎？        一樣 → 400
3. 更新密碼雜湊
4. 撤銷所有 refresh token  → 其他裝置之後都會被登出
5. 幫「這台」發新的 refresh token + access token → 使用者不用重新登入
6. 一次 commit
```

幾個細節：

**為什麼「目前密碼錯誤」回 400，不是 401？**

401 的意思是「你沒登入，或 token 失效了」。前端的 `apiFetch` 看到 401，會以為 access token 過期，自動去 refresh 再重試，但這裡的問題根本不是 token。**狀態碼要用對，前端才不會誤判。**

**為什麼要 `user_id = current_user.id`？**

就是第 1 關踩過的坑：commit 之後物件的屬性會過期，再讀就會出錯（`MissingGreenlet`），所以在 commit 前先把 id 存成變數。

**為什麼改完密碼，自己這台不用重新登入？**

這是 UX 的選擇。撤銷全部之後，再幫目前這台發一組新的 token，使用者體驗比較好。很多網站也會選擇「全部登出、重新登入」，兩種都可以。

#### 6. 前端（`App.tsx`）

- 登入後多了「登出所有裝置」按鈕，和「修改密碼」表單
- 兩個都用 `apiFetch` 呼叫，因為需要帶 access token
- 新密碼的提示共用第 0 關的 `getPasswordError`
- 改密碼成功後，用回傳的新 access token 呼叫 `updateToken`

### 驗證方式

**用兩個瀏覽器模擬兩台裝置**：一個用一般視窗，另一個用**無痕視窗**（`Ctrl+Shift+N`）。無痕視窗的 cookie 是分開的，等於另一台裝置。

1. **改密碼**
   - 兩個視窗都登入同一個帳號
   - 在一般視窗修改密碼 → 顯示「密碼已更新，其他裝置都已登出」，自己還是登入狀態
   - 無痕視窗按「取得我的資料」→ **還能用**（access token 還沒過期，這就是上面講的限制）
   - 無痕視窗**重新整理** → 被登出了（refresh 失敗）
   - 用舊密碼登入 → 失敗；用新密碼 → 成功
2. **登出所有裝置**
   - 兩個視窗都登入
   - 在一般視窗按「登出所有裝置」→ 自己被登出
   - 無痕視窗重新整理 → 也被登出了
3. **錯誤情況**：改密碼時故意打錯目前密碼、新舊密碼一樣、新密碼用中文，看看各自的錯誤訊息。
4. **過期 token 清理**：在 Neon 的 `refreshtoken` 表裡，觀察 `expires_at` 已經過去的資料，登入一次之後就不見了。（想馬上看到效果，可以在 `.env` 設 `REFRESH_TOKEN_EXPIRE_DAYS=0`，登入幾次，再改回來登入一次。）

### 動手玩

1. 在 `.env` 設 `JWT_EXPIRE_MINUTES=1`，重做「驗證 1」。改完密碼後，無痕視窗不要重新整理，等一分鐘再按「取得我的資料」，觀察它什麼時候被登出。
2. 把 `change_password` 裡「目前密碼錯誤」的狀態碼改成 `401`，打開 Network 分頁再故意打錯一次。你會看到前端多送了一次 `/auth/refresh` 和一次重試，這就是狀態碼用錯造成的誤判。
3. 把 `change_password` 裡的 `user_id = current_user.id` 刪掉，後面的 `user_id` 都改成 `current_user.id`，再改一次密碼，看看會發生什麼（提示：第 1 關動手玩 2）。

### 想一想

<details>
<summary>Q1：改密碼時為什麼要求輸入「目前密碼」？已經登入了不是嗎？</summary>

如果有人趁你離開座位用你的電腦，或偷到你的 access token，沒有這道檢查的話，他就能直接改掉你的密碼，把你鎖在帳號外面。要求目前密碼，確保是「知道密碼的本人」在操作。

</details>

<details>
<summary>Q2：如果想做到「改密碼後，其他裝置立刻被登出」，該怎麼做？</summary>

驗證 access token 時就得查資料庫。常見做法是在 `user` 表加一個 `token_version` 欄位，簽 JWT 時把它放進去；改密碼時把版本號 +1；`get_current_user` 驗證時比對 JWT 裡的版本和資料庫裡的版本，不一樣就拒絕。

代價是每個 API 請求都要多查一次資料庫，失去 JWT「不查資料庫」的優點。所以大部分系統接受「最多延遲 access token 有效期」這個取捨。

</details>

<details>
<summary>Q3：<code>revoke_all_refresh_tokens</code> 為什麼不在函式裡直接 commit？</summary>

因為呼叫它的人，常常還有其他事要在**同一次 commit** 裡完成。例如改密碼時：更新密碼、撤銷所有 token、發新 token，這三件事要嘛全部成功、要嘛全部失敗。如果撤銷完就先 commit，接著發新 token 時出錯，就會變成「密碼沒改，但所有裝置都被登出了」這種半套狀態。

</details>

<details>
<summary>Q4：為什麼 <code>delete_expired_refresh_tokens</code> 放在登入時執行？還有別的做法嗎？</summary>

登入時順便清理，好處是簡單，不需要額外的排程程式，而且只清這個使用者的資料，量很小。缺點是從來不再登入的使用者，他的舊資料永遠不會被清掉。

正式環境常見的做法是用**排程工作**（cron job）每天跑一次，刪除所有過期的資料。這需要額外的設定，練習專案用登入時清理就夠了。

</details>

---

## 關卡 4：自動化測試（pytest）✅

**改動的檔案**：`backend/tests/`（新增：`conftest.py`、`helpers.py`、`test_rules.py`、`test_auth.py`）、`backend/pytest.ini`（新增）、`backend/requirements-dev.txt`（新增）、`backend/config.py`、`backend/.env.example`、`backend/routes/auth.py`

### 觀念

到第 3 關為止，每一關都是用 curl 和瀏覽器**手動**驗證。問題是：

- 改了第 3 關的程式，你會回頭把第 0～2 關全部重新手動測一次嗎？通常不會。
- 不小心改壞了舊功能，可能好幾天後才發現。

**自動化測試就是把「手動驗證的步驟」寫成程式**，以後一行指令就能把所有情境跑一遍：

```
python -m pytest
...
34 passed in 15s
```

全部通過 = 之前做好的功能都還正常。有失敗 = 剛剛的修改弄壞了某個東西，而且會直接告訴你是哪一個。

#### 兩種測試

| | 單元測試（`test_rules.py`） | 整合測試（`test_auth.py`） |
| --- | --- | --- |
| 測什麼 | 單一函式，例如 `check_password_chars` | 完整的 API 流程，例如「登入 → refresh → 重複使用」 |
| 需要資料庫嗎 | 不用 | 要（測試專用的） |
| 速度 | 很快 | 比較慢 |

### ⚠️ 開始前（一次性）

**1. 建立測試專用資料庫**

測試每次執行都會**清空資料表**，所以絕對不能用你平常的資料庫。在 Neon 建一個新的：

- Neon 後台 → **SQL Editor**，執行：
  ```sql
  CREATE DATABASE jwtdemo_test;
  ```
- 複製你原本的 `DATABASE_URL`，**只把最後的資料庫名稱**換成 `jwtdemo_test`：
  ```
  原本：postgresql+asyncpg://xxx:yyy@ep-xxx.neon.tech/neondb?ssl=require
  測試：postgresql+asyncpg://xxx:yyy@ep-xxx.neon.tech/jwtdemo_test?ssl=require
  ```
- 加到 `backend/.env`：
  ```env
  TEST_DATABASE_URL=postgresql+asyncpg://xxx:yyy@ep-xxx.neon.tech/jwtdemo_test?ssl=require
  ```

> 測試程式有安全檢查：`TEST_DATABASE_URL` 沒設定，或跟 `DATABASE_URL` 一樣，就會直接停止，不會動到任何資料。

**2. 安裝測試用套件**

```bash
cd backend
python -m pip install -r requirements-dev.txt
```

`requirements-dev.txt` 是「開發時才需要」的套件（pytest 等），跟執行後端需要的 `requirements.txt` 分開，正式環境就不用裝這些。

**3. 執行**

```bash
cd backend
python -m pytest
```

看到 `34 passed` 就成功了。Neon 在遠端，每個測試都要連網路，大約需要幾十秒。

**常用選項**

| 指令 | 作用 |
| --- | --- |
| `python -m pytest -v` | 列出每個測試的名稱和結果 |
| `python -m pytest -k 登出` | 只跑名稱包含「登出」的測試 |
| `python -m pytest tests/test_rules.py` | 只跑某個檔案 |
| `python -m pytest -x` | 遇到第一個失敗就停下來 |

### 檔案結構

```
backend/
├── pytest.ini            pytest 的設定
├── requirements-dev.txt  測試用套件
└── tests/
    ├── conftest.py       共用設定：測試資料庫、client（pytest 自動載入）
    ├── helpers.py        共用小工具：register()、login()、auth_header()
    ├── test_rules.py     單元測試：密碼規則、雜湊
    └── test_auth.py      整合測試：所有 API 流程
```

pytest 會自動找 `tests/` 裡 `test_` 開頭的檔案，以及裡面 `test_` 開頭的函式，每一個函式就是一個測試。

### 讀懂一個測試

```python
async def test_舊的refresh_token再被使用會撤銷全部(client, make_client):
    # 1. 準備：註冊、登入、refresh 一次
    await register(client)
    await login(client)
    old_cookie = client.cookies.get("refresh_token")
    await client.post("/auth/refresh")        # old_cookie 被作廢

    # 2. 執行：小偷拿舊的 cookie 來 refresh
    thief = make_client(cookies={"refresh_token": old_cookie})
    res = await thief.post("/auth/refresh")

    # 3. 檢查
    assert res.status_code == 401
    assert res.json()["detail"] == "Refresh token reused"
    assert await count_refresh_tokens() == 0
```

- **函式名稱就是說明**：Python 允許中文函式名稱，所以直接用中文寫「這個測試在驗證什麼」，失敗時一眼就看得懂。
- **三段式**：準備 → 執行 → 檢查（Arrange → Act → Assert）。幾乎所有測試都是這個結構。
- **`assert 條件`**：條件是 `False` 就測試失敗。相當於 JS 測試的 `expect(...).toBe(...)`。
- **`client`、`make_client` 參數**：這是 **fixture**，下面說明。

### Fixture：測試前幫你準備好的東西

測試函式的參數寫 `client`，pytest 就會去 `conftest.py` 找同名的 fixture，執行它，把結果傳進來：

```python
@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
```

- **`client`** = 一台裝置（一個瀏覽器）。它會像瀏覽器一樣**自動保存 cookie**，所以登入後再 refresh，cookie 會自動帶上。
- **`make_client`** = 需要好幾台裝置時用，每呼叫一次就多一台，cookie 各自獨立。可以傳 `cookies={...}` 模擬「手上拿著某個 cookie 的人」。
- **`ASGITransport`**：請求直接送進 FastAPI，**不需要啟動 uvicorn**。
- **`yield`**：`yield` 前面是「測試前」要做的事，後面是「測試後」的收尾。

### `conftest.py` 做的三件事

**1. 安全檢查**：`TEST_DATABASE_URL` 沒設定或跟 `DATABASE_URL` 相同，就用 `pytest.exit(...)` 直接停止。

**2. 每個測試前清空資料庫**

```python
@pytest.fixture(autouse=True)
async def clean_database():
    ...
    await conn.execute(text('TRUNCATE TABLE refreshtoken, "user" RESTART IDENTITY CASCADE'))
```

- `autouse=True`：**每個測試都自動執行**，不用寫在參數裡。
- 每個測試都從**空的資料庫**開始，彼此不會互相影響。不然上一個測試註冊的帳號，會讓下一個測試的「註冊成功」變成「重複註冊」。
- 第一次執行時會砍掉重建所有資料表，所以 `models.py` 改了欄位也不用手動處理（測試資料庫可以隨便砍）。

**3. 讓 API 改連測試資料庫**

```python
app.dependency_overrides[get_session] = get_test_session
```

所有 API 都用 `Depends(get_session)` 拿資料庫連線。**`dependency_overrides` 是 FastAPI 提供的測試功能**，意思是「把 `get_session` 換成 `get_test_session`」。一行就讓整個 app 改用測試資料庫，正式程式碼完全不用改。

### 單元測試的兩個技巧（`test_rules.py`）

**`@pytest.mark.parametrize`：同一個測試，換不同資料跑好幾次**

```python
@pytest.mark.parametrize("password, ok", [
    ("a" * 7, False),   # 太短
    ("a" * 8, True),    # 剛好最短
    ("a" * 72, True),   # 剛好最長
    ("a" * 73, False),  # 太長
])
def test_註冊密碼長度限制(password, ok):
    ...
```

這會產生 4 個測試。注意這 4 組資料都在「邊界」上（7/8、72/73），**bug 最常出現在邊界**。

**`pytest.raises`：預期「會丟出錯誤」**

```python
with pytest.raises(ValueError):
    check_password_chars("中文密碼中文密碼")
```

有丟出 `ValueError` 才算通過；沒丟，測試反而失敗。

### 測試涵蓋了什麼

| 關卡 | 測試 |
| --- | --- |
| 0 | 密碼字元規則、長度邊界、登入不套規則、超過 72 bytes 不會 500 |
| 1 | refresh 輪替、重複使用偵測、同時 refresh 只有一個成功、DB 只存雜湊 |
| 3 | 登出只影響自己、登出所有裝置、access token 在撤銷後仍可用（限制）、改密碼的各種情況、登入時清理過期 token |
| 基本 | 註冊、登入、`/me`、沒帶 token 回 401 |

### 這關順便修的一個地方

第一次跑測試時出現了 `DeprecationWarning`（棄用警告）：SQLModel 新版建議刪除資料時用 `session.exec(delete(...))`，不要用 `session.execute(...)`。`routes/auth.py` 的兩個共用函式已經改好了。

**這就是測試的另一個好處：它會跑過所有程式碼，連平常不會注意到的警告都會浮出來。**

### 驗證方式

1. 照「開始前」設定好，執行 `python -m pytest`，應該看到 `34 passed`
2. 執行 `python -m pytest -v`，看看每個測試的名稱
3. 到 Neon 確認：**平常用的資料庫**裡的資料完全沒變；`jwtdemo_test` 裡有 `user`、`refreshtoken` 兩張表（測試結束時可能有最後一個測試留下的資料，下次跑會再清空）

### 動手玩

1. **弄壞程式，看測試抓不抓得到**：把 `routes/auth.py` 裡 `refresh` 的 `rt.revoked = True` 這行註解掉，跑 `python -m pytest`。應該會有 2 個測試失敗，讀讀看錯誤訊息，想想為什麼是這兩個。改回來。
2. **重現第 1 關的坑**：把 `refresh` 最後的 `create_access_token(user_id)` 改成 `create_access_token(rt.user_id)`，跑測試，會看到好幾個 `MissingGreenlet` 失敗。改回來。
3. **自己寫一個測試**（很短，照著別的測試改就好）：在 `test_auth.py` 最下面加上：
   ```python
   async def test_email格式錯誤回422(client):
       res = await register(client, email="not-an-email")
       assert res.status_code == 422
   ```
   然後只跑這一個測試：
   ```bash
   python -m pytest -k email
   ```
   - **`-k` 的意思是「只跑名稱裡包含這個字的測試」**，用測試函式的名稱來篩選，不用把 34 個全部跑一遍。
   - **`email` 從哪來？** 就是你剛新增的函式名稱 `test_email格式錯誤回422` 裡的那個 `email`。原本的 34 個測試名稱裡都沒有 `email`，所以只會選到你新增的這一個。
   - 寫名稱裡的任何一段都可以，例如 `-k 格式錯誤`。如果你把測試改名成 `test_信箱格式錯誤回422`，就要改用 `-k 信箱`。
   - 跟 `helpers.py` 裡的 `EMAIL = "test@example.com"` 無關，那是測試用的帳號，只是剛好拼法一樣。`-k` 只看 `def test_...` 的名稱。

   通過之後，再把 `422` 改成 `400`，重跑一次，看看失敗時的訊息長怎樣。

### 想一想

<details>
<summary>Q1：為什麼每個測試前都要清空資料庫？</summary>

讓每個測試都**獨立**。如果不清空，測試的結果會取決於「前面跑了哪些測試」：單獨跑會過、一起跑就失敗，或是換個順序就失敗，這種測試很難除錯。每個測試從空的資料庫開始，結果才穩定。

</details>

<details>
<summary>Q2：已經有單元測試測過密碼規則了，為什麼整合測試還要再測一次「中文密碼註冊回 422」？</summary>

單元測試證明 `check_password_chars` 這個函式是對的。但它有沒有被**正確地接到 API 上**，是另一件事。例如有人不小心把 `UserCreate` 的 `@field_validator` 刪掉，單元測試還是會過，只有整合測試會失敗。兩種測試檢查的是不同層次。

</details>

<details>
<summary>Q3：為什麼用 <code>dependency_overrides</code>，不直接把 <code>DATABASE_URL</code> 改成測試資料庫？</summary>

改 `DATABASE_URL` 要嘛去改 `.env`（很容易忘記改回來，結果開發時連到測試資料庫，或反過來），要嘛在測試啟動前動環境變數（順序很難控制）。`dependency_overrides` 只在測試裡生效，正式程式碼、`.env` 都不用動，也不可能影響到平常跑的後端。

</details>

<details>
<summary>Q4：測試全部通過，就代表程式沒有 bug 嗎？</summary>

不代表。測試只能證明「**有寫到的情境**」是對的，沒寫到的情境照樣可能有 bug。例如目前沒有測試「兩個分頁同時重新整理」（第 1 關 Q2 的限制）。測試的價值在於：**已經驗證過的東西，以後不會在不知不覺中被改壞。**

</details>

---

## 關卡 5：資料庫遷移（Alembic）✅

**改動的檔案**：`backend/alembic.ini`（新增）、`backend/migrations/`（新增）、`backend/main.py`、`backend/models.py`、`backend/schemas.py`、`backend/routes/auth.py`、`backend/requirements.txt`、`backend/tests/test_auth.py`

### 一句話

**用「遷移檔」記錄資料表的每一次變更，改欄位時不用再刪表。**

### 為什麼需要

還記得第 1 關嗎？`refreshtoken` 表改了欄位，你得去 Neon 手動 `DROP TABLE`，結果還遇到登入 500。原因是：

> `create_all` 只會建立**不存在**的表，**不會修改已經存在的表**。

刪表重建在練習時還好，但正式環境不行，因為**資料會全部消失**。

### Alembic 是什麼

**Alembic 是「資料表結構的 git」。**

| git | Alembic |
| --- | --- |
| 每次改程式碼，就產生一個 commit | 每次改資料表結構，就產生一個**遷移檔** |
| commit 記錄「改了哪些行」 | 遷移檔記錄「新增了哪個欄位、建了哪張表」 |
| `git checkout` 切到某個版本 | `alembic upgrade` / `downgrade` 升級或降級資料庫 |

每個遷移檔都有兩個函式：

- **`upgrade()`**：往前，要做的變更（例如新增欄位）
- **`downgrade()`**：往回，撤銷這個變更（例如刪掉那個欄位）

Alembic 會在資料庫裡建一張小表 `alembic_version`，記住「**這個資料庫目前在哪一版**」，所以它知道還有哪些遷移沒套用。

### ⚠️ 開始前：你的資料庫要做的事（一次性）

你的 Neon 資料庫**已經有** `user` 和 `refreshtoken` 兩張表（以前 `create_all` 建的）。所以不能直接「從頭建立」，否則會出現「表已經存在」的錯誤。在 `backend` 資料夾、確認有 `(venv)` 之後，依序執行：

**1. 安裝 Alembic**

```powershell
python -m pip install -r requirements.txt
```

`requirements.txt` 多了 `alembic`。

**2. 告訴 Alembic「這個資料庫已經是 0001 版」**

```powershell
alembic stamp 0001
```

- `stamp` 是「蓋章」：**只在 `alembic_version` 表記錄版本號，不會動任何資料表**。
- `0001` 是第一個遷移檔的編號，內容就是「建立 `user` 和 `refreshtoken`」，剛好是你資料庫現在的樣子。

**3. 升級到最新版**

```powershell
alembic upgrade head
```

- `upgrade` 是「套用還沒套用的遷移」。
- `head` 是「最新版」，就像 git 的 `HEAD`。
- 這會執行 `0002`：在 `user` 表**新增** `last_login_at` 欄位，**原本的帳號都還在**。

**4. 確認資料庫和程式一致**

```powershell
alembic check
```

看到 `No new upgrade operations detected.` 就完成了。意思是「資料庫結構和 `models.py` 完全一樣，沒有需要再遷移的東西」。

> 如果第 4 步列出了差異，代表你的資料庫跟預期不一樣（可能是很早期建立的表），把訊息貼給我看。

**之後：** 每次 `git pull` 拿到新的遷移檔，只要再跑一次 `alembic upgrade head`。

### 改了什麼

#### 新增的檔案

```
backend/
├── alembic.ini                 Alembic 的設定檔（不用動）
└── migrations/
    ├── env.py                  Alembic 執行時的進入點：連資料庫、讀 models.py
    ├── script.py.mako          產生新遷移檔用的範本（不用動）
    └── versions/               遷移檔都放這裡，依編號排序
        ├── 0001_create_user_and_refreshtoken_tables.py
        └── 0002_add_user_last_login_at.py
```

**`alembic.ini`**、**`script.py.mako`** 是 Alembic 的設定和範本，跟 `pytest.ini` 一樣，知道它們是做什麼的就好，不用搞懂每一行。

> ⚠️ 這兩個檔案的註解是英文，因為 **Alembic 讀 `alembic.ini` 時用的是系統預設編碼**，Windows 繁體中文環境不是 UTF-8，裡面有中文就會出現 `UnicodeDecodeError`。所以這兩個檔案只能用英文和半形符號。`.py` 檔不受影響，Python 原始碼一律用 UTF-8 讀取，可以放心寫中文。

**`migrations/env.py`** 是 `alembic init` 產生的範本，我只改了兩個地方：

```python
target_metadata = SQLModel.metadata    # 「資料表應該長怎樣」→ 看 models.py

engine = create_async_engine(settings.database_url, ...)   # 連線 → 用 .env 的 DATABASE_URL
```

#### 遷移檔長怎樣（以 0002 為例）

```python
revision = '0002'          # 我是 0002
down_revision = '0001'     # 我的上一版是 0001（像 git commit 指向上一個 commit）

def upgrade() -> None:
    op.add_column('user', sa.Column('last_login_at', ..., nullable=True))

def downgrade() -> None:
    op.drop_column('user', 'last_login_at')
```

- `op.add_column`：新增欄位，相當於 SQL 的 `ALTER TABLE user ADD COLUMN ...`
- `op.drop_column`：刪掉欄位
- **這兩個遷移檔都是 Alembic 自動產生的**（`--autogenerate`），我只加了中文註解

#### `main.py`：拿掉 `create_all`

原本後端啟動時會自動執行 `create_all`。現在資料表交給 Alembic 管理，這段就刪掉了。

**所以以後資料表要用 `alembic upgrade head` 建立，後端不會自己建。** 如果忘了，會看到 `relation "user" does not exist` 之類的錯誤。

#### 示範用的新欄位：`last_login_at`（最後登入時間）

這關需要一個「實際改資料表」的例子，所以加了這個欄位：

| 檔案 | 改動 |
| --- | --- |
| `models.py` | `User` 加上 `last_login_at: datetime \| None = None` |
| `routes/auth.py` | 登入成功時，把 `last_login_at` 設成現在時間 |
| `schemas.py` | `UserRead` 加上 `last_login_at`，`/me` 就會回傳它 |
| `tests/test_auth.py` | 新增「登入後會記錄最後登入時間」的測試（現在共 35 個） |

為什麼是 `datetime | None`（可以是空的）？因為**舊的帳號沒有這個值**。新增欄位時，資料庫裡已經存在的資料，這個欄位只能先是空的（`NULL`）。

### 以後要改資料表的固定流程

這是這關最重要的東西，以後其他專案也一樣：

```
1. 改 models.py（例如加一個欄位）

2. alembic revision --autogenerate --rev-id 0003 -m "add user nickname"
   → Alembic 比對 models.py 和資料庫，自動產生 migrations/versions/0003_add_user_nickname.py

3. 打開產生的遷移檔看一眼，確認內容是你要的

4. alembic upgrade head
   → 套用到資料庫

5. 把遷移檔跟程式碼一起 commit
```

`revision` 指令的參數：

| 參數 | 意思 |
| --- | --- |
| `--autogenerate` | 自動比對、自動產生內容。不加的話，會產生一個空的遷移檔，要自己寫 |
| `--rev-id 0003` | 指定版本編號。不指定的話 Alembic 會給一串亂數，例如 `6207fa150a72`，不好讀 |
| `-m "add user nickname"` | 這次變更的說明，會變成檔名的一部分（建議用英文，檔名比較不會出問題） |

### 常用指令一覽

都要在 `backend` 資料夾、有 `(venv)` 的狀態下執行：

| 指令 | 作用 |
| --- | --- |
| `alembic upgrade head` | 升級到最新版（最常用） |
| `alembic current` | 看資料庫現在在哪一版 |
| `alembic history` | 列出所有遷移檔 |
| `alembic check` | 檢查資料庫和 `models.py` 是否一致 |
| `alembic downgrade -1` | 退回上一版（`-1` 是「往回一步」） |
| `alembic stamp 版本號` | 只記錄版本號，不動資料表（只有接手舊資料庫時才會用到） |

### 測試呢？

`tests/conftest.py` 還是用 `create_all` 建測試資料表。測試資料庫每次都會整個砍掉重建，沒有「保留舊資料」的需求，用 `create_all` 最簡單。

### 驗證方式

1. 做完上面「開始前」的 4 個步驟
2. 啟動後端和前端，登入後按「取得我的資料」，回傳的 JSON 裡多了 `last_login_at`
3. 到 Neon 打開 `user` 表，看到 `last_login_at` 欄位，而且原本的帳號都還在
4. Neon 多了一張 `alembic_version` 表，裡面只有一筆資料：`0002`
5. `python -m pytest` 應該是 `35 passed`

### 動手玩

1. **退回再升級**
   - 執行 `alembic downgrade -1`，到 Neon 看 `user` 表，`last_login_at` 欄位不見了；`alembic current` 顯示 `0001`
   - 這時啟動後端登入，會出錯，因為程式需要這個欄位但資料庫沒有
   - 執行 `alembic upgrade head` 加回來，一切恢復正常
2. **讓 `alembic check` 抓到差異**
   - 在 `models.py` 的 `User` 加一行 `nickname: str | None = None`，**先不要產生遷移檔**
   - 執行 `alembic check`，它會告訴你「`user.nickname` 這個欄位資料庫裡還沒有」
   - 把那行刪掉，再 `alembic check` 一次，又恢復一致
3. **自己完整做一次遷移**（照著「以後要改資料表的固定流程」）
   - 在 `User` 加上 `nickname: str | None = None`
   - `alembic revision --autogenerate --rev-id 0003 -m "add user nickname"`
   - 打開 `migrations/versions/0003_add_user_nickname.py` 看看內容
   - `alembic upgrade head`，到 Neon 確認多了 `nickname` 欄位
   - **玩完要還原**（順序很重要）：先 `alembic downgrade -1`（把欄位從資料庫刪掉），再刪除 `0003_add_user_nickname.py` 檔案，最後把 `models.py` 那行刪掉

### 想一想

<details>
<summary>Q1：為什麼你的資料庫要用 <code>stamp 0001</code>，不能直接 <code>upgrade head</code>？</summary>

`upgrade head` 會從頭開始套用所有遷移，第一個就是 0001「建立 `user` 表」。但你的資料庫已經有這張表了，就會出現「表已經存在」的錯誤。

`stamp 0001` 是告訴 Alembic「0001 做的事，這個資料庫早就有了，不用再做」。之後 `upgrade head` 就只會從 0002 開始。

全新的資料庫（例如別人 clone 專案）就不用 stamp，直接 `upgrade head` 從 0001 開始建。

</details>

<details>
<summary>Q2：新增欄位時，為什麼通常要允許空值（<code>None</code>）？</summary>

資料表裡已經有資料了。新增一個「不能是空的」欄位，舊資料在這個欄位要填什麼？資料庫不知道，就會拒絕這個變更。

所以新欄位通常先設成可以是空的，或者給一個預設值。

</details>

<details>
<summary>Q3：遷移檔為什麼要 commit 進 git？</summary>

遷移檔是「資料表結構的歷史紀錄」。別人（或另一台電腦的你）clone 專案後，只要 `alembic upgrade head`，就能把資料庫建成一模一樣的結構。正式環境更新時也一樣。沒有 commit，其他地方就不知道資料表改了什麼。

</details>

<details>
<summary>Q4：遷移檔已經套用了，發現寫錯，可以直接改那個檔案嗎？</summary>

**已經套用到資料庫、或已經 push 給別人的遷移檔，不要改。** Alembic 只看版本號，已經是 0002 的資料庫不會再執行一次 0002，改了也沒用，而且會造成不同資料庫的結構不一致。

正確做法是**再產生一個新的遷移檔**（0003）來修正，就像 git 不會去改舊的 commit，而是再 commit 一次。

還沒套用、也還沒 push 的話，可以 `downgrade` 回去、刪掉檔案重新產生。

</details>

---

## 關卡 6：前端整理（api / auth / components）✅

**改動的檔案**：`frontend/src/` 底下（新增 `api/`、`auth/`、`components/`、`utils/`，改寫 `App.tsx`、`main.tsx`，刪掉沒用到的 `App.css` 和 `assets/` 範本檔）

### 一句話

**把 290 行、什麼都擠在一起的 `App.tsx`，拆成分工清楚的幾個檔案，變成之後其他專案可以直接複製的登入範本。**

### 為什麼要拆

原本的 `App.tsx` 同時在做這些事：

- 存 access token
- refresh、single-flight
- 遇到 401 自動重試
- 呼叫每一個 API
- 管理登入狀態
- 註冊表單、登入表單、改密碼表單、使用者資料的畫面

想把「登入功能」搬到另一個專案時，很難分清楚哪些要帶走、哪些是這個頁面專用的。

### 新的結構

```
frontend/src/
├── api/                      跟後端溝通（不是 React，一般的 TS）
│   ├── client.ts             底層：token 存放、refresh、apiFetch、錯誤處理
│   └── auth.ts               每個登入相關的 API 一個函式：login()、getMe()……
├── auth/                     登入狀態（React）
│   ├── AuthContext.ts        定義登入狀態長什麼樣子
│   ├── AuthProvider.tsx      登入狀態的「大腦」：保存狀態、提供 login/logout 等動作
│   └── useAuth.ts            元件用來取得登入狀態的 hook
├── components/               畫面
│   ├── LoginForm.tsx         註冊與登入表單
│   ├── UserPanel.tsx         使用者資料、登出按鈕
│   ├── ChangePasswordForm.tsx 修改密碼表單
│   └── styles.ts             共用樣式
├── utils/
│   └── password.ts           密碼規則（註冊和改密碼共用）
├── App.tsx                   依登入狀態決定顯示哪個畫面（只剩 30 行）
└── main.tsx                  用 <AuthProvider> 包住整個 App
```

### 誰呼叫誰

```
components（畫面）
   │  const { login, user } = useAuth()
   ▼
auth/（登入狀態）
   │  await authApi.login(email, password)
   ▼
api/auth.ts（每個 API 一個函式）
   │  fetch(...) 或 apiFetch(...)
   ▼
api/client.ts（token、refresh、401 重試）
   │
   ▼
後端
```

**每一層只跟下一層說話。** 畫面不知道網址是什麼，也不知道 token 存在哪；`api/` 不知道有哪些畫面。所以要換畫面、換專案時，`api/` 和 `auth/` 可以原封不動帶走。

### 每個檔案在做什麼

#### `api/client.ts`：底層

原本散在 `App.tsx` 裡的四塊邏輯，搬到這裡：

| 區塊 | 做什麼 | 原本在 `App.tsx` 的樣子 |
| --- | --- | --- |
| token 存放 | `getAccessToken()`、`setAccessToken()` | `useState` + `useRef` |
| refresh | `refreshAccessToken()`，single-flight | `refreshPromiseRef` |
| 呼叫需要登入的 API | `apiFetch()`，401 時自動 refresh 再重試 | `apiFetch` |
| 錯誤處理 | `readJson()`：失敗時丟出 `ApiError`，訊息整理成看得懂的文字 | `JSON.stringify(data.detail)` |

**為什麼 token 從 `useRef` 改成模組裡的變數？**

```ts
let accessToken: string | null = null;   // 模組層級的變數
```

這個檔案不是 React 元件，只是一般的 TS 模組。模組裡的變數**整個 App 只有一份**，不會因為元件重新渲染而改變，任何地方 import 進來讀到的都是最新的值。原本用 `useRef` 就是為了達到同樣的效果，現在直接用一般變數更簡單。

**畫面怎麼知道 token 變了？** 用「訂閱」：

```ts
setAccessToken(token)              // 改 token 時，通知所有訂閱者
subscribeAccessToken(listener)     // 訂閱：token 一變就呼叫 listener
```

`AuthProvider` 會訂閱它，token 一變就更新 React 的 state，畫面跟著重新渲染。就像 DOM 的 `addEventListener`。

#### `api/auth.ts`：每個 API 一個函式

```ts
export async function getMe(): Promise<User> {
  return readJson<User>(await apiFetch("/me"));
}
```

元件不再自己寫 `fetch`，而是呼叫 `getMe()`。網址、HTTP 方法、要不要帶 token，都集中在這裡。

**有些用 `fetch`，有些用 `apiFetch`，差在哪？**

| 用一般 `fetch` | 用 `apiFetch` |
| --- | --- |
| `register`、`login`、`logout` | `getMe`、`logoutAll`、`changePassword` |
| 不需要 access token | 需要 access token |

**登入一定不能用 `apiFetch`。** 密碼錯誤時後端回 401，`apiFetch` 看到 401 會以為是 token 過期，跑去 refresh。跟第 3 關「目前密碼錯誤要回 400 不能回 401」是同一個道理。

還有一個 `User` 型別，對應後端的 `UserRead`。原本寫的是 `useState<any>`，lint 一直報錯，現在有正確的型別，那個錯誤也沒了。

#### `auth/`：登入狀態

**Context 是什麼？** React 內建的功能，讓**很深層的元件**也能拿到共用的資料，不用一層一層用 props 往下傳。

```tsx
// main.tsx：最外層包起來
<AuthProvider>
  <App />
</AuthProvider>

// 任何元件裡
const { status, user, login, logout } = useAuth();
```

三個檔案的分工：

| 檔案 | 內容 |
| --- | --- |
| `AuthContext.ts` | 定義登入狀態有哪些東西（型別），建立 Context |
| `AuthProvider.tsx` | 真正保存狀態、實作 login / logout 等動作 |
| `useAuth.ts` | 元件用來拿登入狀態的 hook；忘記包 `<AuthProvider>` 時會給清楚的錯誤訊息 |

> 為什麼要拆成三個檔案？Vite 的「熱更新」（存檔後畫面立刻更新、不用重新整理）要求一個 `.tsx` 檔只匯出元件。把 Context 和 hook 放在同一個檔案，lint 會警告，熱更新也可能失效。

**`AuthProvider` 提供的東西：**

| 名稱 | 說明 |
| --- | --- |
| `status` | `"loading"`（啟動中）、`"authenticated"`（已登入）、`"unauthenticated"`（未登入） |
| `user` | 目前登入的使用者資料 |
| `notice` | 狀態變化的提示：「登入成功」「已登出」「登入已過期」…… |
| `login()`、`logout()`、`logoutAll()`、`changePassword()`、`reloadUser()` | 動作 |

**幾個重點：**

- **App 啟動時**：自動用 refresh token 換 access token，換到就順便取得使用者資料。這段邏輯從 `App.tsx` 搬過來，`didInit` 也一起搬過來了。
- **`status` 是算出來的，不是存起來的**：
  ```ts
  const status = initializing ? "loading" : accessToken ? "authenticated" : "unauthenticated";
  ```
  有 token 就是已登入，沒有就是未登入。不另外存一個狀態，就不會發生「token 已經清掉了，畫面還顯示已登入」這種對不上的情況。
- **登入過期**：`apiFetch` 的 refresh 也失敗時，會呼叫 `setSessionExpiredHandler` 設定的函式，`AuthProvider` 就顯示「登入已過期，請重新登入」，畫面自動回到登入表單。

#### `components/`：畫面

每個元件只管自己的輸入框和錯誤訊息，需要登入功能就呼叫 `useAuth()`：

```tsx
const { login } = useAuth();
...
await login(email, password);   // 成功後 AuthProvider 更新狀態，App 自動切換畫面
```

`LoginForm` 和 `ChangePasswordForm` 改用 `<form onSubmit>`，在輸入框**按 Enter 就能送出**。

#### `App.tsx`：只剩 30 行

```tsx
const { status, notice } = useAuth();

if (status === "loading") return <div>載入中...</div>;

return status === "authenticated"
  ? <><UserPanel /><ChangePasswordForm /></>
  : <LoginForm />;
```

### 使用上有什麼不一樣

功能都一樣，只有幾個小改變：

| 原本 | 現在 |
| --- | --- |
| 登入後要按「取得我的資料」才看得到資料 | 登入後**自動**取得；按鈕改名「重新取得我的資料」 |
| 錯誤訊息是 JSON：`["value_error", ...]` | 整理成文字：`密碼只能包含英文字母、數字、空白與符號` |
| 只能點按鈕送出 | 輸入框按 Enter 也能送出 |
| 已登入時只看到 token | 多顯示「已登入：email」 |

### ⭐ 之後其他專案怎麼用

> **第 8 關之後檔案有變**：要複製的是 `src/api/`（`client.ts`、`auth.ts`）和 `src/auth/`（`authStore.ts`、`authService.ts`、`useAuth.ts`、`RequireAuth.tsx`、`GuestOnly.tsx`），並在 `main.tsx` 呼叫 `initializeAuth()`，**不需要再包 `<AuthProvider>`**。新的 API 用 `api.get(...)`、`api.post(...)`（axios）呼叫。下面是第 6 關當時的版本。
>
> **第 12 關之後再加兩個檔案**：`src/api/queryClient.ts`、`src/auth/useMe.ts`，並在 `main.tsx` 包 `<QueryClientProvider client={queryClient}>`。使用者資料改用 `useMe().data` 拿（`useAuth()` 不再有 `user`）。新專案自己的資料照 `useMe.ts` 的樣子寫 `useQuery`，改資料用 `useMutation` + `invalidateQueries`（關卡 12 有範例）。完整清單見 `docs/CHAIN.md` 附錄。

這關最重要的目的。新專案要做登入時：

**1. 複製這幾個檔案過去**

```
src/api/client.ts
src/api/auth.ts
src/auth/AuthContext.ts
src/auth/AuthProvider.tsx
src/auth/useAuth.ts
```

**2. 在 `main.tsx` 包起來**

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

**3. 在任何元件裡使用**

```tsx
const { status, user, login, logout } = useAuth();
```

**4. 新專案自己的 API，照 `auth.ts` 的寫法加**

例如新專案有「文章列表」：

```ts
// src/api/posts.ts
import { apiFetch, readJson } from "./client";

export type Post = { id: number; title: string };

export async function getPosts(): Promise<Post[]> {
  return readJson<Post[]>(await apiFetch("/posts"));
}
```

用 `apiFetch`，就**自動**帶上 token、自動處理 refresh，完全不用再想 token 的事。

### 驗證方式

1. 啟動前後端，打開 <http://localhost:5173>
2. 照以前的方式玩一遍：註冊 → 登入 → 重新整理（保持登入）→ 改密碼 → 登出所有裝置
3. 試試錯誤情況：密碼打錯、重複註冊、改密碼時目前密碼打錯，錯誤訊息應該都是看得懂的文字
4. 前端資料夾執行 `npm run lint`，應該**沒有任何錯誤**（以前一直有一個 `any` 的錯誤）

### 動手玩

1. **忘記包 `AuthProvider` 會怎樣？** 在 `main.tsx` 把 `<AuthProvider>` 和 `</AuthProvider>` 兩行刪掉，存檔看畫面和 DevTools 的 Console，會看到 `useAuth 必須在 <AuthProvider> 裡面使用`。這就是 `useAuth.ts` 裡那段檢查的作用。改回來。
2. **自己寫一個用 `useAuth` 的元件**（很短）：在 `components/` 新增 `Greeting.tsx`：
   ```tsx
   import { useAuth } from "../auth/useAuth";

   export function Greeting() {
     const { user } = useAuth();
     return <p>嗨，{user?.email}！</p>;
   }
   ```
   然後在 `App.tsx` 已登入的區塊裡加上 `<Greeting />`（記得在上方 `import { Greeting } from "./components/Greeting";`）。不用傳任何 props，就拿得到使用者資料，這就是 Context 的好處。
3. **確認 single-flight 還在**（同時送三個請求，只會 refresh 一次）：
   1. `backend/.env` 加上 `JWT_EXPIRE_MINUTES=1`，重啟後端（access token 1 分鐘就過期）
      > 不要設成 `0`：token 一發出來就過期，連登入後取得使用者資料都會失敗。
   2. 登入，然後**等 1 分鐘以上**，讓 access token 過期
   3. 打開 DevTools，先切到 **Network** 分頁，再切到 **Console** 分頁，貼上這行按 Enter：
      ```js
      const m = await import("/src/api/auth.ts"); await Promise.all([m.getMe(), m.getMe(), m.getMe()]);
      ```
      意思是「拿到 `api/auth.ts` 這個模組，**同時**呼叫三次 `getMe()`」。`Promise.all` 會讓三個請求一起送出。
   4. 回到 **Network** 分頁，應該看到：3 個 `me` 401 → **只有 1 個** `refresh` 200 → 3 個 `me` 200
   5. **對照組**：把 `api/client.ts` 裡的 `if (!refreshPromise) {` 改成 `if (true) {`，存檔，重新登入、等 1 分鐘、再貼一次同一行。這次會看到 3 個 `refresh`，後兩個是 401，而且畫面跳出「登入已過期」，這就是沒有 single-flight 時會發生的事。**記得改回來。**
   6. 玩完把 `.env` 的 `JWT_EXPIRE_MINUTES=1` 刪掉，重啟後端

### 想一想

<details>
<summary>Q1：access token 為什麼存在 <code>client.ts</code> 的變數裡，不是 React 的 state？</summary>

`apiFetch` 不是 React 元件，用不了 state。而且 state 有「這一次渲染看到的是舊值」的問題，原本的程式就是為了這個才另外用 `useRef`。

現在 token 的「正本」放在模組變數，`apiFetch` 隨時讀到最新的；`AuthProvider` 再透過訂閱，把它同步到 state 給畫面用。正本只有一份，畫面只是跟著顯示。

</details>

<details>
<summary>Q2：為什麼 <code>login</code> 不能用 <code>apiFetch</code>？</summary>

`apiFetch` 遇到 401 會以為 access token 過期，自動去 refresh。但登入時的 401 代表「密碼錯誤」，跟 token 無關。用了 `apiFetch` 會多送一次沒意義的 refresh。更糟的是，如果瀏覽器還留著上一次登入的 refresh token cookie，refresh 會成功，`apiFetch` 就把那個 token 存起來，結果「密碼打錯」反而讓畫面變成已登入（而且是上一次登入的那個帳號）。

</details>

<details>
<summary>Q3：為什麼不直接把 <code>status</code> 存成一個 state？</summary>

如果 `status` 和 `accessToken` 分開存，每個會改 token 的地方都要記得一起改 `status`，漏掉一個就會對不上，例如 `apiFetch` 裡 refresh 失敗清掉了 token，卻沒人去改 `status`。從 token 推算出 `status`，就不可能對不上。

**能算出來的東西，就不要另外存。** 這是寫 React 很重要的原則。

</details>

<details>
<summary>Q4：這個範本有什麼限制？</summary>

- 第 1 關 Q2 提過的「兩個分頁同時重新整理」，其中一個可能被判定成重複使用，結果兩邊都被登出。single-flight 只在同一個分頁內有效。
- 一個分頁登出了，其他分頁不會馬上知道，要等它們下次呼叫 API 才發現。

要解決可以用瀏覽器的 `BroadcastChannel` 讓分頁之間互相通知。練習專案知道有這回事就好。

</details>

---

## 關卡 7：多頁面與保護路由（React Router）✅

**改動的檔案**：`frontend/package.json`（新增 `react-router`）、`frontend/src/`：新增 `app/`、`pages/`、`auth/RequireAuth.tsx`、`auth/GuestOnly.tsx`、`components/RegisterForm.tsx`，改寫 `main.tsx`、`LoginForm.tsx`、`UserPanel.tsx`，刪除 `App.tsx`

### 一句話

**從「只有一頁」變成「有網址的多個頁面」，而且沒登入的人進不去需要登入的頁面。**

### 前端模板路線（關卡 7 起）

從這關開始，一關加一個業界常用的套件，把前端變成之後所有專案的基礎模板。每一關都會對照「手寫版 vs 套件版」，原理是前面幾關學過的。

| 關卡 | 套件 | 取代 / 新增 |
| --- | --- | --- |
| **7** | **React Router** | 多頁面、需要登入的頁面 |
| 8 | Zustand + axios | 取代手寫的 AuthContext、apiFetch |
| 12 | TanStack Query | 管理從後端拿來的資料（快取、loading、錯誤） |
| 13 | Zod + React Hook Form | 取代手寫的表單驗證 |
| 14 | Tailwind CSS | 取代 inline style |
| 15 | Vitest + MSW | 前端自動化測試 |

（關卡 9～11 插在中間，是後端的 Docker、部署、維護，所以前端套件的編號往後移。）

> 2026-10-15 註記：關卡 13 改為「工程品質基線」，上表的 Zod、Tailwind、Vitest 順延為關卡 14、15、16，路線圖為準。

### 用情境看懂

**情境 1：沒登入，直接打開 `http://localhost:5173/settings`**

```
React Router：「/settings 歸 RequireAuth 管。」
RequireAuth：「這個人沒登入，送他去 /login，順便記下他原本要去 /settings。」
→ 畫面變成登入頁
```

**情境 2：在登入頁登入成功**

```
LoginForm：呼叫 login()，登入成功 → AuthProvider 的狀態變成「已登入」
GuestOnly（管登入頁的守門員）：「已登入的人不該待在登入頁，他原本要去 /settings，送他過去。」
→ 畫面變成帳號設定頁
```

**LoginForm 完全沒寫「登入後跳到哪一頁」**，是守門員看到狀態改變後自動處理的。

**情境 3：在帳號設定頁按「登出所有裝置」**

```
SettingsPage：呼叫 logoutAll() → 狀態變成「未登入」
RequireAuth：「這個人沒登入了，送他去 /login。」
```

一樣，SettingsPage 也沒寫跳轉。**只要登入狀態一變，守門員就會把人送到該去的地方**。登入過期（第 6 關情境 5）也是同樣的機制。

**情境 4：註冊成功**

```
RegisterForm：註冊成功 → 呼叫 RegisterPage 給它的 onSuccess
RegisterPage：navigate("/login", { state: { registeredEmail: email } })
LoginPage：從 state 拿到 email → 自動填進 email 欄位，顯示「註冊成功，請登入」
```

### 頁面一覽

| 網址 | 頁面 | 誰能進 |
| --- | --- | --- |
| `/login` | 登入 | 只有未登入的人（已登入會被送回首頁） |
| `/register` | 註冊 | 只有未登入的人 |
| `/` | 首頁：問候、使用者資料 | 需要登入 |
| `/settings` | 帳號設定：修改密碼、登出所有裝置 | 需要登入 |
| 其他 | 404 找不到頁面 | 所有人 |

導覽列（上方）在每一頁都會出現：已登入時顯示「首頁、帳號設定、email、登出」，未登入時顯示「登入、註冊」。

### 新的檔案結構

```
frontend/src/
├── app/
│   ├── router.tsx        ⭐ 路由表：哪個網址顯示哪個頁面
│   └── AppLayout.tsx     所有頁面共用的外框：導覽列 + 提示訊息
├── pages/                ⭐ 每個網址一個頁面
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
├── auth/
│   ├── RequireAuth.tsx   ⭐ 守門員：需要登入
│   ├── GuestOnly.tsx     ⭐ 守門員：只給未登入的人
│   └── （AuthContext、AuthProvider、useAuth 不變）
├── components/           頁面裡用到的零件
│   ├── LoginForm.tsx     （拆成只有登入）
│   ├── RegisterForm.tsx  （從 LoginForm 拆出來）
│   ├── UserPanel.tsx
│   └── ChangePasswordForm.tsx
└── main.tsx              用 RouterProvider 取代原本的 <App />
```

**`pages/` 和 `components/` 的差別**：`pages/` 是「一個網址對應的整個頁面」，`components/` 是「頁面裡的零件」，同一個零件可以放在不同頁面。

### 程式怎麼寫

#### 路由表 `app/router.tsx`

```tsx
export const router = createBrowserRouter([
  {
    element: <AppLayout />,              // 外框（導覽列）
    children: [
      {
        element: <GuestOnly />,          // 守門員：只給未登入的人
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,        // 守門員：需要登入
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },   // * = 其他所有網址
    ],
  },
]);
```

**讀法**：外層的 `element` 會**包住**裡面的 `children`。打開 `/settings` 時，畫面是一層一層包起來的：

```
AppLayout（導覽列）
  └ RequireAuth（檢查登入）
      └ SettingsPage（頁面內容）
```

**新增一個需要登入的頁面**：在 `pages/` 建立元件，加到 `RequireAuth` 的 `children` 裡就好，不用另外寫任何檢查。

#### `<Outlet />`：「子頁面放這裡」

`AppLayout`、`RequireAuth`、`GuestOnly` 裡都有 `<Outlet />`，意思是「裡面那一層要顯示在這個位置」。就像相框：相框（`AppLayout`）固定不變，裡面的照片（頁面）會換。

#### 守門員 `auth/RequireAuth.tsx`

```tsx
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <p>載入中...</p>;

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
```

- **`useLocation()`**：拿到目前的網址資訊，`location.pathname` 就是 `/settings` 這種路徑
- **`<Navigate to="/login" />`**：畫出這個元件 = 換到 `/login`
  - **`replace`**：取代目前這一筆瀏覽紀錄。不加的話，按「上一頁」會回到 `/settings`，又被送回 `/login`，卡在迴圈裡
  - **`state={{ from: ... }}`**：附帶給下一頁的資料，這裡記住「原本想去哪」
- **`<Outlet />`**：已登入，就顯示裡面的頁面

`GuestOnly.tsx` 是反過來的：已登入就送走（送到 `state.from`，沒有就送到首頁），未登入才顯示裡面的頁面。

#### 換頁的三種方式

| 寫法 | 什麼時候用 | 例子 |
| --- | --- | --- |
| `<Link to="/register">` | 一般連結 | 「還沒有帳號？註冊」 |
| `<NavLink to="/settings">` | 導覽列，會知道「現在是不是這一頁」 | 目前所在的頁面會加粗 |
| `navigate("/login")` | 在程式裡換頁 | 註冊成功後跳到登入頁 |
| `<Navigate to="/login" />` | 畫面一出現就換頁 | 守門員把人送走 |

⚠️ **不要用 `<a href="...">`**。`<a>` 會讓瀏覽器**重新載入整個頁面**，記憶體裡的 access token 就沒了（又要 refresh 一次）。`<Link>` 只換畫面，不重新載入。

### 一個部署時才會遇到的事

開發時（`npm run dev`）直接打開 `http://localhost:5173/settings` 沒問題。但正式部署到靜態網站主機時，主機會去找一個叫 `settings` 的檔案，找不到就回 404。要在主機設定「**所有網址都回傳 `index.html`**」，交給 React Router 處理。每個平台的設定方式不同（Netlify、Vercel、Nginx……），部署時再查就好，現在先知道有這回事。

### 驗證方式

1. **沒登入時**直接在網址列輸入 `http://localhost:5173/settings` → 被送到登入頁
2. 登入 → **自動回到** `/settings`（不是首頁）
3. 已登入時輸入 `http://localhost:5173/login` → 被送回首頁
4. 點導覽列的「首頁」「帳號設定」切換，目前所在的頁面會加粗
5. 輸入不存在的網址，例如 `/abc` → 404 頁面
6. 註冊新帳號 → 自動跳到登入頁，email 已經填好
7. 在帳號設定頁按「登出所有裝置」或導覽列的「登出」→ 自動回到登入頁

### 動手玩

1. **加一個需要登入的頁面**（照著現有的頁面寫，很短）：
   - 建立 `pages/AboutPage.tsx`：
     ```tsx
     export function AboutPage() {
       return <h2>關於這個專案</h2>;
     }
     ```
   - 在 `app/router.tsx` 上方加上 `import { AboutPage } from "../pages/AboutPage";`，然後在 `RequireAuth` 的 `children` 裡加一行 `{ path: "/about", element: <AboutPage /> },`
   - 在 `app/AppLayout.tsx` 的導覽列加一個 `<NavLink to="/about" style={navLinkStyle}>關於</NavLink>`
   - 登出後直接打開 `/about`，會被送到登入頁；登入後自動回到 `/about`。**你沒有寫任何登入檢查，守門員就自動保護了它。**
2. **`<a>` 和 `<Link>` 的差別**：把 `LoginPage.tsx` 裡的 `<Link to="/register">` 改成 `<a href="/register">`，打開 DevTools 的 Network，點連結。會看到整個頁面重新下載。改回來。
3. **拿掉 `replace` 會怎樣**：把 `RequireAuth.tsx` 的 `replace` 刪掉，登出後打開 `/settings`（被送到登入頁），再按瀏覽器的「上一頁」，觀察發生什麼事。改回來。

### 想一想

<details>
<summary>Q1：為什麼登入成功後跳轉，不寫在 LoginForm 裡，而是交給 GuestOnly？</summary>

如果寫在 LoginForm 裡，那「登入過期」「登出」「登出所有裝置」「在別的地方登入」……每個會改變登入狀態的地方，都要記得自己寫跳轉，很容易漏。

交給守門員的話，規則只有一條：「**狀態是什麼，就該在什麼頁面**」。不管狀態是怎麼改變的，守門員都會處理。跟第 6 關「`status` 用算的，不另外存」是一樣的想法。

</details>

<details>
<summary>Q2：前端擋住了「沒登入不能進 /settings」，這樣就安全了嗎？</summary>

**不是。** 前端的守門員只是讓使用者體驗比較好，**任何人都可以繞過**（例如直接用 curl 呼叫 API）。真正的保護在後端：`/me`、`/auth/change-password` 這些 API 都有 `Depends(get_current_user)`，沒有有效的 access token 就回 401。

跟第 0 關「前端檢查密碼是體驗，後端檢查才是安全」是同樣的道理。

</details>

<details>
<summary>Q3：為什麼守門員在 <code>status === "loading"</code> 時要顯示「載入中」，不能直接當成未登入？</summary>

App 剛啟動時，還在用 refresh token 確認是否登入過，這時候 `status` 是 `loading`。如果當成未登入，已經登入的人一重新整理 `/settings`，就會先被送到 `/login`，等確認完又被送回來，畫面會閃一下，網址也會亂掉。等確認完再決定，才不會誤判。

</details>

---

## 關卡 8：Zustand + axios ✅

**改動的檔案**：`frontend/package.json`（新增 `zustand`、`axios`）、`frontend/src/`：新增 `auth/authStore.ts`、`auth/authService.ts`，改寫 `api/client.ts`、`api/auth.ts`、`auth/useAuth.ts`、`main.tsx`，刪除 `auth/AuthContext.ts`、`auth/AuthProvider.tsx`

### 一句話

**把第 6 關手寫的「登入狀態」和「apiFetch」，換成業界最常用的兩個套件。原理完全一樣，程式變短、變好讀。**

### 換了什麼

| 第 6 關手寫 | 第 8 關套件 | 套件幫你做了什麼 |
| --- | --- | --- |
| `let accessToken` + 手寫訂閱（`subscribeAccessToken`） | **Zustand** store | 資料一變，用到它的元件自動更新 |
| `AuthContext` + `AuthProvider` + `useState` | **Zustand** store | 不需要 Provider 包起來，React 外面也能讀寫 |
| `apiFetch`（自動帶 token、401 重試） | **axios** 攔截器 | 每個請求自動經過「送出前」和「收到後」兩道關卡 |
| `readJson`、`ApiError`、`JSON.stringify` | **axios** | 自動轉 JSON；4xx、5xx 自動丟出錯誤 |
| single-flight | **保留手寫** | axios 不會幫你做，所以這段照抄第 6 關 |

**元件一行都沒改。** `useAuth()` 的用法跟以前一模一樣，只是背後換了實作。這就是第 6 關分層的好處：換掉底層，上面的畫面完全不受影響。

### 用情境看懂

延續第 6 關的比喻，角色換了人，但工作內容一樣：

| 角色 | 第 6 關 | 第 8 關 |
| --- | --- | --- |
| **店長的筆記本**（記住誰登入了） | `AuthProvider` 的 useState | `authStore.ts`（Zustand） |
| **店長的工作手冊**（登入、登出怎麼做） | `AuthProvider` 裡的函式 | `authService.ts` |
| **跑腿小弟**（送請求、過期自己換） | `apiFetch` | axios 攔截器 |

**情境：過了 30 分鐘，按「重新取得我的資料」**

```
UserPanel → reloadUser() → authApi.getMe() → api.get("/me")

axios 請求攔截器：「送出前，從筆記本（store）拿 token 貼上去。」
後端：「token 過期，401。」
axios 回應攔截器：「401？我去換一張。」
  → refreshAccessToken()（single-flight）→ 拿到新 token
  → 寫進筆記本（store）→ 用到 token 的畫面自動更新
  → 用新 token 重送 /me → 200
```

跟第 6 關一模一樣，只是「跑腿小弟」從手寫的 `apiFetch` 換成了 axios 攔截器。

### 新的檔案分工

```
auth/
├── authStore.ts     資料：token、user、notice（Zustand）
├── authService.ts   動作：initializeAuth、login、logout……（一般函式）
├── useAuth.ts       給元件用的 hook，把上面兩個包在一起
├── RequireAuth.tsx  （不變）
└── GuestOnly.tsx    （不變）

api/
├── client.ts        axios 設定、攔截器、refresh、錯誤訊息
└── auth.ts          每個 API 一個函式（改用 axios，變短了）
```

### Zustand 怎麼用（`auth/authStore.ts`）

```ts
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  ...
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: (notice) => set({ accessToken: null, user: null, notice }),
}));
```

- **`create`**：建立 store，裡面放「資料」和「改資料的函式」
- **`set({...})`**：只改有寫到的欄位，其他不動（跟 React 的 `setState` 一樣）

**兩種讀寫方式：**

| 在哪裡 | 怎麼寫 | 資料變了會怎樣 |
| --- | --- | --- |
| 元件裡 | `useAuthStore((s) => s.user)` | 元件自動重新渲染 |
| 元件外（axios、service） | `useAuthStore.getState().accessToken` | 只是讀一次當下的值 |

**第二種就是 Zustand 最大的好處**：axios 攔截器不是元件，用不了 Context，但可以直接 `getState()` 拿 token。第 6 關為了這件事，手寫了「模組變數 + 訂閱機制」，現在 Zustand 一個 store 就解決了。

**`useShallow`**（在 `useAuth.ts`）：一次挑好幾個欄位組成物件時要加。不加的話，每次都會產生「新的物件」，React 以為資料變了，元件就會一直重新渲染。

### axios 怎麼用（`api/client.ts`）

**兩個 axios 實例：**

```ts
export const publicApi = axios.create({ baseURL: API_URL, withCredentials: true });  // 不需要登入
export const api = axios.create({ baseURL: API_URL, withCredentials: true });        // 需要登入，有攔截器
```

- **`baseURL`**：自動加在路徑前面，`api.get("/me")` 會送到 `http://localhost:8000/me`
- **`withCredentials: true`**：帶上 cookie，等於 fetch 的 `credentials: "include"`
- 對應第 6 關的「一般 fetch」和「apiFetch」：**登入一定要用 `publicApi`**，不然密碼錯誤的 401 會被當成 token 過期

**請求攔截器：每個請求送出前執行**

```ts
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**回應攔截器：每個回應回來後執行**

```ts
api.interceptors.response.use(
  (response) => response,                  // 成功：原封不動
  async (error) => {                       // 失敗：
    if (不是 401 || 已經重送過) throw error;  //   不處理
    original._retry = true;                //   標記「重送過了」
    const newToken = await refreshAccessToken();
    if (!newToken) { 清掉登入狀態; throw error; }
    設定新 token;
    return api(original);                  //   重送原本的請求
  },
);
```

**`_retry` 是新加的保護**：如果重送後還是 401（例如新 token 又有問題），不會再 refresh 一次，避免無限循環。

**呼叫 API 變短了（`api/auth.ts`）：**

```ts
// 第 6 關
const res = await apiFetch("/auth/change-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ current_password: ..., new_password: ... }),
});
return readJson<TokenResponse>(res);

// 第 8 關
const { data } = await api.post<TokenResponse>("/auth/change-password", {
  current_password: ..., new_password: ...,
});
return data;
```

axios 自動把物件轉成 JSON、自動加 `Content-Type`、自動把回應轉成物件放在 `.data`，失敗時自動丟出錯誤。

### `main.tsx` 的變化

```tsx
initializeAuth()   // 啟動時檢查一次登入狀態

createRoot(...).render(
  <StrictMode>
    <RouterProvider router={router} />   // 不用再包 <AuthProvider>
  </StrictMode>,
)
```

- **不用包 Provider 了**：Zustand 的 store 是獨立的，不需要放進 React 的樹裡
- **`initializeAuth()` 直接在外面呼叫**：第 6 關放在 `useEffect` 裡，還得用 `didInit` 擋掉 StrictMode 跑兩次的問題；現在是一般函式，只會執行一次

### 驗證方式

功能跟第 7 關完全一樣，照第 7 關的驗證方式玩一遍就好。另外可以試：

1. **single-flight 還在**：照第 6 關動手玩 3 的方法（`JWT_EXPIRE_MINUTES=1`、等 1 分鐘、在 Console 同時呼叫三次 `getMe()`），Network 裡應該只有一個 `refresh`
2. **前端資料夾** `npm run lint`、`npm run build` 都要通過

### 動手玩

1. **在 Console 直接看 store 裡的資料**：登入後在 Console 輸入：
   ```js
   const { useAuthStore } = await import("/src/auth/authStore.ts"); useAuthStore.getState();
   ```
   會看到 `accessToken`、`user`、`notice` 等目前的值。這就是 Zustand「在 React 外面也能讀」的效果。
   > 關卡 12 起 `user` 不在 store 裡了（搬到 TanStack Query），這裡只會看到 `accessToken`、`notice`、`initialized`；使用者資料改看右下角的 Devtools。
2. **從外面改 store，畫面會跟著變**：接著輸入：
   ```js
   useAuthStore.getState().setNotice("我從 Console 改的！");
   ```
   畫面上方的提示文字會立刻變成這句話。**你沒有碰任何元件，只改了 store，畫面就自動更新了。**
3. **拿掉 `_retry` 會怎樣（想一想就好，不用真的改）**：如果後端出問題，每次都回 401，攔截器會不斷 refresh、重送、又 401、又 refresh……沒有 `_retry` 就停不下來。

### 想一想

<details>
<summary>Q1：既然 Zustand 這麼方便，為什麼第 6 關還要手寫？</summary>

手寫一次，才知道套件幫你做了什麼。現在看到 `useAuthStore.getState()`，你知道它就是第 6 關的 `getAccessToken()`；看到元件自動更新，你知道背後就是第 6 關的「訂閱」。遇到問題時，你知道該往哪裡找。

</details>

<details>
<summary>Q2：為什麼要分 <code>authStore.ts</code> 和 <code>authService.ts</code>，不全部寫在 store 裡？</summary>

`client.ts`（axios）需要讀 store 拿 token；如果 store 裡也要呼叫 API（就會 import `client.ts`），兩個檔案就會**互相 import**，容易出現難以追查的錯誤。

拆開後方向是單向的：`authService` → `api` → `authStore`，store 只放資料，不依賴任何人。

</details>

<details>
<summary>Q3：Zustand 和 Context 該怎麼選？</summary>

- **Context**：React 內建，適合「很少改變」的資料，例如主題顏色、語言設定
- **Zustand**：適合「常常改變」或「React 外面也要用」的資料，例如登入狀態（axios 要讀 token）

登入狀態兩個條件都符合，所以 Zustand 更合適。

</details>

---

## 關卡 9：Docker 與 CI ✅

**改動的檔案**：
- 新增 `backend/pyproject.toml`、`backend/uv.lock`；刪除 `backend/requirements.txt`、`backend/requirements-dev.txt`
- 新增 `backend/Dockerfile`、`backend/.dockerignore`
- 新增 `.github/workflows/ci.yml`
- ruff 自動修正：幾個檔案的 import 排序、`dependencies.py` 的 `raise ... from None`
- `README.md`：安裝步驟改用 uv

### 一句話

**從「在我電腦上可以跑」變成「在任何一台機器上都能用同一種方式跑起來，而且每次改動都自動驗證」。** 這是上線前的最後一哩路，下一關（部署）就是把這一關做的 image 丟到雲端。

### 這關要解決什麼問題

到第 8 關為止，專案只在你的電腦上跑過。要上線，會碰到三個問題：

| 問題 | 症狀 | 這關的解法 |
| --- | --- | --- |
| **環境不一樣** | 「我這邊好好的，別人跑就壞」：Python 版本、套件版本、少裝了什麼 | `uv.lock` 鎖定版本 + **Docker** 把整個環境打包 |
| **沒人幫你檢查** | 改了一行、推上去，才發現測試壞了、型別錯了 | **CI**：每次 push 自動跑 ruff、pytest、build |
| **你沒有本機 Docker** | 沒辦法 `docker build`、`docker run` 來學 | **CI 就是你的 Docker 練習場**：GitHub 的虛擬機有 Docker，workflow 裡真的 build、真的跑、真的看 log |

### 觀念 1：uv 與 lock 檔（對照前端的 npm）

| 前端（已經在用） | 後端（這關改用） | 作用 |
| --- | --- | --- |
| `package.json` | `pyproject.toml` | 「我需要哪些套件」 |
| `package-lock.json` | `uv.lock` | 「實際裝了哪個版本」，連套件的套件都記 |
| `npm install` | `uv sync` | 照 lock 檔安裝 |
| `npm ci` | `uv sync --frozen` | 嚴格照 lock 檔裝，對不上就失敗（CI 和 Docker 用這個） |
| `npx vite` | `uv run uvicorn ...` | 用專案裡的套件執行指令 |

原本的 `requirements.txt` 只寫套件名稱、不寫版本。今天裝和三個月後裝，版本可能不一樣，這就是「CI 突然紅了，但我什麼都沒改」最常見的原因。`uv.lock` 要**進 git**，這樣你的電腦、CI、Docker 三個地方裝出來的版本完全一樣。

`uv` 另一個好處：不用再 `source venv/bin/activate`。`uv run` 會自動用 `backend/.venv`，Windows 上也不會有「指令碼執行被停用」的問題。

### 觀念 2：ruff（linter）

前端有 eslint，後端現在有 ruff。它會抓：沒用到的 import、import 排序、常見的 bug 寫法。設定在 `pyproject.toml` 的 `[tool.ruff]`。這關跑 `ruff check --fix` 自動修了 13 個地方（幾乎都是 import 排序），剩一個要手動改：

```python
# dependencies.py：except 裡面 raise 新的例外，要說清楚「跟原本的錯誤有沒有關係」
raise HTTPException(...) from None   # from None：刻意不把 PyJWT 的原始錯誤帶出去
```

這是 Python 的慣例：`except` 裡 `raise` 新例外時，寫 `from err`（保留原因）或 `from None`（刻意隱藏）。這裡對外只該說「token 無效」，不該洩漏是簽章錯還是過期，所以用 `from None`。

### 觀念 3：Docker

**四個詞**：

| 詞 | 是什麼 | 比喻 |
| --- | --- | --- |
| **image** | 打包好的「作業系統 + Python + 套件 + 你的程式」，唯讀 | 遊戲光碟 |
| **container** | 把 image 跑起來的那個程序，可以跑很多個 | 正在玩的那一局 |
| **Dockerfile** | 「怎麼做出 image」的步驟 | 光碟的製作流程 |
| **layer** | Dockerfile 每一行產生一層，有快取 | 做蛋糕的每一層，沒變的不用重做 |

**為什麼要 Docker？** 部署平台（Render、Fly、AWS……）收到的是一個 image，裡面什麼都有，它不用管你用 Python 幾版、裝了什麼。「在我電腦可以跑」的問題從此消失，因為大家跑的是同一個 image。

**Dockerfile 怎麼讀**（`backend/Dockerfile`，每一行都有中文註解，這裡只講三個重點）：

1. **先裝套件、最後才複製程式碼**：
   ```dockerfile
   COPY pyproject.toml uv.lock ./        # 只複製套件清單
   RUN uv sync --frozen --no-dev         # 裝套件（慢，但有快取）
   ...
   COPY . .                              # 最後才複製程式碼
   ```
   layer 快取的規則是「這一行和它之前的都沒變，就直接用上次的」。程式碼天天改、套件很少改，所以程式碼放最後，改程式碼不會重裝套件。
2. **multi-stage**：第一階段 `builder` 裝套件，第二階段只 `COPY --from=builder` 裝好的 `.venv`。第二階段沒有 uv、沒有快取，image 比較小，攻擊面也小。
3. **CMD 做兩件事**：
   ```dockerfile
   CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
   ```
   - `alembic upgrade head`：**部署時自動跑遷移**，不用再手動。失敗的話容器直接退出，平台會標記部署失敗，不會跑一個資料表版本不對的後端。
   - `--host 0.0.0.0`：聽所有網路介面。寫 `127.0.0.1` 容器外面連不進來，這是部署最常見的錯誤之一。
   - `${PORT:-8000}`：平台會用環境變數 `PORT` 告訴你聽哪個 port，沒給就 8000。

**`.dockerignore`**：跟 `.gitignore` 一樣的語法，但目的是「哪些東西不要進 image」。最重要的是 `.env`，裡面有密鑰，image 可能被推到別的地方，**絕對不能進去**。那正式環境的設定從哪來？從平台的環境變數（CI 的 `docker run -e ...` 就是在模擬這件事）。

**你沒有本機 Docker，怎麼辦？** CI 的 `backend` job 就是完整的 Docker 體驗：`services` 起一個 Postgres container、`docker build` 做 image、`docker run` 跑起來、`curl` 打它、`docker logs` 看它印了什麼。四個核心指令都在 Actions 的 log 裡，而且壞了會紅。

### 觀念 4：CI（GitHub Actions）

**CI = 每次改動都自動驗證。** 不是等到要上線才發現壞掉。

`.github/workflows/ci.yml` 的結構：

```
on:        什麼時候跑（push 到 main、開 PR、手動）
jobs:      要做哪幾件事（backend、frontend 兩個 job，同時跑）
  steps:   每個 job 的步驟，一步失敗整個 job 就紅
  services: 跑步驟之前先起的 container（Postgres）
```

**為什麼測試 DB 用 `services: postgres:16` 而不是 Neon？** 不用 secret、不用網路、每次都是全新乾淨的資料庫、跑完就丟。而且這就是你第一次親眼看到「用 Docker 起一個服務、別的程式連上去」。

**為什麼 `uv sync --frozen`、`npm ci`？** 嚴格照 lock 檔裝。如果你改了 `pyproject.toml` 忘了更新 lock，CI 會直接紅，逼你在本機先跑 `uv sync`（它會順便更新 lock）。這就是「CI 裝的 = 你裝的」的保證。

**設定從哪來？** CI 沒有 `.env`（不進 git），所以 `env:` 區塊直接給環境變數。`config.py`（pydantic-settings）讀環境變數的優先順序高於 `.env`，所以不用改任何程式。CI 用的 `JWT_SECRET` 是假的，真的密鑰只會放在部署平台。

**這個 repo 是私有的**：GitHub 免費方案私有 repo 每月 2000 分鐘 Actions，一次 CI 約 3～5 分鐘，夠用。（註：2026-10-22 起 repo 已公開，標準 runner 不計分鐘。）

### ⚠️ 開始前（一次性）

1. 安裝 uv（見 README「需要先安裝」），`uv --version` 確認
2. 在 `backend` 執行 `uv sync`，會建立 `backend/.venv`
3. 舊的 `backend/venv/` 可以刪掉
4. 之後所有後端指令前面加 `uv run`

### 驗證方式

1. **本機**：在 `backend`
   ```bash
   uv run ruff check .      # All checks passed!
   uv run pytest -q         # 35 passed
   ```
2. **CI**：把這關的 commit 推上 GitHub 後，開一個 PR（或到 Actions 分頁手動按 Run workflow），看 `CI` 兩個 job 都綠。
3. **讀 log，這才是重點**。Actions 分頁有三層：
   - 第一層 **Actions 分頁**（repo 上方的 Actions）：一列一列的 run，每列對應一次 push 或 PR，標題是 commit 訊息，前面是綠勾或紅叉
   - 第二層 **點一列 run**：左邊列出這次的 job（`backend`、`frontend`），中間是流程圖
   - 第三層 **點左邊的 `backend`**：一排可展開的步驟，點箭頭展開 log

   在第三層：
   - `Docker build`：看每一層怎麼被執行。找 `CACHED` 字樣，那就是 layer 快取
   - `Smoke test`：看到 `{"message":"pong"}` 和 `✅ /ping OK`
   - `Docker logs`：看到 alembic 的 `Running upgrade -> 0001 ...` 和 uvicorn 的 `Uvicorn running on http://0.0.0.0:8000`。這就是容器啟動時發生的事。

### 動手玩

每一個都需要 push 一次讓 CI 跑，所以開一個練習用的分支做，玩完刪掉。

1. **讓測試壞掉**：把 `routes/auth.py` 裡 refresh 的 `rt.revoked = True` 註解掉（第 4 關玩過），push。CI 紅，點進去看是哪一步、哪個測試。**這就是 CI 的價值：壞掉的程式進不了 main。**
2. **讓容器外面連不到**：Dockerfile 的 `--host 0.0.0.0` 改成 `--host 127.0.0.1`，push。`Docker build` 會過，但 `Smoke test` 會紅，而且會印出 container log：uvicorn 明明說自己跑起來了。**部署時「顯示成功但一直 502」通常就是這個。**
3. **看快取失效**：把 Dockerfile 的 `COPY . .` 移到 `RUN uv sync` 的前面，push 兩次（第二次隨便改一個註解）。第二次的 `Docker build` log 會發現套件又重裝了一遍，因為程式碼的層在套件層前面，程式碼一變，後面全部失效。改回來。
4. **lock 檔對不上**：在 `pyproject.toml` 的 dependencies 隨便加一個套件（例如 `"rich"`），**不要**跑 `uv sync`，直接 push。`安裝套件` 那步會紅：`--frozen` 發現 lock 檔沒有這個套件。本機跑一次 `uv sync` 再 push 就好了。

### 想一想

<details>
<summary>Q1：為什麼 <code>uv.lock</code> 要進 git，<code>.venv/</code> 卻不要？</summary>

`uv.lock` 是「要裝哪些版本」的清單，很小，而且大家都要用同一份才有意義。`.venv/` 是裝好的結果，幾百 MB，而且跟作業系統有關（Windows 裝的在 Linux 不能用）。前端的 `package-lock.json` 進 git、`node_modules/` 不進，是同一個道理。

</details>

<details>
<summary>Q2：為什麼 <code>alembic upgrade head</code> 放在 CMD（啟動時跑），不放在 Dockerfile 的 RUN（build 時跑）？</summary>

build 的時候不應該連資料庫：image 要能在任何環境用，build 時根本不知道要連哪個 DB（而且 DB 密碼不能進 image）。遷移是「對某一個資料庫」做的事，所以要在容器啟動、拿到環境變數之後才跑。

</details>

<details>
<summary>Q3：CI 綠了，就代表可以上線嗎？</summary>

不代表。CI 證明的是「在 CI 的環境、用 CI 的設定」能跑。正式環境的設定不一樣：不同的 DB、不同的密鑰、不同的網址、cookie 要 `Secure`。這些差異就是下一關（部署）會踩的坑，也是為什麼第 11 關要有 healthcheck 和 log：上線後還要能知道它活著。

</details>

<details>
<summary>Q4：CI 裡 <code>docker run --network host</code> 是什麼意思，正式環境也這樣嗎？</summary>

`--network host` 讓容器直接用虛擬機的網路，所以容器連 `localhost:5432` 就是 services 起的 Postgres，我們 `curl localhost:8000` 就是容器。這在 CI 最簡單。正式環境不會這樣：平台會給容器自己的網路，DB 用它的真實主機名稱連（`DATABASE_URL` 裡的 Neon 網址），對外的 port 由平台對應。

</details>

---

## 關卡 10：部署（Render + Vercel + Neon）✅

**改動的檔案**：
- `backend/main.py`：所有 API 掛到 `/api` 底下（`/api/auth/login`、`/api/me`、`/api/ping`）
- `backend/routes/auth.py`：cookie 的 `path` 從 `/auth` 改成 `/api/auth`
- `backend/database.py`：`pool_pre_ping=True`、Neon pooled 連線的 `statement_cache_size=0`
- `backend/tests/`：路徑加上 `/api`
- `frontend/src/api/client.ts`：baseURL 預設改成 `/api`；`frontend/vite.config.ts`：本機代理；`frontend/.env.example`
- 新增 `frontend/vercel.json`（Vercel 的轉發規則）、`render.yaml`（Render 的服務設定）
- `.github/workflows/ci.yml`：smoke test 改打 `/api/ping`
- 新增 `docs/DEBUGGING.md`：症狀 → 原因 → 修法

### 一句話

**把第 9 關的 image 丟到 Render、前端丟到 Vercel、資料庫用 Neon，手機用 4G 就能開。** 但這關真正的重點是一個架構決定：**前後端要讓瀏覽器以為是同一個網站**，否則登入在正式環境會直接壞掉。

### 觀念 1：為什麼要「同站」，這是會把登入打爛的決定

部署後前端在 `xxx.vercel.app`、後端在 `xxx.onrender.com`。如果前端直接打後端網址，對瀏覽器來說這是**跨站**（cross-site）請求。

我們的 refresh token cookie 是 `SameSite=Lax`（第 1 關），意思是「跨站請求不要帶我」，這是防 CSRF 的標準做法。結果就是：登入成功，但重新整理後 `POST /auth/refresh` 沒帶 cookie → 401 → 掉登入。本機不會發生，因為 `localhost:5173` 和 `localhost:8000` 算同站（瀏覽器只看網域不看 port）。

兩條路：

| 做法 | 怎麼做 | 代價 |
| --- | --- | --- |
| A. 改成 `SameSite=None; Secure` | 允許跨站帶 cookie | iPhone Safari 預設擋第三方 cookie，Chrome 也在逐步限制。**你用手機開會壞**，而且 CSRF 防護變弱 |
| B. **讓瀏覽器以為是同站** | 前端只打「自己網域的 `/api/...`」，由 Vercel 把 `/api/*` 轉發到 Render | 要懂「反向代理」這個概念；後端路徑要加 `/api` 前綴 |

選 B。而且 B 還順便解決了 CORS：對瀏覽器來說沒有跨網域請求，CORS 根本不會發生。

**這就是反向代理（reverse proxy）**，換技術棧長一樣：Next.js 的 `rewrites`、Nginx 的 `location /api`、Cloudflare 的 Workers，全部都是「使用者打我、我轉給後面的人、回應原封不動送回去」。

### 觀念 2：本機和正式環境做一樣的事

```
瀏覽器 ──/api/auth/login──▶ Vite dev server（本機）  ──▶ localhost:8000/api/auth/login
瀏覽器 ──/api/auth/login──▶ Vercel（正式）          ──▶ xxx.onrender.com/api/auth/login
```

前端程式完全一樣（baseURL 就是 `/api`），差別只在誰做轉發。本機是 `vite.config.ts` 的 `server.proxy`，正式是 `vercel.json` 的 `rewrites`。**開發環境和正式環境長得越像，上線後的意外越少**，這是部署的第一原則。

為了讓轉發不用改寫路徑，後端把所有 API 都掛在 `/api` 底下（`main.py` 的 `APIRouter(prefix="/api")`）。cookie 的 `path` 也跟著改成 `/api/auth`，不然 `/api/auth/refresh` 這個路徑對不上 cookie 的 path，瀏覽器不會帶。

### 觀念 3：設定和密鑰放哪

image 裡沒有 `.env`（第 9 關的 `.dockerignore` 擋掉了）。正式環境的設定全部來自**平台的環境變數**：Render 的 Environment 分頁。`config.py` 讀環境變數的優先順序高於 `.env`，所以程式一行都不用改。

| 設定 | 本機 `.env` | Render |
| --- | --- | --- |
| `DATABASE_URL` | 開發用的 Neon | **另一個** Neon 專案（正式資料不能和開發混在一起） |
| `JWT_SECRET` | 隨便一個 | 另外產生一個，**不要和本機一樣** |
| `COOKIE_SECURE` | `false`（http） | `true`（https） |
| `CORS_ORIGINS` | 不用 | 不用（同站） |
| `PORT` | 不用 | Render 自己注入，Dockerfile 的 `${PORT:-8000}` 會吃到 |

`render.yaml` 裡 `sync: false` 的意思是「這個值不寫在檔案裡，建立服務時再問我」。因為 `render.yaml` 會進 git，密鑰絕對不能寫在裡面。

### 觀念 4：遷移在啟動時跑

Dockerfile 的 CMD 是 `alembic upgrade head && uvicorn ...`。每次部署，容器啟動時先把資料表升到最新，成功才起後端。遷移失敗 → 容器退出 → Render 標記部署失敗 → **舊版本繼續跑**。這就是為什麼不手動跑遷移：你永遠不會跑一個「程式碼是新的、資料表是舊的」的後端。

### 觀念 5：免費方案的冷啟動，不是 bug

- Render 免費方案：閒置 15 分鐘休眠，下一個請求要等 30～60 秒喚醒
- Neon 免費方案：閒置 5 分鐘休眠，喚醒約 1～2 秒

所以**第一次開網址會很慢**，甚至 Vercel 等不到回應回 504。第二次就正常。這是免費方案的設計，不是你部署錯了。`database.py` 的 `pool_pre_ping=True` 處理的是另一件事：Neon 休眠後，連線池裡休眠前建立的連線都死了，`pool_pre_ping` 會先確認連線活著再用，不然第一個請求會 500。

### ⚠️ 開始前（一次性）：把它部署上去

三個平台都用 GitHub 帳號登入，都不用綁卡。順序很重要：**先 Neon、再 Render、拿到 Render 網址之後才能設 Vercel**。

**1. Neon：開一個正式用的專案**

- Neon 後台 → New Project，名稱 `jwt-auth-demo-prod`，Region 選 **Singapore (ap-southeast-1)**
- Connect → 把「Pooled connection」**關掉**（直連比較單純；開著也可以，程式會自動處理）→ 複製連線字串
- 照 README「準備資料庫」的三個改法改成 asyncpg 格式（`postgresql+asyncpg://`、`ssl=require`、刪 `channel_binding`）
- 這個字串**不要**放進本機的 `.env`，它只給 Render 用

**2. 產生正式用的 JWT_SECRET**

```bash
cd backend
uv run python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**3. Render：用 Blueprint 建後端**

- render.com → 用 GitHub 登入 → 授權 Render 存取這個 repo
- Dashboard → **New → Blueprint** → 選 `jwt-auth-demo` → 它會讀 `render.yaml`
- 它會問 `DATABASE_URL` 和 `JWT_SECRET`，貼上第 1、2 步的值 → Apply
- 等 build（第一次約 3～5 分鐘）。看 **Logs** 分頁，應該依序看到：Docker build 的每一層 → `Running upgrade -> 0001 ...`（alembic）→ `Uvicorn running on http://0.0.0.0:10000`
- 服務頁面上方有網址，長得像 `https://jwt-auth-demo-backend.onrender.com`。開 `那個網址/api/ping`，看到 `{"message":"pong"}` 就成功了（第一次要等它醒來）

> **Dashboard 看不到別的服務？** Render 的 **Project** 只是分組用的資料夾，Blueprint 建的服務預設不屬於任何 Project，會在 Overview 的 **Ungrouped Services**；以前建的服務在 **My projects** 裡。兩邊都在，沒有互相覆蓋。免費方案的限制是每月 750 小時，不是服務數量。

> 如果 Blueprint 建立失敗，退回手動：New → Web Service → 選 repo → Runtime 選 Docker、Root Directory 填 `backend`、Instance Type 選 Free、Environment 加三個變數（`DATABASE_URL`、`JWT_SECRET`、`COOKIE_SECURE=true`）、Health Check Path 填 `/api/ping`。

**4. 把 Render 網址填進 `vercel.json`，commit、push**

> 改這個檔案本身不會部署任何東西，它只是讓 repo 裡有正確的設定。第 5 步 Vercel Import 的當下會立刻部署一次，所以**先改好再 Import**，否則會帶著佔位字串部署，還得再 push 一次。

`frontend/vercel.json` 的第一條 `destination` 換成你的網址，結尾保留 `/api/:path*`：

```json
"destination": "https://jwt-auth-demo-backend-xxxx.onrender.com/api/:path*"
```

這個檔案要進 git，Vercel 是從 repo 讀它的。

**5. Vercel：建前端**

- vercel.com → 用 GitHub 登入 → Add New → Project → Import `jwt-auth-demo`
- **Root Directory 一定要改成 `frontend`**（點 Edit 選資料夾）。不改的話 Vercel 找不到 `package.json` 和 `vercel.json`
- Framework 會自動偵測成 Vite，其他不用動，**不要**設任何環境變數 → Deploy
- 等約 1 分鐘，拿到 `https://jwt-auth-demo-xxxx.vercel.app`

### 驗證方式

1. **手機關 Wi-Fi 用 4G** 開 Vercel 網址（第一次等 Render 醒來，最多一分鐘）
2. 註冊、登入、看到首頁的使用者資料
3. **重新整理，還在登入狀態**。這一步才證明同站架構是對的
4. 電腦開同一個網址，DevTools → Application → Cookies → 你的 vercel.app 網域，`refresh_token` 的 Path 是 `/api/auth`、Secure 打勾、HttpOnly 打勾
5. Network 分頁：所有請求的網址都是 `你的.vercel.app/api/...`，沒有任何 `onrender.com`。這就是代理在工作
6. Render 的 Logs 分頁看得到你剛剛的請求；Neon 的 Tables 看得到 `user` 表多了一筆
7. 推一個 commit 到 main（例如改 README 一個字），Render 和 Vercel 都會自動重新部署

### 動手玩

每一個都在玩「正式環境」，玩完記得改回來。

1. **拿掉一個環境變數**：Render → Environment → 刪掉 `JWT_SECRET` → Manual Deploy。看 Logs：`ValidationError ... jwt_secret ... Field required`，部署失敗，**但網站還是開得起來**，因為舊版本還在跑。加回去再部署。這是 `DEBUGGING.md` 第一條。
2. **故意跨站**：Vercel → Settings → Environment Variables → 加 `VITE_API_URL` = 你的 Render 網址加 `/api` → Deployments → Redeploy（`VITE_*` 是 build 時打包的，改了要重 build）。登入成功，**重新整理後掉登入**，DevTools 的 Cookies 底下看不到 `refresh_token`，Console 還可能有 CORS 錯誤。這就是觀念 1 說的「會把登入打爛」。刪掉變數、Redeploy。
3. **rewrite 填錯**：`vercel.json` 的 `destination` 故意少掉 `/api`，push。登入時 Console 出現 404 或 `SyntaxError: Unexpected token '<'`（拿到 HTML 不是 JSON）。改回來。
4. **感受冷啟動**：15 分鐘不碰網站，再開，Network 分頁看第一個 `/api/...` 請求花了幾秒。

### 想一想

<details>
<summary>Q1：既然可以用 <code>SameSite=None</code>，為什麼不直接改那一行就好？</summary>

三個理由。一、iPhone Safari 預設擋第三方 cookie，你的手機驗證會過不了，而且你不會知道為什麼。二、`SameSite=Lax` 是 CSRF 防護的一部分，改成 `None` 就得另外做 CSRF token。三、跨站就一定要設 CORS，多一個會出錯的地方。同站把這三個問題一次消掉，代價只是一條 rewrite。

</details>

<details>
<summary>Q2：遷移在啟動時跑，如果遷移本身有 bug 會怎樣？</summary>

容器啟動失敗，Render 標記這次部署失敗，**上一個版本繼續服務**。資料庫呢？Alembic 的遷移跑在交易（transaction）裡，Postgres 支援 DDL 交易，所以失敗會整個 rollback，資料表停在上一版。這就是為什麼第 5 關要用 Alembic 而不是 `create_all`：壞掉時有「上一版」可以退。第 11 關會練習「遷移跑到一半要回滾」。

</details>

<details>
<summary>Q3：<code>render.yaml</code> 和 <code>vercel.json</code> 進 git，那密鑰在哪？</summary>

`render.yaml` 只寫「需要 `DATABASE_URL` 這個變數」（`sync: false`），值在 Render 的 Environment 分頁，不在 git。`vercel.json` 裡只有 Render 的網址，那不是秘密。原則：**設定進 git，密鑰進平台**。練習專案要搬這套的時候，照這個原則就不會把密碼推上 GitHub。

</details>

<details>
<summary>Q4：Vercel 轉發到 Render，Render 休眠中要等 60 秒，Vercel 會等嗎？</summary>

不一定。Vercel 對外部 rewrite 有逾時限制，Render 醒太慢就會拿到 504。這是免費方案疊免費方案的代價，付費的 Render 不會休眠就沒這個問題。練習專案如果真的要給別人用，這是第一個要付錢解決的地方。現在知道它會發生、第二次會好就夠了。

</details>

---

## 關卡 11：維護（上線之後的事）✅

**改動的檔案**：
- `backend/main.py`：request log middleware（request id、耗時）、`/api/health`、`/api/_boom`、Sentry 初始化
- 新增 `backend/logging_config.py`：log 格式（文字 / JSON）
- `backend/config.py`：`LOG_LEVEL`、`LOG_JSON`、`SENTRY_DSN`、`APP_VERSION`（自動讀 Render 的 `RENDER_GIT_COMMIT`）、`ENABLE_DEBUG_ENDPOINTS`
- `backend/pyproject.toml`：加 `sentry-sdk[fastapi]`
- `backend/Dockerfile`：uvicorn 加 `--no-access-log`（改由 middleware 記）
- `render.yaml`：`LOG_JSON=true`
- `.github/workflows/ci.yml`：加 `alembic upgrade head` + `alembic check`；smoke test 多打 `/api/health`
- 新增 `backend/tests/test_health.py`（4 個測試，共 39 個）
- 新增 `docs/RUNBOOK.md`（維運手冊）、`AGENTS.md` + `CLAUDE.md`（給 AI 工具的專案說明）

### 一句話

**上線不是終點。這關給你三樣東西：壞掉時「看得到」（log、Sentry、health），壞掉時「退得回去」（退版、roll forward），以及「壞的程式進不了正式環境」（CI 綠了才部署、branch protection）。**

### 觀念 1：liveness 和 readiness 是兩個問題

| | `/api/ping` | `/api/health` |
| --- | --- | --- |
| 回答的問題 | 程式活著嗎？ | 能正常服務嗎？ |
| 做什麼 | 什麼都不做，回 pong | 真的查一次資料庫，回報遷移版本和 commit |
| 誰用 | Render 的 health check | 你、監控工具、部署後的檢查 |
| 資料庫斷線時 | 還是 ok | `degraded` |

為什麼 Render 的 health check 不用 `/api/health`？因為資料庫短暫斷線時，程式本身沒壞，用 readiness 會讓平台以為程式壞了而一直重啟，反而把事情弄得更糟。Kubernetes 把這兩個分成 livenessProbe 和 readinessProbe，就是同一個道理。

`/api/health` 回的 `version` 來自 Render 自動注入的 `RENDER_GIT_COMMIT`。**部署後看一眼 version 對不對，是最便宜的「我推的真的上線了嗎」檢查**。

### 觀念 2：log 要能搜尋，而且要能對到「哪一個請求」

本機出錯你看 terminal；正式環境你只有 log。兩件事讓 log 真的有用：

1. **結構化**：每筆 log 是一行 JSON，欄位分開。Render 的 Logs 可以搜 `"status": 500`、`"path": "/api/auth/login"`。純文字做不到。
2. **request id**：middleware 幫每個請求產生一個 id，寫進 log 也放進回應的 `X-Request-ID` header。使用者說「我剛剛出錯了」，請他給你這個 id，你直接搜到那一筆。

`logging_config.py` 用的是 Python 內建的 logging，沒有額外套件。本機 `LOG_JSON=false` 看文字，正式環境 `render.yaml` 設 `LOG_JSON=true`。

middleware 還做一件事：**沒被接住的例外一定會被記下 traceback 再往外丟**。「500 但 log 什麼都沒有」是最難查的狀況，這一層保證不會發生。

### 觀念 3：Sentry，讓錯誤自己來找你

log 要你主動去翻。Sentry 反過來：程式丟出沒接住的例外時，它把 traceback、是哪個路徑、發生幾次、第一次和最後一次的時間整理好，寄 email 給你。免費方案每月 5000 個錯誤，個人專案綽綽有餘。

程式只有一段：`sentry_sdk.init(dsn=...)`。`SENTRY_DSN` 沒設就完全不啟用，本機不用。`send_default_pii=False` 是刻意的：不把使用者 IP、cookie、authorization header 送出去。

### 觀念 4：遷移壞了不要「退」，要「往前修」

正式環境**不要**手動 `alembic downgrade`。原則叫 **roll forward**：推一個新的遷移把它修正。原因是 `alembic_version` 表記著「跑到哪一版」，手動退版後程式碼和資料庫的認知就不一致了，下次部署會更亂。

安全的改表習慣：**刪欄位、改型別要分兩次部署**。第一次先加新欄位、讓程式不再用舊的；第二次才刪。這樣任何時候退版，舊版程式都還跑得動。完整流程在 `RUNBOOK.md` 第 3 節。

### 觀念 5：換 JWT_SECRET 幾乎無感，因為 refresh token 不是 JWT

這是第 1 關設計的回報。access token 是 JWT，換了密鑰舊的全部失效，但它只有 30 分鐘。refresh token 是隨機字串、DB 存雜湊，**和密鑰無關**。所以換密鑰後：使用者下一個請求 401 → 前端自動 refresh → 拿到新密鑰簽的 access token。**不用重新登入**。如果當初 refresh token 也用 JWT，換密鑰就是全站登出。

### 觀念 6：備份

這個專案的資產就是 Neon 裡的 `user` 表。Neon 有內建還原（從某個時間點建分支），免費方案可回溯的時間有限。手動備份用 `pg_dump`。原則只有一條：**刪資料前先備份**。

### 觀念 7：CI 綠了才部署 + branch protection

到第 10 關為止，推 main 就部署，**就算 CI 紅了 Render 照樣部署**。這關把它關起來，兩層：

1. **Render：After CI Checks Pass**。CI 紅就不部署。
2. **GitHub branch protection**：main 不能直接 push，要走 PR，而且 `backend`、`frontend` 兩個 check 綠了才能合併。

有了這兩層，「壞的程式進正式環境」的路就被堵死了。另外 CI 多了 `alembic check`：改了 `models.py` 沒寫遷移，CI 會紅（故障演練清單第 4 條，本機測試抓不到，因為測試用 `create_all` 建表）。

### ⚠️ 開始前（一次性）

**1. Sentry**（約 10 分鐘）
- sentry.io → Sign up，用 GitHub 登入，選免費的 Developer 方案
- Create Project → Platform 選 **FastAPI** → 名稱 `jwt-auth-demo-backend` → Create
- 它會顯示一段 `sentry_sdk.init(dsn="https://...")`，**只複製 dsn 那串網址**
- Render → 服務 → Environment → Add → `SENTRY_DSN` = 那串 → Save（會自動重新部署）
- Render Logs 裡應該看到 `Sentry 已啟用`

**2. Render：CI 綠了才部署**
- Render → 服務 → Settings → Build & Deploy → **Auto-Deploy** → 改成 **After CI Checks Pass** → Save
- 免費方案如果沒有這個選項：改成 **Off**，然後在 GitHub Actions 的 workflow 最後加一步，CI 通過後打 Render 的 Deploy Hook（Settings → Deploy Hook 複製網址，存成 GitHub Secret）。要走這條告訴 Claude，會幫你加

**3. GitHub branch protection**
- GitHub repo → Settings → **Rules → Rulesets** → New ruleset → New branch ruleset
- Name：`main`；Enforcement：Active；Target branches：Add target → Include default branch
- 勾 **Require a pull request before merging**（Required approvals 設 0，一個人的專案不用審）
- 勾 **Require status checks to pass** → Add checks → 搜 `backend` 和 `frontend` 兩個都加
- Create

之後你（和 Claude）都不能直接推 main，一律開 PR。這就是從第 9 關開始一直在做的流程，現在變成強制。

### 驗證方式

1. **本機**：`uv run pytest -q` 39 passed；`uv run alembic check` 顯示 `No new upgrade operations detected`
2. **本機看 JSON log**：`.env` 暫時加 `LOG_JSON=true`，啟動後端，打 `/api/ping`，terminal 每行是一筆 JSON，有 `request_id`、`duration_ms`。看完改回來
3. **正式**：`https://jwt-auth-demo-backend.onrender.com/api/health` 的 `db` 是 `ok`、`migration` 是 `0004`、`version` 是 main 最新 commit 的前幾碼
4. **Render Logs**：打一次前端登入，Logs 裡找到 `"path": "/api/auth/login"` 那筆，有 `request_id`、`status`、`duration_ms`
5. **CI**：Actions 裡多了「遷移檢查」那步，smoke test 印出 `/api/health` 的內容

### 動手玩

1. **觸發一個真的錯誤，看 Sentry 和 log**：Render → Environment → `ENABLE_DEBUG_ENDPOINTS` = `true` → Save（重新部署）→ 開 `後端網址/api/_boom` → 500。Render Logs 找 `"level": "ERROR"` 那筆，有完整 traceback 和 `request_id`；一分鐘內 Sentry 收到 email 和一個新 issue。**玩完改回 `false`**。
2. **推一個會讓 CI 紅的 commit，看 Render 不部署**：開分支，把 `routes/auth.py` 的 `rt.revoked = True` 註解掉，開 PR。CI 紅，GitHub 的 Merge 按鈕被擋住（branch protection）。關掉 PR 不要合。
3. **改了 models.py 沒寫遷移**：開分支，`models.py` 的 `User` 加一個欄位 `nickname: str | None = None`，**不要**跑 alembic revision，開 PR。本機 pytest 會過，但 CI 的「遷移檢查」會紅。這就是故障演練第 4 條，提前讓你看一次。關掉 PR。
4. **退版演練**：Render → Events → 找上一個成功的部署 → Rollback。看 `/api/health` 的 `version` 變成舊的 commit。再 Manual Deploy 回最新。
5. **本機遷移退一版**：`uv run alembic downgrade -1` → `uv run alembic current` 看變 0003 → Neon 的 `user` 表 `nickname` 欄位回來了（0004 是刪它）→ `uv run alembic upgrade head`。

### 想一想

<details>
<summary>Q1：為什麼 <code>/api/_boom</code> 要用環境變數開關，而不是直接寫在程式裡？</summary>

因為它會讓任何知道網址的人幫你製造錯誤，灌爆 Sentry 的免費額度，log 也會被洗版。原則：**除錯用的東西預設關閉**，要用時才打開，用完關掉。這和 `DB_ECHO` 一樣。

</details>

<details>
<summary>Q2：request id 為什麼要先看請求有沒有帶 <code>X-Request-ID</code>，沒有才自己產生？</summary>

為了串接。如果前面還有一層（Vercel、API gateway、或別的服務呼叫你），它們可能已經有一個 id，沿用它才能把整條鏈的 log 串起來。這是分散式追蹤最簡化的版本。

</details>

<details>
<summary>Q3：有了 branch protection，Claude 之後怎麼幫你推程式？</summary>

一樣開 PR，等 CI 綠，你（或 Claude）按 Merge。差別只是「直接推 main」這條路被堵掉了，對誰都一樣。練習專案也建議一開始就設，這樣 AI 拼出來的東西一定經過 CI 才能上線。

</details>

<details>
<summary>Q4：Sentry 和 log 都有錯誤資訊，為什麼兩個都要？</summary>

log 是全部的紀錄，包含正常的請求，用來「查某一次發生了什麼」。Sentry 只收錯誤，但會幫你分組、計數、通知，用來「知道有事發生、哪個最嚴重」。一個是檔案櫃，一個是警報器。

</details>

---

## 關卡 12：TanStack Query ✅

**改動的檔案**：`frontend/package.json`（新增 `@tanstack/react-query`，開發用 `@tanstack/react-query-devtools`）、`frontend/src/`：新增 `api/queryClient.ts`、`auth/useMe.ts`，改寫 `auth/authStore.ts`（拿掉 `user`）、`auth/authService.ts`（不再呼叫 `getMe`、刪 `reloadUser`）、`auth/useAuth.ts`、`main.tsx`（包 `QueryClientProvider`）、`components/UserPanel.tsx`、`pages/HomePage.tsx`、`app/AppLayout.tsx`

### 一句話

**前端有兩種狀態：「自己的」和「後端資料的副本」。第 8 關把兩種都塞進 Zustand；這關把第二種交給 TanStack Query，因為副本會過期、要重抓、要顯示載入中和錯誤，這些事每一種後端資料都要做一遍，不該每次手寫。**

### 觀念：client state 和 server state 是兩回事

| | client state（前端自己的） | server state（後端資料的副本） |
| --- | --- | --- |
| 例子 | access token、「初始化了沒」、提示文字、表單輸入 | 使用者資料、之後練習專案的待辦清單、分類 |
| 正本在哪 | 前端 | **後端資料庫** |
| 會不會自己變 | 不會，只有你的程式會改它 | 會。別的分頁、別的裝置、別人都可能改 |
| 要煩惱什麼 | 幾乎不用 | 什麼時候過期？要不要重抓？抓的時候畫面顯示什麼？失敗呢？兩個元件都要用，抓一次還是兩次？ |
| 誰管 | **Zustand**（`authStore.ts`） | **TanStack Query**（`queryClient.ts` + `useMe.ts`） |

第 8 關的 `user` 是 server state，卻被當成 client state 管：`login`、`initializeAuth`、`reloadUser` 三個地方各自呼叫 `getMe()` 再 `setUser()`，沒有「載入中」，錯誤要元件自己 `useState` 接。資料只有一種時還撐得住，練習專案有 todo、category 之後，每一種都要再寫一套。TanStack Query 就是把這套流程寫好一次給所有資料用。

### 手寫版 → 套件版對照

| 第 8 關手寫 | 第 12 關 TanStack Query | 套件幫你做了什麼 |
| --- | --- | --- |
| `store.user` + `setUser` | `useMe().data` | 存在 query 快取，所有元件共用同一份 |
| `login()` 裡呼叫 `getMe()` | `enabled: status === "authenticated"` | 一變成已登入就自動抓，不用在每個登入路徑手動呼叫 |
| `reloadUser()` | `refetch()` | 手動重抓 |
| 沒有「載入中」 | `isPending`、`isFetching` | 第一次抓 / 背景重抓，兩種狀態分開 |
| 元件自己 `useState` 存錯誤 | `error` | 最後一次失敗的錯誤 |
| 兩個元件都要 user → 各自呼叫或靠 store 共用 | 同一個 `queryKey` | 同時 mount 也只送一個請求 |
| 沒有 | `staleTime`、`refetchOnWindowFocus` | 切回分頁時如果資料過期就自動重抓 |
| 沒有 | Devtools | 右下角圖示，看得到每個 query 的狀態和快取內容 |

**`useAuth()` 的用法只少了 `user` 和 `reloadUser`**，其他元件一行都不用改。這是第 6 關分層的好處第二次派上用場。

### 程式怎麼寫

**1. 快取本體（`api/queryClient.ts`）**

```ts
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
```

- **`staleTime`**：抓回來的資料多久內算「新鮮」。新鮮的資料再被要求時直接用快取、不重抓；過期的會先給你舊資料、同時在背景重抓。預設 0（永遠算過期）對這個專案太頻繁，設 30 秒。
- **`retry`**：失敗重試幾次。401 已經由 axios 攔截器處理（第 8 關），走到這裡的失敗通常是後端掛了，重試太多次只是拖長「載入中」。

這個檔案還**訂閱了 Zustand store**：token 從有變成沒有（登出、登出所有裝置、refresh 失敗）就 `queryClient.clear()`。為什麼不寫在 `logout()` 裡？因為清 token 的地方有三個，盯著「token 消失」這一件事，三條路都不會漏。沒有這段會怎樣，見動手玩 4。

**2. 宣告一份資料（`auth/useMe.ts`）**

```ts
export const meQueryKey = ["me"] as const;

export function useMe() {
  const status = useAuthStore(selectStatus);
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    enabled: status === "authenticated",
  });
}
```

- **`queryKey`**：快取裡的名字。同名的資料在所有元件之間共用。之後要讓它過期：`queryClient.invalidateQueries({ queryKey: meQueryKey })`。
- **`queryFn`**：怎麼抓。直接用第 8 關的 `getMe()`，走 axios 攔截器，token 過期會自動 refresh。**TanStack Query 不管 HTTP，只管「什麼時候呼叫你給的函式、結果存哪」**。
- **`enabled`**：條件不成立就不抓。沒登入時 `/me` 註定 401，不該送。

**3. 包 Provider（`main.tsx`）**

```tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

Zustand 不需要 Provider，TanStack Query 需要：快取要跟著 React 樹的生命週期走，測試時也要能換一份乾淨的。Devtools 只在開發模式出現，正式 build 自動拿掉。

**4. 元件裡用（`components/UserPanel.tsx`）**

```tsx
const { data: me, isPending, isFetching, error, refetch, dataUpdatedAt } = useMe();

<button onClick={() => refetch()} disabled={isFetching}>
  {isFetching ? "更新中..." : "重新取得我的資料"}
</button>
{error && <p>{getErrorMessage(error)}</p>}
{isPending && <p>載入中...</p>}
{me && <pre>{JSON.stringify(me, null, 2)}</pre>}
```

對照第 8 關同一個檔案：`useState` 存訊息、`try/catch`、`handleReload` 全部消失。`isPending` 和 `isFetching` 的差別：前者是「還沒有任何資料」（第一次），後者是「正在抓」（包含背景重抓，這時 `data` 還是舊的，畫面不會閃成空白）。

**5. Zustand 瘦身（`auth/authStore.ts`、`auth/authService.ts`）**

store 拿掉 `user`、`setUser`；`login` 和 `initializeAuth` 只放 token，不再 `getMe()`；`reloadUser` 刪掉。`useAuthStore.getState()` 在 Console 裡現在看不到 `user` 了（第 8 關動手玩 1 的輸出會少一個欄位）。

### 練習專案怎麼用：列表 + 新增

這關只示範「讀」。練習專案的 CRUD 會用到「寫」，模式長這樣（以待辦為例，**不在這個 repo 裡**，只是給你看樣子）：

```ts
// src/features/todos/queries.ts
export const todosKey = ["todos"] as const;

export function useTodos() {
  return useQuery({ queryKey: todosKey, queryFn: getTodos });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    // 新增成功後讓列表過期 → 正在顯示列表的元件自動重抓
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey }),
  });
}
```

```tsx
const { data: todos, isPending } = useTodos();
const create = useCreateTodo();
<button onClick={() => create.mutate({ title })} disabled={create.isPending}>新增</button>
```

**規則只有一條：改了後端資料，就 `invalidateQueries` 對應的 key。** 列表會自己重抓，不用手動更新陣列。這就是為什麼 `queryKey` 要集中定義成常數：寫的時候才找得到要讓誰過期。登入、登出這類「不是在改一筆資料」的動作留在 `authService`，不用硬套 `useMutation`。

### 驗證方式

1. **`frontend` 跑 `npm install`**（`package.json` 變了），然後 `npm run dev`
2. **登入後**：首頁右下角有一個小圖示（Devtools），點開看到 `["me"]` 這個 query，狀態是 `fresh`，30 秒後變 `stale`
3. **Network**：登入後只有**一個** `/api/me`，雖然 `AppLayout` 和 `HomePage`、`UserPanel` 三個元件都在用它
4. **重新整理**：還在登入狀態，一樣只有一個 `/api/me`
5. **按「重新取得我的資料」**：按鈕短暫變成「更新中...」，「上次更新」的時間跟著變，Network 多一個 `/api/me`
6. **登出再登入**：Network 沒有多餘的 `/api/me`（登出後 `enabled` 是 false）
7. **過期的 token 還是會自動 refresh**：`backend/.env` 加 `JWT_EXPIRE_MINUTES=1`，重啟後端，登入後等 1 分鐘再按「重新取得我的資料」，Network 是 `me` 401 → `refresh` 200 → `me` 200，畫面沒有錯誤。這條路是第 8 關的攔截器在做，跟 query 無關。玩完刪掉這行
8. `npm run lint`、`npm run build` 都要通過

### 動手玩

1. **看 `staleTime` 的效果**：開**兩個**分頁都登入。在分頁 B 登出再登入（`last_login_at` 會變）。切回分頁 A：30 秒內切回去沒反應（還新鮮），超過 30 秒切回去 Network 會自動多一個 `/api/me`，畫面上的 `last_login_at` 更新了，**你什麼都沒按**。這就是 `refetchOnWindowFocus`。把 `staleTime` 改成 `0`，每次切回來都重抓；改成 `Infinity`，永遠不自動重抓。改回來。
2. **拿掉 `enabled`**：`useMe.ts` 那行註解掉。登出後 Network 立刻多一個 401 的 `/api/me`，接著攔截器去 `refresh` 又 401。這就是「沒登入就不要抓」的理由。改回來。
3. **`isPending` 和 `isFetching` 的差別**：DevTools → Network → 把速度調成 `Slow 4G`。按「重新取得我的資料」：按鈕變「更新中...」但舊資料還在（`isFetching`）。重新整理頁面：變成「載入中...」（`isPending`，沒有任何資料）。調回 `No throttling`。
4. **拿掉登出清快取**：`queryClient.ts` 最後那段 `subscribe` 註解掉。用帳號 A 登入，登出，用帳號 B 登入：首頁標題會**先閃一下 A 的 email** 再變成 B。因為 `["me"]` 這個 key 沒有使用者 id，快取還留著 A 的資料。改回來。
5. **Devtools 裡手動操作**：點開 Devtools，選 `["me"]`，按 `Invalidate`（資料過期，立刻重抓）、`Reset`、`Remove`，一邊看 Network 和畫面。這是除錯時最快的方法。

### 想一想

<details>
<summary>Q1：為什麼 access token 不也交給 TanStack Query 管？它也是後端給的。</summary>

它不是「資料的副本」，是「憑證」。沒有人會想「重抓」token、沒有「列表」可以顯示它、也不需要「過期就在背景更新」（過期是攔截器的事）。它是前端拿來做事的工具，屬於 client state。判斷方法：**這東西有沒有一個後端的正本，而且你想讓畫面跟著那個正本走？** 有就是 server state。

</details>

<details>
<summary>Q2：<code>["me"]</code> 這個 key 為什麼不加使用者 id，像 <code>["me", userId]</code>？</summary>

抓到 `/me` 之前根本不知道 id。所以改用「登出就清掉整個快取」解決。練習專案的 todo 列表也一樣：`["todos"]` 不用加 user id，因為後端只會回「這個 token 的人」的資料，換人時快取已經被清掉了。

</details>

<details>
<summary>Q3：TanStack Query 和 Zustand 會不會重複？要不要全部改用其中一個？</summary>

不會。Zustand 是「一個全域變數加上自動通知畫面」，什麼都能放，但什麼都不幫你做。TanStack Query 專門管「從後端抓來的資料」的生命週期，但它不適合放 token 這種不是抓來的東西。兩個都留，各管各的，是目前 React 社群最常見的組合。

</details>

<details>
<summary>Q4：登入動作為什麼不用 <code>useMutation</code>？</summary>

可以用，但沒必要。`useMutation` 的價值在 `onSuccess` 之後讓某個 query 過期、以及幫你管 `isPending`。登入成功要做的是「把 token 放進 store」，不是「讓某份資料過期」，而且 `LoginForm` 的 `useState` 已經處理了錯誤訊息。練習專案的新增、修改、刪除才是 `useMutation` 的主場。

</details>

<details>
<summary>Q5：<code>queryFn</code> 失敗時 TanStack Query 會重試，axios 攔截器又會 refresh 重送，兩個會不會打架？</summary>

不會，層次不同。攔截器在**一次** `getMe()` 呼叫裡面處理 401（refresh、重送、回傳結果或丟錯誤）；TanStack Query 只看到 `getMe()` 最後成功還是失敗，失敗才重試。所以過期 token 的流程是：query 呼叫 `getMe()` → 攔截器 401 → refresh → 重送 200 → query 收到成功。query 完全不知道中間發生過 401。

</details>

---

## 關卡 13：工程品質基線 ✅

**改動的檔案**：
- 後端：`pyproject.toml`（加 `pyright` 與 `[tool.pyright]`）、`uv.lock`、新增 `.python-version`、`security.py`（bcrypt 丟到執行緒池、假雜湊、JWT 強制 `exp`/`sub`）、`routes/auth.py`（註冊競態、登入 timing、`col()`、`assert id`）、`dependencies.py`（只接 PyJWT 的錯誤）、`database.py`（型別標註）、`main.py`（lifespan 關連線池、health 改用底層連線）、`config.py`；全部檔案跑過 `ruff format`
- 前端：`tsconfig.app.json` / `tsconfig.node.json`（`strict`、`noUncheckedIndexedAccess`）、新增 `.prettierrc`、`.prettierignore`、`.nvmrc`，`package.json`（`format`、`format:check`、`typecheck` 指令、`engines`）、`eslint.config.js`（接 `eslint-config-prettier`）、`index.html`（`lang`、`title`）；全部檔案跑過 Prettier
- repo：新增 `.github/dependabot.yml`、`.editorconfig`；`ci.yml` 加 ruff format、pyright、prettier 三步
- 測試：`tests/test_rules.py` 配合 async 的密碼函式，加 JWT 欄位的測試（共 42 個）

### 一句話

**「教學模板」不是降低標準的理由。這關把一個專業團隊會視為基本配備的東西一次裝齊：型別檢查、格式化、自動更新套件、固定執行版本，並順手修掉幾個「能跑但不專業」的地方。之後每一關、每個練習專案都站在這條基線上。**

### 觀念 1：四種檢查，各抓不同的錯

| 工具 | 抓什麼 | 後端 | 前端 | 沒有它會怎樣 |
| --- | --- | --- | --- | --- |
| Linter | 寫法：沒用到的 import、可疑的模式 | ruff check | eslint | 髒程式碼累積，真正的 bug 藏在雜訊裡 |
| Formatter | 排版：縮排、引號、換行 | ruff format | Prettier | 每個 PR 都在吵排版；diff 裡一半是空白變動 |
| 型別檢查 | 型別：`int \| None` 當 `int` 用、忘了 `await` | pyright | tsc（`strict`） | 要跑到那一行才炸；最常見的是「有時候是 None」的 500 |
| 測試 | 行為：這個輸入該得到這個輸出 | pytest | （關卡 16） | 改 A 壞了 B，上線才知道 |

四種都在 CI 跑，任何一個紅就不能合併。**本機先跑**（`AGENTS.md` 常用指令），不要用 CI 當第一道檢查。

**pyright 和 ruff 的分工**：ruff 看單一檔案的「樣子」，pyright 跨檔案追型別。`routes/auth.py` 的 `user.id` 是 `int | None`（SQLModel 的主鍵在存進資料庫前是 None），直接傳給要 `int` 的函式，ruff 不會說話，pyright 會。

**TypeScript 的 `strict`**：Vite 範本原本沒開。沒開 `strict`，`null` 檢查和隱含 `any` 全部放行，型別只是裝飾。這個專案開了之後**零錯誤**，因為前面幾關寫得還算乾淨，但新專案一定要一開始就開，之後才開會有幾百個錯誤。

### 觀念 2：Formatter 的價值在「不用再討論」

Prettier 和 ruff format 都是「幾乎沒有選項」的工具，這是刻意的：排版沒有對錯，有統一就好。設定檔只有四行（`.prettierrc`），之後所有人、所有 AI 寫的程式碼長得一樣，code review 只看邏輯。

`eslint-config-prettier` 放在 ESLint 設定的最後：關掉 ESLint 裡跟排版有關的規則，不然兩個工具會互相改來改去。

### 觀念 3：固定版本，三個地方要一樣

| 哪裡 | 檔案 | 讀它的人 |
| --- | --- | --- |
| Python | `backend/.python-version` = 3.13 | uv（本機、CI 都會自動下載這個版本）；Dockerfile 原本就寫死 3.13 |
| Node | `frontend/.nvmrc` = 22、`package.json` 的 `engines` | nvm / fnm 自動切換；`npm install` 版本不對會警告 |
| 套件 | `uv.lock`、`package-lock.json`（關卡 9 就有） | `uv sync --frozen`、`npm ci` |

目標是「本機、CI、Docker 跑的東西一模一樣」。以前只鎖套件沒鎖執行環境，本機 Python 3.12、Docker 3.13 這種差異抓不到。

### 觀念 4：Dependabot，讓套件更新變成 PR

套件不更新，安全漏洞會一直留著；但手動追每個套件的版本沒人做得到。`.github/dependabot.yml` 讓 GitHub 每週檢查，有新版就開 PR 跑 CI。你只要看 CI 綠不綠、changelog 有沒有破壞性變更，再決定合不合。

設定裡把小版本更新（minor、patch）**合成一個 PR**，不然一週可能收到十幾個；大版本（major）另開，因為通常要改程式。這是故障演練第 9 條「套件升級後行為改變」的日常版：升級由 PR 承擔，壞了 CI 會紅，不會直接進 main。

> 免費方案提醒：Dependabot 本身免費。它開的每個 PR 會跑一次 CI（約 1～2 分鐘），私有 repo 每月 2000 分鐘的額度足夠。（註：2026-10-22 起 repo 已公開，不計分鐘。）

### 觀念 5：順手修掉的四個「能跑但不專業」

這些在教學關卡裡沒展開，但正式專案的 code review 一定會被挑出來：

1. **bcrypt 擋住 event loop**（`security.py`）。bcrypt 刻意很慢（一次 100 毫秒以上）而且是純 CPU。直接在 `async def` 裡呼叫，那 100 毫秒整個後端什麼都不能做，連 `/api/ping` 都卡住。十個人同時登入，第十個人要等前面九個算完。改成 `asyncio.to_thread(...)` 丟到執行緒池，event loop 繼續服務別人。**async 不等於快，擋住 loop 的東西都要丟出去**，這是 async 後端最常見的效能錯誤。
2. **登入的 timing attack**（`routes/auth.py`）。帳號不存在 → 不做 bcrypt → 1 毫秒回 401；密碼錯 → 做 bcrypt → 100 毫秒回 401。量一下時間就能列舉哪些 email 有註冊。修法：帳號不存在時也對一個假的雜湊比對一次，兩種失敗花的時間一樣。
3. **註冊的競態**（`routes/auth.py`）。「先查 email 存不存在、再寫入」中間有空窗，兩個請求同時註冊同一個 email，第二個 commit 會撞到資料庫的 unique 索引丟 `IntegrityError`，以前會變 500。真正守住唯一性的是資料庫，程式只要接住那個錯誤回 400。
4. **JWT 沒強制 `exp`**（`security.py`）。PyJWT 預設「有 `exp` 才檢查過期」，一個被竄改成沒有 `exp` 的 token 會永遠有效（簽章還是要對，所以要先拿到密鑰才做得到，但縱深防禦不該靠這個）。`options={"require": ["exp", "sub"]}` 一行解決，並加了測試。

另外兩個小的：`dependencies.py` 只接 PyJWT 的錯誤而不是 `except Exception`（以前程式自己的 bug 也會被包成 401，查不到原因）；`main.py` 加 lifespan 在關機時 `engine.dispose()`（部署換版時連線好好關掉，免費方案的連線數上限很小）。

### 驗證方式

1. **後端**（在 `backend`）：`uv sync`（多了 pyright）→ `uv run ruff format --check .`、`uv run ruff check .`、`uv run pyright`、`uv run pytest -q` 四個都綠，測試 42 個
2. **前端**（在 `frontend`）：`npm install` → `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm run build` 四個都綠
3. **CI**：Actions 的 backend job 多了「Format check」「Type check」兩步，frontend job 多了「Format check」
4. **GitHub → Insights → Dependency graph → Dependabot**：看得到三個 ecosystem 的設定；一週內會收到第一批 PR
5. **登入 timing**：看後端 request log 的 `duration_ms`：用不存在的 email 登入，和用存在的 email 打錯密碼，兩者耗時接近（都有 bcrypt 的時間）。改之前的版本，前者會快 100 倍

### 動手玩

1. **看 pyright 抓到什麼**：`routes/auth.py` 的 login 裡把 `assert user.id is not None` 那行刪掉，`uv run pyright` 會指出下面三個呼叫傳了 `int | None`。這就是「跑到那一行才炸」被提前到「存檔就知道」。加回來。
2. **看 strict 的效果**：`useMe.ts` 裡把 `queryFn: getMe` 改成 `queryFn: () => getMe().then((u) => u.email)`，`npm run typecheck` 會在 `HomePage.tsx` 說 `string` 沒有 `email`。沒開 strict 時這類錯誤只會在瀏覽器 Console 出現。改回來。
3. **故意把 bcrypt 放回 event loop**：`security.py` 的 `verify_password` 改成直接 `return _verify_password_sync(plain, hashed)`（不 `to_thread`）。開兩個終端機：一個用 `curl` 連打 `/api/ping` 看耗時，另一個同時送 20 個登入請求（可以用瀏覽器 Console 的 `Promise.all`）。沒 `to_thread` 時 `/api/ping` 會跟著卡住幾百毫秒。改回來。
4. **讓 Prettier 紅**：隨便一個 `.tsx` 把雙引號改單引號，`npm run format:check` 紅；`npm run format` 自動修好。ruff format 同理。
5. **觸發註冊競態**：Console 裡 `const m = await import("/src/api/auth.ts"); await Promise.allSettled([m.register("x@y.com","Passw0rd!x"), m.register("x@y.com","Passw0rd!x")])`。兩個都是 400 或 201 + 400，沒有 500。把 `try/except IntegrityError` 拿掉再試，有機會看到 500。改回來。

### 想一想

<details>
<summary>Q1：型別檢查和測試都在抓錯，有了測試還要型別檢查嗎？</summary>

抓的層次不同。測試只覆蓋「你想到的情境」；型別檢查覆蓋「所有呼叫點」。`user.id` 可能是 None 這件事，測試不會特別去測（測試裡的 user 都是從 DB 來的），但型別檢查器看到每一個傳 `user.id` 的地方都會問「None 的時候呢」。而且型別檢查幾秒就跑完，測試要起資料庫。

</details>

<details>
<summary>Q2：為什麼 bcrypt 要丟到執行緒，asyncpg 查資料庫卻不用？</summary>

查資料庫是「等 I/O」：請求送出去，等回應的期間 CPU 是閒的，event loop 可以去做別的事，這正是 async 的用武之地。bcrypt 是「算 CPU」：那 100 毫秒 CPU 一直在忙，event loop 沒有任何「等待」的空檔可以切出去。所以 I/O 用 await，CPU 用 `to_thread`（或 process pool）。判斷方法：這段程式是在「等別人」還是在「自己算」？

</details>

<details>
<summary>Q3：Dependabot 開的 PR，CI 綠了就可以直接合嗎？</summary>

minor、patch 通常可以，但先看一眼 changelog。CI 綠只代表「現有測試過了」，前端沒有測試（關卡 16 之前），一個套件的行為改變 CI 抓不到。major 一定要看 migration guide，通常要改程式。原則：**小版本靠 CI，大版本靠人**。

</details>

<details>
<summary>Q4：為什麼這些東西不在關卡 9（CI）就加？</summary>

當時的目標是「把鏈打通」，一次加太多工具會模糊焦點。現在鏈通了、要凍結模板、要給練習專案當基線，才是加的時機。但新專案不用等：搬家清單（`CHAIN.md` 附錄 A）已經把這些設定檔列進去，練習專案從第一天就有。

</details>

---

## 關卡 14：Zod + React Hook Form ✅

**改動的檔案**：`frontend/package.json`（新增 `zod`、`react-hook-form`、`@hookform/resolvers`）、`frontend/src/`：新增 `schemas/auth.ts`，改寫 `components/LoginForm.tsx`、`RegisterForm.tsx`、`ChangePasswordForm.tsx`，刪除 `utils/password.ts`

### 一句話

**表單有兩件事：「規則是什麼」和「欄位狀態怎麼管」。第 6 關兩件都手寫；這關把規則交給 Zod（一份 schema 同時給型別和驗證），把狀態交給 React Hook Form。元件只剩「送出後要做什麼」。**

### 觀念：Zod 是前端的 Pydantic

後端 `schemas.py` 用 Pydantic 做的事：宣告欄位、規則、自動產生型別、進來的資料不對就回錯誤。前端以前沒有對應的東西，規則散在 `utils/password.ts` 的 if 和每個表單的 `canSubmit` 裡。Zod 就是那個對應：

| | 後端 Pydantic（`schemas.py`） | 前端 Zod（`schemas/auth.ts`） |
| --- | --- | --- |
| 宣告 | `class UserCreate(BaseModel)` | `z.object({...})` |
| 規則 | `Field(min_length=8)`、`@field_validator` | `.min(8)`、`.regex()`、`.refine()` |
| 型別 | class 本身就是型別 | `z.infer<typeof schema>` |
| 錯在哪 | 422 的 `detail` 陣列 | `errors.password.message` |

**兩邊規則要一樣**（8～72 個可列印 ASCII），但前端那份只是為了即時提示，真正把關的是後端。這個原則從第 0 關到現在沒變。

### 手寫版 → 套件版對照（`LoginForm.tsx`）

| 第 6 關手寫 | 第 14 關 | 誰做 |
| --- | --- | --- |
| `useState` 一個欄位一個 | `useForm()` 一次管所有欄位 | React Hook Form |
| `onChange={(e) => setEmail(e.target.value)}` | `{...register("email")}` | React Hook Form |
| `canLogin = email.trim() !== "" && password !== ""` | `formState.isValid` | Zod 算、RHF 回報 |
| `useState` 存錯誤訊息 + `try/catch` | `setError("root", { message })` | React Hook Form |

> 關卡 15 修正：`setError("root")` 會把 `isValid` 設成 false，密碼打錯後按鈕會一直灰到使用者改了欄位，想用同一組帳密重試做不到。後端錯誤改回元件自己的 `useState`（`serverError`），表單狀態只管欄位。下面程式片段裡的 `setError` 是當時的版本。
| `event.preventDefault()` | `handleSubmit(onSubmit)` | React Hook Form |
| `utils/password.ts` 的 if 鏈 | `passwordSchema` | Zod |
| 沒有「送出中」狀態 | `isSubmitting` | React Hook Form |

元件從「管狀態」變成「宣告規則 + 說送出後要做什麼」。欄位從兩個變十個，程式碼長度幾乎不變。

### 程式怎麼寫

**1. 規則（`schemas/auth.ts`）**

```ts
export const passwordSchema = z
  .string()
  .regex(/^[\x20-\x7E]*$/, "密碼只能包含英文字母、數字、空白與符號")
  .min(8, "密碼至少 8 個字元")
  .max(72, "密碼最多 72 個字元");

export const registerSchema = z.object({ email: z.email("Email 格式不正確"), password: passwordSchema });
export type RegisterInput = z.infer<typeof registerSchema>;
```

- 每條規則帶自己的錯誤訊息，第一條沒過的會出現在 `errors.password.message`
- **`z.infer`**：型別從 schema 推出來，不用手寫 `type RegisterInput = { email: string; password: string }`，改了 schema 型別自動跟著變
- **`.refine()`**：跨欄位的規則。改密碼的「新密碼不能和目前密碼相同」要看兩個欄位，`path` 指定錯誤掛在哪個欄位上
- 登入的 schema 刻意**不**套密碼規則，理由和後端 `UserLogin` 一樣（關卡 0）

**2. 表單（`LoginForm.tsx`）**

```tsx
const { register, handleSubmit, setError, formState: { errors, isValid, isSubmitting } } =
  useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: defaultEmail, password: "" },
  });

const onSubmit = async (data: LoginInput) => {
  try {
    await login(data.email, data.password);
  } catch (error) {
    setError("root", { message: `登入失敗：${getErrorMessage(error)}` });
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email")} />
  <button type="submit" disabled={!isValid || isSubmitting}>登入</button>
  {errors.root && <p>{errors.root.message}</p>}
</form>
```

- **`resolver`**：驗證規則交給 Zod。RHF 本身不管規則，它只管「什麼時候驗、結果放哪」
- **`mode: "onChange"`**：每次輸入都驗，`isValid` 才會即時更新；預設是送出時才驗
- **`register("email")`**：回傳 `name`、`onChange`、`onBlur`、`ref` 四樣，展開到 input 上就接好了。RHF 是**非受控**的：值存在 DOM 裡，不是每個鍵盤事件都重新渲染，欄位多了效能明顯比 `useState` 好
- **`handleSubmit(onSubmit)`**：先 `preventDefault`，跑 Zod，全過才呼叫 `onSubmit` 並把**型別正確的資料**傳進來
- **`setError("root")`**：後端回的錯誤（密碼錯、email 已註冊）不屬於任何欄位，掛在 `root`（關卡 15 改回 `useState`，見上方註記）
- **`isSubmitting`**：`onSubmit` 還在 `await` 時是 true，按鈕 disabled，擋住連點兩次

**3. `RegisterForm` 的 `register` 撞名**：`useForm` 回傳的 `register` 和 `api/auth.ts` 的 `register` 同名，import 時改名 `register as registerUser`。

### 驗證方式

1. `frontend` 跑 `npm install`，`npm run dev`
2. **註冊頁**：一打開「註冊」按鈕是灰的；email 打 `abc` 出現「Email 格式不正確」；密碼打 `short` 出現「密碼至少 8 個字元」、打中文出現「只能包含英文字母…」；兩個都合法按鈕才亮
3. **登入頁**：密碼打錯，按鈕下方出現「登入失敗：Incorrect email or password」（後端的訊息）
4. **改密碼**：新舊密碼打一樣，新密碼下方出現「新密碼不能和目前密碼相同」且按鈕灰（`refine`）；改成功後兩個欄位清空（`reset()`）
5. 送出時按鈕文字變「登入中...」（DevTools Network 調成 Slow 4G 比較看得到）
6. `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm run build` 綠

### 動手玩

1. **改一條規則，兩邊都動**：`passwordSchema` 的 `.min(8)` 改成 `.min(12)`。註冊頁的提示立刻變，而且 `RegisterInput` 型別沒變（還是 string），因為規則和型別是分開的兩層。改回來。
2. **拿掉 `mode: "onChange"`**：按鈕一開始就是亮的，按下去才驗證、才出現錯誤訊息。這是 RHF 的預設（`onSubmit`），比較不吵但少了即時提示。改回來。
3. **拿掉 `resolver`**：沒有任何驗證，空白表單也能送，後端回 422，訊息出現在按鈕下方。這就是「前端驗證是體驗，後端驗證是安全」。改回來。
4. **前後端規則不一致**：`passwordSchema` 的 `.max(72)` 改成 `.max(80)`，用 75 個字元的密碼註冊：前端放行、後端 422「at most 72 characters」。使用者會看到一個前端沒提示過的錯誤，這就是為什麼兩邊要一致。改回來。
5. **看 `z.infer`**：在 `schemas/auth.ts` 最下面加 `const x: RegisterInput = { email: "a" };`，`npm run typecheck` 會說少了 `password`。刪掉。

### 想一想

<details>
<summary>Q1：後端已經有 Pydantic 驗證了，前端為什麼還要一份？不能只靠 422 的訊息嗎？</summary>

可以，功能上沒差。差在體驗和流量：使用者要等請求來回才知道密碼太短；每一次打錯都是一個請求。前端那份是「提早告訴他」，後端那份是「不信任前端」。兩份都要，而且規則要一樣（動手玩 4）。

</details>

<details>
<summary>Q2：為什麼 React Hook Form 用「非受控」（值在 DOM 裡），不像 useState 那樣每個字都進 state？</summary>

受控元件每個鍵盤事件都觸發重新渲染，表單一大（十幾個欄位、每個欄位有驗證）會卡。非受控把值留在 DOM，只在需要時（驗證、送出）讀出來。代價是你不能隨時從 state 拿到值，要用 `watch()` 或 `getValues()`。對登入表單差別感覺不到，對練習專案的「待辦編輯表單」會。

</details>

<details>
<summary>Q3：Zod 和 TypeScript 型別有什麼不一樣？都開 strict 了為什麼還要 Zod？</summary>

TypeScript 只在**編譯時**存在，跑起來就沒了。使用者在 input 打的字、後端回的 JSON，TypeScript 完全管不到，它只能相信你寫的型別標註。Zod 在**執行時**真的檢查，而且順便產生型別。原則：**邊界（使用者輸入、API 回應、環境變數）用 Zod 驗，內部用 TypeScript 型別**。練習專案可以用 Zod 驗 API 回應，確保後端改了格式前端立刻知道。

</details>

<details>
<summary>Q4：為什麼登入表單不驗 email 格式，註冊表單驗？</summary>

註冊時擋掉格式錯的 email 是幫使用者；登入時驗格式只會多一種「登入失敗」的訊息，而且萬一規則改了，舊帳號會登不進去。後端的 `UserLogin` 也是同一個決定（關卡 0 的原則：規則只在設定時檢查）。

</details>

---

## 關卡 15：Tailwind CSS ✅

**改動的檔案**：`frontend/package.json`（新增 `tailwindcss`、`@tailwindcss/vite`，開發用 `prettier-plugin-tailwindcss`）、`vite.config.ts`（加外掛）、`.prettierrc`（加外掛）、`src/index.css`（換成 `@import "tailwindcss"`）、新增 `components/ui.tsx`（`TextInput`、`Button`、`Hint`、`Alert`），刪除 `components/styles.ts`；`AppLayout`、所有 `pages/`、所有 `components/`、`RequireAuth`、`GuestOnly` 的 inline style 全部改成 class

### 一句話

**樣式從「每個元件自己寫 `style={{...}}`」變成「用 Tailwind 的 class 拼」，重複的組合包成小元件。順便把 Vite 範本留下的 CSS 清掉，加上深色模式。**

### 觀念：為什麼是 Tailwind

| 做法 | 問題 |
| --- | --- |
| inline style（第 6～14 關） | 不能寫 hover、深色模式、響應式；`styles.ts` 這種共用物件越長越難管 |
| 傳統 CSS 檔 + class 名字 | 要替每個東西取名字（`.login-form__hint--error`），而且 CSS 是全域的，改一條可能影響別處 |
| CSS-in-JS（styled-components） | 執行期才產生 CSS，有效能成本；React 19 的 server 端生態已經在遠離它 |
| **Tailwind** | 樣式寫在 class 名字裡：`bg-zinc-50 p-6 rounded-md`。沒有命名問題、沒有全域污染、build 時只留用到的 class，CSS 很小 |

代價是 class 很長。解法就是這關做的：**重複的組合 → 元件**（`ui.tsx`），不是另外寫 CSS。

**Tailwind v4 和 v3 的差別**（網路上很多教學是 v3）：沒有 `tailwind.config.js`、沒有 PostCSS 設定、不用 `@tailwind base/components/utilities` 三行。只要 Vite 外掛 + CSS 裡一行 `@import "tailwindcss"`。

### 程式怎麼寫

**1. 接上（`vite.config.ts`、`index.css`）**

```ts
plugins: [react(), tailwindcss()],
```

```css
@import "tailwindcss";

@layer base {
  body {
    @apply bg-zinc-50 text-zinc-800 antialiased dark:bg-zinc-950 dark:text-zinc-200;
  }
}
```

- `@layer base`：整站的底，只放 body 的顏色這種真正全域的東西
- **`dark:`**：系統是深色模式時生效（Tailwind v4 預設跟著 `prefers-color-scheme`）。每個有顏色的 class 都要想一下深色版，不然深色模式會出現白底白字

**2. 共用元件（`components/ui.tsx`）**

```tsx
export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className="mb-2 block w-full rounded-md border ... dark:bg-zinc-900" />;
}
```

- `ComponentProps<"input">`：接受 `<input>` 的所有屬性，`{...register("email")}` 直接展開上去（React 19 起 `ref` 是普通的 prop，不需要 `forwardRef`）
- `Button` 用 `variant` 切三種顏色；`Hint` 是欄位下的小字；`Alert` 是整張表單的訊息，帶 `role="alert"`（螢幕閱讀器會唸、測試也好找）

**3. NavLink 的 `className` 可以是函式**（`AppLayout.tsx`）

```tsx
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? "font-semibold text-indigo-600 underline" : "text-zinc-600"}`;
```

**4. `prettier-plugin-tailwindcss`**：自動把 class 照官方順序排（版面 → 間距 → 顏色……），所有人寫出來的順序一樣，diff 乾淨。`.prettierrc` 加一行 `plugins` 就有。

**5. 順手修的兩件事**
- **build 警告**：關卡 14 加了 Zod 和 React Hook Form 之後，打包成一個 JS 檔超過 500 kB，Vite 會警告。`vite.config.ts` 加 `codeSplitting`，把 `node_modules` 切成 `react` 和 `vendor` 兩個 chunk：套件很少變，使用者的瀏覽器可以一直用快取，只重新下載你改過的那一小塊。專業的 repo 不留警告。
- **登入失敗後按鈕卡在灰色**：端對端測試抓到的。關卡 14 用 `setError("root")` 放後端錯誤，但 React Hook Form 的 `setError` 會把 `isValid` 設成 false，按鈕灰到使用者改了欄位為止。改回元件自己的 `useState`，表單狀態只管欄位，伺服器的回應是另一回事。關卡 14 的文件已加註記。

### 驗證方式

1. `frontend` 跑 `npm install`，`npm run dev`，打開網站：輸入框有圓角和 focus 的藍框、按鈕是靛藍色、disabled 時變淡
2. **深色模式**：DevTools → Rendering → Emulate CSS `prefers-color-scheme: dark`（或系統切深色）。底變黑、文字變淺、輸入框變深色，沒有白底白字
3. **手機寬度**：DevTools 切成手機，版面不會跑掉、不會橫向捲動
4. **CSS 很小**：`npm run build`，`dist/assets/*.css` 約 14 kB（gzip 約 4 kB），裡面只有真的用到的 class
5. `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm run build` 綠

### 動手玩

1. **加一個 class 看效果**：`HomePage.tsx` 的 `<h2>` 加 `text-indigo-600`，存檔立刻變色（Vite HMR）。再加 `hover:text-red-600`，滑鼠移上去變紅。inline style 做不到 hover，這是改用 Tailwind 的第一個直接好處。改回來。
2. **深色模式漏掉會怎樣**：`ui.tsx` 的 `TextInput` 把所有 `dark:` 開頭的 class 刪掉，切成深色模式：輸入框是白底、文字是深色，但 placeholder 和外框跟周圍的黑底格格不入。這就是「每個顏色都要想深色版」。改回來。
3. **看 build 只留用到的 class**：`index.css` 暫時加一行 `.x { @apply bg-fuchsia-500; }`，`npm run build` 後 CSS 大小幾乎不變；但如果在某個元件加 `className="bg-fuchsia-500"`，CSS 會多出那一條。Tailwind 掃描的是原始碼裡**出現過的 class 字串**，所以 class 名字不能用字串拼接（`bg-${color}-500` 掃不到）。改回來。
4. **Prettier 排序**：`Button` 的 class 順序隨便打亂，`npm run format` 後會排回官方順序。
5. **用 `variant` 加一種按鈕**：`ui.tsx` 的 `buttonVariants` 加 `ghost: "text-zinc-600 hover:bg-zinc-100"`，把導覽列的登出改成 `variant="ghost"`。型別會自動接受新的字串（`keyof typeof`）。看完改回來或留著都可以。

### 想一想

<details>
<summary>Q1：class 這麼長，不會很難讀嗎？</summary>

會，一開始會。但換個角度：以前要在 `.tsx` 和 `.css` 兩個檔案之間跳，現在樣式就在元素旁邊，改的時候不用找。真正難讀的是「同一組 class 重複出現在十個地方」，那是該抽成元件的訊號（`ui.tsx`），不是 Tailwind 的問題。

</details>

<details>
<summary>Q2：為什麼 Tailwind 不能用 <code>bg-${color}-500</code> 這種動態 class？</summary>

Tailwind 不執行你的程式，它只用正規表示式掃描原始碼裡「長得像 class」的字串，把掃到的產生成 CSS。`bg-${color}-500` 在原始碼裡不是完整的 class，掃不到，build 出來就沒有這條 CSS。要動態切換顏色，寫成完整字串的對照表（像 `buttonVariants` 那樣）。

</details>

<details>
<summary>Q3：深色模式為什麼跟著系統，不做一個切換按鈕？</summary>

跟著系統是零成本的（`dark:` 變體 + `prefers-color-scheme`），而且大多數使用者希望所有 app 一致。切換按鈕要多存一個偏好（localStorage）、要在 HTML 加 class、要處理第一次載入閃一下的問題。練習專案要做再做，Tailwind v4 用 `@custom-variant dark (&:where(.dark, .dark *))` 一行就能改成 class 控制。

</details>

<details>
<summary>Q4：<code>ui.tsx</code> 算不算在造輪子？不該直接用 shadcn/ui 之類的嗎？</summary>

四個元件、每個十行，不算。shadcn/ui 本質上也是「把 Tailwind class 包成元件、複製進你的 repo」，只是元件多很多（對話框、下拉選單、日期……）。練習專案需要那些時再引入，而且因為它也是 Tailwind，和這關學的東西完全相容。

</details>

---

## 關卡 16：Vitest + MSW（前端自動化測試）✅

**改動的檔案**：`frontend/package.json`（開發用：`vitest`、`jsdom`、`@testing-library/react`、`@testing-library/jest-dom`、`@testing-library/user-event`、`msw`、`@vitest/coverage-v8`；指令 `test`、`test:watch`、`test:coverage`）、新增 `vitest.config.ts`、`src/test/setup.ts`、`src/test/server.ts`、`src/api/client.test.ts`、`src/auth/RequireAuth.test.tsx`、`src/components/LoginForm.test.tsx`；`tsconfig.node.json` / `tsconfig.app.json`（型別）；`.github/workflows/ci.yml` 加「測試（vitest）」

### 一句話

**後端從第 4 關就有測試（到這關前是 42 個），前端一個都沒有：改攔截器只能手動在 Network 分頁看。這關把第 1、6、8、14 關手動驗證過的行為寫成 11 個測試，用 MSW 當假後端，不需要起 uvicorn。**

### 觀念：和後端 pytest 一一對照

| pytest（關卡 4） | Vitest（這關） | 做什麼 |
| --- | --- | --- |
| `pytest.ini` + `conftest.py` | `vitest.config.ts` + `src/test/setup.ts` | 設定、每個測試前後要做的事 |
| `TEST_DATABASE_URL` 測試資料庫 | **MSW** 假後端（`src/test/server.ts`） | 隔離外部依賴 |
| `client` fixture（httpx 直接打 FastAPI app） | `render()` + `screen`（Testing Library） | 把被測的東西跑起來、觀察它 |
| `TRUNCATE` 每個測試前清空資料表 | `afterEach`：還原 handler、清 store、清 query 快取、卸載畫面 | 測試之間不互相影響 |
| `assert res.status_code == 401` | `expect(button).toBeDisabled()` | 檢查結果 |
| `test_rules.py`（單元）/ `test_auth.py`（整合） | `client.test.ts`（攔截器）/ `LoginForm.test.tsx`（元件） | 同樣分兩層 |

**MSW 的關鍵**：它在「網路層」攔截。axios 照常送請求，MSW 接住回假資料，**程式碼一行都不用改**，不用把 `getMe` 改成可注入的、不用 mock axios。這和「資料庫換成測試資料庫、程式碼不變」是同一個精神。

**Testing Library 的關鍵**：用**使用者看得到的方式**找元素（`getByRole("button", { name: "登入" })`、`getByPlaceholderText`），不用 class 名或元件內部的 state。換了 Tailwind class、換了 useState 成 React Hook Form，測試都不用改。這就是為什麼關卡 15 的 `Alert` 要有 `role="alert"`。

### 程式怎麼寫

**1. 假後端（`src/test/server.ts`）**

```ts
export const handlers = [
  http.get("*/api/me", () => HttpResponse.json(fakeUser)),
  http.post("*/api/auth/refresh", () => HttpResponse.json({ access_token: "refreshed-token" })),
];
export const server = setupServer(...handlers);
```

- 這些是「預設行為」。個別測試要模擬 401、500：`server.use(http.get("*/api/me", () => HttpResponse.json({}, { status: 401 })))`，`afterEach` 會還原
- `onUnhandledFrame: "error"`（`setup.ts`）：有請求沒對應的 handler 就讓測試失敗，不會默默打到真的網路（MSW 2 叫 `onUnhandledRequest`，v3 改名）

**2. 攔截器測試（`src/api/client.test.ts`）**

```ts
it("single-flight：同時三個請求 401，只送一次 refresh", async () => {
  useAuthStore.setState({ accessToken: "expired" });
  const calls = acceptOnly("fresh"); // /me 只接受 "fresh"，其他 401；refresh 回 "fresh"

  await Promise.all([getMe(), getMe(), getMe()]);

  expect(calls.refresh).toBe(1);
  expect(calls.me).toBe(6); // 3 次 401 + 3 次重送
});
```

五個測試對應第 8 關攔截器的五條路：帶 token、401 換證重送、single-flight、refresh 失敗清 session、`_retry` 不無限循環。**拿掉 `_retry` 最後一個測試會 timeout，拿掉 single-flight 第三個會紅**，這就是測試的價值：以前只能靠眼睛看 Network。

**3. 元件測試（`src/components/LoginForm.test.tsx`）**

```ts
await user.type(screen.getByPlaceholderText("Password"), "wrong");
await user.click(screen.getByRole("button", { name: "登入" }));

expect(await screen.findByRole("alert")).toHaveTextContent("登入失敗：Incorrect email or password");
expect(screen.getByRole("button", { name: "登入" })).toBeEnabled(); // 關卡 15 修的 bug
```

- `userEvent`：模擬真的打字、點擊（會觸發 React Hook Form 的 onChange 驗證）
- `findByRole`：等到出現為止（有 timeout），因為錯誤訊息是 await 後端回應之後才出現
- 第二個 `expect` 就是關卡 15 修的「失敗後按鈕卡灰」：**先有 bug，再有測試擋它回來**，這是測試最常見的來源

**4. 守門員測試（`src/auth/RequireAuth.test.tsx`）**：用 `MemoryRouter` 在記憶體裡建一張小路由表，設定 store 的三種狀態，看它顯示載入中、導去 `/login`、還是顯示頁面。

### 驗證方式

1. `frontend` 跑 `npm install`，`npm test`：3 個檔案、11 個測試全綠，約 2 秒
2. `npm run test:watch`：改一個檔案自動重跑（開發時開著）
3. `npm run test:coverage`：看哪些檔案沒被測到。`client.ts`、`RequireAuth.tsx`、`LoginForm.tsx` 應該接近 100%
4. **CI**：frontend job 多了「測試（vitest）」
5. `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm run build` 綠

### 動手玩

1. **拿掉 single-flight**：`client.ts` 的 `if (!refreshPromise) {` 改成 `if (true) {`，`npm test`：「single-flight」那個測試紅，`refresh` 被呼叫 3 次。改回來。
2. **拿掉 `_retry`**：`client.ts` 的 `original._retry = true;` 註解掉，`npm test`：「不會無限 refresh」那個測試 timeout（5 秒）。改回來。這兩個就是第 6 關要你用眼睛在 Network 看的事。
3. **把關卡 15 的 bug 放回去**：`LoginForm.tsx` 改回 `setError("root", ...)`，`npm test`：「按鈕恢復可按」那個 expect 紅。這就是回歸測試。改回來。
4. **故意打一個沒有 handler 的 API**：任何測試裡加 `await api.get("/nope")`，MSW 會讓測試失敗並印出「Unhandled request」。這是 `onUnhandledFrame: "error"` 的效果。刪掉。
5. **自己寫一個**：`RegisterForm.test.tsx`，模擬後端回 400「Email already registered」，assert 畫面出現「註冊失敗：Email already registered」。照 `LoginForm.test.tsx` 的樣子寫，十行以內。

### 想一想

<details>
<summary>Q1：為什麼用 MSW 攔截網路，不直接 <code>vi.mock("axios")</code>？</summary>

mock axios 等於「假裝攔截器不存在」：你 mock 掉的正是要測的東西。MSW 讓 axios、攔截器、single-flight 全部真的跑，只有「後端的回應」是假的。測試離真實越近，抓到的 bug 越真。原則：**mock 離你的程式越遠的那一層**。

</details>

<details>
<summary>Q2：為什麼不用 Playwright 做端對端測試就好？它更真實。</summary>

端對端要起後端、資料庫、瀏覽器，一輪幾十秒，而且壞了只知道「登入失敗」，不知道是哪一層。Vitest 兩秒跑完、壞了直接指到那個函式。兩種都要：單元 / 元件測試多而快，端對端少而真（登入、重新整理保持登入這幾條主路徑）。這關先做快的那種；端對端在練習專案要上線前再加。

</details>

<details>
<summary>Q3：測試裡 <code>useAuthStore.setState({ accessToken: "expired" })</code> 直接改 store，這樣算作弊嗎？</summary>

不算，這是「準備測試狀態」（Arrange），和後端測試先 `register()` 再 `login()` 一樣。差別是前端的 store 可以直接設，不用走完整個登入流程，測試更短、更專注在要測的那一件事。但元件測試（`LoginForm`）就真的打字、真的點，因為那正是要測的東西。

</details>

<details>
<summary>Q4：覆蓋率要到 100% 嗎？</summary>

不用。覆蓋率只說「這行被執行過」，不說「這行被檢查過」。有價值的是「會壞的地方有沒有測」：攔截器（邏輯複雜）、守門員（三種狀態）、表單（驗證 + 錯誤顯示）。`NotFoundPage` 這種一行的元件測了也沒意義。看覆蓋率是為了找「漏掉的重要東西」，不是追數字。

</details>

---

## 關卡 17：登入頻率限制（slowapi）✅

**改動的檔案**：`backend/pyproject.toml`（加 `slowapi`）、`uv.lock`、新增 `rate_limit.py`、`config.py`（`RATE_LIMIT_ENABLED`、`AUTH_RATE_LIMIT`、`TRUSTED_PROXY_HOPS`）、`main.py`（接上 limiter、自訂 429 回應、`/api/_ip` 除錯端點）、`routes/auth.py`（login、register 加 `@limiter.limit`）、`.env.example`、`render.yaml`（`TRUSTED_PROXY_HOPS=2`）、`tests/conftest.py`（預設關掉）、新增 `tests/test_rate_limit.py`（共 51 個測試）

### 一句話

**沒有頻率限制，登入端點就是一台免費的密碼猜測機。這關加上「每個 IP 每分鐘 10 次」，但真正的功課是「在兩層代理後面，客戶端 IP 到底是哪一個」。**

### 觀念 1：為什麼 bcrypt 不夠

關卡 13 讓每次比對密碼要花 100 毫秒，攻擊者一秒只能猜 10 次。但他可以開一百條連線同時猜，而且每一次都在消耗你的 CPU（免費方案只有一點點）。頻率限制是「不管你猜對猜錯，一分鐘就是只能來 10 次」，而且在 bcrypt 之前就擋掉，CPU 不用花。

註冊也要限：不然腳本可以灌一堆假帳號把 Neon 的免費額度吃掉。

### 觀念 2：客戶端 IP 不是 `request.client.host`

正式環境的請求路徑：**瀏覽器 → Vercel（rewrite）→ Render（負載平衡）→ 我們的程式**。程式看到的連線來源（`request.client.host`）是 Render 內部的代理，所有使用者都一樣。用它當 key，限制會變成「全站每分鐘 10 次」，第 11 個使用者就登不進去。

代理的慣例是把「它看到的來源」**接在** `X-Forwarded-For` 標頭的最後：

```
X-Forwarded-For: <瀏覽器的 IP>, <Vercel 出口 IP>
```

那直接拿最左邊？不行：**最左邊是任何人都能自己填的**（`curl -H "X-Forwarded-For: 1.2.3.4"`），攻擊者每次換一個假 IP 就繞過了。只有代理接上去的那幾段可信。所以 `rate_limit.py` 的規則是：

> 從右邊數，跳過 `TRUSTED_PROXY_HOPS` 層可信的代理，取下一段。本機 0（用連線來源）、只有 Render 1、Vercel + Render 2。

| 情境 | `X-Forwarded-For` | hops | 取到 |
| --- | --- | --- | --- |
| 本機 | 沒有 | 0 | `request.client.host` |
| 本機但有人自己填 | `1.1.1.1` | 0 | 不理它，`request.client.host` |
| 正式，經 Vercel | `瀏覽器, Vercel` | 2 | 瀏覽器 ✓ |
| 正式，攻擊者塞假 IP 再經 Vercel | `假, 瀏覽器, Vercel` | 2 | 瀏覽器 ✓（假的在更左邊，數不到） |
| 正式，直接打 Render 網址 | `瀏覽器` | 2 | 段數不夠，退回連線來源（Render 代理的 IP） |

最後一列是已知的限制：直接打 Render 網址的人會被算成同一個 IP（互相影響），而且塞兩段假 IP 可以繞過。要堵這條路得讓 Render 只接受來自 Vercel 的流量，免費方案做不到；實務上通常靠 Cloudflare 這類前置層。**設定 hops 前先確認實際的標頭長什麼樣**：打開 `ENABLE_DEBUG_ENDPOINTS` 看 `/api/_ip`，從前端網址打一次、直接打 Render 網址一次，比較兩者。

### 觀念 3：限制的狀態存哪

slowapi 預設存在記憶體：**單一實例**沒問題（免費方案就是一台，而且重啟就歸零也無所謂）。如果之後開兩台以上，每台各自計數，上限就變成兩倍，要改 `storage_uri` 指向 Redis（Upstash 有免費方案）。這和「session 存記憶體 vs 存 Redis」是同一個問題。

### 程式怎麼寫

**1. 誰算同一個人（`rate_limit.py`）**

```python
limiter = Limiter(key_func=get_client_ip, headers_enabled=True, enabled=settings.rate_limit_enabled)
```

**2. 哪些端點（`routes/auth.py`）**

```python
@router.post("/login", response_model=Token)
@limiter.limit(settings.auth_rate_limit)   # "10/minute"
async def login(request: Request, data: UserLogin, response: Response, ...):
```

slowapi 要求端點有 `request` 參數（拿 IP）和 `response` 參數（塞 `X-RateLimit-*` 標頭）。`register` 原本沒有 `response`，第一次跑測試就炸了：「parameter `response` must be an instance of starlette.responses.Response」，這是它最常見的錯誤訊息。

**3. 超過時回什麼（`main.py`）**

slowapi 內建的 429 回 `{"error": ...}`，前端的 `getErrorMessage` 讀的是 `detail`，所以自己寫 handler 回 `{"detail": "請求太頻繁，請稍後再試（上限 10 per 1 minute）"}` 並補上 `Retry-After`。前端一行都不用改，登入表單會直接顯示這句話。

**4. 測試（`tests/test_rate_limit.py`）**

所有測試都從同一個 IP 打登入，不關掉限制會被自己擋，所以 `conftest.py` 預設 `limiter.enabled = False`；要測限制本身的測試用 fixture 暫時打開並 `limiter.reset()`。`get_client_ip` 用假的 `Request` 物件直接測上面那張表的每一列，不用起伺服器。

### ⚠️ 開始前（正式環境）

`render.yaml` 多了 `TRUSTED_PROXY_HOPS=2`。Blueprint 有時不會自動同步新的環境變數：部署後到 Render → Environment 確認有這個值，沒有就手動加。

> 付費門檻提醒：Vercel 自己也有「Firewall → Rate Limiting」，但那是 Pro 方案（付費）的功能，這關的做法在免費方案就能用。Cloudflare 的免費方案有基本的 rate limiting 規則，但要自訂網域（學習者決定不買），所以也不用。

### 驗證方式

1. **本機**：`uv run pytest -q` 51 個測試綠；啟動後端，用 curl 連打登入 11 次，第 11 次是 429，回應有 `Retry-After` 和 `X-RateLimit-Remaining`：
   ```bash
   for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:8000/api/auth/login -H 'content-type: application/json' -d '{"email":"a@b.com","password":"x"}'; done
   ```
2. **前端**：登入頁密碼亂打 11 次，第 11 次出現「登入失敗：請求太頻繁，請稍後再試」。一分鐘後恢復
3. **正式環境 hops 對不對**：Render → Environment 暫時 `ENABLE_DEBUG_ENDPOINTS=true` → 開 `https://<前端網址>/api/_ip`：`x_forwarded_for` 應該有兩段，`rate_limit_key` 是你自己的 IP（可以用搜尋「my ip」對照）。再直接開 `https://<Render 網址>/api/_ip` 看差別。看完關掉
4. **正式環境真的會擋**：手機 4G 開前端，密碼亂打 11 次 → 429；換到 Wi-Fi（不同 IP）→ 不受影響

### 動手玩

1. **把 hops 設錯**：本機 `.env` 加 `TRUSTED_PROXY_HOPS=1`，用 curl 帶 `-H "X-Forwarded-For: 1.2.3.4"` 打登入 11 次 → 429；再帶 `-H "X-Forwarded-For: 5.6.7.8"` → 又可以打 10 次。這就是「hops 比實際代理層數多，攻擊者就能自己換 IP」。刪掉那行。
2. **改上限**：`.env` 加 `AUTH_RATE_LIMIT=3/minute`，第 4 次就 429。slowapi 的格式還有 `100/hour`、`5/second`、`10/minute;100/hour`（兩個同時）。刪掉。
3. **拿掉 `response` 參數**：`routes/auth.py` 的 login 把 `response: Response` 暫時改名，跑一次登入會看到那句「must be an instance of starlette.responses.Response」。改回來。
4. **看 conftest 的作用**：`conftest.py` 的 `limiter.enabled = False` 註解掉，`uv run pytest -q` 會有一堆 429 的失敗。改回來。
5. **把限制關掉看差別**：`.env` 加 `RATE_LIMIT_ENABLED=false`，連打 20 次都是 401。這是本機壓力測試時用的開關。刪掉。

### 想一想

<details>
<summary>Q1：為什麼用 IP 當 key，不用 email？攻擊者換 IP 就繞過了。</summary>

兩種各擋一種攻擊：IP 擋「一個人猜很多帳號」，email 擋「很多人（殭屍網路）猜同一個帳號」。完整做法是兩個都限（IP 每分鐘 10 次、同一個 email 每分鐘 5 次）。這關只做 IP，因為 slowapi 的 key 在讀 request body 之前就要決定，用 email 當 key 要自己寫 middleware。練習專案如果做，記得 email 的限制觸發時**不要**告訴使用者「這個帳號被鎖了」，那會洩漏帳號存在。

</details>

<details>
<summary>Q2：429 和 401 的順序：被限制時，密碼正確也回 429，會不會讓正常使用者困擾？</summary>

會，但這是刻意的。如果「密碼正確就放行」，攻擊者只要猜中就能進來，限制形同虛設。正常使用者一分鐘打錯 10 次密碼的機率很低，而且訊息有說「請稍後再試」。

</details>

<details>
<summary>Q3：為什麼 <code>get_client_ip</code> 要寫成「從右邊數」而不是「最左邊」？網路上很多範例都取最左邊。</summary>

取最左邊的範例假設「前面有一層會**覆寫**（不是接上）標頭的代理」，例如 Cloudflare 會提供獨立的 `CF-Connecting-IP`。我們的 Vercel 和 Render 都是「接上」，最左邊就變成使用者自己能填的。原則：**只信任你知道的那幾層代理接上去的段，其他都當成使用者輸入**。

</details>

<details>
<summary>Q4：記憶體計數重啟就歸零，免費方案的 Render 動不動就休眠，這樣限制不是常常失效？</summary>

休眠是閒置 15 分鐘才發生，而攻擊進行中服務不會閒置，所以攻擊期間計數是穩定的。歸零的時機剛好是「沒人在打」的時候，影響很小。真的在意就換 Redis。

</details>

---

## 關卡 18：SQL 與資料庫（看 ORM 底下）✅

**改動的檔案**：新增 `docs/labs/18-sql.sql`（實驗腳本）。程式沒有改：這關的目的是把你一直透過 SQLModel 在用、但沒親眼看過的東西攤開來。

### 一句話

**ORM 不是資料庫，它只是幫你產生 SQL。索引為什麼快、交易在鎖什麼、N+1 為什麼慢，都要看 SQL 本身才懂。AI 寫出來的查詢「能跑」很容易，「資料多了還快」要靠你自己看得懂執行計畫。**

### ⚠️ 開始前

1. 實驗會灌 5 萬個假帳號，**只在測試資料庫做**：Neon 的 `jwtdemo_test`（關卡 4 建的），或本機 Postgres。不要碰正式的。
2. 工具二選一：Neon 後台的 SQL Editor（左上角選資料庫，貼一段按 Run），或 `psql`（有裝的話：`psql "<TEST_DATABASE_URL 原始格式>"`）。第 5 步的鎖需要兩個視窗，Neon SQL Editor 開兩個瀏覽器分頁就行。
3. 想看程式平常送出什麼 SQL：`backend/.env` 暫時加 `DB_ECHO=true`，重啟後端，terminal 會印出每一句。看完改回來。

### 先認識幾個名詞（不然 Neon 的畫面會看不懂）

- **系統表**：`pg_indexes`、`information_schema.columns` 不是我們建的表，是 Postgres 自己維護的「管理員帳本」，記的是「這個資料庫有哪些表、欄位、索引」。Neon 左邊的 Tables 清單不會列它們，直接 `SELECT` 就有。
- **Neon 的 Tables 頁面**（點某張表會看到 Columns / Constraints / Indexes）：就是這些系統表畫成表單。Columns 對應 `models.py` 的屬性；Constraints 的 `*_fkey` 對應 `foreign_key="user.id"`、`*_pkey` 是主鍵；Indexes 對應 `index=True` / `unique=True`。**不要按 Add column / Add index**：結構由 Alembic 管，手動改會讓 `alembic check` 紅。
- **名字從哪來**：表名 `user` 是 class `User` 轉小寫（SQLModel）；索引名 `ix_user_email` 是 SQLAlchemy 看到 `index=True` 自動取的 `ix_<表>_<欄位>`；`refreshtoken_pkey`、`refreshtoken_user_id_fkey` 是 Postgres 自己的預設（`<表>_pkey`、`<表>_<欄位>_fkey`）。程式碼裡沒有任何一行寫過這些名字，但每一個都能往回找到 `models.py` 的一行和 `migrations/versions/0001` 的一句。
- **`EXPLAIN ANALYZE` 要看哪個時間**：結果最後一行的 `Execution Time` 才是資料庫執行的時間；SQL Editor 自己顯示的「Query executed in xxx ms」包含到新加坡的網路來回，不要看。第一行的 `Index Scan` / `Seq Scan` 是「翻目錄」還是「一頁一頁翻」。

### 觀念 1：ORM 底下就是 SQL

`DB_ECHO=true` 之後登入一次，你會看到大概四句（每句下面跟著一行 `[generated in ...] (參數...)`，那是真正送進去的值）：

```sql
SELECT ... FROM "user" WHERE "user".email = $1          -- select(User).where(User.email == data.email)
DELETE FROM refreshtoken WHERE user_id = $1 AND expires_at < $2   -- delete_expired_refresh_tokens
INSERT INTO refreshtoken (...) VALUES (...)              -- issue_refresh_token
UPDATE "user" SET last_login_at = $1 WHERE id = $2       -- user.last_login_at = ...（commit 時才送）
COMMIT
```

`$1`、`$2` 是**參數**：值不是拼進字串，是另外送，這就是 ORM 幫你擋掉 SQL injection 的方式。每一句 Python 對應哪一句 SQL，能對得上，ORM 就不再是黑盒子。

### 觀念 2：索引是「另外維護的目錄」

| 這個專案的索引 | 對應程式裡的哪一句 | 沒有它會怎樣 |
| --- | --- | --- |
| `ix_user_email`（unique） | 登入、註冊查 email | 每次登入翻完整張 user 表 |
| `ix_refreshtoken_token_hash`（unique） | refresh、logout 查 token | 每次 refresh 翻完整張 token 表（量是 user 的好幾倍） |
| `ix_refreshtoken_user_id` | 登出所有裝置、清過期 token | 每次翻完整張 token 表 |
| 兩張表的主鍵 | `session.get(User, id)` | 自動有，不用管 |

原理：索引是照某個欄位**排好序**的另一份資料（B-tree），所以可以像翻字典一樣跳著找，而不是一頁一頁翻（Seq Scan）。代價是每次寫入都要多維護一份，所以**不是每個欄位都加**。實驗第 3 步會讓你親眼看到兩者差幾十到幾百倍。

**索引會失效的常見原因**：對欄位套函式（`lower(email)`）、用 `LIKE '%xxx'` 開頭是萬用字元、型別不一致。實驗第 3 步第二句就是函式讓索引失效的例子。

**什麼時候要加**：`WHERE`、`JOIN ... ON`、`ORDER BY` 裡常用的欄位，而且表會長大。練習專案的 `todo.user_id`、`todo.category_id` 一定要（外鍵欄位預設**沒有**索引，Postgres 不會幫你加）。

### 觀念 3：交易與鎖，refresh 的 `with_for_update()` 在擋什麼

交易（transaction）：一組操作要嘛全部成功、要嘛全部不算。`refresh` 裡「舊 token 標記 revoked + 發新 token」是一組，中間斷掉不能只做一半，所以兩句之後才一次 `commit()`。

鎖：`SELECT ... FOR UPDATE` 把那一列鎖住到 commit 為止，第二個同時進來的請求會**等**。沒有它，兩個請求同時讀到 `revoked = false`，兩個都換發成功，關卡 1 的重複使用偵測就失效了。實驗第 5 步用兩個視窗可以親眼看到「卡住」。

關卡 1 踩的 `MissingGreenlet` 也在這裡：commit 之後 ORM 把物件標成「過期」，再讀屬性會偷偷發一句 `SELECT`，在 async 裡這是不被允許的，所以 commit 前先把值存進變數。

### 觀念 4：N+1 和連線池

**N+1**：查 20 個使用者（1 次），再每個使用者查一次 token 數（20 次），總共 21 趟網路來回。Neon 在新加坡，每趟幾十毫秒，20 個就是一秒。ORM 很容易寫成這樣（`for user in users: user.tokens`）。解法是一句 `JOIN + GROUP BY`（實驗第 4 步），或 ORM 的 eager loading（`selectinload`）。練習專案「待辦列表顯示分類名稱」就是典型的 N+1 陷阱。

**連線池**（`database.py`）：每個請求不是重新連資料庫（要 TLS 握手、認證，幾十毫秒），而是從池子拿一條現成的。免費方案的 Neon 連線數上限很小，`pool_pre_ping` 是確認拿到的連線還活著（關卡 10），關機時 `engine.dispose()` 是把連線好好還回去（關卡 13）。

### 驗證方式

照 `docs/labs/18-sql.sql` 的 7 步做完，你應該能回答：

1. `EXPLAIN ANALYZE` 的第一行，`Index Scan` 和 `Seq Scan` 分別長什麼樣，`Execution Time` 差多少
2. 拔掉 `ix_refreshtoken_token_hash` 之後，同一句查詢慢了幾倍
3. 兩個分頁的 `FOR UPDATE`，第二個分頁是在哪一刻解開的（B 的 `finished - started` 是幾秒）
4. 第 4 步的 JOIN 一句和「21 句」在來回次數上的差別
5. 最後 `user` 和 `refreshtoken` 的筆數回到實驗前

### 動手玩

1. **讓登入變慢**：在測試資料庫拔掉 `ix_user_email`（`DROP INDEX ix_user_email;`），用 `TEST_DATABASE_URL` 當 `DATABASE_URL` 起後端，看 request log 的 `duration_ms`。登入從幾毫秒變幾十毫秒（5 萬筆）。建回來：`CREATE UNIQUE INDEX ix_user_email ON "user" (email);`。
2. **用程式的方式加索引**：`models.py` 的 `RefreshToken.expires_at` 加 `index=True`，`uv run alembic revision --autogenerate --rev-id 0005 -m "index expires_at"`，看產生的遷移檔只有一行 `create_index`。**不要合併**，這是練習「改了 models 就要有遷移」的流程；看完 `git checkout -- .` 並刪掉產生的檔案。（想一想 Q1 會說為什麼不真的加。）
3. **看 ORM 送什麼**：`DB_ECHO=true`，前端按「重新取得我的資料」、改密碼、登出所有裝置，對照 terminal 的 SQL 和 `routes/auth.py` 的程式碼，每句找到對應。
4. **故意寫一個 N+1**：Python 殼（`uv run python`）裡用 `async with AsyncSession(engine)` 查 20 個 user，再迴圈每個查 `count(RefreshToken)`，打開 `DB_ECHO` 數有幾句 SQL。再用一句 `select(User.email, func.count(RefreshToken.id)).join(...).group_by(User.id)` 做同樣的事，數一次。
5. **pgexercises.com**：免費、瀏覽器裡直接練 Postgres，從 Basic 做到 Joins 就夠練習專案用。一天一節。

### 想一想

<details>
<summary>Q1：為什麼 <code>delete_expired_refresh_tokens</code> 查 <code>expires_at</code>，卻不替它加索引？</summary>

因為那句還有 `user_id = ?`，已經走 `ix_refreshtoken_user_id`，縮到「這個使用者的幾筆」之後再看 `expires_at`，筆數個位數，索引沒意義，反而每次寫入多維護一份。**索引是給「縮小範圍」的那個條件用的**。什麼時候要：如果改成全站排程清理（`WHERE expires_at < now()` 沒有 user_id），那就要加。

</details>

<details>
<summary>Q2：email 的索引是 unique，這和程式裡「先查再寫」有什麼關係？</summary>

關卡 13 修的競態：兩個請求同時註冊同一個 email，程式層的「先查不存在再寫入」擋不住，真正守住唯一性的是這個 unique 索引，它會讓第二個 `INSERT` 失敗（`IntegrityError`）。所以**唯一性永遠要在資料庫層宣告**，程式層的檢查只是為了給使用者友善的訊息。

</details>

<details>
<summary>Q3：測試的 <code>conftest.py</code> 用 <code>TRUNCATE ... CASCADE</code>，CASCADE 是什麼？</summary>

`refreshtoken.user_id` 是指向 `user.id` 的外鍵。清空 `user` 時，如果 `refreshtoken` 還有列指著它，資料庫會拒絕（保護參照完整性）。`CASCADE` 是「連同指著它的也一起清」。這也是為什麼實驗第 7 步要先刪 token 再刪 user。練習專案的 `todo` 指向 `category`，刪分類時要先決定：連同待辦一起刪、還是把待辦的分類設成 NULL、還是拒絕刪除（外鍵的 `ON DELETE` 選項）。

</details>

<details>
<summary>Q4：為什麼不要 <code>SELECT *</code>？程式裡 <code>select(User)</code> 不就是嗎？</summary>

兩層原因。效能：欄位多、有大欄位（長文字、JSON）時，只取需要的欄位省很多傳輸。穩定：之後加欄位，`SELECT *` 的回傳形狀會悄悄變。`select(User)` 在這個專案可以接受，因為表很小、而且 ORM 需要整個物件；練習專案的「列表頁」只需要 id、title、done，就該 `select(Todo.id, Todo.title, Todo.done)`。

</details>

---

## 關卡 19：HTTP 與瀏覽器規則 ✅

**改動的檔案**：`backend/main.py`（所有 `/api` 回應加 `Cache-Control: no-store`）、`backend/tests/test_health.py`（加一個測試，共 52 個）。其餘是用 curl 和 DevTools 動手。

### 一句話

**關卡 10 踩的每一個坑（cookie 不帶、CORS、拿到 HTML 不是 JSON）都不是 FastAPI 或 React 的問題，是 HTTP 和瀏覽器的規則。這些規則換任何技術棧都一樣，而且 AI 常常答錯，值得自己弄清楚。**

### 觀念 1：一個請求、一個回應，各有三層

```
POST /api/auth/login HTTP/1.1          ← 請求行：方法、路徑
Host: localhost:5173                    ← 標頭：給中間人和伺服器看的資訊
Content-Type: application/json
Cookie: refresh_token=...               ← 瀏覽器自動帶，程式碼裡看不到
                                        ← 空行
{"email":"a@b.com","password":"..."}    ← 內容（body）

HTTP/1.1 200 OK                         ← 狀態行
Set-Cookie: refresh_token=...; HttpOnly; Path=/api/auth; SameSite=Lax
X-Request-ID: 3f2a...                   ← 關卡 11 加的
Cache-Control: no-store                 ← 這關加的

{"access_token":"...","token_type":"bearer"}
```

看得懂這張圖，DevTools 的 Network 分頁就全看得懂：Headers 頁籤是標頭、Payload 是請求內容、Response 是回應內容、Cookies 是哪些 cookie 被帶上或設定。

### 觀念 2：這個專案用到的狀態碼，各代表什麼決定

| 碼 | 哪裡用 | 意思 | 為什麼是這個不是別的 |
| --- | --- | --- | --- |
| 200 | 大多數成功 | 成功、有內容 | |
| 201 | 註冊 | 成功、而且**建立**了東西 | 讓呼叫端知道有新資源 |
| 204 | 登出 | 成功、沒內容 | 不用回 body，省一次 JSON |
| 400 | email 重複、目前密碼錯 | 你送的東西有問題 | 改密碼時目前密碼錯**不能**用 401，攔截器會以為 token 過期去 refresh（關卡 3） |
| 401 | 沒 token、token 過期、密碼錯 | 你是誰我不認得 | 前端攔截器的觸發條件，所以只能用在「身分」問題 |
| 404 | 別人的資料、關掉的除錯端點 | 沒這東西 | 練習專案的授權檢查回 404 不回 403：403 等於告訴對方「有這筆，但不是你的」 |
| 422 | Pydantic 驗證失敗 | 格式不對 | FastAPI 預設；前端 `getErrorMessage` 會解它的陣列格式 |
| 429 | 頻率限制 | 太頻繁 | 帶 `Retry-After` |
| 500 | 沒接住的例外 | 我壞了 | middleware 保證有 log（關卡 11） |

原則：**狀態碼是給程式（攔截器、監控）看的決定，`detail` 才是給人看的文字**。選錯狀態碼會讓攔截器做錯事，關卡 3 的 400 vs 401 就是例子。

### 觀念 3：cookie 的五個屬性，各擋什麼

`routes/auth.py` 的 `set_refresh_cookie`：

| 屬性 | 值 | 擋什麼 | 設錯會怎樣 |
| --- | --- | --- | --- |
| `HttpOnly` | 開 | JS 讀不到 | XSS 一行 `document.cookie` 就把 refresh token 拿走 |
| `Secure` | 正式環境開 | 只走 HTTPS | 本機 http 開了 cookie 根本設不進去（關卡 10 的坑） |
| `SameSite` | `Lax` | 跨站請求不帶 | 設 `None` 等於放棄 CSRF 保護；跨站又要 `Lax` 就會不帶（關卡 10 同站的理由） |
| `Path` | `/api/auth` | 只有這個路徑開頭的請求才帶 | 設 `/` 每個請求都帶著 refresh token 滿天飛；設 `/auth` 對不上 `/api/auth`，refresh 永遠拿不到（故障演練第 6 條） |
| `Max-Age` | 7 天 | 多久過期 | 不設就是 session cookie，關瀏覽器就沒了，「關掉再開還在」做不到 |

刪 cookie（logout）時 `Path` 要和設定時**一模一樣**，否則瀏覽器當成另一個 cookie、刪不掉。

### 觀念 4：CORS 不是安全機制，是瀏覽器的「同源」規則

瀏覽器規定：網頁只能讀「同源」（協定 + 網域 + port 都一樣）的回應。`localhost:5173` 打 `localhost:8000` 就不同源，請求會送出去（伺服器真的收到、真的處理），只是**瀏覽器不讓 JS 讀回應**，除非伺服器回 `Access-Control-Allow-Origin` 說可以。

所以兩件事要分清楚：

- CORS 擋的是「瀏覽器裡的 JS 讀回應」，curl、Postman、別的伺服器完全不受影響。**它不保護你的 API**，保護的是使用者（防止惡意網站用使用者的 cookie 偷讀別站資料）。
- 這個專案同站之後（Vite proxy、Vercel rewrites），瀏覽器看到的永遠是同源，所以 `CORSMiddleware` 平常用不到，留著只是給「直接打後端」的除錯情境。

### 觀念 5：快取，這關加的那一行

瀏覽器、Vercel 的 CDN、公司的 proxy 都可能把 **GET** 的回應存起來下次直接給。`/api/me` 被存起來，同一台電腦換人登入，或同一個 proxy 後面的另一個人，就會拿到上一個人的資料。所以 `main.py` 的 middleware 對所有 API 回應加：

```python
response.headers.setdefault("Cache-Control", "no-store")
```

`no-store` 是「連存都不要存」，比 `no-cache`（可以存，但每次用之前要問伺服器）更嚴。登入相關的 API 一律 `no-store` 是業界慣例。`setdefault` 讓之後個別端點想設不同的值（例如公開的列表允許快取 60 秒）可以自己覆蓋。靜態檔（Vite 打包出來的 JS、CSS）是相反的：檔名帶 hash（`index-DAu28CMg.js`），可以永久快取，改了程式檔名就變，這就是關卡 15 切 vendor chunk 的理由。

### 驗證方式

下面的指令在 PowerShell 用 `curl.exe`（Windows 內建），macOS / Linux 用 `curl`。後端先起來。

1. **看完整的請求與回應**（`-v`）：
   ```bash
   curl -v -X POST localhost:8000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"你的帳號\",\"password\":\"你的密碼\"}"
   ```
   `>` 開頭是請求、`<` 開頭是回應。找到 `Set-Cookie` 那行，對照觀念 3 的五個屬性；找到 `Cache-Control: no-store` 和 `X-Request-ID`。
2. **cookie 怎麼來回**：加 `-c jar.txt` 存 cookie，再用 `-b jar.txt -X POST localhost:8000/api/auth/refresh`，看回應 200 和新的 `Set-Cookie`。再打一次同一個舊 cookie（`jar.txt` 已更新所以要先備份一份），看 401「Refresh token reused」。這是關卡 1 的重複使用偵測，用 curl 最清楚。
3. **Path 的效果**：`-b jar.txt localhost:8000/api/me` 的請求（`-v`）裡**沒有** `Cookie:` 標頭，因為路徑不是 `/api/auth` 開頭；refresh 的請求才有。
4. **CORS 只擋瀏覽器**：curl 打 `localhost:8000` 什麼都正常；前端 `.env` 設 `VITE_API_URL=http://localhost:8000/api`（直接打後端）重啟，瀏覽器 Console 出現 CORS 錯誤（因為 `CORS_ORIGINS` 預設是 `http://localhost:5173`，對上的話其實會過；改成 `127.0.0.1:5173` 開網頁就會被擋）。刪掉那行。
5. **快取標頭**：DevTools → Network 點 `/api/me` → Response Headers 有 `cache-control: no-store`；`uv run pytest -q` 52 個綠。

### 動手玩

1. **狀態碼選錯會怎樣**：`routes/auth.py` 的 change_password 把「目前密碼錯誤」的 400 改成 401。前端改密碼時故意打錯目前密碼：Network 會看到 401 → 攔截器去 `refresh` → 重送 → 又 401 → 顯示「登入已過期」然後被登出。改回 400。這就是「狀態碼是給攔截器看的」。
2. **SameSite 的實驗**：`set_refresh_cookie` 的 `samesite="lax"` 改成 `"strict"`。從別的網站（例如在 Google 搜尋結果）點連結進你的網站，第一次載入 refresh 不會帶 cookie，看起來像沒登入，重新整理才正常。`Strict` 比 `Lax` 嚴在「從外站連過來的 GET 也不帶」。改回來。
3. **Path 設錯**：`path="/api/auth"` 改成 `"/auth"`，登入後重新整理掉登入；DevTools → Application → Cookies 看得到 cookie，但 `/api/auth/refresh` 的 Request Headers 沒有 `Cookie`。這是故障演練第 6 條。改回來。
4. **拿掉 no-store**：註解掉那行，`uv run pytest -q` 紅一個。這是「先有規則，再用測試守住」。改回來。
5. **MDN 三篇**：HTTP cookies、CORS、HTTP caching。每篇 20 分鐘，讀完回頭看觀念 3～5 應該全部對得上。

### 想一想

<details>
<summary>Q1：既然 CORS 不保護 API，API 的安全靠什麼？</summary>

靠認證（token）和授權（這筆資料是不是你的）。任何人都能用 curl 打你的 API，所以每個端點都要假設「對方不是瀏覽器、什麼標頭都能偽造」。CORS 和 SameSite 保護的是「瀏覽器裡的使用者不被惡意網站利用」，是另一個層次的事。

</details>

<details>
<summary>Q2：access token 放 Authorization 標頭，refresh token 放 cookie，為什麼不都放同一邊？</summary>

cookie 是瀏覽器自動帶的，這是優點（重新整理後還在）也是風險（CSRF：別的網站也能讓瀏覽器帶著你的 cookie 送請求）。所以只把「只在 `/api/auth` 路徑用、而且 `SameSite=Lax`」的 refresh token 放 cookie，影響範圍最小；access token 放標頭，要 JS 主動加，別的網站加不了。兩種放法各取所長。

</details>

<details>
<summary>Q3：Vercel 的 rewrite 是 302 轉址嗎？</summary>

不是。轉址（301/302）是回給瀏覽器說「你去別的網址」，瀏覽器會真的換網址，變成跨站。rewrite 是 Vercel **自己**去打 Render 再把回應給瀏覽器，瀏覽器從頭到尾只看到 `*.vercel.app`。這就是反向代理，同站的關鍵。DevTools 裡看不到 Render 的網址，就是因為這樣。

</details>

<details>
<summary>Q4：為什麼 GET 不該有副作用？</summary>

因為中間人（瀏覽器預先載入、CDN、爬蟲）都假設 GET 可以隨便重送、可以快取。如果 `GET /api/auth/logout` 能登出，瀏覽器的連結預覽就可能把你登出。所以登出是 POST，改資料是 POST / PUT / PATCH / DELETE。練習專案的每個端點選方法時照這個原則。

</details>

---

## 關卡 20：讀 log 與除錯（故障演練）✅

**改動的檔案**：新增 `docs/drills/`（5 個故障 patch + 說明）。程式沒有改。

### 一句話

**AI 說「修好了」，你要能自己確認。這關把除錯變成一套固定流程，然後用五個真的壞掉的版本練：靠症狀、log 和測試找出原因，而不是靠猜。這是你指揮 AI 時唯一無法外包的能力。**

### 觀念 1：除錯的固定流程（照順序，不要跳）

1. **先問「哪一段壞」，再問「為什麼壞」**。`DEBUGGING.md` 開頭的三個通用動作：看 log、看 Network、分段確認（後端活著嗎 → 前端打得到後端嗎 → 登入流程哪一步 4xx/5xx）。九成的問題在分段確認時就定位了。
2. **看錯誤訊息的最後幾行**。Python 的 traceback 由上往下是呼叫鏈，**最後一行**是真正的錯誤、**倒數第二段**是你的程式裡出事的那行。前端 Console 一樣，紅字的第一行通常就是答案。
3. **重現**。能穩定重現才算定位。「有時候會」要先找到讓它每次都發生的條件（例如：等 token 過期、同時發三個請求）。
4. **縮小範圍**。一次只改一個變數：把前端拿掉用 curl 打後端；把 Vercel 拿掉直接打 Render；把資料庫換成測試資料庫。哪一步症狀消失，問題就在那一層。
5. **用工具抓，不要用眼睛掃**。`pytest`、`npm test`、`alembic check`、`pyright`、`git diff`、`git bisect`。每種工具抓一類錯（觀念 3）。
6. **修完要能說出根本原因**，而且加一個測試或一條 `DEBUGGING.md`，同樣的事不會再花第二次時間。

### 觀念 2：這個專案的 log 怎麼讀

本機是文字、正式環境是 JSON（`LOG_JSON=true`），欄位一樣：

```json
{"level": "INFO", "logger": "app", "message": "request", "request_id": "3f2a9c1b0e4d",
 "method": "POST", "path": "/api/auth/login", "status": 401, "duration_ms": 112.4}
```

| 看什麼 | 怎麼用 |
| --- | --- |
| `status` | 搜 `"status": 500` 找爆掉的；`"status": 401` 一大堆代表 token 或 cookie 有問題 |
| `duration_ms` | 登入 100 毫秒上下是 bcrypt 的正常值；1 毫秒代表根本沒比對（關卡 13 的 timing）；幾秒代表資料庫或冷啟動 |
| `request_id` | 使用者回報時請他給回應標頭的 `X-Request-ID`，直接搜這一筆；前後端串起來的關鍵 |
| `level: ERROR` + traceback | middleware 保證沒接住的例外一定記下來（關卡 11）。先看最後一行 |
| `path` 的分布 | 同一個 IP 一分鐘幾十次 `/api/auth/login` 是攻擊或是 bug（關卡 17） |

正式環境：Render → Logs，搜尋欄直接打欄位；Sentry 收沒接住的例外。本機：跑 uvicorn 的 terminal。看不到你以為會有的 log，先確認 `LOG_LEVEL` 和「例外有沒有被誰接住」。

### 觀念 3：哪個工具抓哪種錯

| 錯誤類型 | 誰抓得到 | 誰抓不到 |
| --- | --- | --- |
| 型別、`None` 當值用 | pyright、tsc | 測試（沒走到那行） |
| 行為改壞（cookie 路徑、簽章） | pytest、vitest | lint |
| 改了 models 沒遷移 | `alembic check`（CI 有） | pytest（測試用 `create_all`） |
| 時間、效期、頻率 | **幾乎只有眼睛**：Network、log 的時間戳 | 測試通常不等 30 分鐘 |
| 正式環境才有的（代理、環境變數） | `/api/health`、`/api/_ip`、Render log | 本機全部綠 |

演練的五題就是照這張表設計的：有的測試會紅，有的**全部綠但東西壞了**。知道哪一種是哪一種，才知道什麼時候要相信 CI、什麼時候要自己開瀏覽器看。

### ⚠️ 開始前

- 後端、前端都能在本機跑；`uv run pytest -q`、`npm test` 現在是綠的（這是基準線）。
- `docs/drills/README.md` 有操作方式。**不要先看 patch 檔的內容**，`git status` 看它改了哪個檔案是允許的提示。
- 每題給自己 20 分鐘；找不到就看答案，重點是學「找的方法」，不是找到。

### 演練

| 題 | 套上 | 症狀（你會看到的） | 提示 |
| --- | --- | --- | --- |
| 1 | `docs/drills/01.patch` | 登入成功，**重新整理後掉登入** | 先分段：是 refresh 沒送、送了被拒、還是回了但前端沒收？DevTools → Application → Cookies 和 Network 的 Request Headers 各看一眼 |
| 2 | `docs/drills/02.patch` | 登入後一切正常，但 Network 裡 **`refresh` 多得不正常**；`pytest` 全綠 | 時間相關的東西測試抓不到。看 `refresh` 之間隔幾秒；用 jwt.io 貼 access token 看 `exp` |
| 3 | `docs/drills/03.patch` | 本機 `pytest` 全綠、程式正常；但 **CI 紅**（或正式環境登入 500） | 哪一步紅？本機跑同一個指令 |
| 4 | `docs/drills/04.patch` | 登入成功後**立刻**被登出，提示「登入已過期」；`pytest` 有紅 | 看 `/api/me` 的回應 `detail`；登入和 refresh 都 200 但 `/me` 401，問題在「驗」不在「簽」 |
| 5 | `docs/drills/05.patch` | 等 access token 過期後（`JWT_EXPIRE_MINUTES=1`）**按一下畫面就被登出**；後端 log 有 `Refresh token reused` | 後端說「重複使用」，但你沒有兩個分頁。前端有幾個 `refresh` 請求？`npm test` 說什麼？ |

做完每一題記下三件事：你先看了哪裡、第幾步定位到、哪個工具（或眼睛）抓到的。這就是 `QUESTIONS.md` 的素材。

### 答案

<details>
<summary>第 1 題</summary>

**原因**：`routes/auth.py` 的 `set_refresh_cookie` 把 `path` 從 `/api/auth` 改成 `/auth`。cookie 設得進去（Application 分頁看得到），但請求路徑 `/api/auth/refresh` 不是以 `/auth` 開頭，瀏覽器不帶，refresh 回 401「No refresh token」。
**哪個工具抓到**：`pytest` 紅一個（httpx 的 cookie jar 也照 Path 規則）；DevTools 的 Request Headers 沒有 `Cookie`。
**對應**：故障演練清單第 6 條、`DEBUGGING.md`「cookie 看得到但 refresh 沒帶」、關卡 19 觀念 3。

</details>

<details>
<summary>第 2 題</summary>

**原因**：`security.py` 的 `timedelta(minutes=...)` 變成 `timedelta(seconds=...)`，access token 30 秒就過期。功能全部正常（攔截器每次都成功換證），只是每 30 秒多一次 refresh，流量變好幾倍，而且每次 refresh 都在輪替、寫資料庫。
**哪個工具抓到**：**沒有**。52 個測試全綠，因為沒有測試在等 token 過期。只有看 Network 的時間間隔、或 jwt.io 解開 token 看 `exp - iat` 才看得到。這是「全綠但壞了」的典型，也是為什麼上線後要看 log 的 `path` 分布。
**對應**：故障演練清單第 14 條。要讓測試抓到，可以加一個單元測試解開 token 檢查 `exp - iat` 等於設定的分鐘數。

</details>

<details>
<summary>第 3 題</summary>

**原因**：`models.py` 的 `User` 多了 `nickname` 欄位，沒有產生遷移檔。本機測試用 `create_all` 建表，表裡有這個欄位，全綠；正式資料庫是用遷移建的，沒有這個欄位，`SELECT ... nickname` 直接 500 `column user.nickname does not exist`。
**哪個工具抓到**：`uv run alembic check`（CI 的「遷移檢查」那步）：`New upgrade operations detected`。
**修法**：`uv run alembic revision --autogenerate --rev-id 0005 -m "add user nickname"`，檢查產生的檔案，一起 commit。或者這次演練直接還原。
**對應**：故障演練清單第 4 條、關卡 11 動手玩 3。

</details>

<details>
<summary>第 4 題</summary>

**原因**：`security.py` 的 `decode_access_token` 只接受 `HS512`，但簽的時候是 `HS256`。簽發（登入、refresh）都成功，驗證（`get_current_user`）全部失敗，所以 `/me` 401 → 攔截器 refresh（成功）→ 重送 `/me` 又 401 → `_retry` 放棄 → `clearSession`「登入已過期」。
**哪個工具抓到**：`pytest`：`test_帶access_token可以取得自己的資料` 和後面所有需要登入的測試紅；`test_rules.py` 的 `test_access_token可以簽發並解開` 也紅。
**定位技巧**：登入 200、refresh 200、`/me` 401，三段裡只有「驗 token」那段壞，直接去看 `decode_access_token` 和 `get_current_user`。
**對應**：故障演練清單第 2 條的變形（第 2 條是換 `JWT_SECRET`，症狀一模一樣）。

</details>

<details>
<summary>第 5 題</summary>

**原因**：`client.ts` 的 single-flight 被關掉（`if (!refreshPromise)` 變成永遠 true）。token 過期後畫面同時發的幾個請求各自去 refresh，第一個把 A 換成 B，後面的拿著 A 再換，後端判定重複使用、撤銷全部，使用者被登出。
**哪個工具抓到**：`npm test`：「single-flight：同時三個請求 401，只送一次 refresh」紅（`refresh` 被呼叫 3 次）。後端 log 有 `"status": 401` 且 `detail` 是 `Refresh token reused`。
**定位技巧**：後端說「重複使用」但你只有一個分頁 → 是前端送了多次 refresh → Network 篩 `refresh` 數有幾個。
**對應**：關卡 1「前端 single-flight」、關卡 6 動手玩 3、關卡 16 的測試。

</details>

### 動手玩

1. **自己出一題**：挑 `PLAN.md` 故障演練清單裡沒做的（例如第 11 條 `--host 127.0.0.1`、第 1 條少環境變數），改壞、`git diff > docs/drills/06.patch`、還原，隔一天再套上來找。或請 AI 出：「照 `docs/drills/README.md` 的格式，從 PLAN.md 的清單出第 N 條，只給我 patch 和症狀，不要說原因」。
2. **git bisect**：假設不知道是哪個 commit 弄壞的。`git bisect start`、`git bisect bad HEAD`、`git bisect good <關卡 12 的 commit>`，每一步跑 `uv run pytest -q -x`，`git bisect good/bad` 回報，幾步之後它指出第一個壞的 commit。用第 4 題的 patch 做成一個 commit 在分支上練，練完 `git bisect reset` 並刪分支。
3. **request_id 串起來**：前端 Console `fetch("/api/me")` 後看回應標頭的 `x-request-id`，到後端 log 搜同一個 id。正式環境到 Render Logs 搜。
4. **讓測試抓第 2 題**：`test_rules.py` 加一個測試：`payload = decode_access_token(create_access_token(1))`，assert `payload["exp"] - payload["iat"] == settings.jwt_expire_minutes * 60`。套上 `02.patch` 跑一次，應該紅。這就是「修完加一個測試」。
5. **故意製造 500 看 log**：`ENABLE_DEBUG_ENDPOINTS=true` 打 `/api/_boom`，在 terminal 找那筆 ERROR，從最後一行往上讀到 `main.py` 的哪一行。

### 想一想

<details>
<summary>Q1：第 2 題全綠但壞了。要怎麼決定「什麼該寫成測試、什麼靠眼睛」？</summary>

寫得出「輸入 → 預期輸出」而且能在一秒內跑完的，寫測試（效期的秒數可以：解開 token 算差值）。要等真實時間、要真實網路、要真實瀏覽器的，靠端對端測試或眼睛，但次數要少、路徑要固定（登入、重新整理、登出）。原則：**便宜的檢查寫成測試，貴的檢查寫成清單**（`RUNBOOK.md` 第 0 節就是一張清單）。

</details>

<details>
<summary>Q2：AI 修 bug 時，你要看什麼才能判斷它真的修好了？</summary>

三件事：(1) 它說的根本原因能不能對上你看到的症狀（第 4 題如果 AI 說「cookie 問題」就是沒對上）；(2) 它有沒有加測試或指出哪個既有測試現在會過；(3) 修法有沒有碰到不該碰的東西（`git diff` 只改了相關的幾行）。做不到這三件事的「修好了」，等於沒修。

</details>

<details>
<summary>Q3：正式環境壞了，第一分鐘做什麼？</summary>

`RUNBOOK.md` 第 1 節：分段確認 → Render Events 看最近有沒有部署 → 剛部署完就壞直接退版（第 2 節）→ 退完再慢慢查。先止血再找原因，和本機除錯的順序相反。

</details>

---

## 關卡 21：docker compose 與 Playwright E2E ✅

**改動的檔案**：新增 `infra/compose.yaml`、`infra/README.md`、`.github/workflows/infra.yml`（`compose`、`e2e` 兩個 job）、`frontend/e2e/auth.spec.ts`、`frontend/playwright.config.ts`；改 `frontend/package.json`（`@playwright/test`、`test:e2e`）、`vitest.config.ts`（排除 `e2e/`）、`tsconfig.node.json`、`.gitignore`、`.prettierignore`。後端程式沒動。

**一句話**：同一個 image 在本機用一個檔案起整套，並用真的瀏覽器走一遍登入主路徑；從這關起每一塊基礎設施都有一個 CI job 證明它會動。

### 觀念 1：Dockerfile 描述一個 image，compose 描述一整套

關卡 9 的 `ci.yml` 要跑起後端得自己寫 `docker run … -e DATABASE_URL=… --network host`，資料庫還是 GitHub 的 `services` 另外給的。這些「誰先誰後、誰連誰、環境變數給什麼」散在指令裡，換一台機器就要重打。compose 把它們寫成一個檔案：

| 以前（ci.yml 的 docker run） | 現在（infra/compose.yaml） |
| --- | --- |
| `--network host`，後端用 `localhost:5432` 找資料庫 | compose 建內部網路，後端用**服務名** `postgres:5432` 找 |
| 自己寫 30 秒的 curl 迴圈等後端起來 | `healthcheck` + `depends_on: condition: service_healthy` + `up --wait` |
| 資料庫是 CI 的 service container，跑完就沒 | 資料放具名 volume `pgdata`，`down` 不加 `-v` 就留著 |

它和關卡 23 的 Kubernetes 清單描述的是同一件事，只是 compose 管一台機器、k8s 管一群機器；image 都是 `backend/Dockerfile`，一個字沒改。

### 觀念 2：「起來了」不等於「能服務了」

`docker compose up -d` 立刻回來，但後端還在跑 `alembic upgrade head`，這時 curl 會 connection refused。`healthcheck` 定義「能服務」是什麼：Postgres 是 `pg_isready`，後端是打 `/api/ping` 回 200。`depends_on` 的 `condition: service_healthy` 讓後端等資料庫真的能接受連線才啟動，`--wait` 讓指令等到全部 healthy 才回來。這和關卡 11 的 liveness / readiness 是同一個觀念，k8s 的探針也是。

後端的 healthcheck 用 Python 的 `urllib` 而不是 curl：image 是 `python:3.13-slim`，沒有 curl。`start_period: 20s` 是給遷移的時間，這段期間失敗不算數。

### 觀念 3：Vitest 和 Playwright 各驗什麼

| | 關卡 16 Vitest + MSW | 關卡 21 Playwright |
| --- | --- | --- |
| 跑什麼 | 一個元件，在 jsdom 裡 | 整個網站，在真的 Chromium 裡 |
| 後端 | MSW 假的 | compose 起的真後端 + 真資料庫 |
| 驗什麼 | 畫面在某個回應下對不對 | 「使用者這條路走得通」：cookie 真的帶上、重整真的還在 |
| 速度 | 毫秒 | 秒 |
| 條數 | 多 | 少，只走主路徑 |

關卡 20 Q1 的原則：便宜的檢查寫成測試，貴的檢查路徑要少。E2E 貴，所以只有三條，而且每條都是 `RUNBOOK.md` 第 0 節「部署後檢查」本來要用手做的事。

### 觀念 4：E2E 怎麼找元素

用使用者看得到的東西：`getByPlaceholder("Email")`、`getByRole("button", { name: "登入" })`、`getByRole("heading", { name: "嗨，…" })`。不用 CSS class 或 id：改樣式測試不該壞，改文案才該壞（那本來就要重新確認）。每個測試註冊自己的帳號（email 帶時間戳），所以可以平行跑、重跑不會撞「已存在」。

### 程式怎麼寫

`infra/compose.yaml` 的核心三段：

```yaml
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d jwtdemo"]
  backend:
    build:
      context: ../backend        # 同一個 Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@postgres:5432/jwtdemo   # 主機名稱 = 服務名
    depends_on:
      postgres:
        condition: service_healthy   # 等資料庫真的能連才起
```

`frontend/playwright.config.ts` 讓前端不用自己起：

```ts
webServer: {
  command: "npm run dev",          // Vite，/api 代理到 localhost:8000（compose 的後端）
  url: "http://localhost:5173",
  reuseExistingServer: !process.env.CI,
},
```

`frontend/e2e/auth.spec.ts` 的第二條，重整還在：

```ts
await loginViaUi(page, email);
await page.reload();   // 記憶體裡的 access token 沒了，initializeAuth() 用 cookie 換新的
await expect(page.getByRole("heading", { name: `嗨，${email}` })).toBeVisible();
```

CI 的 `e2e` job（`infra.yml`）：compose 起後端 → `npm ci` → `npx playwright install chromium --with-deps` → `npx playwright test` → HTML 報告上傳成 artifact，失敗的測試有每一步的截圖與 trace。

### ⚠️ 開始前（Mac，一次性）

- Docker 三選一都免費：Docker Desktop（個人使用免費）、OrbStack（個人免費）、`brew install colima docker && colima start`。裝好 `bash scripts/doctor.sh` 要說關卡 21 可以。
- `cd frontend && npm ci && npx playwright install chromium`：下載 Chromium 約 150 MB。
- 沒有 Docker 的機器不用裝任何東西，看 CI 的 log（`COACHING.md` 關卡 21 的 VM 路線）。

### 驗證方式

1. `docker compose -f infra/compose.yaml up -d --build --wait` 最後兩行是兩個 `Healthy`。
2. `curl -s localhost:8000/api/health` 的 `migration` 是最新的遷移編號（現在 `0006`）。
3. `docker compose -f infra/compose.yaml logs backend` 看得到 `Running upgrade … -> 0006` 與 `Application startup complete`。
4. `npm run test:e2e`（在 `frontend/`）最後一行 `3 passed`。
5. GitHub Actions 的 Infra workflow：`compose` job 的 Smoke test 有 `✅ compose 整套跑起來了`，`e2e` job 有 `3 passed`，run 頁面底部有 `playwright-report` artifact。

### 動手玩

1. **只等「起來」不等「能服務」**：`infra/compose.yaml` 把 backend 的 `depends_on` 底下 `condition: service_healthy` 改成 `condition: service_started`，`down -v` 再 `up -d --build --wait`。後端在 Postgres 還在 initdb 時就起了，`alembic upgrade head` 連不到 → 容器退出，`up` 報錯；`ps -a` 看到 backend 是 `Exited (1)`，`logs backend` 最後幾行是 `Connection refused`。改回來。
2. **把 healthy 定義改錯**：backend 的 healthcheck 把 `/api/ping` 改成 `/api/nope`。`up --wait` 會等到 `retries` 用完，回 `unhealthy`、指令失敗。後端其實活著（curl 打得到），只是「能服務」的定義錯了。改回來。
3. **改錯一個預期值**：`frontend/e2e/auth.spec.ts` 第一個測試最後一行把 `嗨，${email}` 改成 `你好，${email}`，`npm run test:e2e`：`1 failed`、`2 passed`，紅的那條有 `Timed out 5000ms waiting for expect(locator).toBeVisible()` 和 `getByRole('heading', { name: '你好，…' })`。`npx playwright show-report` 點那一條，trace 裡的截圖明明在首頁，只是標題文字不符：測試是對的，是預期值錯了。改回來。
4. **重試會藏問題**：`playwright.config.ts` 的 `retries: 0` 改成 `2`，保留第 3 題的改壞，再跑一次：同一條會跑三次、輸出有 `retry #1`、`retry #2`，最後還是紅，但多等了三倍時間。這就是為什麼設 0：偶爾紅就該查原因。改回來：`git checkout -- infra frontend`。

### 想一想

<details>
<summary>Q1：CI 已經有 ci.yml 的 Docker build + run + smoke test 了，為什麼還要 compose job？</summary>

ci.yml 驗的是「這個 image 做得出來、跑得起來」，資料庫是 GitHub 給的。compose job 驗的是「我寫的那張開店清單是對的」：服務名、healthcheck、depends_on、volume。學習者在 Mac 上用的就是這張清單，CI 綠代表照著做一定起得來。兩個 job 驗的是兩個檔案。

</details>

<details>
<summary>Q2：E2E 為什麼不直接用 MSW 假後端，跑起來快很多？</summary>

因為要驗的就是真的那一段：refresh token cookie 在真瀏覽器裡會不會帶上、重整後 `initializeAuth()` 用 cookie 換到新票、登出後 cookie 真的被清。MSW 看不到瀏覽器的 cookie 規則（關卡 19），這段只有真瀏覽器 + 真後端能驗。

</details>

<details>
<summary>Q3：為什麼 compose 裡後端的 DATABASE_URL 主機是 `postgres`，本機 `.env` 卻是 Neon 的網址？</summary>

同一個 image、同一支程式，連哪個資料庫完全靠環境變數（關卡 2、10 的 12-factor）。compose 給它內部網路裡的服務名，Render 給它 Neon，CI 給它 `localhost:5432`。程式一行不改。

</details>

<details>
<summary>Q4：`down` 和 `down -v` 差在哪，什麼時候該用哪個？</summary>

`down` 刪容器和網路，保留 volume：資料還在，下次 `up` 不用重新註冊。`down -v` 連 volume 一起刪：全新的倉庫，遷移會從 0001 跑一遍。CI 用 `-v`（每次都要乾淨），本機學習時想保留帳號就不加。

</details>

---

## 關卡 22：指標（Prometheus + Grafana）與追蹤（OpenTelemetry）✅

**改動的檔案**：新增 `backend/metrics.py`、`backend/tracing.py`、`backend/tests/test_metrics.py`、`backend/tests/test_tracing.py`、`infra/prometheus/prometheus.yml`、`infra/grafana/provisioning/`（datasources、dashboards）、`infra/grafana/dashboards/backend.json`、`infra/otel/collector.yaml`；改 `backend/main.py`（掛上兩者、log 帶 trace_id）、`config.py`（`METRICS_ENABLED`、`OTEL_EXPORTER_OTLP_ENDPOINT`）、`pyproject.toml`（`prometheus-client`、`opentelemetry-*`）、`.env.example`、`infra/compose.yaml`（profile `observability`）、`infra.yml`（`observability` job）。

**一句話**：除了錯誤（Sentry）和 log，還要有「數字」和「一個請求走了哪幾站」，而且儀表板進 git；兩個都是開關，預設關，線上行為不變。

### 觀念 1：三種訊號各管一件事

| | log（關卡 11） | 指標 metrics | 追蹤 tracing |
| --- | --- | --- | --- |
| 長什麼樣 | 一筆一筆的事件 | 累計的數字，定期取樣 | 一棵樹：請求與它底下的每一步 |
| 回答什麼 | 「那個請求發生了什麼」 | 「這小時多快、錯誤率、趨勢」 | 「這 120 毫秒花在哪一步」 |
| 成本 | 每個請求一行，量大 | 幾個數字，再多請求也不變大 | 每個請求一棵樹，通常抽樣 |
| 拿來 | 查單一事件、除錯 | 儀表板、告警 | 找慢的那一句 SQL |

三種要能互相找：log 帶 `request_id` 和 `trace_id`，span 帶 `X-Request-ID`。使用者回報一個 request id，三邊都查得到。

### 觀念 2：指標是「拉」的，而且 label 的值要有限

程式只負責把數字放在 `/metrics`（純文字，一行一個），Prometheus 每隔 `scrape_interval`（這裡 5 秒）主動來抓，存成時間序列。程式不知道 Prometheus 在哪、有幾個，這就是「拉」模式的好處。

每一組不同的 label 值就是一條時間序列。所以 `route` 用**路由樣板**（`/api/auth/login`）而不是實際路徑：路徑裡有 id 的話（`/todos/123`）每個 id 都是一條新序列，Prometheus 會被撐爆（cardinality 爆炸）。沒對上任何路由的亂打路徑一律記 `unmatched`，同樣是不讓外人灌爆它。`user_id`、`email` 這種永遠不能當 label。

### 觀念 3：耗時用直方圖，看 p95 不看平均

平均 50 毫秒可能是「大家都 50」，也可能是「95% 的人 10 毫秒、5% 的人 800 毫秒」。後者才是要修的，平均看不出來。`http_request_duration_seconds` 是直方圖：把每個請求的耗時丟進「≤5ms、≤10ms、…、≤10s」的桶子各加一，Grafana 用 `histogram_quantile(0.95, …)` 算出「95% 的請求在幾毫秒內完成」。桶子的邊界是固定的，所以算出來是近似值，夠用。

### 觀念 4：儀表板進 git

Grafana 開起來就已經接好 Prometheus、已經有一張「JWT Auth Demo backend」：資料來源和儀表板都是從 `infra/grafana/` 的檔案載入的（provisioning）。和 `render.yaml`、關卡 23 的 k8s 清單是同一個概念：設定用檔案描述，進 git，改了有 diff，重開不會不見，別的專案直接複製。畫面上改了存不回檔案，所以設 `allowUiUpdates: false`，要改就改 json。

### 觀念 5：OpenTelemetry：程式只產生 span，送去哪是設定

追蹤用 OpenTelemetry（OTel），廠商中立的標準：程式產生 span、用 OTLP 協定送出去，收的那頭可以是本機的 collector（這關，只印到 log）、Grafana Cloud、Jaeger、Datadog……換廠商只改環境變數，程式一行不改。這就是不直接用某家 SDK 的理由。

collector 是中繼站：收 → 處理 → 轉送。程式只送到它，要轉去哪在 `infra/otel/collector.yaml` 改。正式環境常用它做批次、抽樣、加標籤、同時送兩家。

span 的來源有兩層：`FastAPIInstrumentor` 每個 HTTP 請求一個 span（名稱是路由樣板）、`AsyncPGInstrumentor` 每句 SQL 一個子 span（掛在驅動層，因為 OTel 的 SQLAlchemy 套件還不支援 2.1）。`/api/ping` 和 `/metrics` 不追蹤：平台每幾秒打一次，追了只是噪音。span 先攢著、每幾秒一批送（`BatchSpanProcessor`），不拖慢請求；collector 掛了也只是 export 失敗，請求照常回。

### 觀念 6：兩個開關，預設都關

`METRICS_ENABLED` 沒設 → `/metrics` 回 404；`OTEL_EXPORTER_OTLP_ENDPOINT` 沒設 → `setup_tracing` 什麼都不做。線上 Render 兩個都沒設，行為和關卡 21 之前一模一樣。而且 `/metrics` 刻意不放 `/api` 底下：Vercel 只轉發 `/api/*`，就算線上打開外面也打不到。同一個 image，compose 給它 `METRICS_ENABLED=true` 和 collector 的位址就全開：12-factor，和 `DATABASE_URL` 同一個道理。

### 程式怎麼寫

`backend/metrics.py` 的 middleware，二十行：

```python
REQUESTS = Counter("http_requests_total", "HTTP 請求數", ["method", "route", "status"])
DURATION = Histogram("http_request_duration_seconds", "HTTP 請求耗時（秒）", ["method", "route"])

@app.middleware("http")
async def record_metrics(request, call_next):
    if request.url.path == "/metrics":      # 抓指標的請求本身不算
        return await call_next(request)
    start = time.perf_counter()
    status = "500"                          # 沒接住的例外也要算
    try:
        response = await call_next(request)
        status = str(response.status_code)
        return response
    finally:
        route = _route_template(request)    # 路由樣板或 unmatched
        REQUESTS.labels(request.method, route, status).inc()
        DURATION.labels(request.method, route).observe(time.perf_counter() - start)
```

`backend/tracing.py` 的開關與兩層 instrumentation：

```python
def setup_tracing(app, exporter=None):
    if exporter is None:
        if not settings.otel_exporter_otlp_endpoint:
            return None                     # 沒設端點就完全不啟用
        exporter = OTLPSpanExporter()       # 端點、header 由 SDK 讀 OTEL_* 環境變數
    provider = TracerProvider(resource=Resource.create({SERVICE_NAME: "jwt-auth-demo-backend", ...}))
    provider.add_span_processor(BatchSpanProcessor(exporter))
    FastAPIInstrumentor.instrument_app(app, tracer_provider=provider,
        excluded_urls="metrics,api/ping",
        http_capture_headers_server_response=["x-request-id"])   # span 帶回應的 X-Request-ID
    AsyncPGInstrumentor().instrument(tracer_provider=provider)   # 每句 SQL 一個子 span
```

`backend/main.py` 的 log middleware 多一行，log ↔ trace 互相找：

```python
trace_id = current_trace_id()   # 有在追蹤才有值
if trace_id:
    extra["trace_id"] = trace_id
```

`infra/prometheus/prometheus.yml` 抓誰：

```yaml
scrape_configs:
  - job_name: backend
    static_configs:
      - targets: ["backend:8000"]   # compose 的服務名
```

`infra/otel/collector.yaml` 的管線：收 OTLP、印到 log。要接真的後端就把 `debug` 換成 `otlphttp` 填目的地：

```yaml
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
```

### ⚠️ 開始前（Mac）

同關卡 21：有 Docker、`bash scripts/doctor.sh` 說關卡 22 可以。這關多開三個 container（Prometheus、Grafana、collector），第一次會多拉約 500 MB 的 image。沒有 Docker 就看 CI 的 `observability` job（`COACHING.md` 關卡 22 的 VM 路線）。

### ⚠️ 開始前（選配：把 Render 上的 trace 送到 Grafana Cloud）

這段是 `PLAN-INFRA.md` 的 22-C。**全程免費、不用信用卡**；整關不做這段也算完成。你自己開帳號，AI 不替你開。

| 項目 | 2026-10-22 查到的 | 注意 |
| --- | --- | --- |
| Grafana Cloud Free | 不用信用卡；10,000 個 metrics series、logs 與 traces 各 50 GB／月、14 天保留 | 額度會變，註冊前再看 grafana.com 的 pricing 頁；**畫面若要求信用卡就停下來** |
| Render 改環境變數 | 免費方案可以改 | 存檔會自動重新部署一次 |

1. 到 grafana.com 註冊免費帳號，建一個 stack（區域選離你近的）。
2. stack 裡 **Connections → Add new connection**，搜 **OpenTelemetry (OTLP)**。它會產生一個 token（access policy token，`glc_` 開頭，勾 traces 的 write 權限），並顯示三個值：OTLP endpoint（`https://otlp-gateway-prod-<region>.grafana.net/otlp`）、**Instance ID**（用這張卡片上的數字，不是 stack 的其他 id）、token。token 只顯示一次，先存起來。
3. 把 `instance id:token` 做成 base64，**不能有換行**（有換行 header 就壞了，會 401）：

   ```bash
   printf '%s' '<instance id>:<glc_token>' | base64 | tr -d '\n'
   ```

4. Render → 後端服務 → **Environment**，加兩個變數（Grafana 畫面會給第三個 `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`，這個專案用不到：`tracing.py` 直接用 HTTP 的 exporter；設了也無妨）：

   | 變數 | 值 |
   | --- | --- |
   | `OTEL_EXPORTER_OTLP_ENDPOINT` | 第 2 步的 endpoint（SDK 會自己接上 `/v1/traces`） |
   | `OTEL_EXPORTER_OTLP_HEADERS` | `Authorization=Basic%20<第 3 步的 base64>`：空格要寫成 `%20`（OTLP 規範的 header 值要 URL 編碼） |

5. 存檔，等 Render 部署完。Logs 搜 `OpenTelemetry 追蹤已啟用`。
6. 開一次前端網址（或 `curl https://<你的 Render 網址>/api/health`），等 10 秒。Grafana Cloud → **Explore** → 資料來源選 `grafanacloud-<stack>-traces` → Search → Service Name 選 `jwt-auth-demo-backend` → 看到 `GET /api/health` 的 trace，點開底下有兩個 `SELECT`。這就是 Mac 路線步驟 8～9 的雲端版，差別只有環境變數。
7. 401 的話：Instance ID 拿錯（要 OTLP 卡片上的）、base64 有換行、token 沒勾 traces write。看完想關掉就把兩個變數刪掉，再部署一次。

### 驗證方式

1. `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318 docker compose -f infra/compose.yaml --profile observability up -d --build --wait` 五個 `Healthy`。
2. 打幾次 `/api/ping` 後 `curl -s localhost:8000/metrics | grep '^http_requests_total'` 有 `route="/api/ping"` 的那行，數字會動。
3. `localhost:9090/targets` 的 `backend` 是 UP；`localhost:3000` 的「JWT Auth Demo backend」五個面板有線。
4. 打一次 `/api/health`，8 秒後 `logs otel-collector` 有 `Name : GET /api/health` 與 `Name : SELECT`；`logs backend` 同一筆有 `trace_id=`，和 collector 裡的 `Trace ID` 一樣。
5. `uv run pytest -q`（在 `backend/`）：`test_metrics.py` 3 個、`test_tracing.py` 2 個都綠。
6. GitHub Actions 的 Infra workflow：`observability` job 有 `✅ Prometheus：…`、`儀表板：JWT Auth Demo backend`、`✅ collector 收到 HTTP 的 span：`。

### 動手玩

1. **label 爆炸**：`backend/metrics.py` 的 `_route_template` 整個函式改成只有 `return request.url.path`，`up -d --build`，打 `/api/nope/1` 到 `/api/nope/5`，`/metrics` 多出五條 `route="/api/nope/N"`。想像 N 是使用者 id、有十萬個使用者。改回來。
2. **把 /metrics 自己也算進去**：middleware 開頭那個 `if request.url.path == "/metrics"` 兩行拿掉，`up -d --build`，等 30 秒看 `/metrics`：多了 `route="/metrics"` 的 counter，每 5 秒 +1，是 Prometheus 自己打的。改回來。
3. **同一個 image、少一個環境變數**：不帶 `OTEL_EXPORTER_OTLP_ENDPOINT=…` 重新 `up -d --force-recreate backend`，打 `/api/health`：`logs backend` 沒有 `OpenTelemetry 追蹤已啟用`、沒有 `trace_id=`；collector 的 log 沒有新的 span。程式一行沒改。
4. **collector 掛了，請求還好嗎**：`docker compose -f infra/compose.yaml --profile observability stop otel-collector`，再打三次 `/api/health`：全部 200、一樣快；幾秒後 `logs backend` 多出 export 失敗的錯誤（有 `export` 字樣），是 exporter 自己在重試，沒有影響請求。`start otel-collector` 回來。
5. **p95 看得出平均看不出的**：`backend/routes/users.py` 的 `/me` 加一行 `await asyncio.sleep(0.5)`（記得 `import asyncio`），`up -d --build`，登入後重新整理首頁十次、打 `/api/ping` 一百次。Grafana 的「每秒請求數」兩條線差不多，「p95 耗時」被 `/me` 拉到 0.5 秒。改回來：`git checkout -- backend`。

### 想一想

<details>
<summary>Q1：Sentry（關卡 11）已經會告訴我錯誤了，為什麼還要指標？</summary>

Sentry 抓的是「例外」：程式噴了什麼。指標抓的是「沒噴例外但不對勁」：p95 從 80 毫秒變 800、5xx 比例從 0 變 2%、請求數突然掉到 0。這些沒有 traceback，Sentry 不會響，儀表板和告警會。

</details>

<details>
<summary>Q2：為什麼線上 Render 預設不開 /metrics、不開追蹤？</summary>

三個理由：線上沒有 Prometheus 來抓，開了也沒人讀；Vercel 只轉發 `/api/*`，`/metrics` 外面本來就打不到；追蹤要有地方收，沒設端點 SDK 連 exporter 都不建。這關的重點是「同一個 image，靠環境變數決定開不開」，不是「線上一定要開」。要開就照「開始前」第二段接 Grafana Cloud。

</details>

<details>
<summary>Q3：為什麼不直接從程式送到 Grafana Cloud，中間要有 collector？</summary>

本機學習時 collector 只印 log，讓你看得到 span 長什麼樣，不用開帳號。正式環境它負責批次、抽樣、加標籤（環境、版本）、同時送兩家、換廠商時只改它的設定。程式永遠只送到「一個 OTLP 端點」，這就是標準的價值。這個專案線上直送 Grafana Cloud 也行（開始前第二段），因為只有一個服務、不需要中繼。

</details>

<details>
<summary>Q4：`http_requests_total` 是 13，Prometheus 查出來是 3，哪個對？</summary>

都對。`/metrics` 是「現在」的累計值；Prometheus 存的是「上次抓到時」的值，5 秒抓一次，抓到時 10 次 curl 還沒打。指標是取樣不是逐筆，所以看趨勢用指標、查單一事件用 log。

</details>

<details>
<summary>Q5：為什麼 SQL 的 span 掛在 asyncpg 而不是 SQLAlchemy？</summary>

做的時候 OTel 的 SQLAlchemy 套件只支援到 2.0，這個專案是 2.1。掛在驅動層反而更貼近真的送出去的 SQL（`db.statement` 就是 Postgres 收到的那句）。代價是看不到 SQLAlchemy 層的 ORM 名稱，對這個專案夠用。

</details>

---

## 關卡 23：Kubernetes（kind、Deployment、滾動更新、退版）✅

**改動的檔案**：新增 `infra/k8s/base/`（`namespace.yaml`、`configmap.yaml`、`secret.example.yaml`、`migrate-job.yaml`、`deployment.yaml`、`service.yaml`、`kustomization.yaml`）、`infra/k8s/overlays/ci/kustomization.yaml`、`infra/k8s/ci/`（CI 與本機學習用的 Postgres）；`.github/workflows/infra.yml` 加 `k8s` job；`docs/RUNBOOK.md` 第 2 節加 k8s 的退版。程式沒動，image 沒動。

**一句話**：同一個 image 不靠 Render，交給 Kubernetes 排程：幾個副本、怎麼探活、怎麼滾動更新與退版。Render 幫你做的事，這關讓你親眼看見是誰在做。線上仍是 Render，這關不換平台。

### 觀念 1：Render 幫你做的事，在 k8s 全部寫成字

| Render 做的 | k8s 清單裡的 | 在哪 |
| --- | --- | --- |
| 起一個實例 | `replicas: 2` | `deployment.yaml` |
| 掛了重啟 | `livenessProbe`（`/api/ping` 不過就重啟容器） | 同上 |
| 起來了才給流量 | `readinessProbe`（`/api/health` 不過就不進 Service 名單） | 同上 |
| 換版先起新的再關舊的 | `strategy.rollingUpdate`：`maxSurge: 1`、`maxUnavailable: 0` | 同上 |
| 一鍵退版 | `kubectl rollout undo` | `RUNBOOK.md` 第 2 節 |
| 環境變數 | `ConfigMap`（一般設定）+ `Secret`（密鑰） | `configmap.yaml`、`secret.example.yaml` |
| 啟動時跑遷移 | 獨立的 `Job` | `migrate-job.yaml` |
| 固定網址 | `Service`（叢集內的固定名字）；對外還要 Ingress，這關刻意不做 | `service.yaml` |

清單是「我要的狀態」，k8s 的工作是一直讓現況等於它：pod 死了補一個、副本數不對就調、image 變了就換版。

### 觀念 2：pod 會死，Service 給它們固定的名字

pod 是一次性的：換版、掛掉、節點壞了都會換一個新的，IP 也換。Service 用 label（`app: backend`）找到現在活著的 pod，給它們一個固定的名字 `backend` 和 IP，流量平均分給 **Ready** 的那幾個。這和 compose 的服務名是同一個概念，只是多了「只分給 Ready 的」。

`port-forward` 是開一條通道到「某一個 pod」，換版那個 pod 被關它就斷了；所以 CI 量零停機是在叢集裡開一個 curl pod 直接打 Service。

### 觀念 3：遷移用 Job，不放在啟動指令裡

Render 只有一個實例，Dockerfile 的 CMD「先 `alembic upgrade head` 再 uvicorn」沒問題。叢集有 2 個副本，每個 pod 啟動都跑遷移會互相打架。所以遷移獨立成 Job：跑一次、跑完就 `Completed`、失敗重試 `backoffLimit` 次，Deployment 的 `command` 蓋掉 CMD 只跑 uvicorn。Job 的 spec 建好就不能改，要重跑得先 `delete job`（正式環境常讓名字帶版本，或用 Helm hook）。

### 觀念 4：零停機是三件事加起來

1. `maxUnavailable: 0`：舊的要等新的 Ready 才能關，全程至少 N 個在服務。
2. `readinessProbe`：「Ready」有定義（`/api/health` 回 200），不是容器起來就算。
3. `preStop: sleep 5`：pod 要關的時候，「從 Service 名單移除」和「送 SIGTERM」是同時發的，名單更新要一兩秒才傳遍叢集，這一兩秒還有流量進來；先睡 5 秒再關，就不會有人打到正在關的 pod。`terminationGracePeriodSeconds: 30` 要大於 preStop 加程式收尾的時間，不然被 SIGKILL。

CI 的 `k8s` job 把這件事數出來：換版期間每 0.5 秒打一次 Service，80 次全部 200。

### 觀念 5：壞版本上不去，退版一個指令

image 不存在、程式起不來、readiness 一直不過：新 pod 永遠不 Ready，`maxUnavailable: 0` 代表舊的不能關，流量永遠只到舊的。使用者沒感覺，`rollout status` 會逾時提醒你。`rollout undo` 退回上一個 revision（上一個 ReplicaSet），本身也是一次滾動更新。和 Render 的 Rollback 按鈕一樣：退版不退資料庫，退完記得修 main。

### 觀念 6：設定與密鑰分開，密鑰不進 git

`ConfigMap` 放一般設定（`LOG_JSON`、`COOKIE_SECURE`），`Secret` 放密鑰（`DATABASE_URL`、`JWT_SECRET`），和 `render.yaml` 的 `envVars`、compose 的 `environment` 同一組名字。`secret.example.yaml` 只是範本，刻意不列進 `kustomization.yaml`；CI 用 `kubectl create secret --from-literal` 建，正式環境由雲端 secret manager 同步、或 Sealed Secrets / SOPS 加密後才進 git。Secret 存的只是 base64 不是加密，叢集要另外開 encryption at rest。還有一個常見的坑：改了 ConfigMap 不會自動重啟 pod，要 `rollout restart`。

### 觀念 7：kustomize：base 加 overlay，不複製貼上

`base/` 是共同的清單，`overlays/ci/` 疊上這個環境的差異（image tag 用 `ci`、多一個 CI 用的 Postgres）。正式環境會有另一個 overlay：registry 的 image、`COOKIE_SECURE=true`、副本數、Ingress，資料庫用託管的不在叢集裡。`kubectl apply -k` 內建，不用裝東西。

### 觀念 8：安全基線，從第一天就寫

`runAsNonRoot`、`readOnlyRootFilesystem`（程式被攻破也寫不了 image 裡的檔案，要寫只有 `/tmp`）、`capabilities: drop ALL`、`allowPrivilegeEscalation: false`、`resources`（requests 是排程的保證量，memory limit 超過會被 OOM 殺掉；不設 CPU limit 因為 CPU 只會被節流不會被殺）。這些在 Dockerfile 的 `USER app` 之上再加一層，正式叢集的 admission policy 通常會要求。

### 程式怎麼寫

`deployment.yaml` 的核心，其他都是註解：

```yaml
spec:
  replicas: 2
  strategy:
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # 先起新的、舊的等新的 Ready 才關
  template:
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: backend
          image: jwt-backend:latest        # tag 由 overlay 的 images 換
          command: [uvicorn, main:app, --host, 0.0.0.0, --port, "8000", --no-access-log]  # 蓋掉 CMD，遷移交給 Job
          envFrom:
            - configMapRef: { name: backend-config }
            - secretRef: { name: backend-secret }
          livenessProbe:  { httpGet: { path: /api/ping,   port: http }, periodSeconds: 10 }
          readinessProbe: { httpGet: { path: /api/health, port: http }, periodSeconds: 5, failureThreshold: 12 }
          lifecycle:
            preStop: { exec: { command: [sleep, "5"] } }  # 等 Service 名單更新完才關
          securityContext: { readOnlyRootFilesystem: true, allowPrivilegeEscalation: false, capabilities: { drop: [ALL] } }
```

`migrate-job.yaml`：同一個 image、`command: ["alembic", "upgrade", "head"]`、`restartPolicy: Never`、`backoffLimit: 3`、`ttlSecondsAfterFinished: 600`。

`overlays/ci/kustomization.yaml` 怎麼疊：

```yaml
resources: [../../base, ../../ci]
images:
  - name: jwt-backend
    newTag: ci          # kind load 進去的那個 tag
```

CI 的 `k8s` job 一條龍：`docker build` → `kind create cluster` → `kind load docker-image` → namespace + CI 的 Postgres → `create secret` → `apply -k` → `wait job` → `rollout status` → `port-forward` + curl → 換版到 v2 同時 probe pod 打 80 次 → `rollout undo` → 壞 image → undo → `describe`。

### ⚠️ 開始前（Mac，一次性）

- `brew install kind kubectl`，都免費、開源。`bash scripts/doctor.sh` 要說關卡 23 可以。
- Docker 要在跑（kind 的節點是一個 container）。第一次 `kind create cluster` 拉 `kindest/node` 約 1 GB。
- 沒有 Docker 的機器看 CI 的 `k8s` job（`COACHING.md` 關卡 23 的 VM 路線）。
- 這關**不**碰 Render、Neon、Vercel；不會產生任何費用。想在雲端跑真的叢集（GKE、EKS）會有費用，這關刻意不做。

### 驗證方式

1. `kubectl -n jwt-auth-demo get pods`：兩個 `backend-… 1/1 Running`、一個 `backend-migrate-… 0/1 Completed`。
2. `port-forward` 後 `curl localhost:8080/api/health` 的 `migration` 是最新的（`0006`）、`version` 是 `k8s`。
3. 換版期間 probe pod 的 80 次全部 `200`。
4. `rollout undo` 後 image 回到 `jwt-backend:ci`；`rollout history` 多一個 revision。
5. 壞 image 時 `get pods` 一個 `ErrImagePull`／`ImagePullBackOff`、兩個 `Running`，Service 仍回 `200`。
6. GitHub Actions 的 Infra workflow：`k8s` job 有 `✅ 零停機：換版期間每一次請求都 200`、`✅ 退版成功`、`✅ 壞版本期間 Service 照常回 200`。

### 動手玩

（都在叢集還開著的時候做；`<pod>` 用 `get pods` 看到的 backend pod 名字）

1. **pod 死了誰補**：`kubectl -n jwt-auth-demo delete pod <pod>`，馬上 `get pods`：被刪的在 `Terminating`，同時多一個 AGE 幾秒的新 pod，幾秒後還是兩個 `Running`。Deployment 的工作就是讓現況等於 `replicas: 2`。
2. **副本數**：`kubectl -n jwt-auth-demo scale deployment/backend --replicas=3`，`get pods` 三個。再 `kubectl apply -k infra/k8s/overlays/ci`：變回兩個，因為清單說 2。改清單才是正途，指令改的會被下一次 apply 蓋掉。
3. **程式掛了誰拉起來**：`kubectl -n jwt-auth-demo exec <pod> -- kill 1`（PID 1 就是 uvicorn），`get pods`：同一個 pod 名字、`RESTARTS` 變 1。對照第 1 題：容器掛了是原地重啟，pod 被刪是換新的。
4. **改了 ConfigMap 不會自動生效**：`infra/k8s/base/configmap.yaml` 把 `LOG_JSON` 改成 `"false"`，`kubectl apply -k infra/k8s/overlays/ci` → `configmap/backend-config configured`，但 `get pods` 的 AGE 沒變、`logs <pod> --tail=3` 還是 JSON。`kubectl -n jwt-auth-demo rollout restart deployment/backend` 之後才換成新 pod、log 變一行文字。改回來，再 apply + rollout restart。
5. **唯讀檔案系統**：`kubectl -n jwt-auth-demo exec <pod> -- touch /app/x` → `Read-only file system`；`-- touch /tmp/x` 成功。程式被攻破也改不了 image 裡的檔案。
6. **把零停機弄壞（不保證看得到）**：`deployment.yaml` 的 `maxUnavailable` 改成 `1`、`preStop` 那三行拿掉，`apply -k`，再做一次 COACHING 步驟 9～11 的換版 + probe。可能看到幾次 `000`（連線被拒）：那就是舊 pod 關掉、名單還沒更新的那一兩秒。沒看到也沒關係，kind 單節點更新名單很快；正式叢集幾十個節點就會看到。改回來：`git checkout -- infra`。

### 想一想

<details>
<summary>Q1：Render 的 Dockerfile CMD 先跑遷移再起伺服器，為什麼 k8s 要拆成 Job？</summary>

Render 一個實例，遷移只會跑一次。k8s 兩個副本同時啟動、同時跑 `alembic upgrade head`，兩個都想建同一張表，一個會失敗、pod 重啟、再跑一次……Job 讓遷移只有一個執行者，Deployment 只負責跑伺服器。正式環境還會用 Helm hook 或 Argo CD 的 sync wave 保證 Job 一定在新版 pod 之前跑完。

</details>

<details>
<summary>Q2：Secret 只是 base64，誰都解得開，為什麼還不能進 git？</summary>

base64 不是加密，所以 Secret 進 git 等於明文進 git：歷史永遠留著，所有看得到 repo 的人都拿得到。Secret 的意義是「k8s 在存取控制上把它當密鑰」（RBAC 可以只讓某些人讀、可以開 encryption at rest、不會印在 describe 裡），不是「它自己加密了」。要進 git 得先用 Sealed Secrets 或 SOPS 加密。

</details>

<details>
<summary>Q3：liveness 用 /api/ping、readiness 用 /api/health，反過來會怎樣？</summary>

liveness 用 `/api/health`：資料庫短暫斷線時程式沒壞，但探針不過，k8s 不斷重啟它，反而更糟（關卡 11 的觀念）。readiness 用 `/api/ping`：程式起來了但連不到資料庫也會收流量，使用者看到 500。所以活著用輕的、能服務用重的。注意現在的 `/api/health` 資料庫壞了也回 200（`status` 是 `degraded`），所以 readiness 其實只擋「程式還沒起來」；要讓資料庫壞時真的不接流量，得讓它回 503，這是刻意留給你的作業（想一想代價：Neon 休眠喚醒的那幾秒，兩個 pod 會同時被移出名單）。

</details>

<details>
<summary>Q4：CI 量零停機為什麼用叢集裡的 probe pod，不用 port-forward？</summary>

port-forward 黏在一個 pod 上，那個 pod 換版被關它就斷了，量到的是「port-forward 斷了」不是「Service 有沒有中斷」。probe pod 在叢集裡直接打 Service 的名字，走的是真的負載平衡，每一次請求都可能到不同的 pod，這才是使用者的視角。

</details>

<details>
<summary>Q5：所以要把線上從 Render 搬到 k8s 嗎？</summary>

不用。一個服務、一個開發者、免費額度夠用，Render 幫你做的事就是這關寫出來的這些，它做得很好。k8s 的價值在很多服務、很多人、要自己控制網路與排程的時候；代價是這份清單和背後的叢集要有人養。這關的目的是「知道 Render 背後是什麼、換平台時知道要看哪些字」，不是搬家。面試被問「你用過 k8s 嗎」，答案是這個 job 和這份清單。

</details>

---

## 關卡 24：非同步訊息（transactional outbox → Kafka、冪等）✅

**改動的檔案**：`backend/models.py` 加 `OutboxEvent`、`ProcessedEvent`（遷移 `0005`、`0006`）；新增 `backend/outbox.py`、`worker.py`、`consumer.py`、`tests/test_outbox.py`、`tests/test_register_cap.py`；改 `routes/auth.py`（`register`：上限檢查、`flush` → `enqueue` → `commit` → `wake_worker`）、`main.py`（`lifespan` 的 inline 模式）、`config.py`（`KAFKA_BOOTSTRAP_SERVERS`、`OUTBOX_POLL_SECONDS`、`OUTBOX_WORKER`、`MAX_USERS`）、`pyproject.toml`（`aiokafka`）、`.env.example`、`render.yaml`（三個變數）；`infra/compose.yaml` 加 profile `messaging`（redpanda、redpanda-init、worker、consumer）；`infra.yml` 加 `messaging` job；`tests/conftest.py` 多清兩張表。

**一句話**：註冊成功要通知別的系統時，不在請求裡做；先把「待送事件」和使用者寫進同一個交易，再由 worker 送出。Kafka 是送出的管道之一，重點是 outbox 和冪等。

### 觀念 1：為什麼不在請求裡直接做

| 做法 | 哪裡會壞 |
| --- | --- |
| 請求裡直接寄信 | 寄信服務掛了，使用者註冊失敗；寄信慢，註冊就慢 |
| 先 commit 使用者，再送事件 | 送之前程式當掉，事件丟了：有使用者、沒通知 |
| 先送事件，再 commit 使用者 | commit 失敗（email 重複），信已經寄了：有通知、沒使用者 |
| **outbox**：事件和使用者同一個交易，worker 之後送 | 交易成功兩個都在，失敗兩個都不在；worker 掛了事件還在表裡等 |

「資料庫和訊息系統要一致」沒有兩階段提交可用（Kafka 不參與資料庫的交易），outbox 是業界的標準解法。

### 觀念 2：at-least-once，所以收的那邊要冪等

worker 的順序是「送出去 → 標 `published_at` → commit」。送出去之後、標記之前當掉，重啟會再送一次：這叫 at-least-once（至少一次），比「最多一次」（可能丟）好，但代價是可能重複。所以 consumer 要**冪等**：同一筆事件來幾次，效果都和來一次一樣。

做法：`ProcessedEvent` 的主鍵就是事件 id，先 INSERT，撞主鍵就是處理過了，整個交易回滾、記 `duplicate`。「用資料庫的唯一性做判斷」和註冊的 email unique 索引（關卡 13）是同一招。要做的事（寄信、統計）和這個 INSERT 要在同一個交易裡，或本身冪等，才不會「標記了卻沒做」。

事件 id 用 uuid 不用流水號：它會被送到別的系統，那邊要用它判斷重複；它貫穿整條路：outbox 的 id = Kafka 訊息的 key = processedevent 的主鍵。

### 觀念 3：Kafka 是什麼，和 HTTP 呼叫差在哪

Kafka（本機用 Redpanda，Kafka 相容、一個 binary）是一條一條「主題」（topic）的日誌：生產者往後面寫，消費者各自記錄讀到哪（offset）。和直接 HTTP 呼叫對方的差別：

- 寫的人不用等讀的人（註冊不等寄信）
- 讀的人掛了訊息還在（consumer 停掉再回來，從上次 commit 的 offset 繼續）
- 一筆訊息可以給好幾個系統各讀一次（寄信、統計各一個 consumer group）

`key` 用事件 id：同一個 key 一定進同一個 partition，順序才有保證。`acks="all"`：所有副本都寫到才算成功，寧可慢也不丟。consumer `enable_auto_commit=False`：處理完才 commit offset，處理到一半當掉會再收到同一筆，靠冪等擋。topic 由 `redpanda-init` 用指令建，不靠程式自動建：partition 數、保留時間是基礎設施的一部分。

### 觀念 4：worker 怎麼撿才不會撞

`publish_pending` 用 `SELECT … FOR UPDATE SKIP LOCKED`（關卡 18 的鎖）：好幾個 worker 同時跑時各拿各的、不等對方，同一筆不會被送兩次。`published_at` 有索引：撿的條件是 `IS NULL`，表大了才不會每次輪詢全表掃描。

沒事做時 worker 等「鈴」或等 `OUTBOX_POLL_SECONDS`：同一個程序裡（inline 模式）註冊 commit 後會按鈴（`wake_worker`），事件幾秒內送出；分開跑的 worker 聽不到鈴，靠輪詢。

### 觀念 5：線上免費方案怎麼跑（24-C）

Render 免費方案開不了第二個服務，所以 `OUTBOX_WORKER=inline`：web 程序啟動時在 `lifespan` 開一個背景 task 跑 `run_worker`，沒有 Kafka 就用 `LogPublisher` 印到 log。`OUTBOX_POLL_SECONDS=600`：worker 不會每 5 秒碰資料庫，Neon 閒置 5 分鐘才能休眠，免費方案的計算時數才省得下來；有人註冊會按鈴，不用等 10 分鐘。`MAX_USERS=1000`：公開的示範站怕人灌帳號把免費額度用光，到了註冊回 503。三個都是環境變數，同一個 image。

### 觀念 6：這個範本刻意沒做的

- consumer 只記一行 log，真實世界是寄信、更新統計，而且通常是**另一個服務、另一個資料庫**（這裡共用是為了看得到整條路）
- 沒做死信（dead letter）：consumer 處理失敗會一直重試同一筆；正式環境會把失敗幾次的事件丟到另一個 topic 人工看
- 沒做 schema registry、沒做事件版本；只有一種事件
- 線上沒有 Kafka，事件只印到 log；要接真的（Upstash、Confluent 有免費方案但會碰到註冊與額度）設 `KAFKA_BOOTSTRAP_SERVERS` 就行

### 程式怎麼寫

`routes/auth.py` 的 `register`，三個重點在同一個交易裡：

```python
session.add(user)
await session.flush()                                        # 先拿到 user.id，還沒 commit
enqueue(session, "user.registered", {"user_id": user.id, "email": user.email})   # 只 add，不 commit
await session.commit()                                       # 使用者和事件一起成功或一起失敗
...
wake_worker()                                                # commit 之後才按鈴
```

`outbox.py` 的 worker 核心：

```python
result = await session.exec(
    select(OutboxEvent)
    .where(col(OutboxEvent.published_at).is_(None))
    .order_by(col(OutboxEvent.created_at))
    .limit(limit)
    .with_for_update(skip_locked=True)     # 多個 worker 各撿各的
)
for event in result.all():
    await publisher.send(event.topic, str(event.id), serialize(event))
    event.published_at = datetime.now(timezone.utc)
await session.commit()
```

`outbox.py` 的冪等：

```python
session.add(ProcessedEvent(id=event_id, topic=topic))
try:
    await session.flush()                 # 撞主鍵 = 處理過了
except IntegrityError:
    await session.rollback()
    logger.info("duplicate", ...)
    return False
# 真正要做的事放這裡，和上面的 INSERT 同一個交易
await session.commit()
```

`main.py` 的 inline 模式：

```python
async def lifespan(_: FastAPI):
    worker_task = None
    if settings.outbox_worker == "inline":
        worker_task = asyncio.create_task(run_worker(), name="outbox-worker")
    yield
    if worker_task is not None:
        worker_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker_task
```

`infra/compose.yaml`：`worker` 和 `consumer` 都是 `image: jwt-auth-demo-backend:local`，只換 `command`，多一個 `KAFKA_BOOTSTRAP_SERVERS: redpanda:9092`。CI 的 `messaging` job：up → 註冊 → 等 consumer 的 log 出現那個 email → 查兩張表 → `rpk` 把 topic 裡那筆原封不動再送一次 → 等 `duplicate` → `processedevent` 還是 1 筆。

### ⚠️ 開始前

- Mac 路線同關卡 21（Docker）；Redpanda 的 image 約 200 MB。
- 本機路線不用裝任何東西：`backend/.env` 暫時加 `OUTBOX_WORKER=inline`。
- 線上已經是 inline 模式（`render.yaml`），**不用**在 Render 做任何事；Render Logs 搜 `published` 就看得到。
- 不碰付費：Kafka 的雲端服務這關不接。

### 驗證方式

1. `uv run pytest -q`（在 `backend/`）：`test_outbox.py` 8 個、`test_register_cap.py` 2 個都綠。
2. Mac：`--profile messaging up` 後註冊一筆，`logs worker` 有 `published … transport=kafka`、`logs consumer` 有 `consumed … email=<那個 email>`，`outboxevent.published` 是 `t`，`processedevent` 一列。
3. Mac：`rpk` 重送同一筆後 `logs consumer` 有 `duplicate`，`processedevent` 仍 1 筆。
4. 本機：`OUTBOX_WORKER=inline` 時註冊後 1 秒內 log 有 `published … transport=log`。
5. 線上：Render Logs 搜 `published` 有紀錄；Neon 的 `outboxevent` 最新一列 `published_at` 不是空。
6. GitHub Actions 的 Infra workflow：`messaging` job 有 `✅ 事件走完：outbox → Kafka → consumer`、`✅ 冪等：同一筆事件只處理一次`。

### 動手玩

（Mac 路線叢集開著時做；每題做完改回來、`down -v` 再 `up`）

1. **把 enqueue 搬到 commit 之後**：`routes/auth.py` 把 `enqueue(...)` 那行移到 `await session.commit()` 之後，`up -d --build backend`，註冊：`outboxevent` 多了一筆但 `user` 也多了，看起來沒差？再用已存在的 email 註冊一次（會 400）：事件還是被 add 了但沒 commit 所以沒進表……看起來也沒差。重點是跑測試：`uv run pytest -q tests/test_outbox.py` 第二個測試 `註冊失敗就沒有事件_同一個交易` 會抓到嗎？想想哪種失敗它抓得到（commit 本身失敗）、哪種抓不到。這題的答案是「這就是為什麼要寫在同一個交易，而不是靠測試」。改回來。
2. **worker 當掉事件不丟**：`stop worker`，註冊兩筆，`outboxevent` 兩列 `published` 都是 `f`；`start worker`，5 秒內變 `t`，consumer 收到兩筆。
3. **worker 開兩個不會送兩次**：`docker compose -f infra/compose.yaml --profile messaging up -d --scale worker=2`，註冊五筆，`logs worker | grep -c published` 是 `5` 不是 `10`，`processedevent` 五列。`SKIP LOCKED` 在擋。
4. **冪等拿掉會怎樣**：`outbox.py` 的 `handle_event` 把 `session.add(ProcessedEvent(...))` 到 `return False` 那段拿掉（直接 log `consumed`），`up -d --build consumer`，重做 COACHING 步驟 8：`consumed` 出現兩次、同一個 uuid。如果「做的事」是寄信，使用者就收到兩封。改回來。
5. **鈴的差別**：本機路線 `OUTBOX_WORKER=inline`、`.env` 再加 `OUTBOX_POLL_SECONDS=600`，註冊：`published` 還是 1 秒內出現（鈴）。再把 `routes/auth.py` 的 `wake_worker()` 註解掉重啟，註冊：要等到 600 秒（或重啟）才會 `published`。這就是 Render 設 600 秒還能即時送的原因。改回來。

### 想一想

<details>
<summary>Q1：既然有 Kafka，為什麼不讓 register 直接送 Kafka，還要先寫 outbox 表？</summary>

因為 Kafka 不參與資料庫的交易。直接送有兩種壞法：送了但 commit 失敗（通知了不存在的使用者），或 commit 了但送之前當掉（使用者沒被通知）。outbox 把「要送」這件事變成資料庫裡的一列，跟使用者同生共死；真的送出去是 worker 的事，失敗了下次再撿。多一張表，換來一致性。

</details>

<details>
<summary>Q2：at-least-once 會重複，為什麼不做 exactly-once？</summary>

跨系統的 exactly-once 非常貴、而且邊界很多（Kafka 自己的 exactly-once 只管 Kafka 內部）。業界做法是 at-least-once 送 + 冪等收：重複送很便宜，收的那邊用一個主鍵擋掉就好。這個組合的效果就是「看起來像 exactly-once」。

</details>

<details>
<summary>Q3：線上沒有 Kafka、事件只印到 log，那這關線上到底做了什麼？</summary>

做了前半段：註冊時 outbox 多一筆（同一個交易）、worker 撿出來、標 `published_at`。只有「送到哪」不同（log 而不是 Kafka）。所以線上的資料庫和程式已經是「可以接 Kafka」的狀態，接的時候只設一個環境變數。免費方案的限制在管道，不在設計。

</details>

<details>
<summary>Q4：為什麼 worker 要有 `OUTBOX_POLL_SECONDS=600` 這麼長的輪詢，又要有鈴？</summary>

兩個需求衝突：想即時送（短輪詢）又想讓 Neon 休眠省免費額度（長輪詢）。鈴解決即時：同一個程序裡註冊 commit 後叫醒 worker；長輪詢當保底：萬一鈴沒響（例如多副本時事件是別的副本寫的），最多 10 分鐘也會送。compose 和 k8s 裡 worker 是分開的程序聽不到鈴，所以那邊用 5 秒。

</details>

<details>
<summary>Q5：這個專案的 consumer 和後端共用資料庫，真實世界呢？</summary>

真實世界 consumer 是另一個服務（寄信服務、統計服務），有自己的資料庫，`processedevent` 在它那邊。事件裡只放 id 和必要欄位（不放密碼雜湊），因為它會離開這個系統。共用資料庫在這裡是為了一個 repo 看得到整條路；搬去練習專案時，consumer 可以直接是另一個 repo。

</details>

---

## 之後還可以自己摸的（不排關卡）

> 2026-10-22 註記：關卡 21～24 是後來加的基礎設施路線（`PLAN-INFRA.md`），下表的 docker compose 已做成關卡 21，Codespaces 在有了第二台有 Docker 的機器後不需要。

範例專案的程式到關卡 17 凍結（關卡 19 只多了 `Cache-Control: no-store`）；18～20 是觀念關（SQL、HTTP、除錯），全部 21 關（0～20）已完成。下面每一項都能用**任何 AI 工具**帶你做：把「開場提示的關鍵字」擴寫成一段，請它照 [`HANDOFF.md`](HANDOFF.md) 第 3 節的格式產出一關。

| 主題 | 一句話 | 開場提示的關鍵字 |
| --- | --- | --- |
| docker compose | 一個檔案同時起後端 + Postgres，本機不用裝 Postgres（要先有本機 Docker） | 「寫 `docker-compose.yml`，服務有 backend 和 postgres，用 `.env` 注入設定，說明 volume 是什麼」 |
| 自訂網域與 DNS | 把 `*.vercel.app` 換成自己的網域，HTTPS 自動 | 「說明 A / CNAME 記錄差別、Vercel 怎麼接自訂網域、HTTPS 憑證誰發」 |
| GitHub Codespaces | 瀏覽器裡的開發環境，有 Docker | 「幫這個 repo 寫 `.devcontainer`，讓 Codespaces 打開就能跑後端和前端」 |
| 分頁之間同步登入狀態 | 關卡 6 Q4 提到的 `BroadcastChannel` | 「一個分頁登出，其他分頁立刻跟著登出」 |
| Postgres Row Level Security | 授權檢查從程式搬到資料庫層 | 「說明 RLS 和在程式裡加 `WHERE user_id` 的取捨」 |

---

## Python 速查（給 JS/TS 背景的人）

| Python | JS/TS 對照 | 說明 |
| --- | --- | --- |
| `async def f():` / `await x` | `async function f()` / `await x` | 幾乎一樣，碰到 DB 操作就要 `await` |
| `str \| None` | `string \| null` | 型別標註，`None` 就是 `null` |
| `def f(x: int) -> str:` | `function f(x: number): string` | 參數和回傳值的型別 |
| `@decorator` | 類似 HOC / wrapper | 幫函式加功能 |
| `raise HTTPException(...)` | `throw new Error(...)` | 丟出錯誤，後面的程式碼**不會執行** |
| `f"hello {name}"` | `` `hello ${name}` `` | 字串插值 |
| `from x import y` | `import { y } from "x"` | 匯入 |
| `print(x)` | `console.log(x)` | 輸出在跑 uvicorn 的 terminal |

**FastAPI 專屬**

- `Depends(get_session)`：依賴注入，「FastAPI 幫我準備好一個 DB session」
- `Cookie(default=None)`：從 cookie 讀值
- `response_model=Token`：規定回傳的 JSON 長什麼樣子
- **`/docs`（Swagger）**：每個 API 都能直接在上面測，是除錯的好朋友
