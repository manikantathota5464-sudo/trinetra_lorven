import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QTableWidget, 
    QTableWidgetItem, QHeaderView, QPushButton, QGridLayout, QScrollArea
)
from PySide6.QtCore import Qt, Signal
from models.data_store import INITIAL_CAMERAS, INITIAL_ALERTS, RECENT_DETECTIONS, INITIAL_TIMELINE

class DashboardView(QWidget):
    navigate_requested = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(20)

        # Header Title
        title_box = QHBoxLayout()
        t_left = QVBoxLayout()
        t_left.setSpacing(2)
        h_title = QLabel("TrafficSight AI Operations Dashboard")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Real-time telemetry, automated ANPR detections & incident command hub.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_left.addWidget(h_title)
        t_left.addWidget(h_sub)
        title_box.addLayout(t_left)
        title_box.addStretch()

        live_badge = QLabel("● SYSTEM ACTIVE & MONITORING")
        live_badge.setStyleSheet("background-color: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 11px;")
        title_box.addWidget(live_badge)
        main_layout.addLayout(title_box)

        # 4 KPI Cards
        kpi_layout = QGridLayout()
        kpi_layout.setSpacing(16)

        kpis = [
            ("Active Camera Nodes", "24 / 24 Online", "99.8% Uptime", "#0C2540", "#EFF6FF", "🎥"),
            ("Vehicles Scanned Today", "14,892 Plates", "+18% from yesterday", "#0284C7", "#F0F9FF", "🚗"),
            ("Active High-Priority Alerts", "4 Flagged", "2 Stolen, 2 Speeding", "#DC2626", "#FEF2F2", "⚠️"),
            ("Citizen Grievances Today", "18 Logged", "14 Resolved / Patrol", "#D97706", "#FFFBEB", "💬"),
        ]

        for i, (title, val, sub, col, bg, icon) in enumerate(kpis):
            card = QFrame()
            card.setStyleSheet(f"background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 14px;")
            c_l = QVBoxLayout(card)
            c_l.setSpacing(4)

            top_h = QHBoxLayout()
            t_lbl = QLabel(title)
            t_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;")
            top_h.addWidget(t_lbl)
            top_h.addStretch()
            ic_lbl = QLabel(icon)
            ic_lbl.setStyleSheet(f"background-color: {bg}; color: {col}; font-size: 16px; padding: 4px; border-radius: 8px;")
            top_h.addWidget(ic_lbl)
            c_l.addLayout(top_h)

            v_lbl = QLabel(val)
            v_lbl.setStyleSheet(f"font-size: 20px; font-weight: 900; color: {col};")
            c_l.addWidget(v_lbl)

            s_lbl = QLabel(sub)
            s_lbl.setStyleSheet("font-size: 11px; font-weight: 600; color: #475569;")
            c_l.addWidget(s_lbl)

            kpi_layout.addWidget(card, 0, i)

        main_layout.addLayout(kpi_layout)

        # Center Section: Real-time Detections Table + Incident Timeline
        center_split = QHBoxLayout()
        center_split.setSpacing(20)

        # Left 60%: Live Detection Table
        det_card = QFrame()
        det_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px;")
        det_l = QVBoxLayout(det_card)
        det_l.setContentsMargins(18, 16, 18, 16)
        det_l.setSpacing(12)

        dh_box = QHBoxLayout()
        dh_t = QLabel("Live AI ANPR Plate Detections")
        dh_t.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        dh_box.addWidget(dh_t)
        dh_box.addStretch()

        feed_btn = QPushButton("Open Multi-Feeds ➔")
        feed_btn.setStyleSheet("background-color: #F1F5F9; color: #0C2540; border: 1px solid #CBD5E1; font-size: 11.5px; font-weight: 700; padding: 4px 10px;")
        feed_btn.clicked.connect(lambda: self.navigate_requested.emit("live-feeds"))
        dh_box.addWidget(feed_btn)
        det_l.addLayout(dh_box)

        # Table
        self.det_table = QTableWidget(len(RECENT_DETECTIONS), 6)
        self.det_table.setHorizontalHeaderLabels(["Plate No", "Confidence", "Speed", "Camera Node", "Time", "Status"])
        self.det_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.det_table.verticalHeader().setVisible(False)
        self.det_table.setSelectionBehavior(QTableWidget.SelectRows)
        self.det_table.setStyleSheet("border: 1px solid #F1EBE1; border-radius: 8px;")

        for r, item in enumerate(RECENT_DETECTIONS):
            p_item = QTableWidgetItem(f"🏷️  {item.plate}")
            p_item.setFont(QFont("Consolas", 10, QFont.Bold))
            self.det_table.setItem(r, 0, p_item)

            c_item = QTableWidgetItem(f"{item.confidence}%")
            self.det_table.setItem(r, 1, c_item)

            s_item = QTableWidgetItem(f"{item.speed} km/h")
            if item.speed > 80:
                s_item.setForeground(Qt.red)
            self.det_table.setItem(r, 2, s_item)

            self.det_table.setItem(r, 3, QTableWidgetItem(item.camera))
            self.det_table.setItem(r, 4, QTableWidgetItem(item.time))

            st_item = QTableWidgetItem(item.status)
            if item.matched:
                st_item.setForeground(Qt.red)
            else:
                st_item.setForeground(Qt.darkGreen)
            self.det_table.setItem(r, 5, st_item)

        det_l.addWidget(self.det_table)
        center_split.addWidget(det_card, 65)

        # Right 35%: Incident Timeline Feed
        time_card = QFrame()
        time_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px;")
        time_l = QVBoxLayout(time_card)
        time_l.setContentsMargins(18, 16, 18, 16)
        time_l.setSpacing(12)

        th_t = QLabel("Live Operations Timeline")
        th_t.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        time_l.addWidget(th_t)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")
        
        timeline_content = QWidget()
        tl_box = QVBoxLayout(timeline_content)
        tl_box.setSpacing(10)
        tl_box.setContentsMargins(0, 0, 0, 0)

        for ev in INITIAL_TIMELINE:
            ev_frame = QFrame()
            ev_frame.setStyleSheet("background-color: #FAF8F5; border: 1px solid #F1EBE1; border-radius: 10px; padding: 10px;")
            ev_l = QVBoxLayout(ev_frame)
            ev_l.setSpacing(3)

            top_row = QHBoxLayout()
            sev_lbl = QLabel(f"[{ev.severity}]")
            if ev.severity == "Critical":
                sev_lbl.setStyleSheet("color: #DC2626; font-weight: 800; font-size: 10.5px;")
            elif ev.severity == "Warning":
                sev_lbl.setStyleSheet("color: #D97706; font-weight: 800; font-size: 10.5px;")
            else:
                sev_lbl.setStyleSheet("color: #059669; font-weight: 800; font-size: 10.5px;")
            top_row.addWidget(sev_lbl)
            top_row.addStretch()
            time_lbl = QLabel(ev.time)
            time_lbl.setStyleSheet("color: #94A3B8; font-size: 10.5px; font-weight: 600;")
            top_row.addWidget(time_lbl)
            ev_l.addLayout(top_row)

            msg_lbl = QLabel(ev.message)
            msg_lbl.setWordWrap(True)
            msg_lbl.setStyleSheet("color: #1E293B; font-size: 11.5px; font-weight: 600;")
            ev_l.addWidget(msg_lbl)

            rep_lbl = QLabel(f"By: {ev.reportedBy}")
            rep_lbl.setStyleSheet("color: #64748B; font-size: 10px;")
            ev_l.addWidget(rep_lbl)

            tl_box.addWidget(ev_frame)

        tl_box.addStretch()
        scroll.setWidget(timeline_content)
        time_l.addWidget(scroll)

        center_split.addWidget(time_card, 35)
        main_layout.addLayout(center_split)
