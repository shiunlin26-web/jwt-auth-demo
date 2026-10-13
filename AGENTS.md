# AGENTS.md：給 AI 工具看的專案說明

> 任何 AI 工具（Claude、Cursor、Codex……）在這個 repo 工作前先讀這份。`CLAUDE.md` 只是指向這裡。
> 人也可以看，它同時是「這個專案的規矩」。

## 這個專案是什麼

JWT 登入的教學範本：FastAPI 後端 + React 前端 + Neon Postgres，已部署在 Render（後端）與 Vercel（前端）。
它的用途是**被複製到其他專案當登入模板**，所以每個檔案都有中文註解說明「為什麼這樣寫」。

- 學習路線與每一關的說明：`docs/LEARNING.md`
- 照「一個請求怎麼跑」讀程式：`docs/TOUR.md`
- 壞掉時查：`docs/DEBUGGING.md`；維運流程：`docs/RUNBOOK.md`
- 20 天計畫：`docs/PLAN.md`

## 結構

```
backend/            FastAPI。入口 main.py，設定 config.py，資料表 models.py，遷移 migrations/
  routes/           auth.py（註冊、登入、refresh、登出、改密碼）、users.py（/me）
  tests/            pytest，需要 TEST_DATABASE_URL
frontend/src/       React + Vite。api/（axios）、auth/（Zustand store、守門員）、pages/、components/
.github/workflows/  CI：ruff、alembic check、pytest、Docker build/run/smoke、前端 lint/build
render.yaml         Render 後端設定；frontend/vercel.json：Vercel 轉發 /api 到 Render
```

所有 API 都在 `/api` 底下。前端只打自己網域的 `/api`，本機由 Vite 代理、正式由 Vercel 代理，**不要**讓前端直接打後端網址（會跨站，cookie 失效）。

## 常用指令

```bash
# 後端（在 backend/，不用啟用 venv）
uv sync                        # 安裝套件
uv run uvicorn main:app --reload --port 8000
uv run pytest -q               # 測試（會清空 TEST_DATABASE_URL 的資料表）
uv run ruff check --fix .      # lint
uv run alembic upgrade head    # 套用遷移
uv run alembic revision --autogenerate --rev-id 000X -m "說明"   # 改完 models.py 後產生遷移
uv run alembic check           # models.py 和遷移檔是否一致

# 前端（在 frontend/）
npm ci && npm run dev
npm run lint && npm run build
```

## 慣例

- **一關一個 commit**，commit 訊息用中文、開頭標關卡（例：`關卡 11：維護。...`）。文件類用 `docs：`、修正用 `修正：`。
- 程式裡的註解用中文，說「為什麼」不說「做什麼」；新加的東西標 `【關卡 N】`。
- 改了 `models.py` **一定**要產生遷移檔；不手改既有的遷移檔；不用 `create_all`。
- 改了 `pyproject.toml` 要跑 `uv sync` 並把 `uv.lock` 一起 commit；改了 `package.json` 要把 `package-lock.json` 一起 commit。
- 推之前本機跑：`uv run ruff check .`、`uv run pytest -q`、`npm run lint`、`npm run build`。
- `.env` 永遠不進 git；密鑰只放平台的環境變數。

## AI 在練習專案裡的規則（也適用這裡）

1. **只做被要求的事**。做完列出「我注意到但你沒要求、所以我沒做」的清單，只列不做。
2. 不要為了讓測試過而改測試或跳過測試；不要用 `--no-verify`、空 commit 之類的手段繞過檢查。
3. 不確定就先問，不要猜一個做法做下去。
4. 修 bug 時先說明根本原因，再改。

## 不要碰

- `backend/migrations/versions/` 裡已存在的檔案
- `.env`、任何含密鑰的東西
- `docs/LEARNING.md` 已完成關卡的內容（那是歷史紀錄；要補充就加註記，不要改寫）
