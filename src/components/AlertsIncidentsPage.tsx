import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Alert as AlertType } from '../mockData';

interface AlertsIncidentsPageProps {
  alerts: AlertType[];
  onResolveAlert: (id: string) => void;
}

export const AlertsIncidentsPage: React.FC<AlertsIncidentsPageProps> = ({
  alerts,
  onResolveAlert
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Fined' | 'Stolen' | 'Cloned'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter] = useState('All Alert Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [startDate, setStartDate] = useState('2026-05-18');
  const [endDate, setEndDate] = useState('2026-08-18');
  
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);

  // Tab Filtering
  const getTabFilteredAlerts = () => {
    switch (activeTab) {
      case 'Fined':
        return alerts.filter(a => a.type === 'Fine Issued' || a.type === 'Speed Violation' || a.type === 'No Helmet');
      case 'Stolen':
        return alerts.filter(a => a.type === 'Stolen Vehicle');
      case 'Cloned':
        return alerts.filter(a => a.type === 'Cloned Vehicle');
      default:
        return alerts;
    }
  };

  const currentTabAlerts = getTabFilteredAlerts();

  // Advanced Filtering
  const filteredAlerts = currentTabAlerts.filter(alert => {
    const matchesSearch = alert.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.vehicleDetails.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || alert.location.includes(locationFilter);
    
    let matchesType = true;
    if (typeFilter !== 'All Alert Types') {
      if (typeFilter === 'Fines') {
        matchesType = alert.type === 'Fine Issued' || alert.type === 'Speed Violation' || alert.type === 'No Helmet';
      } else if (typeFilter === 'Stolen') {
        matchesType = alert.type === 'Stolen Vehicle';
      } else if (typeFilter === 'Cloned') {
        matchesType = alert.type === 'Cloned Vehicle';
      }
    }

    const matchesStatus = statusFilter === 'All Status' || alert.status === statusFilter;

    return matchesSearch && matchesLocation && matchesType && matchesStatus;
  });

  // Calculate statistics metrics
  const totalCount = 1248 + alerts.length - 6;
  const activeCount = alerts.filter(a => a.status === 'Active' || a.status === 'Pending').length + 80;
  const finedCount = alerts.filter(a => a.type === 'Fine Issued' || a.type === 'Speed Violation' || a.type === 'No Helmet').length + 306;
  const stolenCount = alerts.filter(a => a.type === 'Stolen Vehicle').length + 43;
  const clonedCount = alerts.filter(a => a.type === 'Cloned Vehicle').length + 26;

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredAlerts, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `trinethra_alerts_${activeTab.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-2 flex-shrink-0">
        
        {/* Total Alerts */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-[#0A2540] rounded-xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Total Alerts</span>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-[#0A2540] mt-0.5">{totalCount}</div>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">All time logged cases</span>
          </div>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <AlertTriangle size={14} />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-red-500 rounded-xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Active Alerts</span>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-red-600 mt-0.5">{activeCount}</div>
            <span className="text-[8px] text-red-500 font-semibold block mt-0.5">Requires attention</span>
          </div>
          <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={14} />
          </div>
        </div>

        {/* Fined Vehicles */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-slate-500 rounded-xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Fined Vehicles</span>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 mt-0.5">{finedCount}</div>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5">↑ 12.4% this month</span>
          </div>
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
            <FileText size={14} />
          </div>
        </div>

        {/* Stolen Vehicles */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-indigo-500 rounded-xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Stolen Vehicles</span>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-indigo-600 mt-0.5">{stolenCount}</div>
            <span className="text-[8px] text-purple-600 font-bold block mt-0.5">↑ 8.7% active cases</span>
          </div>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <AlertTriangle size={14} />
          </div>
        </div>

        {/* Cloned Vehicles */}
        <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-orange-500 rounded-xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-2.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Cloned Vehicles</span>
            <div className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-orange-600 mt-0.5">{clonedCount}</div>
            <span className="text-[8px] text-amber-500 font-bold block mt-0.5">↑ 15.2% investigating</span>
          </div>
          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
            <AlertTriangle size={14} />
          </div>
        </div>

      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-200 flex-shrink-0">
        <nav className="flex gap-4 -mb-px">
          {(['All', 'Fined', 'Stolen', 'Cloned'] as const).map((tab) => {
            const counts = tab === 'All' ? totalCount : tab === 'Fined' ? finedCount : tab === 'Stolen' ? stolenCount : clonedCount;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1.5 text-[10px] font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'border-[#0A2540] text-[#0A2540] font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{tab === 'All' ? 'All Alerts' : tab + ' Vehicles'}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#0A2540] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {counts}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-[#E2E8F0] border-t-2 border-t-[#0A2540] rounded-xl p-2 shadow-sm flex items-center gap-2 flex-shrink-0 flex-wrap">
        
        {/* Date range */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[10px]">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-600 font-semibold text-[10px]"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-600 font-semibold text-[10px]"
          />
        </div>

        {/* Location filter */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <option>All Locations</option>
          <option>Main St</option>
          <option>I-9 Overpass</option>
          <option>Harbor Rd</option>
          <option>City Center</option>
          <option>Riverside</option>
        </select>

        {/* Alert Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <option>All Alert Types</option>
          <option value="Fines">Fines &amp; Violations</option>
          <option value="Stolen">Stolen Vehicles</option>
          <option value="Cloned">Cloned Vehicles</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
        >
          <option>All Status</option>
          <option>Unpaid</option>
          <option>Active</option>
          <option>Under Review</option>
          <option>Pending</option>
          <option>Resolved</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
            <Search size={11} />
          </span>
          <input
            type="text"
            placeholder="Search by plate, ID, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-6 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
          />
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer ml-auto"
        >
          <Download size={11} />
          Export
        </button>
      </div>

      {/* Table Data Grid */}
      <div className="flex-1 min-h-0 bg-white border border-[#E2E8F0] border-t-2 border-t-[#0A2540] rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-y-auto flex-1 min-h-0">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#0A2540] text-[10px] font-black text-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Alert ID</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Type</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Plate Number</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Vehicle Details</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Location / Camera</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Time & Date</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Status</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 transition-colors duration-200 group border-l-4 border-l-transparent hover:border-l-[#FF9933]">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-800">{alert.id}</div>
                    <span className="text-[10px] text-slate-400 font-semibold">#18291</span>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      alert.type === 'Fine Issued' ? 'bg-red-50 text-red-600 border border-red-100' :
                      alert.type === 'Speed Violation' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      alert.type === 'No Helmet' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      alert.type === 'Stolen Vehicle' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold tracking-tight text-slate-800">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {alert.plateNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={alert.vehicleDetails.image}
                        alt="Vehicle"
                        className="h-8 w-12 rounded object-cover border border-slate-200 bg-slate-100"
                      />
                      <div className="leading-tight">
                        <div className="font-bold text-slate-800">{alert.vehicleDetails.brand} {alert.vehicleDetails.model}</div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">{alert.vehicleDetails.color} • {alert.vehicleDetails.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700">{alert.location}</div>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 mt-0.5">
                      <MapPin size={10} />
                      {alert.camera}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {alert.timeDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      alert.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                      alert.status === 'Active' ? 'bg-purple-100 text-purple-700' :
                      alert.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                      alert.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700' // Unpaid
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="Quick View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No matching alerts found in database logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination (Screenshot 1 footer) */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredAlerts.length} of {filteredAlerts.length} alerts</span>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 text-slate-400">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-[#0A2540] text-white rounded-lg font-black shadow-sm">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300">3</button>
            <span>...</span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300">125</button>
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 text-slate-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Alert Details / Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-[#0A2540] text-white font-bold flex justify-between items-center">
              <span>Alert Case Details - {selectedAlert.id}</span>
              <button onClick={() => setSelectedAlert(null)} className="text-white hover:text-slate-200 font-black text-sm">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <img
                  src={selectedAlert.vehicleDetails.image}
                  alt="Vehicle Image"
                  className="h-20 w-28 rounded object-cover border border-slate-200"
                />
                <div className="space-y-1">
                  <div className="text-lg font-black text-slate-800 font-mono">{selectedAlert.plateNumber}</div>
                  <div className="font-bold text-slate-600">{selectedAlert.vehicleDetails.brand} {selectedAlert.vehicleDetails.model}</div>
                  <div className="text-slate-500 font-semibold uppercase">{selectedAlert.vehicleDetails.color} • {selectedAlert.vehicleDetails.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Incident Type</span>
                  <div className="font-bold text-[#0A2540]">{selectedAlert.type}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Reporting Camera</span>
                  <div className="font-bold text-slate-700">{selectedAlert.camera} - {selectedAlert.location}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Timestamp</span>
                  <div className="font-semibold text-slate-500">{selectedAlert.timeDate}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Status</span>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 uppercase">
                      {selectedAlert.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                {selectedAlert.status !== 'Resolved' && (
                  <button
                    onClick={() => {
                      onResolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <CheckCircle size={14} />
                    <span>Resolve Incident</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
