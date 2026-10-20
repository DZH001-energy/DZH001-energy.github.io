# ============================================================
#  publish.ps1 — 把本地改动发布到公网
#  由 publish.bat 调用；也可直接运行：powershell -File publish.ps1
# ============================================================
$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
Set-Location -Path $PSScriptRoot

# --- 全局异常兜底：任何未预期错误都给出可读提示并停住窗口 ---
trap {
    Write-Host ""
    Write-Host "[X] 发生未预期的错误，已停止。" -ForegroundColor Red
    Write-Host ("    " + $_.Exception.Message) -ForegroundColor Red
    Write-Host ("    位置: " + $_.InvocationInfo.PositionMessage) -ForegroundColor DarkGray
    Read-Host "按回车退出" | Out-Null
    exit 1
}


# ---------------------------------------------------------------
#  定位 git：PATH -> 常见安装位置 -> WorkBuddy 自带 PortableGit
#  （双击 .bat 启动的进程通常没有 git 环境，必须显式查找）
# ---------------------------------------------------------------

function Enable-GitAuth {
    $dir = Join-Path $env:TEMP "zdsite-askpass"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Copy-Item (Join-Path $PSScriptRoot "askpass.cmd") (Join-Path $dir "askpass.cmd") -Force
    Copy-Item (Join-Path $PSScriptRoot "get-token.ps1") (Join-Path $dir "get-token.ps1") -Force
    $env:ZD_TOKEN_FILE = Join-Path $PSScriptRoot "github_token.txt"
    $env:GIT_ASKPASS = Join-Path $dir "askpass.cmd"
    $env:GIT_TERMINAL_PROMPT = "0"
}

function Get-GitExe {
    $c = Get-Command git.exe -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    $cands = New-Object System.Collections.ArrayList
    foreach ($p in @("$env:ProgramFiles\Git\cmd\git.exe",
                     "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
                     "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe")) {
        [void]$cands.Add($p)
    }
    $base = "$env:USERPROFILE\.workbuddy\binaries\PortableGit\versions"
    if (Test-Path $base) {
        foreach ($v in (Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending)) {
            [void]$cands.Add((Join-Path $v.FullName "cmd\git.exe"))
            [void]$cands.Add((Join-Path $v.FullName "mingw64\bin\git.exe"))
        }
    }
    foreach ($c2 in $cands) { if ($c2 -and (Test-Path $c2)) { return $c2 } }
    return $null
}

function Say($m, $c = "Gray") { Write-Host $m -ForegroundColor $c }
function Die($m) { Say "[X] $m" "Red"; Read-Host "按回车退出" | Out-Null; exit 1 }

Say "================================================" "Cyan"
Say "  发布个人主页到公网" "Cyan"
Say "================================================" "Cyan"
Say ""

$git = Get-GitExe
if (-not $git) {
    Die "没有找到 git。请先安装 Git for Windows: https://git-scm.com/download/win"
}

# 远程仓库检查
$remote = & $git remote get-url origin 2>$null
if (-not $remote) {
    Say "[X] 还没有配置远程仓库。" "Red"
    Say ""
    Say "请先完成首次绑定（只做一次）：" "Yellow"
    Say "  1) 在 GitHub 新建仓库，不要勾选 README，设为 Public"
    Say "  2) 在本目录执行：" "Yellow"
    Say "       git remote add origin https://github.com/你的用户名/你的仓库名.git" "Yellow"
    Say "       git push -u origin main" "Yellow"
    Say "  3) 仓库 Settings - Pages - Source 选 main 分支" "Yellow"
    Say ""
    Say "或者：把 github_token.txt 填好，直接双击 setup-github.bat 一键完成全部步骤。" "Cyan"
    Read-Host "按回车退出" | Out-Null
    exit 1
}

# 本机令牌自动认证
$tokenFile = Join-Path $PSScriptRoot "github_token.txt"
Enable-GitAuth

Say "[1/3] 暂存改动..."
& $git add -A | Out-Null

& $git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Say ""
    Say "[提示] 没有检测到内容改动，无需发布。" "Yellow"
    Read-Host "按回车退出" | Out-Null
    exit 0
}

Say "[2/3] 提交..."
& $git -c core.quotepath=false commit -m "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-Null
if ($LASTEXITCODE -ne 0) { Die "提交失败，请查看上方错误信息。" }

Say "[3/3] 推送到远程仓库..."
$out = & $git push origin main 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Say $out.Trim() "Red"
    Die "推送失败。常见原因：令牌缺少 repo scope，或网络不通。"
}

Say ""
Say "================================================" "Cyan"
Say "  [OK] 发布成功！约 1-2 分钟后全球生效。" "Green"
Say "  如需撤销本次发布，双击 undo.bat" "DarkGray"
Say "================================================" "Cyan"
Read-Host "按回车退出" | Out-Null
