@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org first, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open the Local URL below on this PC.
echo On your iPhone, use this PC's LAN IP with port 5173 on the same Wi-Fi.
call npm run dev -- --port 5173
pause
