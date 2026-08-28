import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  AlertTriangle,
  Activity,
  Car,
  Search,
  Plus,
  Minus,
  Layers,
  RefreshCw,
  Clock,
  Eye,
  Info
} from 'lucide-react';

interface MapNode {
  id: string;
  name: string;
  type: 'active' | 'ptz' | 'alert' | 'inactive' | 'incident';
  x: number;
  y: number;
  status: string;
  locationDetails: string;
  lastUpdate: string;
  value: string;
}

export const MapOverviewPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('Bhimavaram');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  // Map nodes corresponding to Screenshot 6
  const mapNodes: MapNode[] = [
    {
      id: 'NODE-1',
      name: 'CAM-1024',
      type: 'active',
      x: 320,
      y: 110,
      status: 'Online',
      locationDetails: 'Main St & 5th Ave',
      lastUpdate: '08:19 AM',
      value: 'Uptime 99.8%'
    },
    {
      id: 'NODE-2',
      name: 'CAM-1120 (PTZ)',
      type: 'ptz',
      x: 140,
      y: 155,
      status: 'Online',
      locationDetails: 'Junction 9 Ring Road',
      lastUpdate: '08:18 AM',
      value: 'Uptime 99.6%'
    },
    {
      id: 'NODE-3',
      name: 'CAM-0785 (Alert)',
      type: 'alert',
      x: 236,
      y: 150,
      status: 'Critical Alert',
      locationDetails: 'I-9 Overpass Main Corridor',
      lastUpdate: '08:17 AM',
      value: 'Speed Violation (104 km/h)'
    },
    {
      id: 'NODE-4',
      name: 'CAM-0456 (Inactive)',
      type: 'inactive',
      x: 180,
      y: 200,
      status: 'Offline (2d ago)',
      locationDetails: 'Harbor Rd Exit',
      lastUpdate: '2 days ago',
      value: 'Power Failure'
    },
    {
      id: 'NODE-5',
      name: 'INC-204 (Incident)',
      type: 'incident',
      x: 238,
      y: 195,
      status: 'Incident Reported',
      locationDetails: 'Bhimavaram Junction Canal Side',
      lastUpdate: '08:16 AM',
      value: 'Heavy congestion / stalling'
    },
    // Hub and spokes
    {
      id: 'SPOKE-1',
      name: 'Sector 1 PTZ',
      type: 'ptz',
      x: 204,
      y: 105,
      status: 'Online',
      locationDetails: 'Sankar Road',
      lastUpdate: '08:19 AM',
      value: 'Uptime 99.1%'
    },
    {
      id: 'SPOKE-2',
      name: 'Sector 2 Active',
      type: 'active',
      x: 270,
      y: 110,
      status: 'Online',
      locationDetails: 'Bhimavaram Jn Canal',
      lastUpdate: '08:15 AM',
      value: 'Uptime 100%'
    },
    {
      id: 'SPOKE-3',
      name: 'Sector 3 Alert',
      type: 'alert',
      x: 260,
      y: 172,
      status: 'Warning',
      locationDetails: 'Cantt Road Exit',
      lastUpdate: '08:14 AM',
      value: 'No Helmet violation'
    },
    {
      id: 'SPOKE-4',
      name: 'Sector 4 Active',
      type: 'active',
      x: 276,
      y: 220,
      status: 'Online',
      locationDetails: 'JNTU College Highway Entrance',
      lastUpdate: '08:10 AM',
      value: 'Uptime 99.4%'
    },
    {
      id: 'SPOKE-5',
      name: 'Sector 5 Inactive',
      type: 'inactive',
      x: 210,
      y: 250,
      status: 'Offline',
      locationDetails: 'Bhimavaram South Gate',
      lastUpdate: '1 day ago',
      value: 'Network Timeout'
    }
  ];

  const filteredNodes = mapNodes.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.locationDetails.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header Navigation (Screenshot 6) */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Map Overview</h3>
            <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">
              Dashboard &gt; Map Overview
            </span>
          </div>
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Clock size={12} />
            <span>Last Updated: 10:19 AM</span>
          </span>
        </div>
      </div>

      {/* Summary Counters (Screenshot 6) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        
        {/* Total Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Cameras</span>
            <div className="text-xl font-black text-[#0C2540] mt-1">128</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Across 28 locations</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Camera size={18} />
          </div>
        </div>

        {/* Active Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Active Cameras</span>
              <div className="text-xl font-black text-slate-800 mt-1">104</div>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: '81.2%' }}></div>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-1 block">81.2% of total cameras</span>
        </div>

        {/* Active Vehicles */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-450 block tracking-wider">Active Vehicles</span>
            <div className="text-xl font-black text-indigo-600 mt-1">215</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Currently monitored</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Car size={18} />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-450 block tracking-wider">Active Alerts</span>
            <div className="text-xl font-black text-red-600 mt-1">86</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Requires attention</span>
          </div>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Incidents Today */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-450 block tracking-wider">Incidents Today</span>
            <div className="text-xl font-black text-amber-600 mt-1">42</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Reported incidents</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={18} />
          </div>
        </div>

      </div>

      {/* Main Map View Space */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Map Header with controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          
          <div className="flex items-center gap-3">
            {/* Location selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none font-bold"
            >
              <option>Bhimavaram</option>
              <option>Eluru</option>
              <option>Vijayawada</option>
            </select>

            {/* Search map input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search location, camera, or place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs w-64 focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Widget Controls */}
            <div className="flex bg-slate-100 rounded-xl border border-slate-200 p-0.5 text-slate-600">
              <button className="p-2 hover:bg-white rounded-lg transition" title="Zoom In">
                <Plus size={14} />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition" title="Zoom Out">
                <Minus size={14} />
              </button>
            </div>
            
            <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600" title="Refresh Map">
              <RefreshCw size={14} />
            </button>
            
            <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center gap-1 text-xs font-semibold">
              <Layers size={14} />
              <span>Layers</span>
            </button>
          </div>
        </div>

        {/* Map Drawing Box */}
        <div className="relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden min-h-[420px] flex items-center justify-center">
          
          {/* Custom SVG Map Canvas representation */}
          <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 600 400" fill="none">
            {/* Grid */}
            <defs>
              <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* Canal Watercourse */}
            <path d="M 120 400 Q 240 280 236 170 T 360 0" fill="none" stroke="#93C5FD" strokeWidth="24" strokeLinecap="round" />
            <path d="M 120 400 Q 240 280 236 170 T 360 0" fill="none" stroke="#BFDBFE" strokeWidth="18" strokeLinecap="round" />

            {/* Main Highways (NH-216) */}
            {/* Horizontal route */}
            <path d="M 0 170 C 200 170 300 170 600 170" stroke="#CBD5E1" strokeWidth="18" fill="none" />
            <path d="M 0 170 C 200 170 300 170 600 170" stroke="#F1F5F9" strokeWidth="14" fill="none" />
            <path d="M 0 170 C 200 170 300 170 600 170" stroke="#F8FAFC" strokeWidth="1" strokeDasharray="6,6" fill="none" />

            {/* Diagonal route (Sankar Road) */}
            <path d="M 0 60 L 600 280" stroke="#E2E8F0" strokeWidth="12" fill="none" />
            <path d="M 0 60 L 600 280" stroke="#F8FAFC" strokeWidth="8" fill="none" />

            {/* Vertical routes */}
            <path d="M 236 0 L 236 400" stroke="#E2E8F0" strokeWidth="10" fill="none" />
            
            {/* Hub-and-Spoke lines (Screenshot 6 visual styling) */}
            {/* Lines originating from the central junction hub at (236, 170) */}
            <line x1="236" y1="170" x2="320" y2="110" stroke="#EF4444" strokeWidth="1.5" /> {/* Red line to Alert camera */}
            <line x1="236" y1="170" x2="140" y2="155" stroke="#8B5CF6" strokeWidth="1.5" /> {/* Purple line to PTZ */}
            <line x1="236" y1="170" x2="236" y2="150" stroke="#10B981" strokeWidth="1.5" /> {/* Green line to active */}
            <line x1="236" y1="170" x2="180" y2="200" stroke="#94A3B8" strokeWidth="1.5" /> {/* Grey line to inactive */}
            <line x1="236" y1="170" x2="238" y2="195" stroke="#F59E0B" strokeWidth="1.5" /> {/* Yellow line to incident */}
            {/* Spoke connectors */}
            <line x1="236" y1="170" x2="204" y2="105" stroke="#8B5CF6" strokeWidth="1.5" />
            <line x1="236" y1="170" x2="270" y2="110" stroke="#10B981" strokeWidth="1.5" />
            <line x1="236" y1="170" x2="260" y2="172" stroke="#EF4444" strokeWidth="1.5" />
            <line x1="236" y1="170" x2="276" y2="220" stroke="#10B981" strokeWidth="1.5" />
            <line x1="236" y1="170" x2="210" y2="250" stroke="#94A3B8" strokeWidth="1.5" />

            {/* Labels */}
            <text x="30" y="156" fill="#94A3B8" fontSize="10" fontWeight="bold">NH-216 Highway</text>
            <text x="248" y="24" fill="#94A3B8" fontSize="8" fontWeight="bold">Bhimavaram Junction Canal</text>
            <text x="440" y="100" fill="#94A3B8" fontSize="9" fontWeight="bold">Ventarmlachia Rao Pet</text>
            <text x="445" y="270" fill="#94A3B8" fontSize="8" fontWeight="medium">JNTU College of Engineering</text>
            <text x="260" y="320" fill="#64748B" fontSize="10" fontWeight="black">BHIMAVARAM</text>
          </svg>

          {/* Central Hub Marker */}
          <div className="absolute top-[170px] left-[236px] -translate-x-1/2 -translate-y-1/2">
            <div className="h-7 w-7 rounded-full bg-[#0C2540] border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="text-white" size={14} />
            </div>
          </div>

          {/* Pins mapped dynamically */}
          {filteredNodes.map((node) => {
            const getColorClass = () => {
              switch (node.type) {
                case 'active': return 'bg-emerald-500 border-emerald-100 text-white';
                case 'ptz': return 'bg-purple-500 border-purple-100 text-white';
                case 'alert': return 'bg-red-500 border-red-100 text-white';
                case 'inactive': return 'bg-slate-400 border-slate-200 text-white';
                default: return 'bg-amber-500 border-amber-100 text-white';
              }
            };
            
            const isFocused = selectedNode?.id === node.id;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute p-1.5 rounded-full border-2 shadow-md transition-all ${getColorClass()} ${
                  isFocused ? 'scale-125 ring-4 ring-[#0C2540]/30 z-20' : 'hover:scale-110'
                }`}
                style={{ top: `${node.y}px`, left: `${node.x}px`, transform: 'translate(-50%, -50%)' }}
              >
                {node.type === 'incident' ? (
                  <AlertTriangle size={10} />
                ) : (
                  <Camera size={10} />
                )}
              </button>
            );
          })}

          {/* Floating Details Popup Drawer (If selected node is active) */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xl max-w-sm w-full z-30">
              <div className="flex justify-between items-start">
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800">{selectedNode.name}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedNode.status.includes('Online') ? 'bg-emerald-100 text-emerald-700' :
                      selectedNode.status.includes('Alert') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">
                    {selectedNode.locationDetails}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 font-bold text-slate-600">
                  <Info size={12} />
                  <span>{selectedNode.value}</span>
                </div>
                <span className="text-slate-400">Update: {selectedNode.lastUpdate}</span>
              </div>
            </div>
          )}

          {/* Leaflet OSM attribution */}
          <div className="absolute bottom-1 right-1 bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 uppercase tracking-tight pointer-events-none">
            Leaflet | © OpenStreetMap contributors
          </div>

        </div>

        {/* Legend row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 block"></span>
            <span>Active Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500 block"></span>
            <span>PTZ Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 block"></span>
            <span>Camera with Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-400 block"></span>
            <span>Inactive Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 block"></span>
            <span>Incident Location</span>
          </div>
        </div>

      </div>

    </div>
  );
};
