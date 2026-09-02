import os

class Settings:
    PROJECT_NAME: str = "TRINETRA AI Engine"
    API_V1_STR: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Workspace root
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "backend_uploads")
    RESULTS_DIR: str = os.path.join(BASE_DIR, "backend_results")
    
    # Frame sampling & Performance
    FRAME_SAMPLE_RATE: int = 5  # Process every 5th frame for video
    MAX_WORKER_CONCURRENCY: int = 1  # 1 heavy AI job at a time to prevent GPU contention
    DEVICE: str = os.getenv("DEVICE", "cuda")  # Default to CUDA GPU acceleration

    # Model Weight File Paths
    VEHICLE_MODEL_PATH: str = os.path.join(MODELS_DIR, "vehicle", "best.pt")
    PLATE_MODEL_PATH: str = os.path.join(MODELS_DIR, "plate", "models", "plate_yolo_ft.pt")
    ANPR_MODEL_PATH: str = os.path.join(MODELS_DIR, "ocr", "Awiros-ANPR-OCR", "model.safetensors")

    # Detection Thresholds
    CONFIDENCE_THRESHOLD: float = 0.35
    PLATE_CONFIDENCE_THRESHOLD: float = 0.35
    OCR_CONFIDENCE_THRESHOLD: float = 0.50

    # MongoDB Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "trinetra_db")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
