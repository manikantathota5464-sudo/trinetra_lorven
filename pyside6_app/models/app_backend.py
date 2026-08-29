"""
app_backend.py
Python QObject that exposes all application data and actions to QML via
Qt Properties, Signals, and Slots.
"""
from PySide6.QtCore import QObject, Property, Signal, Slot, QTimer
from PySide6.QtQml import QmlElement
from models.data_store import (
    INITIAL_CAMERAS, INITIAL_ALERTS, INITIAL_WATCHLIST,
    TRAFFIC_RULES, INITIAL_FEEDBACK, INITIAL_REPORTS,
    DETECTIONS_OVER_TIME, DETECTIONS_BY_VEHICLE_TYPE, DETECTIONS_BY_HOUR,
    RECENT_DETECTIONS, INITIAL_TIMELINE as ACTIVITY_TIMELINE, Camera, Alert, CitizenFeedback,
    WatchedVehicle
)
import datetime

QML_IMPORT_NAME = "trinethra.backend"
QML_IMPORT_MAJOR_VERSION = 1


class AppBackend(QObject):
    # ── Signals ──────────────────────────────────────────────────────────────
    toastMessage = Signal(str, str, arguments=["message", "type"])
    navigationChanged = Signal(str, arguments=["route"])
    clockTick = Signal(str, str, arguments=["time", "date"])

    def __init__(self, parent=None):
        super().__init__(parent)
        self._cameras = list(INITIAL_CAMERAS)
        self._alerts = list(INITIAL_ALERTS)
        self._watchlist = list(INITIAL_WATCHLIST)
        self._rules = list(TRAFFIC_RULES)
        self._feedback = list(INITIAL_FEEDBACK)
        self._reports = list(INITIAL_REPORTS)

        # Clock
        self._clock_timer = QTimer(self)
        self._clock_timer.timeout.connect(self._emit_clock)
        self._clock_timer.start(1000)

    def _emit_clock(self):
        now = datetime.datetime.now()
        time_str = now.strftime("%I:%M:%S %p")
        date_str = now.strftime("%a, %d %b %Y")
        self.clockTick.emit(time_str, date_str)

    # ── Camera Data ───────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getCameras(self):
        return [
            {
                "id": c.id,
                "location": c.location,
                "status": c.status,
                "type": c.type,
                "uptime": c.uptime,
                "lastSeen": c.lastSeen,
                "ip": c.ip,
                "resolution": c.resolution,
                "sector": c.sector,
            }
            for c in self._cameras
        ]

    @Slot(result="QVariantList")
    def getCameraStats(self):
        total = len(self._cameras)
        online = sum(1 for c in self._cameras if c.status == "Online")
        offline = sum(1 for c in self._cameras if c.status == "Offline")
        maintenance = sum(1 for c in self._cameras if c.status == "Maintenance")
        ptz = sum(1 for c in self._cameras if c.type == "PTZ")
        return [
            {"label": "TOTAL CAMERAS", "value": str(total), "sub": "All deployed nodes", "color": "#0C2540", "icon": "📹"},
            {"label": "ONLINE", "value": str(online), "sub": "Operational", "color": "#059669", "icon": "✅"},
            {"label": "OFFLINE", "value": str(offline), "sub": "Down / unreachable", "color": "#DC2626", "icon": "⛔"},
            {"label": "MAINTENANCE", "value": str(maintenance), "sub": "Scheduled service", "color": "#D97706", "icon": "🔧"},
            {"label": "PTZ CAMERAS", "value": str(ptz), "sub": "Pan-tilt-zoom units", "color": "#7C3AED", "icon": "🎯"},
        ]

    # ── Alert Data ─────────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getAlerts(self):
        return [
            {
                "id": a.id,
                "type": a.type,
                "plateNumber": a.plateNumber,
                "location": a.location,
                "timestamp": a.timestamp,
                "severity": a.severity,
                "status": a.status,
                "vehicleColor": a.vehicleColor,
                "vehicleMake": a.vehicleMake,
                "speed": a.speed,
                "cameraId": a.cameraId,
            }
            for a in self._alerts
        ]

    @Slot(result="QVariantList")
    def getAlertStats(self):
        total = len(self._alerts)
        active = sum(1 for a in self._alerts if a.status == "Active")
        fined = sum(1 for a in self._alerts if a.status == "Fined")
        stolen = sum(1 for a in self._alerts if a.type == "Stolen Vehicle")
        cloned = sum(1 for a in self._alerts if a.type == "Cloned Plate")
        return [
            {"label": "TOTAL ALERTS", "value": str(total), "color": "#0C2540"},
            {"label": "ACTIVE", "value": str(active), "color": "#DC2626"},
            {"label": "FINED", "value": str(fined), "color": "#D97706"},
            {"label": "STOLEN", "value": str(stolen), "color": "#7C3AED"},
            {"label": "CLONED", "value": str(cloned), "color": "#059669"},
        ]

    # ── Dashboard Data ──────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getDashboardKpis(self):
        return [
            {"label": "TOTAL CAMERAS", "value": "1,284", "sub": "+6.2% compared to last 24h", "color": "#0C2540", "icon": "📹", "trend": "up"},
            {"label": "ACTIVE CAMERAS", "value": "1,042", "sub": "81% of total cameras", "color": "#0C2540", "icon": "⚡", "trend": "up", "progress": 81, "badge": "Online"},
            {"label": "ACTIVE ALERTS", "value": "21", "sub": "Requires immediate attention", "color": "#DC2626", "icon": "⚠️", "trend": "up"},
            {"label": "TOTAL DETECTIONS (24H)", "value": "12,846", "sub": "+8.4% in last 24 hours", "color": "#0C2540", "icon": "📊", "trend": "up"},
        ]

    @Slot(result="QVariantList")
    def getRecentDetections(self):
        return [
            {
                "plate": d.plate,
                "confidence": d.confidence,
                "vehicle": d.vehicle,
                "color": d.color,
                "timestamp": d.timestamp,
            }
            for d in RECENT_DETECTIONS
        ]

    @Slot(result="QVariantList")
    def getActivityTimeline(self):
        return [
            {
                "id": t.id,
                "type": t.type,
                "severity": t.severity,
                "description": t.description,
                "location": t.location,
                "timestamp": t.timestamp,
                "operator": t.operator,
            }
            for t in ACTIVITY_TIMELINE
        ]

    # ── Watchlist Data ──────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getWatchlist(self):
        return [
            {
                "id": v.id,
                "plateNumber": v.plateNumber,
                "type": v.type,
                "brand": v.brand,
                "color": v.color,
                "ownerName": v.ownerName,
                "dateAdded": v.dateAdded,
                "status": v.status,
                "priority": v.priority,
            }
            for v in self._watchlist
        ]

    # ── Traffic Rules ───────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getTrafficRules(self):
        return [
            {
                "id": r.id,
                "section": r.section,
                "title": r.title,
                "description": r.description,
                "fineFirst": r.fineFirst,
                "fineSecond": r.fineSecond,
                "demeritPoints": r.demeritPoints,
                "category": r.category,
                "vehicleTypes": r.vehicleTypes,
            }
            for r in self._rules
        ]

    # ── Citizen Feedback ────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getFeedback(self):
        return [
            {
                "id": f.id,
                "category": f.category,
                "location": f.location,
                "citizenName": f.citizenName,
                "citizenPhone": f.citizenPhone,
                "description": f.description,
                "severity": f.severity,
                "status": f.status,
                "timestamp": f.timestamp,
                "upvotes": f.upvotes,
                "officerNote": f.officerNote if f.officerNote else "",
            }
            for f in self._feedback
        ]

    # ── Reports ─────────────────────────────────────────────────────────────────
    @Slot(result="QVariantList")
    def getReports(self):
        return [
            {
                "id": r.id,
                "name": r.name,
                "type": r.type,
                "location": r.location,
                "dateRange": r.dateRange,
                "summary": r.summary,
                "generatedOn": r.generatedOn,
            }
            for r in self._reports
        ]

    @Slot(result="QVariantList")
    def getDetectionsOverTime(self):
        return [{"day": d["day"], "detections": d["detections"]} for d in DETECTIONS_OVER_TIME]

    @Slot(result="QVariantList")
    def getDetectionsByVehicleType(self):
        return list(DETECTIONS_BY_VEHICLE_TYPE)

    @Slot(result="QVariantList")
    def getDetectionsByHour(self):
        return list(DETECTIONS_BY_HOUR)

    # ── Actions ─────────────────────────────────────────────────────────────────
    @Slot(str, str, str, str, str, str)
    def submitFeedback(self, category, location, name, phone, description, severity):
        new_fb = CitizenFeedback(
            f"FB-2026-{9000 + len(self._feedback)}",
            category, location, name or "Anonymous", phone or "N/A",
            description, severity, "New", "Just now", 1
        )
        self._feedback.insert(0, new_fb)
        self.toastMessage.emit("Citizen ticket registered and dispatched to patrol.", "success")

    @Slot(str, result="bool")
    def resolveAlert(self, alert_id):
        for a in self._alerts:
            if a.id == alert_id:
                a.status = "Resolved"
                self.toastMessage.emit(f"Alert {alert_id} marked as resolved.", "success")
                return True
        return False

    # ── Navigation ────────────────────────────────────────────────────────
    routeChanged = Signal(str)
    @Property(str, notify=routeChanged)
    def currentRoute(self):
        return getattr(self, "_current_route", "dashboard")

    @Slot(str)
    def navigate(self, route):
        # Update current route property
        self._current_route = route
        self.routeChanged.emit(route)
        # Emit navigationChanged for page loader
        self.navigationChanged.emit(route)
