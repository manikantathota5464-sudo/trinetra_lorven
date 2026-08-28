from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QLineEdit, QComboBox, QScrollArea, QDialog, QTextEdit, QMessageBox
)
from PySide6.QtCore import Qt
from models.data_store import INITIAL_FEEDBACK, CitizenFeedback

class CitizenFeedbackView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.feedbacks = list(INITIAL_FEEDBACK)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Header
        top_h = QHBoxLayout()
        t_box = QVBoxLayout()
        h_title = QLabel("Citizen Grievance & Public Feedback Desk")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Crowdsourced incident alerts, road hazards, signal defects & public commendations.")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_box.addWidget(h_title)
        t_box.addWidget(h_sub)
        top_h.addLayout(t_box)
        top_h.addStretch()

        add_btn = QPushButton("+ Submit Citizen Report")
        add_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 8px;")
        add_btn.clicked.connect(self.show_add_modal)
        top_h.addWidget(add_btn)
        main_layout.addLayout(top_h)

        # Scroll Area for Tickets
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.list_widget = QWidget()
        self.list_layout = QVBoxLayout(self.list_widget)
        self.list_layout.setSpacing(12)
        scroll.setWidget(self.list_widget)
        main_layout.addWidget(scroll, 1)

        self.render_feed()

    def render_feed(self):
        while self.list_layout.count():
            item = self.list_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        for item in self.feedbacks:
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 16px;")
            c_l = QVBoxLayout(card)
            c_l.setSpacing(8)

            top_row = QHBoxLayout()
            t_id = QLabel(f"🏷️  {item.id} — {item.category}")
            t_id.setStyleSheet("font-size: 13.5px; font-weight: 900; color: #0C2540;")
            top_row.addWidget(t_id)
            top_row.addStretch()

            sev_badge = QLabel(f"[{item.severity} Priority]")
            if item.severity == "Urgent":
                sev_badge.setStyleSheet("color: #DC2626; font-weight: 800; font-size: 11px;")
            else:
                sev_badge.setStyleSheet("color: #D97706; font-weight: 800; font-size: 11px;")
            top_row.addWidget(sev_badge)

            st_combo = QComboBox()
            st_combo.addItems(["New", "Under Investigation", "Action Taken", "Resolved"])
            st_combo.setCurrentText(item.status)
            st_combo.currentTextChanged.connect(lambda txt, fb=item: self.update_status(fb, txt))
            top_row.addWidget(st_combo)
            c_l.addLayout(top_row)

            loc_lbl = QLabel(f"📍 {item.location}")
            loc_lbl.setStyleSheet("font-size: 12px; font-weight: 700; color: #334155;")
            c_l.addWidget(loc_lbl)

            desc = QLabel(item.description)
            desc.setWordWrap(True)
            desc.setStyleSheet("font-size: 12px; color: #475569; background-color: #FAF8F5; padding: 10px; border-radius: 8px;")
            c_l.addWidget(desc)

            if item.officerNote:
                note_box = QLabel(f"✅ Control Center Dispatch: {item.officerNote}")
                note_box.setStyleSheet("color: #065F46; background-color: #ECFDF5; padding: 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600;")
                c_l.addWidget(note_box)

            bot_row = QHBoxLayout()
            cit_lbl = QLabel(f"Reported by: {item.citizenName} ({item.citizenPhone}) — {item.timestamp}")
            cit_lbl.setStyleSheet("color: #94A3B8; font-size: 11px;")
            bot_row.addWidget(cit_lbl)
            bot_row.addStretch()

            up_btn = QPushButton(f"👍 Upvote ({item.upvotes})")
            up_btn.setStyleSheet("background-color: #F1F5F9; color: #0C2540; font-weight: 700; font-size: 11px; padding: 4px 10px;")
            up_btn.clicked.connect(lambda ch, fb=item: self.upvote(fb))
            bot_row.addWidget(up_btn)
            c_l.addLayout(bot_row)

            self.list_layout.addWidget(card)

        self.list_layout.addStretch()

    def update_status(self, fb, new_st):
        fb.status = new_st

    def upvote(self, fb):
        fb.upvotes += 1
        self.render_feed()

    def show_add_modal(self):
        diag = QDialog(self)
        diag.setWindowTitle("Submit Citizen Grievance")
        diag.setFixedWidth(440)
        d_l = QVBoxLayout(diag)
        d_l.setSpacing(12)

        d_l.addWidget(QLabel("Issue Category:"))
        cat_in = QComboBox()
        cat_in.addItems(["Traffic Congestion", "Signal Malfunction", "Road Hazard", "Reckless Driving", "Suggestion"])
        d_l.addWidget(cat_in)

        d_l.addWidget(QLabel("Location / Landmark:"))
        loc_in = QLineEdit()
        d_l.addWidget(loc_in)

        d_l.addWidget(QLabel("Citizen Name:"))
        name_in = QLineEdit()
        d_l.addWidget(name_in)

        d_l.addWidget(QLabel("Phone Number:"))
        phone_in = QLineEdit()
        d_l.addWidget(phone_in)

        d_l.addWidget(QLabel("Description:"))
        desc_in = QTextEdit()
        desc_in.setFixedHeight(80)
        d_l.addWidget(desc_in)

        save_btn = QPushButton("Submit Grievance Ticket")
        save_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; padding: 10px;")
        
        def save():
            if not loc_in.text() or not name_in.text():
                QMessageBox.warning(diag, "Required Fields", "Please enter location and name.")
                return
            new_f = CitizenFeedback(f"FB-2026-{1000+len(self.feedbacks)}", cat_in.currentText(), loc_in.text(), name_in.text(), phone_in.text() or "+91 9XXXXXXXXX", desc_in.toPlainText(), "Medium", "New", "Just now", 1)
            self.feedbacks.insert(0, new_f)
            self.render_feed()
            diag.accept()
            QMessageBox.information(self, "Ticket Registered", f"Ticket {new_f.id} registered successfully.")

        save_btn.clicked.connect(save)
        d_l.addWidget(save_btn)
        diag.exec()
