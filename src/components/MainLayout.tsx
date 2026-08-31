import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Camera as CameraIcon,
  Video,
  AlertTriangle,
  Shield,
  FileText,
  Map,
  Settings,
  BookOpen,
  MessageSquare,
  Phone,
  Download,
  Search,
  Bell,
  User,
  ChevronDown,
  Globe,
  Sliders,
  LogOut,
  HelpCircle,
  ShieldAlert,
  Radio,
  ExternalLink,
  Award,
  Activity,
  ClipboardList
} from 'lucide-react';
import { StateEmblem } from './StateEmblem';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  textSize: 'sm' | 'base' | 'lg';
  setTextSize: (size: 'sm' | 'base' | 'lg') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onLogout: () => void;
  alertCount: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  textSize,
  setTextSize,
  language,
  setLanguage,
  onLogout,
  alertCount
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: language === 'hi' ? 'डैशबोर्ड कमांड' : 'Dashboard', icon: LayoutDashboard },
    { id: 'cameras', label: language === 'hi' ? 'कैमरा ग्रिड' : 'Cameras', icon: CameraIcon },
    { id: 'live-feeds', label: language === 'hi' ? 'लाइव वीडियो फीड्स' : 'Live Feeds', icon: Video },
    { id: 'alerts', label: language === 'hi' ? 'सुरक्षा अलर्ट एवं घटनाएं' : 'Alerts & Incidents', icon: AlertTriangle, badge: alertCount },
    { id: 'watchlist', label: language === 'hi' ? 'संदिग्ध वाहन सूची' : 'Vehicle Watch List', icon: Shield },
    { id: 'reports', label: language === 'hi' ? 'अनुपालन रिपोर्ट' : 'Reports', icon: FileText },
    { id: 'map', label: language === 'hi' ? 'भू-स्थानिक रडार' : 'Map View', icon: Map },
    { id: 'vehicle-search', label: language === 'hi' ? 'वाहन खोज' : 'Vehicle Search', icon: Search },
    { id: 'audit-log', label: language === 'hi' ? 'ऑडिट लॉग' : 'Audit Log', icon: ClipboardList },
    { id: 'settings', label: language === 'hi' ? 'सिस्टम सेटिंग्स' : 'System Settings', icon: Settings }
  ];

  const quickLinks = [
    { id: 'rules', label: language === 'hi' ? 'यातायात नियम व दंड' : 'Traffic Rules & Penalties', icon: BookOpen },
    { id: 'feedback', label: language === 'hi' ? 'नागरिक शिकायत निवारण' : 'Citizen Grievance Desk', icon: MessageSquare },
    { id: 'helpline', label: language === 'hi' ? 'हेल्पलाइन: 1033 (24x7)' : 'Helpline: 1033 (24x7)', icon: Phone, highlight: true, isAction: true },
    { id: 'app', label: language === 'hi' ? 'मोबाइल ऐप डाउनलोड' : 'Download Mobile App', icon: Download, isAction: true }
  ];

  const getScaleClass = () => {
    if (textSize === 'sm') return 'text-xs';
    if (textSize === 'lg') return 'text-base';
    return 'text-sm';
  };

  const getSidebarScaleClass = () => {
    if (textSize === 'sm') return 'text-[11px]';
    if (textSize === 'lg') return 'text-sm';
    return 'text-xs';
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return language === 'hi' ? 'कमांड और नियंत्रण डैशबोर्ड' : 'Operations Command Dashboard';
      case 'cameras': return language === 'hi' ? 'राष्ट्रीय निगरानी कैमरा ग्रिड' : 'National Camera Surveillance Registry';
      case 'live-feeds': return language === 'hi' ? 'मल्टी-स्ट्रीम एचडी लाइव वीडियो' : 'Multi-Stream HD Surveillance Grid';
      case 'alerts': return language === 'hi' ? 'सक्रिय सुरक्षा अलर्ट एवं जांच' : 'High-Priority Security Alerts';
      case 'watchlist': return language === 'hi' ? 'वाहन हॉटलिस्ट एवं चोरी का रिकॉर्ड' : 'National Vehicle Hotlist Registry';
      case 'reports': return language === 'hi' ? 'यातायात अनुपालन एवं विश्लेषण रिपोर्ट' : 'Enforcement & Compliance Reports';
      case 'map': return language === 'hi' ? 'भू-स्थानिक कैमरा नोड्स रडार' : 'Geospatial Highway Radar Map';
      case 'settings': return language === 'hi' ? 'सिस्टम कॉन्फ़िगरेशन एवं कैलिब्रेशन' : 'System Calibration & Settings';
      case 'rules': return language === 'hi' ? 'मोटर वाहन अधिनियम 2019 दिशानिर्देश' : 'Motor Vehicles Act 2019 Rules';
      case 'feedback': return language === 'hi' ? 'नागरिक प्रतिक्रिया एवं सीपीग्राम्स' : 'Citizen Grievance & Feedback Portal';
      default: return 'National Traffic Command';
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none relative ${getScaleClass()}`}>
      
      {/* ── 1. AUTHENTIC SUBTLE BLURRED EMBLEM WATERMARK BACKGROUND ── */}
      <div className="gov-watermark-overlay">
        <img src="./assets/login/emblem_clean_no_black.png" alt="State Emblem of India" />
      </div>

      {/* ── 2. TOP NATIONAL FLAG TIRANGA RIBBON ── */}
      <div className="tiranga-strip shadow-xs sticky top-0 z-50" />

      {/* ── 3. OFFICIAL GOVERNMENT MASTHEAD & LIVE TELEMETRY BAR ── */}
      <div className="bg-[#06182C] text-slate-300 px-4 sm:px-6 py-1 text-[10px] font-semibold border-b border-[#0A2540] flex justify-between items-center z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-[#FF9933]">🇮🇳</span>
          <span className="hidden sm:inline">{language === 'hi' ? 'भारत सरकार का आधिकारिक राष्ट्रीय पोर्टल' : 'An Official Portal of Ministry of Road Transport & Highways, Government of India'}</span>
          <span className="sm:hidden">Govt of India | MoRTH</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[9.5px]">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            VAHAN 4.0: CONNECTED
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            NCIC / CCTNS: LINKED
          </span>
          <span className="text-slate-600 hidden lg:inline">|</span>
          <span className="hidden lg:flex items-center gap-1 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            CPGRAMS: SYNCED
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-200 font-mono hidden sm:inline">CERT-In AUDITED</span>
        </div>
      </div>

      {/* ── 4. OFFICIAL GOVERNMENT HEADER ── */}
      <header className="sticky top-1 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-6 py-2 flex items-center justify-between shadow-xs">
        
        {/* Left Section: Emblem + Official Titles */}
        <div className="flex items-center gap-3">
          <StateEmblem className="h-12 w-auto flex-shrink-0" />
          <div className="border-l-2 border-[#0A2540]/20 pl-3">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">
              {language === 'hi' ? 'भारत सरकार' : 'भारत सरकार | Government of India'}
            </div>
            <div className="text-xs uppercase font-black text-[#0A2540] tracking-tight leading-tight mt-0.5">
              {language === 'hi' ? 'सड़क परिवहन एवं राजमार्ग मंत्रालय' : 'MINISTRY OF ROAD TRANSPORT & HIGHWAYS'}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-slate-800 tracking-tight">TRINETHRA</span>
              <span className="text-[9px] font-bold text-[#0A2540] uppercase tracking-wider px-2 py-0.2 bg-[#F1F5F9] border border-slate-200 rounded">
                {getTabTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Digital India & MoRTH Trust Seal */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200/80 px-3 py-1 rounded-lg bg-[#FAF8F5]">
            <Globe className="text-[#0A2540] animate-spin" style={{ animationDuration: '20s' }} size={16} />
            <div className="text-left leading-none">
              <span className="text-[10px] font-black text-blue-700 block">Digital India</span>
              <span className="text-[8px] font-bold text-slate-500 block">Power To Empower</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 border border-emerald-200/80 px-2.5 py-1 rounded-lg bg-emerald-50/70 text-emerald-800">
            <Radio size={12} className="text-emerald-600 animate-pulse" />
            <span className="text-[9.5px] font-black uppercase">Grid Status: 99.8% Online</span>
          </div>
        </div>

        {/* Right Section: Accessibility, Language, Clock & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Emergency 1033 Quick Pill */}
          <a
            href="tel:1033"
            className="hidden sm:flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] hover:bg-[#FFEDD5] px-2.5 py-1 rounded-lg transition"
            title="National Highway 24x7 Emergency Helpline"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <Phone size={12} className="text-[#EA580C]" />
            <span className="text-[11px] font-black">1033</span>
          </a>

          {/* Accessibility Controls */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setTextSize('sm')}
              className={`px-2 py-0.5 text-[10px] font-black rounded ${textSize === 'sm' ? 'bg-[#0A2540] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('base')}
              className={`px-2 py-0.5 text-[10px] font-black rounded ${textSize === 'base' ? 'bg-[#0A2540] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-2 py-0.5 text-[10px] font-black rounded ${textSize === 'lg' ? 'bg-[#0A2540] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Large text"
            >
              A+
            </button>
          </div>

          {/* Language Selector */}
          <div className="hidden sm:block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0A2540] font-bold shadow-2xs"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Date & Time Live Display */}
          <div className="hidden xl:block text-right border-l border-slate-200 pl-3">
            <div className="text-xs font-black text-[#0A2540] font-mono">
              {currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
            </div>
            <div className="text-[9px] text-slate-500 font-bold uppercase">
              {currentDateTime.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Notification Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Active System Alerts"
            >
              <Bell size={17} />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-ping" />
              )}
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-black text-xs text-slate-800 uppercase tracking-wide">Surveillance Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">
                    {alertCount} Critical
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}>
                    <div className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle size={13} /> Stolen Vehicle Detected
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">DL-01-AB-1234 on NH-216 Camera C-04</p>
                  </div>
                  <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}>
                    <div className="font-bold text-amber-600 flex items-center gap-1">
                      <AlertTriangle size={13} /> Heavy Congestion Advisory
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">NH-44 Junction Speed &lt; 15 km/h</p>
                  </div>
                </div>
                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}
                    className="text-xs font-black text-[#0A2540] hover:underline"
                  >
                    View All Incidents ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-left hover:bg-slate-50 p-1.5 rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-black text-xs shadow-xs">
                AU
              </div>
              <div className="hidden lg:block leading-none">
                <div className="text-xs font-black text-slate-800">Admin User</div>
                <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">MoRTH Level-1</span>
              </div>
              <ChevronDown size={13} className="text-slate-500 hidden lg:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs font-medium">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-black text-slate-800">Admin User (Indlis)</div>
                  <div className="text-[10px] text-slate-500">Ministry of Road Transport</div>
                </div>
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-bold cursor-pointer"
                >
                  <Settings size={14} className="text-slate-500" />
                  System Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out of Grid
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── 3. MAIN CORE WORKSPACE AREA WITH SIDEBAR ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Panel */}
        <aside className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 z-30 overflow-y-auto shadow-2xs">
          
          <div className="p-3 space-y-5 flex-1">
            
            {/* Main Navigation Section */}
            <div>
              <span className="px-3 text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                {language === 'hi' ? 'मुख्य नेविगेशन' : 'COMMAND NAVIGATION'}
              </span>
              <nav className="space-y-0.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0A2540] text-white font-black shadow-sm'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                      } ${getSidebarScaleClass()}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-[#FF9933]' : 'text-slate-500'} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="tracking-tight">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Regulatory & Citizen Desk Group */}
            <div>
              <span className="px-3 text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                {language === 'hi' ? 'नागरिक एवं नियम' : 'REGULATORY & CITIZEN DESK'}
              </span>
              <div className="space-y-0.5">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;

                  if (link.isAction) {
                    return (
                      <a
                        key={link.id}
                        href={link.id === 'helpline' ? 'tel:1033' : '#'}
                        onClick={(e) => {
                          if (link.id === 'app') {
                            e.preventDefault();
                            alert('TRINETHRA Official Highway Surveillance Mobile App is authorized for on-field traffic enforcement personnel.');
                          }
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition cursor-pointer ${getSidebarScaleClass()} ${
                          link.highlight
                            ? 'bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] hover:bg-[#FFEDD5] font-black'
                            : 'text-slate-700 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        <Icon size={15} className={link.highlight ? 'text-[#EA580C]' : 'text-slate-500'} strokeWidth={link.highlight ? 2.5 : 2} />
                        <span>{link.label}</span>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#0A2540] text-white font-black shadow-sm'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                      } ${getSidebarScaleClass()}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-[#FF9933]' : 'text-slate-500'} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{link.label}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        isActive ? 'bg-[#FF9933] text-[#0A2540]' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Live
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* System Performance Engine */}
          <div className="px-3 pb-2 mt-auto">
            <button
              className="w-full flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-8 w-8 bg-[#0A2540] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse"></div>
                 <Activity size={16} className="text-emerald-400 relative z-10" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[10px] font-black text-[#0A2540] flex items-center justify-between">
                  <span>TRINETHRA ENGINE</span>
                  <span className="flex items-center gap-1 text-[8px] text-emerald-600 bg-emerald-100 px-1 rounded uppercase tracking-wide">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                   <div className="text-[9px] text-slate-500 font-semibold">
                     Acc: <span className="text-slate-800 font-bold">99.4%</span>
                   </div>
                   <div className="text-[9px] text-slate-500 font-semibold">
                     Err: <span className="text-red-500 font-bold">0.02%</span>
                   </div>
                   <div className="text-[9px] text-slate-500 font-semibold">
                     <span className="text-blue-600 font-bold">120 FPS</span>
                   </div>
                </div>
              </div>
            </button>
          </div>

          {/* Compact sidebar footer — no wasted space */}
          <div className="px-3 py-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-[8.5px] text-slate-400 font-semibold text-center leading-tight">
              © 2026 MoRTH · TRINETHRA v2.4 · CERT-In ✓ · NIC MeghRaj ✓
            </div>
          </div>

        </aside>

        {/* Core Page Workspace Area */}
        <main className="flex-1 overflow-hidden bg-[#F8FAFC] flex flex-col">
          
          {/* Global Alert Bar Ticker */}
          <div className="bg-[#0A2540] border-b border-[#06182C] px-4 sm:px-6 py-2 flex items-center gap-2.5 flex-shrink-0 shadow-2xs">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0 animate-pulse">
              🚨 Live Advisory
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <span className="animate-marquee inline-block font-bold text-white text-[11px] tracking-wide">
                Heavy congestion reported on NH-216 Overpass. Traffic advisory in effect. &nbsp;|&nbsp; Drive with caution, save lives. &nbsp;|&nbsp; High-speed surveillance active on Riverfront Expressway. &nbsp;|&nbsp; Emergency Lane 1033 clearance protocol enabled nationwide.
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 flex-shrink-0 text-[10px] text-emerald-400 font-black">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>NIC CERT-In Audited</span>
            </div>
          </div>

          {/* Actual Mounted Page Component */}
          <div className="flex-1 p-3 sm:p-4 relative overflow-y-auto flex flex-col min-h-0">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
};

