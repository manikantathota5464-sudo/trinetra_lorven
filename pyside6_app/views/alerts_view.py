from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QTableWidget, QTableWidgetItem, QHeaderView, QComboBox, QLineEdit, 
    QDialog, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QCursor
from models.data_store import INITIAL_ALERTS, Alert

class AlertDetailsModal(QDialog):
    resolved = Signal(str)

    def __init__(self, alert: Alert, parent=None):
        super().__init__(parent)
        self.alert = alert
        self.setWindowTitle(f"Alert Incident Details - {alert.id}")
        self.setFixedWidth(460)
        self.init_ui()

    def init_ui(self):
        l = QVBoxLayout(self)
        l.setSpacing(14)
        l.setContentsMargins(20, 20, 20, 20)

        # Header
        top_h = QHBoxLayout()
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        h_t = QLabel(f"Incident: {self.alert.id}")
        h_t.setStyleSheet("font-size: 15px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel(f"Camera: {self.alert.camera} • {self.alert.location}")
        h_sub.setStyleSheet("font-size: 11px; color: #64748B; font-weight: 600;")
        title_box.addWidget(h_t)
        title_box.addWidget(h_sub)
        top_h.addLayout(title_box)
        top_h.addStretch()

        type_badge = QLabel(self.alert.type)
        type_badge.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 6px;")
        top_h.addWidget(type_badge)
        l.addLayout(top_h)

        # Info Box
        box = QFrame()
        box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 12px;")
        b_l = QVBoxLayout(box)
        b_l.setSpacing(6)

        def add_row(lbl, val, is_plate=False):
            r = QHBoxLayout()
            l_lbl = QLabel(lbl)
            l_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #64748B;")
            r.addWidget(l_lbl)
            r.addStretch()
            v_lbl = QLabel(val)
            if is_plate:
                v_lbl.setStyleSheet("font-family: Consolas; font-size: 12px; font-weight: 900; color: #0F172A; background-color: #E2E8F0; padding: 2px 6px; border-radius: 4px;")
            else:
                v_lbl.setStyleSheet("font-size: 11.5px; font-weight: 800; color: #1E293B;")
            r.addWidget(v_lbl)
            b_l.addLayout(r)

        add_row("License Plate:", self.alert.plateNumber, True)
        add_row("Vehicle Make & Model:", f"{self.alert.brand} {self.alert.model}")
        add_row("Color & Vehicle Type:", f"{self.alert.color} • {self.alert.vtype}")
        add_row("Detection Time:", self.alert.timeDate)
        add_row("Current Status:", self.alert.status)
        l.addWidget(box)

        # Action Buttons
        btn_h = QHBoxLayout()
        btn_h.addStretch()

        close_btn = QPushButton("Close")
        close_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; padding: 8px 16px; border-radius: 8px;")
        close_btn.clicked.connect(self.reject)
        btn_h.addWidget(close_btn)

        if self.alert.status != "Resolved":
            res_btn = QPushButton("✓ Resolve Incident")
            res_btn.setStyleSheet("background-color: #059669; color: #FFFFFF; font-weight: 800; padding: 8px 16px; border-radius: 8px;")
            def do_res():
                self.resolved.emit(self.alert.id)
                self.accept()
            res_btn.clicked.connect(do_res)
            btn_h.addWidget(res_btn)

        l.addLayout(btn_h)


class AlertsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.alerts = list(INITIAL_ALERTS)
        self.active_tab = "All"
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. 5 KPI METRICS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        kpis = [
            ("TOTAL ALERTS", "1,248", "Across all locations", "#0C2540", "#EFF6FF", "#2563EB", "⚠️"),
            ("ACTIVE ALERTS", "86", "Requires immediate action", "#DC2626", "#FEF2F2", "#DC2626", "🚨"),
            ("FINED VEHICLES", "310", "Generated e-challans", "#D97706", "#FFFBEB", "#D97706", "📑"),
            ("STOLEN VEHICLES", "45", "High-priority recovery", "#EF4444", "#FEF2F2", "#EF4444", "🛡️"),
            ("CLONED VEHICLES", "27", "Duplicate plate flags", "#7C3AED", "#F5F3FF", "#7C3AED", "📋"),
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

        # ── 2. TABS BAR ──
        tabs_box = QHBoxLayout()
        tabs_box.setSpacing(8)

        self.tab_btns = {}
        tab_defs = [("All", "All Alerts (1,248)"), ("Fined", "Fined Vehicles (310)"), ("Stolen", "Stolen Vehicles (45)"), ("Cloned", "Cloned Vehicles (27)")]

        for key, title in tab_defs:
            b = QPushButton(title)
            b.setCursor(QCursor(Qt.PointingHandCursor))
            if key == "All":
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
            else:
                b.setStyleSheet("background-color: #FFFFFF; color: #475569; border: 1px solid #E2E8F0; font-weight: 700; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
            
            def make_handler(k):
                return lambda: self.set_tab(k)

            b.clicked.connect(make_handler(key))
            self.tab_btns[key] = b
            tabs_box.addWidget(b)

        tabs_box.addStretch()
        main_layout.addLayout(tabs_box)

        # ── 3. FILTER TOOLBAR ──
        filter_card = QFrame()
        filter_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        f_layout = QHBoxLayout(filter_card)
        f_layout.setContentsMargins(8, 4, 8, 4)
        f_layout.setSpacing(10)

        self.search_in = QLineEdit()
        self.search_in.setPlaceholderText("Search plate, brand, or model...")
        self.search_in.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_in.textChanged.connect(self.render_table)
        f_layout.addWidget(self.search_in, 2)

        self.type_filter = QComboBox()
        self.type_filter.addItems(["All Alert Types", "Fine Issued", "Stolen Vehicle", "Cloned Vehicle", "Speed Violation", "No Helmet"])
        self.type_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.type_filter, 1)

        self.status_filter = QComboBox()
        self.status_filter.addItems(["All Status", "Active", "Under Review", "Pending", "Unpaid", "Resolved"])
        self.status_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.status_filter, 1)

        export_btn = QPushButton("📑 Export CSV")
        export_btn.setStyleSheet("background-color: #FAF8F5; color: #0C2540; border: 1px solid #CBD5E1; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 8px;")
        export_btn.clicked.connect(lambda: QMessageBox.information(self, "Export", "Alert incidents exported successfully."))
        f_layout.addWidget(export_btn)

        main_layout.addWidget(filter_card)

        # ── 4. DATA TABLE ──
        table_container = QFrame()
        table_container.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        tc_l = QVBoxLayout(table_container)
        tc_l.setContentsMargins(0, 0, 0, 0)
        tc_l.setSpacing(0)

        self.table = QTableWidget(0, 8)
        self.table.setHorizontalHeaderLabels(["Alert ID", "Type", "Plate No", "Vehicle Details", "Location / Camera", "Time & Date", "Status", "Actions"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(7, QHeaderView.ResizeToContents)
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setStyleSheet("border: none; background-color: #FFFFFF;")
        tc_l.addWidget(self.table)

        # Pagination
        pb = QFrame()
        pb.setStyleSheet("background-color: #FAF8F5; border-top: 1px solid #F1EBE1; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 8px 14px;")
        pbl = QHBoxLayout(pb)
        self.page_info = QLabel("Showing 1 to 6 of 1,248 alerts")
        self.page_info.setStyleSheet("font-size: 11px; font-weight: 600; color: #64748B;")
        pbl.addWidget(self.page_info)
        pbl.addStretch()
        pbl.addWidget(QLabel("Page 1 of 12"))
        tc_l.addWidget(pb)

        main_layout.addWidget(table_container, 1)

        self.render_table()

    def set_tab(self, key: str):
        self.active_tab = key
        for k, b in self.tab_btns.items():
            if k == key:
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
            else:
                b.setStyleSheet("background-color: #FFFFFF; color: #475569; border: 1px solid #E2E8F0; font-weight: 700; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
        self.render_table()

    def render_table(self):
        q = self.search_in.text().strip().lower()
        tf = self.type_filter.currentText()
        sf = self.status_filter.currentText()

        filtered = []
        for alt in self.alerts:
            # Tab filter
            if self.active_tab == "Fined" and alt.type != "Fine Issued":
                continue
            if self.active_tab == "Stolen" and alt.type != "Stolen Vehicle":
                continue
            if self.active_tab == "Cloned" and alt.type != "Cloned Vehicle":
                continue

            if q and (q not in alt.plateNumber.lower() and q not in alt.brand.lower() and q not in alt.model.lower()):
                continue
            if tf != "All Alert Types" and alt.type != tf:
                continue
            if sf != "All Status" and alt.status != sf:
                continue
            filtered.append(alt)

        self.table.setRowCount(len(filtered))
        self.page_info.setText(f"Showing 1 to {len(filtered)} of {len(self.alerts) + 1242} alerts")

        for r, alt in enumerate(filtered):
            # 0. ID
            id_item = QTableWidgetItem(alt.id.split("-")[-1] if "-" in alt.id else alt.id)
            id_item.setFont(QFont("Segoe UI", 9, QFont.Bold))
            id_item.setForeground(Qt.darkGray)
            self.table.setItem(r, 0, id_item)

            # 1. Type
            tw = QWidget()
            tl = QHBoxLayout(tw)
            tl.setContentsMargins(4, 2, 4, 2)
            tb = QLabel(alt.type)
            if "Stolen" in alt.type:
                tb.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            elif "Cloned" in alt.type:
                tb.setStyleSheet("background-color: #F5F3FF; color: #7C3AED; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            elif "Speed" in alt.type:
                tb.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            else:
                tb.setStyleSheet("background-color: #EFF6FF; color: #2563EB; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            tl.addWidget(tb)
            tl.addStretch()
            self.table.setCellWidget(r, 1, tw)

            # 2. Plate
            pw = QWidget()
            pl = QHBoxLayout(pw)
            pl.setContentsMargins(4, 2, 4, 2)
            pt = QLabel(alt.plateNumber)
            pt.setStyleSheet("background-color: #E2E8F0; color: #0F172A; font-family: Consolas; font-weight: 900; font-size: 11px; padding: 2px 6px; border-radius: 4px;")
            pl.addWidget(pt)
            self.table.setCellWidget(r, 2, pw)

            # 3. Vehicle Details
            vd_item = QTableWidgetItem(f"{alt.brand} {alt.model} ({alt.color})")
            vd_item.setFont(QFont("Segoe UI", 9, QFont.Bold))
            self.table.setItem(r, 3, vd_item)

            # 4. Location / Camera
            loc_item = QTableWidgetItem(f"{alt.location} • {alt.camera}")
            loc_item.setFont(QFont("Segoe UI", 9))
            self.table.setItem(r, 4, loc_item)

            # 5. Time
            t_item = QTableWidgetItem(alt.timeDate)
            t_item.setForeground(Qt.darkGray)
            self.table.setItem(r, 5, t_item)

            # 6. Status
            sw = QWidget()
            sl = QHBoxLayout(sw)
            sl.setContentsMargins(4, 2, 4, 2)
            sb = QLabel(alt.status)
            if alt.status == "Resolved":
                sb.setStyleSheet("background-color: #ECFDF5; color: #059669; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            elif alt.status == "Active":
                sb.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            else:
                sb.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            sl.addWidget(sb)
            sl.addStretch()
            self.table.setCellWidget(r, 6, sw)

            # 7. Actions
            aw = QWidget()
            al = QHBoxLayout(aw)
            al.setContentsMargins(4, 2, 4, 2)
            
            view_btn = QPushButton("👁️ Details")
            view_btn.setCursor(QCursor(Qt.PointingHandCursor))
            view_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 10.5px; font-weight: 700; padding: 3px 8px;")
            
            def open_details(alert_item=alt):
                diag = AlertDetailsModal(alert_item, self)
                diag.resolved.connect(self.resolve_alert)
                diag.exec()

            view_btn.clicked.connect(open_details)
            al.addWidget(view_btn)
            self.table.setCellWidget(r, 7, aw)

    def resolve_alert(self, aid):
        for a in self.alerts:
            if a.id == aid:
                a.status = "Resolved"
                break
        QMessageBox.information(self, "Resolved", f"Alert {aid} marked as resolved.")
        self.render_table()

