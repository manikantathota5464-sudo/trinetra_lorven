from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class Camera:
    id: str
    name: str
    location: str
    status: str  # 'Online', 'Offline', 'Maintenance'
    type: str    # 'PTZ', 'Fixed', 'Dome'
    lastSeen: str
    uptime: float

@dataclass
class Alert:
    id: str
    type: str
    plateNumber: str
    brand: str
    model: str
    color: str
    location: str
    camera: str
    timeDate: str
    status: str  # 'Active', 'Pending', 'Resolved'

@dataclass
class WatchedVehicle:
    id: str
    plateNumber: str
    watchType: str  # 'Stolen', 'Cloned'
    brandModel: str
    color: str
    addedOn: str
    addedBy: str
    locationAdded: str
    status: str

@dataclass
class TimelineEvent:
    id: str
    severity: str  # 'Critical', 'Warning', 'Resolved', 'Info'
    time: str
    message: str
    reportedBy: str

@dataclass
class DetectionItem:
    id: str
    plate: str
    confidence: int
    speed: int
    camera: str
    time: str
    matched: bool
    status: str

@dataclass
class TrafficRule:
    id: str
    section: str
    title: str
    category: str
    description: str
    fineFirst: str
    fineSecond: str
    demeritPoints: int
    vehicleTypes: List[str]

@dataclass
class CitizenFeedback:
    id: str
    category: str
    location: str
    citizenName: str
    citizenPhone: str
    description: str
    severity: str
    status: str
    timestamp: str
    upvotes: int
    officerNote: str = ""

# Initial Data
INITIAL_CAMERAS = [
    Camera("CAM-1024", "CAM-1024", "Main St & 5th Ave", "Online", "PTZ", "08:19:23 AM, Today", 99.8),
    Camera("CAM-0785", "CAM-0785", "I-9 Overpass", "Online", "Fixed", "08:19:18 AM, Today", 100.0),
    Camera("CAM-0456", "CAM-0456", "Harbor Rd Exit", "Offline", "Fixed", "2d 4h ago", 0.0),
    Camera("CAM-0932", "CAM-0932", "City Center Parking", "Maintenance", "Dome", "1h 12m ago", 84.5),
    Camera("CAM-0112", "CAM-0112", "Express Highway Toll Gate", "Online", "PTZ", "08:19:15 AM, Today", 99.9),
    Camera("CAM-0334", "CAM-0334", "Ring Road Junction 4", "Online", "Fixed", "08:19:10 AM, Today", 98.4),
]

INITIAL_ALERTS = [
    Alert("ALT-2026-9041", "Stolen Vehicle", "DL-01-AB-1234", "Toyota", "Innova Crysta", "Silver", "Outer Ring Road - North", "CAM-1024", "10:14 AM", "Active"),
    Alert("ALT-2026-9038", "Speed Violation", "MH-12-DE-8899", "Hyundai", "Creta", "White", "Expressway Flyover KM 14", "CAM-0785", "09:55 AM", "Active"),
    Alert("ALT-2026-8972", "Cloned Vehicle", "KA-04-MB-5521", "Maruti", "Swift Dzire", "Midnight Blue", "Airport Terminal Rd", "CAM-0112", "08:30 AM", "Pending"),
    Alert("ALT-2026-8840", "No Helmet", "KA-01-XY-9002", "Honda", "Activa 6G", "Black", "City Center Circle", "CAM-0932", "07:15 AM", "Resolved"),
]

INITIAL_WATCHLIST = [
    WatchedVehicle("WV-01", "DL-01-AB-1234", "Stolen", "Toyota Innova", "Silver", "18 Aug 2026", "Sub-Inspector Sharma", "Outer Ring Road", "Active"),
    WatchedVehicle("WV-02", "KA-04-MB-5521", "Cloned", "Maruti Swift", "Midnight Blue", "17 Aug 2026", "Control Room Admin", "Airport Corridor", "Active"),
    WatchedVehicle("WV-03", "MH-02-CP-9011", "Stolen", "Mahindra Scorpio", "Black", "15 Aug 2026", "Highway Patrol 2", "Expressway Junction", "Flagged"),
]

INITIAL_TIMELINE = [
    TimelineEvent("T-01", "Critical", "10:14 AM", "Stolen vehicle detected on CAM-1024 (DL-01-AB-1234)", "System AI Engine"),
    TimelineEvent("T-02", "Warning", "09:55 AM", "Speed limit exceeded: 134 km/h in 80 zone by MH-12-DE-8899", "CAM-0785 Speed Radar"),
    TimelineEvent("T-03", "Info", "09:00 AM", "Morning shift traffic patrol initialized across 24 zones", "Admin User"),
    TimelineEvent("T-04", "Resolved", "08:15 AM", "Signal reset completed at City Center Junction", "Control Unit 1"),
]

RECENT_DETECTIONS = [
    DetectionItem("DET-1", "DL-01-AB-1234", 98, 74, "CAM-1024 (Main St)", "10:14:22 AM", True, "Stolen Vehicle"),
    DetectionItem("DET-2", "MH-12-DE-8899", 96, 134, "CAM-0785 (I-9 Overpass)", "09:55:10 AM", True, "Speed Violation"),
    DetectionItem("DET-3", "KA-05-JK-4412", 99, 58, "CAM-0112 (Toll Gate)", "09:42:05 AM", False, "Normal"),
    DetectionItem("DET-4", "TN-09-PQ-7721", 94, 62, "CAM-0334 (Ring Road)", "09:30:19 AM", False, "Normal"),
    DetectionItem("DET-5", "KA-04-MB-5521", 97, 68, "CAM-1024 (Main St)", "08:30:45 AM", True, "Cloned Vehicle"),
]

TRAFFIC_RULES = [
    TrafficRule("R-101", "Section 183(1)", "Overspeeding (>20 km/h over limit)", "Speed", "Driving above statutory speed limit on highway/expressway.", "₹2,000 (LMV) / ₹4,000 (HMV)", "₹4,000 + License Suspension", 3, ["Car", "Commercial", "Bike"]),
    TrafficRule("R-102", "Section 184", "Dangerous Driving & Red Light Jump", "Signal", "Jumping red signal or dangerous reckless driving.", "₹5,000", "₹10,000 + 6 Months Jail", 4, ["Car", "Commercial", "Bike"]),
    TrafficRule("R-103", "Section 194B", "Not Wearing Seatbelt (Front/Rear)", "Safety", "Operating vehicle without 3-point seatbelts fastened.", "₹1,000", "₹1,000 per violation", 1, ["Car", "Commercial"]),
    TrafficRule("R-104", "Section 194D", "Riding Without Helmet (ISI/BIS)", "Safety", "Riding two-wheeler without standard safety helmet.", "₹1,000 + 3 Months Disqualification", "₹1,000 + Impound", 2, ["Bike"]),
    TrafficRule("R-105", "Section 194E", "Blocking Emergency Vehicles", "Safety", "Failure to yield right of way to ambulance/fire brigade.", "₹10,000 + 6 Months Jail", "₹10,000 Notice", 5, ["Car", "Commercial", "Bike"]),
    TrafficRule("R-106", "Section 185", "Drunk Driving / Intoxication", "Safety", "Driving with BAC > 30mg per 100ml of blood.", "₹10,000 and/or 6 Months Jail", "₹15,000 and/or 2 Years Jail", 6, ["Car", "Commercial", "Bike"]),
    TrafficRule("R-107", "Section 181", "Driving Without Valid Driving License", "Documents", "Operating motor vehicle without active valid license.", "₹5,000", "₹5,000 + Seizure", 3, ["Car", "Commercial", "Bike"]),
    TrafficRule("R-108", "Section 190(2)", "Using Mobile Phone While Driving", "Safety", "Operating handheld mobile device while driving.", "₹5,000", "₹10,000", 3, ["Car", "Commercial", "Bike"]),
]

INITIAL_FEEDBACK = [
    CitizenFeedback("FB-2026-8812", "Signal Malfunction", "Outer Ring Road - Hebbal Junction", "Rahul Verma", "+91 98451 23410", "Traffic signal stuck on green creating deadlock with intersecting traffic.", "Urgent", "Under Investigation", "10 mins ago", 24, "Patrol Unit 4 dispatched for manual control."),
    CitizenFeedback("FB-2026-8809", "Road Hazard", "NH-44 Flyover Entry, KM 28.4", "Ananya Deshmukh", "+91 97120 44589", "Oil spill and gravel debris in lane 2 after heavy truck breakdown.", "Urgent", "Action Taken", "45 mins ago", 42, "Highway maintenance vehicle deployed with sand."),
    CitizenFeedback("FB-2026-8795", "Traffic Congestion", "Tech Park Gate 3 - Central Avenue", "Vikram Sundaram", "+91 94432 99011", "Illegal roadside parking blocking left lane during evening rush.", "Medium", "New", "2 hours ago", 15),
    CitizenFeedback("FB-2026-8780", "Suggestion", "Silk Board Interchange Corridor", "Pooja Hegde", "+91 98860 12388", "Recommend extending right-turn green signal by 15 seconds during morning rush.", "Low", "Resolved", "Yesterday", 68, "Signal timing optimized. Peak throughput improved by 18%."),
]
