"""
Image processing pipeline for single ANPR snapshots.
"""
import os
import time
import cv2
from typing import Dict, Any
from ..models_manager.model_manager import get_model_manager

def process_image_file(file_path: str, job_id: str, job_manager) -> Dict[str, Any]:
    start_time = time.time()
    job_manager.update_progress(job_id, 15, "Decoding image")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Image file not found: {file_path}")
        
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError("Failed to decode image file format.")
        
    job_manager.update_progress(job_id, 45, "Running plate detection and vehicle classification")
    model_mgr = get_model_manager()
    detections = model_mgr.detect_vehicles_and_plates(img)
    
    job_manager.update_progress(job_id, 85, "Aggregating OCR results and annotations")
    annotated_img = model_mgr.annotate_image(img, detections)
    annotated_base64 = model_mgr.frame_to_base64(annotated_img)
    
    # Release raw image buffers
    del img, annotated_img
    
    exec_time = time.time() - start_time
    
    return {
        "detections": detections,
        "annotated_image": annotated_base64,
        "total_frames": 1,
        "processed_frames": 1,
        "fps": 1.0 / max(0.001, exec_time),
        "execution_time_seconds": round(exec_time, 2),
        "summary": {
            "platesDetected": len(detections),
            "violationsCount": sum(1 for d in detections if d.get("violation")),
            "cleanCount": sum(1 for d in detections if not d.get("violation")),
            "processedTime": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
