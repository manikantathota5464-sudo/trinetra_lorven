import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  initialReports,
  detectionsOverTime,
  detectionsByVehicleType,
  detectionsByHour
} from '../mockData';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('All Reports');
  const [location, setLocation] = useState('Bhimavaram');
  const [cameraFilter, setCameraFilter] = useState('All Cameras');
  const [vehicleType, setVehicleType] = useState('All Types');
  const [startDate, setStartDate] = useState('2025-05-11');
  const [endDate, setEndDate] = useState('2025-05-17');
  const [activeTab, setActiveTab] = useState<'All' | 'Detection' | 'Alert' | 'Violation'>('All');

  // Filtered reports
  const filteredReports = initialReports.filter(rep => {
    const matchesTab = activeTab === 'All' || 
                       (activeTab === 'Detection' && rep.type === 'Detection') ||
                       (activeTab === 'Alert' && rep.type === 'Alerts') ||
                       (activeTab === 'Violation' && rep.type === 'Violation');
    return matchesTab;
  });

  const handleExport = (reportName: string) => {
    alert(`Downloading ${reportName}... (CSV/PDF Export Triggered)`);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Filter Header (Screenshot 7) */}
      <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-5 shadow-sm space-y-4">
        
        {/* Title row */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Reports Overview</h3>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
              Dashboard &gt; Reports
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Date range selection */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Calendar size={14} className="text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-600 font-semibold"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-600 font-semibold"
              />
            </div>

            <button
              onClick={() => handleExport('Filtered Report Summary')}
              className="bg-orange-50 hover:bg-orange-100 text-orange-850 px-4 py-2 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download size={14} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Filters form inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none font-semibold"
            >
              <option>All Reports</option>
              <option>Detection Reports</option>
              <option>Alert Reports</option>
              <option>Violation Reports</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none font-semibold"
            >
              <option>Bhimavaram</option>
              <option>Visakhapatnam</option>
              <option>Vijayawada</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Camera</label>
            <select
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none font-semibold"
            >
              <option>All Cameras</option>
              <option>CAM-1024</option>
              <option>CAM-0785</option>
              <option>CAM-0456</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none font-semibold"
            >
              <option>All Types</option>
              <option>Car</option>
              <option>Bike</option>
              <option>Truck</option>
              <option>Bus</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-[#0A2540] hover:bg-[#18385A] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
              Apply Filters
            </button>
            <button
              onClick={() => { setReportType('All Reports'); setLocation('Bhimavaram'); setCameraFilter('All Cameras'); setVehicleType('All Types'); }}
              className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 rounded-xl text-slate-600 transition"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Summary Stats Row (Screenshot 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Detections */}
        <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Detections</span>
          <div className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 mt-1">18,745</div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-1">
            <TrendingUp size={10} />
            <span>+12.4% vs 04 May - 10 May 2025</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Active Alerts</span>
          <div className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-red-600 mt-1">86</div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-red-600 mt-1">
            <TrendingUp size={10} />
            <span>+8.6% vs 04 May - 10 May 2025</span>
          </div>
        </div>

        {/* Stolen Vehicles */}
        <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Stolen Vehicles</span>
          <div className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 mt-1">24</div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 mt-1">
            <TrendingDown size={10} />
            <span>-9.1% vs 04 May - 10 May 2025</span>
          </div>
        </div>

        {/* Cloned Vehicles */}
        <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Cloned Vehicles</span>
          <div className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 mt-1">31</div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-1">
            <TrendingUp size={10} />
            <span>+14.8% vs 04 May - 10 May 2025</span>
          </div>
        </div>

        {/* Fined Vehicles */}
        <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Fined Vehicles</span>
          <div className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 mt-1">112</div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-1">
            <TrendingUp size={10} />
            <span>+6.3% vs 04 May - 10 May 2025</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          {(['All', 'Detection', 'Alert', 'Violation'] as const).map((tab) => {
            const label = tab === 'All' ? 'All Reports' : tab + ' Reports';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold transition border-b-2 ${
                  isActive
                    ? 'border-[#0A2540] text-[#0A2540] font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recharts Analytics Section (Screenshot 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Detections Over Time (Line / Area Chart - lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Detections Over Time</h4>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold">Daily</span>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detectionsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="detections" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetections)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detections by Vehicle Type (Donut Chart - lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Detections by Vehicle Type</h4>
          
          <div className="relative h-48 w-full flex items-center justify-center">
            
            {/* Center label inside donut */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-800">18,745</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detectionsByVehicleType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {detectionsByVehicleType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legends list */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
            {detectionsByVehicleType.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full block" style={{ backgroundColor: item.color }}></span>
                <span>{item.name} ({((item.value / 18745) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>

        </div>

        {/* Detections by Hour (Bar Chart - lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Detections by Hour</h4>
            <span className="text-[9px] text-[#0A2540] font-black uppercase tracking-wider">All Cameras</span>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionsByHour} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={8} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={8} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#B38B6D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Report Summary Table (Screenshot 7 bottom) */}
      <div className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative overflow-hidden shadow-sm">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Report Summary</h4>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-[#0A2540] text-[10px] font-black text-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Report Name</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Type</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Location</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Date Range</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Generated On</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50">Summary</th>
                <th className="px-6 py-3.5 border-l border-slate-700/50 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 transition-colors duration-200 group border-l-4 border-l-transparent hover:border-l-[#FF9933]">
                  <td className="px-6 py-4 font-bold text-[#0A2540]">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span>{rep.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      rep.type === 'Detection' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                      rep.type === 'Alerts' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">
                    {rep.location}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {rep.dateRange}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-450">
                    {rep.generatedOn}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {rep.summary}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleExport(rep.name)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#0A2540]"
                        title="Download File"
                      >
                        <Download size={14} />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredReports.length} of 12 reports</span>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 text-slate-400">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-[#0A2540] text-white rounded-lg font-black shadow-sm">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300">2</button>
            <button className="p-1 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300 text-slate-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
