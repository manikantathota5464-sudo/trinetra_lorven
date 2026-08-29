from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame, QPushButton, 
    QScrollArea, QComboBox, QLineEdit, QGridLayout, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont, QCursor
from models.data_store import TRAFFIC_RULES, TrafficRule

class TrafficRulesView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.rules = list(TRAFFIC_RULES)
        self.selected_rules = []  # List of TrafficRule objects added to calculator
        self.selected_vehicle_type = "All"
        self.selected_category = "All"
        self.calc_vehicle = "Car"
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 16, 20, 16)
        main_layout.setSpacing(16)

        # ── 1. OFFICIAL REGULATORY HEADER BANNER ──
        banner = QFrame()
        banner.setStyleSheet("background-color: #0C2540; border-radius: 12px; padding: 14px 18px;")
        b_l = QHBoxLayout(banner)
        b_l.setContentsMargins(10, 6, 10, 6)

        b_text = QVBoxLayout()
        b_text.setSpacing(2)
        b_title = QLabel("Official Regulatory Traffic Violations & Compounding Code Handbook")
        b_title.setStyleSheet("font-size: 15px; font-weight: 900; color: #FFFFFF;")
        b_sub = QLabel("Motor Vehicles Act (Amendment) 2019 / 2026 Statutory Rules. Real-time compounding calculator.")
        b_sub.setStyleSheet("font-size: 11px; color: #94A3B8; font-weight: 500;")
        b_text.addWidget(b_title)
        b_text.addWidget(b_sub)
        b_l.addLayout(b_text)
        b_l.addStretch()

        b_badge = QLabel("MVA 2026/Rev.4\n● Active Gazette")
        b_badge.setAlignment(Qt.AlignCenter)
        b_badge.setStyleSheet("background-color: rgba(255,255,255,0.1); color: #FCD34D; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(252,211,77,0.3);")
        b_l.addWidget(b_badge)

        main_layout.addWidget(banner)

        # ── 2. TWO-COLUMN SPLIT (Rules Catalog & Dynamic Calculator) ──
        split_layout = QHBoxLayout()
        split_layout.setSpacing(16)

        # ── LEFT 65%: Rules Catalog ──
        left_col = QVBoxLayout()
        left_col.setSpacing(12)

        # Search Bar + Vehicle Type Filter Buttons
        search_card = QFrame()
        search_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 8px 12px;")
        sc_l = QHBoxLayout(search_card)
        sc_l.setContentsMargins(4, 2, 4, 2)
        sc_l.setSpacing(8)

        self.search_in = QLineEdit()
        self.search_in.setPlaceholderText("Search violations by Section, Title, or Penalty...")
        self.search_in.setStyleSheet("background-color: #FAF8F5; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 11.5px;")
        self.search_in.textChanged.connect(self.render_rules)
        sc_l.addWidget(self.search_in, 2)

        self.veh_btns = {}
        for vkey, vname in [("All", "All (10)"), ("Car", "Car (8)"), ("Bike", "Bike (7)"), ("Commercial", "Commercial (8)")]:
            vb = QPushButton(vname)
            vb.setCursor(QCursor(Qt.PointingHandCursor))
            if vkey == "All":
                vb.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 10.5px; padding: 6px 10px; border-radius: 6px;")
            else:
                vb.setStyleSheet("background-color: #FAF8F5; color: #475569; border: 1px solid #E2E8F0; font-weight: 700; font-size: 10.5px; padding: 6px 10px; border-radius: 6px;")
            
            def make_vh(k=vkey):
                return lambda: self.set_vehicle_filter(k)

            vb.clicked.connect(make_vh(vkey))
            self.veh_btns[vkey] = vb
            sc_l.addWidget(vb)

        left_col.addWidget(search_card)

        # Category Filter Pills
        cat_card = QFrame()
        cat_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 8px 12px;")
        cc_l = QHBoxLayout(cat_card)
        cc_l.setContentsMargins(4, 2, 4, 2)
        cc_l.setSpacing(6)

        self.cat_btns = {}
        cats = [
            ("All", "All Categories"), 
            ("Speed", "Speeding"), 
            ("Safety", "Safety & Restraints"), 
            ("Signal", "Signals & Junctions"), 
            ("Documents", "Documentation"), 
            ("Commercial", "Overloading")
        ]
        for ckey, cname in cats:
            cb = QPushButton(cname)
            cb.setCursor(QCursor(Qt.PointingHandCursor))
            if ckey == "All":
                cb.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 12px;")
            else:
                cb.setStyleSheet("background-color: #FAF8F5; color: #64748B; border: 1px solid #E2E8F0; font-weight: 700; font-size: 10px; padding: 4px 10px; border-radius: 12px;")
            
            def make_ch(k=ckey):
                return lambda: self.set_category_filter(k)

            cb.clicked.connect(make_ch(ckey))
            self.cat_btns[ckey] = cb
            cc_l.addWidget(cb)

        cc_l.addStretch()
        left_col.addWidget(cat_card)

        # Scrollable Rules List
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("border: none; background: transparent;")

        self.rules_container = QWidget()
        self.rules_list_layout = QVBoxLayout(self.rules_container)
        self.rules_list_layout.setSpacing(10)
        self.rules_list_layout.setContentsMargins(0, 0, 0, 0)
        scroll.setWidget(self.rules_container)
        left_col.addWidget(scroll, 1)

        split_layout.addLayout(left_col, 62)

        # ── RIGHT 38%: Dynamic Interactive Penalty Calculator ──
        right_col = QVBoxLayout()
        right_col.setSpacing(14)

        # Calculator Card
        calc_card = QFrame()
        calc_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 16px;")
        calc_l = QVBoxLayout(calc_card)
        calc_l.setSpacing(10)

        c_head = QHBoxLayout()
        c_title = QLabel("🧮 PENALTY CALCULATOR")
        c_title.setStyleSheet("font-size: 11.5px; font-weight: 900; color: #0C2540; letter-spacing: 0.5px;")
        c_head.addWidget(c_title)
        c_head.addStretch()
        self.sel_count_lbl = QLabel("0 Selected")
        self.sel_count_lbl.setStyleSheet("background-color: #EFF6FF; color: #2563EB; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;")
        c_head.addWidget(self.sel_count_lbl)
        calc_l.addLayout(c_head)

        # Vehicle Type Selector
        vsel_box = QHBoxLayout()
        vsel_lbl = QLabel("Vehicle Category:")
        vsel_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #475569;")
        vsel_box.addWidget(vsel_lbl)
        vsel_combo = QComboBox()
        vsel_combo.addItems(["Car / LMV", "Motorcycle / Scooter", "Heavy / Commercial (HMV)"])
        vsel_combo.currentIndexChanged.connect(self.on_calc_vehicle_changed)
        vsel_box.addWidget(vsel_combo, 1)
        calc_l.addLayout(vsel_box)

        # Fine and Demerits Accumulator Frame
        acc_box = QFrame()
        acc_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 10px; padding: 10px;")
        acc_l = QVBoxLayout(acc_box)
        acc_l.setSpacing(6)

        fine_row = QHBoxLayout()
        f_lbl = QLabel("Estimated Statutory Fine:")
        f_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #64748B;")
        self.total_fine_lbl = QLabel("₹ 0")
        self.total_fine_lbl.setStyleSheet("font-size: 18px; font-weight: 900; color: #0C2540;")
        fine_row.addWidget(f_lbl)
        fine_row.addStretch()
        fine_row.addWidget(self.total_fine_lbl)
        acc_l.addLayout(fine_row)

        pts_row = QHBoxLayout()
        p_lbl = QLabel("Accumulated Demerit Points:")
        p_lbl.setStyleSheet("font-size: 11px; font-weight: 700; color: #64748B;")
        self.total_pts_lbl = QLabel("0 Pts")
        self.total_pts_lbl.setStyleSheet("font-size: 14px; font-weight: 900; color: #D97706;")
        pts_row.addWidget(p_lbl)
        pts_row.addStretch()
        pts_row.addWidget(self.total_pts_lbl)
        acc_l.addLayout(pts_row)

        calc_l.addWidget(acc_box)

        # Warning box if >= 6 demerits
        self.warn_banner = QLabel("⚠️ High Demerit Warning: License suspension threshold (12 pts) may apply.")
        self.warn_banner.setWordWrap(True)
        self.warn_banner.setStyleSheet("background-color: #FEF2F2; color: #DC2626; border: 1px solid #FEE2E2; border-radius: 6px; padding: 6px 8px; font-size: 10px; font-weight: 700;")
        self.warn_banner.setVisible(False)
        calc_l.addWidget(self.warn_banner)

        # Selected items list container
        self.selected_items_box = QVBoxLayout()
        self.selected_items_box.setSpacing(6)
        calc_l.addLayout(self.selected_items_box)

        # Action Buttons
        act_h = QHBoxLayout()
        clear_btn = QPushButton("Clear All")
        clear_btn.setStyleSheet("background-color: #F1F5F9; color: #475569; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px;")
        clear_btn.clicked.connect(self.clear_calculator)
        act_h.addWidget(clear_btn)

        issue_btn = QPushButton("Generate e-Challan")
        issue_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 6px;")
        issue_btn.clicked.connect(self.generate_echallan)
        act_h.addWidget(issue_btn)
        calc_l.addLayout(act_h)

        right_col.addWidget(calc_card)

        # Statutory Speed Limits Reference Card
        speed_card = QFrame()
        speed_card.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 14px; padding: 14px;")
        sc_layout = QVBoxLayout(speed_card)
        sc_layout.setSpacing(6)

        st_title = QLabel("STATUTORY HIGHWAY SPEED LIMITS")
        st_title.setStyleSheet("font-size: 10.5px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px;")
        sc_layout.addWidget(st_title)

        limits = [
            ("Expressways (8-Lane)", "120 km/h", "#059669"),
            ("4-Lane National Highways", "100 km/h", "#059669"),
            ("Urban Arterial Corridors", "70 km/h", "#D97706"),
            ("School & Hospital Zones", "25 km/h", "#DC2626"),
        ]
        for name, lim, col in limits:
            lr = QHBoxLayout()
            n_lbl = QLabel(name)
            n_lbl.setStyleSheet("font-size: 11px; font-weight: 600; color: #334155;")
            l_lbl = QLabel(lim)
            l_lbl.setStyleSheet(f"font-size: 11px; font-weight: 900; color: {col};")
            lr.addWidget(n_lbl)
            lr.addStretch()
            lr.addWidget(l_lbl)
            sc_layout.addLayout(lr)

        right_col.addWidget(speed_card)
        right_col.addStretch()

        split_layout.addLayout(right_col, 38)
        main_layout.addLayout(split_layout)

        self.render_rules()

    def set_vehicle_filter(self, key: str):
        self.selected_vehicle_type = key
        for k, b in self.veh_btns.items():
            if k == key:
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 10.5px; padding: 6px 10px; border-radius: 6px;")
            else:
                b.setStyleSheet("background-color: #FAF8F5; color: #475569; border: 1px solid #E2E8F0; font-weight: 700; font-size: 10.5px; padding: 6px 10px; border-radius: 6px;")
        self.render_rules()

    def set_category_filter(self, key: str):
        self.selected_category = key
        for k, b in self.cat_btns.items():
            if k == key:
                b.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 12px;")
            else:
                b.setStyleSheet("background-color: #FAF8F5; color: #64748B; border: 1px solid #E2E8F0; font-weight: 700; font-size: 10px; padding: 4px 10px; border-radius: 12px;")
        self.render_rules()

    def on_calc_vehicle_changed(self, idx):
        self.calc_vehicle = "Car" if idx == 0 else "Bike" if idx == 1 else "Commercial"
        self.update_calculator()

    def render_rules(self):
        while self.rules_list_layout.count():
            item = self.rules_list_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        query = self.search_in.text().strip().lower()

        filtered = []
        for r in self.rules:
            if self.selected_vehicle_type != "All" and self.selected_vehicle_type not in r.vehicleTypes:
                continue
            if self.selected_category != "All" and r.category != self.selected_category:
                continue
            if query and (query not in r.section.lower() and query not in r.title.lower() and query not in r.fineFirst.lower()):
                continue
            filtered.append(r)

        for rule in filtered:
            rcard = QFrame()
            rcard.setStyleSheet("background-color: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 12px; padding: 12px;")
            rc_l = QVBoxLayout(rcard)
            rc_l.setSpacing(6)

            top_row = QHBoxLayout()
            sec_badge = QLabel(rule.section)
            sec_badge.setStyleSheet("background-color: #FFFBEB; color: #D97706; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            top_row.addWidget(sec_badge)

            pts_badge = QLabel(f"+{rule.demeritPoints} Demerits")
            pts_badge.setStyleSheet("background-color: #FEF2F2; color: #DC2626; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;")
            top_row.addWidget(pts_badge)
            top_row.addStretch()

            is_added = any(x.id == rule.id for x in self.selected_rules)
            add_btn = QPushButton("✓ Added" if is_added else "+ Add to Calculator")
            add_btn.setCursor(QCursor(Qt.PointingHandCursor))
            if is_added:
                add_btn.setStyleSheet("background-color: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; font-size: 10.5px; font-weight: 800; padding: 4px 8px; border-radius: 6px;")
            else:
                add_btn.setStyleSheet("background-color: #0C2540; color: #FFFFFF; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 6px;")
            
            def make_add(r_obj=rule):
                return lambda: self.toggle_rule_selection(r_obj)

            add_btn.clicked.connect(make_add(rule))
            top_row.addWidget(add_btn)
            rc_l.addLayout(top_row)

            t_lbl = QLabel(rule.title)
            t_lbl.setStyleSheet("font-size: 12.5px; font-weight: 900; color: #0C2540;")
            rc_l.addWidget(t_lbl)

            d_lbl = QLabel(rule.description)
            d_lbl.setWordWrap(True)
            d_lbl.setStyleSheet("font-size: 11px; color: #64748B;")
            rc_l.addWidget(d_lbl)

            fine_grid = QHBoxLayout()
            fine_grid.setSpacing(8)

            f1_box = QFrame()
            f1_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 8px; padding: 6px;")
            f1_l = QVBoxLayout(f1_box)
            f1_l.setSpacing(1)
            f1_l.addWidget(QLabel("First Offense:"))
            f1_val = QLabel(rule.fineFirst)
            f1_val.setStyleSheet("font-size: 11px; font-weight: 800; color: #0C2540;")
            f1_l.addWidget(f1_val)
            fine_grid.addWidget(f1_box, 1)

            f2_box = QFrame()
            f2_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 8px; padding: 6px;")
            f2_l = QVBoxLayout(f2_box)
            f2_l.setSpacing(1)
            f2_l.addWidget(QLabel("Subsequent Offense:"))
            f2_val = QLabel(rule.fineSecond)
            f2_val.setStyleSheet("font-size: 11px; font-weight: 800; color: #DC2626;")
            f2_l.addWidget(f2_val)
            fine_grid.addWidget(f2_box, 1)

            rc_l.addLayout(fine_grid)
            self.rules_list_layout.addWidget(rcard)

    def toggle_rule_selection(self, rule: TrafficRule):
        if any(x.id == rule.id for x in self.selected_rules):
            self.selected_rules = [x for x in self.selected_rules if x.id != rule.id]
        else:
            self.selected_rules.append(rule)
        self.render_rules()
        self.update_calculator()

    def update_calculator(self):
        self.sel_count_lbl.setText(f"{len(self.selected_rules)} Selected")
        
        # Calculate sum
        total_fine = 0
        total_pts = 0
        for r in self.selected_rules:
            total_pts += r.demeritPoints
            # Simple numeric parse
            digits = "".join([c for c in r.fineFirst.split("/")[0] if c.isdigit()])
            if digits:
                total_fine += int(digits)

        self.total_fine_lbl.setText(f"₹ {total_fine:,}")
        self.total_pts_lbl.setText(f"{total_pts} Pts")
        self.warn_banner.setVisible(total_pts >= 6)

        # Re-render selected list
        while self.selected_items_box.count():
            item = self.selected_items_box.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        for r in self.selected_rules:
            row_box = QFrame()
            row_box.setStyleSheet("background-color: #FAF8F5; border: 1px solid #EDE5D8; border-radius: 6px; padding: 4px 8px;")
            rb_l = QHBoxLayout(row_box)
            rb_l.setContentsMargins(2, 2, 2, 2)
            
            s_name = QLabel(f"{r.section} - {r.title[:24]}...")
            s_name.setStyleSheet("font-size: 10.5px; font-weight: 700; color: #1E293B;")
            rb_l.addWidget(s_name, 1)

            del_btn = QPushButton("✕")
            del_btn.setFixedSize(18, 18)
            del_btn.setStyleSheet("background: transparent; color: #DC2626; font-weight: 900; border: none;")
            def make_del(r_id=r.id):
                return lambda: self.remove_selected_rule(r_id)
            del_btn.clicked.connect(make_del(r.id))
            rb_l.addWidget(del_btn)

            self.selected_items_box.addWidget(row_box)

    def remove_selected_rule(self, rule_id: str):
        self.selected_rules = [x for x in self.selected_rules if x.id != rule_id]
        self.render_rules()
        self.update_calculator()

    def clear_calculator(self):
        self.selected_rules = []
        self.render_rules()
        self.update_calculator()

    def generate_echallan(self):
        if not self.selected_rules:
            QMessageBox.warning(self, "Empty Citation", "Please add at least one violation rule to calculate compounding citation.")
            return
        QMessageBox.information(self, "e-Challan Generated", f"Compounded e-Challan citation with {len(self.selected_rules)} statutory violations successfully prepared for dispatch.")

