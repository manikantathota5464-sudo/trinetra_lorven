from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QFrame, QPushButton, QGridLayout

class ReportsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        l = QVBoxLayout(self)
        l.setContentsMargins(24, 20, 24, 20)
        h = QLabel("Compliance & Analytics Reports")
        h.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        l.addWidget(h)
        l.addWidget(QLabel("Export automated daily/weekly ANPR traffic audits and legal compounding certificates."))
        card = QFrame()
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 24px;")
        cl = QVBoxLayout(card)
        cl.addWidget(QLabel("📊 Daily Speeding Audit — 1,240 Citations Generated (PDF / Excel)"))
        cl.addWidget(QLabel("📑 Red Light Violation Matrix — 450 Verified Breaches"))
        cl.addWidget(QLabel("🛡️ Stolen Vehicle Hotlist Resolution Log — 4 Recoveries"))
        l.addWidget(card)
        l.addStretch()

class MapView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        l = QVBoxLayout(self)
        l.setContentsMargins(24, 20, 24, 20)
        h = QLabel("Geospatial Highway Camera Node Map")
        h.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        l.addWidget(h)
        l.addWidget(QLabel("Real-time geographic distribution of 24 active camera nodes and traffic density overlays."))
        card = QFrame()
        card.setStyleSheet("background-color: #1E293B; border-radius: 14px; padding: 40px;")
        cl = QVBoxLayout(card)
        lbl = QLabel("🗺️ [GEOSPATIAL RADAR ACTIVE] — 24 NODES ONLINE ACROSS SECTORS 1 - 8")
        lbl.setStyleSheet("color: #60A5FA; font-weight: 800; font-size: 14px;")
        cl.addWidget(lbl)
        l.addWidget(card)
        l.addStretch()

class SettingsView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        l = QVBoxLayout(self)
        l.setContentsMargins(24, 20, 24, 20)
        h = QLabel("System Settings & ANPR Calibration")
        h.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        l.addWidget(h)
        card = QFrame()
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 20px;")
        cl = QVBoxLayout(card)
        cl.addWidget(QLabel("⚙️ ANPR Optical Confidence Threshold: 95%"))
        cl.addWidget(QLabel("🔔 Alert Sound & Popup Notifications: ENABLED"))
        cl.addWidget(QLabel("📡 Ministry Central Server Sync Frequency: 5 seconds"))
        l.addWidget(card)
        l.addStretch()
