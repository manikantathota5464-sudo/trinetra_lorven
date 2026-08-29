import os
import math
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QGridLayout, QComboBox, QLineEdit, QScrollArea, QTableWidget, 
    QTableWidgetItem, QHeaderView, QRadioButton, QCheckBox, QMessageBox
)
from PySide6.QtCore import Qt, QPointF, QRectF
from PySide6.QtGui import QPainter, QColor, QPen, QBrush, QFont, QCursor, QLinearGradient
from models.data_store import (
    INITIAL_REPORTS, DETECTIONS_OVER_TIME, DETECTIONS_BY_VEHICLE_TYPE, 
    DETECTIONS_BY_HOUR, INITIAL_CAMERAS, ReportItem
)

# ── 1. CUSTOM VECTOR CHARTS FOR REPORTS ──

class AreaChartWidget(QFrame):
    def __init__(self, data, parent=None):
        super().__init__(parent)
        self.data = data
        self.setMinimumHeight(200)
        self.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()
        pad_l, pad_r, pad_t, pad_b = 45, 20, 25, 35
        chart_w = w - pad_l - pad_r
        chart_h = h - pad_t - pad_b

        # Grid lines
        painter.setPen(QPen(QColor("#F1F5F9"), 1))
        for i in range(4):
            y = int(pad_t + chart_h * (i / 3))
            painter.drawLine(pad_l, y, w - pad_r, y)
            val = int(3500 - (i * 1000))
            painter.setPen(QColor("#94A3B8"))
            painter.drawText(5, y + 4, f"{val:,}")
            painter.setPen(QPen(QColor("#F1F5F9"), 1))

        if not self.data:
            painter.end()
            return

        max_val = 3500.0
        n = len(self.data)
        points = []
        for i, pt in enumerate(self.data):
            x = pad_l + (chart_w * (i / (n - 1)))
            y = pad_t + chart_h * (1.0 - (pt['detections'] / max_val))
            points.append(QPointF(x, y))

        # Fill Polygon
        poly = [QPointF(pad_l, pad_t + chart_h)] + points + [QPointF(points[-1].x(), pad_t + chart_h)]
        grad = QLinearGradient(0, pad_t, 0, pad_t + chart_h)
        grad.setColorAt(0, QColor(59, 130, 246, 120))
        grad.setColorAt(1, QColor(59, 130, 246, 5))
        painter.setBrush(QBrush(grad))
        painter.setPen(Qt.NoPen)
        painter.drawPolygon(poly)

        # Line
        line_pen = QPen(QColor("#3B82F6"), 2.5)
        painter.setPen(line_pen)
        for i in range(len(points) - 1):
            painter.drawLine(points[i], points[i + 1])

        # Points & X-labels
        painter.setBrush(QBrush(QColor("#FFFFFF")))
        painter.setPen(QPen(QColor("#1E3A8A"), 2))
        f = painter.font()
        f.setPointSize(8)
        f.setBold(True)
        painter.setFont(f)

        for i, pt in enumerate(self.data):
            p = points[i]
            painter.setPen(QPen(QColor("#1E3A8A"), 2))
            painter.setBrush(QBrush(QColor("#FFFFFF")))
            painter.drawEllipse(int(p.x()) - 4, int(p.y()) - 4, 8, 8)

            painter.setPen(QColor("#64748B"))
            painter.drawText(int(p.x()) - 16, h - 12, pt['day'])

        painter.end()


class DonutChartWidget(QFrame):
    def __init__(self, data, parent=None):
        super().__init__(parent)
        self.data = data
        self.setMinimumHeight(200)
        self.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()

        total = sum(d['value'] for d in self.data)
        cx = int(w * 0.35)
        cy = int(h * 0.50)
        radius = int(min(cx - 15, cy - 15))
        hole_radius = int(radius * 0.55)

        start_angle = 0
        rect = QRectF(cx - radius, cy - radius, radius * 2, radius * 2)

        for seg in self.data:
            span_angle = int((seg['value'] / total) * 360 * 16)
            painter.setBrush(QBrush(QColor(seg['color'])))
            painter.setPen(Qt.NoPen)
            painter.drawPie(rect, start_angle, span_angle)
            start_angle += span_angle

        # Inner hole
        painter.setBrush(QBrush(QColor("#FFFFFF")))
        painter.drawEllipse(cx - hole_radius, cy - hole_radius, hole_radius * 2, hole_radius * 2)

        # Center Text
        painter.setPen(QColor("#0C2540"))
        f = painter.font()
        f.setPointSize(9)
        f.setBold(True)
        painter.setFont(f)
        painter.drawText(cx - 24, cy - 2, "18,745")
        painter.setPen(QColor("#94A3B8"))
        f.setPointSize(7)
        f.setBold(False)
        painter.setFont(f)
        painter.drawText(cx - 14, cy + 12, "Total")

        # Legend on Right
        lx = int(w * 0.65)
        ly = 24
        for seg in self.data:
            painter.setBrush(QBrush(QColor(seg['color'])))
            painter.setPen(Qt.NoPen)
            painter.drawRoundedRect(lx, ly, 10, 10, 2, 2)

            pct = int((seg['value'] / total) * 100)
            painter.setPen(QColor("#1E293B"))
            f.setPointSize(8)
            f.setBold(True)
            painter.setFont(f)
            painter.drawText(lx + 16, ly + 9, f"{seg['name']}: {seg['value']:,} ({pct}%)")
            ly += 26

        painter.end()


class BarChartWidget(QFrame):
    def __init__(self, data, parent=None):
        super().__init__(parent)
        self.data = data
        self.setMinimumHeight(200)
        self.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()
        pad_l, pad_r, pad_t, pad_b = 40, 20, 25, 30
        chart_w = w - pad_l - pad_r
        chart_h = h - pad_t - pad_b

        # Grid lines
        painter.setPen(QPen(QColor("#F1F5F9"), 1))
        for i in range(4):
            y = int(pad_t + chart_h * (i / 3))
            painter.drawLine(pad_l, y, w - pad_r, y)
            val = int(3600 - (i * 1200))
            painter.setPen(QColor("#94A3B8"))
            painter.drawText(5, y + 4, f"{val:,}")
            painter.setPen(QPen(QColor("#F1F5F9"), 1))

        if not self.data:
            painter.end()
            return

        max_val = 3600.0
        n = len(self.data)
        slot_w = chart_w / n
        bar_w = max(6, int(slot_w * 0.55))

        f = painter.font()
        f.setPointSize(7)
        painter.setFont(f)

        for i, pt in enumerate(self.data):
            bx = int(pad_l + i * slot_w + (slot_w - bar_w) / 2)
            bh = int(chart_h * (pt['value'] / max_val))
            by = int(pad_t + chart_h - bh)

            painter.setBrush(QBrush(QColor("#F59E0B")))
            painter.setPen(Qt.NoPen)
            painter.drawRoundedRect(bx, by, bar_w, bh, 3, 3)

            painter.setPen(QColor("#94A3B8"))
            painter.drawText(bx - 4, h - 8, pt['hour'][:2])

        painter.end()


# ── 2. REPORTS VIEW ──

class ReportsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.reports = list(INITIAL_REPORTS)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(14)

        # ── 1. FILTER TOOLBAR ──
        filter_card = QFrame()
        filter_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        f_l = QHBoxLayout(filter_card)
        f_l.setContentsMargins(8, 4, 8, 4)
        f_l.setSpacing(10)

        f_type = QComboBox()
        f_type.addItems(["All Report Types", "Daily Summary", "Violation Audit", "Hotlist Resolution"])
        f_l.addWidget(f_type)

        f_loc = QComboBox()
        f_loc.addItems(["Bhimavaram (All)", "Main St", "I-9 Overpass", "Harbor Rd"])
        f_l.addWidget(f_loc)

        f_cam = QComboBox()
        f_cam.addItems(["All Cameras", "CAM-1024", "CAM-0785", "CAM-0456"])
        f_l.addWidget(f_cam)

        f_veh = QComboBox()
        f_veh.addItems(["All Vehicle Types", "Car", "Bike", "Truck", "Bus"])
        f_l.addWidget(f_veh)

        f_l.addStretch()
        exp_btn = QPushButton("📑 Export Report")
        exp_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
        exp_btn.clicked.connect(lambda: QMessageBox.information(self, "Export", "Comprehensive audit report PDF exported."))
        f_l.addWidget(exp_btn)
        main_layout.addWidget(filter_card)

        # ── 2. 5 SUMMARY STATS CARDS ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        stats = [
            ("TOTAL SCANS", "18,745", "Last 7 days", "#0C2540"),
            ("TOTAL DETECTIONS", "12,846", "Unique plates", "#059669"),
            ("ACTIVE ALERTS", "86", "Requires review", "#DC2626"),
            ("VIOLATIONS", "312", "E-challans issued", "#D97706"),
            ("AVG SPEED", "62 km/h", "Corridor flow", "#7C3AED"),
        ]
        for title, val, sub, col in stats:
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
            cl = QVBoxLayout(card)
            cl.setSpacing(2)
            t_lbl = QLabel(title)
            t_lbl.setStyleSheet("font-size: 9.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
            cl.addWidget(t_lbl)
            v_lbl = QLabel(val)
            v_lbl.setStyleSheet(f"font-size: 18px; font-weight: 900; color: {col};")
            cl.addWidget(v_lbl)
            s_lbl = QLabel(sub)
            s_lbl.setStyleSheet("font-size: 9.5px; font-weight: 600; color: #64748B;")
            cl.addWidget(s_lbl)
            kpi_row.addWidget(card)
        main_layout.addLayout(kpi_row)

        # ── 3. CHARTS ROW ──
        charts_row = QHBoxLayout()
        charts_row.setSpacing(12)

        # Area Chart
        c1_box = QFrame()
        c1_box.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
        c1_l = QVBoxLayout(c1_box)
        c1_t = QLabel("DETECTIONS OVER TIME (7 DAYS)")
        c1_t.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c1_l.addWidget(c1_t)
        c1_l.addWidget(AreaChartWidget(DETECTIONS_OVER_TIME))
        charts_row.addWidget(c1_box, 35)

        # Donut Chart
        c2_box = QFrame()
        c2_box.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
        c2_l = QVBoxLayout(c2_box)
        c2_t = QLabel("DETECTIONS BY VEHICLE TYPE")
        c2_t.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c2_l.addWidget(c2_t)
        c2_l.addWidget(DonutChartWidget(DETECTIONS_BY_VEHICLE_TYPE))
        charts_row.addWidget(c2_box, 35)

        # Bar Chart
        c3_box = QFrame()
        c3_box.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
        c3_l = QVBoxLayout(c3_box)
        c3_t = QLabel("DETECTIONS BY HOUR (PEAK FLOW)")
        c3_t.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        c3_l.addWidget(c3_t)
        c3_l.addWidget(BarChartWidget(DETECTIONS_BY_HOUR))
        charts_row.addWidget(c3_box, 30)

        main_layout.addLayout(charts_row)

        # ── 4. REPORT SUMMARY TABLE ──
        table_container = QFrame()
        table_container.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        tc_l = QVBoxLayout(table_container)
        tc_l.setContentsMargins(0, 0, 0, 0)

        table = QTableWidget(len(self.reports), 6)
        table.setHorizontalHeaderLabels(["Report Name", "Type", "Location", "Date Range", "Summary", "Generated On"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        table.verticalHeader().setVisible(False)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.setStyleSheet("border: none; background-color: #FFFFFF;")

        for r, rep in enumerate(self.reports):
            table.setItem(r, 0, QTableWidgetItem(f"📄 {rep.name}"))
            table.setItem(r, 1, QTableWidgetItem(rep.type))
            table.setItem(r, 2, QTableWidgetItem(rep.location))
            table.setItem(r, 3, QTableWidgetItem(rep.dateRange))
            table.setItem(r, 4, QTableWidgetItem(rep.summary))
            table.setItem(r, 5, QTableWidgetItem(rep.generatedOn))

        tc_l.addWidget(table)
        main_layout.addWidget(table_container, 1)


# ── 3. MAP OVERVIEW VIEW ──

class FullMapCanvas(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumHeight(380)
        self.setStyleSheet("background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;")
        self.pins = [
            ("CAM-1024", "Main St & 5th Ave", 0.28, 0.46, "Active", "#10B981"),
            ("CAM-0785", "I-9 Overpass", 0.50, 0.21, "Active", "#10B981"),
            ("CAM-0456", "Harbor Rd Exit", 0.68, 0.47, "Alert", "#EF4444"),
            ("CAM-0932", "City Center Parking", 0.18, 0.73, "Inactive", "#F59E0B"),
            ("CAM-1120", "Junction 9 Overpass", 0.82, 0.32, "Active", "#10B981"),
            ("CAM-0633", "Riverside Park", 0.42, 0.78, "Active", "#10B981"),
        ]

    def paintEvent(self, event):
        super().paintEvent(event)
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w = self.width()
        h = self.height()

        # Grid
        painter.setPen(QPen(QColor("#E2E8F0"), 0.5))
        for x in range(0, w, 24):
            painter.drawLine(x, 0, x, h)
        for y in range(0, h, 24):
            painter.drawLine(0, y, w, y)

        # Canal / River
        water_pen = QPen(QColor("#BFDBFE"), 20, Qt.SolidLine, Qt.RoundCap)
        painter.setPen(water_pen)
        painter.drawLine(0, int(h * 0.72), int(w * 0.40), int(h * 0.62))
        painter.drawLine(int(w * 0.40), int(h * 0.62), int(w * 0.65), int(h * 0.82))
        painter.drawLine(int(w * 0.65), int(h * 0.82), w, int(h * 0.80))

        # Main Highway NH-216
        painter.setPen(QPen(QColor("#CBD5E1"), 16, Qt.SolidLine, Qt.SquareCap))
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))
        painter.setPen(QPen(QColor("#F1F5F9"), 12, Qt.SolidLine, Qt.SquareCap))
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))
        painter.setPen(QPen(QColor("#F8FAFC"), 1.5, Qt.DashLine))
        painter.drawLine(0, int(h * 0.50), w, int(h * 0.50))

        # Secondary avenues
        sec_pen = QPen(QColor("#E2E8F0"), 8)
        painter.setPen(sec_pen)
        painter.drawLine(int(w * 0.28), 0, int(w * 0.28), h)
        painter.drawLine(int(w * 0.68), 0, int(w * 0.68), h)
        painter.drawLine(0, int(h * 0.24), w, int(h * 0.24))

        # Hub & Spoke lines from Center
        hub_x = int(w * 0.50)
        hub_y = int(h * 0.50)
        spoke_pen = QPen(QColor("#3B82F6"), 1.5, Qt.DashLine)
        painter.setPen(spoke_pen)
        for _, _, rx, ry, _, _ in self.pins:
            painter.drawLine(hub_x, hub_y, int(w * rx), int(h * ry))

        # Center Hub Marker
        painter.setBrush(QBrush(QColor("#0C2540")))
        painter.setPen(QPen(QColor("#FFFFFF"), 2.5))
        painter.drawEllipse(hub_x - 10, hub_y - 10, 20, 20)
        painter.setPen(QColor("#FFFFFF"))
        f = painter.font()
        f.setPointSize(7)
        f.setBold(True)
        painter.setFont(f)
        painter.drawText(hub_x - 8, hub_y + 4, "HUB")

        # Pins
        for cid, loc, rx, ry, st, col_hex in self.pins:
            px = int(w * rx)
            py = int(h * ry)

            painter.setBrush(QBrush(QColor(col_hex)))
            painter.setPen(QPen(QColor("#FFFFFF"), 2))
            painter.drawEllipse(px - 7, py - 7, 14, 14)

            painter.setPen(QColor("#1E293B"))
            painter.drawText(px + 10, py + 4, f"{cid}")

        painter.end()


class MapView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(14)

        # ── 1. 5 KPI CARDS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        stats = [
            ("TOTAL CAMERAS", "1,284", "All deployed nodes", "#0C2540"),
            ("ACTIVE CAMERAS", "1,042", "81% operational", "#059669"),
            ("ACTIVE VEHICLES", "3,450", "Live on road network", "#2563EB"),
            ("ACTIVE ALERTS", "21", "Critical incidents", "#DC2626"),
            ("INCIDENTS TODAY", "8", "Under patrol handling", "#D97706"),
        ]
        for title, val, sub, col in stats:
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
            cl = QVBoxLayout(card)
            cl.setSpacing(2)
            t_lbl = QLabel(title)
            t_lbl.setStyleSheet("font-size: 9.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
            cl.addWidget(t_lbl)
            v_lbl = QLabel(val)
            v_lbl.setStyleSheet(f"font-size: 18px; font-weight: 900; color: {col};")
            cl.addWidget(v_lbl)
            s_lbl = QLabel(sub)
            s_lbl.setStyleSheet("font-size: 9.5px; font-weight: 600; color: #64748B;")
            cl.addWidget(s_lbl)
            kpi_row.addWidget(card)
        main_layout.addLayout(kpi_row)

        # ── 2. CONTROLS BAR ──
        ctrl_card = QFrame()
        ctrl_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 8px 12px;")
        cf_l = QHBoxLayout(ctrl_card)
        cf_l.setContentsMargins(4, 2, 4, 2)
        cf_l.setSpacing(10)

        loc_combo = QComboBox()
        loc_combo.addItems(["Bhimavaram (Central Command)", "Sector 1 (Harbor)", "Sector 2 (Industrial)", "Sector 3 (City Center)"])
        cf_l.addWidget(loc_combo)

        s_in = QLineEdit()
        s_in.setPlaceholderText("Search coordinates, cameras, or highways...")
        cf_l.addWidget(s_in, 1)

        cf_l.addStretch()
        rf_btn = QPushButton("🔄 Refresh Stream")
        rf_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 6px;")
        cf_l.addWidget(rf_btn)
        main_layout.addWidget(ctrl_card)

        # ── 3. MAP CANVAS ──
        map_card = QFrame()
        map_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
        mc_l = QVBoxLayout(map_card)
        mc_l.addWidget(FullMapCanvas())

        # Legend Bar
        leg_h = QHBoxLayout()
        leg_h.setSpacing(16)
        for name, col in [("● Active (1,042)", "#10B981"), ("● Alert / Hotlist (21)", "#EF4444"), ("● Inactive (242)", "#F59E0B"), ("● Hub Network", "#0C2540")]:
            l_lbl = QLabel(name)
            l_lbl.setStyleSheet(f"color: {col}; font-weight: 800; font-size: 11px;")
            leg_h.addWidget(l_lbl)
        leg_h.addStretch()
        mc_l.addLayout(leg_h)

        main_layout.addWidget(map_card, 1)


# ── 4. SETTINGS VIEW ──

class SettingsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(14)

        # Subtabs
        subtabs_box = QHBoxLayout()
        subtabs_box.setSpacing(8)
        tabs = ["General", "Cameras", "Alerts", "AI & Detection", "Storage", "Users & Access", "Integrations", "System"]
        for i, t in enumerate(tabs):
            b = QPushButton(t)
            if i == 0:
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 6px;")
            else:
                b.setStyleSheet("background-color: #FFFFFF; color: #64748B; border: 1px solid #E2E8F0; font-weight: 700; font-size: 11px; padding: 6px 12px; border-radius: 6px;")
            subtabs_box.addWidget(b)
        subtabs_box.addStretch()
        main_layout.addLayout(subtabs_box)

        # General Form Card
        form_card = QFrame()
        form_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 18px;")
        fc_l = QVBoxLayout(form_card)
        fc_l.setSpacing(14)

        f_title = QLabel("System Settings (General)")
        f_title.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        fc_l.addWidget(f_title)

        grid = QGridLayout()
        grid.setSpacing(12)

        grid.addWidget(QLabel("System Name:"), 0, 0)
        sname = QLineEdit("TRINETHRA Command Portal")
        grid.addWidget(sname, 0, 1)

        grid.addWidget(QLabel("Default Language:"), 0, 2)
        lang = QComboBox()
        lang.addItems(["English", "हिन्दी", "Telugu", "Tamil"])
        grid.addWidget(lang, 0, 3)

        grid.addWidget(QLabel("Organization:"), 1, 0)
        org = QLineEdit("Ministry of Road Transport & Highways")
        grid.addWidget(org, 1, 1)

        grid.addWidget(QLabel("Application Theme:"), 1, 2)
        th_box = QHBoxLayout()
        r_light = QRadioButton("Light")
        r_light.setChecked(True)
        r_dark = QRadioButton("Dark")
        r_sys = QRadioButton("System")
        th_box.addWidget(r_light)
        th_box.addWidget(r_dark)
        th_box.addWidget(r_sys)
        grid.addLayout(th_box, 1, 3)

        grid.addWidget(QLabel("Timezone:"), 2, 0)
        tz = QComboBox()
        tz.addItems(["(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi", "(UTC+00:00) UTC"])
        grid.addWidget(tz, 2, 1)

        grid.addWidget(QLabel("Time Format:"), 2, 2)
        tf_box = QHBoxLayout()
        r_12 = QRadioButton("12-hour (AM/PM)")
        r_12.setChecked(True)
        r_24 = QRadioButton("24-hour")
        tf_box.addWidget(r_12)
        tf_box.addWidget(r_24)
        grid.addLayout(tf_box, 2, 3)

        fc_l.addLayout(grid)

        save_btn = QPushButton("Save System Preferences")
        save_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 8px 16px; border-radius: 6px;")
        save_btn.clicked.connect(lambda: QMessageBox.information(self, "Saved", "System preferences saved successfully."))
        fc_l.addWidget(save_btn, 0, Qt.AlignLeft)

        main_layout.addWidget(form_card)

        # Profile & Security Card
        sec_card = QFrame()
        sec_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 18px;")
        sc_l = QVBoxLayout(sec_card)
        sc_l.setSpacing(12)

        sec_title = QLabel("Profile & Security Management")
        sec_title.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        sc_l.addWidget(sec_title)

        sec_h = QHBoxLayout()
        sec_h.addWidget(QLabel("Two-Factor Authentication (2FA):"))
        tfa_status = QLabel("● Enabled (Aadhaar OTP)")
        tfa_status.setStyleSheet("color: #059669; font-weight: 800; font-size: 11px;")
        sec_h.addWidget(tfa_status)
        sec_h.addStretch()

        chg_pass_btn = QPushButton("Change Password")
        chg_pass_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #CBD5E1; color: #0C2540; font-weight: 700; font-size: 11px; padding: 6px 12px; border-radius: 6px;")
        sec_h.addWidget(chg_pass_btn)
        sc_l.addLayout(sec_h)

        main_layout.addWidget(sec_card)
        main_layout.addStretch()


# ── 5. ANALYTICS & AUDIT LOG VIEWS ──

class AnalyticsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        l = QVBoxLayout(self)
        l.setContentsMargins(20, 16, 20, 16)
        l.setSpacing(14)

        card = QFrame()
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 24px;")
        cl = QVBoxLayout(card)
        cl.addWidget(QLabel("AI Predictive Traffic Intelligence & Neural Congestion Forecast"))
        cl.addWidget(QLabel("Corridor Flow Forecast: 94.2% Flow Efficiency across NH-216 Overpass."))
        l.addWidget(card)
        l.addStretch()


class AuditLogView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        l = QVBoxLayout(self)
        l.setContentsMargins(20, 16, 20, 16)
        l.setSpacing(14)

        card = QFrame()
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 20px;")
        cl = QVBoxLayout(card)
        cl.addWidget(QLabel("Cryptographic System Operator Audit Log"))
        cl.addWidget(QLabel("18 Aug 2026 08:10 AM — Admin User [IP: 10.14.22.8] authenticated successfully."))
        cl.addWidget(QLabel("18 Aug 2026 08:14 AM — CAM-1024 Optical Threshold calibrated to 98%."))
        l.addWidget(card)
        l.addStretch()
