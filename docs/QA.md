# QA.md：JWT 與部署的觀念問答（一句話版）

> 每題一句話答案，後面是「詳見」：理由、程式、更長的說明都在那裡，這裡不重複。
> 用途：複習、面試前、或「我知道怎麼做但說不出為什麼」的時候。每一關的「想一想」是那一關的細節；這裡是跨關卡、換技術棧也成立的通則。

## 認證基礎

- **Q1 為什麼要兩種 token？** 一種的話不是太短命（一直重登）就是太長命（被偷了能用很久）；access 短命、不查資料庫所以快，refresh 長命、查資料庫所以能撤銷。詳見 `TOUR.md` 第 0 站、`PLAIN.md` 比喻表。
- **Q2 access token 不查資料庫，登出所有裝置後它不是還能用 30 分鐘？** 對，刻意的取捨：每個請求都查就失去 JWT 的意義，空窗用縮短有效期控制。詳見 `LEARNING.md` 關卡 3 Q2。
- **Q3 JWT 裡的資料別人看得到嗎？** 看得到，只有簽章沒有加密，所以只放 `sub` 和過期時間。詳見 `LEARNING.md` 關卡 1 觀念。
- **Q4 認證和授權差在哪？** 認證是你是誰，授權是你能不能動這筆資料；本 repo 只有認證，練習專案一有第二張表每個端點都要查「屬於目前使用者嗎」並有測試。詳見 `API.md` 第 2 條、`CHAIN.md` 環 7。
- **Q5 密碼用 bcrypt，refresh token 為什麼只用 SHA-256？** 密碼熵低要用慢的雜湊；refresh token 是 32 bytes 隨機值猜不到，快的就夠。詳見 `LEARNING.md` 關卡 1 Q5。
- **Q6 密碼為什麼限制 72 bytes、只允許 ASCII？** bcrypt 只看前 72 bytes，超過的默默丟掉；在門口擋比默默截斷誠實。詳見 `LEARNING.md` 關卡 0。

## token 放哪

- **Q7 access token 為什麼放記憶體不放 localStorage？** localStorage 任何 JS 都讀得到，一個 XSS 就全拿走；放記憶體重新整理會消失，但 refresh 會換一張回來。詳見 `TOUR.md` 第 12 站。
- **Q8 refresh token 為什麼放 HttpOnly cookie？** JS 讀不到、瀏覽器自動帶；代價是要處理 SameSite 與同站（Q12～Q14）。詳見 `LEARNING.md` 關卡 19 觀念 3。
- **Q9 資料庫為什麼存 refresh token 的雜湊？** 外洩時拿到的雜湊不能當 token 用，跟密碼同理但不用慢雜湊。詳見 `LEARNING.md` 關卡 1 觀念。

## refresh 輪替

- **Q10 什麼是輪替、什麼是重複使用偵測？** 每次換證舊的作廢發新的；拿已作廢的來換代表被偷過，該使用者全部撤銷。詳見 `LEARNING.md` 關卡 1 觀念、`TOUR.md` 第 7 站。
- **Q11 前端為什麼一定要 single-flight？** 同時三個 401 各自 refresh，後兩個拿舊 token 會被當成重複使用而登出；同一時間只能有一個 refresh。詳見 `client.ts` 的 `refreshPromise`、`TOUR.md` 第 13 站。

## cookie 與同站

- **Q12 正式環境前後端為什麼要同站？** `SameSite=Lax` 的 cookie 在跨站的 `POST /refresh` 不會被帶上，重新整理就掉登入；讓前端只打自己網域的 `/api`、由 Vercel 轉發到 Render，就是反向代理。詳見 `LEARNING.md` 關卡 10。
- **Q13 為什麼不改 `SameSite=None; Secure` 硬撐？** iOS Safari 預設擋第三方 cookie，而且 `None` 等於放棄瀏覽器的 CSRF 保護；同站後連 CORS 都不用設。詳見 `LEARNING.md` 關卡 10 Q1。
- **Q14 cookie 的 `Path` 為什麼是 `/api/auth`？** 只有 `/api/auth/*` 的請求會帶它，refresh token 不會跟著每個請求滿天飛；也是前端 baseURL 一定要是 `/api` 的原因。詳見 `DEBUGGING.md`「部署：前端」。
- **Q15 同站之後還需要 CORS 嗎？** 不需要；程式裡留著是「除錯時直接打後端網址」的逃生口，而且 CORS 保護的是瀏覽器裡的使用者不是 API。詳見 `LEARNING.md` 關卡 19 觀念 4。

## 部署

- **Q16 遷移為什麼在容器啟動時跑，不在 build 時？** build 時不該連正式資料庫；啟動時跑，失敗容器就退出、平台標記部署失敗、舊版繼續跑。詳見 `LEARNING.md` 關卡 9 Q2。
- **Q17 遷移失敗為什麼不 `downgrade`，要 roll forward？** 手動退版後程式和資料庫的認知不一致；推一個新遷移往前修，歷史保持線性。詳見 `RUNBOOK.md` 第 3 節。
- **Q18 為什麼刪欄位要分兩次部署？** 退版時舊程式還會讀那個欄位；先讓程式不用它，第二次才刪。詳見 `LEARNING.md` 關卡 11 觀念 4。
- **Q19 後端為什麼要聽 `0.0.0.0`？** `127.0.0.1` 只聽容器自己，平台的負載平衡器連不進來，部署成功但一直 502。詳見 `Dockerfile` 的 CMD。
- **Q20 CI 綠了才部署，為什麼還要 branch protection？** 前者擋「推了壞程式還是部署」，後者擋「跳過 CI 直接推 main」。詳見 `LEARNING.md` 關卡 11 觀念 7。
- **Q21 第一個請求等了一分鐘，壞了嗎？** 免費方案冷啟動（Render 閒置 15 分鐘、Neon 5 分鐘休眠），第二個請求正常就不是 bug。詳見 `DEBUGGING.md`「部署：後端」。
- **Q22 `/api/ping` 和 `/api/health` 為什麼分開？** ping 是活著嗎（不碰資料庫，平台 health check 用），health 是能服務嗎（真的查資料庫）；用 readiness 當 liveness 會在資料庫短暫斷線時被平台不斷重啟。詳見 `LEARNING.md` 關卡 11 觀念 1。
- **Q23 密鑰放哪？`render.yaml` 進 git 了。** 密鑰欄位標 `sync: false`，值在 Render 後台；前端 `VITE_*` 會被打包進網頁，永遠不能放密鑰。詳見 `LEARNING.md` 關卡 10 Q3。
- **Q24 換 JWT 密鑰會把所有人登出嗎？** 幾乎無感：access token 失效但只剩幾分鐘，refresh token 是隨機字串跟密鑰無關，下一個 401 自動換票。詳見 `RUNBOOK.md` 第 4 節。

## 前端狀態

- **Q25 Zustand 和 TanStack Query 各管什麼？** Zustand 管前端自己的狀態（token、初始化了沒），TanStack Query 管後端資料的副本；有後端正本、想跟著正本走的就交給 TanStack Query。詳見 `LEARNING.md` 關卡 12。
- **Q26 登入狀態為什麼用算的，不存 `isLoggedIn`？** 有 token 就是已登入；分開存每個改 token 的地方都要記得同步，漏一個就對不上。詳見 `LEARNING.md` 關卡 6 Q3。
- **Q27 前端守門員擋住就安全了嗎？** 沒有，前端的檢查任何人都能繞過；真正的保護在後端的 `get_current_user`。詳見 `LEARNING.md` 關卡 7 Q2。

## 工程習慣

- **Q28 lock 檔為什麼要進 git？** 你的電腦、CI、Docker 三處裝出來的版本才會一樣；「我這邊好好的 CI 紅」多半是版本不同。詳見 `LEARNING.md` 關卡 9 Q1。
- **Q29 為什麼不能用 `create_all`？** 只建不存在的表、不改已存在的表、沒有紀錄；遷移檔是資料表結構的 git log。詳見 `LEARNING.md` 關卡 5。
- **Q30 測試全綠就沒 bug 嗎？** 只代表「測試有想到的」沒壞；環境差異和授權漏洞都抓不到。詳見 `LEARNING.md` 關卡 4 Q4、關卡 9 Q3。
- **Q31 有了 bcrypt 還要登入頻率限制？客戶端 IP 怎麼拿？** 攻擊者可以開很多連線同時猜，限流在 bcrypt 之前擋；IP 要從 `X-Forwarded-For` 右邊跳過已知的代理層數取，不能用最左邊。詳見 `LEARNING.md` 關卡 17 觀念 2。

## 基礎設施（關卡 21～25）

- **Q32 compose 和 Kubernetes 差在哪？** compose 管一台機器，k8s 管一群，描述的是同一件事、image 也同一個；k8s 多了副本、探針、滾動更新、資源上限。詳見 `TOUR.md` 第 18 站的對照表。
- **Q33 healthcheck 為什麼不能只看容器起來了？** 起來不代表能服務（還在跑遷移、還沒聽 port）；`depends_on: service_healthy`、`up --wait`、k8s readiness 都靠它定義「能服務」。詳見 `LEARNING.md` 關卡 21 觀念 2。
- **Q34 有了 E2E 為什麼還留 Vitest？** 元件測試快、多、驗畫面；E2E 慢、少、驗整條路走得通而且只有真瀏覽器能驗 cookie。詳見 `LEARNING.md` 關卡 21 觀念 3。
- **Q35 指標的 label 為什麼不能放 user id 或實際路徑？** 每組不同的 label 值就是一條時間序列，會把 Prometheus 撐爆；route 用路由樣板，亂打的一律 `unmatched`。詳見 `LEARNING.md` 關卡 22 觀念 2。
- **Q36 為什麼看 p95 不看平均？** 平均看不出「95% 很快、5% 很慢」；耗時用直方圖存、`histogram_quantile` 算。詳見 `LEARNING.md` 關卡 22 觀念 3。
- **Q37 為什麼用 OpenTelemetry 不用某家 SDK？** 程式只產生 span 用 OTLP 送，收的那頭換廠商只改環境變數。詳見 `LEARNING.md` 關卡 22 觀念 5。
- **Q38 零停機靠什麼？** `maxUnavailable: 0`、readiness 探針、`preStop` 睡幾秒；少一個分別是容量掉、起來就收流量看到 500、關 pod 那一兩秒被拒。詳見 `LEARNING.md` 關卡 23 觀念 4。
- **Q39 k8s 的遷移為什麼用 Job，Render 卻放啟動指令？** 兩個副本同時啟動會同時跑遷移打架；Job 只有一個執行者、跑完就結束。詳見 `LEARNING.md` 關卡 23 觀念 3。
- **Q40 註冊成功為什麼不直接送 Kafka，要先寫 outbox 表？** Kafka 不參與資料庫交易，先送或先 commit 都有一邊會丟；outbox 讓「要送」和使用者同一個交易同生共死。詳見 `LEARNING.md` 關卡 24 觀念 1。
- **Q41 at-least-once 會重複怎麼辦？** 收的那邊冪等：`processedevent` 主鍵就是事件 id，撞主鍵就是處理過了。詳見 `LEARNING.md` 關卡 24 觀念 2。
- **Q42 線上沒有 Kafka、Prometheus、k8s，這幾關線上做了什麼？** 程式已是可以接的狀態（outbox 表在 Neon、worker 把事件印到 log、`/metrics` 與追蹤是開關）；證明它會動的是 CI 的五個 job。詳見 `ARCHITECTURE.md` 第 2 節。
- **Q43 要把線上從 Render 搬到 k8s 嗎？** 不用；一個服務、一個人、免費額度夠用，k8s 的價值在很多服務、很多人、要自己控制網路與排程的時候。詳見 `LEARNING.md` 關卡 23 Q5。
