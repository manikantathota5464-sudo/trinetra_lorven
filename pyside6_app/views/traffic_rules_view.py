from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QLineEdit, QComboBox, QScrollArea, QCheckBox
)
from PySide6.QtCore import Qt
from models.data_store import TRAFFIC_RULES

class TrafficRulesView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.selected_rules = set()
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(24, 20, 24, 20)
        main_layout.setSpacing(16)

        # Header
        h_box = QHBoxLayout()
        t_l = QVBoxLayout()
        h_title = QLabel("Traffic Rules, Penalties & Statutory Guidelines")
        h_title.setStyleSheet("font-size: 22px; font-weight: 900; color: #0C2540;")
        h_sub = QLabel("Official regulatory handbook and interactive statutory penalty calculator (Motor Vehicles Act).")
        h_sub.setStyleSheet("font-size: 12px; color: #64748B; font-weight: 500;")
        t_l.addWidget(h_title)
        t_l.addWidget(h_sub)
        h_box.addLayout(t_l)
        h_box.addStretch()
        main_layout.addLayout(h_box)

        # Split: Left Rules Catalog, Right Calculator
        split = QHBoxLayout()
        split.setSpacing(20)

        # Left: Search & Cards
        left_box = QVBoxLayout()
        left_box.setSpacing(12)

        search_bar = QFrame()
        search_bar.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 10px;")
        sb_l = QHBoxLayout(search_bar)
        self.search_in = QLineEdit()
        self.search_in.setPlaceholderText("Search by section, rule name, violation...")
        self.search_in.textChanged.connect(self.render_rules)
        sb_l.addWidget(self.search_in)
        left_box.addWidget(search_bar)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.cards_widget = QWidget()
        self.cards_layout = QVBoxLayout(self.cards_widget)
        self.cards_layout.setSpacing(12)
        scroll.setWidget(self.cards_widget)
        left_box.addWidget(scroll)

        split.addLayout(left_box, 65)

        # Right: Dynamic Fine Calculator Card
        calc_card = QFrame()
        calc_card.setFixedWidth(360)
        calc_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 16px; padding: 18px;")
        c_l = QVBoxLayout(calc_card)
        c_l.setSpacing(14)

        calc_title = QLabel("🧮 Dynamic Penalty Calculator")
        calc_title.setStyleSheet("font-size: 15px; font-weight: 900; color: #0C2540;")
        c_l.addWidget(calc_title)

        self.count_lbl = QLabel("Selected Violations: 0")
        self.count_lbl.setStyleSheet("font-size: 12px; font-weight: 600; color: #475569;")
        c_l.addWidget(self.count_lbl)

        self.demerit_lbl = QLabel("Accumulated Demerit: 0 / 12 Pts")
        self.demerit_lbl.setStyleSheet("font-size: 12px; font-weight: 700; color: #D97706;")
        c_l.addWidget(self.demerit_lbl)

        res_box = QFrame()
        res_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 12px;")
        rb_l = QVBoxLayout(res_box)
        rb_l.addWidget(QLabel("TOTAL ESTIMATED FINE:"))
        self.total_fine_lbl = QLabel("₹0")
        self.total_fine_lbl.setStyleSheet("font-size: 24px; font-weight: 900; color: #0C2540;")
        rb_l.addWidget(self.total_fine_lbl)
        c_l.addWidget(res_box)

        clear_btn = QPushButton("Clear Calculator")
        clear_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; font-weight: 700; padding: 6px;")
        clear_btn.clicked.connect(self.clear_calc)
        c_l.addWidget(clear_btn)

        # Speed limits table
        c_l.addStretch()
        speed_box = QFrame()
        speed_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 12px;")
        sb_l2 = QVBoxLayout(speed_box)
        sb_l2.addWidget(QLabel("STATUTORY SPEED LIMITS:"))
        sb_l2.addWidget(QLabel("• Expressway: 120 km/h"))
        sb_l2.addWidget(QLabel("• National Highway: 100 km/h"))
        sb_l2.addWidget(QLabel("• Urban Road: 70 km/h"))
        sb_l2.addWidget(QLabel("• School/Hospital: 25 km/h"))
        c_l.addWidget(speed_box)

        split.addWidget(calc_card, 35)
        main_layout.addLayout(split)

        self.render_rules()

    def render_rules(self):
        while self.cards_layout.count():
            item = self.cards_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        query = self.search_in.text().strip().lower()

        for rule in TRAFFIC_RULES:
            if query and (query not in rule.title.lower() and query not in rule.section.lower()):
                continue

            card = QFrame()
            card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 14px;")
            cl = QVBoxLayout(card)
            cl.setSpacing(6)

            top_r = QHBoxLayout()
            sec_lbl = QLabel(f"{rule.section} — {rule.title}")
            sec_lbl.setStyleSheet("font-size: 13.5px; font-weight: 900; color: #0C2540;")
            top_r.addWidget(sec_lbl)
            top_r.addStretch()

            cb = QCheckBox("Add to Calculator")
            cb.setChecked(rule.id in self.selected_rules)
            cb.toggled.connect(lambda ch, rid=rule.id: self.toggle_rule(rid, ch))
            top_r.addWidget(cb)
            cl.addLayout(top_r)

            desc = QLabel(rule.description)
            desc.setStyleSheet("font-size: 11.5px; color: #475569;")
            cl.addWidget(desc)

            fines = QLabel(f"1st Offense: {rule.fineFirst}  |  Subsequent: {rule.fineSecond}")
            fines.setStyleSheet("font-size: 11px; font-weight: 700; color: #0C2540; background-color: #FAF8F5; padding: 6px; border-radius: 6px;")
            cl.addWidget(fines)

            self.cards_layout.addWidget(card)

        self.cards_layout.addStretch()

    def toggle_rule(self, rid, checked):
        if checked:
            self.selected_rules.add(rid)
        else:
            self.selected_rules.discard(rid)
        self.update_calc()

    def clear_calc(self):
        self.selected_rules.clear()
        self.render_rules()
        self.update_calc()

    def update_calc(self):
        total = 0
        demerit = 0
        for r in TRAFFIC_RULES:
            if r.id in self.selected_rules:
                demerit += r.demeritPoints
                if "10,000" in r.fineFirst:
                    total += 10000
                elif "5,000" in r.fineFirst:
                    total += 5000
                elif "2,000" in r.fineFirst:
                    total += 2000
                else:
                    total += 1000

        self.count_lbl.setText(f"Selected Violations: {len(self.selected_rules)}")
        self.demerit_lbl.setText(f"Accumulated Demerit: {demerit} / 12 Pts")
        self.total_fine_lbl.setText(f"₹{total:,}")
