"""
TRINETRA Backend Application Server
FastAPI HTTP / WebSocket / Job Management Gateway
"""
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import router as api_router
from .workers.ai_worker import get_ai_worker

# Ensure project root is in sys.path
sys.path.insert(0, settings.BASE_DIR)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start long-lived AI worker and preload models once
    ai_worker = get_ai_worker()
    ai_worker.start()
    yield
    # Shutdown: Cleanly terminate worker and release resources
    ai_worker.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High Performance AI & Media Processing Gateway for TRINETRA Surveillance System",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React and Tauri WebView
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    """Health check endpoint used by Tauri and React to verify backend readiness."""
    return {
        "status": "ok",
        "service": "TRINETRA AI Engine",
        "version": "2.0.0",
        "worker_active": get_ai_worker().is_running
    }

@app.get("/")
def root():
    return {
        "service": "TRINETRA Intelligent Traffic Management AI Backend",
        "health": "/health",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
