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
INITIAL_CAMERAS = [
    Camera('CAM-1024', 'CAM-1024', 'Main St & 5th Ave', 'Online', 'PTZ', '08:19:23 AM, 18 Aug, 2026', 99.8, 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-0785', 'CAM-0785', 'I-9 Overpass', 'Online', 'Fixed', '08:19:18 AM, 18 Aug, 2026', 100.0, 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-0456', 'CAM-0456', 'Harbor Rd Exit', 'Offline', 'Fixed', '2d 4h ago', 0.0, 'https://images.unsplash.com/photo-1519003722824-192d992a605e?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-0932', 'CAM-0932', 'City Center Parking', 'Maintenance', 'Dome', '1h 12m ago', 98.1, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-1120', 'CAM-1120', 'Junction 9', 'Online', 'PTZ', '08:19:10 AM, 18 Aug, 2026', 99.6, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-0633', 'CAM-0633', 'Riverside Park', 'Online', 'Fixed', '08:19:05 AM, 18 Aug, 2026', 99.9, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-1281', 'CAM-1281', 'Ring Road', 'Online', 'PTZ', '08:19:00 AM, 18 Aug, 2026', 99.4, 'https://images.unsplash.com/photo-1494976388531-d1058094e2fd?w=120&auto=format&fit=crop&q=60'),
    Camera('CAM-1102', 'CAM-1102', 'West Entrance', 'Online', 'Fixed', '08:18:55 AM, 18 Aug, 2026', 99.5, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'),
]

# 2. Alerts
INITIAL_ALERTS = [
    Alert('ALT-2026-0818-001', 'Fine Issued', 'AP09 AB 1234', 'Hyundai', 'i20', 'White', 'Hatchback', 'Main St & 5th Ave', 'CAM-1024', '18 Aug 2026, 08:19 AM', 'Unpaid', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'),
    Alert('STL-2026-0818-002', 'Stolen Vehicle', 'TS07 CD 5678', 'Maruti', 'Swift', 'Red', 'Hatchback', 'I-9 Overpass', 'CAM-0785', '18 Aug 2026, 08:17 AM', 'Active', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'),
    Alert('CLN-2026-0818-003', 'Cloned Vehicle', 'AP16 EF 9012', 'Pulsar', 'NS200', 'Black', 'Motorcycle', 'Harbor Rd Exit', 'CAM-0456', '18 Aug 2026, 08:16 AM', 'Under Review', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
    Alert('ALT-2026-0818-004', 'Speed Violation', 'AP39 GH 3456', 'Maruti', 'Brezza', 'Silver', 'SUV', 'Riverside Park', 'CAM-0633', '18 Aug 2026, 08:15 AM', 'Pending', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'),
    Alert('ALT-2026-0818-005', 'No Helmet', 'TS08 IJ 7890', 'Honda', 'Activa', 'Blue', 'Scooter', '5th Avenue', 'CAM-1201', '18 Aug 2026, 08:14 AM', 'Pending', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
    Alert('STL-2026-0818-006', 'Stolen Vehicle', 'AP11 KL 4321', 'Royal Enfield', 'Bullet', 'Black', 'Motorcycle', 'City Center Parking', 'CAM-0932', '18 Aug 2026, 08:12 AM', 'Active', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
]

# 3. Watchlist
INITIAL_WATCHLIST = [
    WatchedVehicle('W-001', 'AP09 AB 1234', 'Stolen', 'Hyundai i20 Sportz', 'White', '18 Aug 2026, 08:19 AM', 'Ravi Kumar (Investigator)', 'Main St & 5th Ave (CAM-1024)', 'Active', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'),
    WatchedVehicle('W-002', 'TS07 CD 5678', 'Stolen', 'Maruti Swift VXI', 'Red', '18 Aug 2026, 08:17 AM', 'Sneha Patel (Analyst)', 'I-9 Overpass (CAM-0785)', 'Active', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'),
    WatchedVehicle('W-003', 'AP16 EF 9012', 'Cloned', 'Bajaj Pulsar NS200', 'Black', '18 Aug 2026, 08:16 AM', 'Arjun Mehta (Analyst)', 'Harbor Rd Exit (CAM-0456)', 'Active', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
    WatchedVehicle('W-004', 'AP39 GH 3456', 'Cloned', 'Maruti Brezza ZXI', 'Silver', '18 Aug 2026, 08:15 AM', 'Neha Gupta (Analyst)', 'Riverside Park (CAM-0633)', 'Active', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'),
    WatchedVehicle('W-005', 'TS08 IJ 7890', 'Stolen', 'Honda Activa 6G', 'Blue', '18 Aug 2026, 08:14 AM', 'Ravi Kumar (Investigator)', '5th Avenue (CAM-1201)', 'Active', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
]

# 4. Timeline Events
INITIAL_TIMELINE = [
    TimelineEvent('T-001', 'Critical', '08:18 AM', 'Hit-and-run reported near 5th Ave & Pine St (CAM-104)', 'Operator Ravi Kumar'),
    TimelineEvent('T-002', 'Warning', '08:16 AM', 'Heavy congestion detected on I-9 Overpass', 'System'),
    TimelineEvent('T-003', 'Resolved', '08:13 AM', 'Stalled vehicle cleared on Harbor Rd', 'Operator Sunita Devi'),
    TimelineEvent('T-004', 'Info', '08:10 AM', 'Operator Ravi Kumar logged in', 'Activity Type: Login'),
]

# 5. Recent Detections
RECENT_DETECTIONS = [
    RecentDetection('RD-001', 'AP09 AB 1234', 98, '08:18 AM', 'Car', 'Main St & 5th Ave', 'CAM-1024', 'White • Hyundai i20', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'),
    RecentDetection('RD-002', 'TS07 CD 5678', 96, '08:17 AM', 'SUV', '5th Avenue', 'CAM-1024', 'Black • Mahindra XUV700', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'),
    RecentDetection('RD-003', 'AP16 EF 9012', 93, '08:16 AM', 'Bike', 'Riverfront Road', 'CAM-0456', 'Red • Pulsar NS200', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'),
    RecentDetection('RD-004', 'AP39 GH 3456', 92, '08:15 AM', 'Car', 'Junction 9 • Overpass', 'CAM-0633', 'Silver • Maruti Swift', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'),
    RecentDetection('RD-005', 'TS08 IJ 7890', 90, '08:14 AM', 'Van', 'City Center', 'CAM-0932', 'White • Force Traveller', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=120&auto=format&fit=crop&q=60'),
]

# 6. Reports
INITIAL_REPORTS = [
    ReportItem('R-001', 'Daily Detection Report', 'Detection', 'Bhimavaram', '11 May 2025 - 17 May 2025', '17 May 2025, 09:15 AM', '18,745 detections'),
    ReportItem('R-002', 'Alert Summary Report', 'Alerts', 'Bhimavaram', '11 May 2025 - 17 May 2025', '17 May 2025, 09:10 AM', '86 active alerts'),
    ReportItem('R-003', 'Violation Report', 'Violation', 'Bhimavaram', '11 May 2025 - 17 May 2025', '17 May 2025, 09:05 AM', '312 violations'),
]

# 7. Traffic Rules
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
INITIAL_FEEDBACK = [
    CitizenFeedback('FB-2026-8812', 'Signal Malfunction', 'Outer Ring Road - Hebbal Junction, Pole #C-04', 'Rahul Verma', '+91 98451 23410', 'Traffic signal stuck on green for north corridor creating dangerous deadlock with intersecting traffic.', 'Urgent', 'Under Investigation', '10 mins ago', 24, 'Traffic Patrol Unit 4 dispatched for manual junction control and signal reset.'),
    CitizenFeedback('FB-2026-8809', 'Road Hazard', 'NH-44 Flyover Entry, KM 28.4', 'Ananya Deshmukh', '+91 97120 44589', 'Large oil spill and gravel debris scattered across lane 2 after heavy truck breakdown. Two-wheelers skidding.', 'Urgent', 'Action Taken', '45 mins ago', 42, 'Highway maintenance vehicle deployed with absorbent sand and warning cones.'),
    CitizenFeedback('FB-2026-8795', 'Traffic Congestion', 'Tech Park Gate 3 - Central Avenue', 'Vikram Sundaram', '+91 94432 99011', 'Illegal roadside parking of private cabs blocking entire left lane during evening peak hours.', 'Medium', 'New', '2 hours ago', 15),
    CitizenFeedback('FB-2026-8780', 'Suggestion', 'Silk Board Interchange Corridor', 'Pooja Hegde', '+91 98860 12388', 'Recommend extending right-turn green signal timing by 15 seconds during 8:30 AM to 10:30 AM morning rush.', 'Low', 'Resolved', 'Yesterday', 68, 'Signal timing optimization algorithm adjusted. Peak throughput improved by 18%.'),
]

# 9. Chart Datasets
DETECTIONS_OVER_TIME = [
    {'day': '11 May', 'detections': 2100},
    {'day': '12 May', 'detections': 2800},
    {'day': '13 May', 'detections': 2600},
    {'day': '14 May', 'detections': 3400},
    {'day': '15 May', 'detections': 2900},
    {'day': '16 May', 'detections': 3000},
    {'day': '17 May', 'detections': 2000},
]

DETECTIONS_BY_VEHICLE_TYPE = [
    {'name': 'Car', 'value': 9245, 'color': '#3B82F6'},
    {'name': 'Bike', 'value': 5642, 'color': '#10B981'},
    {'name': 'Truck', 'value': 2156, 'color': '#F59E0B'},
    {'name': 'Bus', 'value': 890, 'color': '#8B5CF6'},
    {'name': 'Other', 'value': 812, 'color': '#6B7280'},
]

DETECTIONS_BY_HOUR = [
    {'hour': '00:00', 'value': 250},
    {'hour': '02:00', 'value': 120},
    {'hour': '04:00', 'value': 380},
    {'hour': '06:00', 'value': 950},
    {'hour': '08:00', 'value': 2400},
    {'hour': '10:00', 'value': 3100},
    {'hour': '12:00', 'value': 3600},
    {'hour': '14:00', 'value': 2900},
    {'hour': '16:00', 'value': 2500},
    {'hour': '18:00', 'value': 1800},
    {'hour': '20:00', 'value': 1100},
    {'hour': '22:00', 'value': 550},
]
