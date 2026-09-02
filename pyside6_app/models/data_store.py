# TRINETHRA Intelligent Traffic Monitoring & Enforcement System - Data Store
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
    thumbnail: str = ""

@dataclass
class Alert:
    id: str
    type: str  # 'Fine Issued', 'Stolen Vehicle', 'Cloned Vehicle', 'Speed Violation', 'No Helmet'
    plateNumber: str
    brand: str
    model: str
    color: str
    vtype: str
    location: str
    camera: str
    timeDate: str
    status: str  # 'Unpaid', 'Active', 'Under Review', 'Pending', 'Resolved'
    image: str = ""

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
    status: str  # 'Active', 'Flagged', 'Resolved'
    image: str = ""

@dataclass
class TimelineEvent:
    id: str
    severity: str  # 'Critical', 'Warning', 'Resolved', 'Info'
    time: str
    message: str
    reportedBy: str

@dataclass
class RecentDetection:
    id: str
    plateNumber: str
    confidence: int
    time: str
    vehicleClass: str
    location: str
    camera: str
    details: str
    image: str = ""

@dataclass
class ReportItem:
    id: str
    name: str
    type: str  # 'Detection', 'Alerts', 'Violation'
    location: str
    dateRange: str
    generatedOn: str
    summary: str

@dataclass
class TrafficRule:
    id: str
    section: str
    title: str
    category: str  # 'Speed', 'Safety', 'Signal', 'Documents', 'Commercial'
    description: str
    fineFirst: str
    fineSecond: str
    demeritPoints: int
    vehicleTypes: List[str]

@dataclass
class CitizenFeedback:
    id: str
    category: str  # 'Signal Malfunction', 'Traffic Congestion', 'Road Hazard', 'Reckless Driving', 'Suggestion'
    location: str
    citizenName: str
    citizenPhone: str
    description: str
    severity: str  # 'Urgent', 'Medium', 'Low'
    status: str    # 'New', 'Under Investigation', 'Action Taken', 'Resolved'
    timestamp: str
    upvotes: int
    officerNote: str = ""

# 1. Cameras
INITIAL_CAMERAS: List[Camera] = []

# 2. Alerts
INITIAL_ALERTS: List[Alert] = []

# 3. Watchlist
INITIAL_WATCHLIST: List[WatchedVehicle] = []

# 4. Timeline Events
INITIAL_TIMELINE: List[TimelineEvent] = []

# 5. Recent Detections
RECENT_DETECTIONS: List[RecentDetection] = []

# 6. Reports
INITIAL_REPORTS: List[ReportItem] = []

# 7. Traffic Rules (Statutory Motor Vehicle Act rules)
TRAFFIC_RULES = [
    TrafficRule('R-101', 'Section 183(1)', 'Overspeeding (Exceeding Limit by >20 km/h)', 'Speed', 'Driving at speed exceeding the prescribed limit on designated national highways or expressways.', '₹2,000 (LMV) / ₹4,000 (HMV)', '₹4,000 + License Suspension', 3, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-102', 'Section 184', 'Dangerous Driving & Jumping Red Light', 'Signal', 'Crossing stop line during red signal phase or weaving erratically across lanes creating hazard.', '₹5,000', '₹10,000 + 6 Months Imprisonment', 4, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-103', 'Section 194B', 'Not Wearing Seatbelt (Driver & Passengers)', 'Safety', 'Operating passenger vehicle without mandatory 3-point seatbelt fastened for front and rear occupants.', '₹1,000', '₹1,000 per violation', 1, ['Car', 'Commercial']),
    TrafficRule('R-104', 'Section 194D', 'Riding Without BIS Approved Helmet', 'Safety', 'Operating two-wheeler without standard ISI/BIS certified safety helmet for rider or pillion.', '₹1,000 + 3 Months License Disqualification', '₹1,000 + Impoundment', 2, ['Bike']),
    TrafficRule('R-105', 'Section 194E', 'Blocking Emergency Vehicles (Ambulance / Fire)', 'Safety', 'Failure to pull over to left side and yield right of way to approaching emergency sirens.', '₹10,000 + Up to 6 Months Imprisonment', '₹10,000 + Compounding Court Notice', 5, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-106', 'Section 185', 'Driving Under Influence of Alcohol / Narcotics', 'Safety', 'Blood Alcohol Content (BAC) exceeding 30mg per 100ml of blood detected via breath analyzer.', '₹10,000 and/or 6 Months Jail', '₹15,000 and/or 2 Years Jail', 6, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-107', 'Section 181', 'Driving Without Valid Driving License', 'Documents', 'Operating motor vehicle without possessing an active, category-appropriate driving license.', '₹5,000', '₹5,000 + Vehicle Seizure', 3, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-108', 'Section 194A', 'Overloading Passenger Capacity / Pillion Riding', 'Commercial', 'Carrying more passengers than permitted in registration certificate or triple riding on two-wheeler.', '₹1,000 per excess passenger', '₹1,000 per passenger + Permit Review', 2, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-109', 'Section 190(2)', 'Using Mobile Phone While Driving', 'Safety', 'Holding or operating handheld telecommunication devices while in motion or stationary in traffic lane.', '₹5,000', '₹10,000', 3, ['Car', 'Commercial', 'Bike']),
    TrafficRule('R-110', 'Section 192A', 'Operating Without Fitness / Valid PUC Certificate', 'Documents', 'Vehicle operating without updated Pollution Under Control (PUC) certificate or commercial fitness.', '₹10,000', '₹10,000 + RC Suspension', 2, ['Car', 'Commercial', 'Bike']),
]

# 8. Citizen Feedback
INITIAL_FEEDBACK: List[CitizenFeedback] = []

# 9. Chart Datasets
DETECTIONS_OVER_TIME: List[Dict[str, Any]] = []
DETECTIONS_BY_VEHICLE_TYPE: List[Dict[str, Any]] = []
DETECTIONS_BY_HOUR: List[Dict[str, Any]] = []
