"""
JobManager: In-memory async job queue & lifecycle state manager.
"""
import time
import threading
from typing import Dict, Optional, List, Any
import uuid
from .schemas import JobStatus, JobType, JobStatusResponse, JobResultResponse, DetectionItem

class JobManager:
    _instance: Optional['JobManager'] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(JobManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._cancellation_flags: Dict[str, bool] = {}
        self._jobs_lock = threading.Lock()
        self._initialized = True

    def create_job(self, job_type: JobType, file_path: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Create a new job and return unique job ID immediately."""
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        now = time.time()
        
        job_data = {
            "job_id": job_id,
            "job_type": job_type,
            "file_path": file_path,
            "status": JobStatus.QUEUED,
            "progress": 0,
            "stage": "Queued for processing",
            "error": None,
            "created_at": now,
            "updated_at": now,
            "total_frames": 0,
            "processed_frames": 0,
            "fps": 0.0,
            "execution_time_seconds": 0.0,
            "detections": [],
            "summary": {},
            "metadata": metadata or {}
        }
        
        with self._jobs_lock:
            self._jobs[job_id] = job_data
            self._cancellation_flags[job_id] = False
            
        return job_id

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self._jobs_lock:
            return self._jobs.get(job_id)

    def get_status(self, job_id: str) -> Optional[JobStatusResponse]:
        with self._jobs_lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            return JobStatusResponse(
                job_id=job["job_id"],
                job_type=job["job_type"],
                status=job["status"],
                progress=job["progress"],
                stage=job["stage"],
                error=job.get("error"),
                created_at=job["created_at"],
                updated_at=job["updated_at"]
            )

    def get_result(self, job_id: str) -> Optional[JobResultResponse]:
        with self._jobs_lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            return JobResultResponse(
                job_id=job["job_id"],
                job_type=job["job_type"],
                status=job["status"],
                progress=job["progress"],
                stage=job["stage"],
                error=job.get("error"),
                total_frames=job.get("total_frames", 0),
                processed_frames=job.get("processed_frames", 0),
                fps=job.get("fps", 0.0),
                execution_time_seconds=job.get("execution_time_seconds", 0.0),
                detections=[DetectionItem(**d) if isinstance(d, dict) else d for d in job.get("detections", [])],
                botsort=job.get("botsort"),
                summary=job.get("summary", {})
            )

    def update_progress(self, job_id: str, progress: int, stage: str, status: Optional[JobStatus] = None):
        with self._jobs_lock:
            if job_id in self._jobs:
                self._jobs[job_id]["progress"] = max(0, min(100, progress))
                self._jobs[job_id]["stage"] = stage
                self._jobs[job_id]["updated_at"] = time.time()
                if status is not None:
                    self._jobs[job_id]["status"] = status

    def complete_job(self, job_id: str, results: Dict[str, Any]):
        with self._jobs_lock:
            if job_id in self._jobs:
                job = self._jobs[job_id]
                job["status"] = JobStatus.COMPLETED
                job["progress"] = 100
                job["stage"] = "Completed successfully"
                job["updated_at"] = time.time()
                job["detections"] = results.get("detections", [])
                job["total_frames"] = results.get("total_frames", 0)
                job["processed_frames"] = results.get("processed_frames", 0)
                job["fps"] = results.get("fps", 0.0)
                job["execution_time_seconds"] = results.get("execution_time_seconds", 0.0)
                job["botsort"] = results.get("botsort")
                job["summary"] = results.get("summary", {})

    def fail_job(self, job_id: str, error_message: str):
        with self._jobs_lock:
            if job_id in self._jobs:
                self._jobs[job_id]["status"] = JobStatus.FAILED
                self._jobs[job_id]["error"] = error_message
                self._jobs[job_id]["stage"] = f"Failed: {error_message}"
                self._jobs[job_id]["updated_at"] = time.time()

    def cancel_job(self, job_id: str) -> bool:
        with self._jobs_lock:
            if job_id in self._jobs:
                self._cancellation_flags[job_id] = True
                self._jobs[job_id]["status"] = JobStatus.CANCELLED
                self._jobs[job_id]["stage"] = "Cancelled by user"
                self._jobs[job_id]["updated_at"] = time.time()
                return True
            return False

    def is_cancelled(self, job_id: str) -> bool:
        with self._jobs_lock:
            return self._cancellation_flags.get(job_id, False)

def get_job_manager() -> JobManager:
    return JobManager()
