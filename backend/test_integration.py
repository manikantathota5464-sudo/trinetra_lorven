"""
Integration test for TRINETRA AI Engine and FastAPI Job Pipeline.
Validates:
- /health endpoint
- Instant job return upon upload
- Background processing
- Progress tracking
- Final aggregated result retrieval
- Job cancellation
"""
import sys
import os
import time
import requests
import numpy as np
import cv2
import threading
import uvicorn

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.main import app
from backend.app.config import settings

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def test_pipeline():
    print("==================================================")
    print(" TRINETRA INTEGRATION TEST SUITE")
    print("==================================================")
    
    # 1. Start test server
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    base_url = "http://127.0.0.1:8000"
    for _ in range(20):
        try:
            r = requests.get(f"{base_url}/health")
            if r.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.5)
    
    # 2. Test /health
    print("\n[TEST 1] Verifying /health endpoint...")
    res = requests.get(f"{base_url}/health")
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    health_data = res.json()
    print(f"  Health check response: {health_data}")
    assert health_data["status"] == "ok"
    assert health_data["worker_active"] is True
    print("  [PASS] Health check PASSED")

    # 3. Create dummy test image
    test_img_path = os.path.join(settings.UPLOAD_DIR, "test_sample_vehicle.jpg")
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw car body + plate-like rectangle
    cv2.rectangle(img, (150, 180), (490, 360), (40, 40, 200), -1)
    cv2.rectangle(img, (260, 300), (380, 335), (255, 255, 255), -1)
    cv2.putText(img, "AP09 AB 1234", (270, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
    cv2.imwrite(test_img_path, img)

    # 4. Test Image Upload (Must return immediately)
    print("\n[TEST 2] Testing Image Upload & Instant Job Enqueue...")
    t0 = time.time()
    with open(test_img_path, "rb") as f:
        res = requests.post(f"{base_url}/api/jobs/image", files={"file": ("test_sample_vehicle.jpg", f, "image/jpeg")})
    upload_time = time.time() - t0
    assert res.status_code == 200, f"Image upload failed: {res.text}"
    job_data = res.json()
    job_id = job_data["job_id"]
    print(f"  Uploaded in {upload_time:.3f}s. Job ID: {job_id}, Status: {job_data['status']}")
    assert upload_time < 1.0, f"Upload took too long: {upload_time}s (must be immediate)"
    assert job_data["status"] == "QUEUED"
    print("  [PASS] Instant Job Return PASSED")

    # 5. Poll Job Progress
    print("\n[TEST 3] Polling Job Progress & Background AI Result...")
    completed = False
    for _ in range(20):
        time.sleep(0.4)
        st_res = requests.get(f"{base_url}/api/jobs/{job_id}")
        assert st_res.status_code == 200
        st = st_res.json()
        print(f"  Progress: {st['progress']}% | Stage: {st['stage']} | Status: {st['status']}")
        if st["status"] == "COMPLETED":
            completed = True
            break
        elif st["status"] == "FAILED":
            raise RuntimeError(f"Job failed: {st.get('error')}")

    assert completed, "Job did not complete in time"
    
    # 6. Verify Result
    res_data = requests.get(f"{base_url}/api/jobs/{job_id}/result").json()
    print(f"  Result summary: {res_data['summary']}")
    print(f"  Detections count: {len(res_data['detections'])}")
    for d in res_data['detections']:
        print(f"    - Plate: {d['plateNumber']}, Class: {d['vehicleClass']}, Conf: {d['confidence']}, Violation: {d.get('violation')}")
    assert len(res_data['detections']) > 0
    print("  [PASS] Background Inference & Result Aggregation PASSED")

    # 7. Test Video Creation & Cancellation
    print("\n[TEST 4] Testing Video Job & Cancellation...")
    test_video_path = os.path.join(settings.UPLOAD_DIR, "test_sample_video.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(test_video_path, fourcc, 10.0, (640, 480))
    for i in range(30):
        f_img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(f_img, (150 + i*2, 180), (490 + i*2, 360), (40, 40, 200), -1)
        cv2.rectangle(f_img, (260 + i*2, 300), (380 + i*2, 335), (255, 255, 255), -1)
        cv2.putText(f_img, "AP09 AB 1234", (270 + i*2, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        out.write(f_img)
    out.release()

    with open(test_video_path, "rb") as f:
        res = requests.post(f"{base_url}/api/jobs/video", files={"file": ("test_sample_video.mp4", f, "video/mp4")})
    assert res.status_code == 200
    v_job_id = res.json()["job_id"]
    print(f"  Video job enqueued: {v_job_id}")

    # Immediately cancel
    cancel_res = requests.post(f"{base_url}/api/jobs/{v_job_id}/cancel")
    assert cancel_res.status_code == 200
    print(f"  Cancel response: {cancel_res.json()}")
    assert cancel_res.json()["status"] == "CANCELLED"
    print("  [PASS] Job Cancellation PASSED")

    # 8. Test Full Video Processing & MongoDB Storage
    print("\n[TEST 5] Testing Full Video Processing & MongoDB Storage...")
    with open(test_video_path, "rb") as f:
        res = requests.post(f"{base_url}/api/jobs/video", files={"file": ("test_sample_video.mp4", f, "video/mp4")})
    assert res.status_code == 200
    v_run_id = res.json()["job_id"]
    print(f"  Enqueued full video job: {v_run_id}")

    # Poll until complete
    v_completed = False
    for _ in range(30):
        time.sleep(0.3)
        st = requests.get(f"{base_url}/api/jobs/{v_run_id}").json()
        print(f"  Video Progress: {st['progress']}% | Stage: {st['stage']}")
        if st["status"] == "COMPLETED":
            v_completed = True
            break
        elif st["status"] == "FAILED":
            raise RuntimeError(f"Video job failed: {st.get('error')}")

    assert v_completed, "Video job did not complete in time"
    
    # Verify BoT-SORT structured result
    v_res = requests.get(f"{base_url}/api/jobs/{v_run_id}/result").json()
    print(f"  BoT-SORT tracking summary: {v_res.get('botsort')}")
    assert "botsort" in v_res, "BoT-SORT tracking results missing"
    assert v_res["botsort"]["unique_vehicles_tracked"] > 0
    print(f"  [PASS] BoT-SORT Unique Vehicle Tracking PASSED (Tracked: {v_res['botsort']['unique_vehicles_tracked']})")

    # Verify detections returned from MongoDB API
    dets_res = requests.get(f"{base_url}/api/detections?limit=20").json()
    print(f"  MongoDB Detections API count: {dets_res['count']}")
    assert dets_res['count'] > 0, "No detections found in MongoDB"
    print(f"  Sample MongoDB stored detection: {dets_res['detections'][0]}")
    
    stats_res = requests.get(f"{base_url}/api/stats").json()
    print(f"  MongoDB Stats: {stats_res}")
    assert stats_res['total_detections'] > 0
    print("  [PASS] Full Video Inference & MongoDB Storage PASSED")

    print("\n==================================================")
    print(" ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    test_pipeline()

