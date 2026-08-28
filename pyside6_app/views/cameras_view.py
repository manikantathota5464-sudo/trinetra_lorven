from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QGridLayout, QComboBox, QLineEdit, QDialog, QMessageBox, QScrollArea
)
from PySide6.QtCore import Qt, Signal
from models.data_store import INITIAL_CAMERAS, Camera

class CamerasView(QWidget):
    open_feed_requested = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.cameras = list(INITIAL_CAMERAS)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(18)

        # Header
        top_h = QHBoxLayout()
        t_box = QVBoxLayout()
        h_title = QLabel("Surveillance Camera Node Registry")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Manage, calibrate, and inspect ANPR camera nodes deployed across highways & intersections.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_box.addWidget(h_title)
        t_box.addWidget(h_sub)
        top_h.addLayout(t_box)
        top_h.addStretch()

        add_btn = QPushButton("+ Register New Camera")
        add_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 8px;")
        add_btn.clicked.connect(self.show_add_dialog)
        top_h.addWidget(add_btn)
        main_layout.addLayout(top_h)

        # Filters Bar
        filter_card = QFrame()
        filter_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        f_layout = QHBoxLayout(filter_card)
        f_layout.setContentsMargins(10, 6, 10, 6)
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search camera ID, name, or street location...")
        self.search_input.textChanged.connect(self.render_grid)
        f_layout.addWidget(self.search_input, 1)

        self.status_filter = QComboBox()
        self.status_filter.addItems(["All Statuses", "Online", "Offline", "Maintenance"])
        self.status_filter.currentTextChanged.connect(self.render_grid)
        f_layout.addWidget(self.status_filter)

        main_layout.addWidget(filter_card)

        # Scroll Area for Camera Cards
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.grid_container = QWidget()
        self.grid_layout = QGridLayout(self.grid_container)
        self.grid_layout.setSpacing(16)
        scroll.setWidget(self.grid_container)
        main_layout.addWidget(scroll, 1)

        self.render_grid()

    def render_grid(self):
        # Clear existing items
        while self.grid_layout.count():
            item = self.grid_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        query = self.search_input.text().strip().lower()
        st_filter = self.status_filter.currentText()

        filtered = []
        for cam in self.cameras:
            if query and (query not in cam.id.lower() and query not in cam.location.lower()):
                continue
            if st_filter != "All Statuses" and cam.status != st_filter:
                continue
            filtered.append(cam)

        cols = 3
        for i, cam in enumerate(filtered):
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 16px;")
            c_l = QVBoxLayout(card)
            c_l.setSpacing(8)

            top_row = QHBoxLayout()
            c_id = QLabel(f"📹 {cam.id}")
            c_id.setStyleSheet("font-size: 13.5px; font-weight: 900; color: #0C2540;")
            top_row.addWidget(c_id)
            top_row.addStretch()

            st_badge = QLabel(cam.status)
            if cam.status == "Online":
                st_badge.setStyleSheet("background-color: #ECFDF5; color: #059669; font-weight: 800; font-size: 10.5px; padding: 2px 8px; border-radius: 6px;")
            elif cam.status == "Offline":
                st_badge.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-weight: 800; font-size: 10.5px; padding: 2px 8px; border-radius: 6px;")
            else:
                st_badge.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-weight: 800; font-size: 10.5px; padding: 2px 8px; border-radius: 6px;")
            top_row.addWidget(st_badge)
            c_l.addLayout(top_row)

            loc_lbl = QLabel(f"📍 {cam.location}")
            loc_lbl.setStyleSheet("font-size: 12px; font-weight: 700; color: #334155;")
            c_l.addWidget(loc_lbl)

            info_box = QFrame()
            info_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #F1EBE1; border-radius: 8px; padding: 8px;")
            ib_l = QVBoxLayout(info_box)
            ib_l.setSpacing(3)
            ib_l.addWidget(QLabel(f"Type: {cam.type} | Uptime: {cam.uptime}%"))
            ib_l.addWidget(QLabel(f"Last Seen: {cam.lastSeen}"))
            c_l.addWidget(info_box)

            view_btn = QPushButton("View Real-Time Feed ➔")
            view_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 700; font-size: 11.5px; padding: 6px 12px; border-radius: 6px;")
            view_btn.clicked.connect(lambda ch, cid=cam.id: self.open_feed_requested.emit(cid))
            c_l.addWidget(view_btn)

            row = i // cols
            col = i % cols
            self.grid_layout.addWidget(card, row, col)

    def show_add_dialog(self):
        diag = QDialog(self)
        diag.setWindowTitle("Register New Camera Node")
        diag.setFixedWidth(400)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        d_l.addWidget(QLabel("Camera ID (e.g. CAM-1200):"))
        cid_in = QLineEdit()
        d_l.addWidget(cid_in)

        d_l.addWidget(QLabel("Location / Landmark:"))
        loc_in = QLineEdit()
        d_l.addWidget(loc_in)

        d_l.addWidget(QLabel("Camera Type:"))
        type_in = QComboBox()
        type_in.addItems(["PTZ", "Fixed", "Dome"])
        d_l.addWidget(type_in)

        save_btn = QPushButton("Save & Register Node")
        save_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; padding: 8px;")
        
        def save():
            if not cid_in.text() or not loc_in.text():
                QMessageBox.warning(diag, "Missing Data", "Please enter ID and Location.")
                return
            new_c = Camera(cid_in.text().strip(), cid_in.text().strip(), loc_in.text().strip(), "Online", type_in.currentText(), "Just now", 100.0)
            self.cameras.insert(0, new_c)
            self.render_grid()
            diag.accept()

        save_btn.clicked.connect(save)
        d_l.addWidget(save_btn)
        diag.exec()
