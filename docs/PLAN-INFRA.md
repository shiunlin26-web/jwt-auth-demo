# PLAN-INFRA.md：基礎設施路線（關卡 21～25）的計畫、小塊清單與進度

> 狀態：v1（2026-10-22）。關卡 0～20 把「前端 → 後端 → 資料庫 → 測試 → CI → Docker → 部署 → 維護」接通了；
> 這條路線補上 **docker compose、E2E、指標與追蹤、Kubernetes、訊息佇列**，最後畫一張整條鏈的地圖。
> 每一塊都有一個 CI job 真的把它跑起來，綠燈就是「確保能運作」，也是以後改壞時的保險絲。
>
> **給 AI**：做任何一小塊之前只讀 `AGENTS.md`、本文第 2 節「原則」、第 3 節那一小塊的段落、以及 `infra/` 裡相關的檔案。
> **不要讀 `LEARNING.md` 全文**（3700 行），需要時只讀指定的關卡。進度的唯一來源是第 6 節的進度表。

## 0. 這條路線怎麼來的（決定紀錄）

- **2026-10-22 學習者決定**：`HANDOFF.md` 第 5 節第 7 條「刻意不碰 Kubernetes、docker compose」改為「做在 `infra/`，只在 CI 和 Mac 上跑，線上不碰」。理由：目標是全端，面試時要能讓人快速看懂整條鏈；這些是現代開發的主流項目。
- **條件：全部免費**。新加的外部服務只有一個選配的 Grafana Cloud 免費方案，而且整關不靠它也能完成（第 8 節有查證表）。
- **兩台機器**：平日是 Windows VM，沒有 Docker、每次開機清空，只能看 CI 的 log；晚上與週末有 Mac，有 Docker，動手都排在 Mac。`scripts/doctor.sh`、`scripts/doctor.ps1` 會印出「這台能做哪幾關」。
- **範例專案仍然凍結**：不加業務功能。這五關是教學延伸，編號接在 20 之後，一關的格式照 `HANDOFF.md` 第 3 節。
- **節奏**：要在 CI 來回修的「重」小塊先集中做完；文件、腳本、帶做這些「輕」小塊切好，之後一次一塊。
- **重帶照常**：學習者同時在別的對話重帶關卡 2～20。本路線不改 `COACHING.md` 關卡 0～20 的腳本，只在程式行數變動時同步修行數；`HANDOFF.md` 第 2 節的重帶進度只由重帶的對話更新，本路線的進度只記在本文第 6 節。

## 1. 做完之後整條鏈長什麼樣

```
 開發者 ── git push ──▶ GitHub Actions
                         ci.yml    ：ruff、pyright、alembic check、pytest、Docker build + smoke、eslint、vitest、tsc
                         infra.yml ：compose + E2E（21）、指標與追蹤（22）、kind 上的 k8s（23）、Redpanda 訊息（24）
                              │ 綠了才合併 main
                              ▼
                         Render（後端容器，同一個 backend/Dockerfile）      Vercel（前端，/api 代理到 Render）
                              │                                               ▲
 使用者 ── 瀏覽器 ──▶ 前端網域 /api/* ───────────────────────────────────────┘
                              ▼
                         FastAPI ──▶ Neon Postgres
                            ├──▶ 結構化 log、Sentry（關卡 11）
                            ├──▶ /metrics、OTLP ──▶ Prometheus + Grafana（compose）／Grafana Cloud（選配）（22）
                            └──▶ outbox 表 ──▶ worker ──▶ Kafka（Redpanda）──▶ consumer（24）

 infra/compose.yaml ：同一套在本機（Mac）一個指令起來（21）
 infra/k8s/         ：同一個 image 交給 Kubernetes 排程、探活、滾動更新與退版（23）
```

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

## 2. 原則（做每一小塊都要守）

1. **一塊一個 job**。基礎設施的 job 全部放 `.github/workflows/infra.yml`，**不放進 `ci.yml`**。觸發：`pull_request`（只有 `infra/**`、`backend/**`、`frontend/e2e/**`、`infra.yml` 本身有改動才跑）與 `workflow_dispatch`。這樣 Dependabot 和純文件 PR 不會去開 kind，分鐘數才省得下來（第 7 節）。
2. **同一個 image**。compose、k8s、Render 都用 `backend/Dockerfile`，不另寫第二份。
3. **開關預設關**。`METRICS_ENABLED`、`OTEL_EXPORTER_OTLP_ENDPOINT`、`KAFKA_BOOTSTRAP_SERVERS` 沒設就等於沒這功能，Render 上的行為一行都不變。`.env.example` 要補說明。
4. **兩條路線、同一組預期值**。每關的 COACHING 腳本分「Mac 路線」（親手跑）和「VM 路線」（看 CI job 的 log 第幾行）；看到的數字和字串要一樣。
5. **一小塊 = 一個 PR = 一個對話**。小塊的描述要自足：一個沒有記憶的 AI 只讀本文那一段和 `infra/` 就能做。一個 PR 只動那一小塊的檔案；CI 綠了由學習者合併。
6. **免費**。要新加外部服務先補第 8 節的查證表，照 `HANDOFF.md` 第 5 節第 11 條動手前先說。
7. **面試可讀**。每一關在 `ARCHITECTURE.md` 有一格「60 秒說法」：這塊解決什麼、怎麼證明它會動、怎麼擴充。
8. 程式與文件的慣例照 `AGENTS.md`：中文註解說為什麼、標 `【關卡 N】`、改 `models.py` 一定產生遷移、推之前跑全部檢查。

## 3. 小塊清單

份量：S 一小時內、M 半天、L 一天（指 AI 做的時間，含 CI 來回）。階段：**重** 要在 CI 來回修、先集中做；**輕** 文件與腳本為主、之後一次一塊。「需要」指驗證時需要什麼；寫 CI 就是在 Actions 看結果，學習者不用本機 Docker。

### 關卡 21：docker compose + Playwright E2E

**一句話**：同一個 image 在本機用一個檔案起整套，並用真的瀏覽器走一遍登入主路徑。補掉 `HANDOFF.md` 第 9 節「沒有 E2E」的洞。

| 小塊 | 做什麼 | 驗收（親眼看得到的） | 需要 | 份量 | 階段 |
| --- | --- | --- | --- | --- | --- |
| **21-A compose** | `infra/compose.yaml`：`postgres:16` + `backend`（`build: ../backend`，環境變數 `DATABASE_URL` 指向 `postgres` 服務、`JWT_SECRET`、`PORT`），兩個都有 healthcheck。`.github/workflows/infra.yml` 新 workflow，job `compose`：`docker compose up -d --wait` → curl `/api/health` → 印 `docker compose logs backend` → `down -v` | Actions 的 Infra workflow 有 `compose` job 綠；log 看得到 alembic 的 `Running upgrade` 和 health JSON 的 `"db": "ok"` | CI | S | 重 |
| **21-B E2E** | `frontend/e2e/auth.spec.ts` 三條：註冊後首頁看到 email、重新整理仍登入、登出後回登入頁。`frontend/playwright.config.ts` 用 `webServer: npm run dev`（Vite 代理到 `localhost:8000`）。job `e2e`：compose up → `npm ci` → `npx playwright install chromium --with-deps` → `npx playwright test` → HTML report 上傳成 artifact | `e2e` job 綠，run 頁面底部有 `playwright-report` artifact；故意把一條的預期值改錯開 PR 會紅 | CI | M | 重 |
| **21-C 文件與腳本** | `COACHING.md` 關卡 21（Mac 路線：`docker compose -f infra/compose.yaml up`、`npm run dev`、`npx playwright test --ui`；VM 路線：`compose`、`e2e` job 的指定行）、`PLAIN.md` 一段、`LEARNING.md` 關卡 21（照 `HANDOFF.md` 第 3 節格式）、路線圖表格加 21、README 結構樹 | 學習者照 Mac 路線跑到和 CI 一樣的數字 | Mac | M | 輕 |

### 關卡 22：可觀測性（指標與追蹤）

**一句話**：除了錯誤（Sentry）和 log，還要有「數字」和「一個請求走了哪幾站」，而且儀表板進 git。

| 小塊 | 做什麼 | 驗收 | 需要 | 份量 | 階段 |
| --- | --- | --- | --- | --- | --- |
| **22-A 指標** | `prometheus-client`：middleware 記 `http_requests_total{method,path,status}` 與 `http_request_duration_seconds`；`GET /metrics` 只在 `METRICS_ENABLED=true` 時掛上；pytest 兩個測試。compose 加 profile `observability`：`prometheus`（抓 `backend:8000/metrics`）、`grafana`（provisioning 自動掛 datasource 與 `infra/grafana/dashboards/backend.json`）。job `observability`：up → 打十次 `/api/ping` → 查 Prometheus API `http_requests_total` 有值 → 查 Grafana API 該 dashboard 回 200 | `observability` job 綠，log 印出 Prometheus 查詢結果的 `value`；Mac 上開 `localhost:3000` 看得到請求數的圖 | CI | M | 重 |
| **22-B 追蹤** | `opentelemetry-instrumentation-fastapi`、`-sqlalchemy`、`-exporter-otlp-proto-http`；只有 `OTEL_EXPORTER_OTLP_ENDPOINT` 設了才啟用；span 帶 `request_id`。compose 加 `otel-collector`（debug exporter 印到 stdout）。job 內打 `/api/me` 後 `docker compose logs otel-collector` 要含 `GET /api/me` 的 span | job 綠，log 看得到 span 名稱、`http.status_code`、底下的 `SELECT` span | CI | M | 重 |
| **22-C 線上（選配）** | 只寫文件：`LEARNING.md` 關卡 22「⚠️ 開始前」：Grafana Cloud 免費方案額度與不用信用卡（第 8 節）、Render 要設的三個 `OTEL_*` 環境變數、在 Grafana Cloud 的 Explore 看到 Render 來的 trace。學習者自己做，AI 不替他開帳號 | 學習者在 Grafana Cloud 看到 `jwt-auth-demo-backend` 的 trace | 瀏覽器 | S | 輕 |
| **22-D 文件** | `COACHING.md`、`PLAIN.md`、`LEARNING.md` 關卡 22、路線圖 | 同 21-C | Mac | M | 輕 |

### 關卡 23：Kubernetes

**一句話**：同一個 image 不靠 Render，交給 Kubernetes 排程：幾個副本、怎麼探活、怎麼滾動更新與退版。Render 幫你做的事，這關讓你親眼看見是誰在做。

| 小塊 | 做什麼 | 驗收 | 需要 | 份量 | 階段 |
| --- | --- | --- | --- | --- | --- |
| **23-A 清單與 kind** | `infra/k8s/base/`：`namespace`、`configmap`（`LOG_JSON`、`COOKIE_SECURE`、`TRUSTED_PROXY_HOPS`）、`secret.example.yaml`（真值不進 git，CI 用 `kubectl create secret --from-literal`）、`migrate-job.yaml`（`alembic upgrade head`）、`deployment.yaml`（2 副本、liveness `/api/ping`、readiness `/api/health`、resources、非 root）、`service.yaml`、`kustomization.yaml`；`overlays/ci/`（副本 1、image tag）；`infra/k8s/ci/postgres.yaml` 單副本 Postgres 給 CI 用。job `k8s`：`helm/kind-action` 開叢集 → `docker build` → `kind load docker-image` → 起 Postgres → 建 secret → 跑 migrate Job 並 `kubectl wait --for=condition=complete` → `kubectl apply -k overlays/ci` → `rollout status` → `port-forward` → curl `/api/health` → `kubectl get pods -o wide`、`kubectl logs` | `k8s` job 綠；log 看得到 Job `Completed`、Deployment `successfully rolled out`、health 的 `"migration"` 是最新版 | CI | L | 重 |
| **23-B 滾動更新與退版** | 同一 job 後段：改 image tag 成 `v2`（同內容）→ `rollout status` → `rollout history` → `rollout undo` → 再 curl；再刻意 `set image` 成不存在的 tag，示範 readiness 擋住壞版本：新 pod `ImagePullBackOff`、舊 pod 仍在服務、curl 仍 200，最後 `rollout undo` | log 看得到 `REVISION 1、2`、`ImagePullBackOff`、curl 一直 200 | CI | M | 重 |
| **23-C 文件與 Mac 路線** | `COACHING.md` 關卡 23（Mac：`brew install kind kubectl`、`kind create cluster`、同一串指令；VM：看 job）、`PLAIN.md`、`LEARNING.md`、`RUNBOOK.md` 第 2 節加一段「k8s 的退版是 `rollout undo`」 | Mac 上跑到和 CI 一樣 | Mac | M | 輕 |

### 關卡 24：非同步訊息（outbox → Kafka）

**一句話**：註冊成功要通知別的系統（寄信、統計）時，不在請求裡做；先把「待送事件」和使用者寫進同一個交易，再由 worker 送出。Kafka 是送出的管道之一，重點是 outbox 和冪等。

| 小塊 | 做什麼 | 驗收 | 需要 | 份量 | 階段 |
| --- | --- | --- | --- | --- | --- |
| **24-A outbox 表** | `models.py` 加 `OutboxEvent`（id、topic、payload、created_at、published_at 可空）；遷移 `0005`；`register` 在同一個 session 裡寫一筆 `user.registered`；pytest：註冊後 outbox 有一筆、註冊失敗時沒有。**動到 `routes/auth.py`，合併前核對 `COACHING.md` 關卡 0、2、3 引用的行數並修正** | `uv run pytest -q` 多兩個測試全綠；`alembic check` 綠；Neon 的 SQL Editor 查 `outbox_event` 有資料 | CI | S | 重 |
| **24-B worker 與 consumer** | `backend/worker.py`：輪詢未送出的事件，有 `KAFKA_BOOTSTRAP_SERVERS` 就用 `aiokafka` 送到 topic、沒有就寫 log，成功後標 `published_at`。`backend/consumer.py`：讀 topic，寫 `processed_event` 表（event id 為唯一鍵），重複就跳過並 log `duplicate`。compose 加 profile `messaging`：`redpanda`（Kafka 相容、單機）、`worker`、`consumer`（同一個 image，換 command）。job `messaging`：up → 註冊 → `logs consumer` 出現該 event id → 再手動送一次同 id → 出現 `duplicate` | `messaging` job 綠；log 看得到 `published event=…`、`consumed event=…`、`duplicate event=…` 三行 | CI | L | 重 |
| **24-C 免費線上版** | 沒有 Kafka 時，web 程序的 lifespan 起一個背景 task 每 5 秒輪詢 outbox，送到 log（`OUTBOX_WORKER=inline`）。Render 免費方案不能開第二個服務，這樣線上也看得到 `published` 的 log | Render Logs 搜 `published` 看得到註冊事件 | 瀏覽器 | S | 重 |
| **24-D 文件** | `COACHING.md`、`PLAIN.md`、`LEARNING.md` 關卡 24、路線圖、`.env.example` | 同 21-C | Mac | M | 輕 |

### 關卡 25：地圖與交接

**一句話**：把 0～24 畫成一張別人十分鐘看得懂的圖，每一塊附「怎麼證明、怎麼擴充、要多少錢、換技術棧對照」。這是面試拿出來的那一頁。

| 小塊 | 做什麼 | 驗收 | 需要 | 份量 | 階段 |
| --- | --- | --- | --- | --- | --- |
| **25-A ARCHITECTURE.md** | `docs/ARCHITECTURE.md`：四條路徑的圖（請求、部署、事件、觀測）；每塊表格：在哪跑／怎麼證明／怎麼擴充／要多少錢／換棧對照；每關一格「面試 60 秒說法」留空給學習者自己填 | 交接演練：一個沒有記憶的 AI 只讀它，能說出每條路徑經過哪些東西 | 無 | M | 重寫 v1、輕收尾 |
| **25-B CHAIN v2** | `CHAIN.md` 加環 8（本機整套 + E2E）、環 9（可觀測性）、環 10（k8s）、環 11（非同步訊息），每環四段格式不變 | 四環都能直接貼給任何 AI | 無 | M | 輕 |
| **25-C README 與收尾** | README 開頭加架構圖與「這個專案展示了什麼」；`HANDOFF.md` 第 2、6 節；本文第 6 節進度表關閉 | 交接演練過 | 無 | S | 輕 |
| **25-D 部署追蹤（選配）** | `deploy.yml`：main 的 CI 綠後 curl Render Deploy Hook，輪詢 `/api/health` 直到 `version` 等於這次 commit，GitHub Environment `production` 顯示部署歷史與網址。⚠️ 要先在 Render 關掉 Auto-Deploy 改用 Deploy Hook，免費 | Actions 的 Environments 頁看得到每次部署與 commit；`/api/health` 的 `version` 對上 | 瀏覽器 | S | 輕 |

## 4. 之後怎麼開一個對話（給學習者，複製貼上）

規則：**一個對話只做一小塊或只帶一關**；對話超過一小時就開新的；貼輸出只貼相關的幾行；不要把整份 `LEARNING.md` 貼進去。

**做一小塊（AI 寫程式，你驗收）：**

> 先讀 `AGENTS.md` 和 `docs/PLAN-INFRA.md` 的第 2 節與第 3 節「小塊 ＿＿」那一段，不要讀 `LEARNING.md`。只做這一小塊，照它的驗收。開分支、一個 commit、中文訊息開頭標關卡、推上去、開 PR。CI 綠了告訴我該看哪個 job 的哪幾行。做完更新 `docs/PLAN-INFRA.md` 第 6 節的進度表，並列出「我注意到但你沒要求、所以我沒做」的清單。

**帶我做一關（Mac 或 VM）：**

> 先讀 `AGENTS.md`、`docs/COACHING.md` 第 1 節與第 3 節「關卡 ＿＿」。我現在在 ＿＿（Mac／VM），先跑 `scripts/doctor` 給你看。照腳本一次一步帶我：一個指令、預期值用數字和字串、我貼輸出、你從輸出講。收尾後問我哪一步要再講一次。

**卡住了：**

> 症狀是：＿＿＿（貼 log）。先查 `docs/DEBUGGING.md`，沒有的話照它開頭的三個通用動作分段確認，先講根本原因再修。修好之後把這條加進 `DEBUGGING.md`。

## 5. 學習方式（每一關固定五步，跟關卡 0～20 的循環一樣）

1. **三句白話**：先讀 `PLAIN.md` 那段，知道這塊解決什麼。
2. **VM 上看 CI**：開那關的 job，一步一步讀 log，每一行對回 `infra/` 的哪個檔案第幾行。這是平日能做的。
3. **Mac 上親手跑**：照 COACHING 的 Mac 路線，預期值和 CI 一樣。週末做。
4. **弄壞一個東西**：改一個值開 PR，看 job 紅在哪一行、為什麼，改回來。這一步就是「動手玩」。
5. **60 秒說法**：用自己的話填進 `ARCHITECTURE.md` 那關的格子：解決什麼、怎麼證明、怎麼擴充。隔幾天不看筆記再講一次。

節奏建議：重帶關卡 2～20 先走完（COACHING 第 2 節估 5～7 天），再從 21 開始；一週一關，平日步驟 1、2，週末步驟 3、4，關末步驟 5。

## 6. 進度表（唯一的進度來源，每做完一小塊就改）

| 小塊 | 狀態 | PR | 日期 | 備註 |
| --- | --- | --- | --- | --- |
| 0 計畫、`scripts/setup.sh`、`scripts/doctor.*`、HANDOFF | 已合併 | #39 | 2026-10-22 | 本文件；公開 repo 前去個人化 |
| 21-A | 已合併 | #40 | 2026-10-22 |  |
| 21-B | 已合併 | #41 | 2026-10-22 |  |
| 21-C | 已合併 | #52 | 2026-10-22 | COACHING 關卡 21（Mac / VM 兩條路線）、PLAIN、LEARNING |
| 22-A | 已合併 | #42 | 2026-10-22 |  |
| 22-B | 已合併 | #43 | 2026-10-22 | SQLAlchemy 2.1 的 OTel 套件不支援，改掛 asyncpg |
| 22-C | 已合併 | #53 | 2026-10-22 | 文件在 LEARNING 關卡 22「開始前」第二段；和 22-D 同一個 PR。Grafana Cloud 帳號學習者自己開 |
| 22-D | 已合併 | #53 | 2026-10-22 | COACHING 關卡 22（Mac / VM）、PLAIN、LEARNING |
| 23-A | 已合併 | #44 | 2026-10-22 |  |
| 23-B | 已合併 | #45 | 2026-10-22 |  |
| 23-C | 已合併 | #54 | 2026-10-22 | COACHING 關卡 23（Mac 17 步 / VM 8 步）、PLAIN、LEARNING、RUNBOOK 第 2 節 |
| 24-A | 已合併 | #46 | 2026-10-22 | COACHING 關卡 0 的 register 行數已同步 |
| 24-B | 已合併 | #47 | 2026-10-22 |  |
| 24-C | 已合併 | #48 | 2026-10-22 | 線上會多一個背景 task，Render Logs 搜 published |
| 24-D | 已合併 | #55 | 2026-10-22 | COACHING 關卡 24（Mac / 本機不用 Docker / VM 三條路線）、PLAIN、LEARNING |
| 25-A | 已合併 | #49 | 2026-10-22 | v1；v2 的收尾在 #57（第 4 節加 COACHING 與 CHAIN 的指向） |
| 25-B | 已合併 | #56 | 2026-10-22 | CHAIN v2：環 8～11、附錄 A 加基礎設施的搬家列 |
| 25-C | 已合併 | #57 | 2026-10-22 | README 架構圖與「這個專案展示了什麼」、結構樹補關卡 21～24 的檔案；HANDOFF 第 0、2、6、9 節；ARCHITECTURE v2 收尾；本表關閉 |
| 25-D | 待做 | | | 選配；學習者想做再開一個對話（第 4 節的範本），要先在 Render 關 Auto-Deploy 改用 Deploy Hook |

**狀態（2026-10-22）：路線完成。** 0、21-A～25-C 全部合併；只剩 25-D 選配。之後這張表只在做 25-D 或修文件時動。

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

## 8. 免費方案查證表（本路線新增的，2026-10-22 查官方頁面）

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

**刻意不做的**（會碰到付費或超出範圍）：Terraform（要雲端帳號與 state）、線上的 Kubernetes 叢集、託管 Kafka、Helm（kustomize 夠用）、前端 Dockerfile（前端留在 Vercel）、ArgoCD。每一個在 `ARCHITECTURE.md` 寫成「下一步往哪擴」。
