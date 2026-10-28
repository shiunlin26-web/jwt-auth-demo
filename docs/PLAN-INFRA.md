# PLAN-INFRA.md：基礎設施路線（關卡 21～25）的計畫、小塊清單與進度

> 狀態：v1（2026-10-22）。關卡 0～20 把「前端 → 後端 → 資料庫 → 測試 → CI → Docker → 部署 → 維護」接通了；
> 這條路線補上 **docker compose、E2E、指標與追蹤、Kubernetes、訊息佇列**，最後畫一張整條鏈的地圖。
> 每一塊都有一個 CI job 真的把它跑起來，綠燈就是「確保能運作」，也是以後改壞時的保險絲。
>
> **狀態（2026-10-28）**：路線已完成（2026-10-22，含選配 25-D），這份縮成決定紀錄：為什麼做（第 0 節）、補了什麼（第 1 節）、以後加基礎設施的 job 要守的規矩（第 2 節）、每一小塊做了什麼與 PR 編號（第 6 節）、Actions 分鐘數（第 7 節）、免費方案查證（第 8 節）。施工用的小塊清單、對話範本、學習方式已拿掉，第 3～5 節只留標題指路；原文在 git 歷史 `git show 5976278:docs/PLAN-INFRA.md`。
> **給 AI**：要加基礎設施的 job，先讀 `AGENTS.md` 和本文第 2 節；**不要讀 `LEARNING.md` 全文**，需要時只讀指定的關卡。

## 0. 這條路線怎麼來的（決定紀錄）

- **2026-10-22 學習者決定**：`HANDOFF.md` 第 5 節第 7 條「刻意不碰 Kubernetes、docker compose」改為「做在 `infra/`，只在 CI 和 Mac 上跑，線上不碰」。理由：目標是全端，面試時要能讓人快速看懂整條鏈；這些是現代開發的主流項目。
- **條件：全部免費**。新加的外部服務只有一個選配的 Grafana Cloud 免費方案，而且整關不靠它也能完成（第 8 節有查證表）。
- **兩台機器**：平日是 Windows VM，沒有 Docker、每次開機清空，只能看 CI 的 log；晚上與週末有 Mac，有 Docker，動手都排在 Mac。`scripts/doctor.sh`、`scripts/doctor.ps1` 會印出「這台能做哪幾關」。
- **範例專案仍然凍結**：不加業務功能。這五關是教學延伸，編號接在 20 之後，一關的格式照 `HANDOFF.md` 第 3 節。
- **節奏**：要在 CI 來回修的「重」小塊先集中做完；文件、腳本、帶做這些「輕」小塊切好，之後一次一塊。
- **重帶照常**：學習者同時在別的對話重帶關卡 2～20。本路線不改 `COACHING.md` 關卡 0～20 的腳本，只在程式行數變動時同步修行數；`HANDOFF.md` 第 2 節的重帶進度只由重帶的對話更新，本路線的進度只記在本文第 6 節。

## 1. 這條路線補了什麼（整條鏈的圖在 `ARCHITECTURE.md` 第 1 節）

| 區塊 | 關卡 0～20 已有 | 這條路線補的 | 證明在哪 |
| --- | --- | --- | --- |
| 前端 | React、Router、Zustand、TanStack Query、Zod、Tailwind、Vitest + MSW | Playwright E2E 走真的瀏覽器 | `infra.yml` 的 `e2e` job |
| 後端 | FastAPI、JWT、refresh 輪替、pytest、ruff、pyright | `/metrics`、OpenTelemetry、outbox + worker | `infra.yml` 的 `observability`、`messaging` job |
| 資料庫 | Neon、Alembic、索引與鎖（關卡 18） | 遷移在 k8s 用 Job 跑；outbox 表 | `k8s` job 的 migrate Job |
| CI/CD | `ci.yml` 全綠才合併；Render 等 CI 綠才部署 | `infra.yml`；選配：GitHub Actions 觸發部署並等 `/api/health` 版本對上 | Actions 分頁 |
| 容器 | 後端 Dockerfile（multi-stage、非 root） | compose 一個檔案起整套 | `compose` job |
| 雲端與部署 | Render + Vercel + Neon，同站 | k8s 清單可搬到任何託管叢集 | `k8s` job |
| 可觀測性 | request id、JSON log、Sentry、`/api/health` | 指標、追蹤、dashboard 進 git | `observability` job、Grafana 畫面 |
| 非同步 | 無 | outbox、worker、Kafka、冪等消費 | `messaging` job |

## 2. 原則（以後加基礎設施的 job 也要守）

1. **一塊一個 job**。基礎設施的 job 全部放 `.github/workflows/infra.yml`，**不放進 `ci.yml`**。觸發：`pull_request`（只有 `infra/**`、`backend/**`、`frontend/e2e/**`、`infra.yml` 本身有改動才跑）與 `workflow_dispatch`。這樣 Dependabot 和純文件 PR 不會去開 kind，分鐘數才省得下來（第 7 節）。
2. **同一個 image**。compose、k8s、Render 都用 `backend/Dockerfile`，不另寫第二份。
3. **開關預設關**。`METRICS_ENABLED`、`OTEL_EXPORTER_OTLP_ENDPOINT`、`KAFKA_BOOTSTRAP_SERVERS` 沒設就等於沒這功能，Render 上的行為一行都不變。`.env.example` 要補說明。
4. **兩條路線、同一組預期值**。每關的 COACHING 腳本分「Mac 路線」（親手跑）和「VM 路線」（看 CI job 的 log 第幾行）；看到的數字和字串要一樣。
5. **一小塊 = 一個 PR = 一個對話**。小塊的描述要自足：一個沒有記憶的 AI 只讀本文那一段和 `infra/` 就能做。一個 PR 只動那一小塊的檔案；CI 綠了由學習者合併。
6. **免費**。要新加外部服務先補第 8 節的查證表，照 `HANDOFF.md` 第 5 節第 11 條動手前先說。

## 3. 小塊清單（已完成，併入第 6 節）

每一小塊做了什麼、PR 編號看第 6 節；原本的施工描述（份量、驗收、需要什麼）在 git 歷史。

## 4. 對話範本（已移到 `HANDOFF.md` 第 8 節）

帶一關、卡住了的範本都在那裡；練習專案的六步循環範本在 `PLAN-FULLSTACK.md` 第 4 節。

## 5. 學習方式（照 `COACHING.md` 第 1 節）

關卡 21～24 現在只走「VM 路線」（看 CI 的 job log，每關一小時），Mac 動手是選配（2026-10-27 決定，`HANDOFF.md` 第 2 節）；60 秒說法填在 `ARCHITECTURE.md` 第 6 節。

## 6. 每一小塊做了什麼、PR 編號（已關閉，只在修文件時動）

| 小塊 | 做了什麼 | PR | 日期 | 備註 |
| --- | --- | --- | --- | --- |
| 0 | 本計畫、`scripts/setup.sh`、`scripts/doctor.*`、HANDOFF | #39 | 2026-10-22 | 公開 repo 前去個人化 |
| 21-A compose | `infra/compose.yaml`：postgres + backend，兩個都有 healthcheck；`infra.yml` 的 `compose` job（up --wait → health → logs → down） | #40 | 2026-10-22 | |
| 21-B E2E | `frontend/e2e/auth.spec.ts` 三條（註冊、重整仍登入、登出）、`playwright.config.ts`；`e2e` job 上傳 `playwright-report` | #41 | 2026-10-22 | |
| 21-C 文件 | COACHING 關卡 21（Mac / VM 兩條路線）、PLAIN、LEARNING | #52 | 2026-10-22 | |
| 22-A 指標 | prometheus-client middleware、`/metrics` 只在 `METRICS_ENABLED=true` 掛上；compose profile `observability`（Prometheus + Grafana provisioning、儀表板進 git）；`observability` job | #42 | 2026-10-22 | |
| 22-B 追蹤 | OpenTelemetry（FastAPI + asyncpg、OTLP/HTTP），只有 `OTEL_EXPORTER_OTLP_ENDPOINT` 設了才啟用，span 帶 request_id；compose 的 otel-collector debug exporter | #43 | 2026-10-22 | SQLAlchemy 2.1 的 OTel 套件不支援，改掛 asyncpg |
| 22-C 線上（選配） | LEARNING 關卡 22「開始前」第二段：Grafana Cloud 免費方案、Render 要設的 `OTEL_*` | #53 | 2026-10-22 | 帳號學習者自己開 |
| 22-D 文件 | COACHING 關卡 22（Mac / VM）、PLAIN、LEARNING | #53 | 2026-10-22 | |
| 23-A 清單與 kind | `infra/k8s/base`（namespace、configmap、遷移 Job、Deployment 2 副本與探針、Service、kustomize）、`overlays/ci`、`ci/postgres.yaml`；`k8s` job 用 kind 開叢集跑完整套 | #44 | 2026-10-22 | |
| 23-B 滾動更新與退版 | 同一 job 後段：換 tag → `rollout status/history/undo`；壞 image 被 readiness 擋住、舊 pod 繼續服務 | #45 | 2026-10-22 | |
| 23-C 文件 | COACHING 關卡 23（Mac 17 步 / VM 8 步）、PLAIN、LEARNING、RUNBOOK 第 2 節的 k8s 退版 | #54 | 2026-10-22 | |
| 24-A outbox 表 | `OutboxEvent` 表、遷移 `0005`、`register` 在同一個交易寫 `user.registered`、兩個測試 | #46 | 2026-10-22 | COACHING 關卡 0 的 register 行數已同步 |
| 24-B worker 與 consumer | `worker.py`（有 Kafka 就送、沒有就印 log）、`consumer.py`（`processedevent` 主鍵冪等）、compose profile `messaging`（Redpanda）；`messaging` job 驗 published / consumed / duplicate | #47 | 2026-10-22 | |
| 24-C 免費線上版 | `OUTBOX_WORKER=inline`：web 程序裡的背景 task 輪詢 outbox、印到 log | #48 | 2026-10-22 | Render Logs 搜 published |
| 24-D 文件 | COACHING 關卡 24（Mac / 本機不用 Docker / VM 三條路線）、PLAIN、LEARNING、`.env.example` | #55 | 2026-10-22 | |
| 25-A ARCHITECTURE | `docs/ARCHITECTURE.md`：四條路徑、每塊在哪跑／怎麼證明／怎麼擴／要多少錢／換棧對照、60 秒說法留空 | #49 | 2026-10-22 | v2 收尾在 #57 |
| 25-B CHAIN v2 | 環 8～11、附錄 A 加基礎設施的搬家列 | #56 | 2026-10-22 | |
| 25-C README 與收尾 | README 架構圖與「這個專案展示了什麼」、HANDOFF 第 0、2、6、9 節、本表關閉 | #57 | 2026-10-22 | |
| 25-D 部署追蹤（選配） | `deploy.yml`：main 的 CI 綠後打 Render Deploy Hook，等 `/api/health` 的 `version` 對上；沒設 secret 就跳過 | #63 | 2026-10-22 | 啟用步驟在 `deploy.yml` 開頭與 LEARNING 關卡 25，學習者自己做 |

**狀態（2026-10-22）：路線完成，含選配。** 0、21-A～25-D 全部合併。之後這張表只在修文件時動。

## 7. GitHub Actions 分鐘數與省法

**決定（2026-10-22）：repo 公開**（選項 A）。公開 repo 用標準 runner 不計分鐘，本 repo 的 CI 不再有額度問題；其餘選項留著，把這套搬到私有專案時用。

事實：

- 私有 repo 的分鐘數是**整個帳號一池**，GitHub Free 每月 2000 分鐘、GitHub Pro 3000 分鐘；公開 repo 用標準 runner **不計分鐘**。macOS runner 計 10 倍。帳單頁的 View details 可以看每個 repo、每種 runner 各用多少。
- 本 repo `ci.yml` 一次約 1.5 分鐘牆鐘，兩個 job 並行，計費約 3 分鐘；`on: push` 加 `pull_request` 讓每次推 PR 分支跑兩次；Dependabot 每週三組 PR。

選項（私有專案可以複選；A 最省、其餘加起來約省一半）：

| 選項 | 做法 | 省多少 | 代價 |
| --- | --- | --- | --- |
| **A 公開 repo** | Settings → Danger Zone → Change visibility | 本 repo 的分鐘歸零 | 見下方「公開前做過的事」 |
| **B 分支 push 不跑** | `on.push.branches: [main]`，PR 分支只靠 `pull_request` 跑一次 | 每次推 PR 分支省一半 | 沒開 PR 的分支推上去不會跑 CI；動手玩要開 PR 才看得到紅綠 |
| **C 取消被蓋掉的 run** | `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` | 連推兩次只算最後一次 | 無 |
| **D Dependabot 改每月** | `dependabot.yml` 的 `interval: monthly` | 每月少約 6 組 PR、36 分鐘 | 套件更新慢一點 |
| **E 純文件不跑** | `paths-ignore: ['docs/**', '*.md']` | 文件 PR 歸零 | branch protection 要求的 check 不會出現，文件 PR 要用管理員權限合併，或改成 job 內用 `paths-filter` 跳步驟 |
| **F 基礎設施 job 只在需要時跑** | 本文第 2 節第 1 條，已是設計 | 不會因 Dependabot 開 kind | 無 |
| **G 設支出上限** | Settings → Billing → Actions spending limit | 超過就停、不扣錢 | 池用完後 CI 不跑，要等下個月 |

**公開前做過的事**（本 repo 是練習用登入範本）：

- git 歷史掃過：沒有真的連線字串、密鑰、Sentry DSN，只有 `xxxx` 範例。commit 作者 email 在 git 歷史裡本來就看得到；GitHub 的 Email 設定開 Keep my email addresses private 只影響之後的 commit。
- 文件裡的個人化資訊（訂閱方案、帳單、其他專案、學習者的原話與情緒）已移除；留下的只有帶學習者需要的環境事實（兩台機器、每天時數、技術背景）。
- 線上網址本來就在 `vercel.json` 和文件裡，公開後任何人都能註冊帳號打 API；註冊與登入都有頻率限制（關卡 17），必要時把 `AUTH_RATE_LIMIT` 調低。
- 公開的好處：Actions 不限分鐘；GitHub Free 的公開 repo 也有 rulesets 與 branch protection；面試時可以直接給連結。

## 8. 免費方案查證表

關卡 21～25 用到的（2026-10-22 查官方頁面）：

| 服務 | 用途 | 免費方案 | 注意 |
| --- | --- | --- | --- |
| Docker Desktop（Mac） | 關卡 21～24 本機 Docker | 個人使用免費；公司要少於 250 人**且**年營收少於 1000 萬美元 | 不想裝 Desktop 可用 OrbStack（個人免費）或 Colima（開源） |
| kind、kubectl、kustomize | 關卡 23 本機叢集 | 開源 | `brew install kind kubectl` |
| Playwright | 關卡 21 E2E | 開源 | CI 要 `playwright install --with-deps` |
| Prometheus、Grafana OSS、OpenTelemetry Collector | 關卡 22 compose 內 | 開源 | 都是 Docker image |
| Grafana Cloud Free | 關卡 22-C 線上（選配） | 不用信用卡；10,000 個 metrics series、logs 與 traces 各 50 GB／月、14 天保留、3 個使用者 | 額度會變，註冊前再看 grafana.com 的 free-tier 頁；畫面若要求信用卡就停下來 |
| Redpanda、aiokafka | 關卡 24 Kafka 相容 broker 與客戶端 | 自己跑免費（Redpanda 是 source-available，禁止拿去當託管服務賣，教學無關） | 線上沒有免費的託管 Kafka，關卡 24 線上只用 24-C 的 log 版本 |
| GitHub Actions | 所有 job | 私有 repo：Free 2000 分鐘／月、Pro 3000；公開 repo 標準 runner 免費 | 第 7 節 |
| Render | 線上後端 | 免費 web service | **背景 worker 不在免費方案**，所以 24-C 用同程序內的背景任務 |

關卡 0～20 用到的（2026-10-12 查，原在 `PLAN.md`；註冊前再看一眼官方頁面）：

| 服務 | 用途 | 免費方案 | 注意 |
| --- | --- | --- | --- |
| Render | 後端 | 每個 workspace 每月 750 小時；閒置 15 分鐘休眠，喚醒約 30～60 秒，休眠不計時數 | 兩個專案共用 750 小時，靠休眠夠用。**Pre-Deploy Command 只有付費方案有**，遷移改在 start command 跑；「After CI Checks Pass」免費方案不一定有，沒有就用 Deploy Hook（25-D） |
| Railway | 後端（備案） | 沒有長期免費方案 | 排除 |
| Neon | 資料庫 | 100 個專案、每專案每月 100 CU 小時、0.5 GB 儲存、10 個分支；閒置 5 分鐘休眠；還原窗 6 小時 | 範例與練習各開專案，正式與開發分開 |
| Vercel | 前端 | Hobby 免費，限非商業用途，rewrites 可用 | 個人學習符合 |
| Sentry | 錯誤追蹤 | Developer 方案：1 個使用者、每月 5000 個錯誤 | 夠用 |
| 網域 | 自訂網址 | 不免費（首年促銷約 1 美元、續約約 11 美元） | **不買**，用 `*.vercel.app` |

**刻意不做的**（會碰到付費或超出範圍）：Terraform（要雲端帳號與 state）、線上的 Kubernetes 叢集、託管 Kafka、Helm（kustomize 夠用）、前端 Dockerfile（前端留在 Vercel）、ArgoCD。每一個在 `ARCHITECTURE.md` 寫成「下一步往哪擴」。
