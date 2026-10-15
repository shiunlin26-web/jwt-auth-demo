<#
【工具】乾淨的 Windows 機器一鍵建置

用途：學習者的電腦每次開機都是乾淨的系統，每次都要從頭裝工具、拉專案、裝套件、填 .env。
這個腳本把整個流程壓成一個指令，三到五分鐘跑完。

第一次（機器上還沒有 git、也沒有 repo）在 PowerShell 貼這三行：
    winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
    git clone https://github.com/shiunlin26-web/jwt-auth-demo.git $HOME\jwt-auth-demo
    & $HOME\jwt-auth-demo\scripts\setup.ps1
（git clone 會跳出瀏覽器登入 GitHub 一次，因為 repo 是私有的）

之後每次開機只要：
    & $HOME\jwt-auth-demo\scripts\setup.ps1

做的事（已經有的會跳過）：
  1. 裝 git、Node.js LTS（winget）、uv（官方安裝腳本）
  2. git pull 最新 main
  3. 設定 git 的 user.name / user.email（沒有的話會問你）
  4. backend：uv sync、建立 .env（問你 Neon 的兩個連線字串，JWT_SECRET 自動產生）、alembic upgrade head
  5. frontend：npm ci
  6. 跑一次 pytest 和 vitest 當基準線（-SkipTests 可以跳過）

參數：
  -EnvFile <路徑>   不用手打連線字串，從一個檔案（例如 USB 上的 jwt.env）複製成 backend/.env
  -SkipTests        跳過最後的測試
#>
param(
    [string]$EnvFile = "",
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Has($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# 讓這個 PowerShell 視窗立刻看得到剛裝好的工具（不用重開終端機，DEBUGGING.md 第一條的坑）
function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User") + ";" +
                "$HOME\.local\bin"
}

# ---------- 1. 工具 ----------
Step "檢查工具"
if (-not (Has winget)) { throw "找不到 winget（Windows 10 1709 以上內建）。請先到 Microsoft Store 更新「應用程式安裝程式」。" }

if (-not (Has git)) {
    Step "安裝 git"
    winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
    Refresh-Path
}
if (-not (Has node)) {
    Step "安裝 Node.js LTS（專案需要 22.22 以上）"
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
    Refresh-Path
}
if (-not (Has uv)) {
    Step "安裝 uv"
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    Refresh-Path
}
Write-Host ("git  " + (git --version))
Write-Host ("node " + (node --version))
Write-Host ("uv   " + (uv --version))

# ---------- 2. 最新程式 ----------
Step "git pull"
git pull --ff-only origin main

# ---------- 3. git 身分（乾淨機器每次都沒有，沒設 commit 會失敗） ----------
if (-not (git config user.name)) {
    $name = Read-Host "git 的 user.name（commit 上顯示的名字）"
    git config --global user.name $name
}
if (-not (git config user.email)) {
    $mail = Read-Host "git 的 user.email（和 GitHub 帳號一樣）"
    git config --global user.email $mail
}

# ---------- 4. 後端 ----------
Step "backend：uv sync"
Set-Location "$RepoRoot\backend"
uv sync

if (-not (Test-Path ".env")) {
    if ($EnvFile -ne "" -and (Test-Path $EnvFile)) {
        Step "backend：從 $EnvFile 複製 .env"
        Copy-Item $EnvFile ".env"
    } else {
        Step "backend：建立 .env（兩個連線字串到 Neon 後台複製；JWT_SECRET 自動產生）"
        $db = Read-Host "DATABASE_URL（postgresql+asyncpg://...?ssl=require）"
        $testDb = Read-Host "TEST_DATABASE_URL（測試資料庫，不能和上面相同；留空就不設）"
        $secret = (uv run python -c "import secrets; print(secrets.token_urlsafe(32))")
        $lines = @(
            "DATABASE_URL=$db",
            "JWT_SECRET=$secret",
            "COOKIE_SECURE=false"
        )
        if ($testDb -ne "") { $lines += "TEST_DATABASE_URL=$testDb" }
        Set-Content -Path ".env" -Value $lines -Encoding ascii
        Write-Host "已寫入 backend\.env（JWT_SECRET 每次重建都不一樣，只影響本機的 token，沒關係）"
    }
} else {
    Write-Host "backend\.env 已存在，不動它"
}

Step "backend：alembic upgrade head"
uv run alembic upgrade head

# ---------- 5. 前端 ----------
Step "frontend：npm ci"
Set-Location "$RepoRoot\frontend"
npm ci

# ---------- 6. 基準線 ----------
if (-not $SkipTests) {
    Step "基準線：pytest"
    Set-Location "$RepoRoot\backend"
    uv run pytest -q
    Step "基準線：vitest"
    Set-Location "$RepoRoot\frontend"
    npm test
}

Set-Location $RepoRoot
Write-Host @"

==> 完成。接下來兩個終端機各開一個：
    cd backend;  uv run uvicorn main:app --reload --port 8000
    cd frontend; npm run dev
    瀏覽器開 http://localhost:5173
"@ -ForegroundColor Green
