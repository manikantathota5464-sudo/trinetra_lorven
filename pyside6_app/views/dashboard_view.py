import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QTableWidget, 
    QTableWidgetItem, QHeaderView, QPushButton, QGridLayout, QScrollArea,
    QLineEdit, QTextEdit, QDialog, QMessageBox, QProgressBar
)
from PySide6.QtCore import Qt, Signal, QRectF, QPointF
from PySide6.QtGui import QFont, QPainter, QColor, QPen, QBrush, QCursor, QPixmap
from models.data_store import (
    INITIAL_CAMERAS, INITIAL_ALERTS, RECENT_DETECTIONS, INITIAL_TIMELINE,
    Camera, Alert, RecentDetection, TimelineEvent
)

class InteractiveMapWidget(QFrame):
    camera_selected = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumHeight(240)
        self.selected_cam_id = "CAM-1024"
        self.pins = [
            ("CAM-1024", 0.28, 0.46, "#10B981"),  # Main St & 5th Ave
            ("CAM-0785", 0.50, 0.21, "#10B981"),  # I-9 Overpass
            ("CAM-0456", 0.68, 0.47, "#EF4444"),  # Harbor Rd Exit
            ("CAM-0932", 0.18, 0.73, "#F59E0B"),  # City Center Parking
        ]
        self.setStyleSheet("background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;")
        self.setCursor(QCursor(Qt.PointingHandCursor))

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()

        # 1. Background Grid
        grid_pen = QPen(QColor("#E2E8F0"), 0.5)
        painter.setPen(grid_pen)
        grid_size = 20
        for x in range(0, w, grid_size):
            painter.drawLine(x, 0, x, h)
        for y in range(0, h, grid_size):
            painter.drawLine(0, y, w, y)

        # 2. Watercourse / River (Blue channel)
        water_pen = QPen(QColor("#BFDBFE"), 16, Qt.SolidLine, Qt.RoundCap)
        painter.setPen(water_pen)
        p1 = QPointF(0, h * 0.73)
        p2 = QPointF(w * 0.38, h * 0.60)
        p3 = QPointF(w * 0.63, h * 0.83)
        p4 = QPointF(w, h * 0.80)
        
        # Approximate bezier with lines
        painter.drawLine(p1, p2)
        painter.drawLine(p2, p3)
        painter.drawLine(p3, p4)

        # 3. Main Highway NH-216 (Horizontal)
        hw_bg = QPen(QColor("#CBD5E1"), 14, Qt.SolidLine, Qt.SquareCap)
        painter.setPen(hw_bg)
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))
        
        hw_fg = QPen(QColor("#F1F5F9"), 10, Qt.SolidLine, Qt.SquareCap)
        painter.setPen(hw_fg)
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))

        hw_dash = QPen(QColor("#F8FAFC"), 1, Qt.DashLine)
        painter.setPen(hw_dash)
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))

        # Secondary avenues
        sec_pen = QPen(QColor("#E2E8F0"), 6)
        painter.setPen(sec_pen)
        painter.drawLine(int(w * 0.30), 0, int(w * 0.30), h)
        painter.drawLine(int(w * 0.70), 0, int(w * 0.70), h)
        painter.drawLine(0, int(h * 0.23), w, int(h * 0.23))

        # 4. Labels
        painter.setPen(QColor("#94A3B8"))
        f = painter.font()
        f.setPointSize(8)
        f.setBold(True)
        painter.setFont(f)
        painter.drawText(15, int(h * 0.46), "NH-216 Highway")
        painter.drawText(int(w * 0.32), 20, "5th Ave")
        painter.drawText(int(w * 0.72), 20, "Harbor Rd")

        # 5. Center Hub Marker (Bhimavaram Center)
        hub_x = int(w * 0.50)
        hub_y = int(h * 0.50)
        painter.setBrush(QBrush(QColor("#0C2540")))
        painter.setPen(QPen(QColor("#FFFFFF"), 2))
        painter.drawEllipse(hub_x - 6, hub_y - 6, 12, 12)

        # 6. Camera Pins
        for cid, rx, ry, col_hex in self.pins:
            px = int(w * rx)
            py = int(h * ry)
            is_sel = (cid == self.selected_cam_id)

            pin_col = QColor(col_hex)
            if is_sel:
                # Outer glow ring
                painter.setPen(Qt.NoPen)
                glow_col = QColor(col_hex)
                glow_col.setAlpha(80)
                painter.setBrush(QBrush(glow_col))
                painter.drawEllipse(px - 14, py - 14, 28, 28)

                painter.setBrush(QBrush(pin_col))
                painter.setPen(QPen(QColor("#FFFFFF"), 2))
                painter.drawEllipse(px - 8, py - 8, 16, 16)
            else:
                painter.setBrush(QBrush(QColor("#FFFFFF")))
                painter.setPen(QPen(pin_col, 2.5))
                painter.drawEllipse(px - 6, py - 6, 12, 12)

        painter.end()

    def mousePressEvent(self, event):
        w = self.width()
        h = self.height()
        pos = event.position()
        
        closest_cam = None
        min_dist = 999999
        for cid, rx, ry, _ in self.pins:
            px = w * rx
            py = h * ry
            dist = (pos.x() - px)**2 + (pos.y() - py)**2
            if dist < min_dist:
                min_dist = dist
                closest_cam = cid

        if closest_cam and min_dist < 900:  # 30px radius
            self.selected_cam_id = closest_cam
            self.camera_selected.emit(closest_cam)
            self.update()


class DashboardView(QWidget):
    navigate_requested = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.cameras = list(INITIAL_CAMERAS)
        self.alerts = list(INITIAL_ALERTS)
        self.detections = list(RECENT_DETECTIONS)
        self.timeline = list(INITIAL_TIMELINE)
        self.selected_cam_id = "CAM-1024"
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. 4 TELEMETRY METRICS SUMMARY CARDS ──
        kpi_grid = QGridLayout()
        kpi_grid.setSpacing(14)

        # Calculate dynamic metrics
        total_cams = len(self.cameras)
        online_cams = len([c for c in self.cameras if getattr(c, 'status', '') == 'Online'])
        online_pct = int((online_cams / total_cams * 100)) if total_cams > 0 else 0
        active_alerts_cnt = len([a for a in self.alerts if getattr(a, 'status', '') in ('Active', 'Pending')])
        total_det_cnt = len(self.detections)

        # Card 1: Total Cameras
        c1 = self.create_card_frame()
        c1_l = QVBoxLayout(c1)
        c1_l.setSpacing(4)
        c1_top = QHBoxLayout()
        c1_lbl = QLabel("TOTAL CAMERAS")
        c1_lbl.setStyleSheet("font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c1_top.addWidget(c1_lbl)
        c1_top.addStretch()
        c1_ic = QLabel("📹")
        c1_ic.setStyleSheet("background-color: #EFF6FF; color: #2563EB; font-size: 15px; padding: 4px 8px; border-radius: 8px;")
        c1_top.addWidget(c1_ic)
        c1_l.addLayout(c1_top)
        c1_val = QLabel(str(total_cams))
        c1_val.setStyleSheet("font-size: 24px; font-weight: 900; color: #0C2540;")
        c1_l.addWidget(c1_val)
        c1_sub = QLabel("Registered ANPR Grid Nodes")
        c1_sub.setStyleSheet("font-size: 10px; font-weight: 700; color: #059669;")
        c1_l.addWidget(c1_sub)
        kpi_grid.addWidget(c1, 0, 0)

        # Card 2: Active Cameras with Progress Bar
        c2 = self.create_card_frame()
        c2_l = QVBoxLayout(c2)
        c2_l.setSpacing(4)
        c2_top = QHBoxLayout()
        c2_lbl = QLabel("ACTIVE CAMERAS")
        c2_lbl.setStyleSheet("font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c2_top.addWidget(c2_lbl)
        c2_top.addStretch()
        c2_ic = QLabel("⚡")
        c2_ic.setStyleSheet("background-color: #ECFDF5; color: #059669; font-size: 15px; padding: 4px 8px; border-radius: 8px;")
        c2_top.addWidget(c2_ic)
        c2_l.addLayout(c2_top)
        c2_val = QLabel(str(online_cams))
        c2_val.setStyleSheet("font-size: 24px; font-weight: 900; color: #1E293B;")
        c2_l.addWidget(c2_val)
        
        c2_pbox = QHBoxLayout()
        c2_psub = QLabel(f"{online_pct}% of total cameras")
        c2_psub.setStyleSheet("font-size: 10px; font-weight: 700; color: #64748B;")
        c2_pon = QLabel("Online")
        c2_pon.setStyleSheet("font-size: 10px; font-weight: 800; color: #059669;")
        c2_pbox.addWidget(c2_psub)
        c2_pbox.addStretch()
        c2_pbox.addWidget(c2_pon)
        c2_l.addLayout(c2_pbox)

        pbar = QProgressBar()
        pbar.setFixedHeight(6)
        pbar.setTextVisible(False)
        pbar.setValue(online_pct)
        pbar.setStyleSheet("QProgressBar { background-color: #F1F5F9; border-radius: 3px; } QProgressBar::chunk { background-color: #10B981; border-radius: 3px; }")
        c2_l.addWidget(pbar)
        kpi_grid.addWidget(c2, 0, 1)

        # Card 3: Active Alerts
        c3 = self.create_card_frame()
        c3_l = QVBoxLayout(c3)
        c3_l.setSpacing(4)
        c3_top = QHBoxLayout()
        c3_lbl = QLabel("ACTIVE ALERTS")
        c3_lbl.setStyleSheet("font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c3_top.addWidget(c3_lbl)
        c3_top.addStretch()
        c3_ic = QLabel("⚠️")
        c3_ic.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-size: 15px; padding: 4px 8px; border-radius: 8px;")
        c3_top.addWidget(c3_ic)
        c3_l.addLayout(c3_top)
        c3_val = QLabel(str(active_alerts_cnt))
        c3_val.setStyleSheet("font-size: 24px; font-weight: 900; color: #DC2626;")
        c3_l.addWidget(c3_val)
        c3_sub = QLabel("Requires dispatch" if active_alerts_cnt > 0 else "No active alerts")
        c3_sub.setStyleSheet("font-size: 10px; font-weight: 700; color: #EF4444;" if active_alerts_cnt > 0 else "font-size: 10px; font-weight: 700; color: #059669;")
        c3_l.addWidget(c3_sub)
        kpi_grid.addWidget(c3, 0, 2)

        # Card 4: Total Detections
        c4 = self.create_card_frame()
        c4_l = QVBoxLayout(c4)
        c4_l.setSpacing(4)
        c4_top = QHBoxLayout()
        c4_lbl = QLabel("TOTAL DETECTIONS")
        c4_lbl.setStyleSheet("font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c4_top.addWidget(c4_lbl)
        c4_top.addStretch()
        c4_ic = QLabel("📊")
        c4_ic.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-size: 15px; padding: 4px 8px; border-radius: 8px;")
        c4_top.addWidget(c4_ic)
        c4_l.addLayout(c4_top)
        c4_val = QLabel(str(total_det_cnt))
        c4_val.setStyleSheet("font-size: 24px; font-weight: 900; color: #1E293B;")
        c4_l.addWidget(c4_val)
        c4_sub = QLabel("Recorded ANPR Scans")
        c4_sub.setStyleSheet("font-size: 10px; font-weight: 700; color: #059669;")
        c4_l.addWidget(c4_sub)
        kpi_grid.addWidget(c4, 0, 3)

        main_layout.addLayout(kpi_grid)

        # ── 2. 3-COLUMN CORE WORKSPACE ──
        three_cols = QHBoxLayout()
        three_cols.setSpacing(14)

        # ── Column 1: Recent Detections ──
        col1 = self.create_card_frame()
        col1_l = QVBoxLayout(col1)
        col1_l.setContentsMargins(14, 14, 14, 14)
        col1_l.setSpacing(10)

        c1_head = QHBoxLayout()
        c1_htitle = QLabel("RECENT DETECTIONS")
        c1_htitle.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c1_head.addWidget(c1_htitle)
        c1_head.addStretch()
        v_all_btn = QPushButton("View All ➔")
        v_all_btn.setStyleSheet("background: transparent; color: #0C2540; font-size: 11px; font-weight: 800; border: none; padding: 0;")
        v_all_btn.setCursor(QCursor(Qt.PointingHandCursor))
        v_all_btn.clicked.connect(lambda: self.navigate_requested.emit("cameras"))
        c1_head.addWidget(v_all_btn)
        col1_l.addLayout(c1_head)

        for det in self.detections:
            item_box = QFrame()
            item_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 6px 10px;")
            ib_l = QHBoxLayout(item_box)
            ib_l.setContentsMargins(4, 4, 4, 4)
            ib_l.setSpacing(8)

            # Left Plate & details
            left_info = QVBoxLayout()
            left_info.setSpacing(2)
            p_tag = QLabel(det.plateNumber)
            p_tag.setStyleSheet("background-color: #E2E8F0; color: #0F172A; font-family: Consolas; font-weight: 900; font-size: 11.5px; padding: 2px 6px; border-radius: 4px;")
            left_info.addWidget(p_tag)
            det_sub = QLabel(f"{det.details} • {det.location}")
            det_sub.setStyleSheet("font-size: 10px; color: #64748B; font-weight: 600;")
            left_info.addWidget(det_sub)
            ib_l.addLayout(left_info, 1)

            # Right Confidence & Time
            right_info = QVBoxLayout()
            right_info.setSpacing(1)
            right_info.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
            conf_lbl = QLabel(f"{det.confidence}%")
            conf_lbl.setStyleSheet("font-size: 11px; font-weight: 900; color: #059669; text-align: right;")
            time_lbl = QLabel(det.time)
            time_lbl.setStyleSheet("font-size: 9px; color: #94A3B8; font-weight: 600; text-align: right;")
            right_info.addWidget(conf_lbl)
            right_info.addWidget(time_lbl)
            ib_l.addLayout(right_info)

            col1_l.addWidget(item_box)

        col1_l.addStretch()
        view_det_btn = QPushButton("View All Detections")
        view_det_btn.setStyleSheet("background-color: #FAF8F5; color: #0C2540; border: 1px solid #EDE5D8; border-radius: 8px; font-size: 11px; font-weight: 800; padding: 6px;")
        view_det_btn.clicked.connect(lambda: self.navigate_requested.emit("cameras"))
        col1_l.addWidget(view_det_btn)

        three_cols.addWidget(col1, 35)

        # ── Column 2: Alerts Overview & Quick Actions ──
        col2 = QVBoxLayout()
        col2.setSpacing(14)

        # Alerts Overview Panel
        alerts_card = self.create_card_frame()
        ac_l = QVBoxLayout(alerts_card)
        ac_l.setContentsMargins(14, 14, 14, 14)
        ac_l.setSpacing(8)

        ac_head = QHBoxLayout()
        ac_htitle = QLabel("ALERTS OVERVIEW")
        ac_htitle.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        ac_head.addWidget(ac_htitle)
        ac_head.addStretch()
        v_alt_btn = QPushButton("View All")
        v_alt_btn.setStyleSheet("background: transparent; color: #0C2540; font-size: 11px; font-weight: 800; border: none; padding: 0;")
        v_alt_btn.setCursor(QCursor(Qt.PointingHandCursor))
        v_alt_btn.clicked.connect(lambda: self.navigate_requested.emit("alerts"))
        ac_head.addWidget(v_alt_btn)
        ac_l.addLayout(ac_head)

        # Critical Chip
        crit_chip = QPushButton("⚠️  CRITICAL                             8 >")
        crit_chip.setCursor(QCursor(Qt.PointingHandCursor))
        crit_chip.setStyleSheet("background-color: #FEF2F2; color: #991B1B; border: 1px solid #FEE2E2; border-radius: 8px; text-align: left; padding: 8px 12px; font-weight: 900; font-size: 11px;")
        crit_chip.clicked.connect(lambda: self.navigate_requested.emit("alerts"))
        ac_l.addWidget(crit_chip)

        # Warning Chip
        warn_chip = QPushButton("⚠️  WARNING                             13 >")
        warn_chip.setCursor(QCursor(Qt.PointingHandCursor))
        warn_chip.setStyleSheet("background-color: #FFFBEB; color: #92400E; border: 1px solid #FEF3C7; border-radius: 8px; text-align: left; padding: 8px 12px; font-weight: 900; font-size: 11px;")
        warn_chip.clicked.connect(lambda: self.navigate_requested.emit("alerts"))
        ac_l.addWidget(warn_chip)

        # Resolved Chip
        res_chip = QPushButton("✓  RESOLVED                             22 >")
        res_chip.setCursor(QCursor(Qt.PointingHandCursor))
        res_chip.setStyleSheet("background-color: #ECFDF5; color: #065F46; border: 1px solid #D1FAE5; border-radius: 8px; text-align: left; padding: 8px 12px; font-weight: 900; font-size: 11px;")
        res_chip.clicked.connect(lambda: self.navigate_requested.emit("alerts"))
        ac_l.addWidget(res_chip)
        col2.addWidget(alerts_card)

        # Quick Actions Panel
        qa_card = self.create_card_frame()
        qa_l = QVBoxLayout(qa_card)
        qa_l.setContentsMargins(14, 14, 14, 14)
        qa_l.setSpacing(8)

        qa_htitle = QLabel("QUICK ACTIONS")
        qa_htitle.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        qa_l.addWidget(qa_htitle)

        add_inc_btn = QPushButton("+  Add Incident (Report New)")
        add_inc_btn.setStyleSheet("background-color: #FFFFFF; color: #1E293B; border: 1px solid #E2E8F0; border-radius: 8px; text-align: left; padding: 7px 10px; font-weight: 700; font-size: 11px;")
        add_inc_btn.clicked.connect(self.show_add_incident_modal)
        qa_l.addWidget(add_inc_btn)

        self.plate_search = QLineEdit()
        self.plate_search.setPlaceholderText("Search Vehicle Plate...")
        self.plate_search.setStyleSheet("background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11px;")
        self.plate_search.returnPressed.connect(lambda: self.navigate_requested.emit("alerts"))
        qa_l.addWidget(self.plate_search)

        exp_btn = QPushButton("📑  Export Report")
        exp_btn.setStyleSheet("background-color: #FFFFFF; color: #1E293B; border: 1px solid #E2E8F0; border-radius: 8px; text-align: left; padding: 7px 10px; font-weight: 700; font-size: 11px;")
        exp_btn.clicked.connect(lambda: self.navigate_requested.emit("reports"))
        qa_l.addWidget(exp_btn)

        op_btn = QPushButton("👤  Operator Log")
        op_btn.setStyleSheet("background-color: #FFFFFF; color: #1E293B; border: 1px solid #E2E8F0; border-radius: 8px; text-align: left; padding: 7px 10px; font-weight: 700; font-size: 11px;")
        op_btn.clicked.connect(lambda: self.navigate_requested.emit("settings"))
        qa_l.addWidget(op_btn)
        col2.addWidget(qa_card)

        three_cols.addLayout(col2, 27)

        # ── Column 3: Live Map ──
        col3 = self.create_card_frame()
        col3_l = QVBoxLayout(col3)
        col3_l.setContentsMargins(14, 14, 14, 14)
        col3_l.setSpacing(10)

        c3_head = QHBoxLayout()
        c3_htitle = QLabel("LIVE MAP")
        c3_htitle.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c3_head.addWidget(c3_htitle)
        c3_head.addStretch()
        live_telemetry = QLabel("● Live Telemetry")
        live_telemetry.setStyleSheet("color: #059669; font-size: 10px; font-weight: 800; text-transform: uppercase;")
        c3_head.addWidget(live_telemetry)
        col3_l.addLayout(c3_head)

        # Interactive Map Canvas
        self.map_widget = InteractiveMapWidget()
        self.map_widget.camera_selected.connect(self.on_camera_pin_selected)
        col3_l.addWidget(self.map_widget, 1)

        # Selected Camera Preview Drawer Box
        self.cam_preview_box = QFrame()
        self.cam_preview_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 8px 10px;")
        cp_l = QHBoxLayout(self.cam_preview_box)
        cp_l.setContentsMargins(4, 4, 4, 4)

        cam_text_box = QVBoxLayout()
        cam_text_box.setSpacing(1)
        self.preview_cid = QLabel("CAM-1024  •  Online")
        self.preview_cid.setStyleSheet("font-size: 11.5px; font-weight: 900; color: #0C2540;")
        self.preview_loc = QLabel("Main St & 5th Ave (PTZ Camera)")
        self.preview_loc.setStyleSheet("font-size: 10px; color: #64748B; font-weight: 600;")
        cam_text_box.addWidget(self.preview_cid)
        cam_text_box.addWidget(self.preview_loc)
        cp_l.addLayout(cam_text_box)
        cp_l.addStretch()

        view_cam_btn = QPushButton("View Camera")
        view_cam_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-size: 10.5px; font-weight: 800; padding: 6px 10px; border-radius: 6px;")
        view_cam_btn.clicked.connect(lambda: self.navigate_requested.emit("live-feeds"))
        cp_l.addWidget(view_cam_btn)

        col3_l.addWidget(self.cam_preview_box)

        map_hint = QLabel("📍 Click camera pins to update preview details.")
        map_hint.setAlignment(Qt.AlignCenter)
        map_hint.setStyleSheet("font-size: 9.5px; color: #94A3B8; font-weight: 600;")
        col3_l.addWidget(map_hint)

        three_cols.addWidget(col3, 38)
        main_layout.addLayout(three_cols)

        # ── 3. ACTIVITY TIMELINE ──
        tl_card = self.create_card_frame()
        tl_l = QVBoxLayout(tl_card)
        tl_l.setContentsMargins(14, 14, 14, 14)
        tl_l.setSpacing(10)

        tl_head = QHBoxLayout()
        tl_htitle = QLabel("ACTIVITY TIMELINE")
        tl_htitle.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        tl_head.addWidget(tl_htitle)
        tl_head.addStretch()
        tl_sub = QLabel("Recent system activities and incidents")
        tl_sub.setStyleSheet("font-size: 9.5px; color: #94A3B8; font-weight: 600; text-transform: uppercase;")
        tl_head.addWidget(tl_sub)
        tl_l.addLayout(tl_head)

        tl_grid = QGridLayout()
        tl_grid.setSpacing(10)

        for i, ev in enumerate(self.timeline[:4]):
            ev_box = QFrame()
            
            bar_col = "#EF4444" if ev.severity == "Critical" else "#F59E0B" if ev.severity == "Warning" else "#10B981" if ev.severity == "Resolved" else "#0284C7"
            ev_box.setStyleSheet(f"background-color: #FAF8F5; border: 1px solid #EDE5D8; border-left: 4px solid {bar_col}; border-radius: 8px; padding: 8px 10px;")
            
            ev_l = QVBoxLayout(ev_box)
            ev_l.setContentsMargins(4, 2, 4, 2)
            ev_l.setSpacing(3)

            top_row = QHBoxLayout()
            sev_badge = QLabel(ev.severity.upper())
            sev_badge.setStyleSheet(f"font-size: 8.5px; font-weight: 900; color: {bar_col}; background-color: #FFFFFF; padding: 1px 4px; border-radius: 3px;")
            time_lbl = QLabel(f"⏱ {ev.time}")
            time_lbl.setStyleSheet("font-size: 9px; color: #94A3B8; font-weight: 600;")
            top_row.addWidget(sev_badge)
            top_row.addStretch()
            top_row.addWidget(time_lbl)
            ev_l.addLayout(top_row)

            msg_lbl = QLabel(ev.message)
            msg_lbl.setWordWrap(True)
            msg_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #1E293B;")
            ev_l.addWidget(msg_lbl)

            rep_lbl = QLabel(ev.reportedBy)
            rep_lbl.setStyleSheet("font-size: 9.5px; color: #64748B;")
            ev_l.addWidget(rep_lbl)

            tl_grid.addWidget(ev_box, 0, i)

        tl_l.addLayout(tl_grid)
        main_layout.addWidget(tl_card)

    def create_card_frame(self):
        card = QFrame()
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 12px;")
        return card

    def on_camera_pin_selected(self, cid):
        self.selected_cam_id = cid
        cam = next((c for c in self.cameras if c.id == cid), self.cameras[0])
        self.preview_cid.setText(f"{cam.id}  •  {cam.status}")
        self.preview_loc.setText(f"{cam.location} ({cam.type} Camera)")

    def show_add_incident_modal(self):
        diag = QDialog(self)
        diag.setWindowTitle("Report Traffic Incident")
        diag.setFixedWidth(420)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        header_lbl = QLabel("Report New Traffic Incident")
        header_lbl.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        d_l.addWidget(header_lbl)

        d_l.addWidget(QLabel("Severity Level:"))
        sev_box = QHBoxLayout()
        self.selected_sev = "Warning"
        sev_btns = []
        for s in ("Critical", "Warning", "Resolved", "Info"):
            b = QPushButton(s)
            b.setCheckable(True)
            if s == "Warning":
                b.setChecked(True)
                b.setStyleSheet("background-color: #F59E0B; color: #FFFFFF; font-weight: 800;")
            else:
                b.setStyleSheet("background-color: #F1F5F9; color: #475569;")
            
            def make_handler(btn, severity):
                def handler():
                    self.selected_sev = severity
                    for other in sev_btns:
                        if other == btn:
                            other.setChecked(True)
                            other.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800;")
                        else:
                            other.setChecked(False)
                            other.setStyleSheet("background-color: #F1F5F9; color: #475569;")
                return handler

            b.clicked.connect(make_handler(b, s))
            sev_btns.append(b)
            sev_box.addWidget(b)
        d_l.addLayout(sev_box)

        d_l.addWidget(QLabel("Incident Details:"))
        msg_in = QTextEdit()
        msg_in.setPlaceholderText("E.g., Vehicle broke down blocking right-most lane on NH-216...")
        msg_in.setFixedHeight(80)
        d_l.addWidget(msg_in)

        btn_box = QHBoxLayout()
        btn_box.addStretch()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.setStyleSheet("background-color: #F1F5F9; color: #475569;")
        cancel_btn.clicked.connect(diag.reject)
        btn_box.addWidget(cancel_btn)

        sub_btn = QPushButton("Submit Incident")
        sub_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800;")
        def submit():
            txt = msg_in.toPlainText().strip()
            if not txt:
                QMessageBox.warning(diag, "Required", "Please enter incident details.")
                return
            new_ev = TimelineEvent(f"T-00{len(self.timeline)+1}", self.selected_sev, "Just now", txt, "Operator: Admin User")
            self.timeline.insert(0, new_ev)
            diag.accept()
            QMessageBox.information(self, "Incident Logged", "Traffic incident successfully logged to command center timeline.")
        sub_btn.clicked.connect(submit)
        btn_box.addWidget(sub_btn)
        d_l.addLayout(btn_box)

        diag.exec()

