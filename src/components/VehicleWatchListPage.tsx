import React, { useState } from 'react';
import {
  Shield,
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  MoreVertical,
  Sliders,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { WatchedVehicle } from '../mockData';

interface VehicleWatchListPageProps {
  watchList: WatchedVehicle[];
  onAddWatchItem: (newVehicle: WatchedVehicle) => void;
}

export const VehicleWatchListPage: React.FC<VehicleWatchListPageProps> = ({
  watchList,
  onAddWatchItem
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Stolen' | 'Cloned'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [watchTypeFilter, setWatchTypeFilter] = useState('All Watch Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [colorFilter, setColorFilter] = useState('All Colors');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add Watch List Fields
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState<'Stolen' | 'Cloned'>('Stolen');
  const [newBrand, setNewBrand] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newBrand.trim() || !newColor.trim()) return;

    onAddWatchItem({
      id: `W-00${watchList.length + 1}`,
      plateNumber: newPlate.toUpperCase(),
      watchType: newType,
      brandModel: newBrand,
      color: newColor,
      addedOn: new Date().toLocaleString(),
      addedBy: 'Admin User (Indlis Admin)',
      locationAdded: newLocation || 'Manual Entry',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=120&auto=format&fit=crop&q=60'
    });

    // Reset
    setNewPlate('');
    setNewType('Stolen');
    setNewBrand('');
    setNewColor('');
    setNewLocation('');
    setAddModalOpen(false);
  };

  // Tab Filtering
  const getTabFilteredList = () => {
    if (activeTab === 'Stolen') return watchList.filter(v => v.watchType === 'Stolen');
    if (activeTab === 'Cloned') return watchList.filter(v => v.watchType === 'Cloned');
    return watchList;
  };

  const currentTabList = getTabFilteredList();

  // Advanced filters
  const filteredList = currentTabList.filter(v => {
    const matchesSearch = v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.brandModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWatchType = watchTypeFilter === 'All Watch Types' || v.watchType === watchTypeFilter;
    const matchesStatus = statusFilter === 'All Status' || v.status === statusFilter;
    const matchesColor = colorFilter === 'All Colors' || v.color === colorFilter;
    const matchesBrand = brandFilter === 'All Brands' || v.brandModel.includes(brandFilter);

    return matchesSearch && matchesWatchType && matchesStatus && matchesColor && matchesBrand;
  });

  // Calculate Metrics from visuals (Screenshot 9)
  const stolenCount = watchList.filter(v => v.watchType === 'Stolen').length + 351;
  const clonedCount = watchList.filter(v => v.watchType === 'Cloned').length + 186;
  const totalCount = stolenCount + clonedCount;
  const recentAddCount = 24;

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Plate,Type,Model,Color,Added On,Operator,Status"].join(",") + "\n"
      + filteredList.map(v => `"${v.plateNumber}","${v.watchType}","${v.brandModel}","${v.color}","${v.addedOn}","${v.addedBy}","${v.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trinethra_watchlist.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row (Screenshot 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stolen Vehicles */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Stolen Vehicles</span>
            <div className="text-xl font-black text-red-600 mt-1">{stolenCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Active in watch list</span>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <Shield size={20} />
          </div>
        </div>

        {/* Cloned Vehicles */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Cloned Vehicles</span>
            <div className="text-xl font-black text-purple-600 mt-1">{clonedCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Active in watch list</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Shield size={20} />
          </div>
        </div>

        {/* Total Watch List */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Watch List</span>
            <div className="text-xl font-black text-[#0C2540] mt-1">{totalCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">All stolen + cloned</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Shield size={20} />
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Recently Added</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{recentAddCount}</div>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">In last 7 days</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <PlusCircle size={20} />
          </div>
        </div>

      </div>

      {/* Advanced search and filters (Screenshot 9) */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Inputs */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Plate Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by plate, chassis, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
            />
          </div>

          {/* Watch Type dropdown */}
          <select
            value={watchTypeFilter}
            onChange={(e) => setWatchTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none font-semibold"
          >
            <option>All Watch Types</option>
            <option>Stolen</option>
            <option>Cloned</option>
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none font-semibold"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Flagged</option>
            <option>Resolved</option>
          </select>

          {/* Colors dropdown */}
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none font-semibold"
          >
            <option>All Colors</option>
            <option>White</option>
            <option>Red</option>
            <option>Black</option>
            <option>Silver</option>
            <option>Blue</option>
          </select>

          {/* Brands dropdown */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:outline-none font-semibold"
          >
            <option>All Brands</option>
            <option>Hyundai</option>
            <option>Maruti</option>
            <option>Bajaj</option>
            <option>Honda</option>
          </select>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600">
            <Sliders size={14} />
            <span>More Filters</span>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Export CSV"
          >
            <FileSpreadsheet size={14} />
          </button>
          
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#0C2540] hover:bg-[#18385A] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          {(['All', 'Stolen', 'Cloned'] as const).map((tab) => {
            const counts = tab === 'All' ? totalCount : tab === 'Stolen' ? stolenCount : clonedCount;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
                  isActive
                    ? 'border-[#0C2540] text-[#0C2540] font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{tab === 'All' ? 'All Vehicles' : tab + ' Vehicles'}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#0C2540] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {counts}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Table Data Grid */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#FAF8F5] text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 w-10">
                  <input type="checkbox" className="rounded text-[#0C2540] focus:ring-[#0C2540]" />
                </th>
                <th className="px-6 py-3.5">Vehicle / Plate</th>
                <th className="px-6 py-3.5">Watch Type</th>
                <th className="px-6 py-3.5">Brand / Model</th>
                <th className="px-6 py-3.5">Color</th>
                <th className="px-6 py-3.5">Added On</th>
                <th className="px-6 py-3.5">Added By</th>
                <th className="px-6 py-3.5">Location Added</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredList.map((veh) => (
                <tr key={veh.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded text-[#0C2540] focus:ring-[#0C2540]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={veh.image}
                        alt="Vehicle Thumbnail"
                        className="h-10 w-14 rounded object-cover border border-slate-200 bg-slate-100"
                      />
                      <div>
                        <div className="font-mono font-bold tracking-tight text-slate-850 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {veh.plateNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      veh.watchType === 'Stolen'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {veh.watchType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {veh.brandModel}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`h-2.5 w-2.5 rounded-full border border-slate-300 block ${
                        veh.color === 'White' ? 'bg-white' :
                        veh.color === 'Red' ? 'bg-red-600' :
                        veh.color === 'Black' ? 'bg-black' :
                        veh.color === 'Silver' ? 'bg-slate-300' : 'bg-blue-600'
                      }`}></span>
                      <span>{veh.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {veh.addedOn}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {veh.addedBy.split(' (')[0]}
                    <span className="text-[9px] text-slate-400 font-semibold block">{veh.addedBy.includes('(') ? veh.addedBy.slice(veh.addedBy.indexOf('(')) : ''}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {veh.locationAdded}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      veh.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {veh.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500" title="View details">
                        <Eye size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500" title="Edit entry">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No vehicles found matching filters in the watch list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredList.length} of {filteredList.length} vehicles</span>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-400">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-[#0C2540] text-white rounded-lg font-black shadow-sm">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">3</button>
            <span>...</span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">55</button>
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Add Vehicle Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0C2540] text-white font-bold flex justify-between items-center">
              <span>Add Vehicle to Watch List</span>
              <button onClick={() => setAddModalOpen(false)} className="text-white hover:text-slate-200 font-black text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., AP09 AB 1234"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase font-sans">Watch Type</label>
                <div className="flex gap-2">
                  {(['Stolen', 'Cloned'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border uppercase transition ${
                        newType === type
                          ? type === 'Stolen' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Brand & Model</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Hyundai i20"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Color</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., White"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Location flag added</label>
                <input
                  type="text"
                  placeholder="E.g., Main St (CAM-1024)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 text-xs rounded-xl focus:outline-none"
                />
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
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
