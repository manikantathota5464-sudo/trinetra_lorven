import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Image as ImageIcon,
  Globe,
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
  Tv,
  MapPin,
  Activity,
  ShieldCheck,
  Eye,
  Layers,
  Wifi,
  X,
  Radio,
  Zap,
  Crosshair,
  CheckCircle,
  Filter,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Camera as CameraType } from '../mockData';
import { jobsApi, JobResultResponse, DetectionItem } from '../services/api/jobsApi';

// Extended feed item model supporting Video, Image, and WebScan feeds + Real-time AI Detections
export interface FeedItem {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  sourceType: 'video' | 'image' | 'webscan';
  cameraType: 'PTZ' | 'Fixed' | 'Dome' | 'OSINT Scanner' | 'ANPR Cam';
  lastSeen: string;
  uptime: number;
  thumbnail?: string;
  imageUrl?: string;
  videoUrl?: string;
  webUrl?: string;
  ipAddress?: string;
  detectedPlate?: string;
  confidence?: number;
  vehicleClass?: string;
  flowStatus?: 'NORMAL' | 'HEAVY' | 'SLOW';
  detections?: DetectionItem[];
  isAnalyzing?: boolean;
  analysisProgress?: number;
  analysisStage?: string;
  remainingFrames?: number;
}

// Props interface for customizing view overlays
interface ViewCustomization {
  showAnnotations: boolean;
  showTimestamp: boolean;
  showHeatmap: boolean;
  showRadar: boolean;
  showFlowRate: boolean;
}

// -------------------------------------------------------------
// 0. REAL-TIME AI BOUNDING BOX OVERLAY COMPONENT
// -------------------------------------------------------------
const BoundingBoxOverlay: React.FC<{
  detections?: DetectionItem[];
  showAnnotations?: boolean;
  detectedPlate?: string;
  confidence?: number;
  vehicleClass?: string;
}> = ({ detections }) => {
  if (!detections || detections.length === 0) return null;

  const colorMap: Record<string, string> = {
    Car: '#dc2626',       // Vivid Red
    Bus: '#f97316',       // Vibrant Orange
    Truck: '#ea580c',     // Dark Amber/Orange
    'Two-wheeler': '#2563eb', // Royal Blue
    Vehicle: '#16a34a',   // Emerald Green
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-15">
      {detections.map((det, idx) => {
        if (!det.bbox || det.bbox.length < 4) return null;
        const [x1, y1, x2, y2] = det.bbox;
        const vClass = det.vehicleClass || 'Vehicle';
        const color = colorMap[vClass] || '#dc2626';
        const confScore = (det.confidence > 1 ? det.confidence / 100 : det.confidence).toFixed(2);
        const label = det.plateNumber ? `${vClass} ${confScore} | ${det.plateNumber}` : `${vClass} ${confScore}`;

        // Support both pixel coordinates and percentage coordinates
        const isPixel = x2 > 100 || y2 > 100;
        const left = isPixel ? `${(x1 / 1280) * 100}%` : `${x1}%`;
        const top = isPixel ? `${(y1 / 720) * 100}%` : `${y1}%`;
        const width = isPixel ? `${((x2 - x1) / 1280) * 100}%` : `${x2 - x1}%`;
        const height = isPixel ? `${((y2 - y1) / 720) * 100}%` : `${y2 - y1}%`;

        return (
          <div
            key={det.id || idx}
            className="absolute border-2 rounded-xs shadow-sm transition-all"
            style={{
              left,
              top,
              width,
              height,
              borderColor: color
            }}
          >
            <div
              className="absolute -top-5 left-0 px-1.5 py-0.5 text-[8.5px] font-black text-white rounded-t shadow-md flex items-center gap-1 whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------------
// 1. CCTV VIDEO FEED COMPONENT WITH PER-CAMERA UPLOAD & LIVE DETECTIONS
// -------------------------------------------------------------
const SimulatedCCTVFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
  onUploadSource?: (feed: FeedItem, file: File) => void;
}> = ({ feed, customization, onMaximize, onUploadSource }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-800 relative group">
      {/* Real Video / Live MJPEG Stream or Clean Camera Backdrop */}
      {feed.videoUrl ? (
        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
          {feed.videoUrl.includes('/api/stream/video') || feed.videoUrl.includes('mjpeg') ? (
            <img
              src={feed.videoUrl}
              alt={feed.name}
              className="w-full h-full object-cover block"
            />
          ) : (
            <video
              src={feed.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover block"
            />
          )}
          {/* ANIMATED OVERLAY FOR REMAINING FRAMES TO PROCESS BY OCR */}
          {feed.isAnalyzing ? (
            <div className="absolute bottom-2 left-2 right-2 z-30 bg-slate-950/95 border border-amber-500/90 rounded-lg p-2 backdrop-blur-md shadow-xl font-mono">
              <div className="flex justify-between items-center text-[9px] mb-1">
                <span className="text-amber-400 font-black flex items-center gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-amber-400 block animate-ping"></span>
                  ⚡ BOTSORT OCR PROCESSING
                </span>
                <span className="text-cyan-300 font-extrabold bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-800">
                  Remaining Frames: {feed.remainingFrames ?? Math.max(0, 100 - (feed.analysisProgress || 0))}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 h-1.5 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: `${feed.analysisProgress || 30}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[8px] text-slate-400 mt-1">
                <span className="truncate text-amber-200">{feed.analysisStage || 'Evaluating plate crops in background...'}</span>
                <span className="text-cyan-400 font-bold">{feed.analysisProgress || 0}%</span>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xs rounded-md px-2 py-1 flex items-center justify-between text-[8.5px] font-mono text-cyan-300">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  OCR ENGINE ONLINE
                </span>
                <span className="text-amber-400 font-bold">BoT-SORT Tracker Active</span>
              </div>
            </div>
          )}
        </div>
      ) : feed.thumbnail || feed.imageUrl ? (
        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
          <img
            src={feed.thumbnail || feed.imageUrl}
            alt={feed.name}
            className="w-full h-full object-cover block"
          />
        </div>
      ) : (
        <div className="relative aspect-[16/9] bg-slate-900 flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden" onClick={() => onMaximize(feed)}>
          <Video size={36} className="text-slate-600 mb-2" />
          <span className="text-xs font-bold text-slate-300">{feed.name}</span>
          <span className="text-[10px] text-slate-500 font-mono mt-1">{feed.location}</span>
        </div>
      )}


      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none z-20">
        <span className="bg-red-600 text-white px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white block"></span>
          LIVE VIDEO
        </span>
        <span className="bg-blue-900/80 text-blue-200 border border-blue-700/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-extrabold rounded">
          {feed.cameraType}
        </span>
      </div>

      {/* PER-CAMERA "ADD SOURCE" BUTTON (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <label className="flex items-center gap-1 bg-[#0A2540]/90 hover:bg-[#18385A] text-white border border-slate-600/80 px-2 py-1 rounded-lg text-[8.5px] font-black cursor-pointer shadow-md transition-all hover:scale-105">
          <Upload size={10} className="text-[#FF9933]" />
          <span>Add Source</span>
          <input
            type="file"
            accept="video/*,image/*"
            disabled={feed.isAnalyzing}
            onChange={(e) => {
              if (e.target.files?.[0] && onUploadSource) {
                onUploadSource(feed, e.target.files[0]);
                e.target.value = '';
              }
            }}
            className="sr-only"
          />
        </label>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded cursor-pointer">
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded cursor-pointer">
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
        <span className="text-[10px] text-white/90 font-bold font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
          {feed.id}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Quick upload in hover bar as well */}
          <label className="text-white/80 hover:text-[#FF9933] p-1 hover:bg-white/10 rounded cursor-pointer" title="Upload Video or Image to this Camera">
            <Upload size={13} />
            <input
              type="file"
              accept="video/*,image/*"
              disabled={feed.isAnalyzing}
              onChange={(e) => {
                if (e.target.files?.[0] && onUploadSource) {
                  onUploadSource(feed, e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="sr-only"
            />
          </label>
          <button onClick={() => onMaximize(feed)} className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded cursor-pointer">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. IMAGE SNAPSHOT FEED COMPONENT WITH PER-CAMERA UPLOAD & LIVE DETECTIONS
// -------------------------------------------------------------
const SimulatedImageFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
  onUploadSource?: (feed: FeedItem, file: File) => void;
}> = ({ feed, customization, onMaximize, onUploadSource }) => {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  const sampleImage = feed.imageUrl || feed.thumbnail || '';

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-purple-900/40 relative group">
      <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
        <img
          src={sampleImage}
          alt={feed.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isRefreshing ? 'opacity-40 blur-xs' : 'opacity-90'}`}
        />

        {/* Real-time Bounding Box Detections Overlay */}
        <BoundingBoxOverlay
          detections={feed.detections}
          showAnnotations={customization.showAnnotations}
          detectedPlate={feed.detectedPlate}
          confidence={feed.confidence}
          vehicleClass={feed.vehicleClass}
        />

        {/* Heatmap Overlay */}
        {customization.showHeatmap && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-red-600/30 to-purple-600/30 pointer-events-none mix-blend-overlay" />
        )}

        {/* Radar scanline */}
        {customization.showRadar && (
          <div className="absolute inset-x-0 h-0.5 bg-purple-400/80 shadow-[0_0_8px_#a855f7] animate-pulse top-1/2 pointer-events-none" />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none z-20">
          <span className="bg-purple-600 text-white px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <ImageIcon size={10} />
            ANPR SNAPSHOT
          </span>
          <span className="bg-slate-900/80 text-purple-200 border border-purple-700/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-extrabold rounded">
            HD 1080P
          </span>
        </div>

        {/* PER-CAMERA "ADD SOURCE" BUTTON (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <label className="flex items-center gap-1 bg-purple-950/90 hover:bg-purple-900 text-white border border-purple-700/80 px-2 py-1 rounded-lg text-[8.5px] font-black cursor-pointer shadow-md transition-all hover:scale-105">
            <Upload size={10} className="text-[#FF9933]" />
            <span>Add Source</span>
            <input
              type="file"
              accept="image/*,video/*"
              disabled={feed.isAnalyzing}
              onChange={(e) => {
                if (e.target.files?.[0] && onUploadSource) {
                  onUploadSource(feed, e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="sr-only"
            />
          </label>
        </div>

        {/* Timestamp Overlay */}
        {customization.showTimestamp && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 to-transparent p-2 flex justify-between items-center text-[9px] text-white/90 font-mono pointer-events-none z-10">
            <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 font-bold">{feed.id} • {feed.location}</span>
            <span>{lastRefreshed.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Flow status */}
        {customization.showFlowRate && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[8px] font-bold text-emerald-400 z-10">
            FLOW: {feed.flowStatus || 'NORMAL'}
          </div>
        )}

        {/* Real-time AI Worker Processing */}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1 text-white hover:text-purple-300 text-[9px] font-bold bg-purple-900/60 hover:bg-purple-800 px-2 py-1 rounded border border-purple-700 transition cursor-pointer"
        >
          <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Capture Frame</span>
        </button>
        <span className="text-[10px] text-purple-200 font-bold font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-purple-800">
          {feed.id}
        </span>
        <button onClick={() => onMaximize(feed)} className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded cursor-pointer">
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. WEBSCAN / OSINT RADAR FEED COMPONENT
// -------------------------------------------------------------
const SimulatedWebScanFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
  onUploadSource?: (feed: FeedItem, file: File) => void;
}> = ({ feed, customization, onMaximize, onUploadSource }) => {
  const [packets, setPackets] = useState<string[]>([]);
  const [ping, setPing] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      const endpoints = [
        `GET /nodes/stream_${feed.id.toLowerCase()} 200 OK (${Math.floor(12 + Math.random() * 20)}ms)`,
        `SCAN ANPR_GATEWAY [PASS] - Plate OCR Verified`,
        `OSINT Packet Sync - Node ${feed.ipAddress || '192.168.1.104'} Live`,
        `HTTP/2 Stream TLS 1.3 Cipher Verified`
      ];
      const randomLine = endpoints[Math.floor(Math.random() * endpoints.length)];
      setPackets(prev => [randomLine, ...prev.slice(0, 3)]);
      setPing(Math.floor(14 + Math.random() * 15));
    }, 2000);
    return () => clearInterval(interval);
  }, [feed]);

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-amber-500/40 relative group">
      <div className="aspect-[16/9] bg-slate-950 p-3 flex flex-col justify-between font-mono relative overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
        {/* Ambient Radar Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

        {/* Top Radar Bar */}
        <div className="flex justify-between items-center z-10 border-b border-amber-950/60 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider flex items-center gap-1">
              <Globe size={10} />
              WEBSCAN / OSINT
            </span>
            <span className="text-[9px] text-amber-300 font-bold">{feed.id}</span>
          </div>
          <div className="flex items-center gap-2 text-[8px]">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Wifi size={9} /> {ping}ms
            </span>
            {/* PER-CAMERA "ADD SOURCE" BUTTON (WebScan) */}
            <label className="flex items-center gap-1 bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-700/80 px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer shadow-md transition-all hover:scale-105">
              <Upload size={9} className="text-[#FF9933]" />
              <span>Add Source</span>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={(e) => {
                  if (e.target.files?.[0] && onUploadSource) {
                    onUploadSource(feed, e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Center Live Radar / Web preview mockup */}
        <div className="my-1.5 z-10 flex gap-2 items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="h-10 w-10 rounded-full border-2 border-amber-500/60 flex items-center justify-center relative bg-amber-950/20">
            <div className="h-full w-full rounded-full border border-amber-400/40 animate-ping absolute" />
            <Radio size={16} className="text-amber-400 animate-pulse" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[9px] text-amber-200 font-bold truncate">{feed.webUrl || `https://surveillance.morth.gov.in/nodes/${feed.id.toLowerCase()}`}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 truncate">Sector: {feed.location} • Status: Active Scanning</p>
          </div>
        </div>

        {/* Terminal Live Packet Logs */}
        <div className="bg-slate-900/90 rounded border border-slate-800 p-1.5 z-10 h-16 overflow-hidden">
          {packets.map((pkt, idx) => (
            <p key={idx} className="text-[7.5px] text-emerald-400/90 leading-tight font-mono truncate">
              <span className="text-amber-500">&gt;</span> {pkt}
            </p>
          ))}
        </div>

        {/* Timestamp & Threat Status */}
        {customization.showTimestamp && (
          <div className="flex justify-between items-center text-[8px] text-slate-400 z-10 mt-1 border-t border-slate-900 pt-1">
            <span>NODE STATUS: SECURE</span>
            <span className="text-amber-400 font-bold">{new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Hover overlay controls */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] text-amber-300 font-mono">TARGET: {feed.location}</span>
        <button onClick={() => onMaximize(feed)} className="text-white hover:text-amber-300 p-1 hover:bg-white/10 rounded cursor-pointer">
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. MAIN LIVE FEEDS PAGE COMPONENT
// -------------------------------------------------------------
interface LiveFeedsPageProps {
  cameras: CameraType[];
}

export const LiveFeedsPage: React.FC<LiveFeedsPageProps> = ({ cameras }) => {
  const DEFAULT_FEEDS: FeedItem[] = [
    {
      id: 'CAM-101',
      name: 'CAM-101 — Main St & 5th Ave',
      location: 'Main St & 5th Ave',
      status: 'Online',
      sourceType: 'video',
      cameraType: 'PTZ',
      lastSeen: 'Just Now',
      uptime: 99.9,
      flowStatus: 'NORMAL'
    },
    {
      id: 'CAM-102',
      name: 'CAM-102 — I-9 Overpass',
      location: 'I-9 Overpass',
      status: 'Online',
      sourceType: 'video',
      cameraType: 'Fixed',
      lastSeen: 'Just Now',
      uptime: 99.8,
      flowStatus: 'NORMAL'
    },
    {
      id: 'CAM-103',
      name: 'CAM-103 — Harbor Rd Exit',
      location: 'Harbor Rd Exit',
      status: 'Online',
      sourceType: 'image',
      cameraType: 'ANPR Cam',
      lastSeen: 'Just Now',
      uptime: 100,
      flowStatus: 'NORMAL'
    }
  ];

  const [feeds, setFeeds] = useState<FeedItem[]>(DEFAULT_FEEDS);

  useEffect(() => {
    if (cameras && cameras.length > 0) {
      setFeeds(prev => {
        const existingMap = new Map(prev.map(f => [f.id, f]));
        const updatedList: FeedItem[] = cameras.map(cam => {
          const existing = existingMap.get(cam.id);
          if (existing) {
            return {
              ...existing,
              status: cam.status || existing.status,
              location: cam.location || existing.location,
            };
          }
          return {
            id: cam.id,
            name: `${cam.id} — ${cam.location}`,
            location: cam.location,
            status: cam.status || 'Online',
            sourceType: 'video',
            cameraType: cam.type || 'PTZ',
            lastSeen: cam.lastSeen || 'Just Now',
            uptime: cam.uptime || 100,
            thumbnail: cam.thumbnail || ''
          };
        });

        // Retain custom uploaded feeds not present in backend cameras list
        prev.forEach(f => {
          if (!updatedList.some(u => u.id === f.id)) {
            updatedList.push(f);
          }
        });

        return updatedList;
      });
    }
  }, [cameras]);

  const [sourceFilter, setSourceFilter] = useState<'all' | 'video' | 'image' | 'webscan'>('all');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [maximizedFeed, setMaximizedFeed] = useState<FeedItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Frame Skipping Option State (1x = All frames, 2x = Skip 1, 5x = Skip 4, 10x = Ultra Fast)
  const [frameSkipRate, setFrameSkipRate] = useState<number>(5);

  // Customize View State (all animations/overlays disabled)
  const [customization, setCustomization] = useState<ViewCustomization>({
    showAnnotations: false,
    showTimestamp: true,
    showHeatmap: false,
    showRadar: false,
    showFlowRate: false
  });

  // Modal Form State for Add Feed Source
  const [newFeedType, setNewFeedType] = useState<'video' | 'image' | 'webscan'>('video');
  const [newFeedId, setNewFeedId] = useState('');
  const [newFeedLocation, setNewFeedLocation] = useState('Main St & 5th Ave');
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');

  // Real media upload & background AI job state (100% async, unblocks UI thread)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('');
  const [jobError, setJobError] = useState<string | null>(null);

  const resetModalForm = () => {
    setNewFeedId('');
    setNewFeedName('');
    setNewFeedUrl('');
    setSelectedFile(null);
    setIsProcessing(false);
    setActiveJobId(null);
    setJobProgress(0);
    setJobStage('');
    setJobError(null);
  };

  // Location Color Mapping for Government Command Center look
  const locationColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    'All Locations': { bg: 'bg-[#0A2540]', border: 'border-[#1E3A8A]', text: 'text-white', badge: 'bg-[#FF9933] text-white' },
    'Main St & 5th Ave': { bg: 'bg-blue-900/90', border: 'border-blue-700', text: 'text-blue-100', badge: 'bg-blue-500 text-white' },
    'I-9 Overpass': { bg: 'bg-emerald-900/90', border: 'border-emerald-700', text: 'text-emerald-100', badge: 'bg-emerald-500 text-white' },
    'Harbor Rd Exit': { bg: 'bg-amber-900/90', border: 'border-amber-700', text: 'text-amber-100', badge: 'bg-amber-500 text-white' },
    'City Center': { bg: 'bg-purple-900/90', border: 'border-purple-700', text: 'text-purple-100', badge: 'bg-purple-500 text-white' },
    'Riverside Park': { bg: 'bg-rose-900/90', border: 'border-rose-700', text: 'text-rose-100', badge: 'bg-rose-500 text-white' },
    'Junction 9': { bg: 'bg-cyan-900/90', border: 'border-cyan-700', text: 'text-cyan-100', badge: 'bg-cyan-500 text-white' },
    'Ring Road': { bg: 'bg-teal-900/90', border: 'border-teal-700', text: 'text-teal-100', badge: 'bg-teal-500 text-white' },
    'West Entrance': { bg: 'bg-orange-900/90', border: 'border-orange-700', text: 'text-orange-100', badge: 'bg-orange-500 text-white' }
  };

  const locationsList = Object.keys(locationColors);

  // Filter feeds logic
  const filteredFeeds = feeds.filter(feed => {
    const matchesSource = sourceFilter === 'all' || feed.sourceType === sourceFilter;
    const matchesLocation = locationFilter === 'All Locations' || feed.location === locationFilter;
    const matchesSearch =
      feed.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesLocation && matchesSearch;
  });

  // Calculate metrics counts
  const totalCount = feeds.length;
  const videoCount = feeds.filter(f => f.sourceType === 'video').length;
  const imageCount = feeds.filter(f => f.sourceType === 'image').length;
  const webscanCount = feeds.filter(f => f.sourceType === 'webscan').length;

  // Handle per-camera upload & real-time background AI scan
  const handleCameraUpload = async (targetFeed: FeedItem, file: File) => {
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.avi');
    const isImage = file.type.startsWith('image/') || file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.jpeg');

    // 1. Mark camera state as analyzing in real-time
    setFeeds(prev => prev.map(f => {
      if (f.id === targetFeed.id) {
        return {
          ...f,
          isAnalyzing: true,
          analysisProgress: 10,
          analysisStage: 'Enqueuing AI detection job...'
        };
      }
      return f;
    }));

    try {
      if (isVideo) {
        // Start real-time live AI video stream
        const stream = await jobsApi.uploadVideoStream(file, frameSkipRate);
        setFeeds(prev => prev.map(f => {
          if (f.id === targetFeed.id) {
            return {
              ...f,
              sourceType: 'video',
              videoUrl: stream.stream_url,
              isAnalyzing: false,
              analysisProgress: 100,
              analysisStage: 'Live AI Video Stream Active'
            };
          }
          return f;
        }));
      } else {
        const job = await jobsApi.uploadImage(file, targetFeed.name || targetFeed.id);

        const result: JobResultResponse = await jobsApi.pollJob(job.job_id, (status) => {
          setFeeds(prev => prev.map(f => {
            if (f.id === targetFeed.id) {
              return {
                ...f,
                analysisProgress: status.progress,
                analysisStage: status.stage
              };
            }
            return f;
          }));
        });

        const mediaUrl = URL.createObjectURL(file);
        const imgDisplay = result.annotated_image || mediaUrl;
        const topDet = result.detections?.[0];

        setFeeds(prev => prev.map(f => {
          if (f.id === targetFeed.id) {
            return {
              ...f,
              sourceType: 'image',
              imageUrl: imgDisplay,
              thumbnail: imgDisplay,
              isAnalyzing: false,
              detections: result.detections && result.detections.length > 0 ? result.detections : undefined,
              detectedPlate: topDet?.plateNumber || f.detectedPlate || '',
              confidence: topDet ? Math.round(topDet.confidence * 100) : (f.confidence || 98),
              vehicleClass: topDet?.vehicleClass || f.vehicleClass || 'Sedan'
            };
          }
          return f;
        }));
      }
    } catch (err: any) {
      console.error('Camera upload error:', err);
      setFeeds(prev => prev.map(f => {
        if (f.id === targetFeed.id) {
          return {
            ...f,
            isAnalyzing: false
          };
        }
        return f;
      }));
      alert(`AI Processing Failed: ${err.message || 'Error occurred while analyzing media'}`);
    }
  };

  const handleCancelActiveJob = async () => {
    if (activeJobId) {
      await jobsApi.cancelJob(activeJobId);
      setIsProcessing(false);
      setActiveJobId(null);
      setJobStage('Job cancelled by operator.');
    }
  };

  const handleAddFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedId) return;

    if (selectedFile) {
      try {
        setIsProcessing(true);
        setJobError(null);
        setJobProgress(5);

        if (newFeedType === 'video') {
          setJobStage('Initiating Live AI Video Stream...');
          const stream = await jobsApi.uploadVideoStream(selectedFile, frameSkipRate);
          const newFeed: FeedItem = {
            id: newFeedId.toUpperCase(),
            name: newFeedName || `LIVE VIDEO ${newFeedId}`,
            location: newFeedLocation,
            status: 'Online',
            sourceType: 'video',
            cameraType: 'PTZ',
            lastSeen: 'Just Now',
            uptime: 100,
            videoUrl: stream.stream_url,
            flowStatus: 'NORMAL'
          };
          setFeeds(prev => [newFeed, ...prev]);
        } else {
          setJobStage('Submitting background analysis job...');
          const job = await jobsApi.uploadImage(selectedFile, newFeedName || newFeedId);
          setActiveJobId(job.job_id);

          const result: JobResultResponse = await jobsApi.pollJob(job.job_id, (status) => {
            setJobProgress(status.progress);
            setJobStage(status.stage);
          });

          const topDetection = result.detections?.[0];
          const plate = topDetection?.plateNumber || '';
          const vClass = topDetection?.vehicleClass || 'Sedan';
          const conf = topDetection ? Math.round(topDetection.confidence * 100) : 98;
          const uploadedImgDisplay = result.annotated_image || URL.createObjectURL(selectedFile);

          const newFeed: FeedItem = {
            id: newFeedId.toUpperCase(),
            name: newFeedName || `IMAGE Feed ${newFeedId}`,
            location: newFeedLocation,
            status: 'Online',
            sourceType: 'image',
            cameraType: 'ANPR Cam',
            lastSeen: 'Just Now',
            uptime: 100,
            imageUrl: uploadedImgDisplay,
            thumbnail: uploadedImgDisplay,
            detectedPlate: plate,
            confidence: conf,
            vehicleClass: vClass,
            detections: result.detections,
            flowStatus: 'NORMAL'
          };
          setFeeds(prev => [newFeed, ...prev]);
        }

        setShowAddModal(false);
        resetModalForm();
      } catch (err: any) {
        setJobError(err.message || 'Background AI processing failed.');
      } finally {
        setIsProcessing(false);
        setActiveJobId(null);
      }
    } else {
      const newFeed: FeedItem = {
        id: newFeedId.toUpperCase(),
        name: newFeedName || `${newFeedType.toUpperCase()} Feed ${newFeedId}`,
        location: newFeedLocation,
        status: 'Online',
        sourceType: newFeedType,
        cameraType: newFeedType === 'video' ? 'PTZ' : newFeedType === 'image' ? 'ANPR Cam' : 'OSINT Scanner',
        lastSeen: 'Just Now',
        uptime: 100,
        imageUrl: newFeedType === 'image' ? (newFeedUrl || '') : undefined,
        webUrl: newFeedType === 'webscan' ? (newFeedUrl || `https://surveillance.morth.gov.in/nodes/${newFeedId.toLowerCase()}`) : undefined,
        flowStatus: 'NORMAL'
      };

      setFeeds(prev => [newFeed, ...prev]);
      setShowAddModal(false);
      resetModalForm();
    }
  };

  return (
    <div className="flex flex-col h-full gap-2.5 overflow-hidden font-sans">

      {/* Top Banner with Government Certification & Grid Status */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#133A63] to-[#0A2540] text-white p-2.5 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#FF9933] text-slate-950 px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <ShieldCheck size={11} />
            TRINETHRA SURVEILLANCE GRID
          </span>
          <span className="text-[10px] text-slate-200 font-semibold hidden md:inline">
            Ministry of Road Transport & Highways • Multi-Source Live Feed Console
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            GRID SYNC 99.9%
          </span>
          <span className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700 font-mono text-slate-300">
            CERT-In AUDITED
          </span>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 flex-shrink-0">
        
        {/* Total Feeds */}
        <div
          onClick={() => setSourceFilter('all')}
          className={`bg-white border rounded-xl p-2.5 shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${sourceFilter === 'all' ? 'border-2 border-[#0A2540] ring-2 ring-[#0A2540]/10 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Total Active Feeds</span>
            <div className="text-2xl font-black tracking-tight text-[#0A2540] mt-0.5">{totalCount}</div>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Across 8 Major Sectors</span>
          </div>
          <div className="p-2 bg-slate-100 text-[#0A2540] rounded-xl border border-slate-200">
            <Grid size={18} />
          </div>
        </div>

        {/* Video Feeds */}
        <div
          onClick={() => setSourceFilter('video')}
          className={`bg-white border rounded-xl p-2.5 shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${sourceFilter === 'video' ? 'border-2 border-blue-600 ring-2 ring-blue-500/10 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">CCTV Video Streams</span>
            <div className="text-2xl font-black tracking-tight text-blue-600 mt-0.5">{videoCount}</div>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Live CCTV Streams</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Video size={18} />
          </div>
        </div>

        {/* Image Snapshots */}
        <div
          onClick={() => setSourceFilter('image')}
          className={`bg-white border rounded-xl p-2.5 shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${sourceFilter === 'image' ? 'border-2 border-purple-600 ring-2 ring-purple-500/10 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">ANPR Snapshots</span>
            <div className="text-2xl font-black tracking-tight text-purple-600 mt-0.5">{imageCount}</div>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">High-Res OCR Frames</span>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <ImageIcon size={18} />
          </div>
        </div>

        {/* WebScan Feeds */}
        <div
          onClick={() => setSourceFilter('webscan')}
          className={`bg-white border rounded-xl p-2.5 shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${sourceFilter === 'webscan' ? 'border-2 border-amber-600 ring-2 ring-amber-500/10 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">WebScan / OSINT</span>
            <div className="text-2xl font-black tracking-tight text-amber-600 mt-0.5">{webscanCount}</div>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Live Traffic Web Radar</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Globe size={18} />
          </div>
        </div>

      </div>

      {/* Main Filter, Location, Source Buttons & Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        
        {/* Left Section: Source Type Selector Buttons + Search + Colored Location Button */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* Source Type Buttons (Video, Image, WebScan) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${sourceFilter === 'all' ? 'bg-[#0A2540] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Grid size={11} />
              <span>All ({totalCount})</span>
            </button>
            <button
              onClick={() => setSourceFilter('video')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${sourceFilter === 'video' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Video size={11} />
              <span>Video ({videoCount})</span>
            </button>
            <button
              onClick={() => setSourceFilter('image')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${sourceFilter === 'image' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ImageIcon size={11} />
              <span>Image ({imageCount})</span>
            </button>
            <button
              onClick={() => setSourceFilter('webscan')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${sourceFilter === 'webscan' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Globe size={11} />
              <span>WebScan ({webscanCount})</span>
            </button>
          </div>

          {/* COLORED "ALL LOCATIONS" BUTTON & DROPDOWN */}
          <div className="relative">
            <div className="flex items-center">
              <span className="bg-[#0A2540] text-white px-2 py-1.5 rounded-l-lg border-y border-l border-[#0A2540] flex items-center gap-1 text-[10px] font-black">
                <MapPin size={12} className="text-[#FF9933]" />
                <span className="hidden sm:inline">SECTOR:</span>
              </span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-[#0A2540] text-white border border-[#1E3A8A] text-[10px] rounded-r-lg py-1.5 pl-2 pr-6 font-bold cursor-pointer hover:bg-[#133A63] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-white py-1 font-semibold">
                    {loc === 'All Locations' ? '📍 All Locations (8 Sectors)' : `📌 ${loc}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[150px] max-w-xs flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="Search feed ID, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0A2540] font-medium"
            />
          </div>

        </div>

        {/* Right Section: Frame Skipping + Customize View Button + Layout & Add Source */}
        <div className="flex items-center gap-2">

          {/* FRAME SKIPPING OPTION SELECTOR */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200" title="Adjust frame skipping rate for ultra-fast live feed AI processing">
            <span className="text-[9px] font-black text-slate-600 px-1.5 flex items-center gap-1">
              <Zap size={10} className="text-amber-500" />
              Skip:
            </span>
            {[
              { rate: 1, label: '1x (All)' },
              { rate: 2, label: '2x (Fast)' },
              { rate: 5, label: '5x (Ultra)' },
              { rate: 10, label: '10x (Max)' },
            ].map((opt) => (
              <button
                key={opt.rate}
                onClick={() => setFrameSkipRate(opt.rate)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                  frameSkipRate === opt.rate
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* PROPERLY WORKING CUSTOMIZE VIEW BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border shadow-xs ${showCustomize ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'}`}
            >
              <Sliders size={12} className={showCustomize ? 'text-[#FF9933]' : 'text-indigo-600'} />
              <span>Customize View</span>
              <span className="bg-indigo-200 text-indigo-900 px-1 rounded text-[8px] font-extrabold">
                {Object.values(customization).filter(Boolean).length}
              </span>
            </button>

            {/* CUSTOMIZE VIEW DROPDOWN MENU */}
            {showCustomize && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 flex flex-col gap-2.5 text-xs font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="font-extrabold text-[#0A2540] text-[11px] flex items-center gap-1">
                    <Layers size={13} /> Grid Display Settings
                  </span>
                  <button onClick={() => setShowCustomize(false)} className="text-slate-400 hover:text-slate-600 p-0.5">
                    <X size={13} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Crosshair size={12} className="text-emerald-600" /> AI Bounding Boxes
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showAnnotations}
                      onChange={(e) => setCustomization(prev => ({ ...prev, showAnnotations: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Radio size={12} className="text-blue-600" /> Timestamp & ID Header
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showTimestamp}
                      onChange={(e) => setCustomization(prev => ({ ...prev, showTimestamp: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Zap size={12} className="text-red-500" /> Thermal / Congestion Heatmap
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showHeatmap}
                      onChange={(e) => setCustomization(prev => ({ ...prev, showHeatmap: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Activity size={12} className="text-amber-500" /> Laser Speed Radar Line
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showRadar}
                      onChange={(e) => setCustomization(prev => ({ ...prev, showRadar: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Eye size={12} className="text-indigo-600" /> Traffic Flow Status Bar
                    </span>
                    <input
                      type="checkbox"
                      checked={customization.showFlowRate}
                      onChange={(e) => setCustomization(prev => ({ ...prev, showFlowRate: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Grid Density selector */}
                <div className="border-t border-slate-100 pt-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Grid Columns Layout</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setGridCols(2)}
                      className={`py-1 text-[10px] font-bold rounded border ${gridCols === 2 ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    >
                      2 Cols
                    </button>
                    <button
                      onClick={() => setGridCols(3)}
                      className={`py-1 text-[10px] font-bold rounded border ${gridCols === 3 ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    >
                      3 Cols
                    </button>
                    <button
                      onClick={() => setGridCols(4)}
                      className={`py-1 text-[10px] font-bold rounded border ${gridCols === 4 ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    >
                      4 Cols
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Auto Refresh Switch */}
          <label className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer select-none">
            <span>Auto Refresh</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-[#0A2540] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>

          {/* Grid / List Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1 rounded cursor-pointer ${layout === 'grid' ? 'bg-white text-[#0A2540] shadow-xs' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid size={12} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1 rounded cursor-pointer ${layout === 'list' ? 'bg-white text-[#0A2540] shadow-xs' : 'text-slate-500'}`}
              title="List View"
            >
              <List size={12} />
            </button>
          </div>

          {/* BUTTON TO ADD IMAGE / VIDEO / WEBSCAN SOURCE */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0A2540] hover:bg-[#18385A] text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm transition cursor-pointer"
          >
            <Plus size={13} className="text-[#FF9933]" />
            <span>Add Feed Source</span>
          </button>

        </div>

      </div>

      {/* Active Sector / Location Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar text-[9.5px]">
        <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[8.5px] mr-1 flex items-center gap-1">
          <Filter size={10} /> Sector Quick Filter:
        </span>
        {locationsList.map((loc) => {
          const isActive = locationFilter === loc;
          const styling = locationColors[loc] || locationColors['All Locations'];
          return (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={`px-2.5 py-1 rounded-full font-extrabold whitespace-nowrap transition-all border cursor-pointer ${isActive ? `${styling.bg} ${styling.text} border-transparent shadow-xs scale-105` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {loc}
            </button>
          );
        })}
      </div>

      {/* Dynamic Video, Image & WebScan Feeds Grid */}
      <div
        className={`flex-1 overflow-y-auto pr-1 ${
          layout === 'grid'
            ? gridCols === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 auto-rows-max'
              : gridCols === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 auto-rows-max'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 auto-rows-max'
            : 'space-y-3.5'
        }`}
      >
        {filteredFeeds.length === 0 ? (
          <div className="col-span-full py-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-2 shadow-xs">
            <Radio size={32} className="text-slate-300" />
            <p className="text-sm text-slate-700 font-extrabold">No Live Feeds Available</p>
            <p className="text-xs text-slate-500 max-w-md">No registered cameras match your current filters. Add new camera nodes in the Cameras page or reset filters.</p>
            <button
              onClick={() => {
                setSourceFilter('all');
                setLocationFilter('All Locations');
                setSearchTerm('');
              }}
              className="mt-2 text-xs font-bold text-blue-700 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFeeds.map((feed) => (
            <div key={feed.id} className={layout === 'list' ? 'max-w-2xl' : ''}>
              {/* Render component based on sourceType */}
              {feed.sourceType === 'video' && (
                <SimulatedCCTVFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} onUploadSource={handleCameraUpload} />
              )}
              {feed.sourceType === 'image' && (
                <SimulatedImageFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} onUploadSource={handleCameraUpload} />
              )}
              {feed.sourceType === 'webscan' && (
                <SimulatedWebScanFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} onUploadSource={handleCameraUpload} />
              )}

              {/* Sub-footer details in List mode */}
              {layout === 'list' && (
                <div className="bg-white border-x border-b border-slate-200 p-3 rounded-b-xl -mt-2 flex justify-between items-center text-xs shadow-xs">
                  <div>
                    <span className="font-extrabold text-slate-800">{feed.name} ({feed.id})</span>
                    <p className="text-[10px] text-slate-500">{feed.location} • Type: {feed.sourceType.toUpperCase()} • Plate: {feed.detectedPlate || 'Scanning...'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 bg-[#0A2540] hover:bg-[#18385A] text-white px-2.5 py-1 rounded-lg text-[9px] font-black cursor-pointer shadow-xs transition">
                      <Upload size={10} className="text-[#FF9933]" />
                      <span>Upload Source</span>
                      <input
                        type="file"
                        accept="video/*,image/*"
                        disabled={feed.isAnalyzing}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleCameraUpload(feed, e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      UPTIME {feed.uptime}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADD FEED SOURCE MODAL (VIDEO, IMAGE, WEBSCAN)                 */}
      {/* ------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0A2540] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0A2540] text-white p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[#FF9933]" />
                <h3 className="font-black text-sm tracking-tight">Add New Live Feed Source</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddFeedSubmit} className="p-4 space-y-3.5 text-xs">
              
              {/* Source Type Selection Tabs */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Select Source Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFeedType('video')}
                    className={`py-2 px-2 rounded-xl font-extrabold flex flex-col items-center gap-1 border transition cursor-pointer ${newFeedType === 'video' ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Video size={16} className="text-blue-600" />
                    <span className="text-[10px]">CCTV Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewFeedType('image')}
                    className={`py-2 px-2 rounded-xl font-extrabold flex flex-col items-center gap-1 border transition cursor-pointer ${newFeedType === 'image' ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <ImageIcon size={16} className="text-purple-600" />
                    <span className="text-[10px]">Image Snapshot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewFeedType('webscan')}
                    className={`py-2 px-2 rounded-xl font-extrabold flex flex-col items-center gap-1 border transition cursor-pointer ${newFeedType === 'webscan' ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Globe size={16} className="text-amber-600" />
                    <span className="text-[10px]">WebScan Radar</span>
                  </button>
                </div>
              </div>

              {/* Feed ID & Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Feed Code ID *</label>
                  <input
                    type="text"
                    required
                    placeholder={newFeedType === 'video' ? 'CAM-2048' : newFeedType === 'image' ? 'ANPR-2048' : 'SCAN-2048'}
                    value={newFeedId}
                    onChange={(e) => setNewFeedId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-[#0A2540] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Feed Label Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring Road Junction"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#0A2540] focus:outline-none"
                  />
                </div>
              </div>

              {/* Location Sector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Assigned Location Sector</label>
                <select
                  value={newFeedLocation}
                  onChange={(e) => setNewFeedLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#0A2540] focus:outline-none bg-white"
                >
                  {locationsList.filter(l => l !== 'All Locations').map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Stream URL or Media File Upload Option */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-700">
                    {newFeedType === 'webscan' ? 'WebScan IP / Target URL' : newFeedType === 'image' ? 'Image File Upload / Snapshot URL' : 'Video File Upload / Stream Endpoint'}
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-[9px] text-red-500 font-bold hover:underline"
                    >
                      Clear File
                    </button>
                  )}
                </div>

                {newFeedType !== 'webscan' && (
                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg cursor-pointer transition text-slate-600">
                      <Upload size={14} className="text-[#FF9933]" />
                      <span className="text-[10px] font-bold">
                        {selectedFile ? `Selected: ${selectedFile.name}` : `Upload Local ${newFeedType === 'video' ? 'Video (.mp4, .avi)' : 'Image (.jpg, .png)'}`}
                      </span>
                      <input
                        type="file"
                        accept={newFeedType === 'video' ? 'video/*' : 'image/*'}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const f = e.target.files[0];
                            setSelectedFile(f);
                            if (!newFeedName) setNewFeedName(f.name.replace(/\.[^/.]+$/, ""));
                            if (!newFeedId) setNewFeedId(`CAM-${Math.floor(1000 + Math.random() * 9000)}`);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                )}

                <input
                  type="text"
                  placeholder={newFeedType === 'webscan' ? 'https://surveillance.morth.gov.in/scan-node' : selectedFile ? 'Using uploaded local media file' : 'https://images.unsplash.com/...'}
                  value={newFeedUrl}
                  disabled={!!selectedFile}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#0A2540] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Real-time Background AI Progress Indicator (Non-blocking) */}
              {isProcessing && (
                <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 border border-slate-800 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <Loader2 size={12} className="animate-spin text-[#FF9933]" />
                      <span>{jobStage || 'AI Worker Processing...'}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-300">{jobProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF9933] to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${jobProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1 text-[9px] text-slate-400">
                    <span>Task ID: {activeJobId || 'Pending'}</span>
                    <button
                      type="button"
                      onClick={handleCancelActiveJob}
                      className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                    >
                      Cancel Analysis
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {jobError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-[10px] flex items-center gap-1.5">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  <span>{jobError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => { setShowAddModal(false); resetModalForm(); }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#0A2540] hover:bg-[#18385A] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm transition cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FF9933]" />
                      <span>Analyzing in Background...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-[#FF9933]" />
                      <span>{selectedFile ? 'Process & Register' : 'Register Feed Source'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FULLSCREEN MAXIMIZED FEED MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {maximizedFeed && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 p-4 flex flex-col justify-center items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 bg-slate-950 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF9933] text-slate-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                  {maximizedFeed.sourceType.toUpperCase()} FEED
                </span>
                <span className="text-white font-extrabold text-xs">{maximizedFeed.name} ({maximizedFeed.id})</span>
              </div>
              <button onClick={() => setMaximizedFeed(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex justify-center items-center">
              {maximizedFeed.sourceType === 'video' && (
                <div className="w-full max-w-2xl">
                  <SimulatedCCTVFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} onUploadSource={handleCameraUpload} />
                </div>
              )}
              {maximizedFeed.sourceType === 'image' && (
                <div className="w-full max-w-2xl">
                  <SimulatedImageFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} onUploadSource={handleCameraUpload} />
                </div>
              )}
              {maximizedFeed.sourceType === 'webscan' && (
                <div className="w-full max-w-2xl">
                  <SimulatedWebScanFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} onUploadSource={handleCameraUpload} />
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-950 text-slate-300 text-xs flex justify-between border-t border-slate-800">
              <span>Location: {maximizedFeed.location}</span>
              <span>Uptime: {maximizedFeed.uptime}%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
