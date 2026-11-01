@echo off
title MediSync Server (Port 5000)
cd /d "%~dp0server"
echo ===================================================
echo           Starting MediSync Backend Server
echo ===================================================
node index.js
pause
