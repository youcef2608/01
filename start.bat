@echo off
chcp 65001 >nul
title Athar DZ - Server
cd /d H:\01

echo ============================================
echo    Athar DZ - Athar Platform
echo ============================================
echo.
echo Starting the server... the browser will open automatically.
echo To STOP: close this window or press Ctrl+C
echo.

:: Open the browser automatically after 12 seconds (gives the server time to boot)
start "" cmd /c "timeout /t 12 /nobreak >nul && start http://localhost:3000"

:: Run the dev server (stays in this window - do NOT close it while working)
npm run dev

echo.
echo Server stopped.
pause
