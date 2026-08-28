from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QTableWidget, QTableWidgetItem, QHeaderView, QDialog, QLineEdit, QComboBox, QMessageBox
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from models.data_store import INITIAL_WATCHLIST, WatchedVehicle

class WatchlistView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.watchlist = list(INITIAL_WATCHLIST)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Header
        top_h = QHBoxLayout()
        t_box = QVBoxLayout()
        h_title = QLabel("National Vehicle Watch List & Hotlist")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Flagged stolen, cloned, and wanted vehicles. Instant ANPR alerts trigger on camera acquisition.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_box.addWidget(h_title)
        t_box.addWidget(h_sub)
        top_h.addLayout(t_box)
        top_h.addStretch()

        add_btn = QPushButton("+ Add Target to Watchlist")
        add_btn.setStyleSheet("background-color: #DC2626; color: #FFFFFF; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 8px;")
        add_btn.clicked.connect(self.show_add_modal)
        top_h.addWidget(add_btn)
        main_layout.addLayout(top_h)

        # Table
        self.table = QTableWidget(0, 6)
        self.table.setHorizontalHeaderLabels(["Target ID", "Plate Number", "Reason / Watch Type", "Make / Model", "Added By", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        main_layout.addWidget(self.table)

        self.render_table()

    def render_table(self):
        self.table.setRowCount(len(self.watchlist))
        for r, item in enumerate(self.watchlist):
            self.table.setItem(r, 0, QTableWidgetItem(item.id))
            
            p_item = QTableWidgetItem(f"🚨  {item.plateNumber}")
            p_item.setFont(QFont("Consolas", 10, QFont.Bold))
            p_item.setForeground(Qt.red)
            self.table.setItem(r, 1, p_item)

            self.table.setItem(r, 2, QTableWidgetItem(item.watchType))
            self.table.setItem(r, 3, QTableWidgetItem(f"{item.brandModel} ({item.color})"))
            self.table.setItem(r, 4, QTableWidgetItem(f"{item.addedBy} - {item.addedOn}"))
            
            st_item = QTableWidgetItem(item.status)
            st_item.setForeground(Qt.red)
            self.table.setItem(r, 5, st_item)

    def show_add_modal(self):
        diag = QDialog(self)
        diag.setWindowTitle("Add Vehicle to National Watch List")
        diag.setFixedWidth(420)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        d_l.addWidget(QLabel("Vehicle Plate Number (e.g. DL-01-AB-1234):"))
        plate_in = QLineEdit()
        d_l.addWidget(plate_in)

        d_l.addWidget(QLabel("Watch Type / Reason:"))
        type_in = QComboBox()
        type_in.addItems(["Stolen", "Cloned", "Wanted / Impound"])
        d_l.addWidget(type_in)

        d_l.addWidget(QLabel("Brand & Model:"))
        bm_in = QLineEdit()
        bm_in.setPlaceholderText("e.g. Toyota Innova")
        d_l.addWidget(bm_in)

        d_l.addWidget(QLabel("Color:"))
        col_in = QLineEdit()
        col_in.setPlaceholderText("e.g. Silver")
        d_l.addWidget(col_in)

        save_btn = QPushButton("Save & Broadcast Hotlist Alert")
        save_btn.setStyleSheet("background-color: #DC2626; color: #FFFFFF; font-weight: 800; padding: 10px;")
        
        def save():
            if not plate_in.text():
                QMessageBox.warning(diag, "Missing Info", "Plate number is required.")
                return
            new_w = WatchedVehicle(f"WV-0{len(self.watchlist)+1}", plate_in.text().strip(), type_in.currentText(), bm_in.text() or "Sedan", col_in.text() or "White", "Today", "Operator: Admin", "Highway Control", "Active")
            self.watchlist.insert(0, new_w)
            self.render_table()
            diag.accept()
            QMessageBox.information(self, "Watchlist Updated", f"Target {plate_in.text()} successfully broadcast to all camera AI nodes.")

        save_btn.clicked.connect(save)
        d_l.addWidget(save_btn)
        diag.exec()
