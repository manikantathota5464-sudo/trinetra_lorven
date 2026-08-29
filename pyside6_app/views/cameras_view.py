from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QTableWidget, QTableWidgetItem, QHeaderView, QComboBox, QLineEdit, 
    QDialog, QMessageBox, QCheckBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QCursor
from models.data_store import INITIAL_CAMERAS, Camera

class CamerasView(QWidget):
    open_feed_requested = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.cameras = list(INITIAL_CAMERAS)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. 5 KPI CARDS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        cards_data = [
            ("TOTAL CAMERAS", "1,284", "Across 128 locations", "#0C2540", "#EFF6FF", "#2563EB", "📹"),
            ("ONLINE CAMERAS", "1,042", "81.2% online", "#059669", "#ECFDF5", "#059669", "✓"),
            ("OFFLINE CAMERAS", "242", "18.8% offline", "#DC2626", "#FEF2F2", "#DC2626", "✕"),
            ("MAINTENANCE", "18", "1.4% of total", "#D97706", "#FFFBEB", "#D97706", "🔧"),
            ("PTZ CAMERAS", "310", "24.1% of total", "#7C3AED", "#F5F3FF", "#7C3AED", "📷"),
        ]

        for title, val, sub, col, bg_ic, ic_col, icon in cards_data:
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

        # ── 2. SEARCH AND FILTERS SEGMENT ──
        filter_card = QFrame()
        filter_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        f_layout = QHBoxLayout(filter_card)
        f_layout.setContentsMargins(8, 4, 8, 4)
        f_layout.setSpacing(10)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search by camera name, location, or ID...")
        self.search_input.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_input.textChanged.connect(self.render_table)
        f_layout.addWidget(self.search_input, 2)

        self.status_filter = QComboBox()
        self.status_filter.addItems(["All Status", "Online", "Offline", "Maintenance"])
        self.status_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.status_filter, 1)

        self.location_filter = QComboBox()
        self.location_filter.addItems(["All Locations", "Main St", "I-9 Overpass", "Harbor Rd", "City Center", "Riverside"])
        self.location_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.location_filter, 1)

        self.type_filter = QComboBox()
        self.type_filter.addItems(["All Types", "PTZ", "Fixed", "Dome"])
        self.type_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.type_filter, 1)

        reset_btn = QPushButton("🔄")
        reset_btn.setFixedSize(32, 32)
        reset_btn.setCursor(QCursor(Qt.PointingHandCursor))
        reset_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px;")
        reset_btn.clicked.connect(self.reset_filters)
        f_layout.addWidget(reset_btn)

        add_btn = QPushButton("+ Add Camera")
        add_btn.setCursor(QCursor(Qt.PointingHandCursor))
        add_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 7px 14px; border-radius: 8px;")
        add_btn.clicked.connect(self.show_add_dialog)
        f_layout.addWidget(add_btn)

        main_layout.addWidget(filter_card)

        # ── 3. DATA TABLE ──
        table_container = QFrame()
        table_container.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        tc_layout = QVBoxLayout(table_container)
        tc_layout.setContentsMargins(0, 0, 0, 0)
        tc_layout.setSpacing(0)

        self.table = QTableWidget(0, 7)
        self.table.setHorizontalHeaderLabels(["Camera", "Location", "Status", "Type", "Last Seen", "Uptime", "Actions"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(6, QHeaderView.ResizeToContents)
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setStyleSheet("border: none; background-color: #FFFFFF;")
        tc_layout.addWidget(self.table)

        # Pagination Bar
        page_bar = QFrame()
        page_bar.setStyleSheet("background-color: #FAF8F5; border-top: 1px solid #F1EBE1; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 10px 16px;")
        pb_l = QHBoxLayout(page_bar)
        pb_l.setContentsMargins(12, 6, 12, 6)

        self.page_info_lbl = QLabel("Showing 1 to 8 of 1,284 cameras")
        self.page_info_lbl.setStyleSheet("font-size: 11px; font-weight: 600; color: #64748B;")
        pb_l.addWidget(self.page_info_lbl)
        pb_l.addStretch()

        p_prev = QPushButton("<")
        p_prev.setFixedSize(26, 24)
        p_prev.setStyleSheet("background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; font-weight: 700;")
        pb_l.addWidget(p_prev)

        p1 = QPushButton("1")
        p1.setFixedSize(26, 24)
        p1.setStyleSheet("background-color: #0C2540; color: #FFFFFF; border-radius: 4px; font-weight: 900;")
        pb_l.addWidget(p1)

        p2 = QPushButton("2")
        p2.setFixedSize(26, 24)
        p2.setStyleSheet("background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; font-weight: 600;")
        pb_l.addWidget(p2)

        p_next = QPushButton(">")
        p_next.setFixedSize(26, 24)
        p_next.setStyleSheet("background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; font-weight: 700;")
        pb_l.addWidget(p_next)

        tc_layout.addWidget(page_bar)
        main_layout.addWidget(table_container, 1)

        self.render_table()

    def reset_filters(self):
        self.search_input.clear()
        self.status_filter.setCurrentIndex(0)
        self.location_filter.setCurrentIndex(0)
        self.type_filter.setCurrentIndex(0)
        self.render_table()

    def render_table(self):
        query = self.search_input.text().strip().lower()
        st_filter = self.status_filter.currentText()
        loc_filter = self.location_filter.currentText()
        type_filter = self.type_filter.currentText()

        filtered = []
        for cam in self.cameras:
            if query and (query not in cam.id.lower() and query not in cam.location.lower()):
                continue
            if st_filter != "All Status" and cam.status != st_filter:
                continue
            if loc_filter != "All Locations" and loc_filter not in cam.location:
                continue
            if type_filter != "All Types" and cam.type != type_filter:
                continue
            filtered.append(cam)

        self.table.setRowCount(len(filtered))
        self.page_info_lbl.setText(f"Showing 1 to {len(filtered)} of {len(self.cameras) + 1276} cameras")

        for r, cam in enumerate(filtered):
            # 0. Camera ID
            cid_w = QWidget()
            cid_l = QVBoxLayout(cid_w)
            cid_l.setContentsMargins(8, 4, 8, 4)
            cid_l.setSpacing(1)
            c_name = QLabel(f"📹 {cam.id}")
            c_name.setStyleSheet("font-size: 12px; font-weight: 900; color: #0C2540;")
            c_sub = QLabel(cam.location.split("&")[0].strip())
            c_sub.setStyleSheet("font-size: 9.5px; color: #64748B; font-weight: 600;")
            cid_l.addWidget(c_name)
            cid_l.addWidget(c_sub)
            self.table.setCellWidget(r, 0, cid_w)

            # 1. Location
            loc_item = QTableWidgetItem(cam.location)
            loc_item.setFont(QFont("Segoe UI", 9, QFont.DemiBold))
            self.table.setItem(r, 1, loc_item)

            # 2. Status Badge
            st_w = QWidget()
            st_l = QHBoxLayout(st_w)
            st_l.setContentsMargins(6, 4, 6, 4)
            st_badge = QLabel(f"● {cam.status}")
            if cam.status == "Online":
                st_badge.setStyleSheet("background-color: #ECFDF5; color: #059669; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;")
            elif cam.status == "Offline":
                st_badge.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;")
            else:
                st_badge.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;")
            st_l.addWidget(st_badge)
            st_l.addStretch()
            self.table.setCellWidget(r, 2, st_w)

            # 3. Type
            type_item = QTableWidgetItem(cam.type)
            type_item.setFont(QFont("Segoe UI", 9, QFont.Bold))
            self.table.setItem(r, 3, type_item)

            # 4. Last Seen
            ls_item = QTableWidgetItem(cam.lastSeen)
            ls_item.setForeground(Qt.darkGray)
            self.table.setItem(r, 4, ls_item)

            # 5. Uptime
            up_item = QTableWidgetItem(f"{cam.uptime}%")
            up_item.setFont(QFont("Segoe UI", 9, QFont.Black))
            if cam.uptime >= 99.0:
                up_item.setForeground(Qt.darkGreen)
            elif cam.uptime > 0:
                up_item.setForeground(Qt.darkYellow)
            else:
                up_item.setForeground(Qt.red)
            self.table.setItem(r, 5, up_item)

            # 6. Actions
            act_w = QWidget()
            act_l = QHBoxLayout(act_w)
            act_l.setContentsMargins(4, 2, 4, 2)
            act_l.setSpacing(6)

            eye_btn = QPushButton("👁️")
            eye_btn.setFixedSize(28, 26)
            eye_btn.setCursor(QCursor(Qt.PointingHandCursor))
            eye_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 11px;")
            eye_btn.clicked.connect(lambda ch, cid=cam.id: self.open_feed_requested.emit(cid))
            act_l.addWidget(eye_btn)

            edit_btn = QPushButton("✏️")
            edit_btn.setFixedSize(28, 26)
            edit_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 11px;")
            act_l.addWidget(edit_btn)

            self.table.setCellWidget(r, 6, act_w)

    def show_add_dialog(self):
        diag = QDialog(self)
        diag.setWindowTitle("Register New Camera Node")
        diag.setFixedWidth(400)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        header_lbl = QLabel("Register Camera Node")
        header_lbl.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        d_l.addWidget(header_lbl)

        d_l.addWidget(QLabel("Camera ID (e.g. CAM-1282):"))
        cid_in = QLineEdit()
        d_l.addWidget(cid_in)

        d_l.addWidget(QLabel("Location Description:"))
        loc_in = QLineEdit()
        loc_in.setPlaceholderText("e.g. Junction 9 - Outer Ring Rd")
        d_l.addWidget(loc_in)

        d_l.addWidget(QLabel("Camera Type:"))
        type_in = QComboBox()
        type_in.addItems(["PTZ", "Fixed", "Dome"])
        d_l.addWidget(type_in)

        d_l.addWidget(QLabel("Status:"))
        st_in = QComboBox()
        st_in.addItems(["Online", "Offline", "Maintenance"])
        d_l.addWidget(st_in)

        btn_box = QHBoxLayout()
        btn_box.addStretch()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.setStyleSheet("background-color: #F1F5F9; color: #475569;")
        cancel_btn.clicked.connect(diag.reject)
        btn_box.addWidget(cancel_btn)

        save_btn = QPushButton("Register Node")
        save_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800;")
        
        def save():
            if not cid_in.text() or not loc_in.text():
                QMessageBox.warning(diag, "Missing Data", "Please enter Camera ID and Location.")
                return
            new_c = Camera(cid_in.text().strip(), cid_in.text().strip(), loc_in.text().strip(), st_in.currentText(), type_in.currentText(), "Just now", 99.8 if st_in.currentText() == "Online" else 0.0)
            self.cameras.insert(0, new_c)
            self.render_table()
            diag.accept()
            QMessageBox.information(self, "Node Registered", f"Camera node {new_c.id} registered successfully.")

        save_btn.clicked.connect(save)
        btn_box.addWidget(save_btn)
        d_l.addLayout(btn_box)

        diag.exec()

