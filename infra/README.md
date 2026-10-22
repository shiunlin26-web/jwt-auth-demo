# infra/：基礎設施（關卡 21 起）

這裡放的是「同一個後端 image 在不同地方怎麼跑」的描述檔，線上（Render）用不到，**搬登入模板時可以不搬**。
計畫、小塊清單與進度在 [`../docs/PLAN-INFRA.md`](../docs/PLAN-INFRA.md)；每個檔案開頭有中文註解說為什麼。

| 檔案 | 關卡 | 做什麼 | CI 的證明 |
| --- | --- | --- | --- |
| `compose.yaml` | 21 | 一個指令起 Postgres + 後端（本機要有 Docker） | `.github/workflows/infra.yml` 的 `compose` job |
| `../frontend/e2e/`、`../frontend/playwright.config.ts` | 21 | Playwright E2E：真的瀏覽器走「註冊 → 登入 → 重新整理 → 登出」，後端用 compose 起 | `infra.yml` 的 `e2e` job（報告在 artifact `playwright-report`） |
| `prometheus/`、`grafana/` | 22 | `--profile observability` 多起 Prometheus（抓 `backend:8000/metrics`）與 Grafana（資料來源、儀表板都從檔案載入） | `infra.yml` 的 `observability` job |
| `otel/` | 22 | OpenTelemetry Collector：收後端送來的追蹤 span，印到 log（後端要設 `OTEL_EXPORTER_OTLP_ENDPOINT` 才會送） | 同上 job 的「追蹤」那步 |
| `k8s/` | 23 | Kubernetes 清單：`base/`（ConfigMap、遷移 Job、Deployment 2 副本與探針、Service）、`overlays/ci/`（kind 用的 image tag）、`ci/postgres.yaml`（只給 CI 與本機 kind 的資料庫） | `infra.yml` 的 `k8s` job（kind 開叢集 → 載入 image → apply → smoke test → 滾動更新時連續打 Service 數失敗次數 → `rollout undo` → 壞 image 被擋住、舊 pod 繼續服務） |
| `compose.yaml` 的 `messaging` profile | 24 | Redpanda（Kafka 相容）+ topic 初始化 + outbox worker（`backend/worker.py`）+ consumer（`backend/consumer.py`） | `infra.yml` 的 `messaging` job（註冊 → published → consumed → 同一筆再送是 duplicate） |

本機（有 Docker 的那台）：

```bash
docker compose -f infra/compose.yaml up -d --build --wait
curl http://localhost:8000/api/health
docker compose -f infra/compose.yaml logs backend
docker compose -f infra/compose.yaml down -v
```

E2E（後端起來之後，在 `frontend/`）：`npm run test:e2e`，想一步一步看瀏覽器就 `npx playwright test --ui`。

指標：`docker compose -f infra/compose.yaml --profile observability up -d --build --wait`，然後開 <http://localhost:9090>（Prometheus）和 <http://localhost:3000>（Grafana，不用登入）。

追蹤：同一行前面加 `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`，打幾個 API 後 `docker compose -f infra/compose.yaml --profile observability logs otel-collector` 看 span。

訊息：`docker compose -f infra/compose.yaml --profile messaging up -d --build --wait`，前端註冊一個帳號，然後 `docker compose -f infra/compose.yaml --profile messaging logs worker consumer` 看 `published` 與 `consumed`；`docker compose -f infra/compose.yaml exec redpanda rpk topic consume user.registered -o start` 看 Kafka 裡的訊息長什麼樣。

Kubernetes（`brew install kind kubectl`，照 `infra.yml` 的 `k8s` job 一步一步做）：

```bash
docker build -t jwt-backend:ci ./backend
kind create cluster --name jwt && kind load docker-image jwt-backend:ci --name jwt
kubectl apply -f infra/k8s/base/namespace.yaml && kubectl -n jwt-auth-demo apply -f infra/k8s/ci/postgres.yaml
kubectl -n jwt-auth-demo create secret generic backend-secret --from-literal=DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/jwtdemo --from-literal=JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
kubectl apply -k infra/k8s/overlays/ci && kubectl -n jwt-auth-demo rollout status deployment/backend
kubectl -n jwt-auth-demo port-forward service/backend 8080:80   # 另一個視窗 curl http://localhost:8080/api/health
kubectl -n jwt-auth-demo set image deployment/backend backend=jwt-backend:v2   # 換版（先 docker tag + kind load）；rollout status / history / undo 看 infra.yml 的 k8s job
kind delete cluster --name jwt                                    # 玩完整個叢集刪掉
```

沒有 Docker 的機器：開 Actions 分頁的 Infra workflow，看同名 job 的每一步 log。
