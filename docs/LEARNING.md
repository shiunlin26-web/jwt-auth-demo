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
| 0 | 修 bcrypt 72 bytes 的 bug | Pydantic 驗證器、bytes 和字元的差別 | ✅ 完成 |
| 1 | Refresh token 輪替 + 重複使用偵測 + DB 存雜湊 + 前端 single-flight | **refresh token 的核心觀念**（最重要） | ✅ 完成 |
| 2 | 設定抽到 `.env`（pydantic-settings）、關 SQL echo、前端 `VITE_API_URL` | 設定管理 | ⬜ |
| 3 | 「登出所有裝置」、改密碼時撤銷所有 token | 把第 1 關拿來應用 | ⬜ |
| 4 | pytest 寫測試 | 學 Python 最好的方法，也能自動驗證前面幾關 | ⬜ |
| 5 | Alembic 資料庫遷移 | 為什麼不能一直用 `create_all` | ⬜ |
| 6 | 前端拆成 `api.ts` + `AuthContext` | 之後其他專案可以直接複製這一套 | ⬜ |
| 7（選做） | 登入頻率限制（slowapi） | 防暴力破解 | ⬜ |

---

## 關卡 0：修 bcrypt 72 bytes 的 bug ✅

**改動的檔案**：`backend/schemas.py`

### 觀念

bcrypt（密碼雜湊演算法）最多只能處理 **72 個 bytes**。原本的程式用 `Field(max_length=72)`，但它算的是**字元數**。

| 密碼 | 字元數 | bytes（UTF-8） |
| --- | --- | --- |
| `abcdefgh` | 8 | 8（英文 1 字 = 1 byte） |
| `密碼密碼密碼密碼` | 8 | 24（中文 1 字 = 3 bytes） |
| 30 個中文字 | 30 ✅ 通過 `max_length=72` | 90 ❌ 超過 bcrypt 上限 |

結果就是 30 個中文字的密碼能通過驗證，bcrypt 卻丟出 `ValueError`，API 回 **500**（伺服器錯誤）。正確的行為應該是回 **422**（你送的資料不合格）。

### 怎麼修

用 Pydantic 的 `@field_validator` 寫一個自訂驗證函式，自己計算 bytes 長度：

```python
@field_validator("password")
@classmethod
def check_password_bytes(cls, v: str) -> str:
    if len(v.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError("...")
    return v
```

- `@xxx` 叫 **decorator（裝飾器）**，意思是「幫下面這個函式加上功能」。這裡是把它註冊成 password 欄位的驗證器。FastAPI 的 `@router.post(...)` 也是同一個東西。
- 驗證器裡 `raise ValueError`，FastAPI 就會自動回 422。
- 驗證通過一定要 `return v`。

### 驗證方式

1. 啟動後端，打開 <http://localhost:8000/docs>
2. 用 `POST /auth/register`，password 填 30 個中文字，例如「密碼」重複 15 次
3. 應該回 **422**，訊息是「密碼太長…」
4. 換成 8 個中文字，應該註冊成功（201）

### 動手玩

1. 把 `return v` 那行刪掉，再註冊一次。會發生什麼事？（提示：看 terminal 的錯誤訊息）
2. 把 `BCRYPT_MAX_BYTES` 改成 `10`，試試看英文密碼 `abcdefghijk`（11 個字元）。
3. 在驗證器第一行加 `print("收到密碼：", v, "bytes 長度：", len(v.encode("utf-8")))`，註冊時看 uvicorn 的 terminal。

### 想一想

<details>
<summary>Q1：為什麼不直接在 hash_password 裡把密碼截斷成 72 bytes 就好？</summary>

bcrypt 的錯誤訊息確實建議 `my_password[:72]`，但截斷代表「前 72 bytes 一樣的兩個密碼會被當成同一個」。明確拒絕太長的密碼比偷偷截斷安全，也比較不會讓使用者困惑。

</details>

<details>
<summary>Q2：回傳的 422 錯誤裡有一個 <code>input</code> 欄位，裡面是什麼？這在正式環境有什麼問題？</summary>

`input` 會把使用者送來的原始密碼原封不動回傳。正式環境最好不要在錯誤訊息裡回傳密碼，因為它可能被 log 或監控工具記錄下來。可以留到之後的關卡處理（自訂 `RequestValidationError` 的 handler）。

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

1. 把 `backend/.env` 的 `JWT_EXPIRE_MINUTES` 改成 `0`，重啟後端（access token 一簽出來就過期，每次呼叫 `/me` 都會 401）
2. 登入，打開 DevTools → Network，把節流（throttling）設成 **Slow 4G**，讓請求變慢，比較容易同時發生
3. 快速連點「取得我的資料」三下
4. Network 裡會看到 3 個 `/me` 401，但 **`/auth/refresh` 只有 1 個**，而且沒有被登出

（retry 的 `/me` 還是 401，是因為新的 access token 也馬上過期了，正常。玩完記得把 `JWT_EXPIRE_MINUTES` 改回來。）

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

---

## 關卡 2 ～ 7

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
