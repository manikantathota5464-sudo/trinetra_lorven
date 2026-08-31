"""
Video processing pipeline with configurable frame sampling, cancellation check, and lightweight aggregation.
"""
import os
import time
import cv2
from typing import Dict, Any, List
from ..models_manager.model_manager import get_model_manager
from ..config import settings

def process_video_file(file_path: str, job_id: str, job_manager, sample_rate: int = None) -> Dict[str, Any]:
    start_time = time.time()
    sample_rate = sample_rate or settings.FRAME_SAMPLE_RATE
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Video file not found: {file_path}")
        
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    if total_frames <= 0:
        total_frames = 100  # Fallback estimate
        
    job_manager.update_progress(job_id, 5, f"Initializing video decoder (Total frames: {total_frames})")
    
    model_mgr = get_model_manager()
    all_detections: List[Dict[str, Any]] = []
    seen_plates = set()
    
    frame_idx = 0
    sampled_count = 0
    last_progress_time = time.time()
    
    try:
        while True:
            # Check for cancellation on each frame
            if job_manager.is_cancelled(job_id):
                cap.release()
                return {
                    "detections": all_detections,
                    "total_frames": total_frames,
                    "processed_frames": sampled_count,
                    "fps": 0.0,
                    "execution_time_seconds": time.time() - start_time,
                    "summary": {"status": "cancelled"}
                }
                
            ret, frame = cap.read()
            if not ret:
                break
                
            # Configurable frame sampling
            if frame_idx % sample_rate == 0:
                sampled_count += 1
                detections = model_mgr.detect_vehicles_and_plates(frame)
                
                # Timestamp inside video
                current_sec = frame_idx / max(1.0, video_fps)
                mins, secs = divmod(int(current_sec), 60)
                time_str = f"{mins:02d}:{secs:02d}"
                
                for d in detections:
                    d["videoTimestamp"] = time_str
                    # Deduplicate or track unique license plates
                    p_num = d["plateNumber"]
                    if p_num not in seen_plates:
                        seen_plates.add(p_num)
                        all_detections.append(d)
                
                # Release frame buffer immediately
                del frame
                
                # Throttled progress updates (every 250ms or every 10% progress)
                now = time.time()
                if now - last_progress_time >= 0.25 or frame_idx == total_frames - 1:
                    percent = int((frame_idx / float(total_frames)) * 90) + 5
                    job_manager.update_progress(
                        job_id,
                        percent,
                        f"Analyzing video stream: Frame {frame_idx}/{total_frames} ({len(seen_plates)} unique vehicles logged)"
                    )
                    last_progress_time = now
            else:
                del frame
                
            frame_idx += 1
            
    finally:
        cap.release()
        
    exec_time = time.time() - start_time
    calc_fps = sampled_count / max(0.001, exec_time)
    
    job_manager.update_progress(job_id, 98, "Finalizing detection reports and alerts")
    
    return {
        "detections": all_detections,
        "total_frames": total_frames,
        "processed_frames": sampled_count,
        "fps": round(calc_fps, 1),
        "execution_time_seconds": round(exec_time, 2),
        "summary": {
            "uniquePlatesCount": len(seen_plates),
            "violationsCount": sum(1 for d in all_detections if d.get("violation")),
            "cleanCount": sum(1 for d in all_detections if not d.get("violation")),
            "sampleRate": sample_rate,
            "processedTime": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
