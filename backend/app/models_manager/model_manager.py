"""
Centralized ModelManager for TRINETRA AI Engine.
Integrates exact HuggingFace AI models:
1. Vehicle Detector: Perception365/VehicleNet-Y26x (models/vehicle/best.pt)
2. Plate Detector:   vivekvar/helmet-v5 (models/plate/models/plate_yolo_ft.pt)
3. ANPR OCR:         Awiros/anpr-ocr (models/ocr/Awiros-ANPR-OCR/model.safetensors)
"""
import os
import sys
import time
import base64
import copy
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import cv2
import torch

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

import safetensors.numpy

from ..config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TRINETRA.ModelManager")

# ---------------------------------------------------------------------------
# HuggingFace Awiros-ANPR-OCR SVTR_HGNet Architecture Config
# ---------------------------------------------------------------------------
CTC_NUM_CLASSES = 64
NRTR_NUM_CLASSES = 67

AWIROS_MODEL_CONFIG = {
    "Architecture": {
        "model_type": "rec",
        "algorithm": "SVTR_HGNet",
        "Transform": None,
        "Backbone": {"name": "PPHGNetV2_B4", "text_rec": True},
        "Head": {
            "name": "MultiHead",
            "out_channels_list": {
                "CTCLabelDecode": CTC_NUM_CLASSES,
                "NRTRLabelDecode": NRTR_NUM_CLASSES,
            },
            "head_list": [
                {
                    "CTCHead": {
                        "Neck": {
                            "name": "svtr",
                            "dims": 120,
                            "depth": 2,
                            "hidden_dims": 120,
                            "kernel_size": [1, 3],
                            "use_guide": True,
                        },
                        "Head": {"fc_decay": 1e-05},
                    }
                },
                {"NRTRHead": {"nrtr_dim": 384, "max_text_length": 25}},
            ],
        },
    },
}

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
            logger.warning("CUDA requested in settings (DEVICE=cuda) but CUDA is NOT available! Falling back to CPU.")
            self.device_str = "cpu"

        self.device = torch.device("cuda:0" if (self.device_str == "cuda" and torch.cuda.is_available()) else "cpu")
        self.gpu_name = torch.cuda.get_device_name(0) if (self.device.type == "cuda") else "CPU"

        self.vehicle_yolo = None
        self.plate_yolo = None
        
        # HuggingFace Awiros ANPR OCR Model Engine
        self.awiros_model = None
        self.awiros_post_process = None
        self.paddle_lib = None

        # Optimize PyTorch CPU threading for fast parallel frame processing
        if self.device.type == "cpu":
            try:
                torch.set_num_threads(max(1, (os.cpu_count() or 4) - 1))
            except Exception:
                pass

        self._is_loaded = False
        self._initialized = True
        logger.info(f"ModelManager initialized. Target Device: {self.device} ({self.gpu_name})")

    def load_all_models(self):
        """Preload all HuggingFace AI models once into memory."""
        if self._is_loaded:
            logger.info("Models already loaded and ready in memory.")
            return

        logger.info("============================================================")
        logger.info("TRINETRA AI GPU ENGINE INITIALIZATION")
        logger.info("============================================================")
        logger.info(f"Target Device: {self.device} ({self.gpu_name})")
        start_time = time.time()

        # 1. VehicleNet-Y26x (HuggingFace)
        self._load_vehicle_detector()

        # 2. plate_yolo_ft (HuggingFace)
        self._load_plate_detector()

        # 3. Awiros ANPR OCR (HuggingFace)
        self._load_ocr_engine()

        # Self-test GPU tensor operation
        self._run_gpu_self_test()

        self._is_loaded = True
        logger.info(f"All AI Models preloaded in {time.time() - start_time:.2f}s.")
        logger.info("============================================================")

    def _load_vehicle_detector(self):
        v_path = settings.VEHICLE_MODEL_PATH
        if os.path.exists(v_path) and YOLO is not None:
            try:
                self.vehicle_yolo = YOLO(v_path)
                self.vehicle_yolo.to(self.device)
                logger.info(f"Vehicle Model (VehicleNet-Y26x HuggingFace): LOADED ✓ ({self.device})")
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
                logger.info(f"Plate Model (plate_yolo_ft HuggingFace):     LOADED ✓ ({self.device})")
            except Exception as e:
                logger.error(f"Failed to load plate model from {p_path}: {e}")
                raise
        else:
            logger.error(f"Plate model weight file missing at {p_path}")
            raise FileNotFoundError(f"Plate model file not found at {p_path}")

    def _load_ocr_engine(self):
        """Load Awiros ANPR OCR service."""
        try:
            from ..services.ocr_service import get_ocr_service
            self.ocr_service = get_ocr_service()
            logger.info("Awiros-ANPR-OCR Service:                   LOADED ✓")
        except Exception as e:
            logger.error(f"Failed to initialize OCRService: {e}")
            self.ocr_service = None

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
                    "name": "VehicleNet-Y26x (HuggingFace)",
                    "loaded": self.vehicle_yolo is not None,
                    "device": str(self.device),
                    "path": settings.VEHICLE_MODEL_PATH
                },
                "plate": {
                    "name": "plate_yolo_ft (HuggingFace)",
                    "loaded": self.plate_yolo is not None,
                    "device": str(self.device),
                    "path": settings.PLATE_MODEL_PATH
                },
                "anpr": {
                    "name": "Awiros-ANPR-OCR (HuggingFace)",
                    "loaded": self.awiros_model is not None,
                    "device": "cpu",
                    "path": settings.ANPR_MODEL_PATH
                }
            }
        }

    def detect_vehicles(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """Run VehicleNet-Y26x YOLO model inference on GPU."""
        if self.vehicle_yolo is None or frame_bgr is None or frame_bgr.size == 0:
            return []

        vehicles = []
        use_half = (self.device.type == "cuda")
        with torch.inference_mode():
            res = self.vehicle_yolo(frame_bgr, conf=settings.CONFIDENCE_THRESHOLD, verbose=False, device=str(self.device), half=use_half)
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
        use_half = (self.device.type == "cuda")
        with torch.inference_mode():
            res = self.plate_yolo(frame_bgr, conf=settings.PLATE_CONFIDENCE_THRESHOLD, verbose=False, device=str(self.device), half=use_half)
            for box in res[0].boxes:
                xyxy = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0].item())
                plates.append({
                    "bbox": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                    "confidence": round(conf, 2)
                })
        return plates

    def _preprocess_crop(self, img_bgr: np.ndarray, target_shape=[3, 48, 320]) -> np.ndarray:
        """Preprocess license plate crop for Awiros-ANPR-OCR."""
        _, h, w = target_shape
        img_h, img_w = img_bgr.shape[:2]
        ratio = h / max(1, img_h)
        new_w = min(int(img_w * ratio), w)
        resized = cv2.resize(img_bgr, (max(1, new_w), h))
        if new_w < w:
            padded = np.zeros((h, w, 3), dtype=np.uint8)
            padded[:, :new_w, :] = resized
            resized = padded

        img = resized.astype(np.float32) / 255.0
        img = (img - 0.5) / 0.5
        return img.transpose((2, 0, 1))

    def recognize_plate_text(self, plate_crop: np.ndarray) -> Tuple[str, float]:
        """
        Run Awiros-ANPR-OCR model on license plate crops.
        Returns decoded license plate characters and confidence.
        """
        if plate_crop is None or plate_crop.size == 0:
            return "", 0.0

        # Sub-crop tightening ONLY if a full loose vehicle crop is passed (width > 120 and height > 80)
        h_c, w_c = plate_crop.shape[:2]
        if w_c > 120 and h_c > 80:
            try:
                inner_plates = self.detect_plates(plate_crop)
                if inner_plates and len(inner_plates) > 0:
                    ipx1, ipy1, ipx2, ipy2 = inner_plates[0]["bbox"]
                    plate_crop = plate_crop[max(0, ipy1):min(h_c, ipy2), max(0, ipx1):min(w_c, ipx2)]
            except Exception as e:
                logger.debug(f"Plate sub-crop extraction exception: {e}")

        if hasattr(self, 'ocr_service') and self.ocr_service is not None:
            return self.ocr_service.recognize(plate_crop)
        return "", 0.0

    def recognize_plate_text_batch(self, crops: List[np.ndarray]) -> List[Tuple[str, float]]:
        """Run batched Awiros-ANPR-OCR model inference across multiple plate crops."""
        if not crops:
            return []

        processed_crops = []
        for plate_crop in crops:
            if plate_crop is not None and plate_crop.size > 0:
                h_c, w_c = plate_crop.shape[:2]
                if w_c > 120 and h_c > 80:
                    try:
                        inner_plates = self.detect_plates(plate_crop)
                        if inner_plates and len(inner_plates) > 0:
                            ipx1, ipy1, ipx2, ipy2 = inner_plates[0]["bbox"]
                            plate_crop = plate_crop[max(0, ipy1):min(h_c, ipy2), max(0, ipx1):min(w_c, ipx2)]
                    except Exception as e:
                        logger.debug(f"Plate sub-crop extraction exception in batch: {e}")
            processed_crops.append(plate_crop)

        if hasattr(self, 'ocr_service') and self.ocr_service is not None:
            return self.ocr_service.recognize_batch(processed_crops)
        return [("", 0.0)] * len(crops)

    def detect_vehicles_and_plates(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Unified Real End-to-End Inference Pipeline:
        1. Run GPU Vehicle Detection (VehicleNet-Y26x)
        2. Run GPU Plate Detection (plate_yolo_ft)
        3. Match plates to vehicles & run HuggingFace Awiros-ANPR-OCR on crops
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
                "plateNumber": plate_text if plate_text else "UNREADABLE",
                "confidence": round(ocr_conf, 2),
                "ocrConfidence": round(ocr_conf, 2),
                "vehicleClass": vehicle_class,
                "vehicleConfidence": vehicle_conf,
                "bbox": [px1, py1, px2, py2],
                "vehicleBbox": matched_v["bbox"] if matched_v else [px1, py1, px2, py2],
                "timestamp": time.strftime("%I:%M:%S %p"),
                "device": str(self.device),
                "inference_time_ms": round((time.time() - start_ts) * 1000, 2)
            })

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
        """Draw clean YOLO-style labeled bounding box overlays directly onto image frame."""
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

            cv2.rectangle(annotated, (vx1, vy1), (vx2, vy2), color, 2)

            label_text = f"{v_class} {v_conf:.2f}"
            if plate:
                label_text += f" | {plate}"

            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (vx1, vy1 - th - 6), (vx1 + tw + 8, vy1), color, -1)
            cv2.putText(annotated, label_text, (vx1 + 4, vy1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

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
