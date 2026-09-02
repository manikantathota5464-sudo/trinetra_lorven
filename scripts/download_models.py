"""
Download required Hugging Face model weight files into TRINETRA models/ directory:
1. Vehicle Detection: Perception365/VehicleNet-Y26x (best.pt)
2. Plate Detection: vivekvar/helmet-v5 (plate_yolo_ft.pt)
3. ANPR OCR: Awiros/anpr-ocr (model.safetensors)
"""
import os
import sys
import urllib.request
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TRINETRA.Downloader")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_DOWNLOADS = [
    {
        "name": "VehicleNet-Y26x Vehicle Detector",
        "url": "https://huggingface.co/Perception365/VehicleNet-Y26x/resolve/main/weights/best.pt",
        "dest": os.path.join(MODELS_DIR, "vehicle", "best.pt")
    },
    {
        "name": "YOLO License Plate Detector",
        "url": "https://huggingface.co/vivekvar/helmet-v5/resolve/main/models/plate_yolo_ft.pt",
        "dest": os.path.join(MODELS_DIR, "plate", "models", "plate_yolo_ft.pt")
    },
    {
        "name": "Awiros ANPR OCR Safetensors",
        "url": "https://huggingface.co/Awiros/anpr-ocr/resolve/main/model.safetensors",
        "dest": os.path.join(MODELS_DIR, "ocr", "Awiros-ANPR-OCR", "model.safetensors")
    }
]

def download_file(url: str, dest_path: str, name: str):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        logger.info(f"[EXISTS] {name} already present at {dest_path} ({os.path.getsize(dest_path)/(1024*1024):.2f} MB)")
        return

    logger.info(f"[DOWNLOADING] {name} from {url} ...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            total_size = int(response.getheader('Content-Length', 0))
            bytes_so_far = 0
            block_size = 1024 * 1024
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                bytes_so_far += len(buffer)
                out_file.write(buffer)
                if total_size > 0:
                    percent = (bytes_so_far / total_size) * 100
                    sys.stdout.write(f"\r  -> {percent:.1f}% ({bytes_so_far/(1024*1024):.1f} MB / {total_size/(1024*1024):.1f} MB)")
                    sys.stdout.flush()
            print()
        logger.info(f"[SUCCESS] Downloaded {name} -> {dest_path}")
    except Exception as e:
        logger.error(f"[ERROR] Failed to download {name}: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)

def main():
    logger.info("Starting TRINETRA Hugging Face Model Weights Download...")
    for item in MODEL_DOWNLOADS:
        download_file(item["url"], item["dest"], item["name"])
    logger.info("All model weight downloads completed.")

if __name__ == "__main__":
    main()
