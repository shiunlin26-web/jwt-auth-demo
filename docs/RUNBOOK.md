# 維運手冊（Runbook）：上線之後會遇到的事，照著做

`DEBUGGING.md` 是「症狀 → 原因」，這份是「**情境 → 步驟**」。半夜壞掉、要換密鑰、要退版，照這裡做。

## 0. 每次部署後的檢查（30 秒）

1. 開 `https://jwt-auth-demo-backend.onrender.com/api/health`，看：
   - `db` 是 `ok`
   - `migration` 是最新的遷移編號（和 `backend/migrations/versions/` 最大的那個一樣）
   - `version` 是你剛推的 commit（GitHub 上 main 最新 commit 的前 7 碼對得上）
2. 開前端網址，登入、重新整理還在。

`version` 對不上 = Render 還沒部署完，或 Auto-Deploy 沒觸發（見 DEBUGGING.md）。

有啟用關卡 25-D 的部署追蹤時（`.github/workflows/deploy.yml`），Actions 的 **Deploy** workflow 綠 = 這三件事已經自動檢查過（它等到 `version` 對上、`db` 是 ok 才綠）；紅就看它最後幾行和 Render 的 Events。

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

### Kubernetes 的退版（關卡 23，只有本機 kind 或自己的叢集才用得到）

叢集版沒有按鈕，是指令：

```bash
kubectl -n jwt-auth-demo rollout history deployment/backend   # 現在在哪一版（每次換版一個 REVISION）
kubectl -n jwt-auth-demo rollout undo deployment/backend      # 退回上一個 REVISION
kubectl -n jwt-auth-demo rollout status deployment/backend    # 等它完成
```

undo 本身也是一次滾動更新（`maxUnavailable: 0`，零停機）。壞版本起不來（`ImagePullBackOff`、readiness 一直不過）時流量根本不會切過去、`rollout status` 會逾時，這時一樣 undo。退版不退資料庫、退完記得修 main，和上面 Render 的注意事項相同。

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

原則只有一條：**刪資料前先備份**。這個專案的 `user` 表就是全部的資產。下面是一次半小時的演練（第一次重帶到關卡 11 時做；之後每次要做危險操作前，把第 1～2 步當備份用）。

**名詞先講**

- **還原窗（restore window）**：Neon 把每一筆改動的歷史留著，這段時間內的任何一刻都能回去。免費方案是 **6 小時**（2026-10 的額度，變動以 <https://neon.com/docs/introduction/plans> 為準）。超過 6 小時的錯誤，免費方案救不回來，所以「發現得早」比什麼都重要。
- **分支（branch）**：Neon 的資料庫可以像 git 一樣開分支，是整個資料庫的複本，開了不用錢（免費方案最多 10 個）。「從歷史還原」做的事就是：在你指定的那一刻開一個新分支、把連線切到它、名字換回 `main`，舊的那份改名留著。**連線字串不變，Render 不用重設**，過程中斷線幾秒。
- **快照（snapshot）**：手動拍一張的備份，免費方案 1 張。要做危險操作前先拍。
- **`pg_dump`**：把整個資料庫倒成一個 `.sql` 檔的工具，和平台無關，是「我自己手上有一份」的備份。

### 6.1 演練（任何電腦，只要能開瀏覽器，不用裝東西）

| # | 做什麼 | 預期 | 講什麼 |
| --- | --- | --- | --- |
| 1 | 線上網站註冊一個演練帳號 `drill@example.com`，登入成功後登出 | 看得到「登入成功」 | 這就是等一下要「不小心刪掉」的資料 |
| 2 | Neon 後台 → 你的專案 → **SQL Editor**（左邊選單）→ 確認上面選的分支是 `main`，跑 `SELECT id, email, created_at FROM "user" ORDER BY id DESC LIMIT 5;` | 第一列是 `drill@example.com`；**記下現在的時間（UTC）** | 這是免費的 psql，不用裝；`"user"` 要加雙引號，因為 user 在 Postgres 是保留字，不加會查到別的東西 |
| 3 | 同一個 SQL Editor 跑 `DELETE FROM "user" WHERE email = 'drill@example.com';` | `DELETE 1` | 模擬手滑。真實情況常是「遷移寫錯」或「WHERE 漏了」 |
| 4 | 線上網站用 `drill@example.com` 登入 | 登入失敗（帳號不存在） | 資料真的沒了；這就是「要還原」的那一刻 |
| 5 | Neon 後台 → **Branches** → 點 `main` → **Backup & Restore**（有的版本叫 Restore）→ **Restore from history** → 時間選第 2 步記下的那一刻（刪除之前）→ 確認 | 幾秒後完成；Branches 頁多了一個名字帶 old 和時間戳的分支 | 那個多出來的分支就是「刪掉之後」的狀態，留著是為了「還原錯了可以再回去」 |
| 6 | 線上網站再登入一次 `drill@example.com` | 登入成功 | 資料回來了，而且 Render 什麼都沒動 |
| 7 | 開 `/api/health` | `"db":"ok"`、`"migration"` 和還原前一樣 | 連線字串沒變；遷移版本也在資料庫裡，所以跟著一起回到那一刻 |
| 8 | Branches → 刪掉第 5 步多出來的舊分支 | 分支數回到 1 | 免費方案 10 個分支，演練完要收；正式情況確認沒問題再刪 |
| 9 | SQL Editor 再跑一次第 3 步的 `DELETE`，把演練帳號清掉 | `DELETE 1` | 收尾；這次是故意的，不用還原 |

**要講清楚的兩件事**：
- 還原是**整個資料庫**回到那一刻，不是只有那一筆。中間別人的註冊、登入紀錄也會一起消失，所以真實情況要先用 Neon 的 **Time Travel**（同一頁，可以在還原窗內的任一刻跑唯讀查詢）確認「回到哪一刻損失最小」，不要急著按。
- 6 小時過了就沒了。所以第 6.2 節的手動備份不是多餘的。

### 6.2 手動備份（Mac，選配；平日的 VM 沒有 psql 就跳過）

```bash
brew install libpq && brew link --force libpq          # 只裝 psql、pg_dump，不裝整個 Postgres
pg_dump "postgresql://<user>:<pass>@<host>/<db>?sslmode=require" > backup-$(date +%F).sql
ls -la backup-*.sql                                      # 幾十 KB 起跳，0 就是失敗
head -30 backup-$(date +%F).sql                           # 看得到 CREATE TABLE "user"
```

連線字串用 Neon 原本的格式（`postgresql://`、`sslmode=require`，Neon 後台 Connect 按鈕那串），**不是** `.env` 裡的 asyncpg 格式。檔案含密碼雜湊，**不要進 git**（`.gitignore` 擋了 `backup-*.sql`，檔名照上面的格式就不會被加進去）。

還原這個檔案到本機試一次（Mac，有 Docker）：

```bash
docker compose -f infra/compose.yaml up -d --wait postgres
docker compose -f infra/compose.yaml exec -T postgres psql -U postgres -d jwtdemo < backup-$(date +%F).sql
docker compose -f infra/compose.yaml exec -T postgres psql -U postgres -d jwtdemo -c 'SELECT count(*) FROM "user";'
docker compose -f infra/compose.yaml down -v
```

`count` 和線上一樣就代表這份備份是能用的。**沒有還原過的備份不算備份。**

## 7. 清理

- 過期的 refresh token：登入時會順便清（關卡 3）。流量大了再改成排程。
- Render 免費方案每月 750 小時共用；Sentry 免費每月 5000 個錯誤。`/api/_boom` 演練完記得把 `ENABLE_DEBUG_ENDPOINTS` 關回 `false`。

## 8. 新人（或未來的你）接手

1. 跑起來：Windows 用 `scripts\setup.ps1 -SkipTests`（`README.md`「每次開機怎麼把專案跑起來」），其他系統照 `README.md` 手動版
2. 讀 `docs/TOUR.md` 照請求流程讀一遍程式
3. 拿到 Render、Vercel、Neon、Sentry 四個平台的存取權（用 GitHub 帳號登入即可）
4. 做一次第 0 節，確認自己看得懂 `/api/health` 和 Render Logs
