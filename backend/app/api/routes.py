"""
FastAPI route definitions for TRINETRA AI processing jobs.
All heavy computation is handed off to the long-lived AIWorker.
"""
import os
import shutil
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ..config import settings
from ..jobs.job_manager import get_job_manager
from ..jobs.schemas import (
    JobType, JobStatus, JobCreateResponse, JobStatusResponse, JobResultResponse
)
from ..workers.ai_worker import get_ai_worker

router = APIRouter()
job_manager = get_job_manager()
ai_worker = get_ai_worker()

@router.post("/jobs/image", response_model=JobCreateResponse)
async def create_image_job(
    file: UploadFile = File(...),
    source_name: Optional[str] = Form(None)
):
    """
    Accepts image file upload, creates a job, and returns job_id IMMEDIATELY.
    Does NOT block the HTTP request for AI inference.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Save uploaded image
    filename = f"{int(time.time()*1000)}_{file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create job in queue
    job_id = job_manager.create_job(
        job_type=JobType.IMAGE,
        file_path=save_path,
        metadata={"filename": file.filename, "source_name": source_name}
    )

    # Hand off to long-lived AI Worker
    ai_worker.enqueue_job(job_id)

    return JobCreateResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        message="Image analysis job registered and queued for background inference."
    )

@router.post("/jobs/video", response_model=JobCreateResponse)
async def create_video_job(
    file: UploadFile = File(...),
    source_name: Optional[str] = Form(None)
):
    """
    Accepts video file upload, creates a job, and returns job_id IMMEDIATELY.
    Does NOT block the HTTP request for AI inference.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    filename = f"{int(time.time()*1000)}_{file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    job_id = job_manager.create_job(
        job_type=JobType.VIDEO,
        file_path=save_path,
        metadata={"filename": file.filename, "source_name": source_name}
    )

    ai_worker.enqueue_job(job_id)

    return JobCreateResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        message="Video analysis job registered and queued for background processing."
    )

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Query current job progress and stage."""
    status = job_manager.get_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found.")
    return status

@router.get("/jobs/{job_id}/result", response_model=JobResultResponse)
async def get_job_result(job_id: str):
    """Query structured job results (detections, violations, summary metrics)."""
    result = job_manager.get_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found.")
    return result

@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    """Cancel an active or queued job."""
    success = job_manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job_id": job_id, "status": JobStatus.CANCELLED, "message": "Job cancellation signal sent."}
