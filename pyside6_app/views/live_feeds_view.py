from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, QGridLayout
)
from PySide6.QtCore import Qt, QTimer
import random

class LiveFeedsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Header
        top_h = QHBoxLayout()
        t_box = QVBoxLayout()
        h_title = QLabel("Multi-Stream ANPR Live Video Feeds")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Real-time HD surveillance matrix with live AI license plate detection overlays.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_box.addWidget(h_title)
        t_box.addWidget(h_sub)
        top_h.addLayout(t_box)
        top_h.addStretch()

        rec_btn = QPushButton("🔴 RECORDING ALL FEEDS")
        rec_btn.setStyleSheet("background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; font-weight: 800; font-size: 11.5px; padding: 6px 14px; border-radius: 20px;")
        top_h.addWidget(rec_btn)
        main_layout.addLayout(top_h)

        # 2x2 Grid Video Simulation
        grid = QGridLayout()
        grid.setSpacing(16)

        cams = [
            ("CAM-1024", "Main St & 5th Ave", "DL-01-AB-1234 (74 km/h)", "#DC2626"),
            ("CAM-0785", "I-9 Overpass KM 14", "MH-12-DE-8899 (134 km/h)", "#DC2626"),
            ("CAM-0112", "Express Highway Toll", "KA-05-JK-4412 (58 km/h)", "#059669"),
            ("CAM-0334", "Ring Road Junction 4", "TN-09-PQ-7721 (62 km/h)", "#059669"),
        ]

        for i, (cid, loc, det, col) in enumerate(cams):
            box = QFrame()
            box.setStyleSheet("background-color: #1E293B; border-radius: 12px; border: 2px solid #334155;")
            box.setMinimumHeight(240)
            b_l = QVBoxLayout(box)
            b_l.setContentsMargins(14, 12, 14, 12)

            top_row = QHBoxLayout()
            title = QLabel(f"● LIVE — {cid} ({loc})")
            title.setStyleSheet("color: #FFFFFF; font-weight: 800; font-size: 12px;")
            fps = QLabel("FPS: 30.0 | 1080p")
            fps.setStyleSheet("color: #94A3B8; font-size: 10.5px; font-weight: 600;")
            top_row.addWidget(title)
            top_row.addStretch()
            top_row.addWidget(fps)
            b_l.addLayout(top_row)

            b_l.addStretch()

            # Simulated AI OCR Overlay Box
            ocr_box = QFrame()
            ocr_box.setStyleSheet("background-color: rgba(15, 23, 42, 0.85); border: 1.5px solid #60A5FA; border-radius: 8px; padding: 8px;")
            ocr_l = QVBoxLayout(ocr_box)
            ocr_l.setSpacing(2)
            ocr_title = QLabel("AI ANPR TARGET ACQUIRED")
            ocr_title.setStyleSheet("color: #60A5FA; font-size: 10px; font-weight: 800; letter-spacing: 0.5px;")
            ocr_val = QLabel(f"Plate: {det}")
            ocr_val.setStyleSheet(f"color: {col}; font-size: 13px; font-weight: 900; font-family: Consolas;")
            ocr_l.addWidget(ocr_title)
            ocr_l.addWidget(ocr_val)
            b_l.addWidget(ocr_box)

            r = i // 2
            c = i % 2
            grid.addWidget(box, r, c)

        main_layout.addLayout(grid)
