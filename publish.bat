@echo off
chcp 65001 >nul
title Publish - Personal Homepage
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File ".\publish.ps1"
if errorlevel 1 (
  echo.
  echo [INFO] The script stopped early. Please scroll up to see the reason.
)

echo.
echo Press any key to close this window...
pause >nul
