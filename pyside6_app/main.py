import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from PySide6.QtWidgets import QApplication, QStackedWidget
from PySide6.QtCore import Qt
from styles.theme import QSS_THEME
from views.login_view import LoginView
from views.main_window import MainWindow

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("TRINETHRA")
    app.setOrganizationName("Ministry of Road Transport & Highways")
    app.setStyleSheet(QSS_THEME)

    # Master Stack Container
    stack = QStackedWidget()
    stack.setWindowTitle("TRINETHRA — Intelligent Traffic Management & Enforcement Ecosystem")
    stack.resize(1280, 800)
    stack.setMinimumSize(1024, 680)

    login_view = LoginView()
    main_window = MainWindow()

    stack.addWidget(login_view)
    stack.addWidget(main_window)

    def on_login_success():
        stack.setCurrentIndex(1)

    login_view.login_success.connect(on_login_success)

    stack.setCurrentIndex(0)
    stack.show()

    sys.exit(app.exec())

if __name__ == "__main__":
    main()
