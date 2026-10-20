# ============================================================
#  undo.ps1 — 撤销上一次发布
#  由 undo.bat 调用；也可直接运行：powershell -File undo.ps1
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
Say "  撤销上一次发布" "Cyan"
Say "================================================" "Cyan"
Say ""
Say "这会生成一个反向提交，把上一版内容改回去并推送到线上。"
Say "历史记录完整保留，是最安全的撤销方式。"
Say ""

$git = Get-GitExe
if (-not $git) { Die "没有找到 git。请先安装 Git for Windows: https://git-scm.com/download/win" }

$remote = & $git remote get-url origin 2>$null
if (-not $remote) { Die "还没有配置远程仓库，无法撤销。" }

$tokenFile = Join-Path $PSScriptRoot "github_token.txt"
Enable-GitAuth

Say "最近 5 次提交：" "Cyan"
& $git log --oneline -5 | ForEach-Object { Say "  $_" "DarkGray" }
Say ""

$ans = Read-Host "确认撤销上面第一条提交吗？输入 y 继续"
if ($ans -ne "y" -and $ans -ne "Y") {
    Say "已取消。"
    Read-Host "按回车退出" | Out-Null
    exit 0
}

Say ""
Say "[1/2] 生成反向提交..."
& $git revert --no-edit HEAD | Out-Null
if ($LASTEXITCODE -ne 0) { Die "撤销失败，请查看上方错误信息。" }

Say "[2/2] 推送到远程仓库..."
$out = & $git push origin main 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Say $out.Trim() "Red"
    Die "推送失败，请检查网络。"
}

Say ""
Say "================================================" "Cyan"
Say "  [OK] 撤销完成，约 1-2 分钟后线上恢复上一版。" "Green"
Say "================================================" "Cyan"
Read-Host "按回车退出" | Out-Null
