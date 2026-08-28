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
  HelpCircle
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cameras', label: 'Cameras', icon: CameraIcon },
    { id: 'live-feeds', label: 'Live Feeds', icon: Video },
    { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle, badge: alertCount },
    { id: 'watchlist', label: 'Vehicle Watch List', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const quickLinks = [
    { id: 'rules', label: 'Traffic Rules & Guidelines', icon: BookOpen },
    { id: 'feedback', label: 'Citizen Feedback', icon: MessageSquare },
    { id: 'helpline', label: 'Helpline: 1033', icon: Phone, highlight: true, isAction: true },
    { id: 'app', label: 'Download Mobile App', icon: Download, isAction: true }
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

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans ${getScaleClass()}`}>
      
      {/* Top Header Panel */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#F4EFE6] px-6 py-3 flex items-center justify-between shadow-sm">
        
        {/* Left Section: Emblem + Title */}
        <div className="flex items-center gap-3">
          <StateEmblem className="h-12 w-auto flex-shrink-0" color="#0C2540" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              भारत सरकार | Government of India
            </div>
            <div className="text-xs uppercase font-extrabold text-[#0C2540] tracking-tight">
              MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS
            </div>
            <h1 className="text-sm font-black text-slate-800 flex items-center gap-2 mt-0.5">
              <span>TRINETHRA</span>
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded">
                {activeTab === 'dashboard' ? 'TrafficSight Dashboard' :
                 activeTab === 'rules' ? 'Traffic Rules & Safety' :
                 activeTab === 'feedback' ? 'Citizen Feedback Desk' :
                 activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </h1>
          </div>
        </div>

        {/* Center Section: Digital India Logo */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-slate-100 px-3 py-1 rounded-lg bg-slate-50">
            <Globe className="text-[#0C2540] animate-spin" style={{ animationDuration: '20s' }} size={16} />
            <div className="text-left leading-none">
              <span className="text-[10px] font-extrabold text-blue-600 block">Digital India</span>
              <span className="text-[8px] font-medium text-slate-500 block">Power To Empower</span>
            </div>
          </div>
        </div>

        {/* Right Section: Time & Controls */}
        <div className="flex items-center gap-4">
          
          {/* Accessibility Controls */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setTextSize('sm')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${textSize === 'sm' ? 'bg-[#0C2540] text-white shadow-sm' : 'text-slate-600'}`}
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('base')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${textSize === 'base' ? 'bg-[#0C2540] text-white shadow-sm' : 'text-slate-600'}`}
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${textSize === 'lg' ? 'bg-[#0C2540] text-white shadow-sm' : 'text-slate-600'}`}
            >
              A+
            </button>
          </div>

          {/* Language Selector */}
          <div className="hidden sm:block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0C2540] font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Date & Time Live Display */}
          <div className="hidden xl:block text-right border-l border-slate-200 pl-4">
            <div className="text-xs font-bold text-slate-800">
              {currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {currentDateTime.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Notification Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-ping" />
              )}
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800">Active Live Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                    {alertCount} Critical
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}>
                    <div className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle size={12} /> Stolen Vehicle Detected
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">DL-01-AB-1234 on Ring Road C-04</p>
                  </div>
                  <div className="p-3 text-xs hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}>
                    <div className="font-bold text-orange-600 flex items-center gap-1">
                      <AlertTriangle size={12} /> Heavy Congestion Alert
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">NH-44 Junction Speed &lt; 15 km/h</p>
                  </div>
                </div>
                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => { setActiveTab('alerts'); setShowNotifications(false); }}
                    className="text-xs font-bold text-[#0C2540] hover:underline"
                  >
                    View All Incidents
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-left hover:bg-slate-50 p-1.5 rounded-lg transition"
            >
              <div className="h-8 w-8 rounded-full bg-[#0C2540] text-white flex items-center justify-center font-black text-xs">
                AU
              </div>
              <div className="hidden lg:block leading-none">
                <div className="text-xs font-bold text-slate-800">Admin User</div>
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Indlis Admin</span>
              </div>
              <ChevronDown size={14} className="text-slate-500 hidden lg:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs font-medium">
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Settings size={14} />
                  System Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Core View Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Panel */}
        <aside className="w-64 bg-white border-r border-[#F4EFE6] flex flex-col justify-between flex-shrink-0 z-30 overflow-y-auto">
          
          <div className="p-4 space-y-6">
            
            {/* Main Navigation Section */}
            <div>
              <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Main Navigation
              </span>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#0C2540] text-white font-bold shadow-md shadow-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      } ${getSidebarScaleClass()}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Links Section (Now Fully Dynamic & Interactive!) */}
            <div>
              <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Regulatory &amp; Citizen Desk
              </span>
              <div className="space-y-1">
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
                            alert('TRINETHRA Mobile App for iOS & Android download portal is active for field personnel.');
                          }
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${getSidebarScaleClass()} ${
                          link.highlight
                            ? 'bg-orange-50 border border-orange-200 text-orange-900 hover:bg-orange-100 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} className={link.highlight ? 'text-orange-600' : 'text-slate-500'} />
                        <span>{link.label}</span>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                        isActive
                          ? 'bg-[#0C2540] text-white font-bold shadow-md shadow-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      } ${getSidebarScaleClass()}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                        <span>{link.label}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Live
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Shield & copyright */}
          <div className="p-4 border-t border-[#F4EFE6] bg-[#FAF8F5] space-y-4 text-center">
            
            {/* Safe Roads emblem */}
            <div className="bg-white border border-[#E28743]/20 rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm">
              <StateEmblem className="h-10 w-10" color="#0C2540" />
              <div className="text-[10px] font-black uppercase text-[#0C2540] tracking-wider leading-none mt-1">
                Safe Roads
              </div>
              <div className="text-[10px] font-black uppercase text-orange-600 tracking-wider leading-none">
                Safe India
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-medium leading-normal">
              © 2026 Ministry of Road Transport &amp; Highways, Government of India. All Rights Reserved.
            </div>

          </div>

        </aside>

        {/* Core Page Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5] flex flex-col">
          
          {/* Global Alert Bar ticker */}
          <div className="bg-orange-50 border-b border-orange-100 px-6 py-2.5 flex items-center gap-2 flex-shrink-0 text-xs font-semibold text-slate-800">
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0 animate-pulse">
              System Alert
            </span>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <span className="animate-marquee inline-block font-medium">
                Heavy congestion reported on I-9 Overpass. Traffic advisory in effect. | Stay Safe, Follow Rules. | Speed limits strictly monitored on Riverfront Road. | Emergency Lane clearance active.
              </span>
            </div>
          </div>

          {/* Actual Mounted Page Component */}
          <div className="flex-1 p-6 relative">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
};
