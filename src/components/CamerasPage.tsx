import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Wrench,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Camera as CameraType } from '../mockData';

interface CamerasPageProps {
  cameras: CameraType[];
  onAddCamera: (newCam: CameraType) => void;
  onViewFeed: () => void;
}

export const CamerasPage: React.FC<CamerasPageProps> = ({
  cameras,
  onAddCamera,
  onViewFeed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add camera fields
  const [newCamId, setNewCamId] = useState('');
  const [newCamLoc, setNewCamLoc] = useState('');
  const [newCamType, setNewCamType] = useState<'PTZ' | 'Fixed' | 'Dome'>('PTZ');
  const [newCamStatus, setNewCamStatus] = useState<'Online' | 'Offline' | 'Maintenance'>('Online');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamId.trim() || !newCamLoc.trim()) return;

    onAddCamera({
      id: newCamId,
      name: newCamId,
      location: newCamLoc,
      status: newCamStatus,
      type: newCamType,
      lastSeen: new Date().toLocaleString(),
      uptime: newCamStatus === 'Online' ? 100 : newCamStatus === 'Maintenance' ? 50 : 0,
      thumbnail: ''
    });

    // Reset
    setNewCamId('');
    setNewCamLoc('');
    setNewCamType('PTZ');
    setNewCamStatus('Online');
    setAddModalOpen(false);
  };

  // Filter logic
  const filteredCameras = cameras.filter((cam) => {
    const matchesSearch = cam.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cam.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || cam.status === statusFilter;
    const matchesLocation = locationFilter === 'All Locations' || cam.location.includes(locationFilter);
    const matchesType = typeFilter === 'All Types' || cam.type === typeFilter;

    return matchesSearch && matchesStatus && matchesLocation && matchesType;
  });

  // Calculate Summary metrics
  const totalCount = cameras.length;
  const onlineCount = cameras.filter(c => c.status === 'Online').length;
  const offlineCount = cameras.filter(c => c.status === 'Offline').length;
  const maintenanceCount = cameras.filter(c => c.status === 'Maintenance').length;
  const ptzCount = cameras.filter(c => c.type === 'PTZ').length;

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      
      {/* Cards Row */}
      <div className="grid grid-cols-5 gap-2 flex-shrink-0">
        
        {/* Total Cameras */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-[#0A2540] rounded-xl p-2.5 shadow-sm gov-card-interactive flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">Total Cameras</span>
            <div className="text-2xl font-black text-[#0A2540] mt-0.5 tracking-tight">{totalCount}</div>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
              Across 128 locations
            </span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-100 text-[#0A2540] rounded-lg relative z-10 shadow-sm group-hover:bg-[#0A2540] group-hover:text-white transition-colors duration-300">
            <Camera size={16} />
          </div>
        </div>

        {/* Online Cameras */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-emerald-500 rounded-xl p-2.5 shadow-sm gov-card-interactive flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">Online Cameras</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5 tracking-tight">{onlineCount}</div>
            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{(onlineCount/totalCount*100).toFixed(1)}% online</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg relative z-10 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Offline Cameras */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-red-500 rounded-xl p-2.5 shadow-sm gov-card-interactive flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">Offline Cameras</span>
            <div className="text-2xl font-black text-red-600 mt-0.5 tracking-tight">{offlineCount}</div>
            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{(offlineCount/totalCount*100).toFixed(1)}% offline</span>
          </div>
          <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg relative z-10 shadow-sm group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
            <XCircle size={16} />
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-amber-500 rounded-xl p-2.5 shadow-sm gov-card-interactive flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">Maintenance</span>
            <div className="text-2xl font-black text-amber-500 mt-0.5 tracking-tight">{maintenanceCount}</div>
            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{(maintenanceCount/totalCount*100).toFixed(1)}% of total</span>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg relative z-10 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
            <Wrench size={16} />
          </div>
        </div>

        {/* PTZ Cameras */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-purple-500 rounded-xl p-2.5 shadow-sm gov-card-interactive flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">PTZ Cameras</span>
            <div className="text-2xl font-black text-purple-600 mt-0.5 tracking-tight">{ptzCount}</div>
            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{(ptzCount/totalCount*100).toFixed(1)}% of total</span>
          </div>
          <div className="p-2 bg-purple-50 border border-purple-100 text-purple-600 rounded-lg relative z-10 shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
            <Camera size={16} />
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-2 shadow-sm flex items-center justify-between gap-2 flex-shrink-0">
        
        {/* Left filters */}
        <div className="flex items-center gap-2 flex-1">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="Search by camera name, location, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-[#0A2540]/20 text-[#0A2540] text-[10px] rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0A2540] font-bold cursor-pointer hover:bg-[#0A2540]/5 transition-colors"
          >
            <option>All Status</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Maintenance</option>
          </select>

          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <option>All Locations</option>
            <option>Main St</option>
            <option>I-9 Overpass</option>
            <option>Harbor Rd</option>
            <option>City Center</option>
            <option>Riverside</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-purple-50 border border-purple-200 text-purple-800 text-[10px] rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400 font-bold cursor-pointer hover:bg-purple-100 transition-colors"
          >
            <option>All Types</option>
            <option>PTZ</option>
            <option>Fixed</option>
            <option>Dome</option>
          </select>

          {/* More filters */}
          <button 
            onClick={() => { setStatusFilter('All Status'); setLocationFilter('All Locations'); setTypeFilter('All Types'); setSearchTerm(''); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
          >
            <Sliders size={11} />
            <span>Reset All</span>
          </button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); setLocationFilter('All Locations'); setTypeFilter('All Types'); }}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw size={12} />
          </button>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#0A2540] hover:bg-[#18385A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
          >
            <Plus size={12} />
            <span>Add Camera</span>
          </button>
        </div>

      </div>

      {/* Grid/Table List Container */}
      <div className="flex-1 min-h-0 bg-white border border-[#0A2540]/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
        <div className="overflow-y-auto flex-1 min-h-0">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#0A2540] text-[10px] font-black text-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 w-10">
                  <input type="checkbox" className="rounded text-[#FF9933] focus:ring-[#FF9933] border-slate-500" />
                </th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Camera</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Location</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Status</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Type</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Last Seen</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Uptime</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCameras.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-50 transition-colors duration-200 group border-l-4 border-l-transparent hover:border-l-[#FF9933]">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded text-[#0A2540] focus:ring-[#0A2540]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cam.thumbnail}
                        alt={cam.id}
                        className="h-10 w-14 rounded object-cover border border-slate-200 bg-slate-100"
                      />
                      <div>
                        <div className="font-extrabold text-slate-800">{cam.id}</div>
                        <span className="text-[10px] text-slate-500 font-medium">{cam.location.split(' & ')[0]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">
                    {cam.location}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      cam.status === 'Online' ? 'bg-emerald-100 text-emerald-700' :
                      cam.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        cam.status === 'Online' ? 'bg-emerald-500' :
                        cam.status === 'Offline' ? 'bg-red-500' : 'bg-amber-500'
                      }`}></span>
                      {cam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      cam.type === 'PTZ' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      cam.type === 'Dome' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {cam.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {cam.lastSeen}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${cam.uptime > 95 ? 'text-emerald-600' : cam.uptime > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                        {cam.uptime}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={onViewFeed} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="View Stream">
                        <Eye size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Edit Camera">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCameras.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-semibold">
                    No cameras found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Showing {filteredCameras.length > 0 ? 1 : 0} to {filteredCameras.length} of {cameras.length} cameras</span>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-400">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-[#0A2540] text-white rounded-lg font-black shadow-sm">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">3</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">4</button>
            <span>...</span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">13</button>
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-400">
              <ChevronRight size={16} />
            </button>

            {/* Dropdown page size */}
            <select className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none text-xs ml-4">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>

      </div>

      {/* Add Camera Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0A2540] text-white font-bold flex justify-between items-center">
              <span>Register New Camera Node</span>
              <button onClick={() => setAddModalOpen(false)} className="text-white hover:text-slate-200 font-black text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Camera ID</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., CAM-1282"
                  value={newCamId}
                  onChange={(e) => setNewCamId(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Location Description</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Junction 9 - Outer Ring Rd"
                  value={newCamLoc}
                  onChange={(e) => setNewCamLoc(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Camera Type</label>
                  <select
                    value={newCamType}
                    onChange={(e) => setNewCamType(e.target.value as any)}
                    className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none"
                  >
                    <option>PTZ</option>
                    <option>Fixed</option>
                    <option>Dome</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Status</label>
                  <select
                    value={newCamStatus}
                    onChange={(e) => setNewCamStatus(e.target.value as any)}
                    className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none"
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A2540] hover:bg-[#18385A] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
