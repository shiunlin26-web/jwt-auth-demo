# COACHING.md：帶著做（給帶學習者的 AI）

> 學習者的回饋是帶著做理解最快（2026-10-20 定案），從此之後，**所有關卡預設用這個方式帶**。
> 第 1 節是方法（怎麼帶），第 2 節是走完整個專案的排法，第 3 節是每一關的帶做腳本（帶什麼）。接手帶人先讀 `HANDOFF.md`，開一關之前讀這份對應的那一關。
> `LEARNING.md` 仍然是每一關的完整內容與歷史紀錄，這份不取代它，是它的「操作版」。

## 1. 方法：一次一步，他貼輸出，你從輸出講

### 一步的固定格式

1. **給一個可以直接貼的指令**（最多兩個，第二個不能依賴第一個的結果）。學習者是 Windows PowerShell：`curl.exe` 不是 `curl`、JSON 的引號寫 `\"`、路徑用反斜線、迴圈用 `1..11 | ForEach-Object { ... }`。
2. **說「預期看到什麼」，用數字或字串**：`401`、`"Refresh token reused"`、`67 passed`、`Max-Age=604800`。**不要描述畫面長相**（「會轉圈圈」「右下角有個按鈕」），畫面會記錯；2026-10-20 帶關卡 18 時猜錯 Neon 的畫面，學習者跑了好幾次才發現是帶的人記錯。
3. **說「看哪裡」**：輸出的哪一行、哪個欄位、`>` 還是 `<` 開頭。
4. **等他貼輸出**。不要先講下一步。
5. **從他貼的輸出講**：引用他貼的實際值（「你這串 `zfGh9...` 和登入那次的 `i5cvGY...` 不一樣」），一行一行說這行是什麼、對應程式哪一個檔案第幾行。沒出現在他輸出裡的東西不要講。
6. 下一步。

### 規則

- **開始前先確認環境**：跑過 `scripts\setup.ps1`、前後端起來、`uv run pytest -q` 綠。沒跑過就先帶他跑（`README.md`「每次開機怎麼把專案跑起來」）。
- **先名詞、再在哪看、最後邏輯**。程式邏輯不用逐行講（`HANDOFF.md` 第 1 節的程度校準）。新名詞第一次出現就解釋（Bearer、Origin、Path、系統表），不要先用後解釋。
- **一次只有一個主題**。步驟之間不要塞額外知識，想補充的留到那關收尾。
- **問之前先確認每個問的東西都有答案值得講**（曾經問了罐子的「兩個 FALSE」，答完才說第一個不重要，這會讓人覺得白問）。一次只問有意義的那一兩格。
- **名詞先定義再用，而且每個關鍵名詞都要有一個比喻**（曾經雜湊、SHA-256、bcrypt、鹽、簽章沒先講就拿來用，整關跟著亂；標準是沒有背景的人也聽得懂）。同一類東西有好幾個時（兩張票、三種工具），每次提到都要指名是哪一個，不要只說「票」。
- **他貼的輸出亂掉**（兩個指令疊在一起、終端機把上一個的尾巴接上來）：先說「結果是對的，前面是終端機疊在一起」，直接講，不要叫他重跑。
- **他說「看不懂」**：不要整段換個說法重講。問「哪一行」，或從他最後貼的輸出重新開始，一次講一行。
- **他說「我沒看到你說的東西」**：相信他，是你記錯了。改成用指令、數字或檔案內容驗證，不要再描述畫面。
- **每個實驗結束一句話「這證明了什麼」**。一關結束用「你看到的 → 對應的觀念」表格收尾，**收尾之後要問「哪一步要我再講一次？」**，他說沒有再進下一關（關卡 19 曾經收尾講太快）。
- **一關的收尾有三段，缺一不可，而且不要催**（關卡 0 曾經因為催太快，被要求先整理好再往下）：(1) 用一個情境把整關脈絡從頭講一遍（一個請求走幾站、每站誰在做、出錯回什麼）；(2) 出 5～7 題讓他用自己的話答，題目要蓋到這關的每個觀念；(3) 逐題對答案，對一半的說清楚缺哪一半，錯的用情境重講，再補一輪只問錯的。最後給一份「整理」：一句話、脈絡表、狀態碼表、規則、他誤解過的地方。**他說「下一關」才開下一關**，不要在收尾訊息的結尾就塞下一關的第一步。
- **出題只問他打得開的程式**（曾經問「關卡 2 之前的 `os.getenv` 寫法會怎樣」，那段程式已經不在 repo 裡，他沒地方看）。要問歷史版本，先給 `git show <commit>~1:<檔案>` 讓他看到再問。
- **改了任何程式檔（包括只加註解）之後，grep 文件裡所有引用那個檔案的行數**：`grep -n "<檔名>" docs/*.md` 一個一個對。曾經給 `security.py` 檔頭加了 14 行註解，關卡 1、2 引用它的六個行數全部沒跟著改，另一個對話核對才發現。合併別人的分支之後也要做一次。
- **需要他改程式的步驟**（動手玩）：給檔案路徑、改前一行、改後一行，最後一定寫「改回來：`git checkout -- <檔案>`」。
- **會碰到付費門檻的步驟先說**（`AGENTS.md`）。
- **一關帶完更新 `HANDOFF.md` 第 2 節的「觀念關的帶做進度」**，寫到哪一關、哪一步。
- 驗收還是他的事：你給預期值，他回報，對不上就一起找原因，不要替他說「過了」。

### 學習循環（跟技術棧無關，每關、每個練習專案的每一環都照這六步）

1. **先知道它解決什麼問題**：三句白話，不看程式（`PLAIN.md`）。
2. **一個指令，看輸出，對應到程式的那一行**：從輸出倒回去找程式，不是讀整個檔案（本文件第 3 節）。
3. **弄壞一個東西，看它怎麼壞**：改一行、看錯誤、改回來（「動手玩」、`docs/drills/`）。
4. **用自己的話講一遍**：講不出來就是沒懂，回到第 2 步（「想一想」、每關收尾表）。
5. **寫一行筆記**：「看到什麼 → 代表什麼」，寫在他自己的筆記裡，隔天看得懂才算。
6. **隔幾天用指令再驗一次**：不看筆記直接跑，說得出預期值才是真的會了。帶下一關開頭時，先抽前一關的一步讓他重跑。

練習專案的變化：第 2 步變成「他先寫驗收標準，AI 做完他用指令驗」（`CHAIN.md` 每一環的驗收標準）。

### 腳本的格式

每一關：**前置**（要開什麼、要有什麼帳號）→ **步驟表**（步 / 指令或操作 / 預期 / 看到之後講什麼）→ **收尾表** → **可選的動手玩**（指到 `LEARNING.md` 那關的編號，不重抄）。指令以現在的程式為準（`/api/...`、`uv run`），`LEARNING.md` 關卡 0～8 寫的是當時的舊路徑。

下面用到的帳號：`t@test.com` / `Passw0rd!x`（不存在就先在步驟裡註冊）。要查資料庫時用 Neon 的 SQL Editor。

---

## 2. 走完整個專案的排法（2026-10-20 學習者決定：從關卡 0 重新帶一遍）

之前的關卡是 AI 做、學習者驗收，沒有一步一步帶過。現在從頭帶一遍，兩種節奏：

| 節奏 | 關卡 | 每關時間 | 做法 |
| --- | --- | --- | --- |
| **仔細走** | 0、1、2、3、4、5、8、12、17、18、19、20 | 1～2 小時 | 第 3 節的腳本全部做完，收尾表、問「哪一步再講一次」、至少一個動手玩 |
| **快速走** | 6、7、9、10、11、13、14、15、16 | 20～30 分鐘 | 讀 `PLAIN.md` 那段，只做腳本的前兩步親眼看一次就過。9、10、11 只看 log，不改平台設定 |

順序照編號。每天約 4 小時，預計 5～7 天。走到哪記在 `HANDOFF.md` 第 2 節。關卡 21～24（基礎設施，`PLAN-INFRA.md`）等重帶走完再開始，一週一關：有 Docker 的機器走「Mac 路線」仔細做，沒有的走「VM 路線」看 CI 的 log，兩條路線的預期值一樣。仔細走的關如果他說「這個我已經懂了」，抽腳本中間一步讓他講預期值，講得出就跳過。

## 3. 每一關的帶做腳本

### 關卡 0：密碼規則

**搭配看的程式**：`backend/schemas.py` 第 10～45 行（`PRINTABLE_ASCII`、`check_password_chars`、`UserCreate`、`UserLogin`）；`backend/routes/auth.py` 第 79～130 行（`register`；關卡 24 在裡面多了上限檢查、flush、outbox、叫醒 worker 這幾段）；`backend/security.py` 的 `hash_password`、`verify_password`；`frontend/src/schemas/auth.ts` 的 `passwordSchema`

**前置**：後端跑起來。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s -i localhost:8000/api/auth/register -H "Content-Type: application/json" -d '{\"email\":\"t@test.com\",\"password\":\"abc1234\"}'` | `422`，`detail` 是陣列，`type` 是 `string_too_short`、`msg` 是英文 `at least 8 characters` | 422 是「格式不對」。擋在 `backend/schemas.py` 的 `min_length`（Pydantic 內建，所以是英文），還沒碰到資料庫；`detail` 的四個欄位 `loc`、`type`、`msg`、`input` |
| 2 | 同上，密碼換 `中文密碼中文密碼` | `422`，`type` 是 `value_error`、`msg` 是中文「只能包含英文字母」 | 自己寫的驗證器 `check_password_chars`（`schemas.py:16`），所以是中文。bcrypt 只看前 72 個 **byte**，一個中文字 3 個 byte。與其默默截掉不如老實擋。PowerShell 畫面上指令會顯示 `????`，看回應的 `input` 確認送的是中文 |
| 3 | 同上，密碼換 `('a'*73)`：`-d ('{\"email\":\"t@test.com\",\"password\":\"' + ('a'*73) + '\"}')` | `422`，「最多 72」 | 72 這個數字就是 bcrypt 的上限 |
| 4 | 同上，密碼 `Passw0rd!x` | `201`，內容有 `id`、`email`，沒有密碼；多了 `x-ratelimit-*` | 201 是「成功而且建立了東西」。422 沒有 `x-ratelimit-*` 是因為擋在進函式之前，頻率限制掛在函式上 |
| 5 | 再跑一次步驟 4 | `400`，`detail` 是一句字串 | 400 是「你送的東西有問題」。`detail` 字串 = `routes/auth.py` 自己 raise 的 `HTTPException`，陣列 = Pydantic。順便講 `register` 四塊：函式頭（裝飾器、`data: UserCreate`、`Depends`）、查重、建立（明碼只活到 `hash_password`）、commit 的 `try/except IntegrityError`（資料庫例外不翻譯成 HTTPException 就是 500）。關卡 24 之後中間多了兩段先跳過：`MAX_USERS` 額滿回 503（示範站的保險）、`flush` + `enqueue` 把「有人註冊了」事件和使用者寫進同一個交易，關卡 24 再講 |
| 6 | 用 7 個字元的密碼**登入**：`-d '{\"email\":\"t@test.com\",\"password\":\"abc1234\"}'` 打 `/api/auth/login` | `401`，不是 422 | 登入不檢查密碼規則，只回「帳號或密碼錯」，不給攻擊者線索 |
| 7 | 瀏覽器 `localhost:5173/register`，密碼打 `short` | 按鈕不能按、出現提示文字 | 前端驗證是體驗，後端驗證是安全，規則兩邊各一份 |
| 8 | 在 `backend`：`uv run python -c "from schemas import UserCreate; UserCreate(email='a@b.com', password='abc')"` | traceback，最後一行 `ValidationError: 1 validation error for UserCreate`，上面兩行是 `pydantic/main.py` 的 `__init__` | Pydantic 在「建物件」那一刻丟錯，FastAPI 接住轉成 422，`register` 沒被呼叫。traceback 從最後一行往上讀（關卡 20 第 2 條）。`uv` 找不到：`$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"` |
| 9 | 3 個中文字註冊：`-d '{\"email\":\"t@test.com\",\"password\":\"中文字\"}'`（先讓他猜一個錯還是兩個） | `422`，**只有一個** `string_too_short`，`input` 是中文 | `Field(min_length)` 先跑、`@field_validator` 後跑，前面沒過就停，所以一個欄位一次只報一個錯。**不要用 `python -c` 測中文**：PowerShell 會把中文變成 `???`，只有 curl 這條路中文活得下來 |

| 10 | email 和密碼同時填壞：`-d '{\"email\":\"abc\",\"password\":\"abc\"}'` | `422`，`detail` 有**兩個**物件，`loc` 分別是 `email`、`password` | 陣列是為了裝多個欄位的錯；每個欄位仍然只報第一條沒過的規則。這是 Pydantic 的行為，不是 HTTP 的規定 |

**收尾一句話**：422 格式錯、400 內容不能收、401 你是誰我不認得、500 我壞了。前三個是「你的問題」，最後一個是「我的問題」。
**收尾要講到**：驗證器有順序（一個欄位一次一個錯、多個欄位各報一個）/ 例外只認 `HTTPException` 和驗證失敗，其他不翻譯就是 500，但只翻譯預料得到的 / 400 的 `detail` 形狀是前後端約定，本專案自己 raise 的一律字串（`getErrorMessage` 只認字串和 Pydantic 陣列）/ 401 只能用在身分問題，因為攔截器會去 refresh / 登入不查規則 / 明碼只活到 bcrypt 那行，前端先 hash 沒用（hash 會變成密碼本身）/ 輸出形狀由 `response_model=UserRead` 決定。
**他誤解過的地方（2026-10-20，出題時針對這些）**：「422 一次一個錯是為了保密」（是順序）；「500 是認得的那兩種」（反了）；「其他例外都要 try/except」（只接預料得到的）；「回應沒密碼是存進去那行決定的」（是 `response_model`）；「前端 hash 是重複 hash 的問題」（是 hash 變成密碼本身）；「400 是包裝認不得的例外」（是「內容不能收」，自己檢查到的也回 400）。
**動手玩**：`LEARNING.md` 關卡 0 的 1、3。

### 關卡 1：Refresh token 輪替與重複使用偵測

**搭配看的程式**：`backend/routes/auth.py` 的 `set_refresh_cookie`（29）、`issue_refresh_token`（42）、`revoke_all_refresh_tokens`（55）、`login`（136）、`refresh`（177）；`backend/security.py` 的 `_hash_password_sync`（29）、`create_access_token`（59）、`decode_access_token`（69）、`create_refresh_token`（80）、`hash_token`（89）；`backend/models.py` 的 `RefreshToken`；`frontend/src/api/client.ts` 的 `refreshPromise`（42～55）與 response 攔截器（74～97）

**前置**：後端跑起來、帳號存在。這關和關卡 19 共用同一套 curl，先帶哪一關都可以。

**先講名詞，再開始**（2026-10-21 帶做時沒先講，後面全部跟著亂）：
- **雜湊**：碎紙機加印表機。丟一張紙進去，出來一條固定長度的亂碼；同一張紙永遠同一條；從亂碼拼不回紙。
- **SHA-256**：快的雜湊機，同樣輸入永遠同樣輸出，64 字。給 refresh token 用，因為票是隨機的猜不到、而且要拿雜湊當 key 查表。
- **bcrypt**：給密碼用的雜湊機，慢（成本 12 = 揉 4096 遍 = 約 0.1 秒一次）而且每次撒一把隨機的「鹽」，同一個密碼每次結果不同。輸出固定格式 `$2b$12$` + 22 字鹽 + 31 字結果，鹽不是祕密，直接寫在裡面；驗證時先用 email 找到人，從他那串讀出鹽、重算、比對。慢是為了讓小偷猜很多次划不來（你付一次 0.1 秒，他付幾百萬次）；鹽是為了讓同一個密碼在不同人那裡結果不同、事先算好的表沒用。
- **簽章**（access token 用的）：不是加密。內容誰都看得懂，但改一個字就對不上；只有拿 `JWT_SECRET` 的後端算得出正確簽章。
- **三樣東西三種工具**：密碼 → bcrypt（存起來比對）；refresh token → SHA-256（存起來查表）；access token → 簽章（不存，驗簽）。
- **每次說「票」都要指名是哪張**。整關的罐子、cookie、名冊、作廢、刪除、reused、Invalid 全部是 **refresh token** 的事；access token 沒有「舊的」這回事，過期就丟。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s -c jar.txt localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"t@test.com\",\"password\":\"Passw0rd!x\"}'` 然後 `type jar.txt` | JSON 有 `access_token`；罐子最後一行 `#HttpOnly_localhost FALSE /api/auth FALSE <秒數> refresh_token <43 字>` | 罐子 = curl 存 cookie 的檔案，模擬瀏覽器。只問 `/api/auth`（Path：只有打這路徑才帶）和**第二個** `FALSE`（Secure 沒開，http 也送；正式是 TRUE）。第一個 FALSE 是 curl 內部欄位，**不要問**。43 字 = `secrets.token_urlsafe(32)`：32 個隨機 byte 用 base64 印成可讀的字（3 byte → 4 字，所以 43）。`set-cookie` = 後端請瀏覽器把這張存起來 |
| 2 | `curl.exe -v -b jar.txt -c jar.txt -X POST localhost:8000/api/auth/refresh` | `>` 有 `Cookie: refresh_token=舊值`；`<` 有 `set-cookie: refresh_token=新值`；`* Replaced cookie` | `-b`/`--cookie` 從罐子帶出去、`-c`/`--cookie-jar` 存回來，是 curl 自己的參數（`curl.exe --help all \| Select-String cookie`）。後端五段：`Cookie(...)` 取票（179）→ `hash_token` 查表、`with_for_update` 鎖（191～195）→ 舊的 `revoked = True`（229）→ `issue_refresh_token` 發新的（230）→ `set_refresh_cookie` + 新 access token（233～237）。瀏覽器平常同時做 `-b` 和 `-c`，自動的 |
| 3 | 舊值已不在罐子裡，用字串帶：`curl.exe -s -i -b "refresh_token=<步驟 1 的 43 字>" -X POST localhost:8000/api/auth/refresh` | `401`，`Refresh token reused` | 票**還在**表裡，`revoked = true` 又被送來 → 當成被偷 → `revoke_all_refresh_tokens` 把這個人全部的 refresh token **刪掉**（62 行是 `delete`，不是標記）。先讓他猜：罐子裡的新票還能用嗎 |
| 4 | `curl.exe -s -i -b jar.txt -X POST localhost:8000/api/auth/refresh` | `401`，`Invalid refresh token` | 票**不在**表裡（201 行）。兩句 401：`reused` = 還在但蓋章，`Invalid` = 查不到。輪替是標記（留證據），重用偵測是刪除（全清） |
| 5 | Neon SQL Editor **先確認選的是 `DATABASE_URL` 那個資料庫**（關卡 18 用的是 `TEST_DATABASE_URL`，Editor 會停在那裡；`Get-Content backend\.env \| Select-String DATABASE_URL` 看資料庫名）。跑 `SELECT count(*) FROM refreshtoken WHERE user_id = <他的 id>;` | `0` | 和步驟 4 對上。資料庫不對會查到「都沒有」 |
| 6 | 重新登入（步驟 1），再查 `SELECT token_hash, revoked, created_at FROM refreshtoken WHERE user_id = <id>;`，然後在 `backend` 跑 `uv run python -c "from security import hash_token; print(hash_token('<罐子裡的 43 字>'))"` | 一筆 `revoked = f`，`token_hash` 64 字；自己算出來的跟資料庫**一模一樣** | 資料庫只有 SHA-256 亂碼，沒有原值。後端收到 cookie 就是這樣找到那筆：原值 → SHA-256 → `WHERE token_hash =`。`hashlib.sha256(token.encode()).hexdigest()`：文字變 byte → 雜湊 32 byte → 印成 64 個 16 進位字 |
| 7 | **前端 single-flight**。不要等 token 過期（TanStack 的自動重抓會搶先換票）：瀏覽器登入，DevTools Network 清空，Console 第一次貼要先打 `allow pasting` Enter，再貼 `const s = await import("/src/auth/authStore.ts"); const m = await import("/src/api/auth.ts"); s.useAuthStore.getState().setAccessToken("bad"); await Promise.all([m.getMe(), m.getMe(), m.getMe()]);` | Network 照順序：`me 401, me 401, me 401, refresh 200, me 200, me 200, me 200` | `client.ts:42` 的 `refreshPromise`：第一個 401 發 refresh 並把「進行中的 Promise」存進變數；第二、三個看到不空就不發，一起等；`finally` 清空。改成 `if (true)` 會變 3 個 refresh、後兩個 `reused`、整排刪掉、`clearSession` 登出。用時間軸表（t0～t5）講 A/B/C 三個請求 |
| 8 | **access token 怎麼生、怎麼驗**（在 `backend`）：`uv run python -c "from security import create_access_token, decode_access_token; t = create_access_token(9); print(t); print(decode_access_token(t))"`，再跑 `... decode_access_token(t[:-1] + 'x')"` | 第一個印 `eyJ...` 和 `{'sub': '9', 'iat': ..., 'exp': ...}`；第二個最後一行 `InvalidSignatureError` | `jwt.encode`：標頭、payload 各 base64，兩段 + `JWT_SECRET` 算 HMAC-SHA256 當第三段。`jwt.decode`：用同一個祕密重算簽章比對、看 `exp`、`require` exp/sub。不查資料庫，所以快，也所以偷了只能等過期。呼叫它的是 `dependencies.py` 的 `get_current_user` |
| 9 | **bcrypt 鹽每次不同**：`uv run python -c "from security import _hash_password_sync as h; print(h('Passw0rd!x')); print(h('Passw0rd!x'))"` | 兩行都 `$2b$12$` 開頭 60 字，後面完全不同 | 同一個密碼兩次結果不同 = 鹽每次重擲 = 不能拿來查表 = 所以密碼是「email 找人再比對」，票是「雜湊當 key 查表」。`$2b$12$` 的 12 是成本 |

**收尾一句話**：兩張票分工，短的常換、長的能作廢；換票舊票蓋章，舊票再現整排刪掉，前端保證同時只換一次。密碼猜得到所以要慢要鹽；票猜不到所以要快要固定；access token 不存所以用簽章。
**收尾要講到**：refresh token 的一生（登入發、換票蓋章發新、舊的再現整排刪、本人查不到重登）/ 兩句 401 的差別 / 兩張票對照表（活多久、放哪、怎麼送、資料庫有沒有、怎麼驗、被偷怎樣）/ 三樣東西三種工具 / 偷到 bcrypt 雜湊不能直接登入，只能離線猜，外洩時全部重設是慣例。
**他誤解過的地方（2026-10-21）**：「做 SHA-256 查表的是 access token」（是 refresh token；access token 不存資料庫）；「`Path=/` 會每個請求都換票」（只是每個請求都帶，`/api/me` 不讀它，行為不變、曝光變多）；「舊票被標記所以查不到」（重用偵測是刪除不是標記）；「鹽是扣掉密碼算出來的」（鹽直接寫在那串前面）；「加密」vs「簽章」；三個 refresh 裡「都拿舊票」（第一個成功，後兩個才是舊票）。
**動手玩**：`LEARNING.md` 關卡 1 的 1、3（用關卡 16 的 `npm test` 也看得到）。

### 關卡 2：設定管理

**搭配看的程式**：`backend/config.py` 的 `Settings`（20～102，每個欄位一個設定；25 行 `env_file`、26 行 `extra="ignore"`、94 行 `cors_origin_list`、102 行 `settings = Settings()`）；`backend/.env.example`；`backend/routes/auth.py:37`（`max_age` 用設定算）；`backend/security.py:85`（`refresh_token_expiry` 用同一個設定）；`backend/main.py` 的 `CORSMiddleware`；`frontend/vite.config.ts:32` 的 `proxy`

**前置**：後端能跑。**每一步改完 `.env` 都要 `Ctrl+C` 手動重啟**，`--reload` 只監看 `.py`，不看 `.env`（曾經改了 `.env` 以為沒效果，其實沒重啟）。

**先講名詞**：設定（會因機器而不同的值）、環境變數（作業系統給程式的「名字 = 值」）、`.env`（環境變數寫成檔案，永遠不進 git，Render 上沒有這個檔改用平台的環境變數頁）、fail fast（缺了啟動就死，不等人登入才 500）。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `backend\.env` 的 `JWT_SECRET=` 那行**行首**加 `#`，存檔，`Ctrl+C`，`uv run uvicorn main:app --reload --port 8000` | 起不來，最後三行 `ValidationError: 1 validation error for Settings` / `jwt_secret` / `Field required [type=missing, ...]` | fail fast：錯在 import 那一刻（traceback 裡 `main.py` 的 `from config import settings` → `config.py:102`），伺服器沒開始聽 8000。**`#` 加在 `=` 後面不算註解**，會變成密鑰的一部分照樣合法（學習者撞過）。順便教 traceback：從最後一行往上，只看「專案路徑且沒有 `.venv`」的那幾組，`.venv\Lib\site-packages\` 是裝在專案裡的套件、`AppData\...\python` 是 Python 本身、`<frozen importlib>` 是 import 機制，全部跳過；啟動錯誤的 traceback 特別長（疊了 uvicorn 子程序和 import 鏈），平常請求出錯大約 10 行。`input_value={...}` 會印出其他設定的一部分，正式環境 log 不能隨便貼 |
| 2 | 拿掉 `#`，加 `DB_ECHO=true`，重啟，另一個視窗 curl 登入一次 | uvicorn 視窗：啟動時三句 `select pg_catalog.version()`、`current_schema()`、`show standard_conforming_strings`（SQLAlchemy 第一次連線問版本，跳過）；登入那下 `BEGIN` → `SELECT "user"... WHERE email = $1` → `UPDATE "user" SET last_login_at` → `DELETE FROM refreshtoken WHERE ... expires_at <` → `INSERT INTO refreshtoken (token_hash, ...)` → `COMMIT` | 一句 SQL 對一行 `login`：SELECT = 143 行找人；bcrypt 和簽章沒有 SQL（Python 裡做）；UPDATE = 163 行改屬性 ORM 自動變 UPDATE；DELETE = 166 行清過期；INSERT = 169 行存雜湊；COMMIT = 170 行才真的寫。INSERT 參數裡印出 64 字 token 雜湊 → 這就是 `DB_ECHO` 只能本機開的理由（另一個理由：正式環境每個請求幾行 SQL 會灌爆 log）。`$1::VARCHAR` 是參數化，SQL injection 擋在這。第一次登入 `duration_ms` 幾千是 Neon 冷啟動，再打一次會掉到 100 多 |
| 3 | 加 `REFRESH_TOKEN_EXPIRE_DAYS=1`，重啟，`curl.exe -s -i` 登入 | `set-cookie` 的 `Max-Age=86400`（原本 604800） | 數字走的路：`.env` 字串 `"1"` → `config.py:37` 轉 int 蓋掉預設 7 → `routes/auth.py:37` 算 `max_age` → 同一個設定 `security.py:85` 算資料庫 `expires_at`。一個設定、一處定義、兩處用 |
| 4 | 不重啟，在 `backend`：`uv run python -c "from config import settings; print(settings.refresh_token_expire_days, type(settings.refresh_token_expire_days)); print(settings.db_echo, type(settings.db_echo)); print(settings.cors_origin_list)"` | `1 <class 'int'>` / `True <class 'bool'>` / `['http://localhost:5173']` | `.env` 全是字串，欄位的型別標註決定轉成什麼；`cors_origin_list` 是 94 行的 property 把 `"a,b"` 切成 list。**這個指令是「改了設定沒生效」的萬用檢查**：印的是 `Settings` 真的讀到的值，沒重啟、改錯檔、名字打錯（26 行 `extra="ignore"` 會安靜忽略）、系統環境變數蓋掉（優先於 `.env`、最陰因為不在任何檔案裡）四種原因都抓得到 |
| 5 | 刪掉 `REFRESH_TOKEN_EXPIRE_DAYS=1` 和 `DB_ECHO=true`，重啟 | `.env` 回原狀 | |
| 6 | 整個 `.env` 改名（`Rename-Item .env .env.bak`），重啟，看完改回來 | `2 validation errors`：`database_url`、`jwt_secret` | 必填的一次全列出來（不同欄位各報一個，和關卡 0 的規則一樣）。可以當題目讓他先猜幾個 |

**收尾一句話**：會因機器而不同的值集中在 `config.py` 一個 class，從 `.env` 或系統環境變數讀，自動轉型別，缺了就起不來。
**收尾要講到**：一個設定值走的路（`.env` → `Settings` 欄位 → `settings` 物件 → 用的地方）/ 關卡 2 之前 `os.getenv` 找不到回 `None` 不報錯，後端照常起來，第一個人登入 `jwt.encode(payload, None)` 才 500，這關把錯誤提前到啟動 / `.env` 的 `#` 只有行首才是註解 / `--reload` 不看 `.env` / 正式環境沒有 `.env`，Render 環境變數填同樣名字程式不改 / traceback 讀法。
**出題注意**：只問他打得開的程式。「`os.getenv` 的舊寫法會怎樣」這種題他沒地方看，要問就先給 `git show <關卡 2 的 commit>~1:backend/security.py` 讓他看到再問。
**他誤解過的地方**：「舊寫法 `.env` 沒填後端起不來」（反了，起得來，登入才 500）；「改了 `AUTH_RATE_LIMIT` 沒 429 是標頭的問題」（是沒重啟 / 沒讀到，先跑萬用檢查）。
**動手玩**：`LEARNING.md` 關卡 2 的 3（自己加一個設定，很短）。

### 關卡 3：登出所有裝置、改密碼

**搭配看的程式**：`backend/routes/auth.py` 的 `delete_expired_refresh_tokens`（65）、`logout`（241）、`logout_all`（266）、`change_password`（286）；`backend/schemas.py` 的 `ChangePasswordRequest`；`frontend/src/pages/SettingsPage.tsx`

**前置**：後端跑起來、帳號存在。用兩個 cookie 罐模擬兩台裝置。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 登入兩次，分別存 `a.txt`、`b.txt`（`-c a.txt`、`-c b.txt`），把第一次回的 `access_token` 複製起來 | 兩個罐子裡的值不一樣 | 同一個帳號兩台裝置，各有自己的會員卡 |
| 2 | 用 A 的 token 改密碼：`curl.exe -s -i localhost:8000/api/auth/change-password -b a.txt -c a.txt -H "Authorization: Bearer <A的token>" -H "Content-Type: application/json" -d '{\"current_password\":\"Passw0rd!x\",\"new_password\":\"Passw0rd!y\"}'` | `200`，有新的 `access_token` 和新的 `set-cookie` | 改密碼的人自己不被登出 |
| 3 | `curl.exe -s -i -b b.txt -X POST localhost:8000/api/auth/refresh` | `401`，`Invalid refresh token` | B 的會員卡被作廢了，重新整理就會掉登入。但 B 手上還沒過期的 access token 仍然能用 30 分鐘，這是設計上的取捨 |
| 4 | 用舊密碼登入 → `401`；用新密碼登入 `-c b.txt` → `200` | | 改完要把密碼改回 `Passw0rd!x`，再跑一次步驟 2 |
| 5 | 目前密碼故意打錯跑步驟 2 | `400`，不是 401 | 400 和 401 的分工：401 會讓前端攔截器以為 token 過期去 refresh |
| 6 | `curl.exe -s -i -X POST localhost:8000/api/auth/logout-all -H "Authorization: Bearer <token>"` 後，兩個罐子都去 refresh | `204`，然後兩個都 `401` | 204 是「成功、沒內容」 |

**收尾**：改密碼 = 自己換新票、別人全作廢 / 登出所有裝置 = 全作廢 / access token 的 30 分鐘是接受的風險。
**動手玩**：`LEARNING.md` 關卡 3。

### 關卡 4：自動化測試（pytest）

**搭配看的程式**：`backend/tests/conftest.py`（測試資料庫、`client`、`make_client`）、`helpers.py`、`test_auth.py`、`test_rules.py`；`backend/pyproject.toml` 的 pytest 設定

**前置**：`backend\.env` 有 `TEST_DATABASE_URL`。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `uv run pytest -q`（在 `backend`） | 最後一行 `67 passed`（數字以輸出為準；關卡 21 起又加了十幾個） | 這些測試就是關卡 0～3 你用 curl 做過的事，機器代勞 |
| 2 | `uv run pytest -q --collect-only -q \| Select-Object -First 25` | 一行一個測試名稱，中文的 | 名稱就是規格：`test_舊的refresh_token再被使用會撤銷全部` 對應關卡 1 步驟 3、4 |
| 3 | `uv run pytest -q -k 撤銷全部 -v` | `1 passed`，名稱印出來 | `-k` 挑名字裡有這個字的測試 |
| 4 | `backend\routes\auth.py` 找到 `rt.revoked = True`（refresh 裡那行），前面加 `#`，`uv run pytest -q -x` | 第一個紅的就停（`-x`），名稱和「撤銷」「換發」有關；最後幾行有 `assert` 和實際值 | 從最後一行往上讀：期望什麼、實際拿到什麼。改回來：`git checkout -- backend/routes/auth.py` |
| 5 | 打開 `backend/tests/test_auth.py`，找步驟 3 那個測試 | 看得到：登入、refresh、拿舊 cookie 再 refresh、assert 401 | 測試的三段：準備、動作、斷言。和你 curl 做的一模一樣 |

**收尾**：測試是把 curl 的步驟寫成程式 / 紅了先讀最後幾行 / `-k`、`-x`、`-v` 三個參數夠用。
**動手玩**：`LEARNING.md` 關卡 4 的「自己寫一個」。

### 關卡 5：資料庫遷移（Alembic）

**搭配看的程式**：`backend/models.py`；`backend/migrations/env.py`、`migrations/versions/0001～0006`；`backend/alembic.ini`；`backend/Dockerfile` 第 67 行的 CMD（啟動時先 `alembic upgrade head`）

**前置**：後端能連到 Neon。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `uv run alembic current` | `0006 (head)` | 資料庫現在的「施工進度」。Neon 的 `alembic_version` 表只有這一筆 |
| 2 | `uv run alembic history` | 0001 → 0002 → … → 0006 六行（0005、0006 是關卡 24 加的） | 每一行是一張施工單，`backend/migrations/versions/` 一檔一張 |
| 3 | `uv run alembic check` | `No new upgrade operations detected.` | 程式的 `models.py` 和資料庫一致 |
| 4 | `backend\models.py` 的 `User` 加一行 `nickname: str \| None = None`，再 `uv run alembic check` | `New upgrade operations detected`，提到 `add_column` 和 `nickname` | 改了 models 沒開施工單，CI 就是用這個抓。改回來：`git checkout -- backend/models.py` |
| 5 | Neon：`SELECT version_num FROM alembic_version;` | `0006` | 和步驟 1 對上 |
| 6 | 打開 `backend/migrations/versions/0002_*.py` | 看到 `upgrade()` 加欄位、`downgrade()` 刪欄位 | 每張施工單都有「做」和「拆」 |

**收尾**：資料庫結構用施工單管 / 改 models 一定開單 / `alembic check` 是守門員。
**動手玩**：`LEARNING.md` 關卡 5 的 1（downgrade 再 upgrade，會動到 Neon，做之前說一聲）。

### 關卡 6：前端整理（api / auth / components）

**搭配看的程式**：`frontend/src/api/auth.ts`、`api/client.ts`、`auth/useAuth.ts`、`components/UserPanel.tsx`、`main.tsx`

**前置**：前後端跑起來。這關是讀結構，不是跑指令。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `Get-ChildItem frontend\src -Recurse -Name \| Select-String -NotMatch "test"` | 看到 `api/`、`auth/`、`app/`、`components/`、`pages/`、`schemas/` | 一個資料夾一種責任：`api` 跟後端講話、`auth` 登入狀態、`pages` 畫面 |
| 2 | 登入後 DevTools → Network，列出有哪些 `/api/...` | `login`、`me` | 每一個都對應 `frontend/src/api/auth.ts` 的一個函式 |
| 3 | 打開 `api/auth.ts`，找 `login`、`getMe` | 各幾行，呼叫 `api.post`、`api.get` | 它們不管 token，token 的事在 `api/client.ts` |
| 4 | 打開 `api/client.ts`，找 `interceptors.request` 和 `interceptors.response` | request：加 `Authorization`；response：401 就 refresh 再重送 | 全專案只有這裡處理 token，頁面完全不知道 |
| 5 | Console：`const { useAuthStore } = await import("/src/auth/authStore.ts"); useAuthStore.getState();` | 物件裡有 `accessToken`、`notice`、`initialized` | 登入狀態放在 `auth/`，畫面只是讀它 |

**收尾**：api / auth / pages 三層各做一件事，搬到新專案時整個 `api/` 和 `auth/` 複製就能用（`CHAIN.md` 搬家清單）。
**動手玩**：`LEARNING.md` 關卡 6 的 3（和關卡 1 步驟 7 一樣）。

### 關卡 7：多頁面與守門員（React Router）

**搭配看的程式**：`frontend/src/app/router.tsx`、`app/AppLayout.tsx`、`auth/RequireAuth.tsx`、`auth/GuestOnly.tsx`、`pages/NotFoundPage.tsx`

**前置**：前後端跑起來。全部在瀏覽器網址列做，預期值是「網址變成什麼」。

| 步 | 操作 | 預期（看網址列） | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 登出狀態，網址列輸入 `localhost:5173/settings` | 變成 `/login` | `auth/RequireAuth.tsx`：沒登入就送去登入頁，並記住你本來要去哪 |
| 2 | 登入 | 回到 `/settings`，不是首頁 | 記住的那個「本來要去哪」 |
| 3 | 已登入，輸入 `/login` | 變成 `/` | `auth/GuestOnly.tsx`，反過來的守門員 |
| 4 | 輸入 `/abc` | 404 頁 | `app/router.tsx` 最後一條路由 |
| 5 | 點導覽列「帳號設定」，DevTools → Network | **沒有**新的 HTML 下載，只有可能的 `/api/me` | 單頁應用換頁不重新下載頁面，`<Link>` 和 `<a>` 的差別 |

**收尾**：路由表在一個檔案 / 守門員包在外面，新頁面自動被保護 / 換頁不重載。
**動手玩**：`LEARNING.md` 關卡 7 的 1（加一頁，十行內）。

### 關卡 8：Zustand + axios

**搭配看的程式**：`frontend/src/auth/authStore.ts`、`auth/authService.ts`、`api/client.ts`（request / response 兩個攔截器、`_retry`）

**前置**：前後端跑起來。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | Console：`const { useAuthStore } = await import("/src/auth/authStore.ts"); useAuthStore.getState();` | 有 `accessToken`（一串 `eyJ...`） | access token 只在記憶體，重新整理就沒了，所以才需要 refresh |
| 2 | Console：`useAuthStore.getState().setNotice("我從 Console 改的");` | 畫面上方的提示文字立刻變 | 沒碰任何元件，改 store 畫面就跟著變 |
| 3 | `backend\.env` 加 `JWT_EXPIRE_MINUTES=1`，重啟，登入等 1 分鐘，按「重新取得我的資料」 | Network：`me` 401 → `refresh` 200 → `me` 200，畫面沒出錯 | `api/client.ts` 的 response 攔截器。刪掉 `.env` 那行 |
| 4 | 打開 `api/client.ts` 找 `_retry` | 一行 `original._retry = true` | 重送一次還是 401 就放棄，不然會無限迴圈 |

**收尾**：狀態在 store / token 在攔截器 / 攔截器只重試一次。
**動手玩**：`LEARNING.md` 關卡 16 的 1、2 用測試看同一件事。

### 關卡 9：Docker 與 CI

**搭配看的程式**：`backend/Dockerfile`、`.github/workflows/ci.yml`、`backend/pyproject.toml`、`backend/uv.lock`

**前置**：學習者本機沒有 Docker，這關全部看 GitHub Actions 的 log。

| 步 | 操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `uv run ruff check .` 和 `uv run ruff format --check .`（在 `backend`） | `All checks passed!`、`N files already formatted` | CI 第一步就是這兩個，本機先跑就不會紅 |
| 2 | 打開 `.github/workflows/ci.yml`，數 `backend` job 有幾個 `- name:` | 和 Actions 頁面左邊的步驟一一對應 | CI 就是把你本機跑的指令排成一列 |
| 3 | GitHub → Actions → 最新一列 → 點 `backend` → 展開 `Docker build` | 找到 `CACHED` 字樣 | 層快取：沒變的層不重做。`backend/Dockerfile` 先 COPY 套件清單再 COPY 程式，就是為了這個 |
| 4 | 同一頁展開 `Smoke test` 和 `Docker logs` | `{"status":"ok"...}`、`Running upgrade ... -> 0006`、`Uvicorn running on http://0.0.0.0:8000` | 容器啟動時先跑遷移再起伺服器，和 Render 上一模一樣 |
| 5 | 打開 `backend/Dockerfile`，找 `--host 0.0.0.0` | 一行 | 容器裡要聽 `0.0.0.0` 外面才連得到，`127.0.0.1` 會「顯示成功但 502」 |

**收尾**：CI = 本機指令排成一列 / Docker = 把啟動步驟寫死 / 紅了點進去看是哪一步。
**動手玩**：`LEARNING.md` 關卡 9 的 1、4（要 push 一次，開練習分支做）。

### 關卡 10：部署（Render + Vercel + Neon，同站）

**搭配看的程式**：`frontend/vercel.json`、`render.yaml`、`backend/config.py` 的 `cookie_secure`、`cors_origins`、`frontend/vite.config.ts` 的 `proxy`

**前置**：線上網址在 `HANDOFF.md` 第 7 節。**這關可能碰到平台設定頁，改任何設定前先說**。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s https://<前端網址>/api/health` | `{"status":"ok","db":"ok","migration":"0006","version":"<commit 前幾碼>"}` | 打的是 Vercel 的網址，回的是 Render 的內容：Vercel 代打了（`frontend/vercel.json` 的 rewrite） |
| 2 | `curl.exe -s -i https://<前端網址>/api/health \| Select-String "server\|x-request-id"` | `server:` 那行不是 `uvicorn`；`x-request-id` 有值 | 本機直打後端 `server` 是 `uvicorn`，這裡被代理層換掉了：瀏覽器從頭到尾只看到 Vercel，這就是「同站」 |
| 3 | 瀏覽器開前端登入，DevTools → Network 點 `login` → Response Headers 的 `set-cookie` | `Path=/api/auth; Secure; HttpOnly; SameSite=lax` | 正式環境多了 `Secure`（關卡 2 的 `COOKIE_SECURE`） |
| 4 | Network 過濾 `api` | 所有網址都是 `<前端網址>/api/...`，沒有 `onrender.com` | 代理在工作 |
| 5 | 重新整理 | 還在登入狀態 | 這一步才證明 cookie 真的帶得上，關卡 10 當初踩的坑全在這裡 |
| 6 | Render → Logs，搜步驟 2 的 `x-request-id` | 找到同一筆 `"request"` log | 前端看到的編號和後端記的是同一個 |

**收尾**：同站 = 瀏覽器只看到一個網域 / rewrite 不是轉址 / cookie 的 `Secure` 正式才開。
**動手玩**：`LEARNING.md` 關卡 10 的 2（故意跨站，要改 Vercel 設定，先說）。

### 關卡 11：維護

**搭配看的程式**：`backend/main.py`（lifespan、request log middleware、`/api/health`、Sentry）、`backend/logging_config.py`、`docs/RUNBOOK.md`、`docs/DEBUGGING.md`

**前置**：線上網址、Render 後台能開。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s https://<前端網址>/api/health` | `db: ok`、`migration: 0006`、`version` 和 GitHub main 最新 commit 前幾碼一樣 | 一個網址回答三個問題：活著嗎、資料庫通嗎、跑的是哪一版 |
| 2 | `backend\.env` 加 `LOG_JSON=true`，重啟，`curl.exe -s localhost:8000/api/ping` | terminal 一行 JSON：`"message": "request"`、`"path": "/api/ping"`、`"status": 200`、`"duration_ms"`、`"request_id"` | 正式環境就是這個格式，欄位可以搜。刪掉那行 |
| 3 | Render → Logs，搜 `"status": 401` | 找到幾筆登入失敗或 refresh 失敗 | 看 `path` 分布就知道是誰在敲門 |
| 4 | `uv run alembic check` | `No new upgrade operations detected.` | CI 的「遷移檢查」就是它 |
| 5 | 打開 `docs/RUNBOOK.md` 第 0 節 | 一張上線後的檢查清單 | 貴的檢查寫成清單，便宜的寫成測試 |

**收尾**：health 三件事 / log 是 JSON 可以搜 / request_id 串前後端。
**動手玩**：`LEARNING.md` 關卡 11 的 1（`/api/_boom` 看 Sentry，要改 Render 環境變數，先說）、4（退版）。

### 關卡 12：TanStack Query

**搭配看的程式**：`frontend/src/api/queryClient.ts`、`auth/useMe.ts`、`components/UserPanel.tsx`、`main.tsx` 的 `QueryClientProvider`

**前置**：前後端跑起來。

| 步 | 操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 登入，DevTools → Network 過濾 `me` | **一個** `/api/me` | 三個元件都要使用者資料，但只打一次：`auth/useMe.ts` 的 `queryKey: ["me"]` 共用快取 |
| 2 | 點頁面角落 TanStack Query Devtools 的圖示（`main.tsx` 的 `ReactQueryDevtools`），找 `["me"]` | 狀態 `fresh`，30 秒後變 `stale` | `api/queryClient.ts` 的 `staleTime: 30_000`：30 秒內不重抓 |
| 3 | 按「重新取得我的資料」 | 按鈕文字變「更新中...」、「上次更新」時間變、Network 多一個 `/api/me` | `refetch` 和 `isFetching` |
| 4 | 等超過 30 秒，切到別的分頁再切回來 | Network 自動多一個 `/api/me`，你沒按任何東西 | `refetchOnWindowFocus`：過期了就趁你回來時更新 |
| 5 | 登出 | Network **沒有** 401 的 `/api/me` | `useMe.ts` 的 `enabled`：沒登入就不抓 |

**收尾**：後端資料交給 Query 管 / key 一樣就共用 / staleTime 決定多久算舊。
**動手玩**：`LEARNING.md` 關卡 12 的 2、4。

### 關卡 13：工程品質基線

**搭配看的程式**：`backend/pyproject.toml`（ruff、pyright 設定）、`backend/security.py`（`DUMMY_PASSWORD_HASH`、`to_thread`）、`routes/auth.py` 的 `IntegrityError`、`.github/dependabot.yml`、`frontend/tsconfig.app.json`

**前置**：前後端套件裝好。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 在 `backend`：`uv run ruff format --check .`、`uv run ruff check .`、`uv run pyright`、`uv run pytest -q` | 四個都綠；pyright `0 errors` | 推之前本機跑的四樣，CI 跑一樣的 |
| 2 | 在 `frontend`：`npm run format:check`、`npm run lint`、`npm run typecheck`、`npm test` | 四個都綠 | |
| 3 | `backend\routes\auth.py` 的 `login` 裡刪掉 `assert user.id is not None`，`uv run pyright` | 幾個 `error`，提到 `int \| None` | 型別檢查把「跑到才炸」提前到「存檔就知道」。改回來 |
| 4 | 用不存在的 email 登入一次、用存在的 email 打錯密碼一次，看 terminal 的 request log `duration_ms` | 兩個都接近 100 毫秒 | `security.py` 的 `DUMMY_PASSWORD_HASH`：帳號不存在也假裝比對一次，不然用時間就能猜出哪些 email 有註冊 |
| 5 | GitHub → Insights → Dependency graph → Dependabot | 三個 ecosystem | 套件更新由機器開 PR，CI 綠才合 |

**收尾**：四個檢查 + CI / 型別檢查提前抓錯 / 安全細節（timing）照正式專案做。
**動手玩**：`LEARNING.md` 關卡 13 的 2、5。

### 關卡 14：Zod + React Hook Form

**搭配看的程式**：`frontend/src/schemas/auth.ts`、`components/RegisterForm.tsx`、`LoginForm.tsx`、`ChangePasswordForm.tsx`、`api/client.ts` 的 `getErrorMessage`

**前置**：前端跑起來。

| 步 | 操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 開 `/register`，email 打 `abc` | 出現「Email 格式不正確」、按鈕不能按 | `schemas/auth.ts` 的 Zod 規則，`mode: "onChange"` 邊打邊驗 |
| 2 | 密碼打 `short`，再打中文 | 「至少 8 個字元」、「只能包含英文字母」 | 和後端 `schemas.py` 同一套規則，兩邊各一份 |
| 3 | `frontend\src\schemas\auth.ts` 的 `.min(8)` 改 `.min(12)` | 提示立刻變成 12 | 規則在一個檔案，表單自動跟著變。改回來 |
| 4 | `components/RegisterForm.tsx` 把 `resolver:` 那行註解掉，空白表單送出 | 後端 `422`，訊息出現在按鈕下方 | 前端驗證拿掉，後端還是擋得住：「前端驗證是體驗，後端驗證是安全」。改回來 |
| 5 | 登入頁密碼打錯 | 「登入失敗：Incorrect email or password」 | 後端的 `detail` 原樣顯示，`api/client.ts` 的 `getErrorMessage` |

**收尾**：規則一份、型別自動推 / 即時提示 / 後端永遠再驗一次。
**動手玩**：`LEARNING.md` 關卡 14 的 4。

### 關卡 15：Tailwind CSS

**搭配看的程式**：`frontend/src/components/ui.tsx`、`src/index.css`、`vite.config.ts`、`app/AppLayout.tsx`

**前置**：前端跑起來。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `frontend\src\pages\HomePage.tsx` 的 `<h2` 加 `text-red-600`，存檔 | 標題立刻變紅，沒重新整理 | class 就是樣式，Vite 熱更新。改回來 |
| 2 | DevTools → Rendering → `prefers-color-scheme: dark` | 底變深、字變淺 | `dark:` 開頭的 class。`components/ui.tsx` 每個顏色都有深色版 |
| 3 | `npm run build`，`Get-ChildItem frontend\dist\assets\*.css \| Select-Object Name, Length` | 一個檔案，約 14 kB | 只打包用到的 class |
| 4 | 打開 `components/ui.tsx` 找 `buttonVariants` | `primary`、`secondary`、`danger` 各一串 class | 共用元件，型別從物件的 key 推出來 |

**收尾**：class 即樣式 / 深色每個顏色都要想 / 共用元件在 `ui.tsx`。
**動手玩**：`LEARNING.md` 關卡 15 的 2、5。

### 關卡 16：Vitest + MSW（前端測試）

**搭配看的程式**：`frontend/vitest.config.ts`、`src/test/setup.ts`、`src/test/server.ts`、`src/api/client.test.ts`、`src/auth/RequireAuth.test.tsx`、`src/components/LoginForm.test.tsx`

**前置**：`frontend` 套件裝好。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `npm test` | `11 passed`（數字以輸出為準），3 個檔案 | 測的是攔截器、守門員、登入表單 |
| 2 | 打開 `src/api/client.test.ts`，讀每個 `it(` 的名稱 | 五個，其中有「single-flight」和「_retry」 | 關卡 1、8 用眼睛在 Network 看的事，現在機器看 |
| 3 | `src/api/client.ts` 的 `if (!refreshPromise) {` 改成 `if (true) {`，`npm test` | `1 failed`，「single-flight」那個，訊息有 `refresh` 被呼叫 3 次 | 回歸測試：以後誰改壞這行，CI 立刻紅。改回來 |
| 4 | 打開 `src/test/server.ts` | MSW 的假後端，一個路徑一個 handler | 測試不打真後端，所以 2 秒跑完 |
| 5 | `npm run test:coverage` | 表格，`client.ts`、`RequireAuth.tsx`、`LoginForm.tsx` 接近 100% | 覆蓋率看哪裡沒測到，不是追 100% |

**收尾**：假後端 + 真前端程式 / 關鍵行為各一個測試 / 改壞立刻知道。
**動手玩**：`LEARNING.md` 關卡 16 的 2、5。

### 關卡 17：登入頻率限制（slowapi）

**搭配看的程式**：`backend/rate_limit.py`、`main.py` 的 `rate_limit_exceeded` 與 `/api/_ip`、`routes/auth.py` 的 `@limiter.limit`、`tests/conftest.py` 的 `limiter.enabled`、`render.yaml`

**前置**：後端跑起來。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `1..11 \| ForEach-Object { curl.exe -s -o NUL -w "%{http_code}\n" localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"a@b.com\",\"password\":\"x\"}' }` | 10 個 `401`，第 11 個 `429` | 一分鐘 10 次，`config.py` 的 `AUTH_RATE_LIMIT` |
| 2 | 第 12 次用 `-i` 看標頭 | `retry-after: <秒>`、`x-ratelimit-remaining: 0` | 429 要告訴對方多久後再來 |
| 3 | `.env` 加 `AUTH_RATE_LIMIT=3/minute`，重啟，再跑步驟 1 | 第 4 個就 `429` | 格式是 `次數/時間`。刪掉 |
| 4 | `.env` 加 `TRUSTED_PROXY_HOPS=1`，重啟，步驟 1 的指令加 `-H "X-Forwarded-For: 1.2.3.4"` 跑到 429，再換 `5.6.7.8` | 換 IP 又能打 10 次 | hops 設得比實際代理層數多，攻擊者自己填 IP 就能繞過。`rate_limit.py`。刪掉 |
| 5 | `render.yaml` 找 `TRUSTED_PROXY_HOPS` | `2` | Render 前面有兩層（Vercel、Render 的負載平衡）。正式環境用 `/api/_ip` 驗過 |

**收尾**：限的是 IP / 代理後面要算對層數 / 429 帶 Retry-After。
**動手玩**：`LEARNING.md` 關卡 17 的 4。

### 關卡 18：SQL 與資料庫

**搭配看的程式**：`backend/models.py`（`index=True`、`unique=True`）、`routes/auth.py` 的 `with_for_update()`（172）與 `delete_expired_refresh_tokens`、`docs/labs/18-sql.sql`

**前置**：Neon SQL Editor 能開；`docs/labs/18-sql.sql` 開著。帳號：這關用 `TEST_DATABASE_URL` 那個資料庫（會灌 5 萬筆假資料，Neon 免費方案夠用，實驗最後會清掉）。**先講名詞**（`LEARNING.md` 關卡 18「先認識幾個名詞」）再開始。

| 步 | 操作（lab 的段落） | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 第 1 段 `pg_indexes` 查詢 | 看到 `ix_user_email`、`ix_refreshtoken_token_hash`、`*_pkey` | 系統表是「資料庫自己的目錄」；索引名字 `ix_<表>_<欄位>` 來自 `models.py` 的 `index=True` |
| 2 | 第 2 段灌資料，再 `SELECT count(*) FROM "user";` | 約 `50001` | 假資料進去了 |
| 3 | 第 3 段兩句 `EXPLAIN ANALYZE`，各看 `Execution Time` | 有索引：`Index Scan`、零點幾毫秒；拔掉索引：`Seq Scan`、幾十毫秒 | 看 `Execution Time` 那行，不是編輯器的秒數。索引是另外維護的目錄 |
| 4 | 第 4 段 JOIN 一句 vs 21 句 | 一句就拿到 20 個使用者各幾張票 | N+1：每一趟都是一次來回 |
| 5 | 第 5 段：分頁 A 跑 `DO $$ ... $$`（會等 40 秒），馬上在分頁 B 跑那句 `SELECT` | B 的 `finished - started` 約 30～40 秒、`revoked` 是 `t` | `FOR UPDATE` 是鎖：同一張票兩個人同時換，第二個要等第一個做完才看得到結果。`routes/auth.py` 的 `with_for_update()` |
| 6 | 第 6、7 段清理，再 `count(*)` | `user`、`refreshtoken` 都回到實驗前 | 實驗資料不留 |

**收尾**：索引是目錄、不是每欄都該有 / 一趟 SQL 一次來回 / 鎖讓同時改同一筆的人排隊。
**動手玩**：`LEARNING.md` 關卡 18 的 3（`DB_ECHO=true` 對照 SQL 和程式）。

### 關卡 19：HTTP 與瀏覽器規則

**搭配看的程式**：`backend/routes/auth.py` 的 `set_refresh_cookie`（29～39）、`main.py` 的 request log middleware（`Cache-Control`）與 `CORSMiddleware`、`frontend/vercel.json`、`vite.config.ts` 的 `proxy`

**前置**：後端跑起來、帳號存在。2026-10-20 實際帶過的順序，照做。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -v localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"t@test.com\",\"password\":\"Passw0rd!x\"}'` | `>` 四行請求、`<` 一串回應、最後一行 JSON | `>` 是你送的、`<` 是回來的、`*` 是 curl 碎念。請求行、標頭、空行、內容 |
| 2 | 找 `< set-cookie:` 那行 | `HttpOnly; Max-Age=604800; Path=/api/auth; SameSite=lax`，本機沒有 `Secure` | 一個分號一個規則：JS 讀不到 / 7 天 / 只在 `/api/auth` 帶 / 跨站不帶 / 正式才限 https。`routes/auth.py` 第 34 行附近 |
| 3 | 找 `x-ratelimit-remaining`、`cache-control: no-store`、`x-request-id` | 三行都在 | 關卡 17、19、11 各加的 |
| 4 | 關卡 1 的步驟 1～4（cookie 罐、換票、舊票重用、新票也失效） | 同關卡 1 | 用 curl 看最清楚 |
| 5 | 重新登入 `-c jar.txt`，`curl.exe -v -b jar.txt localhost:8000/api/me` | `>` **沒有** `Cookie:` 行；`401`、`www-authenticate: Bearer` | Path 不是 `/api/auth` 就不帶；`/api/me` 要的是另一張票 |
| 6 | `curl.exe -s -i localhost:8000/api/me -H "Authorization: Bearer <登入回的 access_token>"` | `200`，`id`、`email`、`last_login_at` | 兩張票分工：refresh 走 cookie 只到 `/api/auth`，access 走標頭打其他 API |
| 7 | 把 access token 中間一段貼進 `[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("<中間那段>"))` | `{"sub":"7","iat":...,"exp":...}` | 票誰都能看，所以不放祕密；第三段簽章防改。改一個字再打 `/api/me` 會 401 |
| 8 | `curl.exe -s -i localhost:8000/api/health -H "Origin: http://localhost:5173"` 和 `-H "Origin: http://evil.com"` | 都 `200`、內容一樣；只有第一個有 `access-control-allow-origin` | CORS：伺服器照常處理，只是沒給許可，瀏覽器不讓 JS 讀。curl 不是瀏覽器所以不理。它保護使用者不保護 API |

**收尾**：請求回應三層 / cookie 五個屬性 / 兩張票分工 / CORS 只管瀏覽器 / `no-store` 不存。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 19 的 1（400 改 401 看攔截器做錯事）。

### 關卡 20：讀 log 與除錯（故障演練）

**搭配看的程式**：`backend/main.py` 的 request log middleware 與 `/api/_boom`、`backend/logging_config.py`、`docs/DEBUGGING.md`、`docs/drills/README.md`、`LEARNING.md` 關卡 20 觀念 3 的表

**前置**：前後端跑起來；`uv run pytest -q`、`npm test` 綠（基準線）；`git status` 乾淨。**不要先看 patch 內容。** 每題的流程一樣，下面寫一次，第 1 題照做，之後每題只給症狀。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `git apply docs/drills/01.patch` 然後 `git status` | 一個檔案 `modified` | 允許的提示：壞在哪個檔案 |
| 2 | 重啟後端，瀏覽器登入、重新整理 | 掉登入 | 先問他：「你覺得是哪一段壞：refresh 沒送、送了被拒、還是回了前端沒收？」不要先講答案 |
| 3 | DevTools → Network 點 `refresh` → Request Headers | 有沒有 `Cookie:` | 沒有 = 瀏覽器沒帶 = cookie 的屬性出問題（關卡 19 步驟 5） |
| 4 | `uv run pytest -q` | 有紅的，名稱和 refresh 有關 | 哪個工具抓到了。對照 `LEARNING.md` 關卡 20 觀念 3 的表 |
| 5 | 他說出原因後，`git diff` 對答案 | `path="/api/auth"` 變 `"/auth"` | 修完要能說根本原因 |
| 6 | `git checkout -- backend frontend`，`git status` 乾淨 | | 下一題 |

五題的症狀與答案在 `LEARNING.md` 關卡 20 的「演練」表和折疊區。每題記三件事：先看了哪裡、第幾步定位、哪個工具抓到。**第 2 題全綠但壞了**是重點，帶到那題時用 `[Text.Encoding]` 解 token 看 `exp - iat`。

**另外兩個小實驗**：
- `backend\.env` 加 `LOG_JSON=true` 和 `ENABLE_DEBUG_ENDPOINTS=true`，重啟，`curl.exe -s -i localhost:8000/api/_boom` → `500`；terminal 找 `"level": "ERROR"` 那筆，從**最後一行**往上讀到 `main.py` 的哪一行。看完刪掉兩行。
- 用步驟裡任何一個回應的 `x-request-id`，在 terminal 的 log 搜同一個 id。

**收尾**：先問哪段壞再問為什麼 / 看錯誤最後幾行 / 哪個工具抓哪種錯 / 全綠不等於沒壞。
**動手玩**：`LEARNING.md` 關卡 20 的 4（讓測試抓第 2 題）。

### 關卡 21：docker compose 與 Playwright E2E

**搭配看的程式**：`infra/compose.yaml`（整個檔案，註解就是講義）；`frontend/e2e/auth.spec.ts`；`frontend/playwright.config.ts` 的 `webServer`；`.github/workflows/infra.yml` 的 `compose`、`e2e` 兩個 job

**前置**：關卡 21 起有兩條路線，預期值一樣。**Mac 路線**要先 `bash scripts/setup.sh --skip-tests` 和 `bash scripts/doctor.sh`，doctor 要印出「關卡 21、22、24…：可以，走 Mac 路線」；沒有就先裝 Docker（Docker Desktop 個人免費、OrbStack 個人免費、`brew install colima docker` 三選一）。**VM 路線**只要能開 GitHub 的 Actions 分頁。指令都在 repo 根目錄下。

**Mac 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `docker compose -f infra/compose.yaml up -d --build --wait` | 第一次約 1～2 分鐘；最後兩行 `Container jwt-auth-demo-postgres-1  Healthy`、`Container jwt-auth-demo-backend-1  Healthy`（前面打勾） | `--build` 照 `backend/Dockerfile` 做 image（關卡 9 那份，一個字沒改）；`--wait` 等到**兩個都 healthy** 才回來，不是「起來了」就回來。healthy 的定義在 compose.yaml 的 `healthcheck` |
| 2 | `docker compose -f infra/compose.yaml ps` | 兩列，STATUS 都是 `Up … (healthy)` | 名字是「專案名-服務名-編號」，專案名來自檔案開頭的 `name:` |
| 3 | `curl -s localhost:8000/api/health` | `{"status":"ok","db":"ok","migration":"0006","version":null}` | 和 Render 上一樣的回答。`version` 是 null 因為 compose 沒給 APP_VERSION；`db: ok` 代表容器裡的後端連到了另一個容器的 Postgres |
| 4 | `docker compose -f infra/compose.yaml logs backend` 找 `Running upgrade` | `-> 0001` 一路到 `-> 0006`，然後 `Application startup complete` | 容器啟動指令先跑遷移再起 uvicorn（Dockerfile 的 CMD）。倉庫是全新的，所以六張施工單全部跑一遍 |
| 5 | `docker compose -f infra/compose.yaml exec postgres psql -U postgres -d jwtdemo -c "\dt"` | 五張表：`alembic_version`、`outboxevent`、`processedevent`、`refreshtoken`、`user` | `exec` 是「進到那個容器裡下指令」。倉庫在容器裡，資料放在具名 volume `pgdata`，`down` 不加 `-v` 資料會留著 |
| 6 | `grep -n "postgres:5432" infra/compose.yaml` | `DATABASE_URL: postgresql+asyncpg://postgres:postgres@postgres:5432/jwtdemo` | 主機名稱是**服務名** `postgres`，不是 localhost：compose 幫兩個容器建了一個內部網路，用名字互相找。localhost 在容器裡是它自己 |
| 7 | `cd frontend && npm ci && npx playwright install chromium`（第一次；下載約 150 MB） | 最後沒有紅字 | Playwright 的瀏覽器不在 npm 套件裡，要另外下載。CI 的 `e2e` job 每次都做這步 |
| 8 | `npm run test:e2e` | 三行 `✓  1 [chromium] › e2e/auth.spec.ts:…`，最後 `3 passed (5.2s)`（秒數會不同） | 它自己起了 Vite（`playwright.config.ts` 的 `webServer`），瀏覽器打 `localhost:5173`，`/api` 由 Vite 代理到步驟 1 的後端。三條路：註冊→登入、重整還在、登出被擋 |
| 9 | `npx playwright test --ui`，點第二個測試 | 視窗左邊列出三個測試名；右邊一步一步重播，每一步旁邊有當時的網址 | 看「重新整理」那一步：網址沒變、標題還在。這就是 refresh cookie 在真瀏覽器裡真的被帶上了（關卡 16 的 MSW 假後端測不到這段） |
| 10 | `cd .. && docker compose -f infra/compose.yaml down -v` | `Removed` 幾行 | `-v` 連 volume 一起刪，下次 up 是全新的倉庫；不加就保留 |

**VM 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | GitHub → Actions → 左邊 **Infra** → 最新的一個 run | 五個 job：`compose`、`e2e`、`observability`、`k8s`、`messaging`，全綠 | 這個 workflow 只在 PR 和手動觸發跑（`infra.yml` 的 `on`），不想等的話右上 **Run workflow** 自己跑一次，公開 repo 不計分鐘 |
| 2 | 點 `compose` job，展開「compose up」 | `Container jwt-auth-demo-postgres-1  Healthy`、`Container jwt-auth-demo-backend-1  Healthy` | 和 Mac 路線步驟 1 一模一樣的輸出，只是在 GitHub 的機器上 |
| 3 | 展開「Smoke test」 | `"migration":"0006"`、`✅ compose 整套跑起來了` | 同 Mac 步驟 3；多檢查「遷移是不是最新的」，用 `ls migrations/versions` 算出來的 |
| 4 | 展開「compose logs」 | `backend-1   \| INFO  [alembic.runtime.migration] Running upgrade 0005 -> 0006`、`Application startup complete` | 同 Mac 步驟 4 |
| 5 | 回上一頁點 `e2e` job，展開「E2E（Playwright）」 | 三行 `✓`，最後 `3 passed (4.9s)` | 同 Mac 步驟 8；再往上看「安裝 Chromium」那步，就是 Mac 步驟 7 |
| 6 | run 頁面最下面 **Artifacts** → `playwright-report`，下載解壓開 `index.html` | 三個測試各一列，點進去每一步有時間 | 這就是 Mac 步驟 9 的 UI 模式，CI 把它留成檔案 |

**收尾**（你看到的 → 對應的觀念）：`--wait` 等 healthy → 「起來了」和「能服務了」不一樣，和關卡 11 的 ping / health 同一件事 / 服務名當主機名 → compose 的內部網路 / `down -v` → 資料在 volume 不在容器 / `3 passed` → 真瀏覽器驗的是 cookie 真的帶上，元件測試驗的是畫面對不對 / artifact → CI 把證據留下來。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 21 的 1（把 service_healthy 改成 service_started）、3（改錯一個預期值看報告）。

### 關卡 22：指標（Prometheus + Grafana）與追蹤（OpenTelemetry）

**搭配看的程式**：`backend/metrics.py`、`backend/tracing.py`（兩個檔案開頭的註解就是講義）；`backend/main.py` 第 141～152 行（log 帶 trace_id、掛上兩者）；`infra/prometheus/prometheus.yml`；`infra/grafana/provisioning/` 兩個檔、`infra/grafana/dashboards/backend.json`（只看每個 panel 的 `title` 和 `expr`）；`infra/otel/collector.yaml`；`infra/compose.yaml` 的 observability profile 三個服務；`.github/workflows/infra.yml` 的 `observability` job

**前置**：同關卡 21（Docker、`doctor.sh` 說關卡 22 可以）；關卡 21 的 compose 跑過一次（image 已經 build）。指令都在 repo 根目錄下。

**Mac 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318 docker compose -f infra/compose.yaml --profile observability up -d --build --wait` | 五行 `Healthy`：postgres、backend、prometheus、otel-collector、grafana | `--profile` 才多起後面三個，平常 `up` 不會（關卡 21 看到的只有兩個）。指令最前面那個環境變數只給這一條指令用，compose 把它轉給 backend；沒給就不追蹤，開關預設關，和線上一樣 |
| 2 | `for i in $(seq 1 10); do curl -s localhost:8000/api/ping > /dev/null; done; curl -s localhost:8000/metrics \| grep '^http_requests_total'` | `http_requests_total{method="GET",route="/api/ping",status="200"} 1X.0`（X 不固定） | 這就是 Prometheus 每 5 秒抓的東西：純文字、一行一個數字、大括號裡是 label。比 10 大是因為 backend 的 healthcheck 每 5 秒也打一次 ping。`/metrics` 不在 `/api` 底下，所以線上就算打開 Vercel 也轉發不到 |
| 3 | `curl -s -o /dev/null localhost:8000/no-such-path; curl -s localhost:8000/metrics \| grep 'route="unmatched"' \| head -1` | `http_requests_total{method="GET",route="unmatched",status="404"} 1.0` | 亂打的路徑不會變成新的 label 值，一律記 `unmatched`。問他：如果 route 用實際路徑，`/todos/1`、`/todos/2`…會發生什麼？（每個 id 一條時間序列，撐爆 Prometheus：cardinality 爆炸） |
| 4 | 瀏覽器開 `http://localhost:9090/targets` | 一列 `backend`，Endpoint `http://backend:8000/metrics`，State **UP** | Prometheus 是「拉」的：它去抓，程式不知道它在哪。目標寫的是 compose 的服務名，和 `DATABASE_URL` 裡的 `postgres` 同一個道理 |
| 5 | 同頁上方 Query，輸入 `sum by (route) (rate(http_requests_total[1m]))`，Execute、看 Table | 一列 `{route="/api/ping"}`，值大約 0.2～0.5 | `rate` 把「只增不減的總數」變成「每秒幾筆」；Grafana 第一張圖就是這一句。數字小是因為最近一分鐘只有 healthcheck 在打 |
| 6 | 瀏覽器開 `http://localhost:3000` → Dashboards → **JWT Auth Demo backend** | 五個面板：每秒請求數（依路由）、p95 耗時、5xx 比例（5 分鐘）、請求總數（依狀態碼）、目前版本 `dev` | 不用登入是 compose 設的匿名管理員，正式環境絕對不這樣。儀表板不是點出來的，是 `infra/grafana/dashboards/backend.json` 被 provisioning 載入的：進 git、有 diff、別的專案直接複製；畫面上改了存不回去（`allowUiUpdates: false`） |
| 7 | `curl -s -D - -o /dev/null localhost:8000/api/health \| grep -i x-request-id` | `x-request-id: ` 後面 12 個十六進位字（每次不同） | 關卡 11 的 request id。記下來，等一下在 trace 裡找它 |
| 8 | `sleep 8; docker compose -f infra/compose.yaml --profile observability logs --no-color otel-collector > /tmp/collector.log; grep 'Name  ' /tmp/collector.log \| sort \| uniq -c` | 幾行：`Name : GET /api/health`、`GET /api/health http receive`、`GET /api/health http send`、`SELECT` 至少 2 筆 | 等 8 秒是因為 span 先攢著、每 5 秒一批送（BatchSpanProcessor）。一個請求一棵樹：HTTP 的 span 在最外層，`SELECT` 是它的子 span（health 查了 `SELECT 1` 和 `alembic_version` 兩句）；`http receive`／`http send` 是 ASGI 層收送的細節。`/api/ping` 和 `/metrics` 刻意不追蹤（`excluded_urls`），不然每 5 秒一棵樹全是噪音 |
| 9 | `grep -B 30 'x_request_id' /tmp/collector.log \| grep -E 'Trace ID\|Name\|Kind\|http.route\|x_request_id'` | `Trace ID : <32 個十六進位字>`、`Name : GET /api/health`、`Kind : Server`、`http.route: Str(/api/health)`、`http.response.header.x_request_id: Slice(["<步驟 7 的 id>"])` | span 帶著回應的 X-Request-ID：使用者回報「我的 request id 是 ○○」，就能在追蹤系統裡搜到那棵樹。Trace ID 記下來 |
| 10 | `docker compose -f infra/compose.yaml --profile observability logs --no-color backend \| grep 'path=/api/health' \| tail -1` | `request_id=<步驟 7 的 id> method=GET path=/api/health status=200 duration_ms=… trace_id=<步驟 9 的 Trace ID>` | 同一個 id 兩邊都有：從 log 的一行找到 trace，從 trace 找回 log。這就是「三種訊號要能互相找」 |
| 11 | `docker compose -f infra/compose.yaml --profile observability down -v` | `Removed` 幾行 | 關的時候也要帶 `--profile`，不然那三個不會被關掉 |

**VM 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | GitHub → Actions → **Infra** → 最新的 run → `observability` job | 五步全綠 | 這個 job 的 `env` 給了 `OTEL_EXPORTER_OTLP_ENDPOINT`，所以它同時驗指標和追蹤 |
| 2 | 展開「製造流量，看 /metrics」 | `http_requests_total{method="GET",route="/api/ping",status="200"} 13.0`、`...route="unmatched",status="404"} 1.0` | 同 Mac 步驟 2、3。13 = 10 次 curl + healthcheck 打的 3 次 |
| 3 | 展開「Prometheus 抓到了嗎」 | `✅ Prometheus：sum(http_requests_total{route="/api/ping"}) = 3` | 比上一步的 13 小是正常的：Prometheus 每 5 秒抓一次，上一次抓的時候 10 次 curl 還沒打。這就是「指標是取樣，不是逐筆」 |
| 4 | 展開「Grafana 的儀表板與資料來源」 | `"database": "ok"`、`儀表板：JWT Auth Demo backend`、`✅ Grafana → Prometheus：sum(http_requests_total) = 3` | 三件事：Grafana 活著、儀表板從 json 載入了、透過 Grafana 查 Prometheus 查得到（資料來源接對了）。同 Mac 步驟 4～6 |
| 5 | 展開「追蹤：collector 收到 span、log 帶 trace_id」 | `x-request-id: …`、`✅ collector 收到 HTTP 的 span：` + `Name : GET /api/health…`、`✅ 底下有 SQL 的子 span：` + 兩行 `Name : SELECT`、`✅ span 帶 request id：` + `x_request_id: Slice([…])`、最後一行 backend 的 log 有 `trace_id=` | 同 Mac 步驟 7～10，一步做完 |

**收尾**（你看到的 → 對應的觀念）：`/metrics` 的文字 → 指標是程式自己累計、Prometheus 來拉 / `unmatched` → label 的值要有限（cardinality） / `rate` → 計數器要除以時間才有意義 / 儀表板從 json 來 → 設定進 git，和 render.yaml、k8s 清單同一個概念 / 一棵樹 → 追蹤回答「時間花在哪」 / 同一個 trace_id 在 log 和 span → 三種訊號互相找。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 22 的 1（label 爆炸）、4（collector 掛了請求還好嗎）。選配的 Grafana Cloud（關卡 22「⚠️ 開始前」第二段）學習者自己做，AI 不替他開帳號。

### 關卡 23：Kubernetes（kind、Deployment、滾動更新、退版）

**搭配看的程式**：`infra/k8s/base/` 六個檔案（每個檔案開頭的註解就是講義，順序：namespace → configmap → secret.example → migrate-job → deployment → service → kustomization）；`infra/k8s/overlays/ci/kustomization.yaml`；`infra/k8s/ci/postgres.yaml`（只給學習與 CI）；`.github/workflows/infra.yml` 的 `k8s` job

**前置**：Mac 路線要 Docker 在跑，加 `brew install kind kubectl`（都免費）；`bash scripts/doctor.sh` 要說「關卡 23（Kubernetes）：可以」。第一次 `kind create cluster` 會拉約 1 GB 的 node image。指令都在 repo 根目錄下；`-n jwt-auth-demo` 是命名空間，每個 kubectl 都要帶。VM 路線只要能開 Actions。

**Mac 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `docker build -t jwt-backend:ci ./backend` | 最後 `naming to docker.io/library/jwt-backend:ci` | 同一個 Dockerfile，和 Render、compose、ci.yml 用的一樣，一個字沒改 |
| 2 | `kind create cluster --name jwt` | 一串 `✓`，最後 `Set kubectl context to "kind-jwt"`（第一次 1～2 分鐘） | kind = Kubernetes in Docker：整個叢集是一個 container（`docker ps` 看得到 `jwt-control-plane`）。kubectl 是遙控器，context 指到這個叢集 |
| 3 | `kind load docker-image jwt-backend:ci --name jwt` | `... not yet present on node "jwt-control-plane", loading...` | 節點看不到你 Mac 的 docker image，要搬進去。正式環境是 push 到 registry（GHCR、ECR），節點自己拉；這就是 `imagePullPolicy: IfNotPresent` 的原因 |
| 4 | `kubectl apply -f infra/k8s/base/namespace.yaml && kubectl -n jwt-auth-demo apply -f infra/k8s/ci/postgres.yaml && kubectl -n jwt-auth-demo rollout status deployment/postgres` | `namespace/jwt-auth-demo created`、`deployment.apps/postgres created`、`service/postgres created`、`deployment "postgres" successfully rolled out` | 命名空間是叢集裡的資料夾。這個 Postgres 只給學習和 CI（`emptyDir`，pod 一死資料就沒）；正式環境資料庫在叢集外（Neon、RDS），這就是為什麼它不在 `base/` 裡 |
| 5 | `kubectl -n jwt-auth-demo create secret generic backend-secret --from-literal=DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/jwtdemo --from-literal=JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')` | `secret/backend-secret created` | `base/secret.example.yaml` 只是範本、沒列進 kustomization，真值永遠不進 git。主機名稱 `postgres` 是上一步的 Service 名字，和 compose 的服務名同一個道理 |
| 6 | `kubectl apply -k infra/k8s/overlays/ci && kubectl -n jwt-auth-demo wait --for=condition=complete job/backend-migrate --timeout=120s && kubectl -n jwt-auth-demo logs job/backend-migrate` | `configmap/backend-config created`、`service/backend created`、`deployment.apps/backend created`、`job.batch/backend-migrate created`、`job.batch/backend-migrate condition met`、六行 `Running upgrade … -> 0006` | `-k` = kustomize：base 加上 overlay（image tag 換成 ci）。遷移是一個 Job：跑一次、跑完就結束。問他：為什麼不像 Render 一樣放在啟動指令裡？（2 個副本同時跑遷移會打架） |
| 7 | `kubectl -n jwt-auth-demo rollout status deployment/backend && kubectl -n jwt-auth-demo get pods` | `deployment "backend" successfully rolled out`；表格：`backend-<hash>-<id> 1/1 Running` 兩列、`backend-migrate-<id> 0/1 Completed`、`postgres-… 1/1 Running` | pod 名字 = Deployment 名 + ReplicaSet 的 hash + 亂碼。`1/1` 是「1 個容器裡 1 個 Ready」，Ready 的定義是 readinessProbe（`/api/health`）。`Completed` 是 Job 跑完 |
| 8 | 另開一個視窗：`kubectl -n jwt-auth-demo port-forward service/backend 8080:80`；回原視窗 `curl -s localhost:8080/api/health` | `{"status":"ok","db":"ok","migration":"0006","version":"k8s"}` | Service 的 80 轉到 pod 的 8000；`version` 是 Deployment 給的環境變數 `APP_VERSION=k8s`（Render 那邊是 git commit）。這條 port-forward 黏在一個 pod 上，等一下換版它會斷，這就是為什麼 CI 量零停機不用它 |
| 9 | `docker tag jwt-backend:ci jwt-backend:v2 && kind load docker-image jwt-backend:v2 --name jwt && kubectl -n jwt-auth-demo run probe --image=curlimages/curl:8.12.1 --restart=Never -- sh -c 'for i in $(seq 1 80); do curl -s -o /dev/null -w "%{http_code}\n" --max-time 2 http://backend/api/ping; sleep 0.5; done'` | `pod/probe created` | 同一個 image 打上 v2 當「新版」。probe 是叢集裡的一個 curl，每 0.5 秒打一次 Service，打 80 次，把狀態碼印出來 |
| 10 | `kubectl -n jwt-auth-demo set image deployment/backend backend=jwt-backend:v2 && kubectl -n jwt-auth-demo rollout status deployment/backend` | `Waiting for deployment "backend" rollout to finish: 1 out of 2 new replicas have been updated...`、`1 old replicas are pending termination...`、`successfully rolled out`（約 15 秒） | 順序：多起 1 個新的（maxSurge 1）→ 等它 Ready → 關 1 個舊的 → 再來一輪。`pending termination` 那幾秒是 preStop 在睡 5 秒，等 Service 的名單更新完才真的關。全程至少 2 個在服務（maxUnavailable 0） |
| 11 | `kubectl -n jwt-auth-demo wait --for=jsonpath='{.status.phase}'=Succeeded pod/probe --timeout=120s && kubectl -n jwt-auth-demo logs probe \| sort \| uniq -c && kubectl -n jwt-auth-demo delete pod probe` | `80 200`（80 次全部 200） | 零停機不是口號，是數出來的。拿掉 preStop 或把 maxUnavailable 改 1，這個數字可能就不是 80 了（動手玩 6） |
| 12 | `kubectl -n jwt-auth-demo rollout history deployment/backend` | `REVISION` 兩列：`1`、`2` | 每次換版一個 revision，k8s 幫你留著舊的 ReplicaSet（`get rs` 看得到 0/0 的那個） |
| 13 | `kubectl -n jwt-auth-demo rollout undo deployment/backend && kubectl -n jwt-auth-demo rollout status deployment/backend && kubectl -n jwt-auth-demo get deployment/backend -o jsonpath='{.spec.template.spec.containers[0].image}'` | `deployment.apps/backend rolled back`、`successfully rolled out`、`jwt-backend:ci` | 退版一個指令，對照 `RUNBOOK.md` 第 2 節 Render 的 Rollback 按鈕。undo 本身也是一次滾動更新，一樣零停機；再看 history 會是 `2`、`3` |
| 14 | `kubectl -n jwt-auth-demo set image deployment/backend backend=jwt-backend:does-not-exist; sleep 20; kubectl -n jwt-auth-demo get pods` | 一個 `0/1 ErrImagePull`（或 `ImagePullBackOff`）、兩個 `1/1 Running` | 壞版本：新 pod 起不來，就永遠不會 Ready；maxUnavailable 0 代表舊的不能關。所以兩個舊的還在。問他：現在打 Service 會怎樣？ |
| 15 | `kubectl -n jwt-auth-demo run probe2 --image=curlimages/curl:8.12.1 --restart=Never --rm -i -- curl -s -o /dev/null -w "%{http_code}\n" http://backend/api/ping` | `200` | 流量只會到 Ready 的 pod，壞的那個根本不在名單裡。使用者什麼都沒感覺到 |
| 16 | `kubectl -n jwt-auth-demo rollout undo deployment/backend && kubectl -n jwt-auth-demo rollout status deployment/backend && kubectl -n jwt-auth-demo describe deployment/backend \| tail -n 8` | `rolled back`、`successfully rolled out`；Events 幾行 `Scaled up replica set backend-… from 0 to 1`、`Scaled down …` | 壞掉先看 `describe` 的 Events 和 pod 的 `logs`，這是 k8s 的「讀 log」（關卡 20） |
| 17 | 關掉步驟 8 那個視窗的 port-forward（Ctrl-C），`kind delete cluster --name jwt` | `Deleted nodes: ["jwt-control-plane"]` | 整個叢集刪掉，一個 container 而已；image 還在 docker 裡，下次 create + load 幾十秒 |

**VM 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | GitHub → Actions → **Infra** → 最新的 run → `k8s` job | 十一步全綠，約 3 分鐘 | 這個 job 從開叢集到刪叢集，就是 Mac 路線的 17 步 |
| 2 | 展開「開一個 kind 叢集」 | `✓ Starting control-plane`、`Set kubectl context to "kind-jwt"` | 同 Mac 步驟 2 |
| 3 | 展開「kubectl apply -k，等遷移 Job 與 Deployment」 | `job.batch/backend-migrate condition met`、六行 `Running upgrade`、`deployment "backend" successfully rolled out`、pods 表格兩個 `Running` 一個 `Completed` | 同 Mac 步驟 6～7 |
| 4 | 展開「Smoke test（port-forward → Service → pod）」 | `{"status":"ok","db":"ok","migration":"0006","version":"k8s"}`、`✅ 兩個 pod 在服務，遷移是 0006` | 同 Mac 步驟 8 |
| 5 | 展開「滾動更新到 v2」 | `Waiting … 1 out of 2 new replicas have been updated...`、`1 old replicas are pending termination...`、`REVISION 1 2`、`換版期間打了 80 次，不是 200 的有 0 次`、`✅ 零停機` | 同 Mac 步驟 9～12 |
| 6 | 展開「退版（rollout undo）」 | `deployment.apps/backend rolled back`、`退版後的 image：jwt-backend:ci`、`REVISION 2 3` | 同 Mac 步驟 13 |
| 7 | 展開「壞版本被擋住」 | `error: timed out waiting for the condition`、`rollout 逾時，這是預期的`、pods 表格一個 `ErrImagePull` 兩個 `Running`、`✅ 兩個舊 pod 仍 Ready（2）`、`200`、`✅ 壞版本期間 Service 照常回 200`、`✅ undo 之後恢復，image：jwt-backend:ci` | 同 Mac 步驟 14～16。`timed out` 是故意的：壞版本永遠不會 rollout 完成 |
| 8 | 展開「kubectl get / describe / logs」 | `get all` 的清單（pod、service、deployment、replicaset 三個其中兩個 0/0、job）、Events 的 `Scaled up / Scaled down` | 同 Mac 步驟 16。三個 ReplicaSet 就是三個 revision |

**收尾**（你看到的 → 對應的觀念）：`1/1 Running` 兩個 → Deployment 保證 N 個副本 / Job `Completed` → 遷移跑一次不放啟動指令 / `80 200` → maxUnavailable 0 + readiness + preStop = 零停機 / `rolled back` → 退版是換回上一個 ReplicaSet / `ErrImagePull` 但 Service 回 200 → 流量只到 Ready 的 pod / Secret 用指令建 → 密鑰不進 git / `kind delete` → 叢集是可拋棄的，清單在 git。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 23 的 1（刪一個 pod）、3（殺掉程式）、5（唯讀檔案系統）。

### 關卡 24：非同步訊息（transactional outbox → Kafka、冪等）

**搭配看的程式**：`backend/outbox.py`（開頭的註解就是講義；順序：`enqueue` → `publish_pending` → `run_worker` → `handle_event` → `run_consumer`）；`backend/routes/auth.py` 第 97～129 行（上限檢查、`flush` → `enqueue` → `commit` → `wake_worker`）；`backend/models.py` 的 `OutboxEvent`、`ProcessedEvent`；`backend/main.py` 的 `lifespan`（inline 模式）；`backend/worker.py`、`consumer.py`；`infra/compose.yaml` 的 messaging profile 四個服務；`.github/workflows/infra.yml` 的 `messaging` job；`render.yaml` 的三個新變數

**前置**：三條路線，預期值一樣。**Mac 路線**同關卡 21（Docker）。**本機路線（不用 Docker，Windows 也行）**：關卡 0 的本機後端跑得起來就夠，看的是「沒有 Kafka 時事件印到 log」那一段，Redpanda 的部分看 CI。**VM 路線**看 Actions。指令都在 repo 根目錄下。

**Mac 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `docker compose -f infra/compose.yaml --profile messaging up -d --build --wait` | `Container jwt-auth-demo-redpanda-init-1  Exited`、其餘五個 `Healthy`（postgres、redpanda、backend、worker、consumer） | 多起四個：Redpanda（Kafka 相容的 broker，一個 binary）、redpanda-init（建 topic 後就結束，所以是 Exited 不是 Healthy）、worker、consumer。worker 和 consumer 用的是**同一個 backend image**，只是 command 換成 `python worker.py`／`python consumer.py` |
| 2 | `docker compose -f infra/compose.yaml --profile messaging logs --no-color worker consumer \| grep -E "Kafka\|開始讀"` | `worker-1 … outbox worker：送到 Kafka  brokers=redpanda:9092`、`consumer-1 … outbox consumer：開始讀  topics=['user.registered']` | 兩邊都是靠 `KAFKA_BOOTSTRAP_SERVERS` 知道 broker 在哪；沒設這個變數 worker 就只印 log（本機路線會看到） |
| 3 | `email="m24-$(date +%s)@example.com"; curl -s -X POST localhost:8000/api/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"Passw0rd!x\"}"` | `{"id":1,"email":"m24-…@example.com","created_at":"…","last_login_at":null}` | 註冊和以前一樣快、一樣的回應。寄信那類的事不在這個請求裡，請求只多做一件事：在同一個交易裡多 INSERT 一筆 outbox |
| 4 | `docker compose -f infra/compose.yaml exec -T postgres psql -U postgres -d jwtdemo -c "SELECT id, topic, published_at IS NOT NULL AS published FROM outboxevent;"` | 一列：uuid、`user.registered`、`t`（最多 5 秒內從 `f` 變 `t`；太快查可能看到 `f`） | 這就是 outbox 表。`published_at` 是 worker 送完才填的；worker 每 5 秒撿一次 `published_at IS NULL` 的 |
| 5 | `docker compose -f infra/compose.yaml --profile messaging logs --no-color worker \| grep published` | `published  event_id=<uuid> topic=user.registered transport=kafka` | uuid 和步驟 4 的 id 一樣。`transport=kafka` 代表真的送進 Redpanda 了（`acks="all"`：所有副本寫到才算成功） |
| 6 | `docker compose -f infra/compose.yaml --profile messaging logs --no-color consumer \| grep consumed` | `consumed  event_id=<同一個 uuid> topic=user.registered email=<步驟 3 的 email>` | consumer 從 topic 讀到、交給 `handle_event`：先 INSERT `processedevent`（主鍵 = 事件 id）、做事（這裡只記 log）、commit、才 commit offset |
| 7 | `docker compose -f infra/compose.yaml exec -T postgres psql -U postgres -d jwtdemo -c "SELECT id, topic FROM processedevent;"` | 一列，同一個 uuid | 「處理過」的證據在資料庫，不在記憶體：consumer 重啟也記得 |
| 8 | `docker compose -f infra/compose.yaml --profile messaging exec -T redpanda sh -c "rpk topic consume user.registered -n 1 -o start -f '%v\n' --brokers redpanda:9092 \| rpk topic produce user.registered --brokers redpanda:9092"` | `Produced to partition 0 at offset 1 with timestamp …` | 把 topic 裡那一筆原封不動再送一次：模擬「送出去了、標記前當掉、重啟再送」的 at-least-once |
| 9 | `sleep 3; docker compose -f infra/compose.yaml --profile messaging logs --no-color consumer \| grep duplicate; docker compose -f infra/compose.yaml exec -T postgres psql -U postgres -d jwtdemo -tAc "SELECT count(*) FROM processedevent;"` | `duplicate  event_id=<同一個 uuid> topic=user.registered`、`1` | 第二次 INSERT 撞主鍵 → 回滾 → 記 `duplicate` → 不做事。這就是冪等：同一筆來幾次都只做一次。和註冊的 email unique 索引是同一招（關卡 13） |
| 10 | `docker compose -f infra/compose.yaml --profile messaging stop consumer; curl -s -X POST localhost:8000/api/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"m24b-$(date +%s)@example.com\",\"password\":\"Passw0rd!x\"}" > /dev/null; sleep 6; docker compose -f infra/compose.yaml --profile messaging logs --no-color worker \| grep -c published` | `2` | consumer 掛了，註冊照常成功、worker 照常送到 Kafka。訊息在 topic 裡等著，不會丟 |
| 11 | `docker compose -f infra/compose.yaml --profile messaging start consumer; sleep 5; docker compose -f infra/compose.yaml --profile messaging logs --no-color consumer \| grep -c consumed` | `2` | consumer 回來從上次 commit 的 offset 繼續讀，把剛才那筆補上。「寫的人不用等讀的人、讀的人掛了訊息還在」就是這個 |
| 12 | `docker compose -f infra/compose.yaml --profile messaging down -v` | `Removed` 幾行 | 關的時候也要帶 `--profile` |

**本機路線（不用 Docker；Mac、Windows 都行）**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `backend/.env` 加一行 `OUTBOX_WORKER=inline`；在 `backend/` 跑 `uv run uvicorn main:app --reload --port 8000` | 啟動 log 多兩行：`outbox worker 在 web 程序裡當背景 task 跑`、`outbox worker：沒設 KAFKA_BOOTSTRAP_SERVERS，事件只印到 log` | 這就是線上 Render 的模式（`render.yaml`）：免費方案開不了第二個服務，worker 在 web 程序裡當背景 task；沒有 Kafka，事件印到 log |
| 2 | 另一個終端機註冊一個新 email（關卡 0 的 curl 或前端畫面） | 回 201；後端的終端機 1 秒內多一行 `published  event_id=<uuid> topic=user.registered transport=log` | 不用等 5 秒：註冊 commit 之後按了鈴（`wake_worker`），worker 立刻醒。`transport=log` 是 LogPublisher，換成 Kafka 只差一個環境變數 |
| 3 | Neon SQL Editor（`DATABASE_URL` 那個資料庫）：`SELECT id, topic, published_at FROM outboxevent ORDER BY created_at DESC LIMIT 3;` | 最新一列的 `published_at` 有時間 | outbox 在線上資料庫裡也有這張表（遷移 0005）；`processedevent`（0006）線上是空的，因為線上沒有 consumer |
| 4 | Render → Logs 搜 `published` | 線上每一次註冊一行 `published`（JSON 格式，`transport: log`） | 同一支程式、同一個模式，線上也看得到整條路的前半段。後半段（Kafka、consumer）看 CI |
| 5 | 把 `.env` 的那行拿掉 | — | 本機平常不用開 |

**VM 路線**

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | GitHub → Actions → **Infra** → 最新的 run → `messaging` job | 三步全綠，約 1 分鐘 | 五個 job 裡最快的一個：Redpanda 幾秒就起來 |
| 2 | 展開「compose up」 | `redpanda-init-1  Exited`、五個 `Healthy` | 同 Mac 步驟 1 |
| 3 | 展開「註冊 → worker published → consumer consumed」 | 註冊的 JSON；`worker-1 … published  event_id=… transport=kafka`；`consumer-1 … consumed  event_id=… email=ci-…@example.com`；`✅ 事件走完：outbox → Kafka → consumer`；兩張表各一列、`published` 是 `t` | 同 Mac 步驟 3～7。三個 uuid 都一樣：outbox 的 id = Kafka 訊息的 key = processedevent 的主鍵 |
| 4 | 展開「同一筆再送一次 → duplicate」 | `Produced to partition 0 at offset 1`、`consumer-1 … duplicate  event_id=…`、`processedevent 筆數：1`、`✅ 冪等：同一筆事件只處理一次` | 同 Mac 步驟 8～9 |

**收尾**（你看到的 → 對應的觀念）：註冊回應沒變慢 → 慢的事不在請求裡 / outbox 表一列、`published` 從 f 變 t → 事件和使用者同一個交易，送出是另一件事 / 三個一樣的 uuid → 事件 id 貫穿整條路 / `duplicate` 且筆數還是 1 → at-least-once + 冪等 / consumer 停了再回來補上 → 訊息在 broker 裡等，讀寫解耦 / `transport=log` → 沒有 Kafka 也走得通，差一個環境變數。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 24 的 1（把 enqueue 搬到 commit 之後）、3（worker 開兩個）。
