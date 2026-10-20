@echo off
chcp 65001 >nul
title Preview - Personal Homepage
cd /d "%~dp0"

echo.
echo  Local preview:  http://localhost:8000
echo  Close this window to stop the server.
echo.
start "" "http://localhost:8000"

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python not found. Please open index.html directly instead.
  echo Press any key to close this window...
  pause >nul
  exit /b 1
)

python -m http.server 8000
