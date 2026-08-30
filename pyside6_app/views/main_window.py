import os
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QStackedWidget, QFrame, QComboBox, QScrollArea, QMenu, QMessageBox
)
from PySide6.QtCore import Qt, QTimer, QDateTime, Signal
from PySide6.QtGui import QPixmap, QFont, QCursor, QAction

from views.dashboard_view import DashboardView
from views.cameras_view import CamerasView
from views.live_feeds_view import LiveFeedsView
from views.alerts_view import AlertsView
from views.watchlist_view import WatchlistView
from views.traffic_rules_view import TrafficRulesView
from views.citizen_feedback_view import CitizenFeedbackView
from views.other_views import ReportsView, MapView, SettingsView, AnalyticsView, AuditLogView
from models.data_store import INITIAL_ALERTS

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TRINETHRA — Ministry of Road Transport & Highways")
        self.resize(1380, 880)
        self.setMinimumSize(1100, 720)
        self.active_route = "dashboard"
        self.nav_buttons = {}
        self.init_ui()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # ── 1. TOP HEADER BAR ──
        header = QFrame()
        header.setFixedHeight(68)
        header.setObjectName("headerPanel")
        header.setStyleSheet("background-color: #FFFFFF; border-bottom: 1px solid #E2E8F0;")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(20, 8, 20, 8)
        h_layout.setSpacing(14)

        # Left: National Emblem & Ministry Title
        left_h = QHBoxLayout()
        left_h.setSpacing(10)

        emblem_lbl = QLabel()
        assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
        emblem_path = os.path.join(assets_dir, "emblem_clean_no_black.png")
        if os.path.exists(emblem_path):
            pix = QPixmap(emblem_path).scaled(38, 44, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            emblem_lbl.setPixmap(pix)
        left_h.addWidget(emblem_lbl)

        title_box = QVBoxLayout()
        title_box.setSpacing(1)
        govt_lbl = QLabel("भारत सरकार | Government of India")
        govt_lbl.setStyleSheet("font-size: 10px; font-weight: 700; color: #475569;")
        morth_lbl = QLabel("MINISTRY OF ROAD TRANSPORT & HIGHWAYS")
        morth_lbl.setStyleSheet("font-size: 12px; font-weight: 900; color: #0A2540; letter-spacing: 0.5px;")
        
        self.page_sub_title = QLabel("TRINETHRA | National AI Surveillance Grid")
        self.page_sub_title.setStyleSheet("font-size: 9.5px; font-weight: 800; color: #FF9933;")

        title_box.addWidget(govt_lbl)
        title_box.addWidget(morth_lbl)
        title_box.addWidget(self.page_sub_title)
        left_h.addLayout(title_box)
        h_layout.addLayout(left_h)

        h_layout.addStretch()

        # Center-Right: Digital India Badge
        di_frame = QFrame()
        di_frame.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 4px 10px;")
        di_l = QHBoxLayout(di_frame)
        di_l.setContentsMargins(4, 2, 4, 2)
        di_l.setSpacing(6)
        di_icon = QLabel("🌐")
        di_icon.setStyleSheet("font-size: 14px;")
        di_text = QVBoxLayout()
        di_text.setSpacing(0)
        di_t1 = QLabel("Digital India")
        di_t1.setStyleSheet("font-size: 10px; font-weight: 900; color: #0A2540;")
        di_t2 = QLabel("Power To Empower")
        di_t2.setStyleSheet("font-size: 8.5px; font-weight: 600; color: #64748B;")
        di_text.addWidget(di_t1)
        di_text.addWidget(di_t2)
        di_l.addWidget(di_icon)
        di_l.addLayout(di_text)
        h_layout.addWidget(di_frame)

        # Accessibility Text Size Buttons
        ts_lbl = QLabel("Text Size:")
        ts_lbl.setStyleSheet("font-size: 11px; font-weight: 600; color: #475569;")
        h_layout.addWidget(ts_lbl)

        for txt in ("A-", "A", "A+"):
            btn = QPushButton(txt)
            btn.setFixedSize(26, 22)
            if txt == "A":
                btn.setStyleSheet("background-color: #0A2540; color: #FFFFFF; border-radius: 4px; font-size: 10px; font-weight: 800;")
            else:
                btn.setStyleSheet("background-color: #FFFFFF; color: #334155; border: 1px solid #CBD5E1; border-radius: 4px; font-size: 10px; font-weight: 700;")
            h_layout.addWidget(btn)

        # Language dropdown
        lang_combo = QComboBox()
        lang_combo.addItems(["English", "हिन्दी"])
        lang_combo.setFixedWidth(85)
        lang_combo.setStyleSheet("background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 600;")
        h_layout.addWidget(lang_combo)

        # Live Clock & Date Box
        clock_frame = QFrame()
        clock_frame.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 4px 10px;")
        cl_l = QVBoxLayout(clock_frame)
        cl_l.setContentsMargins(4, 2, 4, 2)
        cl_l.setSpacing(0)
        self.time_lbl = QLabel("08:19:23 AM")
        self.time_lbl.setStyleSheet("font-size: 11px; font-weight: 900; color: #0A2540; font-family: Consolas;")
        self.date_lbl = QLabel("Tue, 18 Aug 2026")
        self.date_lbl.setStyleSheet("font-size: 9px; font-weight: 600; color: #64748B;")
        cl_l.addWidget(self.time_lbl)
        cl_l.addWidget(self.date_lbl)
        h_layout.addWidget(clock_frame)

        # Clock Timer
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_clock)
        self.timer.start(1000)

        # Notifications Bell Button with Alert Badge
        self.bell_btn = QPushButton("🔔  21")
        self.bell_btn.setCursor(QCursor(Qt.PointingHandCursor))
        self.bell_btn.setStyleSheet("background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; font-weight: 900; font-size: 11px; padding: 5px 10px; border-radius: 6px;")
        self.bell_btn.clicked.connect(self.show_notifications_menu)
        h_layout.addWidget(self.bell_btn)

        # User Profile Menu Button
        self.profile_btn = QPushButton("👤 AU Admin User")
        self.profile_btn.setCursor(QCursor(Qt.PointingHandCursor))
        self.profile_btn.setStyleSheet("background-color: #0A2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 6px;")
        self.profile_btn.clicked.connect(self.show_profile_menu)
        h_layout.addWidget(self.profile_btn)

        main_layout.addWidget(header)

        # ── 2. SYSTEM ALERT MARQUEE TICKER ──
        ticker_bar = QFrame()
        ticker_bar.setFixedHeight(30)
        ticker_bar.setStyleSheet("background-color: #0A2540; border-bottom: 1px solid #06182C;")
        tb_l = QHBoxLayout(ticker_bar)
        tb_l.setContentsMargins(20, 0, 20, 0)
        tb_l.setSpacing(10)

        alert_chip = QLabel("🚨 SYSTEM ADVISORY")
        alert_chip.setStyleSheet("background-color: #EF4444; color: #FFFFFF; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
        tb_l.addWidget(alert_chip)

        self.marquee_lbl = QLabel("Heavy congestion reported on I-9 Overpass. Traffic advisory in effect. | Stay Safe, Follow Rules. | Speed limits strictly monitored on Riverfront Road. | Emergency Lane clearance active.")
        self.marquee_lbl.setStyleSheet("color: #CBD5E1; font-size: 10.5px; font-weight: 600;")
        tb_l.addWidget(self.marquee_lbl)
        tb_l.addStretch()

        live_net = QLabel("● Central Highway Grid: 99.8% Sync")
        live_net.setStyleSheet("color: #10B981; font-size: 9.5px; font-weight: 800;")
        tb_l.addWidget(live_net)

        main_layout.addWidget(ticker_bar)

        # ── 3. BODY WORKSPACE (Sidebar + Stacked Content) ──
        body_widget = QWidget()
        body_layout = QHBoxLayout(body_widget)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        # Sidebar
        sidebar = QFrame()
        sidebar.setFixedWidth(235)
        sidebar.setObjectName("sidebarPanel")
        sidebar.setStyleSheet("background-color: #FFFFFF; border-right: 1px solid #EDE5D8;")
        sb_layout = QVBoxLayout(sidebar)
        sb_layout.setContentsMargins(12, 16, 12, 16)
        sb_layout.setSpacing(4)

        # Main Navigation Group
        nav_lbl = QLabel("MAIN NAVIGATION")
        nav_lbl.setStyleSheet("font-size: 9px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px; margin-bottom: 4px; padding-left: 6px;")
        sb_layout.addWidget(nav_lbl)

        main_nav_items = [
            ("dashboard", "📊  Dashboard", None),
            ("cameras", "📹  Cameras", None),
            ("live-feeds", "📺  Live Feeds", None),
            ("alerts", "⚠️  Alerts & Incidents", "21"),
            ("watchlist", "🛡️  Vehicle Watch List", None),
            ("reports", "📄  Reports", None),
            ("map", "🗺️  Map View", None),
            ("settings", "⚙️  System Settings", None),
        ]

        for route, label, badge in main_nav_items:
            btn = self.create_nav_button(route, label, badge)
            self.nav_buttons[route] = btn
            sb_layout.addWidget(btn)

        sb_layout.addSpacing(14)

        # Regulatory & Citizen Desk Group
        desk_lbl = QLabel("REGULATORY & CITIZEN DESK")
        desk_lbl.setStyleSheet("font-size: 9px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px; margin-bottom: 4px; padding-left: 6px;")
        sb_layout.addWidget(desk_lbl)

        desk_items = [
            ("rules", "📜  Traffic Rules", "Live"),
            ("citizen-feedback", "💬  Citizen Feedback", "Live"),
        ]

        for route, label, badge in desk_items:
            btn = self.create_nav_button(route, label, badge)
            self.nav_buttons[route] = btn
            sb_layout.addWidget(btn)

        sb_layout.addSpacing(10)

        # Helpline 1033 Highlighted Button
        hl_btn = QPushButton("📞  Helpline: 1033")
        hl_btn.setCursor(QCursor(Qt.PointingHandCursor))
        hl_btn.setStyleSheet("background-color: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; font-weight: 900; font-size: 11.5px; padding: 8px 12px; border-radius: 8px; text-align: left;")
        hl_btn.clicked.connect(lambda: QMessageBox.information(self, "National Highway Helpline", "National Highway Toll-Free Emergency Helpline: 1033 (24x7 Support Available)"))
        sb_layout.addWidget(hl_btn)

        # Download Mobile App Button
        app_btn = QPushButton("📱  Download Mobile App")
        app_btn.setCursor(QCursor(Qt.PointingHandCursor))
        app_btn.setStyleSheet("background-color: #FAF8F5; color: #0C2540; border: 1px solid #EDE5D8; font-weight: 800; font-size: 11px; padding: 8px 12px; border-radius: 8px; text-align: left;")
        app_btn.clicked.connect(lambda: QMessageBox.information(self, "Mobile App", "TRINETHRA Highway Citizen Android & iOS apps are available on Google Play & App Store."))
        sb_layout.addWidget(app_btn)

        sb_layout.addStretch()

        # Safe Roads Safe India Card
        safe_card = QFrame()
        safe_card.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 10px;")
        sc_l = QVBoxLayout(safe_card)
        sc_l.setSpacing(2)
        s1 = QLabel("🇮🇳 Safe Roads, Safe India")
        s1.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #0C2540;")
        s2 = QLabel("MoRTH AI ANPR Grid v2.4")
        s2.setStyleSheet("font-size: 9px; color: #64748B;")
        sc_l.addWidget(s1)
        sc_l.addWidget(s2)
        sb_layout.addWidget(safe_card)

        body_layout.addWidget(sidebar)

        # Main Stacked Area
        self.stack = QStackedWidget()
        
        self.dashboard_view = DashboardView()
        self.dashboard_view.navigate_requested.connect(self.navigate_to)
        self.stack.addWidget(self.dashboard_view)  # 0

        self.cameras_view = CamerasView()
        self.cameras_view.open_feed_requested.connect(lambda cid: self.navigate_to("live-feeds"))
        self.stack.addWidget(self.cameras_view)    # 1

        self.live_feeds_view = LiveFeedsView()
        self.stack.addWidget(self.live_feeds_view) # 2

        self.alerts_view = AlertsView()
        self.stack.addWidget(self.alerts_view)     # 3

        self.watchlist_view = WatchlistView()
        self.stack.addWidget(self.watchlist_view)   # 4

        self.rules_view = TrafficRulesView()
        self.stack.addWidget(self.rules_view)       # 5

        self.feedback_view = CitizenFeedbackView()
        self.stack.addWidget(self.feedback_view)   # 6

        self.reports_view = ReportsView()
        self.stack.addWidget(self.reports_view)     # 7

        self.map_view = MapView()
        self.stack.addWidget(self.map_view)         # 8

        self.settings_view = SettingsView()
        self.stack.addWidget(self.settings_view)   # 9

        self.analytics_view = AnalyticsView()
        self.stack.addWidget(self.analytics_view)   # 10

        self.audit_view = AuditLogView()
        self.stack.addWidget(self.audit_view)       # 11

        body_layout.addWidget(self.stack, 1)
        main_layout.addWidget(body_widget, 1)

        self.navigate_to("dashboard")

    def create_nav_button(self, route: str, label: str, badge: str = None):
        btn = QPushButton()
        btn.setCursor(QCursor(Qt.PointingHandCursor))
        btn.setFixedHeight(36)
        
        btn_layout = QHBoxLayout(btn)
        btn_layout.setContentsMargins(10, 0, 10, 0)

        t_lbl = QLabel(label)
        t_lbl.setStyleSheet("font-size: 11.5px; font-weight: 700; background: transparent; border: none;")
        btn_layout.addWidget(t_lbl)
        btn_layout.addStretch()

        if badge:
            b_lbl = QLabel(badge)
            if badge == "Live":
                b_lbl.setStyleSheet("background-color: #ECFDF5; color: #059669; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            else:
                b_lbl.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            btn_layout.addWidget(b_lbl)

        btn.clicked.connect(lambda: self.navigate_to(route))
        return btn

    def navigate_to(self, route: str):
        self.active_route = route
        route_map = {
            "dashboard": (0, "TRINETHRA | Operations Command Dashboard"),
            "cameras": (1, "TRINETHRA | Surveillance Camera Registry"),
            "live-feeds": (2, "TRINETHRA | Multi-Stream HD Live Feeds"),
            "alerts": (3, "TRINETHRA | Security Alerts & Dispatches"),
            "watchlist": (4, "TRINETHRA | Vehicle Hotlist & Watch Registry"),
            "rules": (5, "TRINETHRA | Statutory Traffic Rules & Penalties"),
            "citizen-feedback": (6, "TRINETHRA | Public Grievances & Redressal"),
            "reports": (7, "TRINETHRA | Compliance & Analytics Reports"),
            "map": (8, "TRINETHRA | Geospatial Camera Node Radar"),
            "settings": (9, "TRINETHRA | System Settings & Calibration"),
            "analytics": (10, "TRINETHRA | Predictive AI Analytics"),
            "audit-log": (11, "TRINETHRA | Operator Cryptographic Log"),
        }

        if route in route_map:
            idx, title = route_map[route]
            self.stack.setCurrentIndex(idx)
            self.page_sub_title.setText(title)

        for r, b in self.nav_buttons.items():
            if r == route:
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; border-radius: 8px; text-align: left;")
            else:
                b.setStyleSheet("background-color: transparent; color: #334155; border: none; border-radius: 8px; text-align: left;")

    def update_clock(self):
        now = QDateTime.currentDateTime()
        self.time_lbl.setText(now.toString("hh:mm:ss AP"))
        self.date_lbl.setText(now.toString("ddd, dd MMM yyyy"))

    def show_notifications_menu(self):
        menu = QMenu(self)
        menu.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; padding: 6px; font-size: 11px;")
        
        title_act = QAction("Active High-Priority Alerts (21)", self)
        title_act.setEnabled(False)
        menu.addAction(title_act)
        menu.addSeparator()

        for alt in INITIAL_ALERTS[:4]:
            act = QAction(f"⚠️ {alt.type} — {alt.plateNumber} ({alt.location})", self)
            act.triggered.connect(lambda: self.navigate_to("alerts"))
            menu.addAction(act)

        menu.addSeparator()
        all_act = QAction("View All Alerts ➔", self)
        all_act.triggered.connect(lambda: self.navigate_to("alerts"))
        menu.addAction(all_act)

        menu.exec(self.bell_btn.mapToGlobal(self.bell_btn.rect().bottomLeft()))

    def show_profile_menu(self):
        menu = QMenu(self)
        menu.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; padding: 6px; font-size: 11px;")
        
        info_act = QAction("Signed in as: AU Admin User (Indlis Admin)", self)
        info_act.setEnabled(False)
        menu.addAction(info_act)
        menu.addSeparator()

        sett_act = QAction("⚙️ System Settings", self)
        sett_act.triggered.connect(lambda: self.navigate_to("settings"))
        menu.addAction(sett_act)

        out_act = QAction("🔒 Sign Out", self)
        out_act.triggered.connect(lambda: QMessageBox.information(self, "Sign Out", "Session closed successfully."))
        menu.addAction(out_act)

        menu.exec(self.profile_btn.mapToGlobal(self.profile_btn.rect().bottomLeft()))
