from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QTableWidget, QTableWidgetItem, QHeaderView, QComboBox, QMessageBox
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from models.data_store import INITIAL_ALERTS, Alert

class AlertsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.alerts = list(INITIAL_ALERTS)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Header
        top_h = QHBoxLayout()
        t_box = QVBoxLayout()
        h_title = QLabel("Active Alerts & Statutory Incidents")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Real-time automated traffic violation notices, stolen vehicle hits & manual compounding.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_box.addWidget(h_title)
        t_box.addWidget(h_sub)
        top_h.addLayout(t_box)
        top_h.addStretch()

        self.filter_combo = QComboBox()
        self.filter_combo.addItems(["All Alerts", "Active", "Pending", "Resolved"])
        self.filter_combo.currentTextChanged.connect(self.render_table)
        top_h.addWidget(self.filter_combo)
        main_layout.addLayout(top_h)

        # Table
        self.table = QTableWidget(0, 7)
        self.table.setHorizontalHeaderLabels(["Alert ID", "Type", "Plate Number", "Vehicle Details", "Location", "Status", "Action"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px;")
        main_layout.addWidget(self.table)

        self.render_table()

    def render_table(self):
        st_filter = self.filter_combo.currentText()
        filtered = [a for a in self.alerts if st_filter == "All Alerts" or a.status == st_filter]

        self.table.setRowCount(len(filtered))
        for r, alt in enumerate(filtered):
            self.table.setItem(r, 0, QTableWidgetItem(alt.id))
            
            t_item = QTableWidgetItem(alt.type)
            if "Stolen" in alt.type or "Cloned" in alt.type:
                t_item.setForeground(Qt.red)
                t_item.setFont(QFont("Segoe UI", 9, QFont.Bold))
            self.table.setItem(r, 1, t_item)

            p_item = QTableWidgetItem(alt.plateNumber)
            p_item.setFont(QFont("Consolas", 10, QFont.Bold))
            self.table.setItem(r, 2, p_item)

            self.table.setItem(r, 3, QTableWidgetItem(f"{alt.brand} {alt.model} ({alt.color})"))
            self.table.setItem(r, 4, QTableWidgetItem(alt.location))

            st_item = QTableWidgetItem(alt.status)
            if alt.status == "Active":
                st_item.setForeground(Qt.red)
            elif alt.status == "Resolved":
                st_item.setForeground(Qt.darkGreen)
            else:
                st_item.setForeground(Qt.darkYellow)
            self.table.setItem(r, 5, st_item)

            if alt.status != "Resolved":
                res_btn = QPushButton("Resolve Alert")
                res_btn.setStyleSheet("background-color: #059669; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 4px; border-radius: 4px;")
                res_btn.clicked.connect(lambda ch, aid=alt.id: self.resolve_alert(aid))
                self.table.setCellWidget(r, 6, res_btn)
            else:
                lbl = QLabel("✓ Resolved")
                lbl.setAlignment(Qt.AlignCenter)
                lbl.setStyleSheet("color: #059669; font-weight: 700;")
                self.table.setCellWidget(r, 6, lbl)

    def resolve_alert(self, aid):
        for a in self.alerts:
            if a.id == aid:
                a.status = "Resolved"
                break
        QMessageBox.information(self, "Resolved", f"Alert {aid} marked as resolved.")
        self.render_table()
