# 學習路線：把 JWT 登入練到接近生產級

這份文件記錄這個專案的練習路線。目標有兩個：

1. 在本地一步步理解「access token + refresh token」登入架構
2. 練完之後，這個專案就是之後其他專案做登入時的**參考範本**

不需要部署、不需要 CI，全部在本地、用免費工具完成。

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

---

## 路線圖

| 關卡 | 主題 | 會學到 | 狀態 |
| --- | --- | --- | --- |
| 0 | 密碼規則（修 bcrypt 72 bytes 的 bug） | Pydantic 驗證器、bytes 和字元的差別、註冊與登入分開驗證 | ✅ 完成 |
| 1 | Refresh token 輪替 + 重複使用偵測 + DB 存雜湊 + 前端 single-flight | **refresh token 的核心觀念**（最重要） | ✅ 完成 |
| 2 | 設定抽到 `.env`（pydantic-settings）、關 SQL echo、前端 `VITE_API_URL` | 設定管理 | ✅ 完成 |
| 3 | 「登出所有裝置」、改密碼時撤銷所有 token、清理過期 token | 把第 1 關拿來應用 | ✅ 完成 |
| 4 | pytest 寫測試 | 學 Python 最好的方法，也能自動驗證前面幾關 | ⬜ |
| 5 | Alembic 資料庫遷移 | 為什麼不能一直用 `create_all` | ⬜ |
| 6 | 前端拆成 `api.ts` + `AuthContext` | 之後其他專案可以直接複製這一套 | ⬜ |
| 7（選做） | 登入頻率限制（slowapi） | 防暴力破解 | ⬜ |

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

這個麻煩就是第 5 關要學 Alembic 的原因，先記住這種感覺。

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
   pip install -r requirements.txt
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

## 關卡 4 ～ 7

做到時再補上詳細內容。

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
