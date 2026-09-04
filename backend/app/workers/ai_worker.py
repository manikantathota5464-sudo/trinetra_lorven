"""
AIWorker: Long-lived background AI worker process/thread.
Pulls tasks from queue, executes inference using cached models, and updates job states.
"""
import time
import threading
import queue
import logging
import traceback
from typing import Optional
from ..jobs.job_manager import get_job_manager
from ..jobs.schemas import JobType, JobStatus
from ..models_manager.model_manager import get_model_manager
from ..processing.image_processor import process_image_file
from ..processing.video_processor import process_video_file
from ..db.mongodb import db_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TRINETRA.AIWorker")

class AIWorker:
    _instance: Optional['AIWorker'] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(AIWorker, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.job_queue: queue.Queue = queue.Queue()
        self.is_running = False
        self.worker_thread: Optional[threading.Thread] = None
        self.job_manager = get_job_manager()
        self.model_manager = get_model_manager()
        self._initialized = True

    def start(self):
        """Start the background worker thread."""
        if self.is_running:
            return
        
        logger.info("Starting long-lived TRINETRA AI Worker...")
        self.is_running = True
        
        # Preload models once at worker startup
        self.model_manager.load_all_models()
        
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True, name="TRINETRA-AI-Worker")
        self.worker_thread.start()
        logger.info("AI Worker thread started successfully.")

    def stop(self):
        """Gracefully stop the background worker."""
        logger.info("Stopping AI Worker...")
        self.is_running = False
        if self.worker_thread and self.worker_thread.is_alive():
            # Unblock queue
            self.job_queue.put(None)
            self.worker_thread.join(timeout=2.0)
        logger.info("AI Worker stopped.")

    def enqueue_job(self, job_id: str):
        """Add job ID to processing queue."""
        logger.info(f"Enqueuing job {job_id} to worker queue.")
        self.job_queue.put(job_id)

    def _worker_loop(self):
        while self.is_running:
            try:
                job_id = self.job_queue.get(timeout=1.0)
                if job_id is None:
                    break
                
                self._process_single_job(job_id)
                self.job_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in worker loop: {e}\n{traceback.format_exc()}")

    def _process_single_job(self, job_id: str):
        job = self.job_manager.get_job(job_id)
        if not job:
            logger.warning(f"Job {job_id} not found in job store.")
            return

        if self.job_manager.is_cancelled(job_id):
            logger.info(f"Job {job_id} was cancelled before processing started.")
            return

        logger.info(f"Beginning AI processing for job {job_id} (Type: {job['job_type']})...")
        self.job_manager.update_progress(job_id, 5, "Processing initiated", JobStatus.PROCESSING)

        try:
            file_path = job["file_path"]
            job_type = job["job_type"]
            
            if job_type == JobType.IMAGE:
                results = process_image_file(file_path, job_id, self.job_manager)
            elif job_type == JobType.VIDEO:
                results = process_video_file(file_path, job_id, self.job_manager)
            else:
                raise ValueError(f"Unsupported job type: {job_type}")

            if self.job_manager.is_cancelled(job_id):
                logger.info(f"Job {job_id} completed cancellation.")
                return

            raw_dets = results.get("detections", [])
            detections = []
            for idx, d in enumerate(raw_dets):
                det_copy = dict(d)
                det_copy["job_id"] = job_id
                det_copy["filename"] = job.get("filename", "")
                det_copy["sourceType"] = "video" if job_type == JobType.VIDEO else "image"
                if not det_copy.get("plateNumber"):
                    det_copy["plateNumber"] = "UNREADABLE"
                detections.append(det_copy)
            
            if detections:
                db_client.save_detections_batch(detections)

            db_client.save_job({
                "job_id": job_id,
                "filename": job.get("filename", ""),
                "job_type": str(job_type),
                "summary": results.get("summary", {}),
                "detections_count": len(detections),
                "completed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            })

            self.job_manager.complete_job(job_id, results)
            logger.info(f"Job {job_id} completed successfully with {len(detections)} valid detections saved to MongoDB.")
            
        except Exception as e:
            err_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"Job {job_id} failed with error: {err_msg}\n{traceback.format_exc()}")
            self.job_manager.fail_job(job_id, err_msg)

def get_ai_worker() -> AIWorker:
    return AIWorker()
