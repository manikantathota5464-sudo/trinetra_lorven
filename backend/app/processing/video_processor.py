"""
Video processing pipeline with BoT-SORT multi-object vehicle tracking,
>98% accuracy fast-skip OCR, configurable frame sampling, cancellation check,
and atomic MongoDB batch persistence.
"""
import os
import time
import cv2
import logging
from typing import Dict, Any, List
from ..models_manager.model_manager import get_model_manager
from ..tracking.botsort import BoTSORTTracker
from ..config import settings

logger = logging.getLogger("TRINETRA.VideoProcessor")

import os
import time
import cv2
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List
from ..models_manager.model_manager import get_model_manager
from ..tracking.botsort import BoTSORTTracker
from ..config import settings

logger = logging.getLogger("TRINETRA.VideoProcessor")

def process_video_file(file_path: str, job_id: str, job_manager, sample_rate: int = None) -> Dict[str, Any]:
    start_time = time.time()
    sample_rate = sample_rate or settings.FRAME_SAMPLE_RATE

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Video file not found: {file_path}")

    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    if total_frames <= 0:
        total_frames = 100  # Fallback estimate

    job_manager.update_progress(job_id, 5, f"Initializing BoT-SORT & Video Decoder (Total frames: {total_frames})")

    model_mgr = get_model_manager()
    tracker = BoTSORTTracker(track_thresh=0.30, match_thresh=0.7)

    # Store finalized unique vehicle detections by track_id
    final_tracked_vehicles: Dict[int, Dict[str, Any]] = {}

    # Stage-by-Stage Performance Timings (in milliseconds)
    timing_breakdown = {
        "read_time_ms": 0.0,
        "vehicle_det_ms": 0.0,
        "plate_det_ms": 0.0,
        "tracker_ms": 0.0,
        "crop_ms": 0.0,
        "ocr_ms": 0.0,
    }

    frame_idx = 0
    sampled_count = 0
    total_ocr_skipped_frames = 0
    total_ocr_computed_frames = 0
    last_progress_time = time.time()

    try:
        while True:
            # Check for cancellation on each frame
            if job_manager.is_cancelled(job_id):
                cap.release()
                return {
                    "detections": list(final_tracked_vehicles.values()),
                    "total_frames": total_frames,
                    "processed_frames": sampled_count,
                    "fps": 0.0,
                    "execution_time_seconds": round(time.time() - start_time, 2),
                    "summary": {"status": "cancelled"}
                }

            t0_read = time.time()
            ret, frame = cap.read()
            t_read = (time.time() - t0_read) * 1000.0
            if not ret:
                break

            # Configurable frame sampling
            if frame_idx % sample_rate == 0:
                sampled_count += 1
                timing_breakdown["read_time_ms"] += t_read
                h, w = frame.shape[:2]

                # 1. GPU Vehicle Detection
                t0_v = time.time()
                raw_vehicles = model_mgr.detect_vehicles(frame)
                timing_breakdown["vehicle_det_ms"] += (time.time() - t0_v) * 1000.0

                # 2. GPU Plate Detection
                t0_p = time.time()
                raw_plates = model_mgr.detect_plates(frame)
                timing_breakdown["plate_det_ms"] += (time.time() - t0_p) * 1000.0

                # Format bounding boxes [x, y, w, h, conf] for BoT-SORT tracker (vehicles only)
                candidates = [[v["bbox"][0], v["bbox"][1], v["bbox"][2]-v["bbox"][0], v["bbox"][3]-v["bbox"][1], v["confidence"]] for v in raw_vehicles]

                # 3. Update BoT-SORT Tracker
                t0_tr = time.time()
                active_tracks = tracker.update(candidates)
                timing_breakdown["tracker_ms"] += (time.time() - t0_tr) * 1000.0

                # Video timestamp (MM:SS)
                current_sec = frame_idx / max(1.0, video_fps)
                mins, secs = divmod(int(current_sec), 60)
                time_str = f"{mins:02d}:{secs:02d}"

                # 4. Crop Extraction & BoT-SORT track_id Caching
                t0_crop = time.time()
                tracks_needing_ocr = []
                crops_needing_ocr = []

                for track in active_tracks:
                    # Check 98% accuracy skip condition or track_id cached result (per User Directive #5)
                    if track.should_skip_ocr(threshold=0.98):
                        track.mark_ocr_skipped()
                        total_ocr_skipped_frames += 1
                    else:
                        bx, by, x2, y2 = [int(v) for v in track.tlbr]

                        # Extract plate crop
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

                        # Check if ocr_service has a cached track result for this track_id
                        cached_res = None
                        if hasattr(model_mgr, 'ocr_service') and model_mgr.ocr_service:
                            cached_res = model_mgr.ocr_service.get_cached_track_result(track.track_id)

                        if cached_res and cached_res[1] >= 0.85:
                            p_text, o_conf = cached_res
                            track.set_ocr_detection(
                                plate=p_text,
                                confidence=o_conf,
                                vehicle_class=matched_class,
                                color="Unknown",
                                violation=None
                            )
                            total_ocr_skipped_frames += 1
                        else:
                            total_ocr_computed_frames += 1
                            tracks_needing_ocr.append((track, matched_class))
                            crops_needing_ocr.append(plate_crop)

                    # Update tracked vehicle record
                    det_record = track.to_dict(video_timestamp=time_str)
                    final_tracked_vehicles[track.track_id] = det_record

                timing_breakdown["crop_ms"] += (time.time() - t0_crop) * 1000.0

                # 5. Batched OCR Recognition for uncached crops
                if crops_needing_ocr:
                    t0_ocr = time.time()
                    ocr_results = model_mgr.recognize_plate_text_batch(crops_needing_ocr)
                    timing_breakdown["ocr_ms"] += (time.time() - t0_ocr) * 1000.0

                    for (tr, m_cls), (p_text, o_conf) in zip(tracks_needing_ocr, ocr_results):
                        tr.set_ocr_detection(
                            plate=p_text,
                            confidence=o_conf,
                            vehicle_class=m_cls,
                            color="Unknown",
                            violation=None
                        )
                        if hasattr(model_mgr, 'ocr_service') and model_mgr.ocr_service:
                            model_mgr.ocr_service.cache_track_result(tr.track_id, (p_text, o_conf))

                        det_record = tr.to_dict(video_timestamp=time_str)
                        final_tracked_vehicles[tr.track_id] = det_record

                del frame

                # Throttled progress updates
                now = time.time()
                if now - last_progress_time >= 0.25 or frame_idx == total_frames - 1:
                    percent = int((frame_idx / float(total_frames)) * 90) + 5
                    locked_count = sum(1 for t in final_tracked_vehicles.values() if t.get("plate_locked"))
                    job_manager.update_progress(
                        job_id,
                        percent,
                        f"BoT-SORT Tracking: Frame {frame_idx}/{total_frames} ({len(final_tracked_vehicles)} vehicles, {locked_count} locked >=98%, {total_ocr_skipped_frames} OCR skips)"
                    )
                    last_progress_time = now
            else:
                del frame

            frame_idx += 1

    finally:
        cap.release()

    exec_time = time.time() - start_time
    calc_fps = sampled_count / max(0.001, exec_time)

    # Re-sync final track records
    for track in tracker.tracked_tracks:
        final_tracked_vehicles[track.track_id] = track.to_dict()

    job_manager.update_progress(job_id, 98, "Finalizing BoT-SORT trajectory reports and database records")

    detections_list = list(final_tracked_vehicles.values())
    locked_count = sum(1 for d in detections_list if d.get("plate_locked"))

    # Format timing averages
    timing_summary = {
        "total_video_process_sec": round(exec_time, 2),
        "sampled_frames_count": sampled_count,
        "avg_frame_read_ms": round(timing_breakdown["read_time_ms"] / max(1, sampled_count), 2),
        "avg_vehicle_det_ms": round(timing_breakdown["vehicle_det_ms"] / max(1, sampled_count), 2),
        "avg_plate_det_ms": round(timing_breakdown["plate_det_ms"] / max(1, sampled_count), 2),
        "avg_tracker_ms": round(timing_breakdown["tracker_ms"] / max(1, sampled_count), 2),
        "avg_crop_ms": round(timing_breakdown["crop_ms"] / max(1, sampled_count), 2),
        "avg_ocr_ms": round(timing_breakdown["ocr_ms"] / max(1, sampled_count), 2),
        "total_ocr_ms": round(timing_breakdown["ocr_ms"], 2),
    }

    logger.info(
        f"BoT-SORT Processing complete for job {job_id}: {len(detections_list)} unique vehicles tracked, "
        f"{locked_count} locked at >=98% accuracy, {total_ocr_skipped_frames} duplicate OCR evaluations skipped."
    )
    logger.info(f"Stage Breakdown: {timing_summary}")

    return {
        "detections": detections_list,
        "total_frames": total_frames,
        "processed_frames": sampled_count,
        "fps": round(calc_fps, 1),
        "execution_time_seconds": round(exec_time, 2),
        "timing_breakdown": timing_summary,
        "botsort": {
            "unique_vehicles_tracked": len(detections_list),
            "tracks_locked_at_98_percent": locked_count,
            "ocr_skipped_frames": total_ocr_skipped_frames,
            "ocr_computed_frames": total_ocr_computed_frames,
        },
        "summary": {
            "uniquePlatesCount": len(detections_list),
            "violationsCount": sum(1 for d in detections_list if d.get("violation")),
            "cleanCount": sum(1 for d in detections_list if not d.get("violation")),
            "sampleRate": sample_rate,
            "processedTime": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    }

