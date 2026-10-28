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
- **問之前先確認每個問的東西都有答案值得講**（曾經問了 cookie 存放處的「兩個 FALSE」，答完才說第一個不重要，這會讓人覺得白問）。一次只問有意義的那一兩格。
- **名詞先定義再用，而且每個關鍵名詞都要有一個比喻**（曾經雜湊、SHA-256、bcrypt、鹽、簽章沒先講就拿來用，整關跟著亂；標準是沒有背景的人也聽得懂）。同一類東西有好幾個時（兩張票、三種工具），每次提到都要指名是哪一個，不要只說「票」。
- **他貼的輸出亂掉**（兩個指令疊在一起、終端機把上一個的尾巴接上來）：先說「結果是對的，前面是終端機疊在一起」，直接講，不要叫他重跑。
- **他說「看不懂」**：不要整段換個說法重講。問「哪一行」，或從他最後貼的輸出重新開始，一次講一行。
- **他說「我沒看到你說的東西」**：相信他，是你記錯了。改成用指令、數字或檔案內容驗證，不要再描述畫面。
- **每個實驗結束一句話「這證明了什麼」**。一關結束用「你看到的 → 對應的觀念」表格收尾，**收尾之後要問「哪一步要我再講一次？」**，他說沒有再進下一關（關卡 19 曾經收尾講太快）。
- **一關的收尾有三段，缺一不可，而且不要催**（關卡 0 曾經因為催太快，被要求先整理好再往下）：(1) 用一個情境把整關脈絡從頭講一遍（一個請求走幾站、每站誰在做、出錯回什麼）；(2) 出 5～7 題讓他用自己的話答，題目要蓋到這關的每個觀念；(3) 逐題對答案，對一半的說清楚缺哪一半，錯的用情境重講，再補一輪只問錯的。最後給一份「整理」：一句話、脈絡表、狀態碼表、規則、他誤解過的地方。**他說「下一關」才開下一關**，不要在收尾訊息的結尾就塞下一關的第一步。**收尾的題目答完也一樣**：答完最後一題就停，說「這關結束」，等他說；曾經題目答完直接開下一關的第一步，被問「我沒有叫你前進，為什麼擅自推進」。「往下」「繼續」只算這一關內的下一步，不算開下一關。
- **PowerShell 指令列打中文會變 `?`**（`python -c '中文'`、`pytest -k 中文` 都撞過）：預期值要用英文片段或 curl 的 JSON 走；輸出的中文被印成 `\uXXXX` 是輸出編碼，`-v` 模式正常。別在這上面繞。
- **出題只問他打得開的程式**（曾經問「關卡 2 之前的 `os.getenv` 寫法會怎樣」，那段程式已經不在 repo 裡，他沒地方看）。要問歷史版本，先給 `git show <commit>~1:<檔案>` 讓他看到再問。
- **每次開 PR 之前先 `git fetch origin main`，看 main 有沒有別的對話推的東西，有就先合進來再推**，不是只在他提醒時才做。同一個 repo 常常有另一個對話在改文件，曾經關卡 5 的 PR 疊在舊的 main 上，對方同時合了 `HANDOFF.md` 另一節，靠改到不同行才沒衝突，不是靠流程。合併後也要 `git log` 看一眼中間還有誰的 commit。
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
| **快速走** | 6、7、9、10、11、13、14、15、16 | 20～30 分鐘 | 讀 `PLAIN.md` 那段，只做腳本的前兩步親眼看一次就過。9、10 只看 log，不改平台設定。**11 例外**：加三個演練（備份還原、Render 退版、本機 alembic 退版），各 5～30 分鐘，都是按平台的按鈕、不改設定、不會跳付費頁（學習者 2026-10-28 問「只做還原就夠了嗎」，決定補退版兩項；Sentry 與換密鑰跳過，理由在關卡 11 腳本） |

順序照編號。每天約 4 小時，預計 5～7 天。走到哪記在 `HANDOFF.md` 第 2 節。關卡 21～24（基礎設施，`PLAN-INFRA.md`）重帶走完之後只走「VM 路線」（看 CI 的 log，每關一小時）；「Mac 路線」是選配，有興趣的週末再做，兩條路線的預期值一樣。重帶走完先開練習專案（`PLAN-FULLSTACK.md` 第 1 節）。仔細走的關如果他說「這個我已經懂了」，抽腳本中間一步讓他講預期值，講得出就跳過。

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
- **每次說「票」都要指名是哪張**。整關的 cookie 存放處、cookie、名冊、作廢、刪除、reused、Invalid 全部是 **refresh token** 的事；access token 沒有「舊的」這回事，過期就丟。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s -c jar.txt localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"t@test.com\",\"password\":\"Passw0rd!x\"}'` 然後 `type jar.txt` | JSON 有 `access_token`；cookie 存放處最後一行 `#HttpOnly_localhost FALSE /api/auth FALSE <秒數> refresh_token <43 字>` | cookie 存放處 = curl 的 cookie jar（`-c`/`--cookie-jar` 寫入、`-b` 讀出），本機就是 `jar.txt`，模擬瀏覽器的 DevTools → Application → Cookies。**不要再自創「罐子」這種詞**，學習者問「罐子是什麼、你自創的？」。只問 `/api/auth`（Path：只有打這路徑才帶）和**第二個** `FALSE`（Secure 沒開，http 也送；正式是 TRUE）。第一個 FALSE 是 curl 內部欄位，**不要問**。43 字 = `secrets.token_urlsafe(32)`：32 個隨機 byte 用 base64 印成可讀的字（3 byte → 4 字，所以 43）。`set-cookie` = 後端請瀏覽器把這張存起來 |
| 2 | `curl.exe -v -b jar.txt -c jar.txt -X POST localhost:8000/api/auth/refresh` | `>` 有 `Cookie: refresh_token=舊值`；`<` 有 `set-cookie: refresh_token=新值`；`* Replaced cookie` | `-b`/`--cookie` 從 cookie 存放處帶出去、`-c`/`--cookie-jar` 存回來，是 curl 自己的參數（`curl.exe --help all \| Select-String cookie`）。後端五段：`Cookie(...)` 取票（179）→ `hash_token` 查表、`with_for_update` 鎖（191～195）→ 舊的 `revoked = True`（229）→ `issue_refresh_token` 發新的（230）→ `set_refresh_cookie` + 新 access token（233～237）。瀏覽器平常同時做 `-b` 和 `-c`，自動的 |
| 3 | 舊值已不在 cookie 存放處裡，用字串帶：`curl.exe -s -i -b "refresh_token=<步驟 1 的 43 字>" -X POST localhost:8000/api/auth/refresh` | `401`，`Refresh token reused` | 票**還在**表裡，`revoked = true` 又被送來 → 當成被偷 → `revoke_all_refresh_tokens` 把這個人全部的 refresh token **刪掉**（62 行是 `delete`，不是標記）。先讓他猜：cookie 存放處裡的新票還能用嗎 |
| 4 | `curl.exe -s -i -b jar.txt -X POST localhost:8000/api/auth/refresh` | `401`，`Invalid refresh token` | 票**不在**表裡（201 行）。兩句 401：`reused` = 還在但蓋章，`Invalid` = 查不到。輪替是標記（留證據），重用偵測是刪除（全清） |
| 5 | Neon SQL Editor **先確認選的是 `DATABASE_URL` 那個資料庫**（關卡 18 用的是 `TEST_DATABASE_URL`，Editor 會停在那裡；`Get-Content backend\.env \| Select-String DATABASE_URL` 看資料庫名）。跑 `SELECT count(*) FROM refreshtoken WHERE user_id = <他的 id>;` | `0` | 和步驟 4 對上。資料庫不對會查到「都沒有」 |
| 6 | 重新登入（步驟 1），再查 `SELECT token_hash, revoked, created_at FROM refreshtoken WHERE user_id = <id>;`，然後在 `backend` 跑 `uv run python -c "from security import hash_token; print(hash_token('<cookie 存放處裡的 43 字>'))"` | 一筆 `revoked = f`，`token_hash` 64 字；自己算出來的跟資料庫**一模一樣** | 資料庫只有 SHA-256 亂碼，沒有原值。後端收到 cookie 就是這樣找到那筆：原值 → SHA-256 → `WHERE token_hash =`。`hashlib.sha256(token.encode()).hexdigest()`：文字變 byte → 雜湊 32 byte → 印成 64 個 16 進位字 |
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

**搭配看的程式**：`backend/routes/auth.py` 的 `delete_expired_refresh_tokens`（65）、`logout`（241）、`logout_all`（266）、`change_password`（286）；`backend/schemas.py` 的 `ChangePasswordRequest`；`frontend/src/api/client.ts` 的 response 攔截器（74～97，第 3 題要用）；`frontend/src/pages/SettingsPage.tsx`

**前置**：後端跑起來（先 `curl.exe -s -i localhost:8000/api/ping` 確認，曾經後端沒開、cookie 存放處是空的還往下做）、帳號 `t@test.com` / `Passw0rd!x`。用兩個 cookie 存放處（`a.txt`、`b.txt`）模擬兩台裝置：A 電腦、B 手機。**一次只給一步、只收一步的輸出**（曾經一次丟三步，其中一步貼錯 token 就繞了很久）。access token 要他整串複製，指令裡直接把他貼過的 token 填好，不要留 `<佔位符>`（曾經原樣送出 `<A的token>`、也曾只貼 `eyJhbGci` 八個字，都回 `401 Invalid or expired token`：那是 `get_current_user` 驗簽章失敗，進不到函式）。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 登入兩次：`curl.exe -s -c a.txt localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"t@test.com\",\"password\":\"Passw0rd!x\"}'`，再一次 `-c b.txt`，然後 `type a.txt`、`type b.txt` | 兩個 JSON 各一個 `access_token`；兩個 cookie 存放處的 `refresh_token` 值不同 | 同一個帳號兩台裝置，各一張會員卡。把 A 的 access token 留著 |
| 2 | Neon（`neondb`）：`SELECT count(*), count(*) FILTER (WHERE revoked) AS revoked FROM refreshtoken WHERE user_id = <id>;` | 不只 2（他之前每次登入、每次換票都各 INSERT 一列，蓋章的舊卡不刪） | 表會慢慢長大是正常的：蓋章的卡留著當證據，登入時的 DELETE 只清**過期**的。這關的兩個動作會讓它一次歸零 |
| 3 | 用 A 改密碼：`curl.exe -s -i localhost:8000/api/auth/change-password -b a.txt -c a.txt -H "Authorization: Bearer <A 的 token 整串>" -H "Content-Type: application/json" -d '{\"current_password\":\"Passw0rd!x\",\"new_password\":\"Passw0rd!y\"}'`；再查一次步驟 2 的 SQL（先讓他猜 count） | `200`，新 `access_token`、新 `set-cookie`；count `1`、revoked `0` | `change_password` 五步：bcrypt 驗目前密碼（錯回 **400** 不是 401）→ 新舊相同 400 → 新密碼 bcrypt 存 → `revoke_all_refresh_tokens` 整排刪 → `issue_refresh_token` 立刻補發一張給自己。少了補發，改密碼的人也會被登出 |
| 4 | B 換票：`curl.exe -s -i -b b.txt -X POST localhost:8000/api/auth/refresh`（先猜關卡 1 的哪句 401） | `401 Invalid refresh token` | B 的卡被整排刪掉，查不到。**但 B 手上的 access token 到 30 分鐘過期前還能用**：驗 access token 不查資料庫，「其他裝置登出」是下次換票時才發生。要立刻失效得加黑名單表、每個請求都查，就失去 access token 快的優點，設計上接受這個取捨（`logout_all` 的 docstring） |
| 5 | 舊密碼登入 `-s -i`（`Passw0rd!x`）；新密碼登入 `-s -c b.txt`（`Passw0rd!y`） | `401 Incorrect email or password`；`200` | B 用新密碼重新登入，又多一列 |
| 6 | 用 B 的新 token，目前密碼故意打 `wrong`，`new_password` 填 `Passw0rd!x` | `400`，`目前密碼錯誤` | 為什麼不能 401：先給攔截器四條規則（不是 401 或已 `_retry` → 丟出；401 第一次 → 標記、換票；換票失敗 → `clearSession`；成功 → 原請求重送一次），讓他推：改成 401 會變 `change-password 401 → refresh 200 → change-password 401`，多一次沒必要的換票與輪替、同樣的密碼多送一趟、等兩倍時間還是錯。狀態碼選錯程式不會壞，只會做多餘的事 |
| 7 | 把密碼改回 `Passw0rd!x`（`current_password` 填 `Passw0rd!y`） | `200`，新 token | 留著下一步用 |
| 8 | 登出所有裝置：`curl.exe -s -i -X POST localhost:8000/api/auth/logout-all -H "Authorization: Bearer <步驟 7 回的 token>"`，然後 B 再換票一次，再查 count | `204 No Content`，標頭 `set-cookie: refresh_token=""; Max-Age=0; Path=/api/auth`；B `401`；count `0` | 204 = 成功沒內容。刪 cookie 沒有指令，是「設一張同名、同 Path、立刻過期的」蓋掉；Path 不同瀏覽器當成另一張，舊的留著刪不掉，而且兩張都符合 `/api/auth` 時瀏覽器兩張都帶，`Cookie()` 取第一個可能取到舊的 → 重新登入後還是 401（故障演練第 6 條） |

**收尾一句話**：改密碼 = 整排刪 + 補發一張給自己；登出所有裝置 = 整排刪 + 清自己的 cookie；其他裝置要到下次換票才發現。
**收尾要講到**：脈絡表（兩台裝置的一天 × 資料庫列數）/ 改密碼三個寫入在同一個交易（UPDATE user、DELETE refreshtoken、INSERT refreshtoken、COMMIT），一起成功或一起失敗 / `logout` 只刪 cookie 那一列、不用 access token（cookie 本身證明是你的，沒 cookie 也 204）；`logout_all` 要 user_id 所以要 access token 的 `sub` / 204 與 400（不是 401）兩個狀態碼補進關卡 0 的表。
**題目**（一題一題問，答完一題對一題）：改密碼後自己為什麼不用重登、哪一行 / 手機什麼時候發現被登出、為什麼不是立刻 / 目前密碼錯改成 401 會怎樣（先給攔截器規則再讓他一步步推）/ `Path=/` 刪 cookie 會變幾張、後果 / `logout` 與 `logout_all` 的差別、為什麼一個不用 access token / 改密碼成功時資料庫的寫入順序。
**動手玩**：`LEARNING.md` 關卡 3 的用兩個瀏覽器（一般 + 無痕）在畫面上再做一次。

### 關卡 4：自動化測試（pytest）

**搭配看的程式**：`backend/tests/test_auth.py`（117 行 `test_舊的refresh_token再被使用會撤銷全部`、230 行 `test_改密碼成功`）、`tests/helpers.py`（`register`、`login`、固定帳號 `test@example.com`）、`tests/conftest.py`（只講三件事，見步驟 7）；`backend/pyproject.toml` 的 pytest 設定

**前置**：`backend\.env` 有 `TEST_DATABASE_URL`，而且是 `jwt-auth-demo` 專案的 `jwtdemo_test`（不是 `neondb`，更不是 `jwt-auth-demo-prod`）。本機要是最新版：`git pull`，然後**在 `backend`** `uv sync`、`uv run alembic upgrade head`（曾經在 repo 根目錄跑這兩個，`No pyproject.toml found`）。`uv` 找不到：這個視窗是裝 uv 之前開的，`$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"`，或整個 Windows Terminal 關掉重開（新分頁不會重讀 PATH）。

**先講名詞**：測試（跟 curl 做的事一樣，由程式自己打、自己對）、pytest（找 `test_` 開頭的函式一個一個跑）、assert（「我斷言這個對」，不對就紅）、測試資料庫（每個測試前清空，所以絕對不能是正式或開發用的那個）。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `uv run pytest -q`（在 `backend`） | 一排點，最後 `67 passed in 271s`（數字以輸出為準） | 慢是因為測試資料庫在 Neon，67 次 TRUNCATE 都跨海；CI 用本機 Postgres 約 1 分鐘。這些測試就是關卡 0～3 用 curl 做過的事 |
| 2 | `uv run pytest --collect-only -q \| Select-Object -First 30`（**`-q` 只能一個**，兩個會變成只印每個檔案幾個） | 一行一個 `tests/test_auth.py::test_...`，中文會印成 `註冊`（PowerShell 輸出編碼） | 名稱就是規格。幫他解開對照：註冊成功 / 重複註冊 400 / 中文密碼 422 / 密碼錯 401 / 登入密碼太短也 401 = 關卡 0；登入拿兩張票 / refresh 換發 / 舊的再用撤銷全部 / DB 只存雜湊 = 關卡 1；登出所有裝置 / 改密碼 / 目前密碼錯 400 = 關卡 3；登入時清過期 = 關卡 2 的 DELETE |
| 3 | `uv run pytest -v -k refresh_token` | `4 passed`，四個名稱用中文印出來 | `-k` 挑名字裡有這串的。**`-k` 後面打中文會變 `????`**（指令列輸入編碼，和關卡 0 的 `python -c` 同一個坑），用名稱裡的英文片段，或先 `chcp 65001` |
| 4 | 打開 `tests/test_auth.py` 第 117 行，把函式貼給他，一行對一步 | `register` / `login` / 記 `old_cookie` / `refresh` = 關卡 1 第 1～2 步；`thief = make_client(cookies=...)` + `refresh` = 第 3 步；三個 `assert`（401、那句、`count == 0`）= 第 3、5 步；本人 `refresh` 401 = 第 4 步 | `client` = 帶 `-b -c` 的 curl、`make_client` = 第二個 cookie 存放處、`helpers.py` 的 `register`/`login` 帳號固定。測試的三段：**準備、動作、斷言**，讀任何測試都找這三段 |
| 5 | `routes\auth.py` 第 229 行 `rt.revoked = True` 前面加 `#`，**存檔**（曾經沒存到，還是 4 passed：先 `Get-Content routes\auth.py \| Select-String -n "rt.revoked = True"` 看有沒有 `#`），`uv run pytest -q -x -k refresh_token` | `FAILED ...撤銷全部 - assert 200 == 401`、`1 failed, 1 passed` | 讀法：`assert 實際 == 預期`，左邊程式真的回的、右邊測試要的。拆三個小問題問：200 是誰 / 紅的是小偷那個 (a) 還是本人那個 (b)（第一個失敗就停）/ 拿掉蓋章後舊票 `revoked` 永遠 false，207 行 `if rt.revoked` 不走，小偷換成功 200。重點：登入、換票、`/me` 全部正常，**沒有任何錯誤訊息，只有測試抓得到** |
| 6 | `git checkout -- routes/auth.py`，再跑一次 | `4 passed` | |
| 7 | `conftest.py` 不出題，用白話講三件事：(1) 26～34 行：沒設 `TEST_DATABASE_URL` 或跟 `DATABASE_URL` 一樣就拒跑，因為下一件會清表；(2) 43～59 行 `clean_database` 標 `autouse=True`，每個測試前自動跑，第一次砍掉重建、之後 TRUNCATE，所以每個測試從空庫開始、`register` 永遠不撞；`yield` 上面是測試前、下面是測試後；(3) 60 行起 `client`：測試參數寫 `client` 就拿到一個「帶 cookie 存放處的 curl」，打記憶體裡的 app，`get_session` 被換成測試庫的版本。25 行 `limiter.enabled = False` 是因為測試從同一個 IP 打幾十次登入 | | 一句話：用錯庫就不跑、每個測試前清空、給你一個 client。讀測試時只要知道 `client` 從這來 |

**conftest.py 可以略過，而且要明講**（學習者問「一定要讀懂嗎」「什麼時候要知道、不會寫也要能抄」）：現在只要上面那張「測試裡寫什麼 → 拿到什麼」的表。要回來的時機是練習專案環 5 請 AI 寫第一個測試時，用三件事驗收：有拒用正式庫的保險絲、每個測試前清空或隔離、`client` 打的是真後端接的是測試庫。怎麼抄：`CHAIN.md` 附錄 A 的 `conftest.py` 那列（整個複製、改 TRUNCATE 的表名、關掉自己專案的外部服務）。每個專案的準備檔內容不同（rollback 代替 TRUNCATE、Docker Postgres 代替 Neon、TestClient 代替 AsyncClient），但「準備資料庫、接到測試庫、給一個 client」三件事都在；前端的 `src/test/setup.ts` + `server.ts` 是同一個東西。
**學習者的程度（2026-10-27）**：讀得懂測試程式本身（三段式、`assert`、一行對一步），讀不懂 conftest 這種「準備用的」程式，這是正常的，不要逼。

**收尾一句話**：把三關的 curl 寫成程式，一個指令 30 秒驗完；紅了讀最後一行 `assert 實際 == 預期`；改壞了沒有錯誤訊息的 bug 只有測試抓得到。
**題目只出有觀念的**（曾經問「`-k` 中文為什麼失敗」「測試庫為什麼要不同」被嫌沒意義）：(1) `assert 200 == 401` 拆三個小問題（上面步驟 5）；(2) **用準備、動作、斷言三段，用中文寫「電腦改密碼後手機被登出」要測什麼**。他答「兩台登入 / A 改密碼 / B 換票 401」就對了，再補一句「A 自己換票要 200」（補發那一半），然後貼 230 行 `test_改密碼成功` 給他對：多了舊密碼登入 401、新密碼登入 200 兩個斷言。
**動手玩**：`LEARNING.md` 關卡 4 的「自己寫一個」（照 230 行的樣子寫 `test_登出所有裝置後兩台都401`）。

### 關卡 5：資料庫遷移（Alembic）

**搭配看的程式**：`backend/models.py`（櫃子長什麼樣）；`backend/migrations/versions/0001～0006`（六張施工單，一檔一張；0002 最短最好讀）；`backend/Dockerfile:67` 的 CMD（啟動時先 `alembic upgrade head`）；`.github/workflows/ci.yml` 的「遷移檢查」那步

**前置**：後端能連到本機那個 `neondb`；`uv` 找不到就先 `$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"`。這關不動 Neon 的資料，只看和產生檔案；真的 downgrade 留到關卡 11。

**先講名詞**：資料表結構（櫃子）vs 資料（放進去的東西）、遷移 = 改櫃子的施工單（有「做」upgrade 和「拆」downgrade 兩個方向）、Alembic = 管施工單的工具、`alembic_version` = 資料庫裡記「做到第幾張」的一筆。關卡 5 之前用 `create_all` 只能「沒有就建」不能改，加欄位要砍表、資料全丟。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `uv run alembic current` | `0006 (head)` | 資料庫站在第六階，`head` = 最高階 |
| 2 | `uv run alembic history` | 六行由新到舊，`0003 add user nickname`、`0004 remove user nickname` | 問他 0003 + 0004 合起來做了什麼（什麼都沒做）→ 為什麼不能刪：正式環境照順序做過、`alembic_version` 記 0006、0005 的 `down_revision` 指著 0004，刪了鏈就斷。施工單是歷史，做錯再開一張改回來 |
| 3 | `uv run alembic check` | 一堆 INFO，最後 `No new upgrade operations detected.` | 程式的櫃子和資料庫的櫃子一致 |
| 4 | `models.py` 的 `User` 在 `last_login_at` 下面加 `nickname: str \| None = None`（4 格縮排），存檔，再 `check` | `Detected added column 'user.nickname'`、`FAILED: New upgrade operations detected` | CI 的「遷移檢查」就是它。問：這時 `pytest` 會過嗎？會，測試庫用 `create_all` 直接照 `models.py` 建，永遠一致；只有走施工單的庫（本機 `neondb`、正式）才對不上。這是關卡 20 第 3 題「本機綠、CI 紅」的來源 |
| 5 | `uv run alembic revision --autogenerate --rev-id 0007 -m "add user nickname"`，打開產生的檔案貼 `upgrade()`、`downgrade()` 兩段 | `op.add_column('user', Column('nickname', AutoString(), nullable=True))` / `op.drop_column('user', 'nickname')` | **upgrade 不是「新增」、downgrade 不是「移除」**（學習者這樣以為）：upgrade = 做這張單的事，downgrade = 還原。0004 的 upgrade 就是刪欄位。樓梯比喻：`upgrade head` 往上爬每階跑 `upgrade()`（Dockerfile 每次部署跑）、`downgrade -1` 退一階跑 `downgrade()`（關卡 11 退版），所以 downgrade 必須剛好是 upgrade 的相反。`nullable=True` 是因為表裡已有使用者，`False` 會 `contains null values` 整張 rollback |
| 6 | 收拾：`Remove-Item migrations\versions\0007_add_user_nickname.py`、`git checkout -- models.py`、`uv run alembic check`、`git status` | `No new upgrade operations`、`working tree clean` | 沒套用過直接刪檔；套用過要先 `downgrade -1` 再刪 |

**自動產生會問的**（學習者問「都是自動的嗎」「一次改很多表呢」）：對，`--autogenerate` 比對 `models.py` 和資料庫，差異寫成 upgrade、反過來寫成 downgrade；多張表的差異在同一張單裡，downgrade 反序（0001 兩張表、外鍵順序）。抓得到：加刪表、加刪欄位、索引、unique、外鍵；大多抓到：改型別；**抓不到**：改名（變成 drop + add，資料全丟，要改成 `alter_column(new_column_name=)`）、搬資料（要自己寫 SQL）。所以流程是改 models → autogenerate → **打開看** → upgrade → 連檔 commit，看那一眼是他的工作，AI 改的也要看。一張單只做一件事。
**實務補救**（學習者問「實際上一定會出例外，怎麼補救、怎麼避免」）：三層保護（單在 git 裡刪了 `git checkout` 回來；CI 從空庫 `upgrade head` 鏈斷就紅；規矩「套用過的單不改不刪只加新的」）。補救表：檔案被刪 → `git checkout <commit> -- 路徑` 或照實際結構重寫同編號；兩人同時開單 `Multiple heads` → `alembic merge` 或改 `down_revision`；`alembic_version` 和檔案對不上 → `alembic stamp <版本>`（確定結構真的在那階才用）；有人手動改表 → 開一張單補進歷史；跑到一半失敗 → Postgres DDL 有交易會整張 rollback，修好重跑。**expand / contract**：加欄位先 nullable、部署、寫入、再開單改 NOT NULL；刪欄位先讓程式不讀（部署一版）再刪；改名用 alter_column。請 AI 改表時盯第一張單有沒有 `drop_column` 或 `nullable=False`。

**收尾一句話**：資料庫結構用施工單管，改 models 一定開單、看一眼、套用、一起 commit；每張單能做也能拆；程式換版用 git、資料庫換版用 Alembic。
**題目只問他做過的**（曾經問「套用了 0007 之後要還原的順序」被嗆「我又沒做過」）：(1) 加了 `nickname` 後 `check` 紅、`pytest` 綠，為什麼；(2) 0003/0004 為什麼不能刪；(3) 0007 如果是 `nullable=False`，`upgrade head` 會怎樣、為什麼。
**動手玩**：`LEARNING.md` 關卡 5 的 1（downgrade 再 upgrade，會動到 Neon，留到關卡 11 一起做）。

### 關卡 6：前端整理（api / auth / components）— 快速走

**搭配看的程式**：`frontend/src/api/auth.ts`（一個端點一個函式）、`api/client.ts:21`（`baseURL = "/api"`）、`frontend/vite.config.ts:32`（`proxy`）

**前置**：前端開著就好，不改程式、不跑後端指令。讀 `PLAIN.md` 關卡 6 那三句開場。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `Get-ChildItem frontend\src -Recurse -Name \| Select-String -NotMatch "test"`，讓他從名字猜 `api/`、`auth/`、`pages/` 放什麼 | 六個資料夾 | 他會說 `auth/` 是「驗證」，修正成「**登入狀態**」（驗證在後端）。給六個資料夾的表：`api/` 跟後端講話、`auth/` 登入狀態與守門員、`app/` 骨架（路由、導覽列）、`pages/` 一頁一檔、`components/` 零件、`schemas/` 表單規則 |
| 2 | 打開 `api/auth.ts`，只看六個 `export async function` 和裡面的 `api.post/get` 那行；問 `login` 打的路徑、為什麼不用寫 `localhost:8000` | `/auth/login`；六個函式各對一個後端端點，裡面沒有任何 token 的事 | 他會說「本機才用 localhost:8000」，修正：**本機也不打**。`baseURL` 是 `/api` 接在前面，相對路徑打「自己現在的網域」，本機 Vite `proxy` 轉給 8000、正式 Vercel rewrites 轉給 Render；前端從頭到尾不知道後端在哪，這就是同站 |

**收尾（不出題）**：`api/` + `auth/` 是登入功能的全部，搬新專案複製這兩個資料夾（`CHAIN.md` 搬家清單）；前端只打相對路徑 `/api`，誰轉發是各環境的事。等他說下一關。

### 關卡 7：多頁面與守門員（React Router）— 快速走

**搭配看的程式**：`frontend/src/auth/RequireAuth.tsx`（三個 `if`）、`app/router.tsx:29～45`（樹狀結構，守門員在外層）、`auth/GuestOnly.tsx`

**前置**：前後端開著，瀏覽器 `localhost:5173`。全部在網址列做，預期值是「網址變成什麼」。讀 `PLAIN.md` 關卡 7。

| 步 | 操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 登出，網址列輸入 `localhost:5173/settings`；然後在這個登入頁登入 | 變成 `/login`；登入後變回 `/settings` 不是首頁 | `RequireAuth` 三個 `if`：`loading` 顯示載入中 / `unauthenticated` → `<Navigate to="/login" replace state={{from}} />` / 否則 `<Outlet />`。`state.from` 記住本來要去哪，`replace` 讓上一頁不會回到進不去的頁。`router.tsx` 把 `/` 和 `/settings` 放在 `RequireAuth` 的 `children`，新頁面放進去自動被守；`GuestOnly` 反過來包 `/login`、`/register` |
| 2 | 登入狀態，DevTools Network 開著點「設定」「首頁」切換幾次；然後問「把 `RequireAuth` 三個 `if` 刪掉直接開 `/settings`，看得到別人的資料嗎」 | Network **什麼都沒有**（連 `/api/me` 都沒有，關卡 12 的快取 30 秒內不重抓）；看得到畫面殼、看不到資料 | 單頁應用換頁不重載；資料靠 `/api/me`，後端要 Bearer token，沒登入就 401。**前端的守門員、CORS、表單驗證都是體驗，安全永遠在後端做一次** |

**收尾（不出題）**：守門員包在 `router.tsx` 外層，新頁面放進 `children` 自動被守；`Navigate` 帶 `state.from`；前端擋的都繞得過，後端才是真的。等他說下一關。

### 關卡 8：Zustand + axios

**搭配看的程式**：`frontend/src/auth/authStore.ts:24～49`（盒子：三個資料、四個方法）、`auth/authService.ts:29～65`（登入登出動作，每個都是「打 API、改盒子」兩行；`initializeAuth` 啟動時拿 cookie 換票）、`auth/useAuth.ts:15～25`（元件怎麼看盒子）、`api/client.ts:60～97`（兩個攔截器）

**前置**：前後端開著、登入狀態、Console 已 `allow pasting`。

**先講名詞**：store = 全站共用狀態的**盒子**（登入了沒、token 是什麼，整個前端一份），Zustand 做盒子的套件，特點是 React 外面也能讀寫，所以攔截器拿得到 token；攔截器 = axios 在每個請求送出前、回應回來後插的一段程式。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | Console：`const { useAuthStore } = await import("/src/auth/authStore.ts"); useAuthStore.getState();` | 七樣：`accessToken`、`initialized: true`、`notice`、四個 `ƒ` | 他會問 `create<AuthState>()((set) => ({...}))` 的 `set` 是什麼、為什麼能塞這麼多層。講法：三層看（`create<AuthState>()` 回傳工廠 → 工廠收你的「說明書」函式並把 `set` 塞給它 → 說明書回傳盒子的初始內容和方法）；`set` 是**唯一合法的改盒子工具**，做兩件事：蓋欄位（沒給的不動）、通知看盒子的元件重畫；`set({ accessToken })` 是同名縮寫；`()()` 是 Zustand 給 TS 的固定寫法照抄；Java 對照是 class 三欄位四方法、改欄位要經過 `set` |
| 2 | Console：`useAuthStore.getState().setNotice("我從 Console 改的");` | 頁面上方提示立刻變 | 問「為什麼畫面會變」→ `set` 的第二件事。誰在看盒子：`useAuth.ts:18` 的 `useAuthStore(...)`；誰在改：`authService.ts` 每個動作「先打 API 再改盒子」。資料流一條線：畫面 → `authService` → API → 改盒子 → 元件重畫。`initializeAuth` 是「重新整理還在登入」的來源，`finally` 裡 `setInitialized()` 讓守門員離開載入中 |
| 3 | Console：`const m = await import("/src/api/auth.ts"); useAuthStore.getState().setAccessToken("bad"); await m.getMe();` | Network `me 401 → refresh 200 → me 200`，Console **沒紅字**，印出使用者物件 | 他會問「為什麼 refresh 後重打 me，是登入本來就會打嗎」→ 不是，第二個 `me` 是攔截器 `return api(original)` 重送的（`client.ts:96`），呼叫端只拿到最後的 200，`client.test.ts:40` 的測試名就是「呼叫端完全沒感覺」。登入本身不打 `/me`，那是關卡 12 的 `useMe` |

**收尾一句話**：登入狀態放在一個全站共用的盒子，只能用 `set` 改、改了畫面自動重畫；兩個攔截器讓貼 token 和 401 換票重送對呼叫端透明。
**收尾要講到**：資料流那條線（畫面 → authService → API → 改盒子 → 重畫；每個請求攔截器貼 token；401 換票重送；重新整理 `initializeAuth` 換票回盒子）/ 盒子裡有沒有 token 是前端認定登入的唯一依據。
**題目**（三題，都是「刪一行會怎樣」）：(1) `authService.login` 刪掉 `setAccessToken` → 畫面仍未登入，`/api/me` **不會被打**（`useMe` 看盒子沒 token 不抓，守門員留在登入頁）；延伸：手動 `getMe()` 會 401 → refresh 200 → me 200 而且人就登入了，因為 cookie 已有 refresh token、攔截器會寫回盒子；(2) `initializeAuth` 拿什麼換票、刪掉 `setInitialized()` 卡哪 → cookie 的 refresh token；卡「載入中」，`selectStatus` 看 `initialized` false 就回 `loading`，`RequireAuth` 走不到後面；寫在 `finally` 是失敗也要標；(3) 為什麼換底層畫面不用改 → 畫面只碰 `useAuth()` 和 `authService.*` 兩個介面，關卡 6 定的，關卡 8 換的是介面底下。
**動手玩**：`LEARNING.md` 關卡 16 的 1、2 用測試看同一件事。

### 關卡 9：Docker 與 CI — 快速走

**搭配看的程式**：`backend/Dockerfile`（17～67：兩個階段，套件清單先、程式碼後、非 root、CMD 先遷移再起 uvicorn）、`.github/workflows/ci.yml`（`name:` 就是 Actions 頁的步驟名）

**前置**：本機沒 Docker，全部看 GitHub Actions 的 log。讀 `PLAIN.md` 關卡 9。**先講名詞**：image（整台機器的快照：OS、Python、套件、程式）、容器（image 跑起來的一個實例，Render 上就是一個）、CI（每次推程式自動跑一串檢查，就是 PR 上那兩個綠勾）。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 在 `backend`：`uv run ruff check .`、`uv run ruff format --check .` | `All checks passed!`、`28 files already formatted` | CI 的 Lint、Format check 兩步，推之前本機跑就不會紅 |
| 2 | Actions → 最新一列 → `backend` job → 展開 **Docker build** 和 **Smoke test** | Docker build：`[builder 1/5] FROM python:3.13-slim` … `[builder 4/5] COPY pyproject.toml uv.lock` → `[builder 5/5] RUN uv sync` → `[stage-1 ...]`；**不會有 `CACHED`**（Actions 每次是全新機器，沒有上次的層；`CACHED` 只在同一台機器第二次 build 或特別設了快取才出現，曾經寫「找 CACHED」是錯的）。Smoke test：前幾行 `curl: (7) Failed to connect` 不是錯（容器先跑 `alembic upgrade head` 再起 uvicorn，迴圈每秒試一次最多 30 次），然後 `{"message":"pong"}`、`✅`、`/api/health` 的 `db: ok`、`migration: 0006`、`version: null`（CI 沒有 Render 的 `RENDER_GIT_COMMIT`） | 一層一個指令；套件清單先 COPY、`uv sync` 完才 `COPY . .`，有快取的機器（Render、本機 Docker）改程式碼不用重裝套件。兩個階段：builder 裝套件，stage-1 只複製 `.venv`、用 `app` 使用者跑，image 裡沒有 uv 和編譯工具。CI 從空機器跑一遍，本機綠不代表 CI 綠 |

**收尾（不出題）**：Dockerfile 套件清單先、程式碼後是為了快取；CI 從空機器 build → 跑起來 → 打 `/api/ping`、`/api/health`，Render 部署做同一套；smoke test 是「跑起來打一下」。等他說下一關。
**動手玩**：`LEARNING.md` 關卡 9 的 1、4（要 push，開練習分支）。

### 關卡 10：部署（Render + Vercel + Neon，同站）— 快速走

**搭配看的程式**：`frontend/vercel.json`（兩條 rewrite：`/api/*` 轉 Render、其他回 `index.html`）、`render.yaml`、`backend/config.py` 的 `cookie_secure`、`cors_origins`

**前置**：線上網址：後端 `https://jwt-auth-demo-backend.onrender.com`，前端 `https://jwt-auth-demo-zeta.vercel.app`（學習者的）。**不改任何平台設定，只看**。讀 `PLAIN.md` 關卡 10。**先講名詞**：Render（跑後端容器）、Vercel（放前端靜態檔）、rewrite = 轉發（Vercel 自己去打 Render 再把回應給瀏覽器，瀏覽器只看到 Vercel；**不是轉址**，轉址是叫瀏覽器換網址就跨站了）。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | `curl.exe -s -i https://<前端網址>/api/health` | `200`；`Server: Vercel`、`X-Render-Origin-Server: uvicorn`、`Rndr-Id`、`Cf-Ray: ...-HKG`、`X-Vercel-Id: hkg1::...`、`X-Request-Id`、`Cache-Control: no-store`、`X-Vercel-Cache: MISS`、`Strict-Transport-Security`；JSON `db: ok`、`migration: 0006`、`version` = main 最新 commit | 用標頭表講整條鏈：瀏覽器看到的是 Vercel；Vercel 背後真的打了 Render（uvicorn）；Render 前面還有 Cloudflare（`Cf-Ray`，關卡 17 的 `TRUSTED_PROXY_HOPS=2` 數的就是這些層）；`X-Request-Id` 與 `no-store` 是自己的 `main.py` 加的，真的到了線上；`X-Vercel-Cache: MISS` 是 `no-store` 的效果；HSTS 是 Vercel 加的。`version` 對上 `git log` 的 commit = 合併後 Render 自動部署成功；`migration: 0006` = 正式庫（`jwt-auth-demo-prod`）也升到最新 |
| 2 | 瀏覽器開前端網址，F12 Network，用線上帳號登入，點 `login` → Response Headers 的 `set-cookie`；看 Network 裡 `/api/` 請求的網址 | `...; Path=/api/auth; SameSite=lax; Secure`（本機沒有 `Secure`）；全部 `vercel.app`，沒有 `onrender.com` | `COOKIE_SECURE` 在 Render 設 true、本機預設 false。瀏覽器從頭到尾不知道 Render 存在，cookie 的同站條件成立；前端直接打 `onrender.com` 的話 cookie 屬於另一個網域、refresh 不帶、重新整理就掉（`DEBUGGING.md` 第一批坑）。順便：`retry-after`、`x-ratelimit-*` 線上也在；`content-encoding: br` 是 Vercel 壓縮的 |

**收尾（不出題）**：瀏覽器只看到一個網域，Vercel 轉給 Render，Render 前面還有 Cloudflare；`version` 對上 commit 就是部署成功的證明；線上 cookie 多 `Secure`。等他說下一關。
**動手玩**：`LEARNING.md` 關卡 10 的 2（故意跨站，要改 Vercel 設定，先說）。

### 關卡 11：維護 — 快速走 + 備份還原演練

**搭配看的程式**：`backend/main.py` 的 request log middleware（`request_id`、`duration_ms`）、`/api/health`；`docs/RUNBOOK.md` 第 0 節（上線後檢查清單）、第 6 節（備份還原演練）

**前置**：Render 後台、Neon 後台能開。演練在**正式**的 Neon 專案 `jwt-auth-demo-prod` 做，只動一個演練帳號；用的是免費方案內的功能（6 小時還原窗、開分支），**不會跳付費頁**，先講。讀 `PLAIN.md` 關卡 11。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 拿關卡 10 用 curl 打線上 `/api/health` 時回應的 `X-Request-Id`，Render → 服務 → Logs → 搜那串 | 一行 JSON：`"request_id"` 同一個、`"time"` 和回應的 `Date` 一樣、`"path": "/api/health"`、`"status": 200`、`"duration_ms": 16.1` | 使用者回報問題時請他給 `X-Request-Id`，直接搜。欄位表：`status`（搜 500、一堆 401）、`duration_ms`（登入 100 上下正常、1 是沒比對、幾千是冷啟動）、`path`（同 IP 連打 login）、`level: ERROR`（沒接住的例外附 traceback）。本機文字、線上 JSON（`render.yaml` 的 `LOG_JSON=true`），欄位一樣 |
| 2 | 備份還原演練，照 `RUNBOOK.md` 6.1 的 9 步一步一步給：註冊 `drill@example.com` 登出 → `jwt-auth-demo-prod` 的 SQL Editor 查到它、記時間 → `SELECT now();` 再 `DELETE` → 線上登入失敗 → Branches → main → Restore from history，時間選「建立之後、刪除之前」留一分鐘緩衝（Neon 選單是台灣時間就 +8）→ 線上登入成功 → `/api/health` 一樣 → 刪 `production_old_<時間>` 分支 → 清演練帳號 | 還原幾秒完成；多一個 `production_old_2026-...Z` 分支；登入回來；`db: ok`、`migration` 不變；Render 什麼都沒動 | **清演練帳號會撞外鍵**（`refreshtoken_user_id_fkey`，`models.py:23`）：登入後表裡有 refresh token 指著他，而且只要換過一次票就有蓋章的舊列留著，網站的「登出」只刪 cookie 那一列不夠。**先按「登出所有裝置」**（`revoke_all_refresh_tokens` 整排刪），再 `DELETE FROM "user"`。曾經叫他「登出再刪」是錯的，學習者自己試出「登出所有裝置」才對。正式專案有刪帳號功能時用 `ON DELETE CASCADE` 或先呼叫 `revoke_all`；這裡沒有，保留預設的「擋」是保護 |

| 3 | **Render 退版**（`RUNBOOK.md` 第 2 節；5 分鐘，按按鈕不改設定）：先 `curl.exe -s https://<前端網址>/api/health` 記下 `version` → Render → 服務 → Events → 上一個 **Deploy live** → 「…」→ **Rollback to this deploy** → 等 Live → 再打 `/api/health` → 然後 **Manual Deploy → Deploy latest commit** 回最新 → 再打一次 | 退版後 `version` 變成上一個 commit、`db: ok`、`migration` 不變；回最新後 `version` 回到 main 的 commit | 退版只換線上的 image，main 上壞的程式還在，下次 push 又會部署壞的，所以退完要修 main。退版**不退資料庫**：壞的那版若跑了「刪欄位、改型別」的遷移，舊版程式可能壞，這就是關卡 5 的 expand / contract。Render 免費方案保留舊 image 可以退，k8s 版是 `rollout undo`（關卡 23） |
| 4 | **本機 alembic 退版**（`RUNBOOK.md` 第 3 節情境 C；只在本機 `neondb`，**不碰正式**）：在 `backend`：`uv run alembic current` → `uv run alembic downgrade -1` → `uv run alembic current` → Neon（`jwt-auth-demo` 的 `neondb`）Tables 看表 → `uv run alembic upgrade head` → `current` | `0006 (head)` → `Running downgrade 0006 -> 0005` → `0005` → `processedevent` 表不見了（0006 的 `downgrade()` 是 `drop_table`） → `Running upgrade 0005 -> 0006` → `0006 (head)` | 這是關卡 5 看過的 `downgrade()` 真的跑一次：退一階跑那張單的 downgrade、升回去跑 upgrade，`alembic_version` 跟著變。**正式環境不手動 downgrade**，原則是 roll forward：再開一張單修正（RUNBOOK 第 3 節情境 B）；因為 downgrade 會刪資料（這裡 `processedevent` 整張表沒了），而且 Render 上跑的程式還是新版，會找不到表。本機練是為了知道那張單的兩個方向都對 |

**跳過的兩樣，要明講**：Sentry（`/api/_boom` 要改 Render 的 `ENABLE_DEBUG_ENDPOINTS`，看一封 email 學習量少；關卡 20 動手玩 5 用本機 `/api/_boom` 看 ERROR log 就夠）；換 `JWT_SECRET`（`RUNBOOK.md` 第 4 節讀過知道結論就好：換了不會把大家登出，因為 refresh token 跟密鑰無關，只有手上的 access token 失效、下次換票自動拿新的）。

**收尾用這張表**（三種「退」各退不同的東西、彼此獨立，壞掉先判斷壞的是哪一層）：Render Rollback 退線上程式（驗 `version`；不退資料庫；退完修 main）/ `alembic downgrade -1` 退資料庫結構（只在本機；正式 roll forward）/ Neon Restore 還原資料（整庫回到那一刻；6 小時窗）/ `request_id` 不是退是找。2026-10-28 學習者四個演練都親手做過。
**收尾（不出題）**：`request_id` 串前後端；`/api/health` 一個網址答三件事（活著、資料庫通、哪一版，`version` 對 main 的 commit）；還原是整個資料庫回到那一刻不是只有一筆，先用 Time Travel 看回到哪一刻損失最小，還原窗 6 小時所以發現得早最重要；沒有還原過的備份不算備份（6.2 的 `pg_dump` 週末 Mac 做）；程式退版按一下但不退資料庫、退完修 main；資料庫正式不退、roll forward。等他說下一關。
**動手玩**：`LEARNING.md` 關卡 11 的 1（`/api/_boom` 看 Sentry，要改 Render 環境變數，先說）。

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
| 4 | 關卡 1 的步驟 1～4（cookie 存放處、換票、舊票重用、新票也失效） | 同關卡 1 | 用 curl 看最清楚 |
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

### 關卡 25：地圖與交接（ARCHITECTURE、CHAIN v2、部署追蹤）

**搭配看的程式**：`docs/ARCHITECTURE.md`（整份）；`docs/CHAIN.md` 環 8～11；`README.md` 開頭；`.github/workflows/deploy.yml`（只在做選配的 25-D 時）

**前置**：關卡 21～24 都帶過。這關不用 Docker，瀏覽器和一個全新的 AI 對話就夠。

| 步 | 指令或操作 | 預期 | 看到之後講什麼 |
| --- | --- | --- | --- |
| 1 | 開 `docs/ARCHITECTURE.md` 第 1 節，四張圖各看兩分鐘，合上檔案 | 能用自己的話說四條路徑各經過哪些東西 | 請求：瀏覽器 → Vercel → Render → Neon；部署：push → CI → main → Render/Vercel；事件：register → outbox → worker → Kafka/log → consumer；觀測：log、指標、追蹤互相找。說不出哪條就回去看那張圖 |
| 2 | 第 2 節的表，挑三塊問「怎麼證明它會動」 | 每塊都答得出「哪個 CI job 的哪一行」或「線上哪個網址」 | 這張表的用途：面試官問「你怎麼知道它真的能跑」，答案永遠是一個 job 或一個網址，不是「我測過」 |
| 3 | 第 6 節的表，先填「outbox 與 Kafka（24）」那格，三句：解決什麼、怎麼證明、下一步 | 三句話，不看筆記講得順 | 範例在表下面，不要照抄。講完請他隔天再講一次 |
| 4 | 填完其餘七格（可以分幾天） | 每格三句 | 這就是面試的腳本。commit 進 repo（`docs：ARCHITECTURE 第 6 節 60 秒說法`） |
| 5 | **交接演練**：開一個全新的 AI 對話，只貼 `ARCHITECTURE.md` 全文，問它「這個專案的四條路徑各經過哪些東西？每一塊怎麼證明會動？」 | 它答得出來，而且和你第 1 步說的一樣 | 答不出來的那塊，就是地圖寫得不夠清楚的地方，改地圖不是改記憶 |
| 6 | 開 `docs/CHAIN.md` 環 8，把「給 AI 的任務」整段讀一遍 | 能指出這一段對應範例專案的哪些檔案 | 練習專案做到環 8 時就是把這段貼給 AI；跟技術棧無關，所以換語言也能用 |
| 7 | （選配，25-D）照 `LEARNING.md` 關卡 25「⚠️ 開始前」做：Render 關 Auto-Deploy、複製 Deploy Hook、GitHub 加 secret `RENDER_DEPLOY_HOOK` | 下一次合併到 main 後，Actions 多一個 **Deploy** workflow 綠的；repo 的 **Environments** 分頁出現 `production`，列出這次部署和 commit | 部署從「Render 自己做」變成「GitHub 上看得到的一步」：CI 綠 → 叫 Render → 等 `/api/health` 的 `version` 對上。沒做這步也完全不影響 |
| 8 | （選配）展開 Deploy 的「等線上 /api/health 的 version 變成這次的 commit」 | 幾行 `第 N 次：線上 version=舊的，等 <7 碼>…`，最後 `✅ 線上版本已經是 <7 碼>` | RUNBOOK 第 0 節的三件事（db、migration、version）這裡自動檢查了 |

**收尾**（你看到的 → 對應的觀念）：四張圖 → 整條鏈用「路徑」不用「關卡」講 / 每塊一個 job 或網址 → 證明不是形容詞 / 60 秒說法 → 面試就是交接 / 新 AI 只讀地圖就能說 → 文件寫給沒有記憶的人 / Deploy workflow 綠 → 部署也是可以驗證的一步。收尾後問「哪一步要再講一次」。
**動手玩**：`LEARNING.md` 關卡 25 的 1（60 秒說法）、2（交接演練）。
