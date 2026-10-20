# ============================================================
#  get-token.ps1 — 取 GitHub 令牌
#  顺序：① github_token.txt  ② 剪贴板（如果开着 Win+V 历史，可直接从历史里复制）
#  令牌只在本机使用，不会写入远程仓库，也不会进入聊天记录。
# ============================================================
$ErrorActionPreference = "SilentlyContinue"

function Find-TokenInText([string]$text) {
    if (-not $text) { return $null }
    $m = [regex]::Match($text, '(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})')
    if ($m.Success) { return $m.Groups[1].Value }
    return $null
}

# ① 本机文件
$token = $null
$p = if ($env:ZD_TOKEN_FILE) { $env:ZD_TOKEN_FILE } else { Join-Path $PSScriptRoot "github_token.txt" }
if (Test-Path $p) {
    $token = Find-TokenInText ((Get-Content $p -Encoding UTF8 | Where-Object { $_.Trim() -match '^(ghp_|github_pat_)' } | Select-Object -First 1))
}

# ② 剪贴板兜底
if (-not $token) {
    try { $clip = Get-Clipboard -Raw } catch { $clip = $null }
    if ($clip) { $token = Find-TokenInText $clip }
}

if ($token) {
    Write-Output $token.Trim()
    exit 0
}
exit 1
