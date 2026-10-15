<#
【工具】乾淨的 Windows 機器一鍵建置

用途：學習者的電腦每次開機都是乾淨的系統，每次都要從頭裝工具、拉專案、裝套件、填 .env。
這個腳本把整個流程壓成一個指令，三到五分鐘跑完。

第一次（機器上還沒有 repo）：先用任何方式拿到 git（winget、官網安裝程式都可以），然後
    git clone https://github.com/shiunlin26-web/jwt-auth-demo.git $HOME\jwt-auth-demo
    & $HOME\jwt-auth-demo\scripts\setup.ps1
（git clone 會跳出瀏覽器登入 GitHub 一次，因為 repo 是私有的）

之後每次開機只要：
    & $HOME\jwt-auth-demo\scripts\setup.ps1

做的事（已經有的會跳過）：
  1. 裝 git、Node.js（.nvmrc 的大版號）、uv。有 winget 用 winget，沒有就直接從官網下載 zip，不需要管理員權限
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

# Neon 後台複製出來的是 psycopg 格式，asyncpg 要改三個地方（README 第 1 節）。貼原始格式也會被轉對
function Convert-NeonUrl($url) {
    $url = $url.Trim()
    if ($url -eq "") { return $url }
    $url = $url -replace "^postgresql://", "postgresql+asyncpg://"
    $url = $url -replace "^postgres://", "postgresql+asyncpg://"
    $url = $url -replace "sslmode=require", "ssl=require"
    $url = $url -replace "[&?]channel_binding=require", ""
    return $url
}
function Has($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# 讓這個 PowerShell 視窗立刻看得到剛裝好的工具（不用重開終端機，DEBUGGING.md 第一條的坑）
function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User") + ";" +
                "$HOME\.local\bin"
}

# ---------- 1. 工具 ----------
# 有 winget 就用 winget；沒有（精簡的 VM 常常沒有）就直接從官網下載 zip 解到 $HOME\.local，不需要管理員權限
$LocalBin = "$HOME\.local"
New-Item -ItemType Directory -Force -Path $LocalBin | Out-Null

function Add-SessionPath($dir) {
    if (-not ($env:Path -split ";" | Where-Object { $_ -eq $dir })) { $env:Path = "$dir;$env:Path" }
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (-not ($userPath -split ";" | Where-Object { $_ -eq $dir })) {
        [System.Environment]::SetEnvironmentVariable("Path", "$dir;$userPath", "User")
    }
}

function Install-Git {
    if (Has winget) {
        winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
        Refresh-Path
        return
    }
    # MinGit：Git for Windows 的精簡 zip 版，不用安裝程式
    $rel = Invoke-RestMethod "https://api.github.com/repos/git-for-windows/git/releases/latest"
    $asset = $rel.assets | Where-Object { $_.name -like "MinGit-*-64-bit.zip" -and $_.name -notlike "*busybox*" } | Select-Object -First 1
    $zip = "$env:TEMP\mingit.zip"
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip
    Expand-Archive $zip "$LocalBin\git" -Force
    Add-SessionPath "$LocalBin\git\cmd"
}

function Install-Node {
    # 版本照 frontend/.nvmrc 的大版號（22）抓最新的 22.x
    $major = (Get-Content "$RepoRoot\frontend\.nvmrc").Trim()
    if (Has winget) {
        winget install --id "OpenJS.NodeJS.$major" -e --accept-source-agreements --accept-package-agreements
        Refresh-Path
        if (Has node) { return }
    }
    $index = Invoke-RestMethod "https://nodejs.org/dist/index.json"
    $ver = ($index | Where-Object { $_.version -like "v$major.*" } | Select-Object -First 1).version
    $zip = "$env:TEMP\node.zip"
    Invoke-WebRequest "https://nodejs.org/dist/$ver/node-$ver-win-x64.zip" -OutFile $zip
    if (Test-Path "$LocalBin\node") { Remove-Item "$LocalBin\node" -Recurse -Force }
    Expand-Archive $zip $LocalBin -Force
    Rename-Item "$LocalBin\node-$ver-win-x64" "node"
    Add-SessionPath "$LocalBin\node"
}

function Install-Uv {
    # uv 的官方安裝腳本本來就不用 winget，裝到 $HOME\.local\bin
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    Add-SessionPath "$LocalBin\bin"
    Refresh-Path
}

Step "檢查工具"
if (-not (Has git))  { Step "安裝 git";  Install-Git }
if (-not (Has node)) { Step "安裝 Node.js（照 .nvmrc 的大版號）"; Install-Node }
if (-not (Has uv))   { Step "安裝 uv";   Install-Uv }
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
        Step "backend：建立 .env（兩個連線字串到 Neon 後台複製，原始格式貼上即可；JWT_SECRET 自動產生）"
        $db = Convert-NeonUrl (Read-Host "DATABASE_URL（Neon 的連線字串，直接貼）")
        $testDb = Convert-NeonUrl (Read-Host "TEST_DATABASE_URL（測試資料庫，不能和上面相同；留空就不設）")
        if ($db -eq $testDb) { throw "TEST_DATABASE_URL 不能和 DATABASE_URL 相同（測試會清空資料表）。重跑一次。" }
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
