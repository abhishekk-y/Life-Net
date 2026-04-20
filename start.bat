@echo off
echo ==============================================
echo        Starting LifeNet System
echo ==============================================

echo [1] Starting Backend Server...
start cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak > nul

echo [2] Starting Frontend Server...
start cmd /k "cd client && npm run dev"

echo [3] Launching Browser...
timeout /t 3 /nobreak > nul
start http://localhost:5173

echo ==============================================
echo        LifeNet is now running
echo ==============================================
exit
