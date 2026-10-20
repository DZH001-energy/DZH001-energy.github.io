@echo off
chcp 65001 >nul
title Setup GitHub - Publish Personal Homepage
cd /d "%~dp0"

echo.
echo ==================================================
echo   One-time setup: create repo + publish + Pages
echo ==================================================
echo.

if not exist "github_token.txt" (
  echo [1/2] Token file not found - creating it now.
  echo.
  echo      Get a token at  https://github.com/settings/tokens
  echo      Select scopes:  repo, gist
  echo.
  notepad "github_token.txt"
  echo.
  echo [2/2] Continuing...
  echo.
)

powershell -NoProfile -ExecutionPolicy Bypass -File ".\setup-github.ps1"
if errorlevel 1 (
  echo.
  echo [INFO] The script stopped early. Please scroll up to see the reason.
)

echo.
echo Press any key to close this window...
pause >nul
