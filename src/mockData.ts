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

// TRINETHRA Intelligent Traffic Monitoring & Enforcement System - Data Types & Empty States

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

// Live state defaults (No hardcoded mock data)
export const initialCameras: Camera[] = [];
export const initialAlerts: Alert[] = [];
export const initialWatchList: WatchedVehicle[] = [];
export const initialTimelineEvents: TimelineEvent[] = [];
export const initialReports: ReportItem[] = [];
export const recentDetections: RecentDetection[] = [];
export const detectionsOverTime: { day: string; detections: number }[] = [];
export const detectionsByVehicleType: { name: string; value: number; color: string }[] = [];
export const detectionsByHour: { hour: string; value: number }[] = [];

