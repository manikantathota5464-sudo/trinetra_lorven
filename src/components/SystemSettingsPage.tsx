import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Save,
  Lock,
  Smartphone,
  Eye,
  Key,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('General');
  
  // Settings Form State
  const [systemName, setSystemName] = useState('TRINETHRA Intelligence System');
  const [orgName, setOrgName] = useState('City Watch Command Center');
  const [timezone, setTimezone] = useState('Asia/Kolkata (GMT +05:30)');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY (17 May 2025)');
  const [language, setLanguage] = useState('English (India)');
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24');
  
  // Security
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const subTabs = [
    { name: 'General', icon: Settings },
    { name: 'Cameras', icon: Settings },
    { name: 'Alerts', icon: Settings },
    { name: 'AI & Detection', icon: ShieldAlert },
    { name: 'Storage', icon: Settings },
    { name: 'Users & Access', icon: Settings },
    { name: 'Integrations', icon: Settings },
    { name: 'System', icon: Settings },
  ];

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Header Breadcrumb */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">System Settings</h3>
            <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">
              Manage system preferences, configurations and account settings.
            </span>
          </div>
        </div>
      </div>

      {/* Save success toast */}
      {showSaveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-xs font-bold shadow-sm">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>System configuration updated successfully. Changes applied globally.</span>
        </div>
      )}

      {/* Main Settings Panel Wrapper */}
      <div className="bg-white border border-[#F4EFE6] rounded-2xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Subtabs list header (Screenshot 8) */}
        <div className="bg-[#FAF8F5] border-b border-slate-200 px-6 overflow-x-auto scrollbar-thin">
          <nav className="flex gap-6">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveSubTab(tab.name)}
                  className={`py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'border-[#0C2540] text-[#0C2540] font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Body Frame (Screenshot 8) */}
        {activeSubTab === 'General' ? (
          <form onSubmit={handleSaveChanges} className="p-6 space-y-6">
            
            {/* General section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">General Settings</h4>
                
                <button
                  type="submit"
                  className="bg-[#0C2540] hover:bg-[#18385A] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* System Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">System Name</label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Language Dropdown */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-none"
                  >
                    <option>English (India)</option>
                    <option>Hindi (India)</option>
                    <option>Telugu (India)</option>
                  </select>
                </div>

                {/* Organization */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Organization</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 font-medium focus:bg-white"
                  />
                </div>

                {/* Theme Controls */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Theme</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                    {(['Light', 'Dark', 'System'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`py-1.5 text-center font-bold rounded-lg transition text-xs ${
                          theme === t
                            ? 'bg-white text-[#0C2540] shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-none"
                  >
                    <option>Asia/Kolkata (GMT +05:30)</option>
                    <option>UTC (GMT +00:00)</option>
                  </select>
                </div>

                {/* Time Format Radio */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Time Format</label>
                  <div className="flex flex-col gap-2 font-medium text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        checked={timeFormat === '12'}
                        onChange={() => setTimeFormat('12')}
                        className="text-[#0C2540] focus:ring-[#0C2540]"
                      />
                      <span>12 Hour (02:30 PM)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        checked={timeFormat === '24'}
                        onChange={() => setTimeFormat('24')}
                        className="text-[#0C2540] focus:ring-[#0C2540]"
                      />
                      <span>24 Hour (14:30)</span>
                    </label>
                  </div>
                </div>

                {/* Date Format Select */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Date Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 font-medium focus:bg-white"
                  >
                    <option>DD MMM YYYY (17 May 2025)</option>
                    <option>YYYY-MM-DD (2025-05-17)</option>
                    <option>MM/DD/YYYY (05/17/2025)</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Profile & Security panel row */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Profile & Security</h4>
              
              <div className="divide-y divide-slate-100 text-xs">
                
                {/* Change Password row */}
                <div className="flex justify-between items-center py-3.5 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <Lock size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Change Password</div>
                      <span className="text-[10px] text-slate-400 font-medium block">Update your account password</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>

                {/* Two Factor row */}
                <div className="flex justify-between items-center py-3.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Two-Factor Authentication</div>
                      <span className="text-[10px] text-slate-400 font-medium block">Add extra security to your account</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      Enabled
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tfaEnabled}
                        onChange={(e) => setTfaEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Session management row */}
                <div className="flex justify-between items-center py-3.5 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <Key size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Session Management</div>
                      <span className="text-[10px] text-slate-400 font-medium block">Manage your active sessions</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>

              </div>
            </div>

          </form>
        ) : (
          <div className="p-12 text-center text-slate-400 font-semibold text-xs space-y-2">
            <Settings className="mx-auto text-slate-300 animate-spin" size={36} style={{ animationDuration: '6s' }} />
            <p>Configuring sector parameters for {activeSubTab}...</p>
            <span className="text-[10px] text-slate-400 block font-normal">This panel is managed by the TRINETHRA Administrator policy guidelines.</span>
          </div>
        )}

      </div>

    </div>
  );
};

const ChevronRight: React.FC<{ className?: string; size?: number }> = ({ className, size = 16 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
