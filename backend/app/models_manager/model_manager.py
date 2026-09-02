"""
Centralized GPU ModelManager for TRINETRA AI Engine.
Integrates real HuggingFace & PaddleOCR AI models on NVIDIA GPU (CUDA):
1. Vehicle Detector: Perception365/VehicleNet-Y26x (models/vehicle/best.pt)
2. Plate Detector:   vivekvar/helmet-v5 (models/plate/models/plate_yolo_ft.pt)
3. ANPR OCR:         PaddleOCR (GPU Accelerated)
"""
import os
import sys
import time
import base64
import logging
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import cv2
import torch

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

from ..config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TRINETRA.ModelManager")

class ModelManager:
    _instance: Optional['ModelManager'] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.device_str = settings.DEVICE
        if self.device_str == "cuda" and not torch.cuda.is_available():
            logger.error("CUDA requested in settings (DEVICE=cuda) but CUDA is NOT available!")
            raise RuntimeError("CUDA GPU device requested (DEVICE=cuda) but torch.cuda.is_available() is False.")

        self.device = torch.device("cuda:0" if (self.device_str == "cuda" and torch.cuda.is_available()) else "cpu")
        self.gpu_name = torch.cuda.get_device_name(0) if (self.device.type == "cuda") else "CPU"

        self.vehicle_yolo = None
        self.plate_yolo = None
        self.paddle_ocr = None

        self._is_loaded = False
        self._initialized = True
        logger.info(f"ModelManager initialized. Target Device: {self.device} ({self.gpu_name})")

    def load_all_models(self):
        """Preload all AI models once onto GPU VRAM."""
        if self._is_loaded:
            logger.info("Models already loaded and ready in GPU VRAM.")
            return

        logger.info("============================================================")
        logger.info("TRINETRA AI GPU ENGINE INITIALIZATION")
        logger.info("============================================================")
        logger.info(f"Target Device: {self.device} ({self.gpu_name})")
        start_time = time.time()

        # 1. VehicleNet-Y26x
        self._load_vehicle_detector()

        # 2. plate_yolo_ft
        self._load_plate_detector()

        # 3. PaddleOCR Engine
        self._load_ocr_engine()

        # Self-test GPU tensor operation
        self._run_gpu_self_test()

        self._is_loaded = True
        logger.info(f"All AI Models preloaded onto {self.device} in {time.time() - start_time:.2f}s.")
        logger.info("============================================================")

    def _load_vehicle_detector(self):
        v_path = settings.VEHICLE_MODEL_PATH
        if os.path.exists(v_path) and YOLO is not None:
            try:
                self.vehicle_yolo = YOLO(v_path)
                self.vehicle_yolo.to(self.device)
                logger.info(f"Vehicle Model (VehicleNet-Y26x): LOADED ✓ ({self.device})")
            except Exception as e:
                logger.error(f"Failed to load VehicleNet-Y26x model from {v_path}: {e}")
                raise
        else:
            logger.error(f"Vehicle model weight file missing at {v_path}")
            raise FileNotFoundError(f"Vehicle model file not found at {v_path}")

    def _load_plate_detector(self):
        p_path = settings.PLATE_MODEL_PATH
        if os.path.exists(p_path) and YOLO is not None:
            try:
                self.plate_yolo = YOLO(p_path)
                self.plate_yolo.to(self.device)
                logger.info(f"Plate Model (plate_yolo_ft):     LOADED ✓ ({self.device})")
            except Exception as e:
                logger.error(f"Failed to load plate model from {p_path}: {e}")
                raise
        else:
            logger.error(f"Plate model weight file missing at {p_path}")
            raise FileNotFoundError(f"Plate model file not found at {p_path}")

    def _load_ocr_engine(self):
        if PaddleOCR is not None:
            try:
                use_gpu = (self.device.type == "cuda")
                self.paddle_ocr = PaddleOCR(use_angle_cls=False, lang='en', use_gpu=use_gpu)
                logger.info(f"ANPR OCR (PaddleOCR Engine):     LOADED ✓ ({self.device})")
            except Exception as e:
                logger.error(f"Failed to load PaddleOCR engine: {e}")
                raise
        else:
            logger.error("PaddleOCR library not installed.")
            raise ImportError("PaddleOCR package is required.")

    def _run_gpu_self_test(self):
        """Execute a quick warm-up self test on GPU."""
        try:
            with torch.inference_mode():
                dummy_img = np.zeros((300, 300, 3), dtype=np.uint8)
                if self.vehicle_yolo:
                    _ = self.vehicle_yolo(dummy_img, verbose=False, device=str(self.device))
                if self.plate_yolo:
                    _ = self.plate_yolo(dummy_img, verbose=False, device=str(self.device))
            logger.info(f"GPU Self-Test Status:            PASSED ✓ ({self.gpu_name})")
        except Exception as e:
            logger.error(f"GPU Self-test failed: {e}")
            raise

    def get_status(self) -> Dict[str, Any]:
        """Return live GPU status and model readiness for /api/models/status endpoint."""
        vram_used = 0.0
        vram_total = 0.0
        if torch.cuda.is_available():
            vram_used = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2)
            vram_total = round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 2)

        return {
            "device": str(self.device),
            "gpu": self.gpu_name,
            "vram_used_mb": vram_used,
            "vram_total_mb": vram_total,
            "models": {
                "vehicle": {
                    "name": "VehicleNet-Y26x",
                    "loaded": self.vehicle_yolo is not None,
                    "device": str(self.device),
                    "path": settings.VEHICLE_MODEL_PATH
                },
                "plate": {
                    "name": "plate_yolo_ft",
                    "loaded": self.plate_yolo is not None,
                    "device": str(self.device),
                    "path": settings.PLATE_MODEL_PATH
                },
                "anpr": {
                    "name": "PaddleOCR Engine",
                    "loaded": self.paddle_ocr is not None,
                    "device": str(self.device),
                    "path": "PaddleOCR GPU"
                }
            }
        }

    def detect_vehicles(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """Run VehicleNet-Y26x YOLO model inference on GPU."""
        if self.vehicle_yolo is None or frame_bgr is None or frame_bgr.size == 0:
            return []

        vehicles = []
        with torch.inference_mode():
            res = self.vehicle_yolo(frame_bgr, conf=settings.CONFIDENCE_THRESHOLD, verbose=False, device=str(self.device))
            for box in res[0].boxes:
                xyxy = box.xyxy[0].cpu().numpy()
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                cls_name = self.vehicle_yolo.names.get(cls_id, "Car")
                vehicles.append({
                    "bbox": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                    "class": cls_name,
                    "confidence": round(conf, 2)
                })
        return vehicles

    def detect_plates(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """Run plate_yolo_ft YOLO license plate model inference on GPU."""
        if self.plate_yolo is None or frame_bgr is None or frame_bgr.size == 0:
            return []

        plates = []
        with torch.inference_mode():
            res = self.plate_yolo(frame_bgr, conf=settings.PLATE_CONFIDENCE_THRESHOLD, verbose=False, device=str(self.device))
            for box in res[0].boxes:
                xyxy = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0].item())
                plates.append({
                    "bbox": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                    "confidence": round(conf, 2)
                })
        return plates

    def recognize_plate_text(self, plate_crop: np.ndarray) -> Tuple[str, float]:
        """Run PaddleOCR on plate crop image. Returns ONLY actual decoded text."""
        if self.paddle_ocr is None or plate_crop is None or plate_crop.size == 0:
            return "", 0.0

        try:
            res = self.paddle_ocr.ocr(plate_crop, cls=False)
            if not res or not res[0]:
                return "", 0.0

            texts = []
            confs = []
            for line in res[0]:
                text_info = line[1]
                t_str = text_info[0].strip().upper()
                c_val = float(text_info[1])
                # Filter alphanumeric license plate text
                clean_t = ''.join(ch for ch in t_str if ch.isalnum() or ch == ' ')
                if clean_t:
                    texts.append(clean_t)
                    confs.append(c_val)

            if texts:
                final_text = " ".join(texts)
                avg_conf = sum(confs) / len(confs)
                return final_text, round(avg_conf, 2)
        except Exception as e:
            logger.warning(f"PaddleOCR crop evaluation exception: {e}")

        return "", 0.0

    def detect_vehicles_and_plates(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Unified Real End-to-End Inference Pipeline:
        1. Run GPU Vehicle Detection (VehicleNet-Y26x)
        2. Run GPU Plate Detection (plate_yolo_ft)
        3. Match plates to vehicles & run PaddleOCR on crops
        Returns ONLY actual model inference detections. ZERO fake or random data!
        """
        if frame_bgr is None or frame_bgr.size == 0:
            return []

        start_ts = time.time()
        detected_vehicles = self.detect_vehicles(frame_bgr)
        detected_plates = self.detect_plates(frame_bgr)

        results = []
        h, w = frame_bgr.shape[:2]

        for p_idx, plate in enumerate(detected_plates):
            px1, py1, px2, py2 = plate["bbox"]
            plate_crop = frame_bgr[max(0, py1):min(h, py2), max(0, px1):min(w, px2)]
            plate_text, ocr_conf = self.recognize_plate_text(plate_crop)

            # Match plate to nearest vehicle box if available
            matched_v = None
            for v in detected_vehicles:
                vx1, vy1, vx2, vy2 = v["bbox"]
                if vx1 <= px1 <= vx2 and vy1 <= py1 <= vy2:
                    matched_v = v
                    break

            vehicle_class = matched_v["class"] if matched_v else "Vehicle"
            vehicle_conf = matched_v["confidence"] if matched_v else plate["confidence"]

            results.append({
                "id": f"DET-{int(time.time()*1000)%100000}-{p_idx+1}",
                "plateNumber": plate_text,  # Only actual OCR text (empty string if unread)
                "confidence": plate["confidence"],
                "ocrConfidence": ocr_conf,
                "vehicleClass": vehicle_class,
                "vehicleConfidence": vehicle_conf,
                "bbox": [px1, py1, px2, py2],
                "vehicleBbox": matched_v["bbox"] if matched_v else [px1, py1, px2, py2],
                "timestamp": time.strftime("%I:%M:%S %p"),
                "device": str(self.device),
                "inference_time_ms": round((time.time() - start_ts) * 1000, 2)
            })

        # Include vehicle detections even if plate was unreadable
        if not detected_plates and detected_vehicles:
            for v_idx, v in enumerate(detected_vehicles):
                vx1, vy1, vx2, vy2 = v["bbox"]
                results.append({
                    "id": f"VEH-{int(time.time()*1000)%100000}-{v_idx+1}",
                    "plateNumber": "",
                    "confidence": v["confidence"],
                    "ocrConfidence": 0.0,
                    "vehicleClass": v["class"],
                    "vehicleConfidence": v["confidence"],
                    "bbox": [vx1, vy1, vx2, vy2],
                    "vehicleBbox": [vx1, vy1, vx2, vy2],
                    "timestamp": time.strftime("%I:%M:%S %p"),
                    "device": str(self.device),
                    "inference_time_ms": round((time.time() - start_ts) * 1000, 2)
                })

        return results

    def annotate_image(self, frame_bgr: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
        """
        Draw clean YOLO-style labeled bounding box overlays directly onto image frame
        matching the exact visual layout requested by user (e.g. "Car 0.94", "Bus 0.96", "Truck 0.97").
        """
        if frame_bgr is None or frame_bgr.size == 0:
            return frame_bgr

        annotated = frame_bgr.copy()
        color_map = {
            "Car": (0, 0, 230),       # Red
            "Bus": (0, 165, 255),     # Orange
            "Truck": (0, 140, 255),   # Dark Orange
            "Two-wheeler": (255, 0, 0),# Blue
            "Vehicle": (0, 200, 0)    # Green
        }

        for det in detections:
            v_bbox = det.get("vehicleBbox") or det.get("bbox")
            v_class = det.get("vehicleClass", "Vehicle")
            v_conf = det.get("vehicleConfidence", det.get("confidence", 0.90))
            plate = det.get("plateNumber", "")

            color = color_map.get(v_class, (0, 0, 230))
            vx1, vy1, vx2, vy2 = [int(v) for v in v_bbox]

            # 1. Draw vehicle bounding box
            cv2.rectangle(annotated, (vx1, vy1), (vx2, vy2), color, 2)

            # 2. Label badge (e.g. "Car 0.94")
            label_text = f"{v_class} {v_conf:.2f}"
            if plate:
                label_text += f" | {plate}"

            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (vx1, vy1 - th - 6), (vx1 + tw + 8, vy1), color, -1)
            cv2.putText(annotated, label_text, (vx1 + 4, vy1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

            # 3. Draw plate box if available
            p_bbox = det.get("bbox")
            if p_bbox and p_bbox != v_bbox:
                px1, py1, px2, py2 = [int(v) for v in p_bbox]
                cv2.rectangle(annotated, (px1, py1), (px2, py2), (0, 255, 255), 2)

        return annotated

    def frame_to_base64(self, frame_bgr: np.ndarray) -> str:
        """Encode BGR image frame to Base64 data URL string."""
        if frame_bgr is None or frame_bgr.size == 0:
            return ""
        _, buffer = cv2.imencode('.jpg', frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        encoded = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded}"

def get_model_manager() -> ModelManager:
    return ModelManager()
