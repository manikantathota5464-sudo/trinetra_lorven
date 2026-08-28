import os
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, 
    QPushButton, QStackedWidget, QMessageBox
)
from PySide6.QtCore import Qt, QDateTime, QTimer
from PySide6.QtGui import QPixmap, QCursor

from views.dashboard_view import DashboardView
from views.cameras_view import CamerasView
from views.live_feeds_view import LiveFeedsView
from views.alerts_view import AlertsView
from views.watchlist_view import WatchlistView
from views.traffic_rules_view import TrafficRulesView
from views.citizen_feedback_view import CitizenFeedbackView
from views.other_views import ReportsView, MapView, SettingsView

class MainWindow(QMainWindow):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("TRINETHRA — Intelligent Traffic Management & Enforcement Ecosystem")
        self.resize(1280, 800)
        self.setMinimumSize(1024, 680)
        self.init_ui()

    def init_ui(self):
        root_widget = QWidget()
        self.setCentralWidget(root_widget)
        root_layout = QVBoxLayout(root_widget)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # ─── 1. TOP HEADER ───
        header = QFrame()
        header.setFixedHeight(64)
        header.setStyleSheet("background-color: #FFFFFF; border-bottom: 1px solid #EDE5D8;")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(24, 8, 24, 8)

        # Left: Emblem & Ministry
        assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
        emblem_lbl = QLabel()
        emblem_path = os.path.join(assets_dir, "emblem_clean_no_black.png")
        if os.path.exists(emblem_path):
            pix = QPixmap(emblem_path).scaled(38, 44, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            emblem_lbl.setPixmap(pix)
        h_layout.addWidget(emblem_lbl)

        min_box = QVBoxLayout()
        min_box.setSpacing(1)
        g_lbl = QLabel("भारत सरकार  |  Government of India")
        g_lbl.setStyleSheet("font-size: 10px; font-weight: 600; color: #64748B;")
        m_lbl = QLabel("MINISTRY OF ROAD TRANSPORT & HIGHWAYS")
        m_lbl.setStyleSheet("font-size: 12px; font-weight: 900; color: #0C2540;")
        t_lbl = QLabel("TRINETHRA  <span style='color: #64748B; font-weight: 500; font-size: 10px;'>| TrafficSight Operations</span>")
        t_lbl.setStyleSheet("font-size: 13px; font-weight: 900; color: #1E293B;")
        min_box.addWidget(g_lbl)
        min_box.addWidget(m_lbl)
        min_box.addWidget(t_lbl)
        h_layout.addLayout(min_box)

        h_layout.addStretch()

        # Right: Clock & User
        self.time_lbl = QLabel()
        self.time_lbl.setStyleSheet("font-size: 12px; font-weight: 800; color: #0C2540;")
        h_layout.addWidget(self.time_lbl)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_clock)
        self.timer.start(1000)
        self.update_clock()

        user_badge = QLabel("👤 Admin User (Indlis Admin)")
        user_badge.setStyleSheet("background-color: #F1F5F9; color: #0C2540; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 11.5px;")
        h_layout.addWidget(user_badge)

        logout_btn = QPushButton("Sign Out")
        logout_btn.setStyleSheet("background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; font-size: 11px; font-weight: 700; padding: 6px 12px;")
        logout_btn.clicked.connect(self.close)
        h_layout.addWidget(logout_btn)

        root_layout.addWidget(header)

        # ─── 2. ALERT TICKER ───
        ticker = QFrame()
        ticker.setFixedHeight(30)
        ticker.setStyleSheet("background-color: #FFF7ED; border-bottom: 1px solid #FFEDD5;")
        t_l = QHBoxLayout(ticker)
        t_l.setContentsMargins(24, 0, 24, 0)
        t_badge = QLabel("SYSTEM ADVISORY")
        t_badge.setStyleSheet("background-color: #EA580C; color: #FFFFFF; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
        t_text = QLabel("Heavy congestion reported on I-9 Overpass. Traffic advisory in effect. | Speed limits strictly monitored.")
        t_text.setStyleSheet("color: #7C2D12; font-size: 11.5px; font-weight: 600;")
        t_l.addWidget(t_badge)
        t_l.addWidget(t_text)
        t_l.addStretch()
        root_layout.addWidget(ticker)

        # ─── 3. BODY: SIDEBAR + STACKED PAGES ───
        body_widget = QWidget()
        body_layout = QHBoxLayout(body_widget)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        # Sidebar
        sidebar = QFrame()
        sidebar.setFixedWidth(230)
        sidebar.setStyleSheet("background-color: #FFFFFF; border-right: 1px solid #EDE5D8;")
        sb_l = QVBoxLayout(sidebar)
        sb_l.setContentsMargins(14, 16, 14, 16)
        sb_l.setSpacing(6)

        sb_l.addWidget(QLabel("MAIN NAVIGATION"))
        
        self.nav_buttons = {}
        nav_items = [
            ("dashboard", "📊  Dashboard"),
            ("cameras", "📹  Cameras"),
            ("live-feeds", "🎥  Live Feeds"),
            ("alerts", "⚠️  Alerts & Incidents"),
            ("watchlist", "🛡️  Vehicle Watch List"),
            ("reports", "📑  Reports"),
            ("map", "🗺️  Map View"),
            ("settings", "⚙️  System Settings"),
        ]

        for tab_id, label in nav_items:
            btn = QPushButton(label)
            btn.setCursor(QCursor(Qt.PointingHandCursor))
            btn.setStyleSheet("text-align: left; padding: 8px 12px; font-size: 12px; border-radius: 8px; font-weight: 600;")
            btn.clicked.connect(lambda ch, tid=tab_id: self.switch_tab(tid))
            self.nav_buttons[tab_id] = btn
            sb_l.addWidget(btn)

        sb_l.addSpacing(12)
        sb_l.addWidget(QLabel("REGULATORY & CITIZEN DESK"))

        desk_items = [
            ("rules", "📖  Traffic Rules & Guidelines"),
            ("feedback", "💬  Citizen Feedback"),
        ]
        for tab_id, label in desk_items:
            btn = QPushButton(label)
            btn.setCursor(QCursor(Qt.PointingHandCursor))
            btn.setStyleSheet("text-align: left; padding: 8px 12px; font-size: 12px; border-radius: 8px; font-weight: 600;")
            btn.clicked.connect(lambda ch, tid=tab_id: self.switch_tab(tid))
            self.nav_buttons[tab_id] = btn
            sb_l.addWidget(btn)

        sb_l.addStretch()

        # Helpline Widget at bottom of sidebar
        hl_box = QFrame()
        hl_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 10px;")
        hl_l = QVBoxLayout(hl_box)
        hl_l.addWidget(QLabel("📞 Helpline: 1033"))
        hl_l.addWidget(QLabel("Safe Roads, Safe India"))
        sb_l.addWidget(hl_box)

        body_layout.addWidget(sidebar)

        # Stacked Pages
        self.stack = QStackedWidget()
        self.pages = {
            "dashboard": DashboardView(),
            "cameras": CamerasView(),
            "live-feeds": LiveFeedsView(),
            "alerts": AlertsView(),
            "watchlist": WatchlistView(),
            "traffic_rules": TrafficRulesView(),
            "citizen_feedback": CitizenFeedbackView(),
            "reports": ReportsView(),
            "map": MapView(),
            "settings": SettingsView(),
        }

        self.pages["dashboard"].navigate_requested.connect(self.switch_tab)
        self.pages["cameras"].open_feed_requested.connect(lambda cid: self.switch_tab("live-feeds"))

        for k, view in self.pages.items():
            self.stack.addWidget(view)

        body_layout.addWidget(self.stack, 1)
        root_layout.addWidget(body_widget, 1)

        self.switch_tab("dashboard")

    def update_clock(self):
        self.time_lbl.setText(QDateTime.currentDateTime().toString("ddd, dd MMM yyyy  hh:mm:ss AP"))

    def switch_tab(self, tab_id):
        tab_map = {
            "dashboard": 0,
            "cameras": 1,
            "live-feeds": 2,
            "alerts": 3,
            "watchlist": 4,
            "rules": 5,
            "feedback": 6,
            "reports": 7,
            "map": 8,
            "settings": 9,
        }

        idx = tab_map.get(tab_id, 0)
        self.stack.setCurrentIndex(idx)

        # Highlight active button
        for k, btn in self.nav_buttons.items():
            if k == tab_id:
                btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; text-align: left; padding: 8px 12px; font-size: 12px; border-radius: 8px;")
            else:
                btn.setStyleSheet("background-color: transparent; color: #475569; font-weight: 600; text-align: left; padding: 8px 12px; font-size: 12px; border-radius: 8px;")
