# 維運手冊（Runbook）：上線之後會遇到的事，照著做

`DEBUGGING.md` 是「症狀 → 原因」，這份是「**情境 → 步驟**」。半夜壞掉、要換密鑰、要退版，照這裡做。

## 0. 每次部署後的檢查（30 秒）

1. 開 `https://jwt-auth-demo-backend.onrender.com/api/health`，看：
   - `db` 是 `ok`
   - `migration` 是最新的遷移編號（和 `backend/migrations/versions/` 最大的那個一樣）
   - `version` 是你剛推的 commit（GitHub 上 main 最新 commit 的前 7 碼對得上）
2. 開前端網址，登入、重新整理還在。

`version` 對不上 = Render 還沒部署完，或 Auto-Deploy 沒觸發（見 DEBUGGING.md）。

## 1. 網站掛了，先做什麼

1. **分段確認**：後端直接打 `/api/ping` → 後端 `/api/health` → 前端網址的 `/api/ping` → 登入。哪一段先壞就查哪一段。
2. **看 Render Events**：最近有沒有部署？部署失敗還是成功？如果是剛部署完就壞，直接做第 2 節退版。
3. **看 Render Logs**：log 是 JSON，一行一筆。找 `"level": "ERROR"`，或用使用者回報的 `request_id` 搜（回應的 `X-Request-ID` header）。
4. **看 Sentry**：有沒有新的 issue、發生幾次、哪個路徑。
5. 都正常但很慢或第一次逾時：免費方案冷啟動，等一分鐘再試。

## 2. 退版（上一版是好的，剛推的壞了）

Render 有一鍵退版，不用改程式碼：

1. Render → 服務 → 左邊 **Events**（或 Deploys）
2. 找到上一個 **Deploy live** 的紀錄 → 右邊「…」→ **Rollback to this deploy**
3. 等它變 Live，做第 0 節的檢查

退版之後**記得修 main**：退版只是把線上換回舊 image，main 上壞的程式碼還在，下一次 push 又會部署壞的版本。

> ⚠️ 退版不會退資料庫。如果壞的那版跑了遷移（例如加了欄位），舊版程式通常還是能跑（多一個欄位不影響）；
> 但如果遷移是「刪欄位、改型別」，舊版可能會壞。這就是為什麼遷移要寫成「先加、後刪」兩步，見第 3 節。

## 3. 遷移壞了

**正式環境不要手動 `alembic downgrade`。** 原則是 **roll forward**：推一個新的遷移把它改回去。

情境 A：**遷移在啟動時失敗**（Render log 的 alembic 段報錯，部署失敗）
- 舊版還在跑，線上沒壞，不用急
- 本機重現：把正式的錯誤訊息看懂，修遷移檔（這個遷移還沒成功跑過，可以改）
- 推新 commit → 重新部署

情境 B：**遷移成功了，但內容是錯的**（例如欄位名打錯）
- 不要改那個遷移檔，它已經跑過了，`alembic_version` 記得它
- 產生**新的**遷移去修正：改 `models.py` → `uv run alembic revision --autogenerate --rev-id 000X -m "修正 ..."` → 檢查產生的檔案 → 推
- 這就是 roll forward

情境 C：**本機練習 downgrade**（只在本機或測試 DB 做）
```bash
uv run alembic current        # 現在在哪一版
uv run alembic history        # 所有版本
uv run alembic downgrade -1   # 退一版
uv run alembic upgrade head   # 再升回去
```

**安全的改表習慣**：刪欄位、改型別分兩次部署。第一次先讓程式不再用它（並加新欄位），第二次才刪。這樣退版永遠安全。

## 4. 換 JWT_SECRET

什麼時候要換：懷疑外洩、離職交接、定期（例如一年一次）。

**這個專案換密鑰幾乎無感**，因為：
- access token 是 JWT，換了密鑰舊的全部失效，但它本來就只有 30 分鐘
- refresh token **不是** JWT，是隨機字串、DB 存雜湊，和密鑰無關，照常有效
- 所以使用者下次請求 401 → 前端自動 refresh → 拿到新密鑰簽的 access token。**不用重新登入**

步驟：
1. 本機產生：`uv run python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Render → Environment → 改 `JWT_SECRET` → Save（Render 會自動重新部署）
3. 第 0 節檢查；自己登入的那台重新整理，應該還在登入狀態

## 5. 換資料庫密碼或連線字串

1. Neon → 專案 → Roles → Reset password（或換成新的連線字串）
2. Render → Environment → 改 `DATABASE_URL`（記得 asyncpg 格式）→ Save → 自動重新部署
3. 中間會有幾十秒連不上，`/api/health` 的 `db` 會是 `error`，部署完就恢復

## 6. 備份與還原

- **Neon 有內建還原**：專案 → Restore（或 Branches → 從某個時間點建分支）。免費方案可回溯的時間有限，請在 Neon 後台確認目前的額度。
- **手動備份**（有裝 psql 的電腦）：
  ```bash
  pg_dump "postgresql://user:pass@host/db?sslmode=require" > backup-$(date +%F).sql
  ```
  連線字串用 Neon 原本的格式（`postgresql://`、`sslmode=require`），不是 asyncpg 格式。
- **刪資料前先備份**。這個專案的 `user` 表就是全部的資產。

## 7. 清理

- 過期的 refresh token：登入時會順便清（關卡 3）。流量大了再改成排程。
- Render 免費方案每月 750 小時共用；Sentry 免費每月 5000 個錯誤。`/api/_boom` 演練完記得把 `ENABLE_DEBUG_ENDPOINTS` 關回 `false`。

## 8. 新人（或未來的你）接手

1. 跑起來：Windows 用 `scripts\setup.ps1`（`README.md` 第一節），其他系統照 `README.md` 手動版
2. 讀 `docs/TOUR.md` 照請求流程讀一遍程式
3. 拿到 Render、Vercel、Neon、Sentry 四個平台的存取權（用 GitHub 帳號登入即可）
4. 做一次第 0 節，確認自己看得懂 `/api/health` 和 Render Logs
