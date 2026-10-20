@echo off
rem ============================================================
rem  askpass.cmd — git 需要认证时调用它
rem  用户名固定回 x-access-token，密码回本机 github_token.txt 里的令牌
rem  令牌只在本机使用，不会写入远程仓库，也不会进入聊天记录。
rem ============================================================
setlocal
echo %~1 | findstr /i "username" >nul 2>&1
if not errorlevel 1 (
  echo x-access-token
  exit /b 0
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get-token.ps1"
exit /b %errorlevel%
