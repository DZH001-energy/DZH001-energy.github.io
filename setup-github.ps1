# ============================================================
#  setup-github.ps1
#  一键完成：读取本地令牌 → 定位 git → 设置 GitHub noreply 身份
#            → 创建仓库 → 修正提交邮箱 → 推送 → 开启 GitHub Pages
#            → 输出全球访问地址
#
#  令牌只从本机读取（文件 → 剪贴板），不会进入聊天记录。
#  过程写入 setup-github.log，便于排查。
# ============================================================
param(
    [string]$User = "",
    [string]$Repo = "",
    [switch]$SkipPages,
    [switch]$NoPause
)

$ErrorActionPreference = "Continue"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
Set-Location -Path $PSScriptRoot
$logFile = Join-Path $PSScriptRoot "setup-github.log"
"" | Out-File -FilePath $logFile -Encoding utf8

function Say($msg, $color = "Gray") {
    Write-Host $msg -ForegroundColor $color
    Add-Content -Path $logFile -Value $msg -Encoding utf8
}
function Die($msg) {
    Say "[X] $msg" "Red"
    if (-not $NoPause) { Read-Host "按回车退出" | Out-Null }
    exit 1
}

# --- 全局异常兜底：任何未预期错误都给出可读提示并停住窗口 ---
trap {
    Write-Host ""
    Write-Host "[X] 发生未预期的错误，已停止。" -ForegroundColor Red
    Write-Host ("    " + $_.Exception.Message) -ForegroundColor Red
    Write-Host ("    位置: " + $_.InvocationInfo.PositionMessage) -ForegroundColor DarkGray
    Write-Host ("    详细日志: " + $logFile) -ForegroundColor DarkGray
    Read-Host "按回车退出" | Out-Null
    exit 1
}

# ---------------------------------------------------------------
#  定位 git：PATH -> 常见安装位置 -> WorkBuddy 自带 PortableGit
#  （双击 .bat 启动的进程通常没有 git 环境，必须显式查找）
# ---------------------------------------------------------------
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

# ---------------------------------------------------------------
#  git 认证：把 askpass 助手复制到纯 ASCII 临时目录
#  （站点路径含中文，直接传给 git 拉起的子进程会乱码）
#  令牌路径通过环境变量传递（环境变量是 Unicode，不会有编码问题）
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

# ---------- 1. 读取令牌 ----------
$tokenFile = Join-Path $PSScriptRoot "github_token.txt"
$token = $null
if (Test-Path $tokenFile) {
    $token = (Get-Content $tokenFile -Encoding UTF8 | Where-Object { $_.Trim() -match '^(ghp_|github_pat_)' } | Select-Object -First 1)
}
if (-not $token) {
    # 兜底：直接从剪贴板取（Win+V 剪贴板历史里复制一下即可）
    try { $clip = Get-Clipboard -Raw } catch { $clip = $null }
    if ($clip) {
        $cm = [regex]::Match($clip, '(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})')
        if ($cm.Success) { $token = $cm.Groups[1].Value }
    }
}
if (-not $token) {
    Say ""
    Say "还没有检测到 GitHub 令牌。" "Yellow"
    Say ""
    Say "  方案 A：打开 https://github.com/settings/tokens" "Yellow"
    Say "           Generate new token (classic)，勾选 repo 和 gist，复制 ghp_ 开头的字符串" "Yellow"
    Say "  方案 B：按 Win+V 打开剪贴板历史，把那条 ghp_ 记录复制到剪贴板" "Yellow"
    Say ""
    $open = Read-Host "要打开 github_token.txt 吗？（或先按 Win+V 复制令牌）输入 y 回车确认"
    if ($open -eq "y" -or $open -eq "Y") {
        Start-Process notepad.exe -ArgumentList "`"$tokenFile`""
        Say "已打开记事本，粘贴并保存后，再次运行本脚本。" "Cyan"
    }
    Die "缺少令牌，发布已取消（网站文件本身没有任何改动）。"
}
$token = $token.Trim()
Say "[OK] 已读取本地 token（前缀 $($token.Substring(0,4))…）" "Green"

# ---------- 2. 定位 git ----------
$git = Get-GitExe
if (-not $git) {
    Say "[X] 找不到 git 可执行文件。" "Red"
    Say "    请安装 Git for Windows: https://git-scm.com/download/win" "Yellow"
    Die "缺少 git，发布已取消。"
}
Say "使用 git: $git" "DarkGray"
Enable-GitAuth

# ---------- 3. 确认 GitHub 身份 ----------
$hdr = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json"; "X-GitHub-Api-Version" = "2022-11-28" }
try {
    $me = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $hdr -Method Get -ErrorAction Stop
} catch {
    Die "token 无效或网络不通：$($_.Exception.Message)"
}
$login = $me.login
Say "[OK] GitHub 身份确认：$login （$($me.name)）" "Green"

if ([string]::IsNullOrWhiteSpace($User)) { $User = $login }
if ([string]::IsNullOrWhiteSpace($Repo)) { $Repo = "$login.github.io" }
Say "目标仓库：$User/$Repo" "Cyan"

# ---------- 3.5 设置 GitHub noreply 身份（规避 GH007 私有邮箱保护） ----------
$noreply = "$($me.id)+$login@users.noreply.github.com"
$realName = if ($me.name) { $me.name } else { $login }
& $git config user.name "$realName" | Out-Null
& $git config user.email "$noreply" | Out-Null
Say "提交身份已设为：$realName <$noreply>" "DarkGray"

# ---------- 4. 创建仓库（已存在则跳过） ----------
$repoApi = "https://api.github.com/repos/$User/$Repo"
$exists = $false
try { $null = Invoke-RestMethod -Uri $repoApi -Headers $hdr -Method Get -ErrorAction Stop; $exists = $true } catch { }
if ($exists) {
    Say "仓库已存在，跳过创建。" "Yellow"
} else {
    $body = @{ name = $Repo; description = "Personal academic website of Dr. Zhihua Deng (ERI@N, NTU)"; private = $false; auto_init = $false } | ConvertTo-Json
    try {
        $null = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $hdr -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Say "[OK] 仓库已创建：$User/$Repo" "Green"
    } catch {
        Die "创建仓库失败：$($_.Exception.Message) —— 若提示 name already exists，换个仓库名重新运行即可。"
    }
}

# ---------- 5. 修正历史提交里的私有邮箱 ----------
$badMails = & $git log --format="%ae" 2>$null | Sort-Object -Unique
$needRewrite = $false
foreach ($m in $badMails) { if ($m -and $m -ne $noreply) { $needRewrite = $true } }
if ($needRewrite) {
    Say "检测到历史提交含非 noreply 邮箱，正在改写（保留提交历史）..." "Yellow"
    $null = & $git filter-branch -f --env-filter "export GIT_AUTHOR_EMAIL='$noreply'; export GIT_COMMITTER_EMAIL='$noreply'" -- --all 2>&1
    if ($LASTEXITCODE -ne 0) {
        # PortableGit 的 cmd 模式没有 sh，filter-branch 不可用 -> 折叠为单条初始提交
        Say "  filter-branch 不可用，改为折叠为单条初始提交（历史仅本地存在，线上无影响）..." "Yellow"
        & $git checkout --orphan _fresh 2>&1 | Out-Null
        & $git add -A 2>&1 | Out-Null
        & $git -c core.quotepath=false commit -m "feat: personal academic homepage v1.0" 2>&1 | Out-Null
        & $git branch -D main 2>&1 | Out-Null
        & $git branch -M _fresh main 2>&1 | Out-Null
        Say "[OK] 历史已折叠为单条 noreply 提交" "Green"
    } else {
        Remove-Item (Join-Path $PSScriptRoot ".git\refs\original") -Recurse -Force -ErrorAction SilentlyContinue
        & $git reflog expire --expire=now --all 2>&1 | Out-Null
        & $git gc --prune=now 2>&1 | Out-Null
        Say "[OK] 历史邮箱已改写为 noreply" "Green"
    }
}

# ---------- 6. 绑定远程仓库并推送 ----------
$remote = "https://github.com/$User/$Repo.git"
$existing = (& $git remote 2>$null)
if ($existing -match "origin") { & $git remote set-url origin $remote } else { & $git remote add origin $remote }
Say "[OK] 远程仓库已绑定：$remote" "Green"

& $git add -A | Out-Null
& $git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    & $git -c core.quotepath=false commit -m "feat: 个人科研主页 v1.0" | Out-Null
}
$pushOut = & $git push -u origin main 2>&1 | Out-String
Add-Content -Path $logFile -Value $pushOut -Encoding utf8
if ($LASTEXITCODE -ne 0) {
    Say ($pushOut.Trim() -replace '(?m)^remote: error: GH007.*$','remote: error: GH007 私有邮箱保护（已尝试改写，若仍出现请到 https://github.com/settings/emails 关闭邮箱保护）') "Red"
    Die "推送失败，请查看上方错误信息。"
}
Say "[OK] 文件已推送" "Green"

# ---------- 7. 开启 GitHub Pages ----------
if (-not $SkipPages) {
    Start-Sleep -Seconds 3
    $pagesBody = @{ source = @{ branch = "main"; path = "/" } } | ConvertTo-Json
    try {
        $null = Invoke-RestMethod -Uri "https://api.github.com/repos/$User/$Repo/pages" -Headers $hdr -Method Post -Body $pagesBody -ContentType "application/json" -ErrorAction Stop
        Say "[OK] GitHub Pages 已开启" "Green"
    } catch {
        $msg = $_.Exception.Message
        if ($msg -match "already exists") { Say "Pages 之前已开启，跳过。" "Yellow" }
        else {
            Say "[!] Pages 未能自动开启：$msg" "Yellow"
            Say "  请手动到 仓库 Settings → Pages → Source 选 main 分支" "Yellow"
        }
    }
}

# ---------- 8. 输出结果 ----------
$url = if ($Repo -eq "$User.github.io") { "https://$User.github.io/" } else { "https://$User.github.io/$Repo/" }
Say ""
Say "================================================" "Cyan"
Say "  发布完成！" "Cyan"
Say "  全球访问地址：$url" "White"
Say "  （首次构建约需 1-2 分钟，稍等即可打开）" "DarkGray"
Say "================================================" "Cyan"
Say ""
Say "以后更新：改 content.js → 双击 publish.bat" "DarkGray"
Say "发布出错要撤回：双击 undo.bat" "DarkGray"
if (-not $NoPause) { Read-Host "按回车退出" | Out-Null }
