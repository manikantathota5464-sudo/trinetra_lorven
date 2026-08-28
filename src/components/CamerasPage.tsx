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
      lastSeen: '08:19:00 AM, 18 Aug, 2026',
      uptime: newCamStatus === 'Online' ? 99.8 : newCamStatus === 'Maintenance' ? 96.5 : 0,
      thumbnail: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
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
  const totalCount = cameras.length + 1156; // Mock to scale it to the visual total of 1284
  const onlineCount = cameras.filter(c => c.status === 'Online').length + 1034;
  const offlineCount = cameras.filter(c => c.status === 'Offline').length + 241;
  const maintenanceCount = cameras.filter(c => c.status === 'Maintenance').length + 16;
  const ptzCount = cameras.filter(c => c.type === 'PTZ').length + 307;

  return (
    <div className="space-y-6">
      
      {/* Cards Row (Screenshot 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Cameras</span>
            <div className="text-xl font-black text-[#0C2540] mt-1">{totalCount}</div>
            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Across 128 locations</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Camera size={20} />
          </div>
        </div>

        {/* Online Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Online Cameras</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{onlineCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{(onlineCount/totalCount*100).toFixed(1)}% online</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Offline Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Offline Cameras</span>
            <div className="text-xl font-black text-red-600 mt-1">{offlineCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{(offlineCount/totalCount*100).toFixed(1)}% offline</span>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <XCircle size={20} />
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Maintenance</span>
            <div className="text-xl font-black text-amber-600 mt-1">{maintenanceCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{(maintenanceCount/totalCount*100).toFixed(1)}% of total</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench size={20} />
          </div>
        </div>

        {/* PTZ Cameras */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">PTZ Cameras</span>
            <div className="text-xl font-black text-purple-600 mt-1">{ptzCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{(ptzCount/totalCount*100).toFixed(1)}% of total</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Camera size={20} />
          </div>
        </div>

      </div>

      {/* Search and Filters Segment (Screenshot 3) */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by camera name, location, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0C2540] font-semibold"
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
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0C2540] font-semibold"
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
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0C2540] font-semibold"
          >
            <option>All Types</option>
            <option>PTZ</option>
            <option>Fixed</option>
            <option>Dome</option>
          </select>

          {/* More filters */}
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600">
            <Sliders size={14} />
            <span>More Filters</span>
          </button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); setLocationFilter('All Locations'); setTypeFilter('All Types'); }}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Reset Filters"
          >
            <RefreshCw size={14} />
          </button>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#0C2540] hover:bg-[#18385A] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Camera</span>
          </button>
        </div>

      </div>

      {/* Grid/Table List Container */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#FAF8F5] text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 w-10">
                  <input type="checkbox" className="rounded text-[#0C2540] focus:ring-[#0C2540]" />
                </th>
                <th className="px-6 py-3.5">Camera</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Last Seen</th>
                <th className="px-6 py-3.5">Uptime</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCameras.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded text-[#0C2540] focus:ring-[#0C2540]" />
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

        {/* Table Pagination (Screenshot 3 footer) */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredCameras.length} of {cameras.length + 120} cameras</span>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-400">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-[#0C2540] text-white rounded-lg font-black shadow-sm">1</button>
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
            <div className="p-4 bg-[#0C2540] text-white font-bold flex justify-between items-center">
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
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
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
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
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
                  className="px-4 py-2 bg-[#0C2540] hover:bg-[#18385A] text-white rounded-xl text-xs font-bold shadow-sm"
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
