import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QGridLayout, QComboBox, QLineEdit, QCheckBox, QScrollArea
)
from PySide6.QtCore import Qt, QTimer, QPointF, QDateTime
from PySide6.QtGui import QPainter, QColor, QPen, QBrush, QFont, QCursor
from models.data_store import INITIAL_CAMERAS, Camera

class SimulatedCCTVCanvas(QFrame):
    def __init__(self, camera: Camera, parent=None):
        super().__init__(parent)
        self.camera = camera
        self.is_playing = True
        self.is_muted = True
        self.car_x = -30.0
        self.car_speed = 3.2
        self.car_color = QColor("#E11D48") if "1024" in camera.id or "0456" in camera.id else QColor("#2563EB")
        self.scanner_y = 0.0
        self.scanner_dir = 1.0

        self.setMinimumHeight(180)
        self.setStyleSheet("background-color: #0F172A; border: 1px solid #1E293B; border-radius: 12px;")

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.animate_frame)
        self.timer.start(33)  # ~30 FPS

    def animate_frame(self):
        if self.is_playing:
            w = self.width()
            h = self.height()
            self.car_x += self.car_speed
            if self.car_x > w + 50:
                self.car_x = -50.0
            
            self.scanner_y += 1.8 * self.scanner_dir
            if self.scanner_y > h or self.scanner_y < 0:
                self.scanner_dir *= -1.0

            self.update()

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()

        # 1. Sky & Horizon
        painter.fillRect(0, 0, w, int(h * 0.35), QColor("#0F172A"))
        
        # Mountains
        painter.setBrush(QBrush(QColor("#1E293B")))
        painter.setPen(Qt.NoPen)
        m_poly = [
            QPointF(0, h * 0.35),
            QPointF(w * 0.25, h * 0.22),
            QPointF(w * 0.45, h * 0.35),
            QPointF(w * 0.75, h * 0.18),
            QPointF(w, h * 0.35),
            QPointF(w, h),
            QPointF(0, h)
        ]
        painter.drawPolygon(m_poly)

        # 2. Road (Asphalt)
        road_y = int(h * 0.35)
        painter.fillRect(0, road_y, w, h - road_y, QColor("#1E293B"))

        # Road borders (Yellow)
        yellow_pen = QPen(QColor("#FCD34D"), 2)
        painter.setPen(yellow_pen)
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))
        painter.drawLine(0, int(h * 0.85), w, int(h * 0.85))

        # Lane center divider (Dashed White)
        dash_pen = QPen(QColor("#F1F5F9"), 1.5, Qt.DashLine)
        painter.setPen(dash_pen)
        painter.drawLine(0, int(h * 0.67), w, int(h * 0.67))

        # 3. Moving Vehicle
        car_y = int(h * 0.58)
        # Body
        painter.setBrush(QBrush(self.car_color))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(int(self.car_x), car_y, 44, 16, 3, 3)
        # Cabin
        painter.setBrush(QBrush(QColor("#94A3B8")))
        painter.drawRoundedRect(int(self.car_x) + 10, car_y - 8, 22, 10, 2, 2)
        # Wheels
        painter.setBrush(QBrush(QColor("#000000")))
        painter.drawEllipse(int(self.car_x) + 6, car_y + 12, 8, 8)
        painter.drawEllipse(int(self.car_x) + 30, car_y + 12, 8, 8)

        # 4. Radar Sweep Line
        sweep_pen = QPen(QColor(16, 185, 129, 60), 1.5)
        painter.setPen(sweep_pen)
        painter.drawLine(0, int(self.scanner_y), w, int(self.scanner_y))

        # 5. Overlays (Timestamp & Camera Header)
        painter.setPen(QColor("#FFFFFF"))
        font = QFont("Consolas", 8, QFont.Bold)
        painter.setFont(font)
        painter.drawText(10, 18, f"{self.camera.id} - {self.camera.location}")
        
        now_str = QDateTime.currentDateTime().toString("yyyy-MM-dd  hh:mm:ss AP")
        painter.setPen(QColor("#94A3B8"))
        painter.drawText(10, 30, now_str)

        # REC Indicator
        painter.setBrush(QBrush(QColor("#EF4444")))
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(w - 45, 12, 7, 7)
        painter.setPen(QColor("#FFFFFF"))
        painter.drawText(w - 32, 19, "REC")

        # Flow status
        painter.setPen(QColor("#10B981"))
        flow_f = QFont("Segoe UI", 8, QFont.Black)
        painter.setFont(flow_f)
        flow_text = "FLOW: NORMAL" if self.is_playing else "FLOW: PAUSED"
        painter.drawText(10, h - 10, flow_text)

        painter.end()


class LiveFeedCard(QFrame):
    def __init__(self, camera: Camera, parent=None):
        super().__init__(parent)
        self.camera = camera
        self.setStyleSheet("background-color: #0F172A; border-radius: 12px; border: 1px solid #1E293B;")
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.canvas = SimulatedCCTVCanvas(camera)
        layout.addWidget(self.canvas)

        # Floating Bottom Bar
        bot_bar = QFrame()
        bot_bar.setStyleSheet("background-color: #0B1329; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 6px 10px;")
        bb_l = QHBoxLayout(bot_bar)
        bb_l.setContentsMargins(6, 4, 6, 4)

        play_btn = QPushButton("⏯")
        play_btn.setFixedSize(24, 24)
        play_btn.setStyleSheet("background: transparent; color: #FFFFFF; font-size: 11px; border: none;")
        play_btn.clicked.connect(self.toggle_play)
        bb_l.addWidget(play_btn)

        mute_btn = QPushButton("🔊")
        mute_btn.setFixedSize(24, 24)
        mute_btn.setStyleSheet("background: transparent; color: #FFFFFF; font-size: 11px; border: none;")
        mute_btn.clicked.connect(self.toggle_mute)
        bb_l.addWidget(mute_btn)

        bb_l.addStretch()
        cid_tag = QLabel(camera.id)
        cid_tag.setStyleSheet("color: #FFFFFF; font-size: 10px; font-weight: 800; font-family: Consolas; background-color: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;")
        bb_l.addWidget(cid_tag)

        type_tag = QLabel(camera.type)
        type_tag.setStyleSheet("color: #94A3B8; font-size: 9.5px; font-weight: 700;")
        bb_l.addWidget(type_tag)

        layout.addWidget(bot_bar)

    def toggle_play(self):
        self.canvas.is_playing = not self.canvas.is_playing

    def toggle_mute(self):
        self.canvas.is_muted = not self.canvas.is_muted


class LiveFeedsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.cameras = list(INITIAL_CAMERAS)
        self.layout_mode = "grid"
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. 4 KPI METRICS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        kpis = [
            ("TOTAL LIVE CAMERAS", "128", "Online across all sectors", "#0C2540", "#EFF6FF", "#2563EB", "📹"),
            ("ONLINE NOW", "104", "81.2% online capability", "#059669", "#ECFDF5", "#059669", "📺"),
            ("LIVE STREAMS", "24", "Active streaming grids", "#D97706", "#FFFBEB", "#D97706", "🔄"),
            ("TOTAL VIEWS", "56", "Active monitors watching", "#7C3AED", "#F5F3FF", "#7C3AED", "⛶"),
        ]

        for title, val, sub, col, bg_ic, ic_col, icon in kpis:
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
            cl = QVBoxLayout(card)
            cl.setSpacing(3)

            top_h = QHBoxLayout()
            t_lbl = QLabel(title)
            t_lbl.setStyleSheet("font-size: 9.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
            top_h.addWidget(t_lbl)
            top_h.addStretch()
            ic_lbl = QLabel(icon)
            ic_lbl.setStyleSheet(f"background-color: {bg_ic}; color: {ic_col}; font-size: 13px; font-weight: 900; padding: 3px 6px; border-radius: 6px;")
            top_h.addWidget(ic_lbl)
            cl.addLayout(top_h)

            v_lbl = QLabel(val)
            v_lbl.setStyleSheet(f"font-size: 20px; font-weight: 900; color: {col};")
            cl.addWidget(v_lbl)

            s_lbl = QLabel(sub)
            s_lbl.setStyleSheet("font-size: 9.5px; font-weight: 700; color: #64748B;")
            cl.addWidget(s_lbl)

            kpi_row.addWidget(card)

        main_layout.addLayout(kpi_row)

        # ── 2. FILTER & CONTROL BAR ──
        ctrl_card = QFrame()
        ctrl_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        cf_l = QHBoxLayout(ctrl_card)
        cf_l.setContentsMargins(8, 4, 8, 4)
        cf_l.setSpacing(10)

        self.search_in = QLineEdit()
        self.search_in.setPlaceholderText("Search cameras...")
        self.search_in.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_in.textChanged.connect(self.render_feeds)
        cf_l.addWidget(self.search_in, 2)

        self.loc_filter = QComboBox()
        self.loc_filter.addItems(["All Locations", "Main St", "I-9 Overpass", "Harbor Rd", "City Center", "Riverside"])
        self.loc_filter.currentTextChanged.connect(self.render_feeds)
        cf_l.addWidget(self.loc_filter, 1)

        auto_cb = QCheckBox("Auto Refresh")
        auto_cb.setChecked(True)
        auto_cb.setStyleSheet("font-size: 11.5px; font-weight: 700; color: #334155;")
        cf_l.addWidget(auto_cb)

        # Grid / List Toggle
        view_toggle_box = QHBoxLayout()
        view_toggle_box.setSpacing(2)
        
        self.grid_btn = QPushButton("田 Grid")
        self.grid_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
        self.grid_btn.clicked.connect(lambda: self.set_layout_mode("grid"))
        view_toggle_box.addWidget(self.grid_btn)

        self.list_btn = QPushButton("☰ List")
        self.list_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
        self.list_btn.clicked.connect(lambda: self.set_layout_mode("list"))
        view_toggle_box.addWidget(self.list_btn)

        cf_l.addLayout(view_toggle_box)
        main_layout.addWidget(ctrl_card)

        # ── 3. FEEDS CONTAINER ──
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.feeds_container = QWidget()
        self.feeds_layout = QGridLayout(self.feeds_container)
        self.feeds_layout.setSpacing(14)
        scroll.setWidget(self.feeds_container)
        main_layout.addWidget(scroll, 1)

        self.render_feeds()

    def set_layout_mode(self, mode: str):
        self.layout_mode = mode
        if mode == "grid":
            self.grid_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
            self.list_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
        else:
            self.list_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
            self.grid_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 6px;")
        self.render_feeds()

    def render_feeds(self):
        while self.feeds_layout.count():
            item = self.feeds_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        query = self.search_in.text().strip().lower()
        loc_filter = self.loc_filter.currentText()

        active_cams = [c for c in self.cameras if c.status == "Online"]
        filtered = []
        for cam in active_cams:
            if query and (query not in cam.id.lower() and query not in cam.location.lower()):
                continue
            if loc_filter != "All Locations" and loc_filter not in cam.location:
                continue
            filtered.append(cam)

        cols = 4 if self.layout_mode == "grid" else 1
        for i, cam in enumerate(filtered):
            card = LiveFeedCard(cam)
            row = i // cols
            col = i % cols
            self.feeds_layout.addWidget(card, row, col)

