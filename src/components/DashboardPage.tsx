import React, { useState } from 'react';
import {
  Camera,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  PlusCircle,
  Search,
  FileText,
  UserCheck,
  CheckCircle,
  Eye,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { Camera as CameraType, Alert as AlertType, RecentDetection, TimelineEvent } from '../mockData';

interface DashboardPageProps {
  cameras: CameraType[];
  alerts: AlertType[];
  detections: RecentDetection[];
  timeline: TimelineEvent[];
  onAddIncident: (msg: string, severity: 'Critical' | 'Warning' | 'Resolved' | 'Info') => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cameras,
  alerts,
  detections,
  timeline,
  onAddIncident,
  setActiveTab
}) => {
  const [selectedCamId, setSelectedCamId] = useState('CAM-1024');
  const [searchPlate, setSearchPlate] = useState('');
  const [addIncidentOpen, setAddIncidentOpen] = useState(false);
  const [incidentMsg, setIncidentMsg] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'Critical' | 'Warning' | 'Resolved' | 'Info'>('Warning');

  // Find selected camera details
  const activeCamera = cameras.find(c => c.id === selectedCamId) || cameras[0];

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentMsg.trim()) return;
    onAddIncident(incidentMsg, incidentSeverity);
    setIncidentMsg('');
    setAddIncidentOpen(false);
  };

  const handleSearchPlateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate.trim()) return;
    // Set alerts filter or jump to watch list / alerts
    setActiveTab('alerts');
  };

  // Status counts for Alerts Overview
  const criticalCount = alerts.filter(a => a.status === 'Active' && (a.type === 'Stolen Vehicle' || a.type === 'Cloned Vehicle')).length * 3 + 2;
  const warningCount = alerts.filter(a => a.status === 'Pending').length * 2 + 9;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved' || a.status === 'Unpaid').length * 4 + 14;

  return (
    <div className="space-y-6">
      
      {/* 4 Telemetry Metrics Summary Cards (Screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Cameras</span>
            <div className="text-2xl font-black text-[#0C2540]">1,284</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <TrendingUp size={12} />
              <span>+6.2% compared to last 24h</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Camera size={24} />
          </div>
        </div>

        {/* Card 2: Active Cameras with Progress */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Cameras</span>
              <div className="text-2xl font-black text-slate-800">1,042</div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>81% of total cameras</span>
              <span className="text-emerald-600">Online</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '81%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Alerts</span>
            <div className="text-2xl font-black text-red-600">21</div>
            <div className="text-[10px] font-bold text-red-500 animate-pulse">
              Requires immediate attention
            </div>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Card 4: Total Detections */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Detections (24h)</span>
            <div className="text-2xl font-black text-slate-800">12,846</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <TrendingUp size={12} />
              <span>+8.4% in last 24 hours</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Sliders size={24} />
          </div>
        </div>

      </div>

      {/* Main Grid: Detections + Alerts + Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Recent Detections (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-[#F4EFE6] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Recent Detections</h3>
              <button onClick={() => setActiveTab('cameras')} className="text-xs text-[#0C2540] font-bold hover:underline flex items-center gap-0.5">
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {detections.map((det) => (
                <div
                  key={det.id}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition cursor-pointer"
                  onClick={() => {
                    // Match a camera pin on map
                    if (det.id === 'RD-001') setSelectedCamId('CAM-1024');
                    else if (det.id === 'RD-003') setSelectedCamId('CAM-0456');
                    else if (det.id === 'RD-005') setSelectedCamId('CAM-0932');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={det.image}
                      alt={det.plateNumber}
                      className="h-10 w-12 rounded bg-slate-100 object-cover border border-slate-200"
                    />
                    <div className="leading-tight">
                      <div className="text-xs font-bold font-mono tracking-tight bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                        {det.plateNumber}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block mt-1">
                        {det.details}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">{det.confidence}%</div>
                    <span className="text-[9px] text-slate-400 font-semibold block">{det.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('cameras')}
            className="w-full text-center py-2 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold mt-4"
          >
            View All Detections
          </button>
        </div>

        {/* Column 2: Alerts Overview & Quick Actions (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Alerts Overview Panel */}
          <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Alerts Overview</h3>
              <button onClick={() => setActiveTab('alerts')} className="text-xs text-[#0C2540] font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              <div onClick={() => setActiveTab('alerts')} className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100/60 border border-red-100 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold">CRITICAL</span>
                </div>
                <span className="text-sm font-black text-red-800">{criticalCount} &gt;</span>
              </div>

              <div onClick={() => setActiveTab('alerts')} className="flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100/60 border border-amber-100 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold">WARNING</span>
                </div>
                <span className="text-sm font-black text-amber-800">{warningCount} &gt;</span>
              </div>

              <div onClick={() => setActiveTab('alerts')} className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-100 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle size={16} />
                  <span className="text-xs font-bold">RESOLVED</span>
                </div>
                <span className="text-sm font-black text-emerald-800">{resolvedCount} &gt;</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setAddIncidentOpen(true)}
                className="w-full flex items-center justify-between p-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl transition text-left text-xs font-bold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle size={16} className="text-[#0C2540]" />
                  <div>
                    <div>Add Incident</div>
                    <span className="text-[9px] font-medium text-slate-400">Report new incident</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <form onSubmit={handleSearchPlateSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search Vehicle Plate..."
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
                  <Search size={14} />
                </button>
              </form>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl transition text-left text-xs font-bold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-[#0C2540]" />
                  <div>
                    <div>Export Report</div>
                    <span className="text-[9px] font-medium text-slate-400">Generate report</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between p-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl transition text-left text-xs font-bold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck size={16} className="text-[#0C2540]" />
                  <div>
                    <div>Operator Log</div>
                    <span className="text-[9px] font-medium text-slate-400">View operator activity</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Column 3: Live Map (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Live Map</h3>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Live Telemetry</span>
            </div>
          </div>

          {/* Interactive SVG Street Map Replica */}
          <div className="relative bg-slate-50 rounded-xl border border-slate-100 aspect-[4/3] overflow-hidden flex items-center justify-center">
            
            {/* Map Roads / Streets (Drawn using styled lines) */}
            <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 300" fill="none">
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Waterway / River */}
              <path d="M 0 220 Q 150 180 250 250 T 400 240" fill="none" stroke="#93C5FD" strokeWidth="18" strokeLinecap="round" />
              <path d="M 0 220 Q 150 180 250 250 T 400 240" fill="none" stroke="#BFDBFE" strokeWidth="14" strokeLinecap="round" />

              {/* Roads */}
              {/* NH-216 Main highway */}
              <line x1="0" y1="150" x2="400" y2="150" stroke="#CBD5E1" strokeWidth="16" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#F1F5F9" strokeWidth="12" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#F8FAFC" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Secondary avenues */}
              <line x1="120" y1="0" x2="120" y2="300" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="280" y1="0" x2="280" y2="300" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#E2E8F0" strokeWidth="6" />

              {/* Text labels */}
              <text x="50" y="138" fill="#94A3B8" fontSize="9" fontWeight="bold">NH-216 Highway</text>
              <text x="130" y="30" fill="#94A3B8" fontSize="8" fontWeight="medium" transform="rotate(90, 130, 30)">5th Ave</text>
              <text x="290" y="30" fill="#94A3B8" fontSize="8" fontWeight="medium" transform="rotate(90, 290, 30)">Harbor Rd</text>
              <text x="310" y="220" fill="#60A5FA" fontSize="8" fontWeight="semibold">River Channel</text>
            </svg>

            {/* Hub marker (Bhimavaram Center) */}
            <div className="absolute top-[150px] left-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="h-6 w-6 rounded-full bg-[#0C2540]/20 border-2 border-[#0C2540] flex items-center justify-center">
                <MapPin className="text-[#0C2540]" size={12} />
              </div>
              <span className="text-[7px] font-black uppercase text-[#0C2540] bg-white border border-slate-200 px-1 py-0.5 rounded shadow mt-0.5">
                Bhimavaram
              </span>
            </div>

            {/* Interactive Pins (Linked to cameras in mockData) */}
            
            {/* CAM-1024 - Main St & 5th Ave (Near Intersection left) */}
            <button
              onClick={() => setSelectedCamId('CAM-1024')}
              className={`absolute top-[138px] left-[110px] p-1.5 rounded-full transition-all shadow-md ${
                selectedCamId === 'CAM-1024' ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 scale-125 z-10' : 'bg-white border-2 border-emerald-500 text-emerald-600'
              }`}
            >
              <Camera size={12} />
            </button>

            {/* CAM-0785 - I-9 Overpass (Top Center) */}
            <button
              onClick={() => setSelectedCamId('CAM-0785')}
              className={`absolute top-[62px] left-[200px] p-1.5 rounded-full transition-all shadow-md ${
                selectedCamId === 'CAM-0785' ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 scale-125 z-10' : 'bg-white border-2 border-emerald-500 text-emerald-600'
              }`}
            >
              <Camera size={12} />
            </button>

            {/* CAM-0456 - Harbor Rd Exit (Right Center) */}
            <button
              onClick={() => setSelectedCamId('CAM-0456')}
              className={`absolute top-[142px] left-[272px] p-1.5 rounded-full transition-all shadow-md ${
                selectedCamId === 'CAM-0456' ? 'bg-red-600 text-white ring-4 ring-red-200 scale-125 z-10' : 'bg-white border-2 border-red-500 text-red-600'
              }`}
            >
              <AlertTriangle size={12} />
            </button>

            {/* CAM-0932 - City Center (Bottom Left) */}
            <button
              onClick={() => setSelectedCamId('CAM-0932')}
              className={`absolute top-[220px] left-[70px] p-1.5 rounded-full transition-all shadow-md ${
                selectedCamId === 'CAM-0932' ? 'bg-amber-600 text-white ring-4 ring-amber-200 scale-125 z-10' : 'bg-white border-2 border-amber-500 text-amber-600'
              }`}
            >
              <Camera size={12} />
            </button>

            {/* Selected Camera Details Floating Drawer */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeCamera.thumbnail}
                  alt={activeCamera.id}
                  className="h-10 w-14 rounded object-cover border border-slate-200 bg-slate-200"
                />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{activeCamera.id}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                      activeCamera.status === 'Online' ? 'bg-emerald-100 text-emerald-700' :
                      activeCamera.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activeCamera.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{activeCamera.location}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('live-feeds')}
                className="bg-[#0C2540] hover:bg-[#18385A] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
              >
                <Eye size={12} />
                View Camera
              </button>
            </div>

            {/* Map Legend Floating */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1.5 shadow-sm text-[8px] font-semibold space-y-0.5 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block"></span>
                <span>Active Camera</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 block"></span>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 block"></span>
                <span>Camera Alert</span>
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 font-bold mt-2 text-center flex items-center justify-center gap-1">
            <MapPin size={10} strokeWidth={2.5} />
            <span>Map matches coordinates of camera points. Click pins to update preview details.</span>
          </div>

        </div>

      </div>

      {/* Activity Timeline (Screenshot 4 - bottom row) */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Activity Timeline</h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Recent system activities and incidents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((event) => (
            <div key={event.id} className="relative bg-slate-50 border border-slate-100 rounded-xl p-3 pl-4">
              
              {/* Severity bar color indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                event.severity === 'Critical' ? 'bg-red-500' :
                event.severity === 'Warning' ? 'bg-amber-500' :
                event.severity === 'Resolved' ? 'bg-emerald-500' : 'bg-sky-500'
              }`}></div>

              <div className="flex justify-between items-start">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                  event.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  event.severity === 'Warning' ? 'bg-amber-100 text-amber-700' :
                  event.severity === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {event.severity}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock size={10} />
                  {event.time}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 mt-2 line-clamp-2 leading-snug">
                {event.message}
              </p>
              <div className="text-[9px] text-slate-500 font-medium mt-1">
                {event.reportedBy}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Add Incident Modal */}
      {addIncidentOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0C2540] text-white font-bold flex justify-between items-center">
              <span>Report Traffic Incident</span>
              <button onClick={() => setAddIncidentOpen(false)} className="text-white hover:text-slate-200 font-black text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Critical', 'Warning', 'Resolved', 'Info'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`py-2 rounded-lg text-xs font-bold text-center border uppercase transition ${
                        incidentSeverity === sev
                          ? sev === 'Critical' ? 'bg-red-50 border-red-500 text-red-700 font-extrabold ring-1 ring-red-500' :
                            sev === 'Warning' ? 'bg-amber-50 border-amber-500 text-amber-700 font-extrabold ring-1 ring-amber-500' :
                            sev === 'Resolved' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold ring-1 ring-emerald-500' :
                            'bg-sky-50 border-sky-500 text-sky-700 font-extrabold ring-1 ring-sky-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Incident Details</label>
                <textarea
                  value={incidentMsg}
                  onChange={(e) => setIncidentMsg(e.target.value)}
                  placeholder="E.g., Vehicle broke down blocking right-most lane on NH-216..."
                  rows={3}
                  className="w-full border border-slate-200 p-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAddIncidentOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0C2540] hover:bg-[#18385A] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
