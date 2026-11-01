@echo off
title Launch MediSync System
echo ===================================================
echo             MediSync Project Launcher
echo ===================================================
echo [1/2] Starting Backend Server on port 5000...
start "MediSync Server (Port 5000)" cmd /k "cd /d %~dp0server && node index.js"

echo [2/2] Starting Frontend Client on port 5173...
start "MediSync Client (Port 5173)" cmd /k "cd /d %~dp0client && node_modules\.bin\vite.cmd --port 5173"

echo.
echo Both services launched! Opening browser at http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173
echo Done.
exit
