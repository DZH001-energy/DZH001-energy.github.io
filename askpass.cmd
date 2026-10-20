@echo off
rem ============================================================
rem  askpass.cmd
rem  Called by git when authentication is needed.
rem  Username  -> always x-access-token
rem  Password  -> token from the local github_token.txt (or clipboard)
rem  NOTE: this file MUST stay pure ASCII. git spawns it with the
rem  system ANSI code page, so any non-ASCII byte here would be
rem  garbled and interpreted as shell commands.
rem ============================================================
setlocal
echo %~1 | findstr /i "username" >nul 2>&1
if not errorlevel 1 (
  echo x-access-token
  exit /b 0
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get-token.ps1"
exit /b %errorlevel%
