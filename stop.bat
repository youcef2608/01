@echo off
chcp 65001 >nul
title Athar DZ - Stop Server

echo Stopping any stuck Athar server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Done. Port 3000 is free now.
echo You can run start.bat again.
pause
