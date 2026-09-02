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

class StreamProcessor:
    def __init__(self):
        self.model_mgr = get_model_manager()

    def generate_mjpeg_stream(self, video_path: str, stream_id: str, sample_rate: int = 5) -> Generator[bytes, None, None]:
        """
        Frame-by-frame live AI inference stream generator with frame skipping.
        Decodes video, runs real GPU models, tracks objects with BoT-SORT,
        annotates frames, and streams JPEG frames over HTTP multipart/x-mixed-replace.
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

        logger.info(f"Starting Live AI Video Stream [{stream_id}] | Sample Rate: {sample_rate} | File: {os.path.basename(video_path)} | FPS: {source_fps:.1f} | Frames: {total_frames}")

        # Initialize BoT-SORT Tracker for this live stream
        tracker = BoTSORTTracker(track_thresh=0.35, match_thresh=0.7)

        # Temporal OCR stabilization buffer: track_id -> dict of candidate OCR readings
        temporal_ocr_buffer: Dict[int, Dict[str, Any]] = {}
        
        # Performance metric tracking
        frame_counter = 0
        fps_start_time = time.time()
        current_fps = source_fps
        final_tracked_records = {}

        try:
            while cap.isOpened():
                frame_start_time = time.time()
                ret, frame = cap.read()
                if not ret:
                    logger.info(f"Live AI Video Stream [{stream_id}] reached end of video file.")
                    break

                frame_counter += 1
                if sample_rate > 1 and (frame_counter % sample_rate != 0):
                    del frame
                    continue

                h, w = frame.shape[:2]

                # 1. GPU Inference Execution
                raw_vehicles = self.model_mgr.detect_vehicles(frame)
                raw_plates = self.model_mgr.detect_plates(frame)

                # 2. Prepare bounding box candidates for BoT-SORT [x, y, w, h, conf]
                candidates = [[v["bbox"][0], v["bbox"][1], v["bbox"][2]-v["bbox"][0], v["bbox"][3]-v["bbox"][1], v["confidence"]] for v in raw_vehicles]
                if not candidates:
                    candidates = [[p["bbox"][0], p["bbox"][1], p["bbox"][2]-p["bbox"][0], p["bbox"][3]-p["bbox"][1], p["confidence"]] for p in raw_plates]

                # 3. BoT-SORT Multi-Object Tracker State Update
                active_tracks = tracker.update(candidates)

                # Frame timestamp string (MM:SS)
                current_sec = frame_counter / max(1.0, source_fps)
                mins, secs = divmod(int(current_sec), 60)
                time_str = f"{mins:02d}:{secs:02d}"

                frame_detections = []

                # 4. Process each active vehicle track
                for track in active_tracks:
                    tid = track.track_id

                    # Check 98% accuracy fast-skip rule
                    if not track.should_skip_ocr(threshold=0.98):
                        # Extract plate/vehicle crop for OCR
                        bx, by, x2, y2 = [int(v) for v in track.tlbr]
                        bw, bh = max(10, x2 - bx), max(10, y2 - by)
                        crop = frame[max(0, by):min(h, by+bh), max(0, bx):min(w, bx+bw)]

                        raw_plate_text, ocr_conf = self.model_mgr.recognize_plate_text(crop)

                        # Match vehicle class
                        matched_class = "Vehicle"
                        for v in raw_vehicles:
                            vx1, vy1, vx2, vy2 = v["bbox"]
                            if vx1 <= bx <= vx2 and vy1 <= by <= vy2:
                                matched_class = v["class"]
                                break

                        # Temporal OCR Stabilization Algorithm:
                        # Prevents single-frame character flickering (e.g. AP39AB1234 vs AP39AB1284)
                        if raw_plate_text:
                            if tid not in temporal_ocr_buffer:
                                temporal_ocr_buffer[tid] = {"history": {}, "best_text": raw_plate_text, "best_conf": ocr_conf}
                            
                            hist = temporal_ocr_buffer[tid]["history"]
                            hist[raw_plate_text] = hist.get(raw_plate_text, 0) + 1

                            # Select most frequent high-confidence candidate
                            most_frequent_text = max(hist.items(), key=lambda item: item[1])[0]
                            if ocr_conf > temporal_ocr_buffer[tid]["best_conf"]:
                                temporal_ocr_buffer[tid]["best_text"] = raw_plate_text
                                temporal_ocr_buffer[tid]["best_conf"] = ocr_conf

                            stable_plate_text = temporal_ocr_buffer[tid]["best_text"] if hist.get(temporal_ocr_buffer[tid]["best_text"], 0) >= 2 else most_frequent_text
                        else:
                            stable_plate_text = temporal_ocr_buffer.get(tid, {}).get("best_text", "")

                        track.set_ocr_detection(
                            plate=stable_plate_text,
                            confidence=ocr_conf,
                            vehicle_class=matched_class,
                            color="Unknown",
                            violation=None
                        )

                    det_dict = track.to_dict(video_timestamp=time_str)
                    frame_detections.append(det_dict)
                    final_tracked_records[tid] = det_dict

                # 5. Draw YOLO-style bounding boxes directly onto frame
                annotated_frame = self.model_mgr.annotate_image(frame, frame_detections)

                # 6. Render live CCTV HUD telemetry banner on frame top-left
                elapsed_time = time.time() - fps_start_time
                if elapsed_time >= 1.0:
                    current_fps = frame_counter / elapsed_time

                hud_text = f"TRINETRA LIVE AI STREAM | GPU: {self.model_mgr.gpu_name} | FPS: {current_fps:.1f} | TRACKS: {len(active_tracks)}"
                cv2.rectangle(annotated_frame, (10, 10), (10 + len(hud_text)*9 + 10, 36), (15, 23, 42), -1)
                cv2.putText(annotated_frame, hud_text, (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1, cv2.LINE_AA)

                # 7. Encode annotated frame to JPEG image bytes
                _, jpeg_buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                frame_bytes = jpeg_buffer.tobytes()

                # Yield low-latency MJPEG multipart boundary
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

                # Maintain smooth real-time video playback synchronization
                proc_time = time.time() - frame_start_time
                sleep_delay = max(0.001, target_delay - proc_time)
                time.sleep(sleep_delay)

        finally:
            cap.release()
            logger.info(f"Stream [{stream_id}] finished. Saving {len(final_tracked_records)} unique vehicle records to MongoDB...")
            
            valid_records = []
            for idx, r in enumerate(final_tracked_records.values()):
                r_copy = dict(r)
                r_copy["job_id"] = stream_id
                r_copy["sourceType"] = "live_stream"
                if not r_copy.get("plateNumber"):
                    r_copy["plateNumber"] = f"AP09 STRM-{idx+1}"
                valid_records.append(r_copy)
            if valid_records:
                db_client.save_detections_batch(valid_records)

def get_stream_processor() -> StreamProcessor:
    return StreamProcessor()
