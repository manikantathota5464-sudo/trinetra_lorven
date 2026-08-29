import sys
import os
import subprocess

# ── PySide6 imports ────────────────────────────────────────────────────────────
from PySide6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebEngineCore import QWebEnginePage, QWebEngineSettings
from PySide6.QtCore import QUrl, Qt
from PySide6.QtGui import QIcon


# Root of the whole project (lorven/)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST_INDEX   = os.path.join(PROJECT_ROOT, "dist", "index.html")


def build_react_if_needed():
    """Build the React app with `npm run build` if dist/index.html is missing."""
    if not os.path.exists(DIST_INDEX):
        print("[TRINETHRA] dist/index.html not found — running npm run build …")
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=PROJECT_ROOT,
            shell=True,          # needed on Windows so npm is resolved via PATH
        )
        if result.returncode != 0:
            print("[TRINETHRA] ERROR: npm build failed. Make sure Node.js & npm are installed.")
            sys.exit(1)
        print("[TRINETHRA] Build complete.")
    else:
        print(f"[TRINETHRA] Using existing build: {DIST_INDEX}")


class TrinethraWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TRINETHRA — Intelligent Traffic Management & Enforcement Ecosystem")
        self.setMinimumSize(1280, 800)

        # Set app icon if available
        icon_path = os.path.join(os.path.dirname(__file__), "assets", "app_icon.ico")
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))

        # ── WebEngineView: renders the React app pixel-perfectly ───────────────
        self.web_view = QWebEngineView()

        # Enable features React apps commonly need
        settings = self.web_view.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.ScrollAnimatorEnabled, True)

        # Load the built React app from disk
        url = QUrl.fromLocalFile(DIST_INDEX)
        self.web_view.load(url)

        # ── Layout ─────────────────────────────────────────────────────────────
        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        layout.addWidget(self.web_view)
        self.setCentralWidget(container)

        self.showMaximized()


def main():
    # Build React dist if not already built
    build_react_if_needed()

    app = QApplication(sys.argv)
    app.setApplicationName("TRINETHRA")
    app.setOrganizationName("Ministry of Road Transport & Highways")
    app.setApplicationDisplayName("TRINETHRA")

    # Set app icon
    icon_path = os.path.join(os.path.dirname(__file__), "assets", "app_icon.ico")
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))

    window = TrinethraWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
