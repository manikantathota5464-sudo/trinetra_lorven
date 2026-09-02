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
            logger.error("CUDA requested in settings (DEVICE=cuda) but CUDA is NOT available!")
            raise RuntimeError("CUDA GPU device requested (DEVICE=cuda) but torch.cuda.is_available() is False.")

        self.device = torch.device("cuda:0" if (self.device_str == "cuda" and torch.cuda.is_available()) else "cpu")
        self.gpu_name = torch.cuda.get_device_name(0) if (self.device.type == "cuda") else "CPU"

        self.vehicle_yolo = None
        self.plate_yolo = None
        
        # HuggingFace Awiros ANPR OCR Model Engine
        self.awiros_model = None
        self.awiros_post_process = None
        self.paddle_lib = None

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
        """Load https://huggingface.co/Awiros/anpr-ocr (model.safetensors + en_dict.txt)"""
        ocr_path = settings.ANPR_MODEL_PATH
        dict_path = os.path.join(os.path.dirname(ocr_path), "en_dict.txt")
        awiros_dir = Path(os.path.dirname(ocr_path)).resolve()

        pocr_path = str(awiros_dir / "PaddleOCR")
        if pocr_path not in sys.path:
            sys.path.insert(0, pocr_path)

        try:
            import paddle
            from ppocr.modeling.architectures import build_model as ppocr_build_model
            from ppocr.postprocess import build_post_process

            self.paddle_lib = paddle
            paddle.set_device('cpu')

            # Build CTC post-processor with HuggingFace dictionary
            self.awiros_post_process = build_post_process({
                "name": "CTCLabelDecode",
                "character_dict_path": dict_path,
                "use_space_char": True,
            })

            # Build model architecture & load safetensors weights
            config = copy.deepcopy(AWIROS_MODEL_CONFIG)
            self.awiros_model = ppocr_build_model(config["Architecture"])
            self.awiros_model.eval()

            np_state = safetensors.numpy.load_file(ocr_path)
            state_dict = {k: paddle.to_tensor(v) for k, v in np_state.items()}
            self.awiros_model.set_state_dict(state_dict)

            logger.info(f"ANPR OCR (Awiros-ANPR-OCR HuggingFace Model): LOADED ✓ ({len(np_state)} tensors)")
        except Exception as e:
            logger.error(f"Failed to load HuggingFace Awiros ANPR-OCR model from {ocr_path}: {e}")
            raise

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
        """Run HuggingFace Awiros-ANPR-OCR model on license plate crop."""
        if self.awiros_model is None or plate_crop is None or plate_crop.size == 0:
            return "", 0.0

        try:
            inp = self._preprocess_crop(plate_crop)
            tensor = self.paddle_lib.to_tensor(np.expand_dims(inp, axis=0))

            with self.paddle_lib.no_grad():
                preds = self.awiros_model(tensor)

            if isinstance(preds, dict):
                pred_tensor = preds.get("ctc", next(iter(preds.values())))
            elif isinstance(preds, (list, tuple)):
                pred_tensor = preds[0]
            else:
                pred_tensor = preds

            post_result = self.awiros_post_process(pred_tensor.numpy())
            if isinstance(post_result, (list, tuple)) and len(post_result) > 0:
                text, confidence = post_result[0]
                text = text.strip().upper()
                clean_text = ''.join(ch for ch in text if ch.isalnum() or ch == ' ')
                return clean_text, round(float(confidence), 2)
        except Exception as e:
            logger.warning(f"Awiros-ANPR-OCR crop evaluation exception: {e}")

        return "", 0.0

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
                "plateNumber": plate_text,  # Only actual decoded text from Awiros-ANPR-OCR
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
