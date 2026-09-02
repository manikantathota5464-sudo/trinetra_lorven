@echo off
title TRINETHRA Desktop Application
echo ============================================================
echo  TRINETHRA — Intelligent Traffic Management Ecosystem
echo  React + Tauri Desktop Architecture with Async AI Backend
echo ============================================================

:: Step 1: Start FastAPI & AI Worker Backend Service
echo [BACKEND] Starting FastAPI ^& Long-Lived GPU AI Worker on http://127.0.0.1:8000 ...
start "TRINETHRA-AI-Backend" /B py -3.12 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

:: Wait for backend health confirmation
echo [HEALTH] Checking AI Engine availability...
py -3.12 -c "import urllib.request, time; time.sleep(1.5); res = urllib.request.urlopen('http://127.0.0.1:8000/health'); print('[HEALTH] Backend Active: ' + str(res.status))"

:: Step 2: Build React app bundle if missing
if not exist "dist\index.html" (
    echo [BUILD] dist\index.html not found — building React app...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] npm build failed. Make sure Node.js and npm are installed.
        pause
        exit /b 1
    )
    echo [BUILD] React build complete.
) else (
    echo [BUILD] Using existing React build in dist\
)

:: Step 3: Launch Desktop Shell
echo [LAUNCH] Starting TRINETHRA Desktop Host Shell...
py -3.12 pyside6_app\main.py

echo [SHUTDOWN] TRINETHRA Session Concluded.
pause
