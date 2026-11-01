@echo off
title MediSync Client (Port 5173)
cd /d "%~dp0client"
echo ===================================================
echo           Starting MediSync Frontend Client
echo ===================================================
node_modules\.bin\vite.cmd --port 5173
pause
