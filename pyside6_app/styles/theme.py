# PySide6 Theme & Styling for TRINETHRA

QSS_THEME = '''
/* Global Window Styling */
QWidget {
    font-family: 'Segoe UI', 'Inter', -apple-system, sans-serif;
    color: #1E293B;
}

QMainWindow {
    background-color: #FAF8F5;
}

/* Scrollbars */
QScrollBar:vertical {
    border: none;
    background: #F1EBE1;
    width: 6px;
    margin: 0px;
    border-radius: 3px;
}
QScrollBar::handle:vertical {
    background: #CBD5E1;
    min-height: 25px;
    border-radius: 3px;
}
QScrollBar::handle:vertical:hover {
    background: #0C2540;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}

QScrollBar:horizontal {
    border: none;
    background: #F1EBE1;
    height: 6px;
    margin: 0px;
    border-radius: 3px;
}
QScrollBar::handle:horizontal {
    background: #CBD5E1;
    min-width: 25px;
    border-radius: 3px;
}
QScrollBar::handle:horizontal:hover {
    background: #0C2540;
}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
    width: 0px;
}

/* Inputs & Forms */
QLineEdit, QTextEdit, QPlainTextEdit {
    background-color: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: #1E293B;
}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {
    border: 1.5px solid #0C2540;
    background-color: #FFFFFF;
}

/* Push Buttons */
QPushButton {
    background-color: #0C2540;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 700;
    font-size: 12px;
}
QPushButton:hover {
    background-color: #16385C;
}
QPushButton:pressed {
    background-color: #081B2F;
}

/* Combo Box */
QComboBox {
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
}
QComboBox:hover {
    border-color: #0C2540;
    background-color: #FFFFFF;
}
QComboBox::drop-down {
    border: none;
    width: 20px;
}

/* Tables */
QTableWidget {
    background-color: #FFFFFF;
    border: 1px solid #F1EBE1;
    border-radius: 12px;
    gridline-color: #F8FAFC;
    font-size: 12px;
    selection-background-color: #F1F5F9;
    selection-color: #0C2540;
}
QHeaderView::section {
    background-color: #FAF8F5;
    color: #64748B;
    padding: 10px;
    font-weight: 800;
    font-size: 10.5px;
    text-transform: uppercase;
    border: none;
    border-bottom: 1px solid #F1EBE1;
}
QTableWidget::item {
    padding: 8px;
    border-bottom: 1px solid #F8FAFC;
}

/* Card Containers */
QFrame#whiteCard {
    background-color: #FFFFFF;
    border: 1px solid #F4EFE6;
    border-radius: 16px;
}

QFrame#sidebarPanel {
    background-color: #FFFFFF;
    border-right: 1px solid #F4EFE6;
}

QFrame#headerPanel {
    background-color: #FFFFFF;
    border-bottom: 1px solid #F4EFE6;
}
'''

