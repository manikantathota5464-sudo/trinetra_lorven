import { useState } from 'react';
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

import {
  initialCameras,
  initialAlerts,
  initialWatchList,
  initialTimelineEvents,
  recentDetections,
  Camera,
  Alert,
  WatchedVehicle,
  TimelineEvent
} from './mockData';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Global States (Interactive Data)
  const [cameras, setCameras] = useState<Camera[]>(initialCameras);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [watchList, setWatchList] = useState<WatchedVehicle[]>(initialWatchList);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimelineEvents);
  
  // Accessibility & Settings Context
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

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

  const handleAddCamera = (newCam: Camera) => {
    setCameras(prev => [newCam, ...prev]);
    handleAddIncident(`New camera node registered: ${newCam.id} at ${newCam.location}`, 'Info');
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
            detections={recentDetections}
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
      case 'analytics':
        return <AnalyticsPage />;
      case 'audit':
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
