@echo off
title TRINETHRA Desktop Application
echo ============================================================
echo  TRINETHRA — Intelligent Traffic Management Ecosystem
echo ============================================================

:: Step 1: Build React app (skipped if dist\ already exists)
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

:: Step 2: Launch the PySide6 desktop app
echo [LAUNCH] Starting TRINETHRA Desktop Application...
python pyside6_app\main.py

pause
