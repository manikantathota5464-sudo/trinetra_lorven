// TRINETHRA Intelligent Traffic Monitoring & Enforcement System - Mock Data Layer

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  type: 'PTZ' | 'Fixed' | 'Dome';
  lastSeen: string;
  uptime: number; // percentage
  thumbnail: string;
}

export interface Alert {
  id: string;
  type: 'Fine Issued' | 'Stolen Vehicle' | 'Cloned Vehicle' | 'Speed Violation' | 'No Helmet';
  plateNumber: string;
  vehicleDetails: {
    brand: string;
    model: string;
    color: string;
    type: string;
    image: string;
  };
  location: string;
  camera: string;
  timeDate: string;
  status: 'Unpaid' | 'Active' | 'Under Review' | 'Pending' | 'Resolved';
}

export interface WatchedVehicle {
  id: string;
  plateNumber: string;
  watchType: 'Stolen' | 'Cloned';
  brandModel: string;
  color: string;
  addedOn: string;
  addedBy: string;
  locationAdded: string;
  status: 'Active' | 'Flagged' | 'Resolved';
  image: string;
}

export interface TimelineEvent {
  id: string;
  severity: 'Critical' | 'Warning' | 'Resolved' | 'Info';
  time: string;
  message: string;
  reportedBy: string;
}

export interface ReportItem {
  id: string;
  name: string;
  type: 'Detection' | 'Alerts' | 'Violation';
  location: string;
  dateRange: string;
  generatedOn: string;
  summary: string;
}

// 1. Initial Cameras list (Screenshot 3)
export const initialCameras: Camera[] = [
  {
    id: 'CAM-1024',
    name: 'CAM-1024',
    location: 'Main St & 5th Ave',
    status: 'Online',
    type: 'PTZ',
    lastSeen: '08:19:23 AM, 18 Aug, 2026',
    uptime: 99.8,
    thumbnail: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-0785',
    name: 'CAM-0785',
    location: 'I-9 Overpass',
    status: 'Online',
    type: 'Fixed',
    lastSeen: '08:19:18 AM, 18 Aug, 2026',
    uptime: 100,
    thumbnail: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-0456',
    name: 'CAM-0456',
    location: 'Harbor Rd Exit',
    status: 'Offline',
    type: 'Fixed',
    lastSeen: '2d 4h ago',
    uptime: 0,
    thumbnail: 'https://images.unsplash.com/photo-1519003722824-192d992a605e?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-0932',
    name: 'CAM-0932',
    location: 'City Center Parking',
    status: 'Maintenance',
    type: 'Dome',
    lastSeen: '1h 12m ago',
    uptime: 98.1,
    thumbnail: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-1120',
    name: 'CAM-1120',
    location: 'Junction 9',
    status: 'Online',
    type: 'PTZ',
    lastSeen: '08:19:10 AM, 18 Aug, 2026',
    uptime: 99.6,
    thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-0633',
    name: 'CAM-0633',
    location: 'Riverside Park',
    status: 'Online',
    type: 'Fixed',
    lastSeen: '08:19:05 AM, 18 Aug, 2026',
    uptime: 99.9,
    thumbnail: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-1281',
    name: 'CAM-1281',
    location: 'Ring Road',
    status: 'Online',
    type: 'PTZ',
    lastSeen: '08:19:00 AM, 18 Aug, 2026',
    uptime: 99.4,
    thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058094e2fd?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'CAM-1102',
    name: 'CAM-1102',
    location: 'West Entrance',
    status: 'Online',
    type: 'Fixed',
    lastSeen: '08:18:55 AM, 18 Aug, 2026',
    uptime: 99.5,
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'
  }
];

// 2. Initial Alerts list (Screenshot 1)
export const initialAlerts: Alert[] = [
  {
    id: 'ALT-2026-0818-001',
    type: 'Fine Issued',
    plateNumber: 'AP09 AB 1234',
    vehicleDetails: {
      brand: 'Hyundai',
      model: 'i20',
      color: 'White',
      type: 'Hatchback',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
    },
    location: 'Main St & 5th Ave',
    camera: 'CAM-1024',
    timeDate: '18 Aug 2026, 08:19 AM',
    status: 'Unpaid'
  },
  {
    id: 'STL-2026-0818-002',
    type: 'Stolen Vehicle',
    plateNumber: 'TS07 CD 5678',
    vehicleDetails: {
      brand: 'Maruti',
      model: 'Swift',
      color: 'Red',
      type: 'Hatchback',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'
    },
    location: 'I-9 Overpass',
    camera: 'CAM-0785',
    timeDate: '18 Aug 2026, 08:17 AM',
    status: 'Active'
  },
  {
    id: 'CLN-2026-0818-003',
    type: 'Cloned Vehicle',
    plateNumber: 'AP16 EF 9012',
    vehicleDetails: {
      brand: 'Pulsar',
      model: 'NS200',
      color: 'Black',
      type: 'Motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
    },
    location: 'Harbor Rd Exit',
    camera: 'CAM-0456',
    timeDate: '18 Aug 2026, 08:16 AM',
    status: 'Under Review'
  },
  {
    id: 'ALT-2026-0818-004',
    type: 'Speed Violation',
    plateNumber: 'AP39 GH 3456',
    vehicleDetails: {
      brand: 'Maruti',
      model: 'Brezza',
      color: 'Silver',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'
    },
    location: 'Riverside Park',
    camera: 'CAM-0633',
    timeDate: '18 Aug 2026, 08:15 AM',
    status: 'Pending'
  },
  {
    id: 'ALT-2026-0818-005',
    type: 'No Helmet',
    plateNumber: 'TS08 IJ 7890',
    vehicleDetails: {
      brand: 'Honda',
      model: 'Activa',
      color: 'Blue',
      type: 'Scooter',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
    },
    location: '5th Avenue',
    camera: 'CAM-1201',
    timeDate: '18 Aug 2026, 08:14 AM',
    status: 'Pending'
  },
  {
    id: 'STL-2026-0818-006',
    type: 'Stolen Vehicle',
    plateNumber: 'AP11 KL 4321',
    vehicleDetails: {
      brand: 'Royal Enfield',
      model: 'Bullet',
      color: 'Black',
      type: 'Motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
    },
    location: 'City Center Parking',
    camera: 'CAM-0932',
    timeDate: '18 Aug 2026, 08:12 AM',
    status: 'Active'
  }
];

// 3. Initial Watched Vehicles list (Screenshot 9)
export const initialWatchList: WatchedVehicle[] = [
  {
    id: 'W-001',
    plateNumber: 'AP09 AB 1234',
    watchType: 'Stolen',
    brandModel: 'Hyundai i20 Sportz',
    color: 'White',
    addedOn: '18 Aug 2026, 08:19 AM',
    addedBy: 'Ravi Kumar (Investigator)',
    locationAdded: 'Main St & 5th Ave (CAM-1024)',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'W-002',
    plateNumber: 'TS07 CD 5678',
    watchType: 'Stolen',
    brandModel: 'Maruti Swift VXI',
    color: 'Red',
    addedOn: '18 Aug 2026, 08:17 AM',
    addedBy: 'Sneha Patel (Analyst)',
    locationAdded: 'I-9 Overpass (CAM-0785)',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'W-003',
    plateNumber: 'AP16 EF 9012',
    watchType: 'Cloned',
    brandModel: 'Bajaj Pulsar NS200',
    color: 'Black',
    addedOn: '18 Aug 2026, 08:16 AM',
    addedBy: 'Arjun Mehta (Analyst)',
    locationAdded: 'Harbor Rd Exit (CAM-0456)',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'W-004',
    plateNumber: 'AP39 GH 3456',
    watchType: 'Cloned',
    brandModel: 'Maruti Brezza ZXI',
    color: 'Silver',
    addedOn: '18 Aug 2026, 08:15 AM',
    addedBy: 'Neha Gupta (Analyst)',
    locationAdded: 'Riverside Park (CAM-0633)',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'W-005',
    plateNumber: 'TS08 IJ 7890',
    watchType: 'Stolen',
    brandModel: 'Honda Activa 6G',
    color: 'Blue',
    addedOn: '18 Aug 2026, 08:14 AM',
    addedBy: 'Ravi Kumar (Investigator)',
    locationAdded: '5th Avenue (CAM-1201)',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
  }
];

// 4. Initial Timeline Events list (Screenshot 4)
export const initialTimelineEvents: TimelineEvent[] = [
  {
    id: 'T-001',
    severity: 'Critical',
    time: '08:18 AM',
    message: 'Hit-and-run reported near 5th Ave & Pine St (CAM-104)',
    reportedBy: 'Operator Ravi Kumar'
  },
  {
    id: 'T-002',
    severity: 'Warning',
    time: '08:16 AM',
    message: 'Heavy congestion detected on I-9 Overpass',
    reportedBy: 'System'
  },
  {
    id: 'T-003',
    severity: 'Resolved',
    time: '08:13 AM',
    message: 'Stalled vehicle cleared on Harbor Rd',
    reportedBy: 'Operator Sunita Devi'
  },
  {
    id: 'T-004',
    severity: 'Info',
    time: '08:10 AM',
    message: 'Operator Ravi Kumar logged in',
    reportedBy: 'Activity Type: Login'
  }
];

// 5. Initial Reports list (Screenshot 7)
export const initialReports: ReportItem[] = [
  {
    id: 'R-001',
    name: 'Daily Detection Report',
    type: 'Detection',
    location: 'Bhimavaram',
    dateRange: '11 May 2025 - 17 May 2025',
    generatedOn: '17 May 2025, 09:15 AM',
    summary: '18,745 detections'
  },
  {
    id: 'R-002',
    name: 'Alert Summary Report',
    type: 'Alerts',
    location: 'Bhimavaram',
    dateRange: '11 May 2025 - 17 May 2025',
    generatedOn: '17 May 2025, 09:10 AM',
    summary: '86 active alerts'
  },
  {
    id: 'R-003',
    name: 'Violation Report',
    type: 'Violation',
    location: 'Bhimavaram',
    dateRange: '11 May 2025 - 17 May 2025',
    generatedOn: '17 May 2025, 09:05 AM',
    summary: '312 violations'
  }
];

// 6. Recent Detections for Dashboard list (Screenshot 4)
export interface RecentDetection {
  id: string;
  plateNumber: string;
  confidence: number;
  time: string;
  vehicleClass: string;
  location: string;
  camera: string;
  details: string;
  image: string;
}

export const recentDetections: RecentDetection[] = [
  {
    id: 'RD-001',
    plateNumber: 'AP09 AB 1234',
    confidence: 98,
    time: '08:18 AM',
    vehicleClass: 'Car',
    location: 'Main St & 5th Ave',
    camera: 'CAM-1024',
    details: 'White • Hyundai i20',
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'RD-002',
    plateNumber: 'TS07 CD 5678',
    confidence: 96,
    time: '08:17 AM',
    vehicleClass: 'SUV',
    location: '5th Avenue',
    camera: 'CAM-1024',
    details: 'Black • Mahindra XUV700',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'RD-003',
    plateNumber: 'AP16 EF 9012',
    confidence: 93,
    time: '08:16 AM',
    vehicleClass: 'Bike',
    location: 'Riverfront Road',
    camera: 'CAM-0456',
    details: 'Red • Pulsar NS200',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'RD-004',
    plateNumber: 'AP39 GH 3456',
    confidence: 92,
    time: '08:15 AM',
    vehicleClass: 'Car',
    location: 'Junction 9 • Overpass',
    camera: 'CAM-0633',
    details: 'Silver • Maruti Swift',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'RD-005',
    plateNumber: 'TS08 IJ 7890',
    confidence: 90,
    time: '08:14 AM',
    vehicleClass: 'Van',
    location: 'City Center',
    camera: 'CAM-0932',
    details: 'White • Force Traveller',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=120&auto=format&fit=crop&q=60'
  }
];

// Reports Data (Charts)
export const detectionsOverTime = [
  { day: '11 May', detections: 2100 },
  { day: '12 May', detections: 2800 },
  { day: '13 May', detections: 2600 },
  { day: '14 May', detections: 3400 },
  { day: '15 May', detections: 2900 },
  { day: '16 May', detections: 3000 },
  { day: '17 May', detections: 2000 },
];

export const detectionsByVehicleType = [
  { name: 'Car', value: 9245, color: '#3B82F6' },
  { name: 'Bike', value: 5642, color: '#10B981' },
  { name: 'Truck', value: 2156, color: '#F59E0B' },
  { name: 'Bus', value: 890, color: '#8B5CF6' },
  { name: 'Other', value: 812, color: '#6B7280' },
];

export const detectionsByHour = [
  { hour: '00:00', value: 250 },
  { hour: '02:00', value: 120 },
  { hour: '04:00', value: 380 },
  { hour: '06:00', value: 950 },
  { hour: '08:00', value: 2400 },
  { hour: '10:00', value: 3100 },
  { hour: '12:00', value: 3600 }, // Peak hour (11:00 AM)
  { hour: '14:00', value: 2900 },
  { hour: '16:00', value: 2500 },
  { hour: '18:00', value: 1800 },
  { hour: '20:00', value: 1100 },
  { hour: '22:00', value: 550 },
];
