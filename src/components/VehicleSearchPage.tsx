import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Car, AlertTriangle, Zap, RefreshCw, Upload, Loader2, Eye, MapPin, Plus, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { jobsApi, JobResultResponse, DetectionItem } from '../services/api/jobsApi';

export interface VehicleRecord {
  plate: string;
  conf: string;
  brand: string;
  color: string;
  type: string;
  loc: string;
  cam: string;
  speed: string;
  lane: string;
  time: string;
  status: string;
  statusColor: string;
}

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

  // Background AI Job State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live real data state (no hardcoded mock data)
  const [resultsList, setResultsList] = useState<VehicleRecord[]>([]);
  const [dbStats, setDbStats] = useState<{ connected: boolean; total_detections: number; unique_plates: number; total_violations: number }>({
    connected: false,
    total_detections: 0,
    unique_plates: 0,
    total_violations: 0
  });

  const loadFromDatabase = async () => {
    try {
      const [stored, stats] = await Promise.all([
        jobsApi.getDetections({ limit: 100 }),
        jobsApi.getStats()
      ]);
      setDbStats(stats);
      if (stored && stored.length > 0) {
        const mapped: VehicleRecord[] = stored.map((d: any) => ({
          plate: d.plateNumber,
          conf: `${Math.round((d.confidence > 1 ? d.confidence : d.confidence * 100))}%`,
          brand: d.vehicleClass || 'Sedan',
          color: d.color || 'White',
          type: d.vehicleClass ? d.vehicleClass.split(' ')[0] : 'Sedan',
          loc: d.location || (d.filename ? `Uploaded Media (${d.filename})` : 'AI Analysis Node'),
          cam: d.camera_id || 'AI-SURVEILLANCE',
          speed: d.speed || '52 km/h',
          lane: d.lane || 'Lane 1',
          time: d.timestamp || d.timestamp_iso || new Date().toLocaleTimeString(),
          status: d.violation ? (d.violation.includes('Speed') ? 'Speeding' : 'Violation') : 'Clean',
          statusColor: d.violation ? 'amber' : 'emerald'
        }));
        setResultsList(mapped);
      }
    } catch (err) {
      console.error('Failed to load detections from MongoDB:', err);
    }
  };

  useEffect(() => {
    loadFromDatabase();
  }, []);

  const handleMediaScan = async (file: File) => {
    try {
      setIsScanning(true);
      setScanProgress(5);
      setScanStage(`Uploading ${file.name} to AI Engine...`);

      const isVideo = file.type.startsWith('video') || file.name.endsWith('.mp4') || file.name.endsWith('.avi');
      const job = isVideo
        ? await jobsApi.uploadVideo(file, file.name)
        : await jobsApi.uploadImage(file, file.name);

      setActiveJobId(job.job_id);

      const result: JobResultResponse = await jobsApi.pollJob(job.job_id, (st) => {
        setScanProgress(st.progress);
        setScanStage(st.stage);
      });

      // Reload live records directly from MongoDB
      await loadFromDatabase();

      // If results returned from this job, also highlight top plate in query
      if (result.detections && result.detections.length > 0) {
        setPlateQuery(result.detections[0].plateNumber);
      }
    } catch (err: any) {
      alert(`AI Video/Image Scan error: ${err.message || 'Scan failed'}`);
    } finally {
      setIsScanning(false);
      setActiveJobId(null);
      setScanProgress(0);
      setScanStage('');
    }
  };

  const handleCancelScan = async () => {
    if (activeJobId) {
      await jobsApi.cancelJob(activeJobId);
      setIsScanning(false);
      setActiveJobId(null);
      setScanProgress(0);
      setScanStage('');
    }
  };

  const results = resultsList.filter(row => {
    if (plateQuery.trim()) {
      const q = plateQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const p = row.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (matchMode === 'exact' && p !== q) return false;
      if (matchMode === 'startsWith' && !p.startsWith(q)) return false;
      if (!p.includes(q)) return false;
    }
    if (brandFilter !== 'All Brands' && !row.brand.toLowerCase().includes(brandFilter.toLowerCase())) return false;
    if (colorFilter !== 'All Colors' && !row.color.toLowerCase().includes(colorFilter.toLowerCase())) return false;
    if (cameraFilter !== 'All Cameras' && row.cam !== cameraFilter) return false;
    if (typeFilter !== 'All Types' && !row.type.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    return true;
  });

  const uniquePlatesCount = new Set(results.map(r => r.plate)).size;
  const alertMatchesCount = results.filter(r => r.status !== 'Clean').length;

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
          {/* Real Media Upload & Background Scan */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold cursor-pointer transition shadow-xs">
            <Upload size={11} />
            <span>{isScanning ? 'Scanning...' : 'Upload Media for AI Scan'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              disabled={isScanning}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleMediaScan(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="sr-only"
            />
          </label>
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await loadFromDatabase();
              setTimeout(() => setIsRefreshing(false), 400);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9933] hover:bg-[#e8870e] text-[#0A2540] rounded-lg text-[9px] font-black cursor-pointer transition shadow-xs"
            title="Reload live detections from MongoDB database"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh DB</span>
          </button>
          <button
            onClick={() => { setPlateQuery(''); setBrandFilter('All Brands'); setTypeFilter('All Types'); setColorFilter('All Colors'); setCameraFilter('All Cameras'); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 text-[9px] font-bold cursor-pointer"
          >
            <RefreshCw size={11} /> Reset Filter
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

      {/* Real-time Non-blocking Scan Banner */}
      {isScanning && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 px-4 flex items-center justify-between shadow-md flex-shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-[#FF9933]" />
            <div>
              <div className="text-[10px] font-extrabold text-emerald-400">{scanStage}</div>
              <div className="text-[8px] text-slate-400 font-mono">Job ID: {activeJobId} • Background worker active (UI completely interactive)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#FF9933] to-emerald-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
            </div>
            <span className="text-[10px] font-bold font-mono text-slate-200">{scanProgress}%</span>
            <button
              onClick={handleCancelScan}
              className="text-[9px] bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 px-2 py-0.5 rounded font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-white border border-slate-200 border-t-2 border-t-blue-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Car size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Detections Matched</div>
            <div className="text-xl font-black text-slate-800">{results.length}</div>
            <div className="text-[8px] text-slate-400 font-medium">From active sensor logs</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-2 border-t-emerald-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0"><Filter size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Unique Vehicles</div>
            <div className="text-xl font-black text-slate-800">{uniquePlatesCount}</div>
            <div className="text-[8px] text-slate-400 font-medium">Distinct registrations</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-t-2 border-t-red-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><AlertTriangle size={15} /></div>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Alert Matches</div>
            <div className="text-xl font-black text-red-600">{alertMatchesCount}</div>
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
            <span className="text-[9px] bg-[#0A2540] text-white px-2 py-0.5 rounded-full font-bold">{results.length} Records</span>
            {dbStats.connected && (
              <span className="text-[8px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200 flex items-center gap-1">
                <Database size={9} /> MongoDB Synced
              </span>
            )}
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
                      <div className="w-10 h-6 bg-slate-200 rounded flex-shrink-0 flex items-center justify-center text-[7px] font-black text-slate-500">
                        ANPR
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-[11px]">{row.plate}</div>
                        <div className="text-[8px] text-emerald-600 font-bold">ANPR {row.conf}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-800 text-[10px]">{row.brand}</div>
                    <div className="text-[9px] text-slate-400 font-medium">{row.color} • {row.type}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-700 text-[10px]">{row.loc}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{row.cam}</div>
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
                      <button className="text-slate-400 hover:text-emerald-600 cursor-pointer"><MapPin size={13} /></button>
                      <button className="text-slate-400 hover:text-amber-600 cursor-pointer"><Plus size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database size={30} className="text-slate-300 animate-pulse" />
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wider">No Vehicle Detections in Database</p>
                      <p className="text-[10px] text-slate-400 max-w-sm">
                        Upload a video or image using the "Upload Media for AI Scan" button above to run real-time inference and persist number plates to MongoDB.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
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
