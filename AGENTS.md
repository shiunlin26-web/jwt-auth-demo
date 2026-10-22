# AGENTS.md：給 AI 工具看的專案說明

> 任何 AI 工具（Claude、Cursor、Codex……）在這個 repo 工作前先讀這份。`CLAUDE.md` 只是指向這裡。
> 人也可以看，它同時是「這個專案的規矩」。

## 這個專案是什麼

JWT 登入的教學範本：FastAPI 後端 + React 前端 + Neon Postgres，已部署在 Render（後端）與 Vercel（前端）。
它的用途是**被複製到其他專案當登入模板**，所以每個檔案都有中文註解說明「為什麼這樣寫」。

- **要帶學習者（不只是改程式）→ 先讀 `docs/HANDOFF.md`**：學習者是誰、走到哪、一關的固定格式、已經定了的事
- **帶做的方法與每關腳本：`docs/COACHING.md`**。預設用「一次一個指令、他貼輸出、從輸出講」的方式帶，不要丟整關給他讀
- 學習路線與每一關的說明：`docs/LEARNING.md`；每關的白話版（給學習者先看）：`docs/PLAIN.md`
- 照「一個請求怎麼跑」讀程式：`docs/TOUR.md`
- 開練習專案、搬登入模板：`docs/CHAIN.md`（七環任務書 + 選做的環 8～11 + 搬家清單）
- 壞掉時查：`docs/DEBUGGING.md`；維運流程：`docs/RUNBOOK.md`；觀念問答：`docs/QA.md`
- 20 天計畫（設計理由，時程已過期）：`docs/PLAN.md`
- 基礎設施路線（關卡 21～25：compose、E2E、指標與追蹤、Kubernetes、訊息佇列、架構地圖）：`docs/PLAN-INFRA.md`。做任何一小塊前讀它的第 2 節與那一小塊的段落，**不要讀 `LEARNING.md` 全文**
- 整條鏈的地圖（四條路徑、每塊怎麼證明）：`docs/ARCHITECTURE.md`；基礎設施怎麼親手跑：`infra/README.md`

## 結構

```
backend/            FastAPI。入口 main.py，設定 config.py，資料表 models.py，遷移 migrations/
  routes/           auth.py（註冊、登入、refresh、登出、改密碼）、users.py（/me）
  tests/            pytest，需要 TEST_DATABASE_URL
frontend/src/       React + Vite。api/（axios、TanStack Query 快取）、auth/（Zustand store、useMe、守門員）、pages/、components/（含 ui.tsx）、schemas/（Zod）
  test/             Vitest 的 setup 與 MSW 假後端；測試檔放在被測檔案旁邊（*.test.ts、*.test.tsx）
.github/workflows/  ci.yml：後端 ruff（lint + format）、pyright、alembic check、pytest、Docker build/run/smoke；前端 eslint、prettier、vitest、tsc + build
                    infra.yml（只在 PR 跑）：compose、e2e（Playwright）、observability（Prometheus / Grafana / OTel）、k8s（kind）、messaging（Redpanda）
infra/              關卡 21～24 的基礎設施：compose.yaml（profiles：observability、messaging）、k8s/（kustomize）、prometheus/、grafana/、otel/。搬登入模板可以不搬
backend/            另有 metrics.py（/metrics）、tracing.py（OpenTelemetry）、outbox.py + worker.py + consumer.py（transactional outbox、Kafka）
render.yaml         Render 後端設定；frontend/vercel.json：Vercel 轉發 /api 到 Render
```

所有 API 都在 `/api` 底下。前端只打自己網域的 `/api`，本機由 Vite 代理、正式由 Vercel 代理，**不要**讓前端直接打後端網址（會跨站，cookie 失效）。

## 常用指令

```bash
# 乾淨機器一鍵建置（Windows PowerShell，在 repo 根目錄；學習者的電腦每次開機都是乾淨的）
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -SkipTests   # 裝工具、git pull、uv sync、.env、alembic、npm ci；拿掉 -SkipTests 會跑測試
bash scripts/setup.sh --skip-tests      # Mac 版（晚上與週末那台，有 Docker），做的事一樣
bash scripts/doctor.sh                  # 或 scripts\doctor.ps1：這台能做哪幾關（有沒有 Docker、kind）

# 後端（在 backend/，不用啟用 venv）
uv sync                        # 安裝套件
uv run uvicorn main:app --reload --port 8000
uv run pytest -q               # 測試（會清空 TEST_DATABASE_URL 的資料表）
uv run ruff check --fix .      # lint
uv run ruff format .           # 格式化（CI 會檢查）
uv run pyright                 # 型別檢查（CI 會檢查）
uv run alembic upgrade head    # 套用遷移
uv run alembic revision --autogenerate --rev-id 000X -m "說明"   # 改完 models.py 後產生遷移
uv run alembic check           # models.py 和遷移檔是否一致

# 前端（在 frontend/）
npm ci && npm run dev
npm run format && npm run lint && npm run typecheck && npm test && npm run build
```

## 慣例

- **一關一個 commit**，commit 訊息用中文、開頭標關卡（例：`關卡 11：維護。...`）。文件類用 `docs：`、修正用 `修正：`。
- 程式裡的註解用中文，說「為什麼」不說「做什麼」；新加的東西標 `【關卡 N】`。
- 改了 `models.py` **一定**要產生遷移檔；不手改既有的遷移檔；不用 `create_all`。
- 改了 `pyproject.toml` 要跑 `uv sync` 並把 `uv.lock` 一起 commit；改了 `package.json` 要把 `package-lock.json` 一起 commit。
- 推之前本機跑：`uv run ruff format .`、`uv run ruff check .`、`uv run pyright`、`uv run pytest -q`、`npm run format`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。
- `.env` 永遠不進 git；密鑰只放平台的環境變數。
- **架構與程式碼以現代開發的專業水準為準**。這是教學模板，但教學註解是加在專業程式碼上，不是降低標準的理由：型別檢查、格式化、lint、測試、CI 全綠才合併；安全與效能細節照正式專案做。
- **會碰到付費門檻的事，動手前先說**。部署平台的設定、第三方服務的方案，只要可能跳出付費頁，先告訴學習者「這步可能要錢，免費替代是＿＿」，由他決定。已知邊界列在 `docs/HANDOFF.md` 第 5 節第 11 條。

## AI 在練習專案裡的規則（也適用這裡）

1. **只做被要求的事**。做完列出「我注意到但你沒要求、所以我沒做」的清單，只列不做。
2. 不要為了讓測試過而改測試或跳過測試；不要用 `--no-verify`、空 commit 之類的手段繞過檢查。
3. 不確定就先問，不要猜一個做法做下去。
4. 修 bug 時先說明根本原因，再改。

## 不要碰

- `backend/migrations/versions/` 裡已存在的檔案
- `.env`、任何含密鑰的東西
- `docs/LEARNING.md` 已完成關卡的內容（那是歷史紀錄；要補充就加註記，不要改寫）
