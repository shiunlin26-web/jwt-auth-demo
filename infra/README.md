# infra/：基礎設施（關卡 21 起）

這裡放的是「同一個後端 image 在不同地方怎麼跑」的描述檔，線上（Render）用不到，**搬登入模板時可以不搬**。
計畫、小塊清單與進度在 [`../docs/PLAN-INFRA.md`](../docs/PLAN-INFRA.md)；每個檔案開頭有中文註解說為什麼。

| 檔案 | 關卡 | 做什麼 | CI 的證明 |
| --- | --- | --- | --- |
| `compose.yaml` | 21 | 一個指令起 Postgres + 後端（本機要有 Docker） | `.github/workflows/infra.yml` 的 `compose` job |

本機（有 Docker 的那台）：

```bash
docker compose -f infra/compose.yaml up -d --build --wait
curl http://localhost:8000/api/health
docker compose -f infra/compose.yaml logs backend
docker compose -f infra/compose.yaml down -v
```

沒有 Docker 的機器：開 Actions 分頁的 Infra workflow，看同名 job 的每一步 log。
