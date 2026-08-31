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
  Filter
} from 'lucide-react';
import { Camera as CameraType } from '../mockData';

// Extended feed item model supporting Video, Image, and WebScan feeds
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
  webUrl?: string;
  ipAddress?: string;
  detectedPlate?: string;
  confidence?: number;
  vehicleClass?: string;
  flowStatus?: 'NORMAL' | 'HEAVY' | 'SLOW';
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
// 1. SIMULATED CCTV VIDEO FEED COMPONENT
// -------------------------------------------------------------
const SimulatedCCTVFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
}> = ({ feed, customization, onMaximize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 180;

    let carX = Math.random() * 200;
    let carY = 110;
    let carSpeed = 2 + Math.random() * 2.5;
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
      ctx.setLineDash([]);

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

      // AI Bounding Box Overlay
      if (customization.showAnnotations && carX > 0 && carX < canvas.width - 30) {
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(carX - 4, carY - 12, 44, 32);
        ctx.setLineDash([]);

        ctx.fillStyle = '#10B981';
        ctx.fillRect(carX - 4, carY - 22, 54, 10);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText(feed.detectedPlate || 'AP09 AB 1234', carX - 2, carY - 15);
      }

      // Heatmap Overlay
      if (customization.showHeatmap) {
        const grad = ctx.createRadialGradient(canvas.width / 2, 120, 10, canvas.width / 2, 120, 90);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Timestamp & ID Header Overlay
      if (customization.showTimestamp) {
        const now = new Date();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, canvas.width, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.fillText(`${feed.id} - ${feed.location}`, 8, 14);
        ctx.fillText(now.toLocaleTimeString(), 220, 14);

        // Rec Indicator
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(308, 11, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Speed radar line overlay
      if (customization.showRadar) {
        if (isPlaying) {
          scannerY += 1.5 * scannerDirection;
          if (scannerY > canvas.height || scannerY < 0) {
            scannerDirection *= -1;
          }
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scannerY);
        ctx.lineTo(canvas.width, scannerY);
        ctx.stroke();
      }

      // Flow rate overlay
      if (customization.showFlowRate) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(8, 160, 90, 14);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(`FLOW: ${feed.flowStatus || 'NORMAL'}`, 12, 170);
      }

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
  }, [isPlaying, feed, customization]);

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-800 relative group">
      <canvas ref={canvasRef} className="w-full aspect-[16/9] block bg-slate-900 cursor-pointer" onClick={() => onMaximize(feed)} />

      {/* Overlaid Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <span className="bg-red-600 text-white px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white block"></span>
          LIVE VIDEO
        </span>
        <span className="bg-blue-900/80 text-blue-200 border border-blue-700/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-extrabold rounded">
          {feed.cameraType}
        </span>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
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
        <button onClick={() => onMaximize(feed)} className="text-white hover:text-slate-300 p-1 hover:bg-white/10 rounded cursor-pointer">
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. SIMULATED IMAGE SNAPSHOT FEED COMPONENT
// -------------------------------------------------------------
const SimulatedImageFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
}> = ({ feed, customization, onMaximize }) => {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  const sampleImage = feed.imageUrl || feed.thumbnail || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-md border border-purple-900/40 relative group">
      <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
        <img
          src={sampleImage}
          alt={feed.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isRefreshing ? 'opacity-40 blur-xs' : 'opacity-90'}`}
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-purple-600 text-white px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <ImageIcon size={10} />
            ANPR SNAPSHOT
          </span>
          <span className="bg-slate-900/80 text-purple-200 border border-purple-700/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-extrabold rounded">
            HD 1080P
          </span>
        </div>

        {/* Timestamp Overlay */}
        {customization.showTimestamp && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/80 to-transparent p-2 flex justify-between items-center text-[9px] text-white/90 font-mono pointer-events-none">
            <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 font-bold">{feed.id} • {feed.location}</span>
            <span>{lastRefreshed.toLocaleTimeString()}</span>
          </div>
        )}

        {/* AI Bounding Box & License Plate Detection Overlay */}
        {customization.showAnnotations && (
          <div className="absolute bottom-6 left-1/4 border-2 border-emerald-400 rounded p-1 bg-emerald-950/60 backdrop-blur-xs shadow-lg animate-pulse pointer-events-none">
            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-300 uppercase tracking-wider">
              <Crosshair size={9} />
              <span>{feed.detectedPlate || 'AP09 AB 1234'}</span>
              <span className="bg-emerald-500 text-slate-950 px-1 rounded font-mono text-[7px]">{feed.confidence || 98}% MATCH</span>
            </div>
            <p className="text-[7px] text-slate-200 font-medium mt-0.5">{feed.vehicleClass || 'Sedan (White)'}</p>
          </div>
        )}

        {/* Flow status */}
        {customization.showFlowRate && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[8px] font-bold text-emerald-400">
            FLOW: {feed.flowStatus || 'NORMAL'}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
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
// 3. SIMULATED WEBSCAN / OSINT RADAR FEED COMPONENT
// -------------------------------------------------------------
const SimulatedWebScanFeed: React.FC<{
  feed: FeedItem;
  customization: ViewCustomization;
  onMaximize: (feed: FeedItem) => void;
}> = ({ feed, customization, onMaximize }) => {
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
            <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 text-[8px]">
              {feed.ipAddress || '192.168.4.12'}
            </span>
          </div>
        </div>

        {/* Center Live Radar / Web preview mockup */}
        <div className="my-1.5 z-10 flex gap-2 items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="h-10 w-10 rounded-full border-2 border-amber-500/60 flex items-center justify-center relative bg-amber-950/20">
            <div className="h-full w-full rounded-full border border-amber-400/40 animate-ping absolute" />
            <Radio size={16} className="text-amber-400 animate-pulse" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[9px] text-amber-200 font-bold truncate">{feed.webUrl || `https://surveillance.morth.gov.in/feed/${feed.id.toLowerCase()}`}</p>
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
  // Convert standard initial cameras into multi-source feed items
  const initialFeeds: FeedItem[] = [
    {
      id: 'CAM-1024',
      name: 'Main St & 5th Ave CCTV',
      location: 'Main St & 5th Ave',
      status: 'Online',
      sourceType: 'video',
      cameraType: 'PTZ',
      lastSeen: '08:19:23 AM',
      uptime: 99.8,
      detectedPlate: 'AP09 AB 1234',
      confidence: 98,
      vehicleClass: 'Hyundai i20',
      flowStatus: 'NORMAL'
    },
    {
      id: 'ANPR-0785',
      name: 'I-9 Overpass High-Res Snapshot',
      location: 'I-9 Overpass',
      status: 'Online',
      sourceType: 'image',
      cameraType: 'ANPR Cam',
      lastSeen: '08:19:18 AM',
      uptime: 100,
      imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80',
      detectedPlate: 'TS07 CD 5678',
      confidence: 96,
      vehicleClass: 'Maruti Swift',
      flowStatus: 'HEAVY'
    },
    {
      id: 'SCAN-0456',
      name: 'Harbor Rd WebScan OSINT',
      location: 'Harbor Rd Exit',
      status: 'Online',
      sourceType: 'webscan',
      cameraType: 'OSINT Scanner',
      lastSeen: '08:19:00 AM',
      uptime: 99.4,
      webUrl: 'https://surveillance.morth.gov.in/nodes/harbor-0456',
      ipAddress: '10.240.18.92',
      flowStatus: 'NORMAL'
    },
    {
      id: 'CAM-1120',
      name: 'Junction 9 CCTV Grid',
      location: 'Junction 9',
      status: 'Online',
      sourceType: 'video',
      cameraType: 'PTZ',
      lastSeen: '08:19:10 AM',
      uptime: 99.6,
      detectedPlate: 'AP16 EF 9012',
      confidence: 94,
      vehicleClass: 'Pulsar NS200',
      flowStatus: 'NORMAL'
    },
    {
      id: 'ANPR-0633',
      name: 'Riverside Park Snapshot',
      location: 'Riverside Park',
      status: 'Online',
      sourceType: 'image',
      cameraType: 'ANPR Cam',
      lastSeen: '08:19:05 AM',
      uptime: 99.9,
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop&q=80',
      detectedPlate: 'AP39 GH 3456',
      confidence: 97,
      vehicleClass: 'Maruti Brezza',
      flowStatus: 'NORMAL'
    },
    {
      id: 'SCAN-0932',
      name: 'City Center WebScan Radar',
      location: 'City Center',
      status: 'Online',
      sourceType: 'webscan',
      cameraType: 'OSINT Scanner',
      lastSeen: '08:18:45 AM',
      uptime: 98.8,
      webUrl: 'https://traffic-scan.morth.gov.in/nodes/city-0932',
      ipAddress: '10.240.44.110',
      flowStatus: 'SLOW'
    },
    {
      id: 'CAM-1281',
      name: 'Ring Road Live Feed',
      location: 'Ring Road',
      status: 'Online',
      sourceType: 'video',
      cameraType: 'PTZ',
      lastSeen: '08:19:00 AM',
      uptime: 99.4,
      detectedPlate: 'TS08 IJ 7890',
      confidence: 92,
      vehicleClass: 'Honda Activa',
      flowStatus: 'NORMAL'
    },
    {
      id: 'ANPR-1102',
      name: 'West Entrance Snapshot Node',
      location: 'West Entrance',
      status: 'Online',
      sourceType: 'image',
      cameraType: 'ANPR Cam',
      lastSeen: '08:18:55 AM',
      uptime: 99.5,
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
      detectedPlate: 'AP11 KL 4321',
      confidence: 95,
      vehicleClass: 'Royal Enfield',
      flowStatus: 'NORMAL'
    }
  ];

  const [feeds, setFeeds] = useState<FeedItem[]>(initialFeeds);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'video' | 'image' | 'webscan'>('all');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [maximizedFeed, setMaximizedFeed] = useState<FeedItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Customize View State
  const [customization, setCustomization] = useState<ViewCustomization>({
    showAnnotations: true,
    showTimestamp: true,
    showHeatmap: false,
    showRadar: true,
    showFlowRate: true
  });

  // Modal Form State for Add Feed Source
  const [newFeedType, setNewFeedType] = useState<'video' | 'image' | 'webscan'>('video');
  const [newFeedId, setNewFeedId] = useState('');
  const [newFeedLocation, setNewFeedLocation] = useState('Main St & 5th Ave');
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');

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

  const handleAddFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedId) return;

    const newFeed: FeedItem = {
      id: newFeedId.toUpperCase(),
      name: newFeedName || `${newFeedType.toUpperCase()} Feed ${newFeedId}`,
      location: newFeedLocation,
      status: 'Online',
      sourceType: newFeedType,
      cameraType: newFeedType === 'video' ? 'PTZ' : newFeedType === 'image' ? 'ANPR Cam' : 'OSINT Scanner',
      lastSeen: 'Just Now',
      uptime: 100,
      imageUrl: newFeedType === 'image' ? (newFeedUrl || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=80') : undefined,
      webUrl: newFeedType === 'webscan' ? (newFeedUrl || `https://surveillance.morth.gov.in/nodes/${newFeedId.toLowerCase()}`) : undefined,
      flowStatus: 'NORMAL'
    };

    setFeeds(prev => [newFeed, ...prev]);
    setShowAddModal(false);
    setNewFeedId('');
    setNewFeedName('');
    setNewFeedUrl('');
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

        {/* Right Section: Customize View Button + Layout & Add Source */}
        <div className="flex items-center gap-2">

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
        {filteredFeeds.map((feed) => (
          <div key={feed.id} className={layout === 'list' ? 'max-w-2xl' : ''}>
            {/* Render component based on sourceType */}
            {feed.sourceType === 'video' && (
              <SimulatedCCTVFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} />
            )}
            {feed.sourceType === 'image' && (
              <SimulatedImageFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} />
            )}
            {feed.sourceType === 'webscan' && (
              <SimulatedWebScanFeed feed={feed} customization={customization} onMaximize={setMaximizedFeed} />
            )}

            {/* Sub-footer details in List mode */}
            {layout === 'list' && (
              <div className="bg-white border-x border-b border-slate-200 p-3 rounded-b-xl -mt-2 flex justify-between items-center text-xs shadow-xs">
                <div>
                  <span className="font-extrabold text-slate-800">{feed.name} ({feed.id})</span>
                  <p className="text-[10px] text-slate-500">{feed.location} • Type: {feed.sourceType.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    UPTIME {feed.uptime}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredFeeds.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
            <Radio size={32} className="text-slate-300 animate-pulse" />
            <p className="text-sm text-slate-600">No live feeds match your selected source filter or sector location.</p>
            <button
              onClick={() => {
                setSourceFilter('all');
                setLocationFilter('All Locations');
                setSearchTerm('');
              }}
              className="mt-2 text-xs font-bold text-blue-700 underline"
            >
              Reset Filters
            </button>
          </div>
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

              {/* Stream URL / Image Endpoint */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  {newFeedType === 'webscan' ? 'WebScan IP / Target URL' : newFeedType === 'image' ? 'Snapshot Image URL' : 'RTSP / Video Stream Endpoint'}
                </label>
                <input
                  type="text"
                  placeholder={newFeedType === 'webscan' ? 'https://surveillance.morth.gov.in/scan-node' : 'https://images.unsplash.com/...'}
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#0A2540] focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A2540] hover:bg-[#18385A] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                >
                  <CheckCircle size={14} className="text-[#FF9933]" />
                  <span>Register Feed Source</span>
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
                  <SimulatedCCTVFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} />
                </div>
              )}
              {maximizedFeed.sourceType === 'image' && (
                <div className="w-full max-w-2xl">
                  <SimulatedImageFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} />
                </div>
              )}
              {maximizedFeed.sourceType === 'webscan' && (
                <div className="w-full max-w-2xl">
                  <SimulatedWebScanFeed feed={maximizedFeed} customization={customization} onMaximize={() => {}} />
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
