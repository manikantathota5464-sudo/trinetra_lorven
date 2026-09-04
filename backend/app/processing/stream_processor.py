"""
Real-Time AI Video Streaming Engine for TRINETRA.
Decodes uploaded video frame-by-frame, executes GPU model inference (VehicleNet-Y26x, plate_yolo_ft, Awiros-ANPR-OCR),
applies BoT-SORT multi-object tracking, performs temporal OCR stabilization, draws YOLO bounding boxes,
and streams low-latency MJPEG video frames directly to the React/Tauri desktop frontend.
"""
import os
import time
import logging
from typing import Dict, Any, Generator, Optional
import cv2
import numpy as np
import torch

from ..models_manager.model_manager import get_model_manager
from ..tracking.botsort import BoTSORTTracker
from ..db.mongodb import db_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TRINETRA.StreamProcessor")

import os
import time
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Generator, Optional, List
import cv2
import numpy as np
import torch

from ..models_manager.model_manager import get_model_manager
from ..tracking.botsort import BoTSORTTracker, BoTTrack
from ..db.mongodb import db_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TRINETRA.StreamProcessor")

class StreamProcessor:
    def __init__(self):
        self.model_mgr = get_model_manager()
        # Thread pool for non-blocking background OCR processing
        self.ocr_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="Stream-OCR-Worker")

    def _submit_background_ocr(self, track: BoTTrack, crop: np.ndarray, matched_class: str, temporal_buffer: Dict[int, Dict[str, Any]]):
        """Dispatches OCR recognition to a background thread, preventing MJPEG stream lag."""
        track.set_ocr_pending(True)
        tid = track.track_id

        def ocr_task():
            try:
                raw_plate_text, ocr_conf = self.model_mgr.recognize_plate_text(crop)
                
                # Temporal OCR Stabilization: Prevents single-frame character flickering
                stable_plate_text = raw_plate_text
                if raw_plate_text:
                    if tid not in temporal_buffer:
                        temporal_buffer[tid] = {"history": {}, "best_text": raw_plate_text, "best_conf": ocr_conf}
                    
                    hist = temporal_buffer[tid]["history"]
                    hist[raw_plate_text] = hist.get(raw_plate_text, 0) + 1

                    most_frequent_text = max(hist.items(), key=lambda item: item[1])[0]
                    if ocr_conf > temporal_buffer[tid]["best_conf"]:
                        temporal_buffer[tid]["best_text"] = raw_plate_text
                        temporal_buffer[tid]["best_conf"] = ocr_conf

                    stable_plate_text = temporal_buffer[tid]["best_text"] if hist.get(temporal_buffer[tid]["best_text"], 0) >= 2 else most_frequent_text
                else:
                    stable_plate_text = temporal_buffer.get(tid, {}).get("best_text", "")

                track.set_ocr_detection(
                    plate=stable_plate_text,
                    confidence=ocr_conf,
                    vehicle_class=matched_class,
                    color="Unknown",
                    violation=None
                )
            except Exception as e:
                logger.debug(f"Background OCR processing exception for track {tid}: {e}")
                track.set_ocr_pending(False)

        self.ocr_executor.submit(ocr_task)

    def generate_mjpeg_stream(self, video_path: str, stream_id: str, sample_rate: int = 5) -> Generator[bytes, None, None]:
        """
        Frame-by-frame live AI inference stream generator with BoT-SORT tracking,
        non-blocking background OCR, and smooth Kalman Filter frame skipping.
        """
        if not os.path.exists(video_path):
            logger.error(f"Stream error: Video file not found at {video_path}")
            return

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Stream error: Failed to open video file {video_path}")
            return

        source_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        target_delay = 1.0 / max(5.0, min(source_fps, 30.0))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Starting Live AI Video Stream [{stream_id}] | BoT-SORT | Sample Rate: {sample_rate} | File: {os.path.basename(video_path)}")

        tracker = BoTSORTTracker(track_thresh=0.35, match_thresh=0.7)
        temporal_ocr_buffer: Dict[int, Dict[str, Any]] = {}
        
        frame_counter = 0
        fps_start_time = time.time()
        current_fps = source_fps
        final_tracked_records = {}
        active_tracks: List[BoTTrack] = []

        try:
            while cap.isOpened():
                frame_start_time = time.time()
                ret, frame = cap.read()
                if not ret:
                    logger.info(f"Live AI Video Stream [{stream_id}] reached end of video file.")
                    break

                frame_counter += 1
                h, w = frame.shape[:2]

                current_sec = frame_counter / max(1.0, source_fps)
                mins, secs = divmod(int(current_sec), 60)
                time_str = f"{mins:02d}:{secs:02d}"

                # Frame skipping logic with smooth BoT-SORT motion updates
                is_sample_frame = (frame_counter == 1) or (sample_rate <= 1) or (frame_counter % sample_rate == 0)

                if is_sample_frame:
                    # 1. Full GPU Vehicle & Plate Detection on Sampled Frame
                    raw_vehicles = self.model_mgr.detect_vehicles(frame)
                    raw_plates = self.model_mgr.detect_plates(frame)

                    # 2. Bounding box candidates [x, y, w, h, conf] for BoT-SORT (vehicles only)
                    candidates = [[v["bbox"][0], v["bbox"][1], v["bbox"][2]-v["bbox"][0], v["bbox"][3]-v["bbox"][1], v["confidence"]] for v in raw_vehicles]

                    # 3. BoT-SORT Tracker Update
                    active_tracks = tracker.update(candidates)

                    # 4. Schedule Background OCR using matched tight plate bounding boxes
                    for track in active_tracks:
                        if not track.should_skip_ocr(threshold=0.98):
                            bx, by, x2, y2 = [int(v) for v in track.tlbr]
                            
                            # Match exact plate box detected on frame
                            plate_crop = None
                            best_pconf = 0.0
                            for p in raw_plates:
                                px1, py1, px2, py2 = p["bbox"]
                                pcx, pcy = (px1 + px2) // 2, (py1 + py2) // 2
                                if bx <= pcx <= x2 and by <= pcy <= y2:
                                    if p["confidence"] > best_pconf:
                                        best_pconf = p["confidence"]
                                        plate_crop = frame[max(0, py1):min(h, py2), max(0, px1):min(w, px2)].copy()

                            if plate_crop is None or plate_crop.size == 0:
                                bw, bh = max(10, x2 - bx), max(10, y2 - by)
                                v_crop = frame[max(0, by):min(h, by+bh), max(0, bx):min(w, bx+bw)]
                                y_start = int(bh * 0.40)
                                x_start = int(bw * 0.10)
                                x_end = int(bw * 0.90)
                                plate_crop = v_crop[y_start:bh, x_start:x_end].copy()

                            matched_class = "Vehicle"
                            for v in raw_vehicles:
                                vx1, vy1, vx2, vy2 = v["bbox"]
                                if vx1 <= bx <= vx2 and vy1 <= by <= vy2:
                                    matched_class = v["class"]
                                    break

                            self._submit_background_ocr(track, plate_crop, matched_class, temporal_ocr_buffer)
                        else:
                            track.mark_ocr_skipped()

                else:
                    # On Skipped Frames: Predict motion state using BoT-SORT Kalman Filter for smooth bounding boxes
                    for track in active_tracks:
                        track.predict()

                # Collect current detection records for annotation
                frame_detections = []
                for track in active_tracks:
                    det_dict = track.to_dict(video_timestamp=time_str)
                    frame_detections.append(det_dict)
                    final_tracked_records[track.track_id] = det_dict

                # 5. Draw BoT-SORT vehicle bounding boxes and labels onto frame
                annotated_frame = self.model_mgr.annotate_image(frame, frame_detections)

                # 6. Render live CCTV HUD telemetry banner
                elapsed_time = time.time() - fps_start_time
                if elapsed_time >= 1.0:
                    current_fps = frame_counter / elapsed_time

                hud_text = f"TRINETRA BOTSORT STREAM | GPU: {self.model_mgr.gpu_name} | FPS: {current_fps:.1f} | TRACKS: {len(active_tracks)} | SKIP: {sample_rate-1}f"
                cv2.rectangle(annotated_frame, (10, 10), (10 + len(hud_text)*9 + 10, 36), (15, 23, 42), -1)
                cv2.putText(annotated_frame, hud_text, (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1, cv2.LINE_AA)

                # 6b. Render Animated Bottom HUD Banner for Remaining Frames & OCR Status
                remaining_frames = max(0, total_frames - frame_counter) if total_frames > 0 else 0
                pending_ocr_count = sum(1 for t in active_tracks if t.ocr_pending)
                completed_ocr_count = sum(1 for t in active_tracks if bool(t.plate_number))

                pulse_icon = ">> [OCR ACTIVE]" if (frame_counter // 5) % 2 == 0 else " > [OCR ACTIVE]"
                bottom_banner_text = f"{pulse_icon} REMAINING FRAMES TO PROCESS BY OCR: {remaining_frames} | PENDING OCR: {pending_ocr_count} | RECOGNIZED: {completed_ocr_count}"

                banner_h = 32
                banner_y1 = max(40, h - banner_h - 12)
                banner_y2 = h - 12
                # Draw dark semi-transparent banner at bottom of camera feed
                cv2.rectangle(annotated_frame, (10, banner_y1), (w - 10, banner_y2), (15, 23, 42), -1)
                # Draw glowing amber border
                cv2.rectangle(annotated_frame, (10, banner_y1), (w - 10, banner_y2), (245, 158, 11), 1)
                # Render animated glowing text
                cv2.putText(annotated_frame, bottom_banner_text, (20, banner_y2 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 230, 255), 1, cv2.LINE_AA)

                # 7. Encode annotated frame to JPEG image bytes
                _, jpeg_buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                frame_bytes = jpeg_buffer.tobytes()

                # Yield low-latency MJPEG multipart boundary
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

                proc_time = time.time() - frame_start_time
                sleep_delay = max(0.001, target_delay - proc_time)
                time.sleep(sleep_delay)

        finally:
            cap.release()
            logger.info(f"Stream [{stream_id}] finished. Saving {len(final_tracked_records)} unique vehicle records to MongoDB...")
            
            valid_records = []
            for idx, r in enumerate(final_tracked_records.values()):
                p_num = r.get("plateNumber", "")
                p_conf = r.get("confidence", 0.0)
                # Only save records with valid recognized plate number (not UNREADABLE or 0% conf)
                if p_num and p_num != "UNREADABLE" and p_conf >= 0.30:
                    r_copy = dict(r)
                    r_copy["job_id"] = stream_id
                    r_copy["sourceType"] = "live_stream"
                    valid_records.append(r_copy)
            if valid_records:
                db_client.save_detections_batch(valid_records)
                logger.info(f"Stream [{stream_id}] saved {len(valid_records)} valid ANPR plate records to MongoDB.")

def get_stream_processor() -> StreamProcessor:
    return StreamProcessor()
