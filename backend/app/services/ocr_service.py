"""
Unified ANPR OCR Service for TRINETRA AI Engine.
Integrates Awiros-ANPR-OCR specialist model (PP-OCRv5 backbone SVTR_HGNet)
with batch inference, startup warmup, track-level caching, and backward-compatible signature.
"""
import os
import sys
import copy
import time
import logging
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
import cv2
import safetensors.numpy

from ..config import settings

logger = logging.getLogger("TRINETRA.OCRService")

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

class OCRService:
    """
    Specialist ANPR OCR Service built on Awiros-ANPR-OCR.
    Processes license plate crops directly (no redundant text-detection pass).
    Supports batch recognition and BoT-SORT track_id result caching.
    """
    _instance: Optional['OCRService'] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.model = None
        self.post_process = None
        self.paddle_lib = None
        self._track_cache: Dict[int, Tuple[str, float]] = {}  # Key: track_id, Value: (plate_text, confidence)
        self._is_loaded = False
        self._initialized = True

    def load_model(self):
        """Load local Awiros-ANPR-OCR model weights and run GPU/CPU warmup."""
        if self._is_loaded:
            return

        ocr_path = settings.ANPR_MODEL_PATH
        if not os.path.exists(ocr_path):
            logger.error(f"Awiros-ANPR-OCR model file not found at {ocr_path}")
            return

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
            paddle.set_device('cpu')  # Stable cross-platform CPU tensor execution for Paddle 3.0

            self.post_process = build_post_process({
                "name": "CTCLabelDecode",
                "character_dict_path": dict_path,
                "use_space_char": True,
            })

            config = copy.deepcopy(AWIROS_MODEL_CONFIG)
            self.model = ppocr_build_model(config["Architecture"])
            self.model.eval()

            np_state = safetensors.numpy.load_file(ocr_path)
            state_dict = {k: paddle.to_tensor(v) for k, v in np_state.items()}
            self.model.set_state_dict(state_dict)

            # Warmup model execution
            dummy_crop = np.zeros((48, 320, 3), dtype=np.uint8)
            self.recognize(dummy_crop)

            self._is_loaded = True
            logger.info(f"OCRService: Loaded Awiros-ANPR-OCR ({len(np_state)} tensors) with startup warmup complete ✓")
        except Exception as e:
            logger.error(f"OCRService load error: {e}")
            self.model = None

    def preprocess_crop(self, img_bgr: np.ndarray, target_shape=[3, 48, 320]) -> np.ndarray:
        """Preprocess license plate crop to target shape [C, H, W]."""
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

    def _unpack_preds(self, preds: Any) -> Any:
        if isinstance(preds, dict):
            return preds.get("ctc", next(iter(preds.values())))
        elif isinstance(preds, (list, tuple)):
            first = preds[0]
            if isinstance(first, dict):
                return first.get("ctc", next(iter(first.values())))
            return first
        return preds

    def recognize(self, plate_crop: np.ndarray) -> Tuple[str, float]:
        """
        Recognize text from a single cropped plate image.
        Returns: (cleaned_plate_string, confidence_score)
        """
        if plate_crop is None or plate_crop.size == 0 or self.model is None:
            return "", 0.0

        results = self.recognize_batch([plate_crop])
        return results[0] if results else ("", 0.0)

    def recognize_batch(self, crops: List[np.ndarray]) -> List[Tuple[str, float]]:
        """
        Run batched recognition on multiple plate crops simultaneously.
        Returns: List of (cleaned_plate_string, confidence_score)
        """
        if not crops or self.model is None or self.paddle_lib is None:
            return [("", 0.0)] * len(crops)

        valid_indices = []
        preprocessed = []
        for i, c in enumerate(crops):
            if c is not None and c.size > 0:
                valid_indices.append(i)
                preprocessed.append(self.preprocess_crop(c))

        if not preprocessed:
            return [("", 0.0)] * len(crops)

        results = [("", 0.0)] * len(crops)
        try:
            batch_np = np.stack(preprocessed, axis=0)
            tensor_batch = self.paddle_lib.to_tensor(batch_np)

            with self.paddle_lib.no_grad():
                preds = self.model(tensor_batch)
                pred_tensor = self._unpack_preds(preds)
                post_results = self.post_process(pred_tensor.numpy())

            for orig_idx, (text, conf) in zip(valid_indices, post_results):
                clean_text = ''.join(ch for ch in str(text).upper() if ch.isalnum())
                results[orig_idx] = (clean_text, round(float(conf), 4))
        except Exception as e:
            import traceback
            logger.error(f"Batched OCR evaluation exception: {type(e).__name__}: {e}\n{traceback.format_exc()}")

        return results

    # Track-level result caching keyed on BoT-SORT track_id (per User Directive #5)
    def get_cached_track_result(self, track_id: int) -> Optional[Tuple[str, float]]:
        return self._track_cache.get(track_id)

    def cache_track_result(self, track_id: int, result: Tuple[str, float]):
        text, conf = result
        if text and conf >= 0.50:
            existing = self._track_cache.get(track_id)
            if not existing or conf > existing[1]:
                self._track_cache[track_id] = (text, conf)

    def clear_cache(self):
        self._track_cache.clear()

def get_ocr_service() -> OCRService:
    svc = OCRService()
    svc.load_model()
    return svc
