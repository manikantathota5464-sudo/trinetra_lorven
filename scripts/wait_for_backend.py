"""
Health Check & AI Model Startup Waiter for TRINETRA Console Scripts.
"""
import urllib.request
import time
import sys

def wait_for_backend(url="http://127.0.0.1:8000/health", timeout_seconds=40):
    start = time.time()
    print("[HEALTH] Waiting for TRINETRA AI Engine & Model Preloading...")
    for _ in range(timeout_seconds):
        try:
            res = urllib.request.urlopen(url, timeout=2)
            if res.status == 200:
                print(f"[HEALTH] AI Engine Active & Fully Preloaded ✓ (Ready in {time.time() - start:.2f}s)")
                return True
        except Exception:
            pass
        time.sleep(1.0)
    print("[WARNING] AI Engine response timeout. Proceeding...")
    return False

if __name__ == "__main__":
    wait_for_backend()
