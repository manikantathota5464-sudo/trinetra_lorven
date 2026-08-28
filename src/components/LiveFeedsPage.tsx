import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Grid,
  List,
  Maximize2,
  RefreshCw,
  Search,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Tv
} from 'lucide-react';
import { Camera as CameraType } from '../mockData';

// Simulated Active Feed component using Canvas for car animations
const SimulatedCCTVFeed: React.FC<{ camera: CameraType }> = ({ camera }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas sizes
    canvas.width = 320;
    canvas.height = 180;

    let carX = 0;
    let carY = 110;
    let carSpeed = 2 + Math.random() * 2;
    let carColor = Math.random() > 0.5 ? '#E11D48' : '#2563EB';

    let scannerY = 0;
    let scannerDirection = 1;

    const draw = () => {
      if (!ctx || !canvas) return;

      // 1. Draw highway landscape
      ctx.fillStyle = '#1E293B'; // Asphalt
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sky
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, 60);

      // Distant mountains
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(80, 40);
      ctx.lineTo(150, 60);
      ctx.lineTo(240, 35);
      ctx.lineTo(320, 60);
      ctx.closePath();
      ctx.fill();

      // Road markings
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 15]);
      ctx.beginPath();
      ctx.moveTo(0, 120);
      ctx.lineTo(320, 120);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Road borders
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 90);
      ctx.lineTo(320, 90);
      ctx.moveTo(0, 150);
      ctx.lineTo(320, 150);
      ctx.stroke();

      // 2. Draw Moving Car
      if (isPlaying) {
        carX += carSpeed;
        if (carX > canvas.width + 40) {
          carX = -40;
          carSpeed = 2 + Math.random() * 2;
          carColor = Math.random() > 0.5 ? '#E11D48' : '#3B82F6';
        }
      }

      // Draw car body
      ctx.fillStyle = carColor;
      ctx.fillRect(carX, carY, 35, 14);
      // Car cabin
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(carX + 8, carY - 8, 18, 9);
      // Wheels
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(carX + 8, carY + 14, 4, 0, Math.PI * 2);
      ctx.arc(carX + 27, carY + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw CCTV Overlays
      // Timestamp
      const now = new Date();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px monospace';
      ctx.fillText(`${camera.id} - ${camera.location}`, 10, 15);
      ctx.fillText(now.toLocaleString(), 10, 25);

      // Rec Indicator
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(300, 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('REC', 275, 18);

      // Speed overlay text
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`FLOW: ${isPlaying ? 'NORMAL' : 'PAUSED'}`, 10, 170);

      // Radar scanner line (Screenshot vibe)
      if (isPlaying) {
        scannerY += 1.5 * scannerDirection;
        if (scannerY > canvas.height || scannerY < 0) {
          scannerDirection *= -1;
        }
      }
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scannerY);
      ctx.lineTo(canvas.width, scannerY);
      ctx.stroke();

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, camera]);

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-800 relative group">
      
      {/* CCTV Canvas */}
      <canvas ref={canvasRef} className="w-full aspect-[16/9] block bg-slate-900" />

      {/* Overlaid Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <span className="bg-red-600 text-white px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white block"></span>
          Live
        </span>
        <span className="bg-slate-900/70 text-slate-300 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-extrabold rounded">
          {camera.type}
        </span>
      </div>

      {/* Floating controls bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
        <span className="text-[10px] text-white/90 font-bold font-mono bg-slate-950/40 px-2 py-0.5 rounded">
          {camera.id}
        </span>
        <button className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded">
          <Maximize2 size={14} />
        </button>
      </div>

    </div>
  );
};

interface LiveFeedsPageProps {
  cameras: CameraType[];
}

export const LiveFeedsPage: React.FC<LiveFeedsPageProps> = ({ cameras }) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Active feeds filter (Filter out offline cameras first)
  const activeCameras = cameras.filter(c => c.status === 'Online');

  const filteredCameras = activeCameras.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || c.location.includes(locationFilter);
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-6">
      
      {/* Metrics Row (Screenshot 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Live */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Live Cameras</span>
            <div className="text-xl font-black text-[#0C2540] mt-1">128</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Online across all sectors</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Video size={20} />
          </div>
        </div>

        {/* Online Now */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Online Now</span>
            <div className="text-xl font-black text-emerald-600 mt-1">104</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">81.2% online capability</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Tv size={20} />
          </div>
        </div>

        {/* Live Streams */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Live Streams</span>
            <div className="text-xl font-black text-amber-600 mt-1">24</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Active streaming grids</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <RefreshCw size={20} />
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Views</span>
            <div className="text-xl font-black text-purple-600 mt-1">56</div>
            <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Active monitors watching</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Maximize2 size={20} />
          </div>
        </div>

      </div>

      {/* Filter and Control Bar (Screenshot 5) */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Inputs */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search cameras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
            />
          </div>

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

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600">
            <Sliders size={14} />
            <span>Customize View</span>
          </button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-4">
          
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
            <span>Auto Refresh</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#0C2540] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>

          {/* Grid Layout Selection */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded ${layout === 'grid' ? 'bg-white text-[#0C2540] shadow-sm' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded ${layout === 'list' ? 'bg-white text-[#0C2540] shadow-sm' : 'text-slate-500'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          <button className="bg-[#0C2540] hover:bg-[#18385A] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
            <Plus size={14} />
            <span>Add Camera</span>
          </button>
        </div>

      </div>

      {/* Dynamic Video Feeds Grid (Screenshot 5) */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5' : 'space-y-4'}>
        {filteredCameras.map((cam) => (
          <div key={cam.id} className={layout === 'list' ? 'max-w-xl' : ''}>
            <SimulatedCCTVFeed camera={cam} />
            {layout === 'list' && (
              <div className="bg-white border-x border-b border-slate-200 p-3 rounded-b-xl -mt-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800">{cam.id}</span>
                  <p className="text-[10px] text-slate-500">{cam.location}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400">UPTIME {cam.uptime}%</span>
              </div>
            )}
          </div>
        ))}

        {filteredCameras.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-[#F4EFE6] rounded-2xl text-center text-slate-400 font-bold">
            No active cameras found matching criteria.
          </div>
        )}
      </div>

    </div>
  );
};
