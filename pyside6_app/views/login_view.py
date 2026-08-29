import os
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, 
    QCheckBox, QFrame, QComboBox, QSizePolicy, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QPixmap, QCursor

class LoginView(QWidget):
    login_success = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("loginView")
        self.setStyleSheet("background-color: #FAF7F0;")
        self.show_password = False
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # ── TOP HEADER ──
        header = QFrame()
        header.setFixedHeight(65)
        header.setStyleSheet("background-color: #FAF7F0; border-bottom: 1px solid #EDE5D8;")
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(36, 10, 36, 10)

        left_h = QHBoxLayout()
        left_h.setSpacing(12)

        emblem_lbl = QLabel()
        assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
        emblem_path = os.path.join(assets_dir, "emblem_clean_no_black.png")
        if os.path.exists(emblem_path):
            pix = QPixmap(emblem_path).scaled(42, 48, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            emblem_lbl.setPixmap(pix)
        left_h.addWidget(emblem_lbl)

        min_text_box = QVBoxLayout()
        min_text_box.setSpacing(2)
        govt_lbl = QLabel("भारत सरकार  |  Government of India")
        govt_lbl.setStyleSheet("font-size: 11px; font-weight: 600; color: #475569;")
        morth_lbl = QLabel("MINISTRY OF ROAD TRANSPORT & HIGHWAYS")
        morth_lbl.setStyleSheet("font-size: 13.5px; font-weight: 900; color: #0B213F; letter-spacing: 0.5px;")
        min_text_box.addWidget(govt_lbl)
        min_text_box.addWidget(morth_lbl)
        left_h.addLayout(min_text_box)
        header_layout.addLayout(left_h)

        header_layout.addStretch()

        right_h = QHBoxLayout()
        right_h.setSpacing(14)

        ts_lbl = QLabel("Text Size:")
        ts_lbl.setStyleSheet("font-size: 12px; font-weight: 600; color: #475569;")
        right_h.addWidget(ts_lbl)

        self.size_buttons = []
        for txt in ("A-", "A", "A+"):
            btn = QPushButton(txt)
            btn.setFixedSize(30, 24)
            if txt == "A":
                btn.setStyleSheet("background-color: #0B213F; color: #FFFFFF; border: 1px solid #0B213F; border-radius: 4px; font-size: 11px; font-weight: 700;")
            else:
                btn.setStyleSheet("background-color: #FFFFFF; color: #334155; border: 1px solid #CBD5E1; border-radius: 4px; font-size: 11px; font-weight: 700;")
            self.size_buttons.append(btn)
            right_h.addWidget(btn)

        lang_lbl = QLabel("Language:")
        lang_lbl.setStyleSheet("font-size: 12px; font-weight: 600; color: #475569;")
        right_h.addWidget(lang_lbl)

        lang_combo = QComboBox()
        lang_combo.addItems(["English", "हिन्दी"])
        lang_combo.setFixedWidth(95)
        lang_combo.setStyleSheet("background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; padding: 3px 8px; font-size: 11.5px; font-weight: 600; color: #1E293B;")
        right_h.addWidget(lang_combo)

        sep = QLabel("|")
        sep.setStyleSheet("color: #CBD5E1;")
        right_h.addWidget(sep)

        report_link = QLabel('<a href="#" style="color: #0B213F; text-decoration: none; font-weight: 700; font-size: 12px;">Report Issue</a>')
        right_h.addWidget(report_link)

        header_layout.addLayout(right_h)
        main_layout.addWidget(header)

        # ── MAIN WORKSPACE CONTENT ──
        center_widget = QWidget()
        center_layout = QHBoxLayout(center_widget)
        center_layout.setContentsMargins(60, 20, 60, 20)
        center_layout.setSpacing(40)

        # Left hero panel artwork
        left_panel_box = QVBoxLayout()
        left_panel_box.setAlignment(Qt.AlignCenter)
        art_lbl = QLabel()
        panel_art_path = os.path.join(assets_dir, "left_panel_clean.png")
        if not os.path.exists(panel_art_path):
            panel_art_path = os.path.join(assets_dir, "traffic_bg.png")
        if os.path.exists(panel_art_path):
            pix_art = QPixmap(panel_art_path).scaled(600, 460, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            art_lbl.setPixmap(pix_art)
        art_lbl.setAlignment(Qt.AlignCenter)
        left_panel_box.addWidget(art_lbl)
        center_layout.addLayout(left_panel_box, 60)

        # Right card
        card_container = QVBoxLayout()
        card_container.setAlignment(Qt.AlignCenter)

        card = QFrame()
        card.setFixedWidth(430)
        card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 20px;")
        
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(32, 28, 32, 24)
        card_layout.setSpacing(12)

        title_lbl = QLabel("Welcome Back!")
        title_lbl.setAlignment(Qt.AlignCenter)
        title_lbl.setStyleSheet("font-size: 24px; font-weight: 900; color: #1E293B;")
        card_layout.addWidget(title_lbl)

        sub_lbl = QLabel("Sign in to access TRINETHRA Dashboard")
        sub_lbl.setAlignment(Qt.AlignCenter)
        sub_lbl.setStyleSheet("font-size: 12px; font-weight: 500; color: #64748B; margin-top: -4px;")
        card_layout.addWidget(sub_lbl)

        # Gold Lock Divider
        div_h = QHBoxLayout()
        line1 = QFrame()
        line1.setFrameShape(QFrame.HLine)
        line1.setStyleSheet("background-color: #E8DFC8; max-height: 1px;")
        line2 = QFrame()
        line2.setFrameShape(QFrame.HLine)
        line2.setStyleSheet("background-color: #E8DFC8; max-height: 1px;")
        lock_icon_lbl = QLabel("🔒")
        lock_icon_lbl.setStyleSheet("font-size: 11px; padding: 4px 6px; border: 1px solid #D5C29D; border-radius: 12px; background-color: #FAF8F5; color: #B8934C;")
        div_h.addWidget(line1)
        div_h.addWidget(lock_icon_lbl)
        div_h.addWidget(line2)
        card_layout.addLayout(div_h)

        # Username Input
        user_lbl = QLabel("Username / Operator ID")
        user_lbl.setStyleSheet("font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 2px;")
        card_layout.addWidget(user_lbl)

        self.user_input = QLineEdit()
        self.user_input.setPlaceholderText("Enter your username or operator ID")
        self.user_input.setText("admin")
        self.user_input.setStyleSheet("background-color: #454D5D; border: 1px solid #38404E; border-radius: 8px; padding: 10px 14px; font-size: 12.5px; color: #FFFFFF;")
        card_layout.addWidget(self.user_input)

        # Password Input with Toggle
        pass_lbl = QLabel("Password")
        pass_lbl.setStyleSheet("font-size: 11.5px; font-weight: 700; color: #334155;")
        card_layout.addWidget(pass_lbl)

        pass_frame = QFrame()
        pass_frame.setStyleSheet("background-color: #454D5D; border: 1px solid #38404E; border-radius: 8px;")
        pass_layout = QHBoxLayout(pass_frame)
        pass_layout.setContentsMargins(10, 0, 10, 0)
        pass_layout.setSpacing(6)

        self.pass_input = QLineEdit()
        self.pass_input.setPlaceholderText("Enter your password")
        self.pass_input.setEchoMode(QLineEdit.Password)
        self.pass_input.setText("password123")
        self.pass_input.setStyleSheet("background: transparent; border: none; font-size: 12.5px; color: #FFFFFF; padding: 10px 0px;")
        pass_layout.addWidget(self.pass_input, 1)

        self.eye_btn = QPushButton("👁️")
        self.eye_btn.setFixedSize(28, 28)
        self.eye_btn.setCursor(QCursor(Qt.PointingHandCursor))
        self.eye_btn.setStyleSheet("background: transparent; border: none; font-size: 14px; color: #94A3B8;")
        self.eye_btn.clicked.connect(self.toggle_password_visibility)
        pass_layout.addWidget(self.eye_btn)

        card_layout.addWidget(pass_frame)

        # Options
        opt_h = QHBoxLayout()
        self.remember_cb = QCheckBox("Remember me")
        self.remember_cb.setChecked(True)
        self.remember_cb.setStyleSheet("font-size: 11.5px; font-weight: 600; color: #475569;")
        opt_h.addWidget(self.remember_cb)
        opt_h.addStretch()
        forgot_link = QLabel('<a href="#" style="color: #475569; text-decoration: underline; font-size: 11.5px; font-weight: 600;">Forgot Password?</a>')
        opt_h.addWidget(forgot_link)
        card_layout.addLayout(opt_h)

        # Sign In Button
        self.sign_in_btn = QPushButton("🔒  Sign In")
        self.sign_in_btn.setCursor(QCursor(Qt.PointingHandCursor))
        self.sign_in_btn.setFixedHeight(42)
        self.sign_in_btn.setStyleSheet("background-color: #0B213F; color: #FFFFFF; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 800; margin-top: 4px;")
        self.sign_in_btn.clicked.connect(self.handle_login)
        card_layout.addWidget(self.sign_in_btn)

        hint_lbl = QLabel("Sign in to access your secure dashboard. (Optional: A dynamic security alert/tip box).")
        hint_lbl.setAlignment(Qt.AlignCenter)
        hint_lbl.setWordWrap(True)
        hint_lbl.setStyleSheet("font-size: 10px; color: #64748B; margin-top: 2px;")
        card_layout.addWidget(hint_lbl)

        # Helpline Bar
        helpline_bar = QFrame()
        helpline_bar.setStyleSheet("background-color: #EEF2F6; border-top: 1px solid #E2E8F0; border-bottom-left-radius: 18px; border-bottom-right-radius: 18px; margin: 8px -32px -24px -32px; padding: 12px 24px;")
        hl_layout = QHBoxLayout(helpline_bar)
        hl_layout.setContentsMargins(18, 10, 18, 10)
        hl_icon = QLabel("📞 💬")
        hl_icon.setStyleSheet("font-size: 14px;")
        hl_layout.addWidget(hl_icon)
        
        hl_text_box = QVBoxLayout()
        hl_text_box.setSpacing(1)
        hl_title = QLabel("Helpline: 1033")
        hl_title.setStyleSheet("font-size: 12.5px; font-weight: 900; color: #1E293B;")
        hl_sub = QLabel("For technical support and assistance")
        hl_sub.setStyleSheet("font-size: 10px; font-weight: 500; color: #64748B;")
        hl_text_box.addWidget(hl_title)
        hl_text_box.addWidget(hl_sub)
        hl_layout.addLayout(hl_text_box)
        hl_layout.addStretch()

        card_layout.addWidget(helpline_bar)
        card_container.addWidget(card)
        center_layout.addLayout(card_container, 40)
        main_layout.addWidget(center_widget, 1)

        # ── BOTTOM FOOTER ──
        footer = QFrame()
        footer.setFixedHeight(45)
        footer.setStyleSheet("background-color: #0B213F;")
        footer_layout = QHBoxLayout(footer)
        footer_layout.setContentsMargins(36, 0, 36, 0)
        copy_lbl = QLabel("© 2024-2025 Ministry of Road Transport & Highways, Government of India. All Rights Reserved.")
        copy_lbl.setStyleSheet("font-size: 11px; color: #CBD5E1; font-weight: 500;")
        footer_layout.addWidget(copy_lbl)
        footer_layout.addStretch()
        links_lbl = QLabel('<span style="color: #CBD5E1; font-size: 11px; font-weight: 500;">Privacy Policy &nbsp;|&nbsp; Terms of Use &nbsp;|&nbsp; Accessibility &nbsp;|&nbsp; Help &nbsp;|&nbsp; Contact Us</span>')
        footer_layout.addWidget(links_lbl)
        main_layout.addWidget(footer)

    def toggle_password_visibility(self):
        self.show_password = not self.show_password
        if self.show_password:
            self.pass_input.setEchoMode(QLineEdit.Normal)
            self.eye_btn.setText("🙈")
        else:
            self.pass_input.setEchoMode(QLineEdit.Password)
            self.eye_btn.setText("👁️")

    def handle_login(self):
        user = self.user_input.text().strip()
        pwd = self.pass_input.text().strip()
        if not user or not pwd:
            QMessageBox.warning(self, "Validation Error", "Please enter both username and password.")
            return
        self.login_success.emit()

