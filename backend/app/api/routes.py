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
from ..db.mongodb import db_client

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

@router.get("/detections")
async def get_detections(
    limit: int = 100,
    plate: Optional[str] = None,
    violation_only: bool = False,
    job_id: Optional[str] = None
):
    """Query live stored detections from MongoDB."""
    records = db_client.get_detections(
        limit=limit,
        plate_query=plate,
        violation_only=violation_only,
        job_id=job_id
    )
    return {"count": len(records), "detections": records}

@router.get("/stats")
async def get_system_stats():
    """Query live MongoDB database storage metrics."""
    return db_client.get_db_stats()

@router.get("/cameras")
async def get_cameras():
    """Query registered camera nodes from MongoDB."""
    cameras = db_client.get_cameras()
    return {"count": len(cameras), "cameras": cameras}

@router.post("/cameras")
async def create_camera(payload: dict):
    """Store or register a new camera node in MongoDB."""
    if not payload.get("name") and not payload.get("id"):
        raise HTTPException(status_code=400, detail="Camera payload requires 'id' or 'name'.")
    saved = db_client.save_camera(payload)
    return {"message": "Camera registered successfully.", "camera": saved}

@router.delete("/cameras/{camera_id}")
async def delete_camera(camera_id: str):
    """Delete a registered camera node by ID."""
    success = db_client.delete_camera(camera_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found.")
    return {"message": f"Camera '{camera_id}' removed.", "success": True}

@router.get("/models/status")
async def get_models_status():
    """Return device, GPU hardware model name, VRAM memory usage, and load status of each model."""
    from ..models_manager.model_manager import get_model_manager
    model_mgr = get_model_manager()
    return model_mgr.get_status()

@router.post("/inference/image")
async def run_image_inference(file: UploadFile = File(...)):
    """Direct GPU image inference endpoint returning real detections."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    filename = f"direct_{int(time.time()*1000)}_{file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    from ..models_manager.model_manager import get_model_manager
    import cv2
    img = cv2.imread(save_path)
    if img is None:
        raise HTTPException(status_code=400, detail="Failed to decode uploaded image.")

    model_mgr = get_model_manager()
    detections = model_mgr.detect_vehicles_and_plates(img)
    annotated_frame = model_mgr.annotate_image(img, detections)
    annotated_base64 = model_mgr.frame_to_base64(annotated_frame)
    return {
        "status": "success",
        "device": str(model_mgr.device),
        "gpu": model_mgr.gpu_name,
        "detections": detections,
        "count": len(detections),
        "annotated_image": annotated_base64
    }

@router.post("/inference/video", response_model=JobCreateResponse)
async def run_video_inference(
    file: UploadFile = File(...),
    source_name: Optional[str] = Form(None)
):
    """Direct GPU video inference endpoint creating an async worker job."""
    return await create_video_job(file=file, source_name=source_name)

@router.post("/video/process")
async def process_video_stream_upload(file: UploadFile = File(...)):
    """
    Accepts video upload for real-time live AI video streaming.
    Saves file locally and returns stream URL for immediate live feed playback.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No video file uploaded.")

    stream_id = f"STREAM-{int(time.time()*1000)}"
    save_path = os.path.join(settings.UPLOAD_DIR, f"{stream_id}_{file.filename}")
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Automatically enqueue background job so video AI detections are persisted into DB
    job_id = job_manager.create_job(
        job_type=JobType.VIDEO,
        file_path=save_path,
        metadata={"filename": file.filename, "stream_id": stream_id}
    )
    ai_worker.enqueue_job(job_id)

    return {
        "status": "success",
        "stream_id": stream_id,
        "job_id": job_id,
        "video_path": save_path,
        "stream_url": f"/api/stream/video/{stream_id}?path={save_path}"
    }

@router.get("/stream/video/{stream_id}")
async def get_video_ai_mjpeg_stream(stream_id: str, path: Optional[str] = None, sample_rate: int = 5):
    """
    Real-time low-latency MJPEG AI video stream endpoint with configurable frame skipping.
    Decodes uploaded video frame-by-frame, runs GPU inference & BoT-SORT tracking,
    annotates bounding boxes, and streams live JPEG frames to the frontend.
    """
    from fastapi.responses import StreamingResponse
    from ..processing.stream_processor import get_stream_processor

    if not path or not os.path.exists(path):
        # Locate saved file by stream_id prefix in upload directory
        matching_files = [os.path.join(settings.UPLOAD_DIR, f) for f in os.listdir(settings.UPLOAD_DIR) if f.startswith(stream_id)]
        if matching_files:
            path = matching_files[0]
        else:
            raise HTTPException(status_code=404, detail=f"Stream video file for '{stream_id}' not found.")

    stream_proc = get_stream_processor()
    return StreamingResponse(
        stream_proc.generate_mjpeg_stream(video_path=path, stream_id=stream_id, sample_rate=sample_rate),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
