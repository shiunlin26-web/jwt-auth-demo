# QA.md：JWT 與部署的觀念問答

> 每一題先給**一句話答案**，再給理由，最後指到哪裡可以看程式或更長的說明。
> 用途：複習、面試前、或「我知道怎麼做但說不出為什麼」的時候。
> 每一關的「想一想」是針對那一關的細節；這裡是跨關卡、換技術棧也成立的通則。

## 認證基礎

**Q1：為什麼要兩種 token（access + refresh），一種不行嗎？**
一種的話，要嘛太短命（一直要重新登入），要嘛太長命（被偷了可以用很久）。拆成兩種：access token 短命（30 分鐘）、每個請求都帶、不查資料庫，所以快；refresh token 長命（7 天）、只在換證時用、查資料庫，所以可以撤銷。短命的被偷損失有限，長命的可以撤銷。詳見 `TOUR.md` 第 0 站「兩張卡」。

**Q2：access token 為什麼不查資料庫？那登出所有裝置後它不是還能用 30 分鐘？**
對，這是刻意的取捨。每個請求都查資料庫，JWT 就失去「不用查就能驗」的意義。30 分鐘的空窗用縮短有效期來控制。真的需要「立刻失效」的操作（改密碼、封鎖帳號）才另外處理。詳見 `LEARNING.md` 關卡 3 Q2。

**Q3：JWT 裡面的資料別人看得到嗎？**
看得到。JWT 只有簽章，沒有加密，payload 是 base64，任何人都能解開。所以裡面只放 `sub`（使用者 id）和過期時間，不放 email、權限這些會變或敏感的東西。簽章保證的是「沒被改過」，不是「看不到」。

**Q4：認證（authentication）和授權（authorization）差在哪？**
認證是「你是誰」（登入），授權是「你能不能動這筆資料」。範例專案只有認證，因為只有一張 user 表。練習專案一有第二張表，每個端點都要加「這筆資料屬於目前使用者嗎」的檢查，而且要有測試。這是最常見的安全洞。詳見 `CHAIN.md` 環 7。

**Q5：為什麼密碼用 bcrypt，refresh token 卻只用 SHA-256？**
密碼是人想的，熵低，攻擊者可以猜，所以要用刻意很慢的 bcrypt。refresh token 是 32 bytes 的隨機字串，猜不到，用快的 SHA-256 就夠，而且登入頻繁、慢的雜湊會拖累。詳見 `LEARNING.md` 關卡 1 Q5。

**Q6：密碼為什麼限制 72 bytes、只允許 ASCII？**
bcrypt 只看前 72 bytes，超過的部分被默默丟掉。中文一個字 3 bytes，24 個字就滿了，之後的字元不影響驗證，使用者不知道。限制在門口（schema）擋掉，比默默截斷誠實。詳見 `LEARNING.md` 關卡 0。

## token 放哪

**Q7：access token 為什麼放記憶體（變數），不放 localStorage？**
localStorage 任何在頁面上跑的 JS 都讀得到，一個 XSS 就全拿走。放記憶體，重新整理就消失，但那沒關係，refresh token 會換一張新的回來。詳見 `TOUR.md` 第 12 站。

**Q8：refresh token 為什麼放 HttpOnly cookie？**
HttpOnly 的 cookie JS 讀不到，XSS 拿不走。瀏覽器會自動帶上，前端程式碼裡根本不會出現它。代價是要處理 CSRF 和 SameSite，這就是 Q12 到 Q14 的事。

**Q9：資料庫為什麼存 refresh token 的雜湊，不存原文？**
資料庫外洩時，攻擊者拿到的是雜湊，不能直接當 token 用。跟密碼的道理一樣，只是不需要慢的雜湊（Q5）。

## refresh 輪替

**Q10：什麼是輪替（rotation）、什麼是重複使用偵測（reuse detection）？**
輪替：每次用 refresh token 換證，舊的作廢、發一張新的。重複使用偵測：有人拿已作廢的來換，代表它被偷過（正常使用者手上不會有舊的），把這個使用者所有 refresh token 全部撤銷，大家重新登入，小偷手上的新卡也失效。詳見 `LEARNING.md` 關卡 1「觀念」。

**Q11：為什麼前端一定要 single-flight？**
有輪替之後，同時三個請求收到 401 會各自去 refresh。第一個把 A 換成 B，後兩個拿著 A 再去換，就被當成重複使用，使用者莫名其妙被登出。single-flight 讓同一時間只有一個 refresh 請求，其他人等同一個結果。前端的 single-flight 和後端的輪替 + 偵測**必須搭配**。詳見 `client.ts` 的 `refreshPromise`。

## cookie 與同站

**Q12：為什麼正式環境前後端要同站？分開放在兩個網域不行嗎？**
refresh cookie 是 `SameSite=Lax`。前端在 `*.vercel.app`、後端在 `*.onrender.com` 是跨站，瀏覽器在跨站的 `POST /refresh` 不會帶這個 cookie，重新整理就掉登入。解法是讓瀏覽器以為前後端是同一個網站：前端只打自己網域的 `/api/*`，由 Vercel rewrites 轉發到 Render。這就是反向代理。詳見 `LEARNING.md` 關卡 10、`PLAN.md`「第 3 天之前就要定的架構決定」。

**Q13：為什麼不直接改成 `SameSite=None; Secure` 硬撐？**
技術上可行，但 iOS Safari 預設擋第三方 cookie，Chrome 也在逐步限制，「手機用 4G 開網址能登入」在 iPhone 上會過不了。而且 `None` 等於主動放棄瀏覽器對 CSRF 的保護。同站之後連 CORS 都不用設，cookie 保持 Lax，更安全也更簡單。詳見 `LEARNING.md` 關卡 10 Q1。

**Q14：cookie 的 `Path` 為什麼設成 `/api/auth`？**
瀏覽器只在請求路徑以 `/api/auth` 開頭時帶上它。`/api/me`、之後的 `/api/todos` 都不會帶，refresh token 不會跟著每個請求滿天飛。這也是為什麼前端的 baseURL 一定要是 `/api`：寫成後端網址，路徑就對不上了。詳見 `DEBUGGING.md`「部署：前端」。

**Q15：同站之後還需要 CORS 嗎？**
不需要。CORS 是跨網域才有的事。程式裡的 CORS 設定留著是為了「除錯時直接打後端網址」這條逃生口，平常用不到。

## 部署

**Q16：為什麼遷移在容器啟動時跑，不在 build 時跑？**
build 時連不到正式資料庫（也不該連）。啟動時跑，遷移失敗容器就退出，平台標記部署失敗，舊版繼續跑，不會出現「程式是新的、資料表是舊的」。詳見 `LEARNING.md` 關卡 9 Q2。

**Q17：遷移失敗了為什麼不能 `downgrade`，要 roll forward？**
`alembic_version` 表記著「跑到哪一版」。手動退版後，程式碼和資料庫的認知就不一致，下次部署更亂。推一個新的遷移往前修，歷史保持線性。詳見 `RUNBOOK.md` 第 3 節。

**Q18：為什麼刪欄位要分兩次部署？**
退版時舊程式還會讀那個欄位。第一次部署先讓程式不再用它，第二次才刪。這樣任何時候退版都安全。詳見 `LEARNING.md` 關卡 11 觀念 4。

**Q19：為什麼後端要聽 `0.0.0.0`，不是 `127.0.0.1`？**
`127.0.0.1` 是「只聽容器自己」，外面（平台的負載平衡器）連不進來，部署顯示成功但一直 502。`0.0.0.0` 是「聽所有網路介面」。詳見 `Dockerfile` 的 CMD。

**Q20：為什麼 CI 綠了才部署，還要 branch protection？**
CI 綠了才部署擋的是「推了壞程式，自動部署還是把它推上去」。branch protection 擋的是「跳過 CI 直接推 main」。兩層都有，壞的程式進正式環境的路才堵死。詳見 `LEARNING.md` 關卡 11 觀念 7。

**Q21：第一個請求等了一分鐘，是壞了嗎？**
免費方案冷啟動：Render 閒置 15 分鐘休眠、Neon 閒置 5 分鐘休眠。第二個請求正常就不是 bug。要避免只能付費。詳見 `DEBUGGING.md`。

**Q22：為什麼 `/api/ping` 和 `/api/health` 要分開？**
ping 是 liveness（程式活著嗎），不碰資料庫；health 是 readiness（能服務嗎），真的查資料庫。平台的 health check 用 ping：資料庫短暫斷線時程式沒壞，用 readiness 會讓平台不斷重啟它。詳見 `LEARNING.md` 關卡 11 觀念 1。

**Q23：密鑰放哪？`render.yaml`、`vercel.json` 都進 git 了。**
`render.yaml` 把密鑰欄位標成 `sync: false`，值在 Render 後台填，不在檔案裡。前端的 `VITE_*` 變數會被打包進網頁，任何人都看得到，所以前端永遠不能有密鑰。詳見 `LEARNING.md` 關卡 10 Q3。

**Q24：換 JWT 密鑰會把所有人登出嗎？**
幾乎無感。access token 是 JWT，換了密鑰舊的全失效，但它只有 30 分鐘；refresh token 是隨機字串、資料庫存雜湊，跟密鑰無關。下一個請求 401 → 前端自動 refresh → 拿到新密鑰簽的 access token，不用重新登入。如果當初 refresh token 也用 JWT，換密鑰就是全站登出。詳見 `RUNBOOK.md` 第 4 節。

## 前端狀態

**Q25：Zustand 和 TanStack Query 各管什麼？**
Zustand 管「前端自己的狀態」：token、初始化了沒、提示文字。TanStack Query 管「後端資料的副本」：使用者資料、待辦清單。判斷方法：這東西有沒有一個後端的正本，而且你想讓畫面跟著正本走？有就交給 TanStack Query。詳見 `LEARNING.md` 關卡 12。

**Q26：登入狀態為什麼用「算」的，不另外存一個 `isLoggedIn`？**
有 token 就是已登入。分開存的話，每個改 token 的地方都要記得一起改狀態，漏一個就對不上。能算出來的就不要另外存。詳見 `LEARNING.md` 關卡 6 Q3。

**Q27：前端守門員（RequireAuth）擋住了，就安全了嗎？**
沒有。前端的檢查任何人都能繞過（改 JS、直接打 API）。真正的保護在後端的 `get_current_user`。前端守門員只是使用體驗。詳見 `LEARNING.md` 關卡 7 Q2。

## 工程習慣

**Q28：為什麼 lock 檔（`uv.lock`、`package-lock.json`）要進 git？**
有了它，你的電腦、CI、Docker 三個地方裝出來的版本完全一樣。沒有它，「我這邊好好的，CI 卻紅了」通常就是版本不一樣。詳見 `LEARNING.md` 關卡 9 Q1。

**Q29：為什麼不能用 `create_all` 建資料表？**
`create_all` 只建不存在的表，改欄位時不會更新已存在的表，而且沒有紀錄。遷移檔是資料表結構的 git log。詳見 `LEARNING.md` 關卡 5。

**Q30：測試全綠就代表沒 bug 嗎？**
只代表「測試有想到的情況」沒壞。沒想到的、環境差異（CI 綠、正式紅）、授權漏洞（沒寫跨使用者測試）都抓不到。詳見 `LEARNING.md` 關卡 4 Q4、關卡 9 Q3。

**Q31：為什麼有了 bcrypt 還要登入頻率限制？客戶端 IP 怎麼拿？**
bcrypt 讓每次猜密碼要 100 毫秒，但攻擊者可以開很多連線同時猜，而且每次都在燒你的 CPU。頻率限制在 bcrypt 之前就擋掉。IP 不能用 `request.client.host`（那是最後一層代理），也不能用 `X-Forwarded-For` 最左邊（使用者自己能填），要從右邊跳過已知的代理層數取下一段。詳見 `LEARNING.md` 關卡 17 觀念 2。
