from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QScrollArea, QComboBox, QLineEdit, QTextEdit, QDialog, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QCursor
from models.data_store import INITIAL_FEEDBACK, CitizenFeedback

class SubmitReportModal(QDialog):
    report_submitted = Signal(CitizenFeedback)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Submit Citizen Incident Report")
        self.setFixedWidth(460)
        self.init_ui()

    def init_ui(self):
        l = QVBoxLayout(self)
        l.setSpacing(12)
        l.setContentsMargins(20, 20, 20, 20)

        header = QLabel("Public Incident & Hazard Redressal")
        header.setStyleSheet("font-size: 15px; font-weight: 900; color: #0C2540;")
        l.addWidget(header)

        l.addWidget(QLabel("Category of Issue:"))
        self.cat_in = QComboBox()
        self.cat_in.addItems(["Signal Malfunction", "Traffic Congestion", "Road Hazard", "Reckless Driving", "Suggestion"])
        l.addWidget(self.cat_in)

        l.addWidget(QLabel("Incident Location / Landmark / Pole #:"))
        self.loc_in = QLineEdit()
        self.loc_in.setPlaceholderText("e.g. Outer Ring Road - Junction 4, Pole #C-04")
        l.addWidget(self.loc_in)

        name_phone_h = QHBoxLayout()
        np_l1 = QVBoxLayout()
        np_l1.addWidget(QLabel("Citizen Name:"))
        self.name_in = QLineEdit()
        self.name_in.setPlaceholderText("Full Name")
        np_l1.addWidget(self.name_in)
        name_phone_h.addLayout(np_l1)

        np_l2 = QVBoxLayout()
        np_l2.addWidget(QLabel("Mobile Phone:"))
        self.phone_in = QLineEdit()
        self.phone_in.setPlaceholderText("+91 98XXX XXXXX")
        np_l2.addWidget(self.phone_in)
        name_phone_h.addLayout(np_l2)
        l.addLayout(name_phone_h)

        l.addWidget(QLabel("Urgency Level:"))
        self.urg_in = QComboBox()
        self.urg_in.addItems(["Urgent", "Medium", "Low"])
        l.addWidget(self.urg_in)

        l.addWidget(QLabel("Detailed Description:"))
        self.desc_in = QTextEdit()
        self.desc_in.setPlaceholderText("Describe the traffic hazard, signal deadlock, debris, or congestion in detail...")
        self.desc_in.setFixedHeight(75)
        l.addWidget(self.desc_in)

        btn_h = QHBoxLayout()
        btn_h.addStretch()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; padding: 6px 14px; border-radius: 6px;")
        cancel_btn.clicked.connect(self.reject)
        btn_h.addWidget(cancel_btn)

        sub_btn = QPushButton("Register Ticket")
        sub_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; padding: 6px 16px; border-radius: 6px;")
        
        def do_submit():
            loc = self.loc_in.text().strip()
            name = self.name_in.text().strip()
            desc = self.desc_in.toPlainText().strip()
            if not loc or not desc:
                QMessageBox.warning(self, "Required Fields", "Please enter Location and Detailed Description.")
                return
            new_fb = CitizenFeedback(
                f"FB-2026-{8800 + len(INITIAL_FEEDBACK) + 1}",
                self.cat_in.currentText(),
                loc,
                name or "Anonymous Citizen",
                self.phone_in.text().strip() or "+91 9XXXXXXXXX",
                desc,
                self.urg_in.currentText(),
                "New",
                "Just now",
                1
            )
            self.report_submitted.emit(new_fb)
            self.accept()

        sub_btn.clicked.connect(do_submit)
        btn_h.addWidget(sub_btn)
        l.addLayout(btn_h)


class CitizenFeedbackView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.feedbacks = list(INITIAL_FEEDBACK)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. HEADER BANNER ──
        banner = QFrame()
        banner.setStyleSheet("background-color: #0C2540; border-radius: 12px; padding: 14px 18px;")
        b_l = QHBoxLayout(banner)
        b_l.setContentsMargins(10, 6, 10, 6)

        b_text = QVBoxLayout()
        b_text.setSpacing(2)
        b_title = QLabel("Public Redressal & Incident Grievance Desk")
        b_title.setStyleSheet("font-size: 15px; font-weight: 900; color: #FFFFFF;")
        b_sub = QLabel("Citizen hazard reporting, signal fault tracking & fast response patrol dispatch.")
        b_sub.setStyleSheet("font-size: 11px; color: #94A3B8; font-weight: 500;")
        b_text.addWidget(b_title)
        b_text.addWidget(b_sub)
        b_l.addLayout(b_text)
        b_l.addStretch()

        sub_report_btn = QPushButton("+ Submit Citizen Report")
        sub_report_btn.setCursor(QCursor(Qt.PointingHandCursor))
        sub_report_btn.setStyleSheet("background-color: #FCD34D; color: #0C2540; font-size: 11.5px; font-weight: 900; padding: 8px 16px; border-radius: 8px;")
        sub_report_btn.clicked.connect(self.show_submit_modal)
        b_l.addWidget(sub_report_btn)

        main_layout.addWidget(banner)

        # ── 2. 4 KPI STATS CARDS ROW ──
        kpi_row = QHBoxLayout()
        kpi_row.setSpacing(12)

        kpis = [
            ("TOTAL REPORTS LOGGED", "1,420", "Public submissions", "#0C2540", "#EFF6FF", "#2563EB", "💬"),
            ("URGENT ACTIVE HAZARDS", "12", "Immediate patrol attention", "#DC2626", "#FEF2F2", "#DC2626", "⚠️"),
            ("UNDER ACTION / PATROL", "34", "Units deployed on-site", "#D97706", "#FFFBEB", "#D97706", "⏱️"),
            ("SUCCESSFULLY RESOLVED", "1,374", "96.7% resolution rate", "#059669", "#ECFDF5", "#059669", "✓"),
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

        # ── 3. FILTER TOOLBAR ──
        filter_card = QFrame()
        filter_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px 14px;")
        f_layout = QHBoxLayout(filter_card)
        f_layout.setContentsMargins(8, 4, 8, 4)
        f_layout.setSpacing(10)

        self.search_in = QLineEdit()
        self.search_in.setPlaceholderText("Search grievances by location, citizen name, issue...")
        self.search_in.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_in.textChanged.connect(self.render_feed)
        f_layout.addWidget(self.search_in, 2)

        self.cat_filter = QComboBox()
        self.cat_filter.addItems(["All Categories", "Signal Malfunction", "Traffic Congestion", "Road Hazard", "Reckless Driving", "Suggestion"])
        self.cat_filter.currentTextChanged.connect(self.render_feed)
        f_layout.addWidget(self.cat_filter, 1)

        self.status_filter = QComboBox()
        self.status_filter.addItems(["All Status", "New", "Under Investigation", "Action Taken", "Resolved"])
        self.status_filter.currentTextChanged.connect(self.render_feed)
        f_layout.addWidget(self.status_filter, 1)

        main_layout.addWidget(filter_card)

        # ── 4. GRIEVANCE FEED CARDS ──
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.feed_container = QWidget()
        self.feed_layout = QVBoxLayout(self.feed_container)
        self.feed_layout.setSpacing(12)
        self.feed_layout.setContentsMargins(0, 0, 0, 0)
        scroll.setWidget(self.feed_container)
        main_layout.addWidget(scroll, 1)

        self.render_feed()

    def render_feed(self):
        while self.feed_layout.count():
            item = self.feed_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        query = self.search_in.text().strip().lower()
        cf = self.cat_filter.currentText()
        sf = self.status_filter.currentText()

        filtered = []
        for fb in self.feedbacks:
            if cf != "All Categories" and fb.category != cf:
                continue
            if sf != "All Status" and fb.status != sf:
                continue
            if query and (query not in fb.location.lower() and query not in fb.description.lower() and query not in fb.citizenName.lower()):
                continue
            filtered.append(fb)

        for fb in filtered:
            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 16px;")
            cl = QVBoxLayout(card)
            cl.setSpacing(8)

            # Top row: Ticket ID, Category, Priority, Timestamp, Live Status Dropdown
            top_h = QHBoxLayout()
            top_h.setSpacing(8)

            id_badge = QLabel(fb.id)
            id_badge.setStyleSheet("font-size: 10px; font-weight: 800; color: #64748B; background-color: #FAF8F5; padding: 2px 6px; border-radius: 4px;")
            top_h.addWidget(id_badge)

            cat_badge = QLabel(fb.category)
            cat_badge.setStyleSheet("font-size: 11px; font-weight: 900; color: #0C2540;")
            top_h.addWidget(cat_badge)

            pri_badge = QLabel(fb.severity.upper())
            if fb.severity == "Urgent":
                pri_badge.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-size: 9.5px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            elif fb.severity == "Medium":
                pri_badge.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-size: 9.5px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            else:
                pri_badge.setStyleSheet("background-color: #ECFDF5; color: #059669; font-size: 9.5px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            top_h.addWidget(pri_badge)

            time_lbl = QLabel(f"• {fb.timestamp}")
            time_lbl.setStyleSheet("font-size: 10px; color: #94A3B8; font-weight: 600;")
            top_h.addWidget(time_lbl)

            top_h.addStretch()

            # Status dropdown
            st_combo = QComboBox()
            st_combo.addItems(["New", "Under Investigation", "Action Taken", "Resolved"])
            st_combo.setCurrentText(fb.status)
            
            def make_st_change(f_obj=fb):
                def handler(text):
                    f_obj.status = text
                return handler

            st_combo.currentTextChanged.connect(make_st_change(fb))
            top_h.addWidget(st_combo)
            cl.addLayout(top_h)

            # Location
            loc_lbl = QLabel(f"📍 {fb.location}")
            loc_lbl.setStyleSheet("font-size: 12px; font-weight: 700; color: #1E293B;")
            cl.addWidget(loc_lbl)

            # Description box
            desc_box = QFrame()
            desc_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 8px; padding: 8px;")
            dl = QVBoxLayout(desc_box)
            dl.setContentsMargins(4, 2, 4, 2)
            d_txt = QLabel(fb.description)
            d_txt.setWordWrap(True)
            d_txt.setStyleSheet("font-size: 11.5px; color: #334155;")
            dl.addWidget(d_txt)
            cl.addWidget(desc_box)

            # Officer Dispatch Note (if present)
            if fb.officerNote:
                onote_box = QFrame()
                onote_box.setStyleSheet("background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 8px;")
                on_l = QVBoxLayout(onote_box)
                on_l.setContentsMargins(4, 2, 4, 2)
                on_lbl = QLabel(f"🛡️ Control Center Dispatch Note: {fb.officerNote}")
                on_lbl.setWordWrap(True)
                on_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #065F46;")
                on_l.addWidget(on_lbl)
                cl.addWidget(onote_box)

            # Bottom info: Citizen Details + Upvote Button
            bot_h = QHBoxLayout()
            cit_info = QLabel(f"Reported by: <b>{fb.citizenName}</b> ({fb.citizenPhone})")
            cit_info.setStyleSheet("font-size: 10.5px; color: #64748B;")
            bot_h.addWidget(cit_info)
            bot_h.addStretch()

            upvote_btn = QPushButton(f"👍 Helpful ({fb.upvotes})")
            upvote_btn.setCursor(QCursor(Qt.PointingHandCursor))
            upvote_btn.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; color: #0C2540; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 6px;")
            
            def make_upvote(f_obj=fb, btn=upvote_btn):
                def handler():
                    f_obj.upvotes += 1
                    btn.setText(f"👍 Helpful ({f_obj.upvotes})")
                    btn.setStyleSheet("background-color: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 6px;")
                return handler

            upvote_btn.clicked.connect(make_upvote(fb, upvote_btn))
            bot_h.addWidget(upvote_btn)
            cl.addLayout(bot_h)

            self.feed_layout.addWidget(card)

        self.feed_layout.addStretch()

    def show_submit_modal(self):
        diag = SubmitReportModal(self)
        def on_sub(new_fb):
            self.feedbacks.insert(0, new_fb)
            self.render_feed()
            QMessageBox.information(self, "Ticket Registered", f"Citizen ticket {new_fb.id} has been registered and dispatched.")
        diag.report_submitted.connect(on_sub)
        diag.exec()
