import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { DashboardPage } from './components/DashboardPage';
import { CamerasPage } from './components/CamerasPage';
import { LiveFeedsPage } from './components/LiveFeedsPage';
import { AlertsIncidentsPage } from './components/AlertsIncidentsPage';
import { VehicleWatchListPage } from './components/VehicleWatchListPage';
import { ReportsPage } from './components/ReportsPage';
import { MapOverviewPage } from './components/MapOverviewPage';
import { SystemSettingsPage } from './components/SystemSettingsPage';
import { AnalyticsPage, AuditLogPage } from './components/PlaceholderPages';
import { TrafficRulesPage } from './components/TrafficRulesPage';
import { CitizenFeedbackPage } from './components/CitizenFeedbackPage';
import { VehicleSearchPage } from './components/VehicleSearchPage';
import { jobsApi } from './services/api/jobsApi';

import {
  initialCameras,
  initialAlerts,
  initialWatchList,
  initialTimelineEvents,
  Camera,
  Alert,
  WatchedVehicle,
  TimelineEvent,
  RecentDetection
} from './mockData';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Global States (Interactive Real Data)
  const [cameras, setCameras] = useState<Camera[]>(initialCameras);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [watchList, setWatchList] = useState<WatchedVehicle[]>(initialWatchList);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [liveDetections, setLiveDetections] = useState<RecentDetection[]>([]);
  
  // Accessibility & Settings Context
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Fetch real detections and cameras from MongoDB backend on load and periodic refresh
  useEffect(() => {
    const fetchRealData = async () => {
      const dbDetections = await jobsApi.getDetections({ limit: 50 });
      if (dbDetections && dbDetections.length > 0) {
        const formatted: RecentDetection[] = dbDetections.map((d, index) => ({
          id: d.id || `RD-${index + 1}`,
          plateNumber: d.plateNumber || 'UNKNOWN',
          confidence: Math.round((d.confidence || 0) * 100),
          time: d.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          vehicleClass: d.vehicleClass || 'Vehicle',
          location: 'Live ANPR Node',
          camera: 'CAM-LIVE',
          details: `${d.color || 'Standard'} • ${d.vehicleClass || 'Vehicle'}`,
          image: ''
        }));
        setLiveDetections(formatted);
      }

      const dbCameras = await jobsApi.getCameras();
      if (dbCameras && dbCameras.length > 0) {
        setCameras(dbCameras);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Interactive Actions
  const handleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(alert => (alert.id === id ? { ...alert, status: 'Resolved' } : alert))
    );
    
    // Add to timeline log
    const resolvedAlert = alerts.find(a => a.id === id);
    if (resolvedAlert) {
      const newEvent: TimelineEvent = {
        id: `T-00${timeline.length + 1}`,
        severity: 'Resolved',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Alert resolved for plate ${resolvedAlert.plateNumber} (${resolvedAlert.type})`,
        reportedBy: 'Operator: Admin User'
      };
      setTimeline(prev => [newEvent, ...prev]);
    }
  };

  const handleAddIncident = (msg: string, severity: 'Critical' | 'Warning' | 'Resolved' | 'Info') => {
    const newEvent: TimelineEvent = {
      id: `T-00${timeline.length + 1}`,
      severity,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: msg,
      reportedBy: 'Operator: Admin User'
    };
    setTimeline(prev => [newEvent, ...prev]);
  };

  const handleAddCamera = async (newCam: Camera) => {
    try {
      const savedCam = await jobsApi.addCamera(newCam);
      setCameras(prev => [savedCam || newCam, ...prev.filter(c => c.id !== newCam.id)]);
      handleAddIncident(`New camera node registered: ${newCam.id} at ${newCam.location}`, 'Info');
    } catch (err) {
      // Optimistic state update with local resilience
      setCameras(prev => [newCam, ...prev.filter(c => c.id !== newCam.id)]);
      handleAddIncident(`New camera node registered locally: ${newCam.id} at ${newCam.location}`, 'Info');
    }
  };

  const handleAddWatchItem = (newVehicle: WatchedVehicle) => {
    setWatchList(prev => [newVehicle, ...prev]);
    
    // Also trigger system alert if added
    const alertType = newVehicle.watchType === 'Stolen' ? 'Stolen Vehicle' : 'Cloned Vehicle';
    const newAlert: Alert = {
      id: `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type: alertType,
      plateNumber: newVehicle.plateNumber,
      vehicleDetails: {
        brand: newVehicle.brandModel.split(' ')[0],
        model: newVehicle.brandModel.split(' ').slice(1).join(' '),
        color: newVehicle.color,
        type: 'Sedan',
        image: newVehicle.image
      },
      location: newVehicle.locationAdded,
      camera: 'MANUAL',
      timeDate: new Date().toLocaleString(),
      status: 'Active'
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    handleAddIncident(`Watch list target added: ${newVehicle.plateNumber} (${newVehicle.watchType})`, 'Critical');
  };

  const activeAlertCount = alerts.filter(a => a.status === 'Active' || a.status === 'Pending').length;

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => setIsLoggedIn(true)}
        textSize={textSize}
        setTextSize={setTextSize}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  // Render current tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            cameras={cameras}
            alerts={alerts}
            detections={liveDetections}
            timeline={timeline}
            onAddIncident={handleAddIncident}
            setActiveTab={setActiveTab}
          />
        );
      case 'cameras':
        return (
          <CamerasPage
            cameras={cameras}
            onAddCamera={handleAddCamera}
            onViewFeed={() => setActiveTab('live-feeds')}
          />
        );
      case 'live-feeds':
        return <LiveFeedsPage cameras={cameras} />;
      case 'alerts':
        return (
          <AlertsIncidentsPage
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
          />
        );
      case 'watchlist':
        return (
          <VehicleWatchListPage
            watchList={watchList}
            onAddWatchItem={handleAddWatchItem}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'map':
        return <MapOverviewPage />;
      case 'settings':
        return <SystemSettingsPage />;
      case 'rules':
        return <TrafficRulesPage />;
      case 'feedback':
        return <CitizenFeedbackPage />;
      case 'vehicle-search':
        return <VehicleSearchPage />;
      case 'audit-log':
        return <AuditLogPage />;
      default:
        return (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            This module is currently initializing. Please select another screen.
          </div>
        );
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      textSize={textSize}
      setTextSize={setTextSize}
      language={language}
      setLanguage={setLanguage}
      onLogout={() => setIsLoggedIn(false)}
      alertCount={activeAlertCount}
    >
      {renderTabContent()}
    </MainLayout>
  );
}

export default App;

