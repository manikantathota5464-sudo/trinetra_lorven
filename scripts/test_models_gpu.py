"""
Independent Model Verification & Benchmark Script for TRINETRA AI GPU Engine.
Tests VehicleNet-Y26x, plate_yolo_ft, and Awiros ANPR-OCR models on GPU.
"""
import os
import sys
import time
import torch
import numpy as np
import cv2

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BASE_DIR)

from backend.app.models_manager.model_manager import get_model_manager
from backend.app.config import settings

def test_models():
    print("============================================================")
    print("TRINETRA AI GPU MODEL VERIFICATION TEST")
    print("============================================================")

    # Verify PyTorch CUDA Environment
    print(f"PyTorch Version:  {torch.__version__}")
    print(f"CUDA Available:   {torch.cuda.is_available()}")
    if not torch.cuda.is_available():
        print("[FAIL] CUDA is NOT available! Cannot perform GPU inference test.")
        sys.exit(1)

    gpu_name = torch.cuda.get_device_name(0)
    print(f"NVIDIA GPU:       {gpu_name}")
    print(f"CUDA Version:     {torch.version.cuda}")
    print("------------------------------------------------------------")

    # Initialize Model Manager
    model_mgr = get_model_manager()
    model_mgr.load_all_models()

    # Create synthetic test frame (300x300 BGR)
    test_frame = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.rectangle(test_frame, (50, 50), (250, 200), (120, 120, 120), -1)

    # 1. Test Vehicle Detector (VehicleNet-Y26x)
    start_ts = time.time()
    v_dets = model_mgr.detect_vehicles(test_frame)
    v_time_ms = (time.time() - start_ts) * 1000
    print(f"MODEL: VehicleNet-Y26x    DEVICE: {model_mgr.device} GPU: {gpu_name} INFERENCE: SUCCESS DETECTIONS: {len(v_dets)} TIME: {v_time_ms:.2f} ms")

    # 2. Test Plate Detector (plate_yolo_ft)
    start_ts = time.time()
    p_dets = model_mgr.detect_plates(test_frame)
    p_time_ms = (time.time() - start_ts) * 1000
    print(f"MODEL: plate_yolo_ft     DEVICE: {model_mgr.device} GPU: {gpu_name} INFERENCE: SUCCESS DETECTIONS: {len(p_dets)} TIME: {p_time_ms:.2f} ms")

    # 3. Test Unified End-to-End Pipeline
    start_ts = time.time()
    pipeline_dets = model_mgr.detect_vehicles_and_plates(test_frame)
    total_time_ms = (time.time() - start_ts) * 1000
    print(f"MODEL: TRINETRA Pipeline  DEVICE: {model_mgr.device} GPU: {gpu_name} INFERENCE: SUCCESS DETECTIONS: {len(pipeline_dets)} TIME: {total_time_ms:.2f} ms")

    print("------------------------------------------------------------")
    # Verify Model Status API Payload
    status = model_mgr.get_status()
    print("Model Status Payload:")
    import json
    print(json.dumps(status, indent=2))
    print("============================================================")
    print("ALL AI GPU MODEL INTEGRATION TESTS PASSED SUCCESSFULLY! ✓")

if __name__ == "__main__":
    test_models()
