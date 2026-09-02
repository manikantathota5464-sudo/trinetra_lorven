@echo off
title TRINETRA Web Application Console
echo ============================================================
echo  TRINETRA — Intelligent Traffic Management Ecosystem
echo  React + Vite Web Architecture with FastAPI GPU AI Backend
echo ============================================================

:: Step 1: Clear any stale processes on port 8000 & 5173
echo [CLEANUP] Freeing ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: Step 2: Start FastAPI GPU AI Backend
echo [BACKEND] Starting FastAPI GPU AI Server on http://127.0.0.1:8000 ...
start "TRINETRA-AI-Backend" /B python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

:: Wait for AI Engine startup
echo [HEALTH] Waiting for GPU AI Engine initialization...
timeout /t 3 /nobreak >nul

:: Step 3: Start Vite Web Frontend
echo [FRONTEND] Starting React Vite Web App on http://localhost:5173 ...
start "TRINETRA-Web-Frontend" /B npm run dev

:: Wait for Vite dev server startup
timeout /t 3 /nobreak >nul

:: Step 4: Launch Web Browser
echo [LAUNCH] Opening TRINETHRA Web App in your default browser...
start http://localhost:5173

echo ============================================================
echo  TRINETRA Web App is now running at http://localhost:5173
echo ============================================================
