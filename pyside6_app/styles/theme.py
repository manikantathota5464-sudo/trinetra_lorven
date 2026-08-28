# PySide6 Theme & Styling for TRINETHRA

QSS_THEME = '''
/* Global Window Styling */
QWidget {
    font-family: 'Segoe UI', 'Inter', -apple-system, sans-serif;
    color: #1E293B;
}

QMainWindow {
    background-color: #FAF7F0;
}

/* Scrollbars */
QScrollBar:vertical {
    border: none;
    background: #F1EBE1;
    width: 8px;
    margin: 0px;
    border-radius: 4px;
}
QScrollBar::handle:vertical {
    background: #C8BEB0;
    min-height: 25px;
    border-radius: 4px;
}
QScrollBar::handle:vertical:hover {
    background: #0C2540;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}

/* Inputs & Forms */
QLineEdit, QTextEdit, QPlainTextEdit {
    background-color: #FFFFFF;
    border: 1px solid #D9D2C5;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #0F172A;
}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {
    border: 2px solid #0C2540;
    background-color: #FFFFFF;
}

/* Dark Login Inputs */
QLineEdit#darkInput {
    background-color: #454D5D;
    border: 1px solid #38404E;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #FFFFFF;
}
QLineEdit#darkInput:focus {
    border: 1.5px solid #60A5FA;
    background-color: #4B5466;
}

/* Push Buttons */
QPushButton {
    background-color: #0C2540;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 9px 18px;
    font-weight: 700;
    font-size: 13px;
}
QPushButton:hover {
    background-color: #16365C;
}
QPushButton:pressed {
    background-color: #081B2F;
}

/* Secondary Button */
QPushButton#secondaryBtn {
    background-color: #FFFFFF;
    color: #1E293B;
    border: 1px solid #D9D2C5;
}
QPushButton#secondaryBtn:hover {
    background-color: #F8F5EE;
    border-color: #0C2540;
}

/* Danger Button */
QPushButton#dangerBtn {
    background-color: #DC2626;
    color: #FFFFFF;
}
QPushButton#dangerBtn:hover {
    background-color: #B91C1C;
}

/* Combo Box */
QComboBox {
    background-color: #FFFFFF;
    border: 1px solid #D9D2C5;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #1E293B;
}
QComboBox:hover {
    border-color: #0C2540;
}
QComboBox::drop-down {
    border: none;
    width: 20px;
}

/* Tables */
QTableWidget {
    background-color: #FFFFFF;
    border: 1px solid #EDE5D8;
    border-radius: 12px;
    gridline-color: #F1EBE1;
    font-size: 12.5px;
    selection-background-color: #E2ECF7;
    selection-color: #0C2540;
}
QHeaderView::section {
    background-color: #F7F3EB;
    color: #475569;
    padding: 10px;
    font-weight: 800;
    font-size: 11.5px;
    text-transform: uppercase;
    border: none;
    border-bottom: 1.5px solid #E2D8C8;
}
QTableWidget::item {
    padding: 8px;
    border-bottom: 1px solid #F1EBE1;
}

/* Cards & Containers */
QFrame#whiteCard {
    background-color: #FFFFFF;
    border: 1px solid #EDE5D8;
    border-radius: 16px;
}

QFrame#sidebarPanel {
    background-color: #FFFFFF;
    border-right: 1px solid #EDE5D8;
}

QFrame#headerPanel {
    background-color: #FAF7F0;
    border-bottom: 1px solid #EDE5D8;
}
'''
