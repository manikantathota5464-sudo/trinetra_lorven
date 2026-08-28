import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Phone, MessageSquare } from 'lucide-react';
import { StateEmblem } from './StateEmblem';

interface LoginPageProps {
  onLogin: () => void;
  textSize: 'sm' | 'base' | 'lg';
  setTextSize: (size: 'sm' | 'base' | 'lg') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  textSize,
  setTextSize,
  language,
  setLanguage,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    onLogin();
  };

  const getScaleClass = () => {
    if (textSize === 'sm') return 'text-xs md:text-sm';
    if (textSize === 'lg') return 'text-base md:text-lg';
    return 'text-sm md:text-base';
  };

  return (
    <div className={`min-h-screen bg-[#FAF7F0] text-slate-800 flex flex-col justify-between font-sans select-none overflow-x-hidden ${getScaleClass()}`}>

      {/* ── TOP HEADER ── */}
      <header className="w-full px-6 sm:px-10 py-3.5 flex flex-wrap justify-between items-center bg-[#FAF7F0] border-b border-[#EDE5D8] z-20">
        
        {/* Left: Authentic Clean State Emblem & Ministry Title */}
        <div className="flex items-center gap-3">
          <StateEmblem className="h-12 w-auto" />
          <div className="flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-slate-600 tracking-wide leading-tight">
              भारत सरकार <span className="mx-1 text-slate-400">|</span> Government of India
            </div>
            <div className="text-[13px] sm:text-[13.5px] uppercase font-black text-[#0B213F] tracking-tight leading-tight mt-0.5">
              MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS
            </div>
          </div>
        </div>

        {/* Right: Accessibility & Controls */}
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          {/* Text Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Text Size:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTextSize('sm')}
                className={`px-2.5 py-0.5 text-xs font-bold rounded border transition-all ${
                  textSize === 'sm'
                    ? 'bg-[#0B213F] text-white border-[#0B213F]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setTextSize('base')}
                className={`px-2.5 py-0.5 text-xs font-bold rounded border transition-all ${
                  textSize === 'base'
                    ? 'bg-[#0B213F] text-white border-[#0B213F]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextSize('lg')}
                className={`px-2.5 py-0.5 text-xs font-bold rounded border transition-all ${
                  textSize === 'lg'
                    ? 'bg-[#0B213F] text-white border-[#0B213F]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                A+
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Language:</span>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B213F] font-semibold appearance-none pr-7 cursor-pointer shadow-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-300" />

          {/* Report Issue */}
          <a
            href="#"
            className="text-xs text-slate-800 font-semibold hover:underline"
          >
            Report Issue
          </a>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">

        {/* ── LEFT HERO PANEL (Clean artwork with no cut-off header slices) ── */}
        <div className="lg:col-span-7 flex items-center justify-center relative w-full min-h-[460px] lg:min-h-[500px]">
          <div className="w-full h-full relative flex items-center justify-center">
            <img
              src="/assets/login/left_panel_clean.png"
              alt="TRINETHRA Intelligent Traffic Management"
              className="w-full max-w-[600px] h-auto object-contain drop-shadow-sm rounded-lg"
            />
          </div>
        </div>

        {/* ── RIGHT LOGIN CARD ── */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.09)] border border-[#EDE5D8] overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-7 pb-4 text-center">
              <h3 className="text-[26px] font-black text-[#1E293B] tracking-tight">
                Welcome Back!
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Sign in to access TRINETHRA Dashboard
              </p>

              {/* Ornate Gold Lock Divider */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-[#E8DFC8]" />
                <div className="p-1.5 rounded-full border border-[#D5C29D] text-[#B8934C] bg-[#FAF8F5]">
                  <Lock size={13} strokeWidth={2.5} />
                </div>
                <div className="flex-1 h-px bg-[#E8DFC8]" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-5 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username / Operator ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or operator ID"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#454D5D] border border-[#3B4352] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B213F]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#454D5D] border border-[#3B4352] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B213F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs font-semibold pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-400 w-3.5 h-3.5 text-[#0B213F] focus:ring-[#0B213F]"
                  />
                  Remember me
                </label>
                <a href="#" className="text-slate-700 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-[#0B213F] hover:bg-[#122F55] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all mt-3"
              >
                <Lock size={15} />
                Sign In
              </button>

              {/* Security Hint */}
              <div className="text-[10.5px] text-center text-slate-500 pt-1 leading-tight">
                Sign in to access your secure dashboard. (Optional: A dynamic security alert/tip box).
              </div>
            </form>

            {/* Helpline Bar */}
            <div className="bg-[#EEF2F6] border-t border-[#E2E8F0] px-8 py-3.5 flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 text-[#0B213F]">
                <Phone size={18} strokeWidth={2} />
                <MessageSquare size={18} strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 leading-tight">
                  Helpline: 1033
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium">
                  For technical support and assistance
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* ── BOTTOM FOOTER ── */}
      <footer className="bg-[#0B213F] text-slate-300 py-3.5 px-6 sm:px-10 z-20">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 font-medium text-[11px]">
            © 2024-2025 Ministry of Road Transport &amp; Highways, Government of India. All Rights Reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-3.5 text-[11px] font-medium text-slate-300">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:underline">Terms of Use</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:underline">Accessibility</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:underline">Help</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:underline">Contact Us</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
