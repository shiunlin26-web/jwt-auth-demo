# 故障演練（關卡 20）

每個 `.patch` 是一個刻意埋進去的 bug。**不要先看 patch 的內容**，照 `LEARNING.md` 關卡 20 的流程：套上去 → 用症狀、log、測試找出原因 → 修好或還原 → 再對答案。

```bash
git apply docs/drills/01.patch   # 套上去（在 repo 根目錄）
git status                       # 看它改了哪個檔案（這是允許的提示）
# ……找出問題……
git checkout -- backend frontend # 還原
```

答案在 `LEARNING.md` 關卡 20 的折疊區。

## 題庫（2026-10-12 列的 14 種，原在 `PLAN.md`）

每一條只寫「症狀會長怎樣」，不寫原因，原因是演練時要自己找的。做成 patch 的標在最右欄；想再出題，挑沒做的，照上面的格式：改壞、`git diff > docs/drills/06.patch`、還原，隔一天再套上來找（`LEARNING.md` 關卡 20 動手玩 1）。

| 編號 | 故障 | 典型症狀 | patch |
| --- | --- | --- | --- |
| 1 | 正式環境少了一個環境變數 | 後端啟動失敗，Render log 出現 `ValidationError ... Field required` | |
| 2 | `JWT_SECRET` 被換掉 | access token 全部失效、`/me` 回 401，前端自動 refresh 後又正常（真的被登出要查別的） | 04（變形） |
| 3 | 遷移檔跑到一半失敗 | 部署卡住或啟動失敗，`alembic current` 對不上 | |
| 4 | 新增欄位沒寫遷移，直接改 `models.py` | 本機測試全過，正式環境 500：`column ... does not exist` | 03 |
| 5 | 前端打錯 API 路徑或 rewrites 設錯 | 瀏覽器 404 或拿到 HTML 而不是 JSON，`SyntaxError: Unexpected token <` | |
| 6 | cookie 的 `Secure` 或 `path` 設錯 | 登入成功，但重新整理後沒有保持登入；DevTools 看不到 cookie 或 cookie 沒被帶上 | 01 |
| 7 | 免費方案冷啟動 | 第一個請求等 30～60 秒或逾時，第二次就正常；被誤判成部署壞了 | |
| 8 | DB 連線在休眠後失效 | 閒置一段時間後第一個請求 500：`connection is closed`，再試又好 | |
| 9 | 套件升級後行為改變 | CI 突然紅，本機沒動過程式；lock 檔與 CI 安裝版本不一致 | |
| 10 | CI 綠、正式環境紅 | 測試環境與正式環境的設定不同（Python 版本、環境變數、DB 版本） | |
| 11 | 後端綁錯 port 或 host | Render 顯示部署成功但一直 `502`，log 顯示 `Uvicorn running on 127.0.0.1` | |
| 12 | 500 但沒有任何 log | 錯誤被吞掉，沒有結構化 log 和 Sentry 就查不到 | |
| 13 | 授權漏洞 | A 使用者改網址的 id 就能看到 B 的資料；測試沒覆蓋到（練習專案才有第二張表） | |
| 14 | 時鐘不同步或 token 過期時間算錯 | 剛登入就 401，或 token 永遠不過期 | 02 |
| （清單外） | 前端沒有 single-flight | access token 過期後按一下就被登出，後端 log `Refresh token reused` | 05 |
