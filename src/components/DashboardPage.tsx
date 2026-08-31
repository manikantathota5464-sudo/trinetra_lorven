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
  RefreshCw,
  ShieldAlert,
  Radio,
  ExternalLink,
  Layers,
  Cpu
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
    setActiveTab('alerts');
  };

  // Status counts for Alerts Overview
  const criticalCount = alerts.filter(a => a.status === 'Active' && (a.type === 'Stolen Vehicle' || a.type === 'Cloned Vehicle')).length * 3 + 2;
  const warningCount = alerts.filter(a => a.status === 'Pending').length * 2 + 9;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved' || a.status === 'Unpaid').length * 4 + 14;

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      
      {/* ── 0. OFFICIAL NATIONAL DATA GATEWAY INTERCONNECT STRIP ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-1.5 px-3 shadow-xs flex flex-wrap items-center justify-between gap-2 gov-card-interactive flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            National Highway Gateway:
          </span>
          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
            ID: MORTH-AP-HYD-04
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] font-extrabold">
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
            <span className="h-1 w-1 rounded-full bg-emerald-600"></span>
            <span>VAHAN 4.0 API</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
            <span className="h-1 w-1 rounded-full bg-emerald-600"></span>
            <span>SARATHI</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
            <span className="h-1 w-1 rounded-full bg-emerald-600"></span>
            <span>NCIC / CCTNS</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
            <span className="h-1 w-1 rounded-full bg-blue-600"></span>
            <span>CPGRAMS</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
            <span>🛡️ CERT-In</span>
          </div>
        </div>
      </div>

      {/* ── 1. TOP TELEMETRY METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-shrink-0">
        
        {/* Card 1: Total Cameras */}
        <div className="bg-white border-l-4 border-l-[#0A2540] border border-slate-200 rounded-xl p-2.5 shadow-sm flex items-center justify-between gov-card-interactive">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Cameras</span>
            </div>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-[#0A2540]">1,284</div>
            <div className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-700">
              <TrendingUp size={10} />
              <span>+6.2% expansion</span>
            </div>
          </div>
          <div className="p-2 bg-[#0A2540]/5 text-[#0A2540] rounded-xl border border-[#0A2540]/10">
            <Camera size={16} />
          </div>
        </div>

        {/* Card 2: Active Cameras */}
        <div className="bg-white border-l-4 border-l-emerald-600 border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col justify-between gov-card-interactive">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Live ANPR Nodes</span>
              </div>
              <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800">1,042</div>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
              <span>81.2% Grid Online</span>
              <span className="text-emerald-700">Healthy</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '81.2%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div className="bg-white border-l-4 border-l-red-600 border border-slate-200 rounded-xl p-2.5 shadow-sm flex items-center justify-between gov-card-interactive">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Active High Alerts</span>
              <span className="text-[7.5px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-black uppercase animate-pulse">Critical</span>
            </div>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-red-600">21</div>
            <div className="text-[8.5px] font-bold text-red-600 flex items-center gap-1">
              <AlertTriangle size={10} />
              <span>Requires dispatch</span>
            </div>
          </div>
          <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <ShieldAlert size={16} />
          </div>
        </div>

        {/* Card 4: Total Detections */}
        <div className="bg-white border-l-4 border-l-[#C59B27] border border-slate-200 rounded-xl p-2.5 shadow-sm flex items-center justify-between gov-card-interactive">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Scans (24h)</span>
            </div>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800">12,846</div>
            <div className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-700">
              <TrendingUp size={10} />
              <span>+8.4% throughput</span>
            </div>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <Cpu size={16} />
          </div>
        </div>

      </div>

      {/* ── 2. CORE WORKSPACE GRID ── */}
      <div className="flex-1 min-h-0 flex gap-2">
        
        {/* Column 1: Recent ANPR Detections */}
        <div className="w-[30%] bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group p-3 flex flex-col justify-between shadow-sm min-h-0">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider">Live ANPR</h3>
            </div>
            <button
              onClick={() => setActiveTab('cameras')}
              className="text-[10px] text-[#0A2540] font-black hover:text-[#163E66] flex items-center gap-0.5 cursor-pointer"
            >
              <span>Registry</span>
              <ArrowRight size={10} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
            {detections.map((det) => (
              <div
                key={det.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 border border-slate-100 rounded-lg transition cursor-pointer group"
                onClick={() => {
                  if (det.id === 'RD-001') setSelectedCamId('CAM-1024');
                  else if (det.id === 'RD-003') setSelectedCamId('CAM-0456');
                  else if (det.id === 'RD-005') setSelectedCamId('CAM-0932');
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={det.image}
                    alt={det.plateNumber}
                    className="h-8 w-10 rounded object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="leading-tight">
                    <div className="text-[9px] font-black font-mono tracking-tight bg-slate-100 group-hover:bg-amber-100/50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-900 inline-block transition">
                      {det.plateNumber}
                    </div>
                    <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">
                      {det.details}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] font-black text-emerald-700">{det.confidence}% match</div>
                  <span className="text-[8px] text-slate-400 font-bold block">{det.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('cameras')}
            className="w-full text-center py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black text-[#0A2540] mt-2 transition cursor-pointer flex-shrink-0"
          >
            View Detection Registry ➔
          </button>
        </div>

        {/* Column 2: Alerts Overview & Quick Actions */}
        <div className="w-[25%] flex flex-col gap-2 min-h-0">
          
          {/* Alerts Overview Panel */}
          <div className="bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group p-3 shadow-sm flex-shrink-0">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
              <h3 className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider">Alert Summary</h3>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-[10px] text-[#0A2540] font-black hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-1.5">
              <div
                onClick={() => setActiveTab('alerts')}
                className="flex items-center justify-between p-1.5 bg-red-50/80 hover:bg-red-100/80 border border-red-200 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-red-800">
                  <AlertTriangle size={12} />
                  <span className="text-[9px] font-black uppercase">CRITICAL</span>
                </div>
                <span className="text-xs font-black text-red-800">{criticalCount} &gt;</span>
              </div>

              <div
                onClick={() => setActiveTab('alerts')}
                className="flex items-center justify-between p-1.5 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle size={12} />
                  <span className="text-[9px] font-black uppercase">WARNING</span>
                </div>
                <span className="text-xs font-black text-amber-900">{warningCount} &gt;</span>
              </div>

              <div
                onClick={() => setActiveTab('alerts')}
                className="flex items-center justify-between p-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle size={12} />
                  <span className="text-[9px] font-black uppercase">RESOLVED</span>
                </div>
                <span className="text-xs font-black text-emerald-800">{resolvedCount} &gt;</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group p-3 shadow-sm flex-1 flex flex-col justify-between min-h-0">
            <h3 className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider mb-2">
              Command Actions
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              <button
                onClick={() => setAddIncidentOpen(true)}
                className="w-full flex items-center justify-between p-1.5 border border-slate-200 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-lg transition text-left text-[9px] font-black text-[#0A2540] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <PlusCircle size={12} className="text-[#0A2540]" />
                  <div>
                    <div>Report Incident</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-slate-400" />
              </button>

              <form onSubmit={handleSearchPlateSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search Plate..."
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  className="w-full pl-2 pr-6 py-1.5 border border-slate-200 rounded-lg text-[9px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A2540] bg-slate-50"
                />
                <button type="submit" className="absolute right-2 top-1.5 text-slate-400 hover:text-[#0A2540] cursor-pointer">
                  <Search size={10} />
                </button>
              </form>

              <button
                onClick={() => setActiveTab('reports')}
                className="w-full flex items-center justify-between p-1.5 border border-slate-200 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-lg transition text-left text-[9px] font-black text-[#0A2540] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText size={12} className="text-[#0A2540]" />
                  <div>
                    <div>Compliance Report</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between p-1.5 border border-slate-200 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-lg transition text-left text-[9px] font-black text-[#0A2540] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck size={12} className="text-[#0A2540]" />
                  <div>
                    <div>Operator Log</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Column 3: Live Geospatial Radar Map */}
        <div className="w-[45%] bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Radio size={12} className="text-[#0A2540] animate-pulse" />
              <h3 className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider">Geospatial Radar</h3>
            </div>
            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-black uppercase">
              Live Telemetry
            </span>
          </div>

          {/* Interactive SVG Street Map Replica */}
          <div className="relative bg-[#F1F5F9] rounded-xl border border-slate-200 flex-1 min-h-0 overflow-hidden flex items-center justify-center">
            
            {/* Map Roads / Streets (Drawn using styled lines) */}
            <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Waterway / River */}
              <path d="M 0 220 Q 150 180 250 250 T 400 240" fill="none" stroke="#93C5FD" strokeWidth="18" strokeLinecap="round" />
              <path d="M 0 220 Q 150 180 250 250 T 400 240" fill="none" stroke="#BFDBFE" strokeWidth="14" strokeLinecap="round" />

              {/* NH-216 Main Highway */}
              <line x1="0" y1="150" x2="400" y2="150" stroke="#CBD5E1" strokeWidth="16" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#F8FAFC" strokeWidth="12" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#FF9933" strokeWidth="1.5" strokeDasharray="6,4" />
              
              {/* Secondary Avenues */}
              <line x1="120" y1="0" x2="120" y2="300" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="280" y1="0" x2="280" y2="300" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#E2E8F0" strokeWidth="6" />

              {/* Text labels */}
              <text x="45" y="138" fill="#0A2540" fontSize="9" fontWeight="900">NH-216 Expressway</text>
              <text x="130" y="30" fill="#64748B" fontSize="8" fontWeight="bold" transform="rotate(90, 130, 30)">5th Ave</text>
              <text x="290" y="30" fill="#64748B" fontSize="8" fontWeight="bold" transform="rotate(90, 290, 30)">Harbor Rd</text>
              <text x="310" y="220" fill="#2563EB" fontSize="8" fontWeight="bold">Godavari Channel</text>
            </svg>

            {/* Central Hub Marker (Bhimavaram Node) */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <div className="h-5 w-5 rounded-full bg-[#0A2540]/20 border-2 border-[#0A2540] flex items-center justify-center animate-pulse">
                <MapPin className="text-[#0A2540]" size={10} />
              </div>
            </div>

            {/* Interactive Camera Pins */}
            {/* CAM-1024 - Main St & 5th Ave */}
            <button
              onClick={() => setSelectedCamId('CAM-1024')}
              className={`absolute top-[40%] left-[25%] p-1 rounded-full transition-all shadow-md cursor-pointer ${
                selectedCamId === 'CAM-1024' ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 scale-125 z-10' : 'bg-white border-2 border-emerald-500 text-emerald-600'
              }`}
              title="CAM-1024: Main St & 5th Ave"
            >
              <Camera size={10} />
            </button>

            {/* CAM-0785 - I-9 Overpass */}
            <button
              onClick={() => setSelectedCamId('CAM-0785')}
              className={`absolute top-[20%] left-[45%] p-1 rounded-full transition-all shadow-md cursor-pointer ${
                selectedCamId === 'CAM-0785' ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 scale-125 z-10' : 'bg-white border-2 border-emerald-500 text-emerald-600'
              }`}
              title="CAM-0785: I-9 Overpass"
            >
              <Camera size={10} />
            </button>

            {/* CAM-0456 - Harbor Rd Exit */}
            <button
              onClick={() => setSelectedCamId('CAM-0456')}
              className={`absolute top-[45%] left-[65%] p-1 rounded-full transition-all shadow-md cursor-pointer ${
                selectedCamId === 'CAM-0456' ? 'bg-red-600 text-white ring-2 ring-red-200 scale-125 z-10' : 'bg-white border-2 border-red-500 text-red-600'
              }`}
              title="CAM-0456: Harbor Rd Alert"
            >
              <AlertTriangle size={10} />
            </button>

            {/* CAM-0932 - City Center */}
            <button
              onClick={() => setSelectedCamId('CAM-0932')}
              className={`absolute top-[70%] left-[20%] p-1 rounded-full transition-all shadow-md cursor-pointer ${
                selectedCamId === 'CAM-0932' ? 'bg-amber-600 text-white ring-2 ring-amber-200 scale-125 z-10' : 'bg-white border-2 border-amber-500 text-amber-600'
              }`}
              title="CAM-0932: City Center"
            >
              <Camera size={10} />
            </button>

            {/* Selected Camera Details Floating Drawer */}
            <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-1.5 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={activeCamera.thumbnail}
                  alt={activeCamera.id}
                  className="h-7 w-9 rounded object-cover border border-slate-200 bg-slate-200"
                />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-800">{activeCamera.id}</span>
                    <span className={`text-[7px] font-black px-1 py-0.2 rounded-full uppercase ${
                      activeCamera.status === 'Online' ? 'bg-emerald-100 text-emerald-800' :
                      activeCamera.status === 'Offline' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeCamera.status}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">{activeCamera.location}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('live-feeds')}
                className="bg-[#0A2540] hover:bg-[#163E66] text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Eye size={10} />
                Live
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── 3. ACTIVITY INCIDENT TIMELINE ── */}
      <div className="bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group p-3 shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[#0A2540]" />
            <h3 className="text-[10px] font-black uppercase text-[#0A2540] tracking-wider">Activity Incident Timeline</h3>
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Cryptographic MoRTH Audit Log
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {timeline.slice(0, 4).map((event) => (
            <div key={event.id} className="relative bg-slate-50 border border-slate-200 rounded-lg p-2 pl-3 hover:bg-white transition shadow-2xs">
              
              {/* Severity Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                event.severity === 'Critical' ? 'bg-red-500' :
                event.severity === 'Warning' ? 'bg-amber-500' :
                event.severity === 'Resolved' ? 'bg-emerald-500' : 'bg-[#0A2540]'
              }`}></div>

              <div className="flex justify-between items-start">
                <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                  event.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  event.severity === 'Warning' ? 'bg-amber-100 text-amber-800' :
                  event.severity === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.severity}
                </span>
                <span className="text-[8px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock size={8} />
                  {event.time}
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-800 mt-1 line-clamp-1 leading-snug">
                {event.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. REPORT TRAFFIC INCIDENT MODAL ── */}
      {addIncidentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#0A2540] text-white font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#FF9933]" />
                <span className="text-sm font-black uppercase tracking-wide">Report Traffic Incident</span>
              </div>
              <button onClick={() => setAddIncidentOpen(false)} className="text-slate-300 hover:text-white font-black text-sm cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Incident Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Critical', 'Warning', 'Resolved', 'Info'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`py-2 rounded-lg text-xs font-black text-center border uppercase transition cursor-pointer ${
                        incidentSeverity === sev
                          ? sev === 'Critical' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' :
                            sev === 'Warning' ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500' :
                            sev === 'Resolved' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' :
                            'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Incident Details</label>
                <textarea
                  value={incidentMsg}
                  onChange={(e) => setIncidentMsg(e.target.value)}
                  placeholder="E.g., Breakdown blocking lane 2 on NH-216 near Harbor exit..."
                  rows={3}
                  className="w-full border border-slate-300 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2540] bg-slate-50 font-medium"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setAddIncidentOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A2540] hover:bg-[#163E66] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
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

