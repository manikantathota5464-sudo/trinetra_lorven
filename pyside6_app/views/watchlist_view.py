from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QTableWidget, QTableWidgetItem, QHeaderView, QComboBox, QLineEdit, 
    QDialog, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QCursor
from models.data_store import INITIAL_WATCHLIST, WatchedVehicle

class WatchlistView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.watchlist = list(INITIAL_WATCHLIST)
        self.active_tab = "All"
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. 4 KPI CARDS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        kpis = [
            ("STOLEN VEHICLES", "356", "34% of total", "#DC2626", "#FEF2F2", "#DC2626", "🛡️"),
            ("CLONED VEHICLES", "189", "21% of total", "#7C3AED", "#F5F3FF", "#7C3AED", "📋"),
            ("TOTAL WATCH LIST", "545", "55% flagged", "#D97706", "#FFFBEB", "#D97706", "📑"),
            ("RECENTLY ADDED", "24", "Last 24 hours", "#0C2540", "#EFF6FF", "#2563EB", "⏱️"),
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
        tab_defs = [("All", "All Vehicles (545)"), ("Stolen", "Stolen Vehicles (356)"), ("Cloned", "Cloned Vehicles (189)")]

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
        self.search_in.setPlaceholderText("Search license plate...")
        self.search_in.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_in.textChanged.connect(self.render_table)
        f_layout.addWidget(self.search_in, 2)

        self.brand_filter = QComboBox()
        self.brand_filter.addItems(["All Brands", "Hyundai", "Maruti", "Bajaj", "Honda"])
        self.brand_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.brand_filter, 1)

        self.color_filter = QComboBox()
        self.color_filter.addItems(["All Colors", "White", "Red", "Black", "Silver", "Blue"])
        self.color_filter.currentTextChanged.connect(self.render_table)
        f_layout.addWidget(self.color_filter, 1)

        export_btn = QPushButton("📑 Export CSV")
        export_btn.setStyleSheet("background-color: #FAF8F5; color: #0C2540; border: 1px solid #CBD5E1; font-weight: 800; font-size: 11px; padding: 6px 12px; border-radius: 8px;")
        export_btn.clicked.connect(lambda: QMessageBox.information(self, "Export", "Watchlist exported successfully."))
        f_layout.addWidget(export_btn)

        add_btn = QPushButton("+ Add Vehicle")
        add_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 11.5px; padding: 6px 14px; border-radius: 8px;")
        add_btn.clicked.connect(self.show_add_modal)
        f_layout.addWidget(add_btn)

        main_layout.addWidget(filter_card)

        # ── 4. DATA TABLE ──
        table_container = QFrame()
        table_container.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        tc_l = QVBoxLayout(table_container)
        tc_l.setContentsMargins(0, 0, 0, 0)
        tc_l.setSpacing(0)

        self.table = QTableWidget(0, 8)
        self.table.setHorizontalHeaderLabels(["Vehicle / Plate", "Watch Type", "Brand / Model", "Color", "Added On", "Added By", "Location Added", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setStyleSheet("border: none; background-color: #FFFFFF;")
        tc_l.addWidget(self.table)

        # Pagination
        pb = QFrame()
        pb.setStyleSheet("background-color: #FAF8F5; border-top: 1px solid #F1EBE1; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 8px 14px;")
        pbl = QHBoxLayout(pb)
        self.page_info = QLabel("Showing 1 to 5 of 545 entries")
        self.page_info.setStyleSheet("font-size: 11px; font-weight: 600; color: #64748B;")
        pbl.addWidget(self.page_info)
        pbl.addStretch()
        pbl.addWidget(QLabel("Page 1 of 6"))
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
        bf = self.brand_filter.currentText()
        cf = self.color_filter.currentText()

        filtered = []
        for w in self.watchlist:
            if self.active_tab == "Stolen" and w.watchType != "Stolen":
                continue
            if self.active_tab == "Cloned" and w.watchType != "Cloned":
                continue

            if q and (q not in w.plateNumber.lower() and q not in w.brandModel.lower()):
                continue
            if bf != "All Brands" and bf not in w.brandModel:
                continue
            if cf != "All Colors" and cf not in w.color:
                continue
            filtered.append(w)

        self.table.setRowCount(len(filtered))
        self.page_info.setText(f"Showing 1 to {len(filtered)} of {len(self.watchlist) + 540} entries")

        for r, w in enumerate(filtered):
            # 0. Plate
            pw = QWidget()
            pl = QHBoxLayout(pw)
            pl.setContentsMargins(6, 4, 6, 4)
            pt = QLabel(w.plateNumber)
            pt.setStyleSheet("background-color: #E2E8F0; color: #0F172A; font-family: Consolas; font-weight: 900; font-size: 11px; padding: 2px 6px; border-radius: 4px;")
            pl.addWidget(pt)
            self.table.setCellWidget(r, 0, pw)

            # 1. Watch Type
            tw = QWidget()
            tl = QHBoxLayout(tw)
            tl.setContentsMargins(6, 4, 6, 4)
            tb = QLabel(w.watchType)
            if w.watchType == "Stolen":
                tb.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;")
            else:
                tb.setStyleSheet("background-color: #F5F3FF; color: #7C3AED; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;")
            tl.addWidget(tb)
            tl.addStretch()
            self.table.setCellWidget(r, 1, tw)

            # 2. Brand / Model
            bm_item = QTableWidgetItem(w.brandModel)
            bm_item.setFont(QFont("Segoe UI", 9, QFont.Bold))
            self.table.setItem(r, 2, bm_item)

            # 3. Color
            cw = QWidget()
            cl = QHBoxLayout(cw)
            cl.setContentsMargins(6, 4, 6, 4)
            cl.setSpacing(6)
            dot = QLabel("●")
            col_map = {"White": "#E2E8F0", "Red": "#EF4444", "Black": "#0F172A", "Silver": "#94A3B8", "Blue": "#3B82F6"}
            dot.setStyleSheet(f"color: {col_map.get(w.color, '#64748B')}; font-size: 14px;")
            c_txt = QLabel(w.color)
            c_txt.setStyleSheet("font-size: 11px; font-weight: 600;")
            cl.addWidget(dot)
            cl.addWidget(c_txt)
            cl.addStretch()
            self.table.setCellWidget(r, 3, cw)

            # 4. Added On
            t_item = QTableWidgetItem(w.addedOn)
            t_item.setForeground(Qt.darkGray)
            self.table.setItem(r, 4, t_item)

            # 5. Added By
            by_item = QTableWidgetItem(w.addedBy)
            self.table.setItem(r, 5, by_item)

            # 6. Location Added
            loc_item = QTableWidgetItem(w.locationAdded)
            self.table.setItem(r, 6, loc_item)

            # 7. Status
            sw = QWidget()
            sl = QHBoxLayout(sw)
            sl.setContentsMargins(6, 4, 6, 4)
            sb = QLabel(w.status)
            if w.status == "Active":
                sb.setStyleSheet("background-color: #ECFDF5; color: #059669; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            else:
                sb.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;")
            sl.addWidget(sb)
            sl.addStretch()
            self.table.setCellWidget(r, 7, sw)

    def show_add_modal(self):
        diag = QDialog(self)
        diag.setWindowTitle("Add Vehicle to Watch List")
        diag.setFixedWidth(400)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        header_lbl = QLabel("Flag Vehicle on Watch List")
        header_lbl.setStyleSheet("font-size: 14px; font-weight: 900; color: #0C2540;")
        d_l.addWidget(header_lbl)

        d_l.addWidget(QLabel("Registration / License Plate Number:"))
        plate_in = QLineEdit()
        plate_in.setPlaceholderText("e.g. AP09 AB 1234")
        d_l.addWidget(plate_in)

        d_l.addWidget(QLabel("Watchlist Flag Reason / Type:"))
        type_in = QComboBox()
        type_in.addItems(["Stolen", "Cloned"])
        d_l.addWidget(type_in)

        d_l.addWidget(QLabel("Vehicle Make & Model:"))
        brand_in = QLineEdit()
        brand_in.setPlaceholderText("e.g. Hyundai i20 Sportz")
        d_l.addWidget(brand_in)

        d_l.addWidget(QLabel("Color:"))
        col_in = QComboBox()
        col_in.addItems(["White", "Red", "Black", "Silver", "Blue"])
        d_l.addWidget(col_in)

        d_l.addWidget(QLabel("Location / Jurisdiction:"))
        loc_in = QLineEdit()
        loc_in.setPlaceholderText("e.g. Outer Ring Road, Bhimavaram")
        d_l.addWidget(loc_in)

        btn_box = QHBoxLayout()
        btn_box.addStretch()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.setStyleSheet("background-color: #F1F5F9; color: #475569;")
        cancel_btn.clicked.connect(diag.reject)
        btn_box.addWidget(cancel_btn)

        save_btn = QPushButton("Flag Vehicle")
        save_btn.setStyleSheet("background-color: #DC2626; color: #FFFFFF; font-weight: 800;")
        
        def save():
            if not plate_in.text() or not brand_in.text():
                QMessageBox.warning(diag, "Missing Info", "Please enter Plate Number and Vehicle Model.")
                return
            new_w = WatchedVehicle(
                f"W-{len(self.watchlist)+1:03d}",
                plate_in.text().strip().upper(),
                type_in.currentText(),
                brand_in.text().strip(),
                col_in.currentText(),
                "Just now",
                "Admin User (Operator)",
                loc_in.text().strip() or "Bhimavaram Central",
                "Active"
            )
            self.watchlist.insert(0, new_w)
            self.render_table()
            diag.accept()
            QMessageBox.information(self, "Added", f"Vehicle {new_w.plateNumber} added to Watch List.")

        save_btn.clicked.connect(save)
        btn_box.addWidget(save_btn)
        d_l.addLayout(btn_box)

        diag.exec()
