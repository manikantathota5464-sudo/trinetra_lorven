@echo off
title TRINETHRA Desktop Application
echo ============================================================
echo  TRINETHRA — Intelligent Traffic Management Ecosystem
echo  React + Tauri Desktop Architecture with Async AI Backend
echo ============================================================

:: Step 1: Clear stale port 8000 listeners & Start FastAPI Backend Service
echo [CLEANUP] Freeing port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [BACKEND] Starting FastAPI ^& Long-Lived GPU AI Worker on http://127.0.0.1:8000 ...
start "TRINETHRA-AI-Backend" /B python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

:: Wait for backend health confirmation & AI model preloading
python scripts\wait_for_backend.py

:: Step 2: Build React app bundle
echo [BUILD] Building latest React app bundle into dist\...
call npm run build
if errorlevel 1 (
    echo [ERROR] npm build failed. Make sure Node.js and npm are installed.
    pause
    exit /b 1
)
echo [BUILD] React build complete.

:: Step 3: Launch Desktop Shell
echo [LAUNCH] Starting TRINETHRA Desktop Host Shell...
python pyside6_app\main.py

echo [SHUTDOWN] TRINETHRA Session Concluded.
pause
