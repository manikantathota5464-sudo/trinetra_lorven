from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import time

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class JobType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

class DetectionItem(BaseModel):
    id: str
    track_id: Optional[int] = None
    plateNumber: str
    confidence: float
    vehicleClass: str
    color: Optional[str] = "Unknown"
    timestamp: Optional[str] = None
    videoTimestamp: Optional[str] = None
    bbox: Optional[List[float]] = None  # [x1, y1, x2, y2]
    cropPath: Optional[str] = None
    violation: Optional[str] = None
    plate_locked: Optional[bool] = False
    skipped_ocr_frames: Optional[int] = 0

class JobCreateResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str
    created_at: float = Field(default_factory=time.time)

class JobStatusResponse(BaseModel):
    job_id: str
    job_type: JobType
    status: JobStatus
    progress: int = 0
    stage: str = "Waiting in queue"
    error: Optional[str] = None
    created_at: float
    updated_at: float

class JobResultResponse(BaseModel):
    job_id: str
    job_type: JobType
    status: JobStatus
    progress: int
    stage: str
    error: Optional[str] = None
    total_frames: int = 0
    processed_frames: int = 0
    fps: Optional[float] = 0.0
    execution_time_seconds: float = 0.0
    detections: List[DetectionItem] = []
    botsort: Optional[Dict[str, Any]] = None
    summary: Dict[str, Any] = {}

