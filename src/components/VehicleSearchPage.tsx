import React, { useState } from 'react';
import { Search, Download, Filter, Car, AlertTriangle, Zap, Eye, Map, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export const VehicleSearchPage: React.FC = () => {
  const [plateQuery, setPlateQuery] = useState('');
  const [matchMode, setMatchMode] = useState<'fuzzy' | 'exact' | 'startsWith' | 'wildcard'>('fuzzy');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [colorFilter, setColorFilter] = useState('All Colors');
  const [cameraFilter, setCameraFilter] = useState('All Cameras');
  const [timeframe, setTimeframe] = useState('24h');
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [showAdvanced, setShowAdvanced] = useState(true);

  const results = [
    { plate: 'AP09 AB 1234', conf: '99.4%', brand: 'Hyundai i20 Sportz', color: 'White', type: 'Hatchback', loc: 'Main St & 5th Ave Intersection', cam: 'CAM-1024', speed: '54 km/h', lane: 'Lane 1 (Fast)', time: '18 Aug 2026, 08:19:23 AM', status: 'Stolen', statusColor: 'red' },
    { plate: 'TS07 CD 5678', conf: '98.7%', brand: 'Maruti Suzuki Swift VXi', color: 'Red', type: 'Hatchback', loc: 'I-9 Overpass Corridor', cam: 'CAM-0785', speed: '88 km/h', lane: 'Lane 2', time: '18 Aug 2026, 08:18:04 AM', status: 'Speeding', statusColor: 'amber' },
    { plate: 'AP16 EF 9012', conf: '96.2%', brand: 'Bajaj Pulsar NS200', color: 'Black', type: 'Motorcycle', loc: 'Harbor Rd Exit Ramp', cam: 'CAM-0456', speed: '42 km/h', lane: 'Lane 3', time: '18 Aug 2026, 08:17:15 AM', status: 'Cloned', statusColor: 'purple' },
    { plate: 'AP39 GH 3456', conf: '99.1%', brand: 'Maruti Suzuki Brezza ZXi', color: 'Silver', type: 'SUV', loc: 'Riverside Park Ring Road', cam: 'CAM-0633', speed: '58 km/h', lane: 'Lane 1', time: '18 Aug 2026, 08:15:48 AM', status: 'Clean', statusColor: 'emerald' },
    { plate: 'TS08 IJ 7890', conf: '95.8%', brand: 'Honda Activa 6G', color: 'Blue', type: 'Scooter', loc: '5th Avenue Market Crossing', cam: 'CAM-1201', speed: '36 km/h', lane: 'Lane 2', time: '18 Aug 2026, 08:14:12 AM', status: 'No Helmet', statusColor: 'amber' },
  ];

  const statusBadge: Record<string, string> = {
    red: 'bg-red-100 text-red-700 border border-red-200',
    amber: 'bg-amber-100 text-amber-800 border border-amber-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200',
    emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#163E66] to-[#0A2540] rounded-xl p-2.5 px-4 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Search size={16} className="text-[#FF9933]" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-300 tracking-wider">TRINETHRA Intelligence Platform — MoRTH ANPR Grid</div>
            <div className="text-sm font-black text-white">Vehicle Intelligence &amp; Cross-Camera Search</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPlateQuery(''); setBrandFilter('All Brands'); setTypeFilter('All Types'); setColorFilter('All Colors'); setCameraFilter('All Cameras'); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 text-[9px] font-bold cursor-pointer"
          >
            <RefreshCw size={11} /> Reset
          </button>
          <button
            onClick={() => alert('Exporting results...')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FF9933] text-white rounded-lg hover:bg-[#e8870e] text-[9px] font-black cursor-pointer"
          >
            <Download size={11} /> Export Results
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 text-[9px] font-bold cursor-pointer"
          >
            <Filter size={11} /> {showAdvanced ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-white border border-slate-200 border-t-2 border-t-blue-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Car size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Detections Matched</div>
            <div className="text-xl font-black text-slate-800">7</div>
            <div className="text-[8px] text-slate-400 font-medium">From active sensor logs</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-2 border-t-emerald-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0"><Filter size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Unique Vehicles</div>
            <div className="text-xl font-black text-slate-800">7</div>
            <div className="text-[8px] text-slate-400 font-medium">Distinct registrations</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-2 border-t-red-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><AlertTriangle size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Alert Matches</div>
            <div className="text-xl font-black text-red-600">6</div>
            <div className="text-[8px] text-red-500 font-medium">Requires officer attention</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-2 border-t-amber-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0"><Zap size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Avg Recorded Speed</div>
            <div className="text-xl font-black text-slate-800">49 <span className="text-xs font-bold text-slate-500">km/h</span></div>
            <div className="text-[8px] text-slate-400 font-medium">Across detected corridors</div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      {showAdvanced && (
        <div className="bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl p-2.5 shadow-sm flex-shrink-0 space-y-2">
          {/* Main search row */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by license plate (e.g., AP09 AB 1234, TS07*, DL-01*)..."
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
              />
            </div>
            <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              {(['fuzzy', 'exact', 'startsWith', 'wildcard'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMatchMode(mode)}
                  className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors ${matchMode === mode ? 'bg-[#0A2540] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  {mode === 'startsWith' ? 'Starts' : mode === 'wildcard' ? 'Wild' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => alert('Searching...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2540] text-white rounded-lg hover:bg-[#163E66] text-[10px] font-black cursor-pointer"
            >
              <Search size={12} /> Search
            </button>
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
              className="bg-blue-50 border border-blue-200 text-blue-800 text-[9px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-blue-100 transition-colors">
              <option>All Brands</option>
              <option>Hyundai</option><option>Maruti Suzuki</option><option>Bajaj</option><option>Honda</option><option>Tata</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-purple-50 border border-purple-200 text-purple-800 text-[9px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-purple-100 transition-colors">
              <option>All Types</option>
              <option>Hatchback</option><option>SUV</option><option>Sedan</option><option>Motorcycle</option><option>Scooter</option>
            </select>
            <select value={colorFilter} onChange={e => setColorFilter(e.target.value)}
              className="bg-amber-50 border border-amber-200 text-amber-800 text-[9px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-amber-100 transition-colors">
              <option>All Colors</option>
              <option>White</option><option>Red</option><option>Black</option><option>Silver</option><option>Blue</option>
            </select>
            <select value={cameraFilter} onChange={e => setCameraFilter(e.target.value)}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
              <option>All Cameras</option>
              <option>CAM-1024</option><option>CAM-0785</option><option>CAM-0456</option><option>CAM-0633</option>
            </select>
            {/* Timeframe pills */}
            <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5 ml-auto">
              {['1h','24h','7d','30d'].map(t => (
                <button key={t} onClick={() => setTimeframe(t)}
                  className={`px-2 py-1 rounded text-[9px] font-black cursor-pointer transition-colors ${timeframe === t ? 'bg-[#0A2540] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results Table ── */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200 border-t-2 border-t-[#0A2540] rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Table header bar */}
        <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Search Query Detections</h3>
            <span className="text-[9px] bg-[#0A2540] text-white px-2 py-0.5 rounded-full font-bold">5 Records</span>
          </div>
          <div className="flex items-center bg-slate-200 p-0.5 rounded-lg border border-slate-300">
            <button onClick={() => setViewMode('table')}
              className={`px-2.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-slate-600'}`}>
              Table
            </button>
            <button onClick={() => setViewMode('gallery')}
              className={`px-2.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${viewMode === 'gallery' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-slate-600'}`}>
              Gallery
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A2540] text-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider"><input type="checkbox" className="rounded" /></th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Plate &amp; Confidence</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Vehicle Details</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Location &amp; Camera</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Speed &amp; Lane</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Timestamp</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 group transition-colors border-l-2 border-l-transparent hover:border-l-[#FF9933]">
                  <td className="px-3 py-2.5"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-6 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=40&h=24&q=80" alt="car" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-[11px]">{row.plate}</div>
                        <div className="text-[8px] text-emerald-600 font-bold">ANPR {row.conf}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-800 text-[10px]">{row.brand}</div>
                    <div className="text-[9px] text-slate-500 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${row.color === 'White' ? 'bg-slate-200 border border-slate-300' : row.color === 'Red' ? 'bg-red-500' : row.color === 'Black' ? 'bg-slate-900' : row.color === 'Silver' ? 'bg-slate-300' : 'bg-blue-500'}`}></span>
                      {row.color} · {row.type}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-700 text-[10px]">{row.loc}</div>
                    <div className="text-[9px] text-slate-400">@ {row.cam}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-800 text-[10px]">{row.speed}</div>
                    <div className="text-[9px] text-slate-400">{row.lane}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-700 text-[10px]">{row.time}</div>
                    <div className="text-[9px] text-slate-400">{i % 2 === 0 ? 'Northbound' : 'Eastbound'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${statusBadge[row.statusColor]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-blue-600 cursor-pointer"><Eye size={13} /></button>
                      <button className="text-slate-400 hover:text-emerald-600 cursor-pointer"><Map size={13} /></button>
                      <button className="text-slate-400 hover:text-amber-600 cursor-pointer"><Plus size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-1.5 border-t border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <span className="text-[9px] text-slate-500 font-semibold">Showing 1–5 of 7 records</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded hover:bg-slate-50 flex items-center gap-1 text-[9px] font-bold cursor-pointer">
              <ChevronLeft size={11} /> Prev
            </button>
            <button className="px-2 py-0.5 bg-[#0A2540] text-white rounded text-[9px] font-bold cursor-pointer">1</button>
            <button className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 flex items-center gap-1 text-[9px] font-bold cursor-pointer">
              Next <ChevronRight size={11} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
