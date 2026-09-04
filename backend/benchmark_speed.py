"""
Speed & Performance Benchmark for TRINETRA AI Engine.
Measures:
1. Image inference execution time (ms & FPS)
2. 10-second video processing speed (total frames, sampled frames, total time in sec, processing FPS, and Real-Time Speedup Factor)
"""
import os
import sys
import time
import cv2
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.models_manager.model_manager import get_model_manager
from backend.app.processing.image_processor import process_image_file
from backend.app.processing.video_processor import process_video_file
from backend.app.jobs.job_manager import get_job_manager
from backend.app.config import settings

def run_benchmark():
    print("==================================================")
    print(" TRINETRA AI ENGINE SPEED BENCHMARK")
    print("==================================================")
    
    model_mgr = get_model_manager()
    model_mgr.load_all_models()
    job_mgr = get_job_manager()

    # ----------------------------------------------------
    # BENCHMARK 1: SINGLE IMAGE INFERENCE
    # ----------------------------------------------------
    print("\n--- [BENCHMARK 1] Single Image Processing Speed ---")
    test_img_path = os.path.join(settings.UPLOAD_DIR, "benchmark_sample_image.jpg")
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (150, 180), (490, 360), (40, 40, 200), -1)
    cv2.rectangle(img, (260, 300), (380, 335), (255, 255, 255), -1)
    cv2.putText(img, "AP09 AB 1234", (270, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
    cv2.imwrite(test_img_path, img)

    # Warmup
    _ = model_mgr.detect_vehicles_and_plates(img)

    # Benchmark 5 runs
    times = []
    for i in range(5):
        t0 = time.time()
        results = model_mgr.detect_vehicles_and_plates(img)
        t_elapsed = (time.time() - t0) * 1000.0  # ms
        times.append(t_elapsed)

    avg_img_ms = np.mean(times)
    img_fps = 1000.0 / avg_img_ms

    print(f"  Image Resolution  : 640x480")
    print(f"  Target Device     : {model_mgr.device} ({model_mgr.gpu_name})")
    print(f"  Average Execution : {avg_img_ms:.2f} ms per image")
    print(f"  Image Throughput  : {img_fps:.1f} Images/sec")

    # ----------------------------------------------------
    # BENCHMARK 2: 10-SECOND VIDEO PROCESSING SPEED
    # ----------------------------------------------------
    print("\n--- [BENCHMARK 2] 10-Second Video Processing Speed ---")
    # Generate 10-second video (30 FPS = 300 frames)
    test_vid_path = os.path.join(settings.UPLOAD_DIR, "benchmark_10s_video.mp4")
    fps = 30.0
    duration_sec = 10.0
    total_frames = int(fps * duration_sec)  # 300 frames

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(test_vid_path, fourcc, fps, (640, 480))
    for i in range(total_frames):
        f_img = np.zeros((480, 640, 3), dtype=np.uint8)
        # Moving vehicle across frames
        offset = int(i * 1.5)
        cv2.rectangle(f_img, (100 + offset, 180), (440 + offset, 360), (40, 40, 200), -1)
        cv2.rectangle(f_img, (210 + offset, 300), (330 + offset, 335), (255, 255, 255), -1)
        cv2.putText(f_img, "AP09 AB 1234", (220 + offset, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        out.write(f_img)
    out.release()

    job_id = job_mgr.create_job(job_type="video", file_path=test_vid_path)

    t0_vid = time.time()
    vid_results = process_video_file(test_vid_path, job_id, job_mgr, sample_rate=settings.FRAME_SAMPLE_RATE)
    total_vid_time = time.time() - t0_vid

    processed_frames = vid_results["processed_frames"]
    processing_fps = vid_results["fps"]
    speedup_factor = duration_sec / max(0.001, total_vid_time)
    tb = vid_results.get("timing_breakdown", {})

    print(f"  Video Duration    : {duration_sec:.1f} seconds ({total_frames} frames @ {fps:.0f} FPS)")
    print(f"  Frame Sample Rate : Every {settings.FRAME_SAMPLE_RATE}th frame ({processed_frames} sampled frames)")
    print(f"  BoT-SORT Tracker  : Active (Tracked {vid_results['botsort']['unique_vehicles_tracked']} unique vehicles)")
    print(f"  Total Process Time: {total_vid_time:.2f} seconds")
    print(f"  Effective Speed   : {processing_fps:.1f} FPS (Sampled frames)")
    print(f"  Overall Throughput: {total_frames / total_vid_time:.1f} FPS (Total video frames)")
    print(f"  Real-Time Factor  : {speedup_factor:.2f}x Real-Time ({speedup_factor:.2f}x faster than 10s video duration)")

    print("\n--- [STAGE-BY-STAGE TIMING BREAKDOWN (AVERAGE PER SAMPLED FRAME)] ---")
    print(f"  Frame Reading & Decoding : {tb.get('avg_frame_read_ms', 0):.2f} ms")
    print(f"  Vehicle Detection (GPU)  : {tb.get('avg_vehicle_det_ms', 0):.2f} ms")
    print(f"  Plate Detection (GPU)    : {tb.get('avg_plate_det_ms', 0):.2f} ms")
    print(f"  BoT-SORT Tracker Update  : {tb.get('avg_tracker_ms', 0):.2f} ms")
    print(f"  Plate Crop & Match       : {tb.get('avg_crop_ms', 0):.2f} ms")
    print(f"  ANPR OCR Recognition     : {tb.get('avg_ocr_ms', 0):.2f} ms (Total OCR: {tb.get('total_ocr_ms', 0):.2f} ms)")

    print("\n==================================================")
    print(" BENCHMARK SUMMARY")
    print("==================================================")
    print(f"  1 Single Image   : {avg_img_ms:.2f} ms ({img_fps:.1f} FPS)")
    print(f"  10-Second Video  : {total_vid_time:.2f} seconds total ({speedup_factor:.2f}x real-time speed)")
    print("==================================================")

if __name__ == "__main__":
    run_benchmark()
