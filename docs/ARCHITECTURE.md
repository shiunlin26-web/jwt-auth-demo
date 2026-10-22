# ARCHITECTURE.md：整條鏈的地圖

> 狀態：v2（2026-10-22；v1 在關卡 21～24 的程式做完時寫，v2 在教學文件與 CHAIN 環 8～11 寫完時收尾）。這一頁的目的：**十分鐘讓一個沒看過 repo 的人看懂整條鏈**，每一塊都有「怎麼證明它會動」。
> 每一塊的教學細節在 `LEARNING.md` 對應的關卡；怎麼親手跑在 `infra/README.md`；為什麼這樣排在 `PLAN-INFRA.md`。
> 第 6 節「60 秒說法」是給面試用的，每一格留給學習者用自己的話填。

## 0. 一句話

一個 JWT 登入範本，從瀏覽器到資料庫、從 push 到上線、從錯誤到指標與追蹤、從註冊到事件消費，**每一段都有 CI 證明它能跑**，而且全部免費方案。

## 1. 四條路徑

### 1.1 請求路徑：使用者按下「登入」之後

```
瀏覽器（React，Vercel）
   │  只打自己網域的 /api/*（同站，cookie 才帶得上）
   ▼
Vercel rewrites  ──/api/*──▶  Render（Docker 容器，backend/Dockerfile）
                                 │  FastAPI
                                 │   ├ middleware：request id、Cache-Control: no-store、指標、（追蹤）
                                 │   ├ /api/auth/login：bcrypt 驗密碼 → access token（JWT，回 body）
                                 │   │                  + refresh token（隨機字串、DB 存雜湊、HttpOnly cookie、Path=/api/auth）
                                 │   ├ /api/auth/refresh：輪替 + 重複使用偵測
                                 │   └ /api/me：Bearer access token
                                 ▼
                               Neon Postgres（user、refreshtoken、outboxevent、processedevent；Alembic 管 schema）
```

本機：Vite 的 `server.proxy` 做 Vercel rewrites 的事；`docker compose`（`infra/compose.yaml`）用同一個 image 起後端 + Postgres；Kubernetes（`infra/k8s/`）用同一個 image 起 2 個副本。

### 1.2 部署路徑：程式怎麼上線

```
git push 分支 ──▶ GitHub Actions
                   ci.yml    ruff、pyright、alembic check、pytest、Docker build + smoke、eslint、prettier、vitest、tsc + build
                   infra.yml compose、e2e（Playwright）、observability、k8s（kind）、messaging（Redpanda）   ← 只在 PR 跑
                      │ 全綠才能合併（branch protection）
                      ▼
                   main ──▶ Render Auto-Deploy（CI 綠才部署；容器啟動先 alembic upgrade head 再 uvicorn）
                        ──▶ Vercel（前端 build + 部署）
                   /api/health 的 version = 剛推的 commit、migration = 最新遷移編號 ← 部署後第一件事就是看這個
                   （選配 25-D）deploy.yml：CI 綠 → POST Render Deploy Hook → 等 version 對上才綠，Environments 分頁留紀錄
```

同一個 image 的三種跑法：Render（一個實例，遷移在啟動指令）、compose（本機整套）、Kubernetes（遷移是 Job，Deployment 2 副本零停機滾動更新、`rollout undo` 退版、壞 image 被 readiness 擋住）。

### 1.3 事件路徑：註冊之後要通知別人

```
POST /api/auth/register
   │  同一個交易：INSERT user + INSERT outboxevent（topic=user.registered）
   ▼
outbox worker（每 5 秒撿 published_at IS NULL，FOR UPDATE SKIP LOCKED）
   ├─ 有 KAFKA_BOOTSTRAP_SERVERS：送 Kafka（Redpanda），key = 事件 id      ← compose 的 messaging profile、CI
   └─ 沒有：印到 log                                                      ← Render（OUTBOX_WORKER=inline，背景 task）
   ▼
consumer：INSERT processedevent（主鍵 = 事件 id）→ 撞到就是重複，跳過 → 做事（這裡只記 log）→ commit offset
```

語意：at-least-once + 冪等消費。worker 送完才標記，標記前當掉就會再送；消費端靠主鍵擋第二次。

### 1.4 觀測路徑：壞了怎麼知道、慢在哪

```
每個請求 ──▶ 一行 JSON log（request_id、method、path、status、duration_ms、trace_id）──▶ Render Logs（搜 request_id）
         ──▶ 沒接住的例外 ──▶ log 有 traceback + Sentry 有 issue
         ──▶ http_requests_total / http_request_duration_seconds ──▶ /metrics ──▶ Prometheus 抓 ──▶ Grafana 儀表板（進 git）
         ──▶ span（HTTP + 每句 SQL，帶 X-Request-ID）──▶ OTLP ──▶ collector（本機印 log）/ Grafana Cloud（選配）
/api/ping = 活著嗎（Render health check）；/api/health = 能服務嗎（db、migration、version）
```

三種訊號怎麼分工：log 找「這一個請求」、指標看「趨勢與比例」、追蹤看「這一個請求花在哪」；request_id 和 trace_id 讓三者互相找得到。

## 2. 每一塊：在哪跑、怎麼證明、怎麼擴充、要多少錢、換棧對照

| 區塊 | 這裡用什麼 | 在哪跑 | 怎麼證明它會動 | 怎麼擴充 | 費用 | 換技術棧對照 |
| --- | --- | --- | --- | --- | --- | --- |
| 前端 | React 19、Vite、Router、Zustand、TanStack Query、RHF + Zod、Tailwind | Vercel | `ci.yml` frontend job；`infra.yml` e2e job（Playwright 走註冊→登入→重整→登出） | 加頁面與 query、加 E2E 條數 | 免費 | Next.js / Vue / Svelte：守門員、伺服器狀態、代理的概念一樣 |
| 後端 | FastAPI、SQLModel、Alembic、slowapi | Render（Docker） | `ci.yml` backend job（ruff、pyright、pytest 64 個、alembic check、Docker smoke） | 新 route 另開檔案掛進 `/api`；改 `models.py` 一定產遷移 | 免費（冷啟動） | Express / NestJS / Spring / Go：middleware、DI、遷移工具對應 |
| 資料庫 | Neon Postgres | Neon | `/api/health` 的 `db`、`migration`；關卡 18 的索引與鎖實驗 | 加表都掛 `user_id`；刪欄位分兩次部署 | 免費 | RDS / Cloud SQL / Supabase；遷移：Prisma、Flyway |
| 登入 | access JWT 記憶體 + refresh cookie 輪替 | 後端 | pytest 的 refresh 輪替、重用偵測、改密碼後全部失效 | OAuth 登入另加 provider，token 設計不變 | 免費 | 任何語言：bcrypt / argon2 + JWT 函式庫 |
| CI | GitHub Actions 兩個 workflow | GitHub | Actions 分頁全綠；壞的 PR 合不進去 | 新基礎設施就加一個 job | 公開 repo 免費 | GitLab CI、CircleCI：job → steps → service 一樣 |
| CD | Render Auto-Deploy after CI、Vercel Git 整合 | Render、Vercel | `/api/health` 的 `version` 對得上 commit | Deploy Hook + GitHub Environments（25-D）；GitOps（Argo CD） | 免費 | Fly.io、Cloud Run、ECS：都吃 Dockerfile + `PORT` |
| 容器 | multi-stage Dockerfile、非 root、uv | 到處 | `ci.yml` Docker build/run/smoke | 加 worker 的 image 就是同一個，換 command | 免費 | Node：`node:22-slim`；Go：distroless |
| 本機整套 | docker compose + profiles | Mac | `infra.yml` compose job | 加 profile 加服務 | 免費 | 同 |
| Kubernetes | kustomize base + overlay、Job 遷移、Deployment 2 副本、probes、preStop | kind（CI、Mac） | `infra.yml` k8s job：rollout、零停機 80 次全 200、undo、壞 image 被擋 | overlay 加 prod：registry image、Ingress + TLS、HPA、PDB；Helm / Argo CD | 線上叢集要錢（GKE / EKS 每月幾十美元起） | 概念跨雲一樣 |
| 指標 | prometheus_client、Prometheus、Grafana | compose（CI、Mac） | `infra.yml` observability job：Prometheus 有數字、Grafana 儀表板存在且查得到 | 加告警 rule；k8s 用 service discovery | 免費；Grafana Cloud 免費方案 | Datadog、CloudWatch：概念同 |
| 追蹤 | OpenTelemetry（FastAPI + asyncpg）、OTLP、collector | compose（CI、Mac）；Grafana Cloud 選配 | observability job 的「追蹤」那步：HTTP span、SQL 子 span、request id、log 有 trace_id | collector 換 exporter 就接任何後端；前端也能送 | 免費 | OTel 本來就跨語言跨廠商 |
| 錯誤與 log | JSON log + request id、Sentry | Render | `/api/_boom` 演練：log 有 traceback、Sentry 收到 | log 收到 Loki / CloudWatch | 免費 | pino / slog + Sentry SDK |
| 訊息 | transactional outbox、aiokafka、Redpanda、冪等 consumer | compose（CI、Mac）；Render 用 inline + log | `infra.yml` messaging job：published → consumed → 重送是 duplicate | 事件多種 topic；consumer 拆成獨立服務；託管 Kafka（Confluent、MSK） | 自己跑免費；託管 Kafka 要錢 | RabbitMQ / SQS / Pub/Sub：outbox 與冪等的做法一樣 |
| 維運 | RUNBOOK（退版、roll forward、換密鑰、備份）、DEBUGGING、drills | 文件 | 關卡 20 的故障演練 | 每踩一個坑加一條 | 免費 | 跟語言無關 |

## 3. 哪些東西刻意不做（下一步往哪擴）

| 沒做 | 為什麼 | 要做時從哪開始 |
| --- | --- | --- |
| Terraform | 要雲端帳號與 state，免費方案容易踩到付費 | `render.yaml`、`infra/k8s/` 已經是「設定進 git」的做法；Terraform 是同一個概念管雲端資源 |
| 線上 Kubernetes 叢集 | 沒有免費的；Render 夠用 | `infra/k8s/overlays/` 加 prod overlay，image 推 GHCR，Ingress + cert-manager |
| 託管 Kafka | 沒有免費方案 | 程式只改 `KAFKA_BOOTSTRAP_SERVERS` 與認證的環境變數 |
| Helm、Argo CD | kustomize 夠用；GitOps 是下一階段 | 把 `kubectl apply -k` 交給 Argo CD 看 repo 自動 sync |
| HPA、PDB、Ingress | 不在一台 kind 上示範 | `infra/k8s/base/` 加三個檔案 |
| 告警 | 儀表板已有「5xx 比例」查詢 | Grafana alert rule 用同一條查詢 |
| Tempo / Loki | collector 印 log 已能看 span | collector 的 exporter 改成 otlphttp 送到 Tempo；log 收到 Loki |
| 前端 Dockerfile | 前端留在 Vercel | 要進叢集時 `nginx:alpine` 放 `dist/` |

## 4. 怎麼看這個 repo（十分鐘路線）

1. `README.md` 的結構樹，知道東西在哪。
2. 這一頁第 1 節的四張圖。
3. Actions 分頁挑一個綠的 run，點 `infra.yml` 的 `k8s` 與 `messaging` job，看 log 裡的 ✅ 行：那就是第 2 節「怎麼證明」。
4. `infra/README.md` 照著在有 Docker 的機器跑一遍 compose。
5. 想知道為什麼這樣設計：`docs/LEARNING.md` 對應關卡、`docs/QA.md`。
6. 要有人帶著一步一步跑（一次一個指令、預期值、講什麼）：`docs/COACHING.md` 關卡 21～24，每關都有 Mac 路線與看 CI log 的 VM 路線。
7. 要在自己的專案重做一遍：`docs/CHAIN.md` 環 8～11，跟技術棧無關。

## 5. 一個請求經過哪些檔案（接 `TOUR.md`）

`frontend/src/api/client.ts`（axios、自動 refresh）→ `vite.config.ts` / `vercel.json`（代理）→ `backend/main.py`（middleware、`/api`）→ `routes/auth.py`（登入、refresh、註冊 + outbox）→ `security.py`（bcrypt、JWT）→ `models.py` / `migrations/`（資料表）→ `metrics.py`、`tracing.py`、`outbox.py`（指標、追蹤、事件）。基礎設施：`backend/Dockerfile` → `infra/compose.yaml` → `infra/k8s/` → `.github/workflows/`。

## 6. 面試 60 秒說法（學習者自己填）

每一格三句：**解決什麼問題、怎麼證明它會動、下一步怎麼擴**。先用自己的話寫，隔幾天不看筆記再講一次。

| 關卡 | 60 秒說法 |
| --- | --- |
| 登入（0～8） | |
| Docker 與 CI（9） | |
| 部署同站（10） | |
| 維護（11） | |
| compose 與 E2E（21） | |
| 指標與追蹤（22） | |
| Kubernetes（23） | |
| outbox 與 Kafka（24） | |

範例（不要照抄，用自己的話）：「註冊成功要通知別的系統，我不在請求裡直接送，而是把事件和使用者寫進同一個交易，再由 worker 送到 Kafka；CI 裡有一個 job 註冊一個帳號、看 consumer 收到，再把同一筆重送一次證明 consumer 是冪等的；下一步是把 consumer 拆成獨立服務、接託管 Kafka。」
